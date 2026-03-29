import { NextRequest, NextResponse } from "next/server";
import type { AppStorage } from "@/lib/mastery";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

export async function GET(req: NextRequest) {
    try {
        const syncId = req.nextUrl.searchParams.get("syncId")?.trim() || "";
        if (!syncId) {
            return NextResponse.json({ error: "Missing syncId" }, { status: 400 });
        }

        const supabase = getServerSupabase();
        const { data, error } = await supabase
            .from("math_progress")
            .select("id, data, updated_at")
            .eq("id", syncId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        return NextResponse.json({
            row: {
                id: data.id,
                data: sanitizeStorage(data.data as AppStorage),
                updated_at: data.updated_at,
            },
        });
    } catch (error) {
        console.error("Account storage API failed:", error);
        return NextResponse.json({ error: "Failed to fetch account storage" }, { status: 500 });
    }
}
