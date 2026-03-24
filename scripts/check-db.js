const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyekmezopqzokqwstxkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZWttZXpvcHF6b2txd3N0eGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTM2MzMsImV4cCI6MjA4NTU4OTYzM30.C9oBwgGvMnwX0ZmdYR8y7R0EHSDg2cccNv2DusGCfTA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
    console.log("Fetching math_progress...");
    const { data: progressData, error: progressError } = await supabase
        .from('math_progress')
        .select('*');

    if (progressError) {
        console.error("Error fetching math_progress:", progressError);
        return;
    }

    console.log(`Found ${progressData.length} records in math_progress.`);
    for (const row of progressData) {
        console.log(`\n--- ID: ${row.id} --- updated_at: ${row.updated_at}`);
        const storage = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
        if (storage && storage.profiles) {
            for (const p of storage.profiles) {
                console.log(`Profile: ${p.name} (ID: ${p.id})`);
                console.log(` - Total Score: ${p.progress?.totalScore}`);
                console.log(` - Last Active: ${storage.lastActive ? new Date(storage.lastActive).toISOString() : 'N/A'}`);
            }
        }
    }

    console.log("\nFetching leaderboard...");
    const { data: lbData, error: lbError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_score', { ascending: false });

    if (lbError) {
        console.error("Error fetching leaderboard:", lbError);
        return;
    }

    console.log(`\nFound ${lbData.length} records in leaderboard.`);
    for (const row of lbData) {
        console.log(`${row.name}: ${row.total_score} pts (ID: ${row.id})`);
    }
}

checkDb();
