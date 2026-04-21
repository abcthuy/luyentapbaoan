import { ProgressData } from '../mastery';
import { isBossRound, SELECTOR_CONFIG } from '../selector-config';
import { SkillId } from '../skills';
import { SelectionBucket } from './types';
import { getRandomFromList, getWeakSkill, getNewSkill, getReviewSkill } from './utils';

export function getCurriculumPool(orderedSkillIds: SkillId[], progress: ProgressData): SkillId[] {
    if (orderedSkillIds.length <= 4) {
        return orderedSkillIds;
    }

    const foundationalWindow = orderedSkillIds.slice(0, Math.min(4, orderedSkillIds.length));
    const foundationalMastery = foundationalWindow.reduce((acc, id) => acc + (progress.skills[id]?.mastery || 0), 0) / foundationalWindow.length;
    const foundationalAttempts = foundationalWindow.reduce((acc, id) => acc + (progress.skills[id]?.attempts || 0), 0);

    if (
        foundationalMastery < SELECTOR_CONFIG.foundationalMasteryThreshold
        || foundationalAttempts < foundationalWindow.length * 2
    ) {
        return foundationalWindow;
    }

    let frontier = 4;
    for (let i = 0; i < orderedSkillIds.length; i += 1) {
        const state = progress.skills[orderedSkillIds[i]];
        const mastery = state?.mastery || 0;
        const attempts = state?.attempts || 0;

        if (mastery < SELECTOR_CONFIG.frontierMasteryThreshold || attempts < 2) {
            frontier = Math.max(4, i + 2);
            break;
        }

        frontier = Math.max(frontier, i + 3);
    }

    return orderedSkillIds.slice(0, Math.min(frontier, orderedSkillIds.length));
}

export function selectWithLegacyLogic(
    progress: ProgressData,
    sessionHistory: SkillId[],
    sessionIndex: number,
    currentPerformance: number,
    filteredSkills: { id: SkillId; tier?: number; semester?: number }[]
): { skillId: SkillId; bucket: SelectionBucket } {
    const isPushRound = sessionIndex % 2 === 0;
    const tier2Skills = filteredSkills.filter((skill) => skill.tier === 2).map((skill) => skill.id);
    const tier1Skills = filteredSkills.filter((skill) => skill.tier === 1).map((skill) => skill.id);
    const orderedSkillIds = filteredSkills.map((skill) => skill.id);

    if (isBossRound(sessionIndex) && currentPerformance > SELECTOR_CONFIG.bossPerformanceThreshold && tier2Skills.length > 0) {
        const logicSkills = SELECTOR_CONFIG.logicSkillIds.filter((id) => tier2Skills.includes(id));
        const candidates = logicSkills.length > 0 && Math.random() > (1 - SELECTOR_CONFIG.logicSelectionProbability)
            ? logicSkills
            : tier2Skills;
        return { skillId: getRandomFromList(candidates, sessionHistory), bucket: 'boss' };
    }

    const t1Mastery = tier1Skills.reduce((acc, id) => acc + (progress.skills[id]?.mastery || 0), 0) / (tier1Skills.length || 1);
    const tier2Unlocked = t1Mastery > SELECTOR_CONFIG.tier2UnlockMastery;

    let pool = [...tier1Skills];
    if (tier2Unlocked) pool = [...pool, ...tier2Skills];

    const curriculumPool = getCurriculumPool(orderedSkillIds, progress);
    if (curriculumPool.length > 0) {
        const allowedSkills = new Set(curriculumPool);
        pool = pool.filter((id) => allowedSkills.has(id));
    }

    const semester2Skills = filteredSkills.filter((skill) => skill.semester === 2).map((skill) => skill.id);
    const s2Pool = pool.filter((id) => semester2Skills.includes(id));
    const semester1Skills = filteredSkills.filter((skill) => skill.semester === 1).map((skill) => skill.id);
    const semester1Mastery = semester1Skills.reduce((acc, id) => acc + (progress.skills[id]?.mastery || 0), 0) / (semester1Skills.length || 1);
    const semester2Ready = semester1Skills.length === 0 || semester1Mastery > SELECTOR_CONFIG.semester2ReadinessMastery;
    if (semester2Ready && s2Pool.length > 0 && isPushRound) {
        pool = s2Pool;
    }

    if (isPushRound) {
        const weakTarget = getWeakSkill(pool, progress, sessionHistory);
        if (weakTarget) return { skillId: weakTarget, bucket: 'weak' };

        const newCandidates = pool.filter((id) => !progress.skills[id] || progress.skills[id].attempts < 3);
        if (newCandidates.length > 0) {
            return { skillId: getRandomFromList(newCandidates, sessionHistory), bucket: 'new' };
        }
    } else {
        const reviewTarget = getReviewSkill(pool, progress, sessionHistory);
        if (reviewTarget) return { skillId: reviewTarget, bucket: 'review' };
    }

    return {
        skillId: getRandomFromList(pool.length > 0 ? pool : filteredSkills.map((skill) => skill.id), sessionHistory),
        bucket: 'mixed',
    };
}
