import { SubjectId, COURSES } from './content/registry';
import { ProgressData } from './mastery';
import { REWARD_CONFIG } from './reward-config';

export const getSubjectScore = (progress: ProgressData, subjectId: SubjectId): number => {
    if (!progress || !progress.skills) return 0;

    const course = COURSES[subjectId];
    if (!course) return 0;

    let total = 0;

    const subjectSkillIds = new Set<string>();
    course.topics.forEach((topic) => {
        topic.skills.forEach((skill) => {
            subjectSkillIds.add(skill.id);
        });
    });

    Object.entries(progress.skills).forEach(([skillId, masteryState]) => {
        if (subjectSkillIds.has(skillId)) {
            const level = masteryState.level || 0;
            const streak = masteryState.streak || 0;
            const levelScore = level * 200;
            const streakBonus = streak * 10;

            total += levelScore + streakBonus;
        }
    });

    return total;
};

export const calculateReward = (skillId: string, quality?: string, level: number = 1): { amount: number, bonusReason?: string } => {
    let amount: number = REWARD_CONFIG.baseReward;
    let bonusReason = '';

    const normalizedSkillId = skillId.toLowerCase();
    const hasToken = (...tokens: string[]) => tokens.some((token) => normalizedSkillId.includes(token));
    const isEnglishSkill = normalizedSkillId.startsWith('eng') || normalizedSkillId.includes('-eng');
    const isSpeaking = hasToken('speak', 'hung-bien', 'thuyet-trinh', 'thao-luan');
    const isReading = hasToken('read', 'doc', 'dien-cam', 'story-quest');
    const isListening = hasToken('listen', 'list-');
    const isExpressiveSkill = hasToken('expressive', 'dien-cam') || (isEnglishSkill && (isSpeaking || isReading));
    const isOratorySkill = hasToken('oratory', 'hung-bien', 'story-quest');

    if (isSpeaking || isReading || isListening) {
        amount = REWARD_CONFIG.skillReward;

        if (isOratorySkill) {
            amount = REWARD_CONFIG.oratoryReward;
            bonusReason = 'Hung bien';
        } else if (isExpressiveSkill) {
            amount = REWARD_CONFIG.expressiveReward;
            bonusReason = 'Doc troi chay';
        }
    }

    if (quality === 'Xuất sắc') {
        if (isOratorySkill) amount += REWARD_CONFIG.qualityBonus.excellent.oratory;
        else if (isExpressiveSkill) amount += REWARD_CONFIG.qualityBonus.excellent.expressive;
        else amount += REWARD_CONFIG.qualityBonus.excellent.standard;

        bonusReason = bonusReason ? `${bonusReason} + Xuất sắc` : 'Xuất sắc';
    } else if (quality === 'Giỏi') {
        if (isOratorySkill) amount += REWARD_CONFIG.qualityBonus.good.oratory;
        else if (isExpressiveSkill) amount += REWARD_CONFIG.qualityBonus.good.expressive;
        else amount += REWARD_CONFIG.qualityBonus.good.standard;

        bonusReason = bonusReason ? `${bonusReason} + Giỏi` : 'Giỏi';
    }

    if (level >= 2) {
        const levelMultiplier = REWARD_CONFIG.levelMultipliers[level] ?? REWARD_CONFIG.maxLevelMultiplier;
        amount = Math.round(amount * levelMultiplier);
        bonusReason = bonusReason ? `${bonusReason} (Level ${level})` : `Level ${level} bonus`;
    }

    if (isEnglishSkill) {
        amount = Math.round(amount * REWARD_CONFIG.englishMultiplier);
        bonusReason = bonusReason
            ? `${bonusReason} (x${REWARD_CONFIG.englishMultiplier} Tieng Anh)`
            : `x${REWARD_CONFIG.englishMultiplier} Tieng Anh`;
    }

    return { amount, bonusReason };
};

