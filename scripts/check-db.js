const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseStorage(raw) {
    if (!raw) return null;
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }
    return raw;
}

function getProfiles(storage) {
    return Array.isArray(storage?.profiles) ? storage.profiles : [];
}

function getParentAccounts(storage) {
    return Array.isArray(storage?.parentAccounts) ? storage.parentAccounts : [];
}

function getParentChildLinks(storage) {
    return Array.isArray(storage?.parentChildLinks) ? storage.parentChildLinks : [];
}

async function checkDb() {
    console.log("Fetching math_progress...");
    const { data: progressRows, error: progressError } = await supabase
        .from("math_progress")
        .select("id, data, updated_at")
        .order("updated_at", { ascending: false });

    if (progressError) {
        console.error("Error fetching math_progress:", progressError);
        process.exit(1);
    }

    console.log(`Found ${progressRows.length} records in math_progress.`);

    const emptyRecords = [];
    const brokenParentLinks = [];
    const profileToRecord = new Map();

    for (const row of progressRows) {
        const storage = parseStorage(row.data);
        const profiles = getProfiles(storage);

        if (!storage || profiles.length === 0) {
            emptyRecords.push(row.id);
        }

        for (const profile of profiles) {
            profileToRecord.set(profile.id, {
                recordId: row.id,
                name: profile.name,
            });
        }
    }

    for (const row of progressRows) {
        const storage = parseStorage(row.data);
        const parentIds = new Set(getParentAccounts(storage).map((parent) => parent.id));

        for (const link of getParentChildLinks(storage)) {
            if (!parentIds.has(link.parentId)) {
                brokenParentLinks.push({
                    recordId: row.id,
                    parentId: link.parentId,
                    childId: link.childId,
                    problem: "missing-parent-account",
                });
                continue;
            }

            const childInfo = profileToRecord.get(link.childId);
            if (!childInfo) {
                brokenParentLinks.push({
                    recordId: row.id,
                    parentId: link.parentId,
                    childId: link.childId,
                    problem: "missing-profile",
                });
                continue;
            }

            if (link.childSyncId && link.childSyncId !== childInfo.recordId) {
                brokenParentLinks.push({
                    recordId: row.id,
                    parentId: link.parentId,
                    childId: link.childId,
                    targetRecordId: childInfo.recordId,
                    problem: "child-sync-mismatch",
                });
            }
        }
    }

    console.log(`Empty / profile-less records: ${emptyRecords.length}`);
    emptyRecords.forEach((id) => console.log(` - ${id}`));

    console.log("");
    console.log("Fetching leaderboard...");
    const { data: leaderboardRows, error: leaderboardError } = await supabase
        .from("leaderboard")
        .select("id, name, total_score, updated_at")
        .order("total_score", { ascending: false });

    if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
        process.exit(1);
    }

    const duplicatesByName = new Map();
    for (const row of leaderboardRows) {
        const key = (row.name || "").trim().toLowerCase();
        if (!key) continue;
        const entries = duplicatesByName.get(key) || [];
        entries.push(row);
        duplicatesByName.set(key, entries);
    }

    const duplicateGroups = Array.from(duplicatesByName.entries()).filter(([, entries]) => entries.length > 1);

    console.log(`Leaderboard duplicate-name groups: ${duplicateGroups.length}`);
    for (const [nameKey, entries] of duplicateGroups) {
        console.log(` - ${nameKey}: ${entries.map((entry) => `${entry.id}(${entry.total_score})`).join(", ")}`);
    }

    console.log(`Broken parent links: ${brokenParentLinks.length}`);
    for (const issue of brokenParentLinks) {
        console.log(` - record=${issue.recordId} parent=${issue.parentId} child=${issue.childId} issue=${issue.problem}${issue.targetRecordId ? ` target=${issue.targetRecordId}` : ""}`);
    }
}

checkDb().catch((error) => {
    console.error("Unexpected error while checking DB:", error);
    process.exit(1);
});
