import { ProgressData, ReviewItem } from './mastery';

const INTERVALS = [1, 3, 7, 14, 30]; // ngày

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

/** Thêm câu sai vào hàng đợi ôn tập */
export function addToReviewQueue(
    progress: ProgressData,
    skillId: string,
    questionText: string,
    correctAnswer: string
): ProgressData {
    const queue = [...(progress.reviewQueue || [])];

    // Kiểm tra đã có câu này chưa (tránh trùng)
    const existing = queue.findIndex(
        r => r.skillId === skillId && r.questionText === questionText
    );

    if (existing >= 0) {
        // Đã có → reset interval về 1 ngày
        queue[existing] = {
            ...queue[existing],
            interval: 1,
            wrongCount: queue[existing].wrongCount + 1,
            nextReviewDate: addDays(getToday(), 1)
        };
    } else {
        // Thêm mới
        queue.push({
            skillId,
            questionText,
            correctAnswer,
            nextReviewDate: addDays(getToday(), 1),
            interval: 1,
            wrongCount: 1
        });
    }

    // Giới hạn tối đa 50 câu trong queue
    const trimmed = queue.slice(-50);

    return { ...progress, reviewQueue: trimmed };
}

/** Lấy câu cần ôn hôm nay */
export function getReviewQuestions(progress: ProgressData): ReviewItem[] {
    const today = getToday();
    return (progress.reviewQueue || []).filter(r => r.nextReviewDate <= today);
}

/** Cập nhật sau khi ôn: đúng → tăng interval, sai → reset */
export function updateReviewItem(
    progress: ProgressData,
    skillId: string,
    questionText: string,
    isCorrect: boolean
): ProgressData {
    const queue = [...(progress.reviewQueue || [])];
    const idx = queue.findIndex(
        r => r.skillId === skillId && r.questionText === questionText
    );

    if (idx < 0) return progress;

    if (isCorrect) {
        const currentInterval = queue[idx].interval;
        const nextIntervalIdx = INTERVALS.indexOf(currentInterval);
        if (nextIntervalIdx >= INTERVALS.length - 1) {
            // Đã ôn đủ → loại khỏi queue
            queue.splice(idx, 1);
        } else {
            const newInterval = INTERVALS[nextIntervalIdx + 1] || 30;
            queue[idx] = {
                ...queue[idx],
                interval: newInterval,
                nextReviewDate: addDays(getToday(), newInterval)
            };
        }
    } else {
        // Sai → reset về 1 ngày
        queue[idx] = {
            ...queue[idx],
            interval: 1,
            wrongCount: queue[idx].wrongCount + 1,
            nextReviewDate: addDays(getToday(), 1)
        };
    }

    return { ...progress, reviewQueue: queue };
}

/** Đếm số câu cần ôn hôm nay */
export function getReviewCount(progress: ProgressData): number {
    return getReviewQuestions(progress).length;
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}
