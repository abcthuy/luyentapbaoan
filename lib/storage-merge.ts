import type {
    AppStorage,
    BankDeposit,
    InventoryItem,
    ParentAccount,
    ParentChildLink,
    ProgressData,
    ReviewItem,
    SavingsGoal,
    Transaction,
    UserProfile,
} from '@/lib/mastery';
import { isPinHashed } from '@/lib/pin-hash';

export function mergeAppStorage(primary: AppStorage, secondary: AppStorage): AppStorage {
    const deletedProfileIds = Array.from(new Set([...(primary.deletedProfileIds || []), ...(secondary.deletedProfileIds || [])]));
    const deletedParentKeys = Array.from(new Set([...(primary.deletedParentKeys || []), ...(secondary.deletedParentKeys || [])].map((key) => String(key || '').trim().toLowerCase()).filter(Boolean)));
    const profiles = mergeProfiles(primary.profiles || [], secondary.profiles || []).filter((profile) => !deletedProfileIds.includes(profile.id));
    const profileIds = new Set(profiles.map((profile) => profile.id));
    const parentAccounts = mergeParentAccounts(primary.parentAccounts || [], secondary.parentAccounts || [])
        .filter((parent) => !deletedParentKeys.includes(buildParentMatchKey(parent)));
    const validParentIds = new Set(parentAccounts.map((parent) => parent.id));
    const parentChildLinks = mergeParentChildLinks(primary.parentChildLinks || [], secondary.parentChildLinks || [])
        .filter((link) => !deletedProfileIds.includes(link.childId) && validParentIds.has(link.parentId));

    return {
        ...primary,
        ...secondary,
        profiles,
        deletedProfileIds,
        deletedParentKeys,
        parentAccounts,
        parentChildLinks,
        customContentLibrary: secondary.customContentLibrary || primary.customContentLibrary,
        activeProfileId: resolveActiveProfileId(primary.activeProfileId, secondary.activeProfileId, profileIds),
        lastActive: Math.max(primary.lastActive || 0, secondary.lastActive || 0),
        familyCredentials: mergeFamilyCredentials(primary.familyCredentials, secondary.familyCredentials),
        adminAccount: mergeAdminAccount(primary.adminAccount, secondary.adminAccount),
        activeSession: resolveActiveSession(primary.activeSession, secondary.activeSession),
    };
}

function mergeFamilyCredentials(primary?: AppStorage['familyCredentials'], secondary?: AppStorage['familyCredentials']) {
    if (!primary) return secondary;
    if (!secondary) return primary;

    const primaryPin = String(primary.pin || '').trim();
    const secondaryPin = String(secondary.pin || '').trim();

    return {
        ...primary,
        ...secondary,
        pin: choosePreferredPin(primaryPin, secondaryPin),
    };
}

function mergeAdminAccount(primary?: AppStorage['adminAccount'], secondary?: AppStorage['adminAccount']) {
    if (!primary) return secondary;
    if (!secondary) return primary;

    const primaryUpdated = Date.parse(primary.updatedAt || '') || 0;
    const secondaryUpdated = Date.parse(secondary.updatedAt || '') || 0;
    const preferred = secondaryUpdated >= primaryUpdated ? secondary : primary;
    const fallback = preferred === secondary ? primary : secondary;

    return {
        ...fallback,
        ...preferred,
        pin: choosePreferredPin(String(primary.pin || '').trim(), String(secondary.pin || '').trim()),
    };
}

function choosePreferredPin(primaryPin: string, secondaryPin: string) {
    if (isPinHashed(secondaryPin) && !isPinHashed(primaryPin)) return secondaryPin;
    if (primaryPin) return primaryPin;
    return secondaryPin;
}

function mergeProfiles(primary: UserProfile[], secondary: UserProfile[]): UserProfile[] {
    const byId = new Map<string, UserProfile>();

    [...primary, ...secondary].forEach((profile) => {
        const existing = byId.get(profile.id);
        if (!existing) {
            byId.set(profile.id, profile);
            return;
        }

        byId.set(profile.id, mergeProfile(existing, profile));
    });

    return Array.from(byId.values());
}

