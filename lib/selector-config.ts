import { SkillId } from './skills';

export const SELECTOR_CONFIG = {
    bossRoundIndices: [19, 24, 26, 28, 29] as const,
    bossPerformanceThreshold: 0.8,
    curriculumBossThreshold: 0.82,
    tier2UnlockMastery: 0.78,
    weakMasteryThreshold: 0.7,
    semester2ReadinessMastery: 0.68,
    foundationalMasteryThreshold: 0.65,
    frontierMasteryThreshold: 0.55,
    candidatePoolSize: 5,
    burstWrongStreak: 2,
    logicSkillIds: ['E1', 'E2', 'E3'] as SkillId[],
    logicSelectionProbability: 0.7,
} as const;

export function isBossRound(sessionIndex: number) {
    return SELECTOR_CONFIG.bossRoundIndices.includes(
        sessionIndex as typeof SELECTOR_CONFIG.bossRoundIndices[number]
    );
}
