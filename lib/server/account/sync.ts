import type { AppStorage } from "@/lib/mastery";
import { getOverallRank } from "@/lib/mastery";
import { getSubjectScore } from "@/lib/scoring";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

export async function syncStorageToDatabase(syncId: string, storage: AppStorage) {
    const supabase = getServerSupabase();
    const normalized = sanitizeStorage({
        ...storage,
        lastActive: storage.lastActive || Date.now(),
    });

    const { error } = await supabase
        .from("math_progress")
        .upsert({
            id: syncId,
            data: normalized,
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

    return normalized;
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
