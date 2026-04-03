import { buildCurriculumSelectorPools, CurriculumSelectionContext } from './curriculum';
import { ProgressData } from './mastery';
import { isBossRound, SELECTOR_CONFIG } from './selector-config';
import { getFilteredSkills, SkillId, SKILL_MAP } from './skills';

export type SelectionBucket = 'review' | 'weak' | 'new' | 'mixed' | 'boss';

export interface SelectorOptions {
    subjectId?: string;
    grade?: number;
    curriculumContext?: CurriculumSelectionContext | null;
    sessionLength?: number;
}

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

function selectFromCurriculumPools(
    pools: ReturnType<typeof buildCurriculumSelectorPools>,
    progress: ProgressData,
    sessionHistory: SkillId[],
    isBossLevel: boolean,
    isPushRound: boolean,
    currentPerformance: number
): { skillId: SkillId; bucket: SelectionBucket } | null {
    const {
        allowedSkillIds,
        currentPhaseSkillIds,
        coreSkillIds,
        mixedSkillIds,
        reviewSkillIds,
        challengeSkillIds,
        learningMode,
        skillConfigByLegacyId,
    } = pools;
    if (allowedSkillIds.length === 0) return null;

    if (isBossLevel && currentPerformance > SELECTOR_CONFIG.curriculumBossThreshold && challengeSkillIds.length > 0) {
        return { skillId: getRandomFromList(challengeSkillIds, sessionHistory), bucket: 'boss' };
    }

    if (learningMode === 'challenge' && challengeSkillIds.length > 0) {
        const target = getWeakOrNewSkill(challengeSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getRandomFromList(challengeSkillIds, sessionHistory);
        return { skillId: target, bucket: 'boss' };
    }

    if (learningMode === 'review' && reviewSkillIds.length > 0) {
        const target = getWeakOrNewSkill(reviewSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getRandomFromList(reviewSkillIds, sessionHistory);
        return { skillId: target, bucket: 'review' };
    }

    if (learningMode === 'mixed' && mixedSkillIds.length > 0) {
        const mixedTarget = getWeakOrNewSkill(mixedSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getReviewSkill(mixedSkillIds, progress, sessionHistory)
            || getRandomFromList(mixedSkillIds, sessionHistory);
        return { skillId: mixedTarget, bucket: 'mixed' };
    }

    const pushPool = coreSkillIds.length > 0 ? coreSkillIds : currentPhaseSkillIds.length > 0 ? currentPhaseSkillIds : allowedSkillIds;
    const reviewPool = reviewSkillIds.length > 0 ? reviewSkillIds : allowedSkillIds;

    if (isPushRound) {
        const weakTarget = getWeakSkill(pushPool, progress, sessionHistory);
        if (weakTarget) {
            return { skillId: weakTarget, bucket: 'weak' };
        }

        const newTarget = getNewSkill(pushPool, progress, skillConfigByLegacyId, sessionHistory);
        if (newTarget) {
            return { skillId: newTarget, bucket: 'new' };
        }
    } else {
        const reviewTarget = getReviewSkill(reviewPool, progress, sessionHistory);
        if (reviewTarget) {
            return { skillId: reviewTarget, bucket: 'review' };
        }
    }

    return { skillId: getRandomFromList(pushPool, sessionHistory), bucket: 'mixed' };
}

function selectWithLegacyLogic(
    progress: ProgressData,
    sessionHistory: SkillId[],
    sessionIndex: number,
    currentPerformance: number,
    filteredSkills: ReturnType<typeof getFilteredSkills>
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

function getCurriculumPool(orderedSkillIds: SkillId[], progress: ProgressData): SkillId[] {
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

function selectOpeningSkill(
    orderedSkillIds: SkillId[],
    sessionHistory: SkillId[],
    sessionLength?: number,
    challengeSkillIds: SkillId[] = [],
    mixedSkillIds: SkillId[] = [],
    coreSkillIds: SkillId[] = []
): { skillId: SkillId; bucket: SelectionBucket } | null {
    if (orderedSkillIds.length === 0) return null;

    let pool: SkillId[] = orderedSkillIds;
    let bucket: SelectionBucket = 'mixed';

    if ((sessionLength || 0) >= 30) {
        pool = challengeSkillIds.length > 0
            ? challengeSkillIds
            : mixedSkillIds.length > 0
                ? mixedSkillIds
                : orderedSkillIds.slice(Math.max(0, Math.floor(orderedSkillIds.length / 2)));
        bucket = 'boss';
    } else if ((sessionLength || 0) >= 20) {
        const middleStart = Math.floor(orderedSkillIds.length / 3);
        const middleEnd = Math.max(middleStart + 1, Math.ceil((orderedSkillIds.length * 2) / 3));
        pool = mixedSkillIds.length > 0
            ? mixedSkillIds
            : orderedSkillIds.slice(middleStart, middleEnd);
        bucket = 'mixed';
    } else {
        const headSize = Math.max(1, Math.ceil(orderedSkillIds.length / 3));
        pool = coreSkillIds.length > 0 ? coreSkillIds : orderedSkillIds.slice(0, headSize);
        bucket = 'new';
    }

    if (pool.length === 0) {
        pool = orderedSkillIds;
        bucket = 'mixed';
    }

    return { skillId: getRandomFromList(pool, sessionHistory), bucket };
}

function getWeakOrNewSkill(
    pool: SkillId[],
    progress: ProgressData,
    skillConfigByLegacyId: Record<string, { min_attempts: number }>,
    sessionHistory: SkillId[]
): SkillId | null {
    return getWeakSkill(pool, progress, sessionHistory) || getNewSkill(pool, progress, skillConfigByLegacyId, sessionHistory);
}

function getWeakSkill(pool: SkillId[], progress: ProgressData, sessionHistory: SkillId[]): SkillId | null {
    const weakCandidates = pool
        .map((id) => progress.skills[id] || { skillId: id, mastery: 0, attempts: 0, wrongStreak: 0 })
        .filter((state) => state.mastery < SELECTOR_CONFIG.weakMasteryThreshold)
        .sort((a, b) => {
            const masteryGap = a.mastery - b.mastery;
            if (masteryGap !== 0) return masteryGap;
            return (b.wrongStreak || 0) - (a.wrongStreak || 0);
        })
        .slice(0, Math.max(4, SELECTOR_CONFIG.candidatePoolSize));

    if (weakCandidates.length === 0) return null;

    const weightedPool = weakCandidates.flatMap((state, index) => {
        const baseWeight = Math.max(1, weakCandidates.length - index);
        const wrongStreakBonus = Math.min(3, state.wrongStreak || 0);
        return Array(baseWeight + wrongStreakBonus).fill(state.skillId);
    });

    return getRandomFromList(weightedPool, sessionHistory);
}

function getNewSkill(
    pool: SkillId[],
    progress: ProgressData,
    skillConfigByLegacyId: Record<string, { min_attempts: number }>,
    sessionHistory: SkillId[]
): SkillId | null {
    const newCandidates = pool.filter((id) => {
        const attempts = progress.skills[id]?.attempts || 0;
        const minAttempts = skillConfigByLegacyId[id]?.min_attempts ?? 3;
        return attempts < minAttempts;
    });

    return newCandidates.length > 0 ? getRandomFromList(newCandidates, sessionHistory) : null;
}

function getReviewSkill(pool: SkillId[], progress: ProgressData, sessionHistory: SkillId[]): SkillId | null {
    const reviewCandidates = pool
        .map((id) => progress.skills[id])
        .filter((state) => state && state.mastery >= SELECTOR_CONFIG.weakMasteryThreshold)
        .sort((a, b) => new Date(a!.lastSeen).getTime() - new Date(b!.lastSeen).getTime())
        .slice(0, SELECTOR_CONFIG.candidatePoolSize)
        .map((state) => state!.skillId);

    return reviewCandidates.length > 0 ? getRandomFromList(reviewCandidates, sessionHistory) : null;
}

function getRandomFromList(list: SkillId[], history: SkillId[]): SkillId {
    if (list.length === 0) return 'A1';

    const usageCounts = history.reduce<Record<string, number>>((acc, skillId) => {
        acc[skillId] = (acc[skillId] || 0) + 1;
        return acc;
    }, {});

    let candidates = [...list];
    const minUsage = Math.min(...candidates.map((id) => usageCounts[id] || 0));
    candidates = candidates.filter((id) => (usageCounts[id] || 0) === minUsage);

    // Try to filter out recently seen skills for maximum variety.
    // If the pool is too small, gracefully relax the recent-avoid window.
    const maxAvoid = Math.min(8, history.length);

    for (let n = maxAvoid; n > 0; n--) {
        const recentSubset = new Set(history.slice(-n));
        const filtered = candidates.filter(id => !recentSubset.has(id));
        if (filtered.length > 0) {
            candidates = filtered;
            break;
        }
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}
