import { NextRequest, NextResponse } from "next/server";
import type { ParentAccount } from "@/lib/mastery";
import { verifyPinInput } from "@/lib/pin-hash";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import {
    fetchMathProgressRow,
    saveMathProgressRow,
    unassignChildFromParentInStorage,
} from "@/lib/server/math-progress-admin";

async function findMatchingParent(storage: { parentAccounts?: ParentAccount[] }, parentId?: string, parentName?: string, parentPin?: string) {
    const normalizedName = parentName?.trim().toLowerCase() || "";
    const normalizedPin = parentPin?.trim() || "";

    for (const parent of (storage.parentAccounts || [])) {
        if (parentId && parent.id === parentId) return parent;
        if (!normalizedName || !normalizedPin) continue;
        if (parent.name.trim().toLowerCase() !== normalizedName) continue;
        if (await verifyPinInput(normalizedPin, String(parent.pin))) {
            return parent;
        }
    }

    return null;
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
            childId?: string;
            childSyncId?: string;
        } | null;

        const syncId = body?.syncId?.trim();
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const parentId = body?.parentId?.trim();
        const parentName = body?.parentName?.trim();
        const parentPin = body?.parentPin?.trim();
        const childId = body?.childId?.trim();
        const childSyncId = body?.childSyncId?.trim();

        if (!syncId || !username || !pin || !childId || !childSyncId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storage } = await fetchMathProgressRow(childSyncId);
        const matchedParent = await findMatchingParent(storage, parentId, parentName, parentPin);
        if (!matchedParent) {
            return NextResponse.json({ success: true, skipped: true });
        }

        const nextStorage = unassignChildFromParentInStorage(storage, matchedParent.id, childId, childSyncId);
        await saveMathProgressRow(childSyncId, nextStorage);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin unassign child failed:", error);
        return NextResponse.json({ error: "Failed to unassign child" }, { status: 500 });
    }
}
