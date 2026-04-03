import { ProgressData } from './mastery';
import { SubjectId } from './content/types';
import { SkillId } from './skills';

export type LearningMode = 'core' | 'review' | 'mixed' | 'challenge' | 'exam';
export type PaceMode = 'support' | 'standard' | 'fast';
export type AccelerationLevel = 'support' | 'standard' | 'advanced';
export type CurriculumStage = 'foundation' | 'core' | 'mixed' | 'challenge';
export type DifficultyBand = 'foundation' | 'standard' | 'advanced' | 'challenge';

export interface CurriculumRow {
    id: string;
    subject_id: SubjectId;
    grade: number;
    name: string;
    academic_year?: string | null;
    version: number;
    is_active: boolean;
}

export interface CurriculumPhaseRow {
    id: string;
    curriculum_id: string;
    code: string;
    name: string;
    semester: 1 | 2;
    order_index: number;
}

export interface CurriculumSkillRow {
    id: string;
    curriculum_id: string;
    topic_id: string;
    phase_id: string;
    skill_code: string;
    name: string;
    semester: 1 | 2;
    order_index: number;
    stage: CurriculumStage;
    difficulty_band: DifficultyBand;
    difficulty_base: number;
    min_attempts: number;
    min_mastery_to_unlock_next: number;
    question_types?: string[] | null;
    is_core: boolean;
    is_reviewable: boolean;
    is_mixed_exam_eligible: boolean;
    is_challenge: boolean;
    metadata?: Record<string, unknown> | null;
}

export interface CurriculumPrerequisiteRow {
    skill_id: string;
    prerequisite_skill_id: string;
    relation_type: 'required' | 'recommended';
}

export interface StudentLearningStateRow {
    profile_id: string;
    curriculum_id: string;
    current_phase_id?: string | null;
    current_skill_id?: string | null;
    pace_mode: PaceMode;
    learning_mode: LearningMode;
    acceleration_level: AccelerationLevel;
    parent_override_mode: boolean;
    notes?: string | null;
}

export interface CurriculumSelectionContext {
    curriculum: CurriculumRow;
    phases: CurriculumPhaseRow[];
    skills: CurriculumSkillRow[];
    prerequisites: CurriculumPrerequisiteRow[];
    studentState: StudentLearningStateRow | null;
    resolvedPhaseId: string | null;
    resolvedPhaseCode: string | null;
    learningMode: LearningMode;
    paceMode: PaceMode;
    accelerationLevel: AccelerationLevel;
}

export interface CurriculumApiPayload {
    enabled: boolean;
    curriculum?: CurriculumRow;
    phases?: CurriculumPhaseRow[];
    skills?: CurriculumSkillRow[];
    prerequisites?: CurriculumPrerequisiteRow[];
    studentState?: StudentLearningStateRow | null;
    reason?: string;
}

export interface CurriculumSelectorPools {
    allowedSkillIds: SkillId[];
    currentPhaseSkillIds: SkillId[];
    coreSkillIds: SkillId[];
    mixedSkillIds: SkillId[];
    reviewSkillIds: SkillId[];
    challengeSkillIds: SkillId[];
    learningMode: LearningMode;
    paceMode: PaceMode;
    accelerationLevel: AccelerationLevel;
    skillConfigByLegacyId: Record<string, CurriculumSkillRow>;
}

export function buildCurriculumSelectionContext(payload: CurriculumApiPayload): CurriculumSelectionContext | null {
    if (!payload.enabled || !payload.curriculum || !payload.phases || !payload.skills || !payload.prerequisites) {
        return null;
    }

    const phases = [...payload.phases].sort((a, b) => a.order_index - b.order_index);
    const resolvedPhase = resolveActivePhase(phases, payload.studentState?.current_phase_id || null);

    return {
        curriculum: payload.curriculum,
        phases,
        skills: [...payload.skills].sort((a, b) => a.order_index - b.order_index),
        prerequisites: payload.prerequisites,
        studentState: payload.studentState || null,
        resolvedPhaseId: resolvedPhase?.id || null,
        resolvedPhaseCode: resolvedPhase?.code || null,
        learningMode: payload.studentState?.learning_mode || 'core',
        paceMode: payload.studentState?.pace_mode || 'standard',
        accelerationLevel: payload.studentState?.acceleration_level || 'standard',
    };
}

