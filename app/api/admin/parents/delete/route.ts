import { NextRequest, NextResponse } from "next/server";
import type { AppStorage } from "@/lib/mastery";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import { fetchMathProgressRow, saveMathProgressRow } from "@/lib/server/math-progress-admin";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

function matchesParent(parent: { id: string; name: string; pin: string }, parentId?: string, parentName?: string, parentPin?: string) {
    if (parentId && parent.id === parentId) return true;
    if (!parentName || !parentPin) return false;
    return parent.name.trim().toLowerCase() === parentName.trim().toLowerCase() && String(parent.pin).trim() === parentPin.trim();
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            parentId?: string;
            parentName?: string;
            parentPin?: string;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const parentId = body?.parentId?.trim();
        const parentName = body?.parentName?.trim();
        const parentPin = body?.parentPin?.trim();

        if (!syncId || !username || !pin || (!parentId && !(parentName && parentPin))) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = getServerSupabase();
        const { data, error } = await supabase.from("math_progress").select("id, data");
        if (error) throw error;

        let updatedRows = 0;
        for (const row of (data || []) as { id: string; data: unknown }[]) {
            const storage = sanitizeStorage(row.data as AppStorage);
            const matchedParents = (storage.parentAccounts || []).filter((parent) => matchesParent(parent, parentId, parentName, parentPin));
            if (matchedParents.length === 0) continue;

            const matchedIds = new Set(matchedParents.map((parent) => parent.id));
            const nextStorage = sanitizeStorage({
                ...storage,
                parentAccounts: (storage.parentAccounts || []).filter((parent) => !matchedIds.has(parent.id)),
                parentChildLinks: (storage.parentChildLinks || []).filter((link) => !matchedIds.has(link.parentId)),
            });

            await saveMathProgressRow(row.id, nextStorage);
            updatedRows += 1;
        }

        return NextResponse.json({ success: true, updatedRows });
    } catch (error) {
        console.error("Admin delete parent failed:", error);
        return NextResponse.json({ error: "Failed to delete parent" }, { status: 500 });
    }
}

