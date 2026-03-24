
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function dumpAccounts() {
    const { data, error } = await supabase
        .from('math_progress')
        .select('id, data');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log('--- ACCOUNT DUMP START ---');
    data.forEach(row => {
        let appData = row.data;
        if (typeof appData === 'string') {
            try { appData = JSON.parse(appData); } catch (e) { }
        }
        const parentsCount = appData?.parents?.length || 0;
        const profilesCount = appData?.profiles?.length || 0;
        const profilesNames = appData?.profiles?.map(p => p.name).join(', ') || 'None';
        
        console.log(`ID: ${row.id} | Profiles: ${profilesCount} (${profilesNames}) | Parents: ${parentsCount}`);
    });
    console.log('--- ACCOUNT DUMP END ---');
}

dumpAccounts();
