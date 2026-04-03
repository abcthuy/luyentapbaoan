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

export interface SavingsGoal {
    name: string;
    targetAmount: number;
    currentAmount: number;
    image?: string; // Emoji
}

export interface BankDeposit {
    id: string;
    amount: number;
    termMonths: number;
    interestRate: number;
    startDate: string;
    isSettled?: boolean;
}

export interface ReviewItem {
    skillId: string;
    questionText: string;
    correctAnswer: string;
    nextReviewDate: string;
    interval: number;
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
    balance: number;
    savings: number;
    savingsGoal?: SavingsGoal;
    bankDeposits?: BankDeposit[];
    transactions?: Transaction[];
    lastDailyReward?: string;
    attendanceStreak?: number;
    inventory: InventoryItem[];
    reviewQueue?: ReviewItem[];
    dailyStreak?: number;
    lastStudyDate?: string;
    longestStreak?: number;
    badges?: string[];
};

export interface UserProfile {
    id: string;
    name: string;
    pin?: string;
    avatar?: string;
    isPublic?: boolean;
    grade?: number;
    progress: ProgressData;
}

export interface ParentAccount {
    id: string;
    name: string;
    pin: string;
    displayOrder?: number;
    status?: "active" | "disabled";
    createdAt?: string;
    updatedAt?: string;
}

export interface ParentChildLink {
    id: string;
    parentId: string;
    childId: string;
    childSyncId?: string;
    assignedAt?: string;
}

export interface AdminAccount {
    username: string;
    pin: string;
    displayName?: string;
    updatedAt?: string;
}

export interface AppStorage {
    profiles: UserProfile[];
    parentAccounts?: ParentAccount[];
    parentChildLinks?: ParentChildLink[];
    deletedProfileIds?: string[];
    deletedParentKeys?: string[];
    // Legacy local content cache. New question content should live in DB question_bank.
    customContentLibrary?: ContentLibrary;
    activeProfileId: string | null;
    lastActive?: number;
    familyCredentials?: {
        username: string;
        pin: string;
    };
    adminAccount?: AdminAccount;
    activeSession?: {
        deviceId: string;
        lastSeen: number;
    } | null;
    loginSecurity?: {
        failedAttempts: number;
        lockedUntil?: number | null;
        lastFailedAt?: number | null;
    };
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
        balance: 20000,
        savings: 0,
        savingsGoal: undefined,
        transactions: [],
        lastDailyReward: undefined,
        attendanceStreak: 0,
        inventory: [],
        reviewQueue: [],
        dailyStreak: 0,
        lastStudyDate: undefined,
        longestStreak: 0,
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
        next.mastery = Math.min(1, current.mastery + (1 - current.mastery) * 0.15);
        next.correctCount += 1;
        next.wrongStreak = 0;
        next.streak += 1;
        next.lastCorrect = now;

        const lastDate = current.lastCorrect ? current.lastCorrect.split('T')[0] : '';
        const today = now.split('T')[0];
        if (lastDate !== today && current.mastery > 0.5) {
            next.stability = Math.min(5, current.stability + 1);
        }
    } else {
        next.mastery = Math.max(0, current.mastery * 0.85);
        next.wrongStreak += 1;
        next.streak = 0;
        next.stability = Math.max(0, current.stability - 1);
    }

    if (next.mastery > 0.9 && next.stability >= 3 && next.level < 6) {
        next.level += 1;
        next.stability = 1;
        next.mastery = 0.5;
    }

    if (next.wrongStreak >= 5 && next.level > 1) {
        next.level -= 1;
        next.stability = 0;
        next.mastery = 0.7;
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

export function updateDailyStreak(progress: ProgressData): ProgressData {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = progress.lastStudyDate;

    if (lastDate === today) return progress;

    let newStreak = 1;
    if (lastDate) {
        const last = new Date(lastDate);
        const now = new Date(today);
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            newStreak = (progress.dailyStreak || 0) + 1;
        } else {
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
