import { buildCurriculumSelectorPools } from '../curriculum';
import { ProgressData } from '../mastery';
import { isBossRound, SELECTOR_CONFIG } from '../selector-config';
import { getFilteredSkills, SkillId, SKILL_MAP } from '../skills';
import { selectFromCurriculumPools } from './curriculum-strategy';
import { selectWithLegacyLogic } from './legacy-strategy';
import { SelectionBucket, SelectorOptions } from './types';
import { getRandomFromList, selectOpeningSkill } from './utils';

const ARENA_SKILL_EXCLUSIONS: Partial<Record<'math' | 'english' | 'vietnamese' | 'finance', SkillId[]>> = {
    vietnamese: ['tv3-hung-bien', 'tv3-thao-luan'],
};

export function selectNextSkill(
    progress: ProgressData,
    sessionHistory: SkillId[],
    sessionIndex: number,
    currentPerformance: number,
    options: SelectorOptions = {}
): { skillId: SkillId; bucket: SelectionBucket } {
    const { subjectId, grade, curriculumContext, sessionLength } = options;

    const isBossLevel = isBossRound(sessionIndex);
    const requestedSubjectId = subjectId as 'math' | 'english' | 'vietnamese' | 'finance' | undefined;
    const excludedSkills = new Set(ARENA_SKILL_EXCLUSIONS[requestedSubjectId || 'math'] || []);
    const filteredSkills = getFilteredSkills(grade, requestedSubjectId).filter((skill) => !excludedSkills.has(skill.id));
    
    if (filteredSkills.length === 0) {
        const sameSubjectSkills = requestedSubjectId
            ? getFilteredSkills(undefined, requestedSubjectId).filter((skill) => !excludedSkills.has(skill.id))
            : [];
        const fallbackPool = sameSubjectSkills.length > 0
            ? sameSubjectSkills.map((skill) => skill.id)
            : Object.keys(SKILL_MAP) as SkillId[];
        return { skillId: getRandomFromList(fallbackPool, sessionHistory), bucket: 'mixed' };
    }

    if (sessionIndex === 0 && !curriculumContext) {
        const openingSelection = selectOpeningSkill(filteredSkills.map((skill) => skill.id), sessionHistory, sessionLength);
        if (openingSelection) {
            return openingSelection;
        }
    }

    const availableSkillIds = new Set(filteredSkills.map((skill) => skill.id));
    const burstSkill = Object.values(progress.skills).find(
        (skill) => skill.wrongStreak >= SELECTOR_CONFIG.burstWrongStreak && availableSkillIds.has(skill.skillId)
    );
    if (burstSkill) {
        return { skillId: burstSkill.skillId, bucket: 'weak' };
    }

    const isPushRound = sessionIndex % 2 === 0;

    if (curriculumContext) {
        const pools = buildCurriculumSelectorPools(curriculumContext, progress, filteredSkills.map((skill) => skill.id));
        if (sessionIndex === 0) {
            const openingSelection = selectOpeningSkill(
                pools.allowedSkillIds,
                sessionHistory,
                sessionLength,
                pools.challengeSkillIds,
                pools.mixedSkillIds,
                pools.coreSkillIds.length > 0 ? pools.coreSkillIds : pools.currentPhaseSkillIds
            );
            if (openingSelection) return openingSelection;
        }
        const selection = selectFromCurriculumPools(pools, progress, sessionHistory, isBossLevel, isPushRound, currentPerformance);
        if (selection) return selection;
    }

    return selectWithLegacyLogic(progress, sessionHistory, sessionIndex, currentPerformance, filteredSkills);
}
