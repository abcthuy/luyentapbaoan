import { NextRequest, NextResponse } from "next/server";
import type { AppStorage } from "@/lib/mastery";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { syncStorageToDatabase } from "@/lib/server/account/sync";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            storage?: AppStorage;
        } | null;

        const syncId = body?.syncId?.trim() || "";
        if (!syncId || !body?.storage) {
            return NextResponse.json({ error: "Missing sync payload" }, { status: 400 });
        }

        const normalized = sanitizeStorage(body.storage);
        const saved = await syncStorageToDatabase(syncId, normalized);

        return NextResponse.json({ success: true, storage: saved });
    } catch (error) {
        console.error("Account sync failed:", error);
        return NextResponse.json({ error: "Failed to sync account" }, { status: 500 });
    }
}
