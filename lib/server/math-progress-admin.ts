import type { AppStorage, ParentAccount, UserProfile } from "@/lib/mastery";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

export async function fetchMathProgressRow(syncId: string) {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from("math_progress")
        .select("id, data")
        .eq("id", syncId)
        .single();

    if (error || !data) {
        throw new Error(`Math progress row not found for ${syncId}`);
    }

    return {
        id: data.id,
        storage: sanitizeStorage(data.data as AppStorage),
    };
}

export async function saveMathProgressRow(syncId: string, storage: AppStorage) {
    const supabase = getServerSupabase();
    const nextStorage = sanitizeStorage({
        ...storage,
        lastActive: Date.now(),
    });
    const { error } = await supabase
        .from("math_progress")
        .update({
            data: nextStorage,
            updated_at: new Date().toISOString(),
        })
        .eq("id", syncId);

    if (error) throw error;
}

export async function deleteMathProgressRow(syncId: string) {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("math_progress").delete().eq("id", syncId);
    if (error) throw error;
}

export async function deleteLeaderboardProfile(profileId: string) {
    const supabase = getServerSupabase();
    const { error } = await supabase.from("leaderboard").delete().eq("id", profileId);
    if (error) throw error;
}

export function buildProfileId() {
    return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildParentId() {
    return `pr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildParentChildLinkId() {
    return `pcl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function updateProfilePin(storage: AppStorage, profileId: string, newPin?: string) {
    const profiles = storage.profiles.map((profile) =>
        profile.id === profileId ? { ...profile, pin: newPin } : profile
    );

    return sanitizeStorage({
        ...storage,
        profiles,
    });
}

export function addProfileToStorage(
    storage: AppStorage,
    profile: UserProfile,
    skipAutoLogin = false
) {
    return sanitizeStorage({
        ...storage,
        profiles: [...storage.profiles, profile],
        activeProfileId: skipAutoLogin ? storage.activeProfileId : (storage.activeProfileId || profile.id),
    });
}

export function deleteProfileFromStorage(storage: AppStorage, profileId: string) {
    const profiles = storage.profiles.filter((profile) => profile.id !== profileId);
    const parentChildLinks = (storage.parentChildLinks || []).filter((link) => link.childId !== profileId);

    return sanitizeStorage({
        ...storage,
        profiles,
        parentChildLinks,
        activeProfileId: storage.activeProfileId === profileId ? (profiles[0]?.id || null) : storage.activeProfileId,
    });
}

export function addParentToStorage(storage: AppStorage, parent: ParentAccount) {
    const parentAccounts = [...(storage.parentAccounts || [])].filter((item) => item.id !== parent.id);
    parentAccounts.push(parent);

    return sanitizeStorage({
        ...storage,
        parentAccounts,
    });
}

export function deleteParentFromStorage(storage: AppStorage, parentId: string) {
    return sanitizeStorage({
        ...storage,
        parentAccounts: (storage.parentAccounts || []).filter((parent) => parent.id !== parentId),
        parentChildLinks: (storage.parentChildLinks || []).filter((link) => link.parentId !== parentId),
    });
}

export function assignChildToParentInStorage(storage: AppStorage, parentId: string, childId: string, childSyncId?: string) {
    const scopeSyncId = childSyncId?.trim() || undefined;
    const nextLinks = (storage.parentChildLinks || []).filter((link) => {
        if (link.childId !== childId) return true;
        if (scopeSyncId && link.childSyncId && link.childSyncId !== scopeSyncId) return true;
        return false;
    });

    nextLinks.push({
        id: buildParentChildLinkId(),
        parentId,
        childId,
        childSyncId: scopeSyncId,
        assignedAt: new Date().toISOString(),
    });

    return sanitizeStorage({
        ...storage,
        parentChildLinks: nextLinks,
    });
}

export function unassignChildFromParentInStorage(storage: AppStorage, parentId: string, childId: string, childSyncId?: string) {
    const scopeSyncId = childSyncId?.trim() || undefined;
    return sanitizeStorage({
        ...storage,
        parentChildLinks: (storage.parentChildLinks || []).filter((link) => {
            if (link.parentId !== parentId || link.childId !== childId) return true;
            if (scopeSyncId && link.childSyncId && link.childSyncId !== scopeSyncId) return true;
            return false;
        }),
    });
}
