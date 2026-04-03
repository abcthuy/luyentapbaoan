import type { AppStorage, ProgressData, ReviewItem, UserProfile } from '@/lib/mastery';
import { SubjectId } from '@/lib/content/types';
import { SKILL_MAP } from '@/lib/skills';
import {
    AccelerationLevel,
    CurriculumPhaseRow,
    CurriculumPrerequisiteRow,
    CurriculumRow,
    CurriculumSkillRow,
    LearningMode,
    PaceMode,
} from '@/lib/curriculum';
import { getServerSupabase } from '@/lib/server/supabase-admin';

export async function syncCurriculumProgressForStorage(storage: AppStorage) {
    try {
        const profiles = storage.profiles || [];
        if (profiles.length === 0) return;

        const grades = Array.from(new Set(profiles.map((profile) => profile.grade || 2)));
        const supabase = getServerSupabase();

        const { data: curricula, error: curriculaError } = await supabase
            .from('curricula')
            .select('*')
            .in('grade', grades)
            .eq('is_active', true);

        if (curriculaError || !curricula || curricula.length === 0) return;

        const curriculumIds = curricula.map((curriculum) => curriculum.id);
        const [phasesResult, skillsResult, prerequisitesResult] = await Promise.all([
            supabase.from('curriculum_phases').select('*').in('curriculum_id', curriculumIds),
            supabase.from('curriculum_skills').select('*').in('curriculum_id', curriculumIds),
            supabase.from('curriculum_skill_prerequisites').select('*'),
        ]);

        if (phasesResult.error || skillsResult.error || prerequisitesResult.error) {
            return;
        }

        const phases = phasesResult.data || [];
        const skills = skillsResult.data || [];
        const prerequisites = prerequisitesResult.data || [];

        const phasesByCurriculum = groupBy(phases, (phase) => phase.curriculum_id);
        const skillsByCurriculum = groupBy(skills, (skill) => skill.curriculum_id);
        const prerequisitesBySkill = groupBy(
            prerequisites.filter((row) => skills.some((skill) => skill.id === row.skill_id)),
            (row) => row.skill_id
        );

        const studentStateRows: Record<string, unknown>[] = [];
        const skillProgressRows: Record<string, unknown>[] = [];

        profiles.forEach((profile) => {
            const profileGrade = profile.grade || 2;
            const profileCurricula = curricula.filter((curriculum) => curriculum.grade === profileGrade);

            profileCurricula.forEach((curriculum) => {
                const curriculumPhases = [...(phasesByCurriculum.get(curriculum.id) || [])].sort((a, b) => a.order_index - b.order_index);
                const curriculumSkills = [...(skillsByCurriculum.get(curriculum.id) || [])].sort((a, b) => a.order_index - b.order_index);
                if (curriculumSkills.length === 0 || curriculumPhases.length === 0) return;

                const subjectId = curriculum.subject_id as SubjectId;
                const subjectProgress = deriveSubjectCurriculumProgress(profile, curriculumSkills, prerequisitesBySkill, subjectId);
                if (!subjectProgress) return;

                const resolvedPhaseId = subjectProgress.currentSkill?.phase_id
                    || getPhaseWithMostRecentProgress(curriculumPhases, curriculumSkills, profile.progress)
                    || curriculumPhases[0].id;

                studentStateRows.push({
                    profile_id: profile.id,
                    curriculum_id: curriculum.id,
                    current_phase_id: resolvedPhaseId,
                    current_skill_id: subjectProgress.currentSkill?.id || null,
                    pace_mode: subjectProgress.paceMode,
                    learning_mode: subjectProgress.learningMode,
                    acceleration_level: subjectProgress.accelerationLevel,
                    parent_override_mode: false,
                    notes: null,
                    updated_at: new Date().toISOString(),
                });

                skillProgressRows.push(...subjectProgress.skillRows.map((row) => ({
                    profile_id: profile.id,
                    curriculum_skill_id: row.curriculum_skill_id,
                    attempts: row.attempts,
                    correct_attempts: row.correct_attempts,
                    mastery: row.mastery,
                    status: row.status,
                    last_attempt_at: row.last_attempt_at,
                    unlocked_at: row.unlocked_at,
                    next_review_at: row.next_review_at,
                    updated_at: new Date().toISOString(),
                })));
            });
        });

        if (skillProgressRows.length > 0) {
            const { error } = await supabase
                .from('student_skill_progress')
                .upsert(skillProgressRows, { onConflict: 'profile_id,curriculum_skill_id' });
            if (error) {
                console.warn('Curriculum skill progress sync skipped:', error.message);
            }
        }

        if (studentStateRows.length > 0) {
            const { error } = await supabase
                .from('student_learning_state')
                .upsert(studentStateRows, { onConflict: 'profile_id,curriculum_id' });
            if (error) {
                console.warn('Curriculum learning state sync skipped:', error.message);
            }
        }
    } catch (error) {
        console.warn('Curriculum sync skipped:', error);
    }
}

