import { NextRequest, NextResponse } from "next/server";
import { getOverallRank, type AppStorage } from "@/lib/mastery";
import { getSubjectScore } from "@/lib/scoring";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { getServerSupabase, hasServiceRoleKey } from "@/lib/server/supabase-admin";

type LeaderboardEntry = {
    id: string;
    name: string;
    total_score: number;
    last_score: number;
    best_time: number;
    tier: string;
    is_public: boolean;
    math_score: number;
    vietnamese_score: number;
    english_score: number;
    finance_score: number;
    updated_at: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();

        if (!syncId || !username || !pin) {
            return NextResponse.json({ error: "Missing admin credentials" }, { status: 400 });
        }

        if (!hasServiceRoleKey()) {
            return NextResponse.json(
                { error: "SUPABASE_SERVICE_ROLE_KEY is required for secure leaderboard sync" },
                { status: 500 }
            );
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getServerSupabase();
        const { data: progressRows, error } = await supabase
            .from("math_progress")
            .select("id, data");

        if (error) {
            throw error;
        }

        const updates: LeaderboardEntry[] = [];

        for (const row of progressRows || []) {
            const storage = sanitizeStorage(row.data as AppStorage);
            for (const profile of storage.profiles) {
                if (profile.isPublic === false) continue;

                const progress = profile.progress;
                const rank = getOverallRank(progress);
                updates.push({
                    id: profile.id,
                    name: profile.name,
                    total_score: progress?.totalScore || 0,
                    last_score: progress?.lastSessionScore || 0,
                    best_time: progress?.bestTimeSeconds || 999999,
                    tier: rank?.label || "Tap su",
                    is_public: true,
                    math_score: getSubjectScore(progress, "math"),
                    vietnamese_score: getSubjectScore(progress, "vietnamese"),
                    english_score: getSubjectScore(progress, "english"),
                    finance_score: getSubjectScore(progress, "finance"),
                    updated_at: new Date().toISOString(),
                });
            }
        }

        const deduped = new Map<string, LeaderboardEntry>();
        for (const entry of updates) {
            const key = entry.name.toLowerCase().trim();
            const existing = deduped.get(key);
            if (!existing || entry.total_score > existing.total_score) {
                deduped.set(key, entry);
            }
        }

        const finalUpdates = Array.from(deduped.values()).filter((entry) => entry.total_score > 0);

        if (finalUpdates.length > 0) {
            const { error: upsertError } = await supabase.from("leaderboard").upsert(finalUpdates);
            if (upsertError) throw upsertError;
        }

        await supabase.from("leaderboard").delete().eq("total_score", 0);

        const { data: allLeaderboard } = await supabase
            .from("leaderboard")
            .select("id, name, total_score")
            .order("total_score", { ascending: false });

        if (allLeaderboard) {
            const bestByName = new Map<string, string>();
            const idsToDelete: string[] = [];
            for (const entry of allLeaderboard) {
                const nameKey = (entry.name || "").toLowerCase().trim();
                if (!nameKey) {
                    idsToDelete.push(entry.id);
                    continue;
                }
                if (!bestByName.has(nameKey)) {
                    bestByName.set(nameKey, entry.id);
                } else {
                    idsToDelete.push(entry.id);
                }
            }

            if (idsToDelete.length > 0) {
                await supabase.from("leaderboard").delete().in("id", idsToDelete);
            }
        }

        return NextResponse.json({ success: true, count: finalUpdates.length });
    } catch (error) {
        console.error("Leaderboard sync API failed:", error);
        return NextResponse.json({ error: "Failed to sync leaderboard" }, { status: 500 });
    }
}