export function buildCurriculumSelectorPools(
    context: CurriculumSelectionContext,
    progress: ProgressData,
    availableSkillIds: SkillId[]
): CurriculumSelectorPools {
    const availableSet = new Set(availableSkillIds);
    const phaseById = new Map(context.phases.map((phase) => [phase.id, phase]));
    const currentPhase = context.resolvedPhaseId ? phaseById.get(context.resolvedPhaseId) : undefined;
    const currentPhaseOrder = currentPhase?.order_index || context.phases[0]?.order_index || 0;
    const maxPhaseOrder = getMaxPhaseOrder(currentPhaseOrder, context.accelerationLevel, context.learningMode);

    const prerequisiteMap = new Map<string, CurriculumPrerequisiteRow[]>();
    context.prerequisites.forEach((row) => {
        const list = prerequisiteMap.get(row.skill_id) || [];
        list.push(row);
        prerequisiteMap.set(row.skill_id, list);
    });

    const skillIdByCurriculumId = new Map(context.skills.map((skill) => [skill.id, getLegacySkillId(skill)]));
    const skillByLegacyId: Record<string, CurriculumSkillRow> = {};

    context.skills.forEach((skill) => {
        const legacySkillId = getLegacySkillId(skill);
        if (!availableSet.has(legacySkillId)) return;

        const phase = phaseById.get(skill.phase_id);
        if (!phase || phase.order_index > maxPhaseOrder) return;
        if (!prerequisitesMet(skill, prerequisiteMap, skillIdByCurriculumId, skillByLegacyId, progress)) return;

        skillByLegacyId[legacySkillId] = skill;
    });

    const allowedSkillIds = Object.keys(skillByLegacyId).sort((a, b) => skillByLegacyId[a].order_index - skillByLegacyId[b].order_index);
    const currentPhaseSkillIds = allowedSkillIds.filter((skillId) => skillByLegacyId[skillId].phase_id === context.resolvedPhaseId);
    const coreSkillIds = currentPhaseSkillIds.filter((skillId) => skillByLegacyId[skillId].is_core);
    const mixedSkillIds = allowedSkillIds.filter((skillId) => skillByLegacyId[skillId].is_mixed_exam_eligible || skillByLegacyId[skillId].stage === 'mixed');
    const challengeSkillIds = allowedSkillIds.filter((skillId) => skillByLegacyId[skillId].is_challenge || skillByLegacyId[skillId].stage === 'challenge');
    const reviewSkillIds = allowedSkillIds.filter((skillId) => {
        const skill = skillByLegacyId[skillId];
        if (!skill.is_reviewable) return false;
        const state = progress.skills[skillId];
        return !state || state.mastery < skill.min_mastery_to_unlock_next || state.attempts < skill.min_attempts;
    });

    return {
        allowedSkillIds: allowedSkillIds.length > 0 ? allowedSkillIds : availableSkillIds,
        currentPhaseSkillIds,
        coreSkillIds,
        mixedSkillIds,
        reviewSkillIds,
        challengeSkillIds,
        learningMode: context.learningMode,
        paceMode: context.paceMode,
        accelerationLevel: context.accelerationLevel,
        skillConfigByLegacyId: skillByLegacyId,
    };
}

export function getSuggestedPhaseCode(date = new Date()): string {
    const month = date.getMonth() + 1;

    if (month >= 9 && month <= 10) return 'hk1_dau';
    if (month === 11) return 'hk1_giua';
    if (month === 12 || month === 1) return 'hk1_cuoi';
    if (month === 2) return 'hk2_dau';
    if (month === 3 || month === 4) return 'hk2_giua';
    return 'hk2_cuoi';
}

function resolveActivePhase(phases: CurriculumPhaseRow[], currentPhaseId: string | null): CurriculumPhaseRow | undefined {
    if (currentPhaseId) {
        const explicit = phases.find((phase) => phase.id === currentPhaseId);
        if (explicit) return explicit;
    }

    const suggestedCode = getSuggestedPhaseCode();
    return phases.find((phase) => phase.code === suggestedCode) || phases[0];
}

function getLegacySkillId(skill: CurriculumSkillRow): SkillId {
    const metadataId = typeof skill.metadata?.legacySkillId === 'string' ? skill.metadata.legacySkillId : undefined;
    return (metadataId || skill.skill_code) as SkillId;
}

function prerequisitesMet(
    skill: CurriculumSkillRow,
    prerequisiteMap: Map<string, CurriculumPrerequisiteRow[]>,
    skillIdByCurriculumId: Map<string, SkillId>,
    skillByLegacyId: Record<string, CurriculumSkillRow>,
    progress: ProgressData
): boolean {
    const prerequisiteRows = prerequisiteMap.get(skill.id) || [];
    return prerequisiteRows.every((row) => {
        if (row.relation_type !== 'required') return true;
        const legacySkillId = skillIdByCurriculumId.get(row.prerequisite_skill_id);
        if (!legacySkillId) return true;
        const prerequisiteSkill = skillByLegacyId[legacySkillId];
        const state = progress.skills[legacySkillId];
        const requiredMastery = prerequisiteSkill?.min_mastery_to_unlock_next ?? 0.65;
        const requiredAttempts = prerequisiteSkill?.min_attempts ?? 3;
        return Boolean(state && state.mastery >= requiredMastery && state.attempts >= requiredAttempts);
    });
}

function getMaxPhaseOrder(currentPhaseOrder: number, accelerationLevel: AccelerationLevel, learningMode: LearningMode): number {
    if (learningMode === 'challenge' || accelerationLevel === 'advanced') {
        return currentPhaseOrder + 10;
    }
    if (accelerationLevel === 'support') {
        return currentPhaseOrder;
    }
    return currentPhaseOrder;
}
