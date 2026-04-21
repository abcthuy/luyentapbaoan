import { ProgressData } from '../mastery';
import { SELECTOR_CONFIG } from '../selector-config';
import { SkillId } from '../skills';
import { SelectionBucket } from './types';

export function getRandomFromList(list: SkillId[], history: SkillId[]): SkillId {
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

export function getWeakSkill(pool: SkillId[], progress: ProgressData, sessionHistory: SkillId[]): SkillId | null {
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

export function getNewSkill(
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

export function getReviewSkill(pool: SkillId[], progress: ProgressData, sessionHistory: SkillId[]): SkillId | null {
    const reviewCandidates = pool
        .map((id) => progress.skills[id])
        .filter((state) => state && state.mastery >= SELECTOR_CONFIG.weakMasteryThreshold)
        .sort((a, b) => new Date(a!.lastSeen).getTime() - new Date(b!.lastSeen).getTime())
        .slice(0, SELECTOR_CONFIG.candidatePoolSize)
        .map((state) => state!.skillId);

    return reviewCandidates.length > 0 ? getRandomFromList(reviewCandidates, sessionHistory) : null;
}

export function getWeakOrNewSkill(
    pool: SkillId[],
    progress: ProgressData,
    skillConfigByLegacyId: Record<string, { min_attempts: number }>,
    sessionHistory: SkillId[]
): SkillId | null {
    return getWeakSkill(pool, progress, sessionHistory) || getNewSkill(pool, progress, skillConfigByLegacyId, sessionHistory);
}

export function selectOpeningSkill(
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
