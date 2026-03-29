import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function getServerSupabase() {
    const key = serviceRoleKey || anonKey;
    if (!supabaseUrl || !key) {
        throw new Error("Missing Supabase server credentials.");
    }

    return createClient(supabaseUrl, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}

export function hasServiceRoleKey() {
    return Boolean(serviceRoleKey);
}
