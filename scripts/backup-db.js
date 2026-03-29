const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const fs = require("fs");
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

async function backupDb() {
    const [mathProgressResult, leaderboardResult] = await Promise.all([
        supabase.from("math_progress").select("*").order("updated_at", { ascending: false }),
        supabase.from("leaderboard").select("*").order("updated_at", { ascending: false }),
    ]);

    if (mathProgressResult.error) {
        throw mathProgressResult.error;
    }

    if (leaderboardResult.error) {
        throw leaderboardResult.error;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.resolve(process.cwd(), "backups");
    fs.mkdirSync(backupDir, { recursive: true });

    const backupPath = path.join(backupDir, `supabase-backup-${timestamp}.json`);
    fs.writeFileSync(
        backupPath,
        JSON.stringify(
            {
                createdAt: new Date().toISOString(),
                math_progress: mathProgressResult.data || [],
                leaderboard: leaderboardResult.data || [],
            },
            null,
            2
        )
    );

    console.log(`Backup written to ${backupPath}`);
    console.log(`math_progress rows: ${(mathProgressResult.data || []).length}`);
    console.log(`leaderboard rows: ${(leaderboardResult.data || []).length}`);
}

backupDb().catch((error) => {
    console.error("Backup failed:", error);
    process.exit(1);
});
