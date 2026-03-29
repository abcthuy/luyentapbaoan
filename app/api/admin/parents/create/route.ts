import { NextRequest, NextResponse } from "next/server";
import type { ParentAccount } from "@/lib/mastery";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import {
    addParentToStorage,
    buildParentId,
    fetchMathProgressRow,
    saveMathProgressRow,
} from "@/lib/server/math-progress-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            username?: string;
            pin?: string;
            name?: string;
            parentPin?: string;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const name = body?.name?.trim();
        const parentPin = body?.parentPin?.trim();

        if (!syncId || !username || !pin || !name || !parentPin) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (parentPin.length < 4) {
            return NextResponse.json({ error: "PIN must have at least 4 digits" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storage } = await fetchMathProgressRow(syncId);
        const parent: ParentAccount = {
            id: buildParentId(),
            name,
            pin: parentPin,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const nextStorage = addParentToStorage(storage, parent);
        await saveMathProgressRow(syncId, nextStorage);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin create parent failed:", error);
        return NextResponse.json({ error: "Failed to create parent" }, { status: 500 });
    }
}
