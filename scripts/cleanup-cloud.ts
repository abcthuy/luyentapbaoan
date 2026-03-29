import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type LooseStorage = {
    profiles?: Array<{ id: string; name?: string; progress?: { totalScore?: number } }>;
    parentAccounts?: Array<{ id: string; name?: string }>;
    parentChildLinks?: Array<{ id?: string; parentId?: string; childId?: string; childSyncId?: string }>;
    activeProfileId?: string | null;
    parents?: unknown;
};

function parseStorage(data: unknown): LooseStorage | null {
    if (!data) return null;
    if (typeof data === "string") {
        try {
            return JSON.parse(data) as LooseStorage;
        } catch {
            return null;
        }
    }
    return data as LooseStorage;
}

function getProfiles(storage: LooseStorage | null) {
    return Array.isArray(storage?.profiles) ? storage.profiles : [];
}

function getParentAccounts(storage: LooseStorage | null) {
    return Array.isArray(storage?.parentAccounts) ? storage.parentAccounts : [];
}

function getParentChildLinks(storage: LooseStorage | null) {
    return Array.isArray(storage?.parentChildLinks) ? storage.parentChildLinks : [];
}

async function cleanupMathProgress() {
    console.log("Starting math_progress cleanup...");

    let page = 0;
    const pageSize = 100;
    let deletedCount = 0;
    let strippedLegacyCount = 0;
    let repairedLinks = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from("math_progress")
            .select("id, data")
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error("Error fetching data:", error);
            break;
        }

        if (!data || data.length === 0) {
            hasMore = false;
            break;
        }

        const idsToDelete: string[] = [];
        const rowsToRepair: Array<{ id: string; storage: LooseStorage }> = [];

        for (const row of data as Array<{ id: string; data: unknown }>) {
            if (!row.id.startsWith("MATH-")) continue;

            const storage = parseStorage(row.data);
            const profiles = getProfiles(storage);

            if (!storage || profiles.length === 0) {
                idsToDelete.push(row.id);
                continue;
            }

            const profileToRecord = new Set(profiles.map((profile) => profile.id));
            const parentIds = new Set(getParentAccounts(storage).map((parent) => parent.id));
            const nextLinks = getParentChildLinks(storage).filter((link) => {
                const keep = !!link?.parentId && !!link?.childId && parentIds.has(link.parentId) && (!!link.childSyncId || profileToRecord.has(link.childId));
                if (!keep) repairedLinks += 1;
                return keep;
            });

            const hadLegacyParents = Object.prototype.hasOwnProperty.call(storage, "parents");
            const linkChanged = nextLinks.length !== getParentChildLinks(storage).length;

            if (hadLegacyParents || linkChanged) {
                if (hadLegacyParents) strippedLegacyCount += 1;
                const { parents: _legacyParents, ...rest } = storage;
                rowsToRepair.push({
                    id: row.id,
                    storage: {
                        ...rest,
                        parentChildLinks: nextLinks,
                    },
                });
            }
        }

        if (idsToDelete.length > 0) {
            console.log(`Deleting ${idsToDelete.length} empty records...`);
            const { error: deleteError } = await supabase
                .from("math_progress")
                .delete()
                .in("id", idsToDelete);

            if (deleteError) {
                console.error("Error deleting records:", deleteError);
            } else {
                deletedCount += idsToDelete.length;
            }
        }

        for (const row of rowsToRepair) {
            const { error: updateError } = await supabase
                .from("math_progress")
                .update({
                    data: row.storage,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", row.id);

            if (updateError) {
                console.error(`Error repairing parent data for ${row.id}:`, updateError);
            }
        }

        if (data.length < pageSize) {
            hasMore = false;
        } else {
            page++;
        }
    }

    console.log(`math_progress cleanup complete. Deleted ${deletedCount} empty records.`);
    console.log(`Removed legacy parents field from ${strippedLegacyCount} rows.`);
    console.log(`Repaired ${repairedLinks} invalid parent-child links.`);
}

type LeaderboardRow = {
    id: string;
    name: string | null;
    total_score: number | null;
    updated_at?: string | null;
};

async function cleanupLeaderboard() {
    console.log("Starting leaderboard cleanup...");

    const { data, error } = await supabase
        .from("leaderboard")
        .select("id, name, total_score, updated_at")
        .order("total_score", { ascending: false });

    if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
    }

    const idsToDelete = new Set<string>();
    const bestByName = new Map<string, LeaderboardRow>();

    for (const entry of (data || []) as LeaderboardRow[]) {
        const score = entry.total_score || 0;
        const key = (entry.name || "").trim().toLowerCase();

        if (!key || score <= 0) {
            idsToDelete.add(entry.id);
            continue;
        }

        const existing = bestByName.get(key);
        if (!existing) {
            bestByName.set(key, entry);
            continue;
        }

        const existingScore = existing.total_score || 0;
        if (score > existingScore) {
            idsToDelete.add(existing.id);
            bestByName.set(key, entry);
        } else {
            idsToDelete.add(entry.id);
        }
    }

    if (idsToDelete.size === 0) {
        console.log("Leaderboard cleanup complete. Nothing to delete.");
        return;
    }

    const ids = Array.from(idsToDelete);
    const { error: deleteError } = await supabase
        .from("leaderboard")
        .delete()
        .in("id", ids);

    if (deleteError) {
        console.error("Error deleting leaderboard duplicates / empty rows:", deleteError);
        return;
    }

    console.log(`Leaderboard cleanup complete. Deleted ${ids.length} rows.`);
}

async function cleanup() {
    await cleanupMathProgress();
    await cleanupLeaderboard();
}

cleanup().catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
});