function mergeProfile(primary: UserProfile, secondary: UserProfile): UserProfile {
    const primaryUpdated = Date.parse(primary.progress?.updatedAt || '') || 0;
    const secondaryUpdated = Date.parse(secondary.progress?.updatedAt || '') || 0;
    const preferred = secondaryUpdated >= primaryUpdated ? secondary : primary;
    const fallback = preferred === secondary ? primary : secondary;

    return {
        ...fallback,
        ...preferred,
        pin: preferred.pin || fallback.pin,
        avatar: preferred.avatar || fallback.avatar,
        isPublic: typeof preferred.isPublic === 'boolean' ? preferred.isPublic : fallback.isPublic,
        grade: preferred.grade || fallback.grade,
        progress: mergeProgress(primary.progress, secondary.progress),
    };
}

function mergeProgress(primary: ProgressData, secondary: ProgressData): ProgressData {
    const primaryUpdated = Date.parse(primary.updatedAt || '') || 0;
    const secondaryUpdated = Date.parse(secondary.updatedAt || '') || 0;
    const preferred = secondaryUpdated >= primaryUpdated ? secondary : primary;
    const fallback = preferred === secondary ? primary : secondary;

    return {
        ...fallback,
        ...preferred,
        skills: mergeSkillStates(primary.skills || {}, secondary.skills || {}),
        overallStreak: Math.max(primary.overallStreak || 0, secondary.overallStreak || 0),
        lastSessionDate: maxIsoDate(primary.lastSessionDate, secondary.lastSessionDate) ?? null,
        lastSessionCount: Math.max(primary.lastSessionCount || 0, secondary.lastSessionCount || 0),
        lastSessionScore: Math.max(primary.lastSessionScore || 0, secondary.lastSessionScore || 0),
        totalScore: Math.max(primary.totalScore || 0, secondary.totalScore || 0),
        bestTimeSeconds: minPositive(primary.bestTimeSeconds, secondary.bestTimeSeconds),
        totalTimeMinutes: Math.max(primary.totalTimeMinutes || 0, secondary.totalTimeMinutes || 0),
        updatedAt: maxIsoDate(primary.updatedAt, secondary.updatedAt) || new Date().toISOString(),
        balance: Math.max(primary.balance || 0, secondary.balance || 0),
        savings: Math.max(primary.savings || 0, secondary.savings || 0),
        savingsGoal: mergeSavingsGoal(primary.savingsGoal, secondary.savingsGoal),
        bankDeposits: mergeById(primary.bankDeposits || [], secondary.bankDeposits || []),
        transactions: mergeTransactions(primary.transactions || [], secondary.transactions || []),
        lastDailyReward: maxIsoDate(primary.lastDailyReward, secondary.lastDailyReward),
        attendanceStreak: Math.max(primary.attendanceStreak || 0, secondary.attendanceStreak || 0),
        inventory: mergeInventory(primary.inventory || [], secondary.inventory || []),
        reviewQueue: mergeReviewQueue(primary.reviewQueue || [], secondary.reviewQueue || []),
        dailyStreak: Math.max(primary.dailyStreak || 0, secondary.dailyStreak || 0),
        lastStudyDate: maxIsoDate(primary.lastStudyDate, secondary.lastStudyDate),
        longestStreak: Math.max(primary.longestStreak || 0, secondary.longestStreak || 0),
        badges: Array.from(new Set([...(primary.badges || []), ...(secondary.badges || [])])),
    };
}

function mergeSkillStates(primary: ProgressData['skills'], secondary: ProgressData['skills']): ProgressData['skills'] {
    const allSkillIds = new Set([...Object.keys(primary), ...Object.keys(secondary)]);
    const merged: ProgressData['skills'] = {};

    allSkillIds.forEach((skillId) => {
        const a = primary[skillId];
        const b = secondary[skillId];
        if (!a) {
            merged[skillId] = b;
            return;
        }
        if (!b) {
            merged[skillId] = a;
            return;
        }

        const aSeen = Date.parse(a.lastSeen || '') || 0;
        const bSeen = Date.parse(b.lastSeen || '') || 0;
        const preferred = bSeen >= aSeen ? b : a;
        const fallback = preferred === b ? a : b;

        merged[skillId] = {
            ...fallback,
            ...preferred,
            mastery: Math.max(a.mastery || 0, b.mastery || 0),
            stability: Math.max(a.stability || 0, b.stability || 0),
            lastSeen: maxIsoDate(a.lastSeen, b.lastSeen) || preferred.lastSeen,
            lastCorrect: maxIsoDate(a.lastCorrect, b.lastCorrect) ?? null,
            attempts: Math.max(a.attempts || 0, b.attempts || 0),
            correctCount: Math.max(a.correctCount || 0, b.correctCount || 0),
            wrongStreak: preferred.wrongStreak,
            streak: Math.max(a.streak || 0, b.streak || 0),
            level: Math.max(a.level || 1, b.level || 1),
        };
    });

    return merged;
}

