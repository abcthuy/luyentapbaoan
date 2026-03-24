import { SkillId, SKILL_MAP } from './skills';
import type { ContentLibrary } from './content/library';


export interface MasteryState {
    skillId: SkillId;
    mastery: number; // 0..1
    stability: number; // 0..5 (increments on correct on different days, dec on wrong)
    lastSeen: string; // ISO date
    lastCorrect: string | null;
    attempts: number;
    correctCount: number;
    wrongStreak: number;
    streak: number;
    level: number; // 1 to 6
}

export interface InventoryItem {
    id: string; // unique instance id
    itemId: string; // 'candy', 'toy', etc.
    name: string;
    image: string; // emoji or url
    cost: number;
    status: 'pending' | 'used' | 'approved' | 'rejected';
    purchaseDate: string;
}

export interface Transaction {
    id: string;
    amount: number; // positive for income, negative for expense
    type: 'earn' | 'spend' | 'deposit' | 'withdraw';
    description: string;
    date: string;
    icon?: string; // Optional icon override
}

// Piggy Bank Goal
export interface SavingsGoal {
    name: string;
    targetAmount: number;
    currentAmount: number;
    image?: string; // Emoji
}

// Bank Deposit
export interface BankDeposit {
    id: string;
    amount: number;
    termMonths: number; // 1 to 6
    interestRate: number; // monthly rate (e.g. 0.01 for 1%)
    startDate: string; // ISO date
    isSettled?: boolean; // If true, it's history
}

// Spaced Repetition Item
export interface ReviewItem {
    skillId: string;
    questionText: string;
    correctAnswer: string;
    nextReviewDate: string;  // YYYY-MM-DD
    interval: number;        // days: 1, 3, 7, 14, 30
    wrongCount: number;
}

export type ProgressData = {
    skills: Record<SkillId, MasteryState>;
    overallStreak: number;
    lastSessionDate: string | null;
    lastSessionCount: number;
    lastSessionScore: number;
    totalScore: number;
    bestTimeSeconds: number;
    totalTimeMinutes: number;
    updatedAt: string;

    // Economy
    balance: number;
    savings: number;
    savingsGoal?: SavingsGoal;
    bankDeposits?: BankDeposit[];
    transactions?: Transaction[];
    lastDailyReward?: string;
    attendanceStreak?: number;
    inventory: InventoryItem[];

    // Spaced Repetition
    reviewQueue?: ReviewItem[];

    // Daily Streak
    dailyStreak?: number;
    lastStudyDate?: string;    // YYYY-MM-DD
    longestStreak?: number;

    // Badges
    badges?: string[];
};

export interface UserProfile {
    id: string;
    name: string;
    pin?: string; // Optional secret code
    avatar?: string; // Emoji or URL
    isPublic?: boolean; // Show on leaderboard
    grade?: number; // 2, 3...
    progress: ProgressData;
}

export interface ParentProfile {
    id: string;
    name: string;
    pin: string; // 4-digit pin
    childrenIds: string[]; // List of profile.ids they manage
}

export interface AdminAccount {
    username: string;
    pin: string;
    displayName?: string;
    updatedAt?: string;
}

export interface AppStorage {
    profiles: UserProfile[];
    parents?: ParentProfile[]; // Made optional for backward compatibility
    customContentLibrary?: ContentLibrary;
    activeProfileId: string | null;
    lastActive?: number; // Timestamp for session timeout
    familyCredentials?: {
        username: string;
        pin: string;
    };
    adminAccount?: AdminAccount;
    activeSession?: {
        deviceId: string;
        lastSeen: number; // timestamp ms
    } | null;
}

export const INITIAL_PROGRESS = (): ProgressData => {
    const skills: Record<string, MasteryState> = {};
    Object.keys(SKILL_MAP).forEach((id) => {
        skills[id] = INITIAL_MASTERY(id as SkillId);
    });
    return {
        skills: skills as Record<SkillId, MasteryState>,
        overallStreak: 0,
        lastSessionDate: null,
        lastSessionCount: 0,
        lastSessionScore: 0,
        totalScore: 0,
        bestTimeSeconds: 999999,
        totalTimeMinutes: 0,
        updatedAt: new Date().toISOString(),

        // Economy
        balance: 20000,
        savings: 0,
        savingsGoal: undefined,
        transactions: [],
        lastDailyReward: undefined,
        attendanceStreak: 0,
        inventory: [],

        // Spaced Repetition
        reviewQueue: [],

        // Daily Streak
        dailyStreak: 0,
        lastStudyDate: undefined,
        longestStreak: 0,

        // Badges
        badges: []
    };
};

