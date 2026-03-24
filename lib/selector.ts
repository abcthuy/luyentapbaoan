import { getFilteredSkills, SkillId, SKILL_MAP } from './skills';
import { ProgressData } from './mastery';

export type SelectionBucket = 'review' | 'weak' | 'new' | 'mixed' | 'boss';

export function selectNextSkill(
    progress: ProgressData,
    sessionHistory: SkillId[],
    sessionIndex: number, // 0-based index of current question (e.g. 0 to 29)
    currentPerformance: number, // 0.0 to 1.0 (correct rate in current session)
    subjectId?: string, // Optional subject filter
    grade?: number
): { skillId: SkillId; bucket: SelectionBucket } {
    // 0. Boss Level Logic (Indices 19, 24, 26, 28, 29)
    const BOSS_INDICES = [19, 24, 26, 28, 29];
    const isBossLevel = BOSS_INDICES.includes(sessionIndex);

    const filteredSkills = getFilteredSkills(grade, subjectId as 'math' | 'english' | 'vietnamese' | 'finance' | undefined);
    if (filteredSkills.length === 0) {
        return { skillId: getRandomFromList(Object.keys(SKILL_MAP), sessionHistory), bucket: 'mixed' };
    }

    const tier2Skills = filteredSkills.filter(s => s.tier === 2).map(s => s.id);
    const tier1Skills = filteredSkills.filter(s => s.tier === 1).map(s => s.id);

    // 1. BOSS LEVEL: Force Tier 2 for high performers
    if (isBossLevel && currentPerformance > 0.8 && tier2Skills.length > 0) {
        const logicSkills = ['E1', 'E2', 'E3'].filter(id => tier2Skills.includes(id));
        const candidates = logicSkills.length > 0 && Math.random() > 0.3 ? logicSkills : tier2Skills;
        return { skillId: getRandomFromList(candidates, sessionHistory), bucket: 'boss' };
    }

    // 2. CRITICAL REMEDIATION (BOOST): If 2+ errors in a row for any skill
    const availableSkillIds = new Set(filteredSkills.map((skill) => skill.id));
    const burstSkill = Object.values(progress.skills).find(s => s.wrongStreak >= 2 && availableSkillIds.has(s.skillId));
    if (burstSkill) {
        return { skillId: burstSkill.skillId, bucket: 'weak' };
    }

    // 3. INTELLIGENT INTERLEAVING: Mix Mastered (Review) vs Weak (Push)
    // Rule: Even indices (0, 2, 4...) -> "Push" (Weak or New)
    //      Odd indices (1, 3, 5...) -> "Review" (Mastered) or "Random"
    const isPushRound = sessionIndex % 2 === 0;

    // Filter available skills based on Unlock logic
    const t1Mastery = tier1Skills.reduce((acc, id) => acc + (progress.skills[id]?.mastery || 0), 0) / (tier1Skills.length || 1);
    const totalScore = progress.totalScore || 0;
    const tier2Unlocked = t1Mastery > 0.75 || totalScore > 3000;

    let pool = [...tier1Skills];
    if (tier2Unlocked) pool = [...pool, ...tier2Skills];

    // Priority: Semester 2
    const semester2Skills = filteredSkills.filter(s => s.semester === 2).map(s => s.id);
    const s2Pool = pool.filter(id => semester2Skills.includes(id));

    // If we have S2 skills, use them 80% of the time in Push rounds
    if (s2Pool.length > 0 && isPushRound && Math.random() < 0.8) {
        pool = s2Pool;
    }

    if (isPushRound) {
        // Find weakest skills in the pool
        const weakCandidates = pool
            .map(id => progress.skills[id] || { skillId: id, mastery: 0, attempts: 0 })
            .filter(s => s.mastery < 0.7)
            .sort((a, b) => a.mastery - b.mastery)
            .slice(0, 5);

        if (weakCandidates.length > 0) {
            const chosen = getRandomFromList(weakCandidates.map(s => s.skillId), sessionHistory);
            return { skillId: chosen, bucket: 'weak' };
        }

        // If no weak skills, pick a new one
        const newCandidates = pool.filter(id => !progress.skills[id] || progress.skills[id].attempts < 3);
        if (newCandidates.length > 0) {
            const chosen = getRandomFromList(newCandidates, sessionHistory);
            return { skillId: chosen, bucket: 'new' };
        }
    } else {
        // Review Round: Mastered skills (>0.7)
        const reviewCandidates = pool
            .map(id => progress.skills[id])
            .filter(s => s && s.mastery >= 0.7)
            .sort((a, b) => new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime())
            .slice(0, 5);

        if (reviewCandidates.length > 0) {
            const chosen = getRandomFromList(reviewCandidates.map(s => s!.skillId), sessionHistory);
            return { skillId: chosen, bucket: 'review' };
        }
    }

    // Default Fallback
    const finalChoice = getRandomFromList(pool.length > 0 ? pool : filteredSkills.map((skill) => skill.id), sessionHistory);
    return { skillId: finalChoice, bucket: 'mixed' };
}

function getRandomFromList(list: SkillId[], history: SkillId[]): SkillId {
    if (list.length === 0) return 'A1'; // Global fallback
    const lastSkill = history[history.length - 1];
    const filtered = list.filter(id => id !== lastSkill);
    const source = filtered.length > 0 ? filtered : list;
    return source[Math.floor(Math.random() * source.length)];
}
