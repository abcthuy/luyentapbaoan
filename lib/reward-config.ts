export const REWARD_CONFIG = {
    baseReward: 100,
    skillReward: 120,
    expressiveReward: 220,
    oratoryReward: 360,
    qualityBonus: {
        excellent: { standard: 40, expressive: 70, oratory: 120 },
        good: { standard: 20, expressive: 30, oratory: 60 },
    },
    levelMultipliers: { 2: 1.15, 3: 1.35, 4: 1.6 } as Record<number, number>,
    maxLevelMultiplier: 1.8,
    englishMultiplier: 1.15,
} as const;