type DerivedSubjectProgress = {
    currentSkill: CurriculumSkillRow | null;
    paceMode: PaceMode;
    learningMode: LearningMode;
    accelerationLevel: AccelerationLevel;
    skillRows: Array<{
        curriculum_skill_id: string;
        attempts: number;
        correct_attempts: number;
        mastery: number;
        status: 'locked' | 'unlocked' | 'learning' | 'mastered' | 'review';
        last_attempt_at: string | null;
        unlocked_at: string | null;
        next_review_at: string | null;
    }>;
};

function deriveSubjectCurriculumProgress(
    profile: UserProfile,
    curriculumSkills: CurriculumSkillRow[],
    prerequisitesBySkill: Map<string, CurriculumPrerequisiteRow[]>,
    subjectId: SubjectId
): DerivedSubjectProgress | null {
    const reviewItems = profile.progress.reviewQueue || [];
    const reviewBySkillId = new Map<string, ReviewItem>();
    reviewItems.forEach((item) => {
        if (!reviewBySkillId.has(item.skillId)) {
            reviewBySkillId.set(item.skillId, item);
        }
    });

    const skillLookup = new Map(curriculumSkills.map((skill) => [skill.id, skill]));
    const legacyByCurriculumSkillId = new Map(curriculumSkills.map((skill) => [skill.id, getLegacySkillId(skill)]));
    const rowByLegacySkillId = new Map<string, CurriculumSkillRow>();
    curriculumSkills.forEach((skill) => {
        const legacySkillId = getLegacySkillId(skill);
        const subject = SKILL_MAP[legacySkillId]?.subjectId;
        if (subject === subjectId) {
            rowByLegacySkillId.set(legacySkillId, skill);
        }
    });

    const skillRows = curriculumSkills.map((skill) => {
        const legacySkillId = getLegacySkillId(skill);
        const state = profile.progress.skills[legacySkillId];
        const reviewItem = reviewBySkillId.get(legacySkillId);
        const prerequisitesMet = (prerequisitesBySkill.get(skill.id) || []).every((requirement) => {
            if (requirement.relation_type !== 'required') return true;
            const prerequisiteSkill = skillLookup.get(requirement.prerequisite_skill_id);
            const prerequisiteLegacyId = prerequisiteSkill ? legacyByCurriculumSkillId.get(prerequisiteSkill.id) : null;
            const prerequisiteState = prerequisiteLegacyId ? profile.progress.skills[prerequisiteLegacyId] : null;
            if (!prerequisiteSkill || !prerequisiteLegacyId) return true;
            return Boolean(
                prerequisiteState
                && prerequisiteState.mastery >= prerequisiteSkill.min_mastery_to_unlock_next
                && prerequisiteState.attempts >= prerequisiteSkill.min_attempts
            );
        });

        const attempts = state?.attempts || 0;
        const correctAttempts = state?.correctCount || 0;
        const mastery = Number((state?.mastery || 0).toFixed(2));
        const lastAttemptAt = attempts > 0 ? state?.lastSeen || null : null;
        const unlockedAt = prerequisitesMet ? (attempts > 0 ? state?.lastSeen || null : new Date().toISOString()) : null;
        const nextReviewAt = reviewItem?.nextReviewDate ? `${reviewItem.nextReviewDate}T00:00:00.000Z` : null;

        let status: 'locked' | 'unlocked' | 'learning' | 'mastered' | 'review' = 'locked';
        if (prerequisitesMet) {
            status = attempts > 0 ? 'learning' : 'unlocked';
            if (reviewItem) {
                status = 'review';
            }
            if (mastery >= skill.min_mastery_to_unlock_next && attempts >= skill.min_attempts) {
                status = 'mastered';
            }
        }

        return {
            curriculum_skill_id: skill.id,
            attempts,
            correct_attempts: correctAttempts,
            mastery,
            status,
            last_attempt_at: lastAttemptAt,
            unlocked_at: unlockedAt,
            next_review_at: nextReviewAt,
        };
    });

    const currentSkill = curriculumSkills.find((skill) => {
        const row = skillRows.find((entry) => entry.curriculum_skill_id === skill.id);
        return row && row.status !== 'mastered' && row.status !== 'locked';
    }) || curriculumSkills.find((skill) => {
        const row = skillRows.find((entry) => entry.curriculum_skill_id === skill.id);
        return row && row.status === 'unlocked';
    }) || curriculumSkills[curriculumSkills.length - 1] || null;

    const subjectStates = Array.from(rowByLegacySkillId.keys())
        .map((legacySkillId) => profile.progress.skills[legacySkillId])
        .filter(Boolean);

    const paceMode = derivePaceMode(subjectStates);
    const accelerationLevel = deriveAccelerationLevel(subjectStates, skillRows, curriculumSkills);
    const learningMode = deriveLearningMode(skillRows, curriculumSkills, accelerationLevel);

    return {
        currentSkill,
        paceMode,
        learningMode,
        accelerationLevel,
        skillRows,
    };
}

