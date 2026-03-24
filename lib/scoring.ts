import { ProgressData } from './mastery';
import { SubjectId, COURSES } from './content/registry';

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
    let amount = 100;
    let bonusReason = '';

    const normalizedSkillId = skillId.toLowerCase();
    const hasToken = (...tokens: string[]) => tokens.some((token) => normalizedSkillId.includes(token));
    const isEnglishSkill = normalizedSkillId.startsWith('eng') || normalizedSkillId.includes('-eng');
    const isSpeaking = hasToken('speak', 'hung-bien', 'thuyet-trinh', 'thao-luan');
    const isReading = hasToken('read', 'doc', 'dien-cam', 'story-quest');
    const isListening = hasToken('list');

    if (isSpeaking || isReading || isListening) {
        amount = 150;

        if (hasToken('oratory', 'hung-bien', 'story-quest')) {
            amount = 1000;
            bonusReason = 'Hung bien';
        } else if (hasToken('expressive', 'dien-cam') || (isEnglishSkill && (isSpeaking || isReading))) {
            amount = 800;
            bonusReason = 'Doc troi chay';
        }
    }

    if (quality === 'Xuất sắc') {
        if (hasToken('hung-bien', 'story-quest')) amount += 1000;
        else if (hasToken('dien-cam') || (isEnglishSkill && (isSpeaking || isReading))) amount += 200;
        else amount += 50;

        bonusReason = bonusReason ? `${bonusReason} + Xuất sắc` : 'Xuất sắc';
    } else if (quality === 'Giỏi') {
        if (hasToken('hung-bien', 'story-quest')) amount += 500;
        else if (hasToken('dien-cam') || (isEnglishSkill && (isSpeaking || isReading))) amount += 100;
        else amount += 20;

        bonusReason = bonusReason ? `${bonusReason} + Giỏi` : 'Giỏi';
    }

    if (level >= 2) {
        const levelMultiplier = level <= 2 ? 1.2 : level <= 3 ? 1.5 : level <= 4 ? 1.8 : 2.0;
        amount = Math.round(amount * levelMultiplier);
        bonusReason = bonusReason ? `${bonusReason} (Level ${level})` : `Level ${level} bonus`;
    }

    if (isEnglishSkill) {
        amount *= 2;
        bonusReason = bonusReason ? `${bonusReason} (x2 Tieng Anh)` : 'x2 Tieng Anh';
    }

    return { amount, bonusReason };
};