function mergeSavingsGoal(primary?: SavingsGoal, secondary?: SavingsGoal): SavingsGoal | undefined {
    if (!primary) return secondary;
    if (!secondary) return primary;
    return {
        ...primary,
        ...secondary,
        currentAmount: Math.max(primary.currentAmount || 0, secondary.currentAmount || 0),
        targetAmount: Math.max(primary.targetAmount || 0, secondary.targetAmount || 0),
    };
}

function mergeInventory(primary: InventoryItem[], secondary: InventoryItem[]): InventoryItem[] {
    const byId = new Map<string, InventoryItem>();
    [...primary, ...secondary].forEach((item) => {
        const existing = byId.get(item.id);
        if (!existing) {
            byId.set(item.id, item);
            return;
        }

        const existingTime = Date.parse(existing.purchaseDate || '') || 0;
        const itemTime = Date.parse(item.purchaseDate || '') || 0;
        byId.set(item.id, itemTime >= existingTime ? { ...existing, ...item } : { ...item, ...existing });
    });
    return Array.from(byId.values());
}

function mergeTransactions(primary: Transaction[], secondary: Transaction[]): Transaction[] {
    return mergeById(primary, secondary)
        .sort((a, b) => (Date.parse(b.date || '') || 0) - (Date.parse(a.date || '') || 0));
}

function mergeReviewQueue(primary: ReviewItem[], secondary: ReviewItem[]): ReviewItem[] {
    const byKey = new Map<string, ReviewItem>();
    [...primary, ...secondary].forEach((item) => {
        const key = `${item.skillId}::${item.questionText}`;
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, item);
            return;
        }

        const existingTime = Date.parse(existing.nextReviewDate || '') || 0;
        const itemTime = Date.parse(item.nextReviewDate || '') || 0;
        const preferred = itemTime <= existingTime ? item : existing;
        byKey.set(key, {
            ...existing,
            ...item,
            nextReviewDate: preferred.nextReviewDate,
            interval: Math.min(existing.interval || 1, item.interval || 1),
            wrongCount: Math.max(existing.wrongCount || 0, item.wrongCount || 0),
        });
    });

    return Array.from(byKey.values()).sort((a, b) => (Date.parse(a.nextReviewDate || '') || 0) - (Date.parse(b.nextReviewDate || '') || 0));
}

function mergeParentAccounts(primary: ParentAccount[], secondary: ParentAccount[]): ParentAccount[] {
    return mergeById(primary, secondary);
}

function mergeParentChildLinks(primary: ParentChildLink[], secondary: ParentChildLink[]): ParentChildLink[] {
    const byKey = new Map<string, ParentChildLink>();
    [...primary, ...secondary].forEach((link) => {
        const key = `${link.parentId}::${link.childId}::${link.childSyncId || ''}`;
        if (!byKey.has(key)) {
            byKey.set(key, link);
        }
    });
    return Array.from(byKey.values());
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
    const byId = new Map<string, T>();
    [...primary, ...secondary].forEach((item) => {
        const existing = byId.get(item.id);
        byId.set(item.id, existing ? { ...existing, ...item } : item);
    });
    return Array.from(byId.values());
}

function resolveActiveProfileId(primaryId: string | null, secondaryId: string | null, profileIds: Set<string>) {
    if (secondaryId && profileIds.has(secondaryId)) return secondaryId;
    if (primaryId && profileIds.has(primaryId)) return primaryId;
    return null;
}

function resolveActiveSession(primary?: AppStorage['activeSession'], secondary?: AppStorage['activeSession']) {
    if (!primary) return secondary;
    if (!secondary) return primary;
    return (secondary.lastSeen || 0) >= (primary.lastSeen || 0) ? secondary : primary;
}

function maxIsoDate(a?: string | null, b?: string | null): string | undefined {
    const aTime = a ? Date.parse(a) || 0 : 0;
    const bTime = b ? Date.parse(b) || 0 : 0;
    if (!a && !b) return undefined;
    return bTime >= aTime ? (b || undefined) : (a || undefined);
}

function minPositive(a?: number | null, b?: number | null) {
    const values = [a, b].filter((value): value is number => typeof value === 'number' && value > 0);
    if (values.length === 0) return 999999;
    return Math.min(...values);
}

function buildParentMatchKey(parent: Pick<ParentAccount, 'name' | 'pin'>) {
    return `${parent.name.trim().toLowerCase()}::${String(parent.pin).trim()}`;
}
