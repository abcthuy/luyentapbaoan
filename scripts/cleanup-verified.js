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

async function cleanupVerified() {
    const emptyMathProgressIds = ["MATH-7I7K9S2R", "MATH-1HQ2SFKX"];
    const duplicateLeaderboardIds = ["l9hirc", "cq56vf"];
    const parentRecordId = "MATH-755JREQ0";
    const invalidChildId = "gsf9yo";

    console.log("Deleting verified empty math_progress rows...");
    const { error: deleteProgressError } = await supabase
        .from("math_progress")
        .delete()
        .in("id", emptyMathProgressIds);

    if (deleteProgressError) {
        throw deleteProgressError;
    }

    console.log("Deleting verified duplicate leaderboard rows...");
    const { error: deleteLeaderboardError } = await supabase
        .from("leaderboard")
        .delete()
        .in("id", duplicateLeaderboardIds);

    if (deleteLeaderboardError) {
        throw deleteLeaderboardError;
    }

    console.log("Repairing verified parent-child link...");
    const { data: parentRow, error: fetchParentError } = await supabase
        .from("math_progress")
        .select("id, data")
        .eq("id", parentRecordId)
        .single();

    if (fetchParentError) {
        throw fetchParentError;
    }

    const storage =
        typeof parentRow.data === "string" ? JSON.parse(parentRow.data) : parentRow.data || {};

    const updatedParentChildLinks = Array.isArray(storage.parentChildLinks)
        ? storage.parentChildLinks.filter((link) => link.childId !== invalidChildId)
        : [];

    const { parents: _legacyParents, ...rest } = storage;

    const { error: updateParentError } = await supabase
        .from("math_progress")
        .update({
            data: {
                ...rest,
                parentChildLinks: updatedParentChildLinks,
            },
            updated_at: new Date().toISOString(),
        })
        .eq("id", parentRecordId);

    if (updateParentError) {
        throw updateParentError;
    }

    console.log("Verified cleanup completed successfully.");
}

cleanupVerified().catch((error) => {
    console.error("Verified cleanup failed:", error);
    process.exit(1);
});
