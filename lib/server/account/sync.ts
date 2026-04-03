import type { AppStorage } from "@/lib/mastery";
import { getOverallRank } from "@/lib/mastery";
import { getSubjectScore } from "@/lib/scoring";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { syncCurriculumProgressForStorage } from "@/lib/server/curriculum-progress";
import { getServerSupabase } from "@/lib/server/supabase-admin";
import { mergeAppStorage } from "@/lib/storage-merge";

export async function syncStorageToDatabase(syncId: string, storage: AppStorage) {
    const supabase = getServerSupabase();
    const normalizedIncoming = sanitizeStorage({
        ...storage,
        lastActive: storage.lastActive || Date.now(),
    });

    const { data: existingRow } = await supabase
        .from("math_progress")
        .select("data")
        .eq("id", syncId)
        .maybeSingle();

    const existingStorage = existingRow?.data ? sanitizeStorage(existingRow.data as AppStorage) : null;
    const mergedStorage = existingStorage ? mergeAppStorage(existingStorage, normalizedIncoming) : normalizedIncoming;
    const normalized = sanitizeStorage({
        ...mergedStorage,
        lastActive: Math.max(mergedStorage.lastActive || 0, Date.now()),
    });
    const deletedProfileIds = Array.from(new Set([...(existingStorage?.deletedProfileIds || []), ...(normalized.deletedProfileIds || [])]));
    const deletedParentKeys = Array.from(new Set([...(existingStorage?.deletedParentKeys || []), ...(normalized.deletedParentKeys || [])]));

    const { error } = await supabase
        .from("math_progress")
        .upsert({
            id: syncId,
            data: {
                ...normalized,
                deletedProfileIds,
                deletedParentKeys,
            },
            updated_at: new Date().toISOString(),
        });

    if (error) throw error;

    const publicProfiles = normalized.profiles.filter((profile) => profile.isPublic !== false);
    const entries = publicProfiles.map((profile) => {
        const rank = getOverallRank(profile.progress);
        return {
            id: profile.id,
            name: profile.name,
            total_score: profile.progress.totalScore || 0,
            last_score: profile.progress.lastSessionScore || 0,
            best_time: profile.progress.bestTimeSeconds || 999999,
            tier: rank.label,
            is_public: true,
            math_score: getSubjectScore(profile.progress, "math"),
            vietnamese_score: getSubjectScore(profile.progress, "vietnamese"),
            english_score: getSubjectScore(profile.progress, "english"),
            finance_score: getSubjectScore(profile.progress, "finance"),
            updated_at: new Date().toISOString(),
        };
    });

    if (entries.length > 0) {
        const { error: leaderboardError } = await supabase.from("leaderboard").upsert(entries);
        if (leaderboardError) throw leaderboardError;
    }

    const hiddenOrEmptyIds = normalized.profiles
        .filter((profile) => profile.isPublic === false || (profile.progress.totalScore || 0) <= 0)
        .map((profile) => profile.id);

    if (hiddenOrEmptyIds.length > 0) {
        const { error: deleteLeaderboardError } = await supabase.from("leaderboard").delete().in("id", hiddenOrEmptyIds);
        if (deleteLeaderboardError) throw deleteLeaderboardError;
    }

    if (deletedProfileIds.length > 0) {
        const { error: deletedLeaderboardError } = await supabase.from("leaderboard").delete().in("id", deletedProfileIds);
        if (deletedLeaderboardError) throw deletedLeaderboardError;
    }

    await syncCurriculumProgressForStorage({
        ...normalized,
        deletedProfileIds,
    });

    return sanitizeStorage({
        ...normalized,
        deletedProfileIds,
    });
}

export async function fetchStorage(syncId: string) {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from("math_progress")
        .select("data")
        .eq("id", syncId)
        .single();

    if (error || !data) return null;
    return sanitizeStorage(data.data as AppStorage);
}
