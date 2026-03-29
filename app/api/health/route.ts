import { NextResponse } from "next/server";
import { hasServiceRoleKey } from "@/lib/server/supabase-admin";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
    return NextResponse.json({
        ok: true,
        timestamp: new Date().toISOString(),
        checks: {
            supabaseClientConfigured: isSupabaseConfigured,
            serviceRoleConfigured: hasServiceRoleKey(),
            geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        },
    });
}
