import { NextResponse } from "next/server";
import type { AppStorage } from "@/lib/mastery";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

export async function GET() {
    try {
        const supabase = getServerSupabase();
        const { data, error } = await supabase
            .from("math_progress")
            .select("id, data")
            .order("updated_at", { ascending: false });

        if (error) throw error;

        const rows = (data || []).map((row) => ({
            id: row.id,
            data: sanitizeStorage(row.data as AppStorage),
        }));

        return NextResponse.json({ rows });
    } catch (error) {
        console.error("Account list API failed:", error);
        return NextResponse.json({ error: "Failed to fetch account list" }, { status: 500 });
    }
}
