import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

function parseStorage(input: unknown) {
    if (!input) return {} as Record<string, unknown>;
    if (typeof input === "string") {
        try {
            return JSON.parse(input) as Record<string, unknown>;
        } catch {
            return {} as Record<string, unknown>;
        }
    }
    return (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
}

async function main() {
    const { data, error } = await supabase.from("math_progress").select("id, data").order("updated_at", { ascending: false });
    if (error) throw error;

    const rows = (data || []) as { id: string; data: unknown }[];
    const summary = rows.map((row) => {
        const storage = parseStorage(row.data);
        return {
            id: row.id,
            profiles: Array.isArray(storage.profiles) ? storage.profiles.length : 0,
            parentAccounts: Array.isArray(storage.parentAccounts) ? storage.parentAccounts.length : 0,
            parentChildLinks: Array.isArray(storage.parentChildLinks) ? storage.parentChildLinks.length : 0,
            hasLegacyParentsField: Object.keys(storage).includes("parents"),
        };
    });

    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    console.error("Parent data check failed:", error);
    process.exit(1);
});