export const INITIAL_MASTERY = (skillId: SkillId): MasteryState => ({
    skillId,
    mastery: 0,
    stability: 0,
    lastSeen: new Date(0).toISOString(),
    lastCorrect: null,
    attempts: 0,
    correctCount: 0,
    wrongStreak: 0,
    streak: 0,
    level: 1,
});

export function updateMastery(current: MasteryState, isCorrect: boolean): MasteryState {
    const now = new Date().toISOString();
    const next = { ...current, lastSeen: now, attempts: current.attempts + 1 };

    if (isCorrect) {
        // EMA: Current Mastery + 10% of remaining to 1.0
        next.mastery = Math.min(1, current.mastery + (1 - current.mastery) * 0.15);
        next.correctCount += 1;
        next.wrongStreak = 0;
        next.streak += 1;
        next.lastCorrect = now;

        // Stability logic: increase if it's a new day and already decent mastery
        const lastDate = current.lastCorrect ? current.lastCorrect.split('T')[0] : '';
        const today = now.split('T')[0];
        if (lastDate !== today && current.mastery > 0.5) {
            next.stability = Math.min(5, current.stability + 1);
        }
    } else {
        // Penalty: reduce mastery and stability
        next.mastery = Math.max(0, current.mastery * 0.75);
        next.wrongStreak += 1;
        next.streak = 0;
        next.stability = Math.max(0, current.stability - 1);
    }

    // Leveling Logic (Simple)
    // Level up if mastery is high and stability is good
    if (next.mastery > 0.9 && next.stability >= 3 && next.level < 6) {
        next.level += 1;
        next.stability = 1; // Reset stability on new level
        next.mastery = 0.5; // Reset mastery slightly to avoid rapid leveling
    }

    // Level down if stuck (too many wrong in a row)
    if (next.wrongStreak >= 3 && next.level > 1) {
        next.level -= 1;
        next.stability = 0;
        next.mastery = 0.7; // Give them a confidence boost at lower level
        next.wrongStreak = 0;
    }

    return next;
}

export function getMasteryLabel(state: MasteryState | undefined): string {
    if (!state) return 'Cần luyện';
    if (state.mastery >= 0.86 && state.stability >= 3) return 'Vững';
    if (state.mastery >= 0.70) return 'Khá';
    if (state.mastery >= 0.50) return 'Đang lên';
    return 'Cần luyện';
}

export function getOverallRank(progress: ProgressData | undefined) {
    if (!progress || !progress.skills) return { label: 'Tập sự', icon: '🐣', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-300' };
    const skills = Object.values(progress.skills);
    if (skills.length === 0) return { label: 'Tập sự', icon: '🐣', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-300' };
    const avgMastery = skills.reduce((acc, s) => acc + s.mastery, 0) / skills.length;
    const countVung = skills.filter(s => getMasteryLabel(s) === 'Vững').length;

    if (countVung >= 10 || avgMastery > 0.85) return { label: 'Trạng Nguyên', icon: '🏆', color: 'text-amber-800', bg: 'bg-yellow-100', border: 'border-yellow-300' };
    if (countVung >= 5 || avgMastery > 0.65) return { label: 'Chuyên Gia', icon: '🧠', color: 'text-indigo-900', bg: 'bg-indigo-100', border: 'border-indigo-300' };
    if (countVung >= 2 || avgMastery > 0.4) return { label: 'Chiến Binh', icon: '⚔️', color: 'text-blue-900', bg: 'bg-blue-100', border: 'border-blue-300' };
    if (avgMastery > 0.1) return { label: 'Người tìm kiếm', icon: '🕵️', color: 'text-emerald-900', bg: 'bg-emerald-100', border: 'border-emerald-300' };
    return { label: 'Tập sự', icon: '🐣', color: 'text-slate-800', bg: 'bg-slate-100', border: 'border-slate-300' };
}

// NOTE: getSubjectScore was removed from here to avoid duplication.
// Use the canonical version from '@/lib/scoring' instead.

// === DAILY STREAK ===
export function updateDailyStreak(progress: ProgressData): ProgressData {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = progress.lastStudyDate;

    // Đã học hôm nay rồi → không đổi
    if (lastDate === today) return progress;

    let newStreak = 1;
    if (lastDate) {
        const last = new Date(lastDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            // Ngày liên tiếp → +1
            newStreak = (progress.dailyStreak || 0) + 1;
        } else {
            // Bỏ ngày → reset
            newStreak = 1;
        }
    }

    return {
        ...progress,
        dailyStreak: newStreak,
        lastStudyDate: today,
        longestStreak: Math.max(newStreak, progress.longestStreak || 0)
    };
}