function derivePaceMode(states: Array<ProgressData['skills'][string] | undefined>): PaceMode {
    if (states.length === 0) return 'standard';
    const averageMastery = states.reduce((sum, state) => sum + (state?.mastery || 0), 0) / states.length;
    const weakCount = states.filter((state) => (state?.mastery || 0) < 0.45 && (state?.attempts || 0) >= 2).length;

    if (weakCount >= Math.ceil(states.length * 0.4) || averageMastery < 0.45) return 'support';
    if (averageMastery > 0.82) return 'fast';
    return 'standard';
}

function deriveAccelerationLevel(
    states: Array<ProgressData['skills'][string] | undefined>,
    skillRows: DerivedSubjectProgress['skillRows'],
    curriculumSkills: CurriculumSkillRow[]
): AccelerationLevel {
    if (states.length === 0) return 'standard';
    const averageMastery = states.reduce((sum, state) => sum + (state?.mastery || 0), 0) / states.length;
    const masteredRatio = skillRows.filter((row) => row.status === 'mastered').length / Math.max(skillRows.length, 1);
    const challengeReady = curriculumSkills.some((skill) => skill.is_challenge || skill.stage === 'challenge');

    if (averageMastery < 0.45) return 'support';
    if (challengeReady && averageMastery > 0.85 && masteredRatio > 0.55) return 'advanced';
    return 'standard';
}

function deriveLearningMode(
    skillRows: DerivedSubjectProgress['skillRows'],
    curriculumSkills: CurriculumSkillRow[],
    accelerationLevel: AccelerationLevel
): LearningMode {
    const reviewCount = skillRows.filter((row) => row.status === 'review').length;
    const unlockedCount = skillRows.filter((row) => row.status === 'learning' || row.status === 'unlocked').length;
    const challengeAvailable = curriculumSkills.some((skill) => (skill.is_challenge || skill.stage === 'challenge') && skillRows.some((row) => row.curriculum_skill_id === skill.id && row.status !== 'locked'));
    const mixedReady = curriculumSkills.some((skill) => skill.is_mixed_exam_eligible) && skillRows.filter((row) => row.status === 'mastered').length >= 3;

    if (reviewCount >= 3) return 'review';
    if (accelerationLevel === 'advanced' && challengeAvailable) return 'challenge';
    if (mixedReady && unlockedCount === 0) return 'mixed';
    return 'core';
}

function getPhaseWithMostRecentProgress(
    phases: CurriculumPhaseRow[],
    curriculumSkills: CurriculumSkillRow[],
    progress: ProgressData
): string | null {
    const skillByPhaseId = groupBy(curriculumSkills, (skill) => skill.phase_id);

    for (let i = phases.length - 1; i >= 0; i -= 1) {
        const phase = phases[i];
        const hasProgress = (skillByPhaseId.get(phase.id) || []).some((skill) => {
            const state = progress.skills[getLegacySkillId(skill)];
            return Boolean(state && state.attempts > 0);
        });
        if (hasProgress) return phase.id;
    }

    return null;
}

function getLegacySkillId(skill: CurriculumSkillRow): string {
    return typeof skill.metadata?.legacySkillId === 'string' ? skill.metadata.legacySkillId : skill.skill_code;
}

function groupBy<T, K extends string | number>(rows: T[], getKey: (row: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    rows.forEach((row) => {
        const key = getKey(row);
        const list = map.get(key) || [];
        list.push(row);
        map.set(key, list);
    });
    return map;
}

