/**
 * Subject Unlock System
 * 
 * Điều kiện mở khóa dựa trên % thành thạo (mastery) thay vì điểm tổng:
 * - Tiếng Anh: Toán ≥ 25% VÀ Tiếng Việt ≥ 25% kỹ năng đạt Khá (mastery ≥ 0.5)
 * - Tài Chính: Toán ≥ 40% VÀ Tiếng Việt ≥ 40% VÀ Tiếng Anh ≥ 40%
 */

import { getFilteredSkills } from './skills';
import { ProgressData } from './mastery';

// Mastery threshold for a skill to count as "Khá" (proficient)
const PROFICIENT_THRESHOLD = 0.5;

interface SubjectRequirement {
    subjectId: string;
    subjectName: string;
    requiredPercent: number;  // e.g. 25 means 25%
    currentPercent: number;   // actual current %
    met: boolean;
}

export interface UnlockStatus {
    unlocked: boolean;
    requirements: SubjectRequirement[];
    overallPercent: number;   // weighted average for the progress bar
}

// Calculate % of skills in a subject that are "proficient" (mastery >= 0.5)
function getSubjectProficiencyPercent(progress: ProgressData, subjectId: string, grade?: number): number {
    const allSkills = getFilteredSkills(grade, subjectId as 'math' | 'english' | 'vietnamese' | 'finance');
    if (allSkills.length === 0) return 0;

    let proficientCount = 0;
    for (const skill of allSkills) {
        const state = progress.skills?.[skill.id];
        if (state && state.mastery >= PROFICIENT_THRESHOLD) {
            proficientCount++;
        }
    }

    return Math.round((proficientCount / allSkills.length) * 100);
}

const SUBJECT_NAMES: Record<string, string> = {
    'math': 'Toán Học',
    'vietnamese': 'Tiếng Việt',
    'english': 'Tiếng Anh',
    'finance': 'Tài Chính',
};

/**
 * Unlock rules:
 * - english: math >= 25% AND vietnamese >= 25%
 * - finance: math >= 40% AND vietnamese >= 40% AND english >= 40%
 */
const UNLOCK_RULES: Record<string, { prereqs: { subjectId: string; percent: number }[] }> = {
    'math': { prereqs: [] },        // Always unlocked
    'vietnamese': { prereqs: [] },  // Always unlocked
    'english': {
        prereqs: [
            { subjectId: 'math', percent: 25 },
            { subjectId: 'vietnamese', percent: 25 },
        ]
    },
    'finance': {
        prereqs: [
            { subjectId: 'math', percent: 40 },
            { subjectId: 'vietnamese', percent: 40 },
            { subjectId: 'english', percent: 40 },
        ]
    }
};

export function getUnlockStatus(progress: ProgressData | null, subjectId: string, grade?: number): UnlockStatus {
    const rule = UNLOCK_RULES[subjectId];

    // No rule or no prereqs = always unlocked
    if (!rule || rule.prereqs.length === 0) {
        return { unlocked: true, requirements: [], overallPercent: 100 };
    }

    // Handle the case where progress hasn't loaded yet
    if (!progress) {
        return { unlocked: false, requirements: [], overallPercent: 0 };
    }

    const requirements: SubjectRequirement[] = rule.prereqs.map(prereq => {
        const currentPercent = getSubjectProficiencyPercent(progress, prereq.subjectId, grade);
        return {
            subjectId: prereq.subjectId,
            subjectName: SUBJECT_NAMES[prereq.subjectId] || prereq.subjectId,
            requiredPercent: prereq.percent,
            currentPercent,
            met: currentPercent >= prereq.percent,
        };
    });

    const allMet = requirements.every(r => r.met);

    // Overall percent: average of (current/required) capped at 100%
    const overallPercent = requirements.length > 0
        ? Math.round(requirements.reduce((sum, r) => sum + Math.min(100, (r.currentPercent / r.requiredPercent) * 100), 0) / requirements.length)
        : 100;

    return { unlocked: allMet, requirements, overallPercent: Math.min(100, overallPercent) };
}

/** Get a motivational message based on overall unlock progress */
export function getUnlockMessage(overallPercent: number): { text: string; emoji: string } {
    if (overallPercent >= 90) return { text: 'Chỉ còn chút xíu nữa thôi!', emoji: '🚀' };
    if (overallPercent >= 70) return { text: 'Gần lắm rồi! Cố lên nào!', emoji: '🔥' };
    if (overallPercent >= 40) return { text: 'Đang tiến bộ rất tốt!', emoji: '💪' };
    if (overallPercent >= 15) return { text: 'Hành trình mới đang bắt đầu!', emoji: '🌟' };
    return { text: 'Một vùng đất bí ẩn đang chờ bé!', emoji: '🔮' };
}
