import { NextRequest, NextResponse } from "next/server";
import type { ParentAccount } from "@/lib/mastery";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import {
    assignChildToParentInStorage,
    buildParentId,
    fetchMathProgressRow,
    saveMathProgressRow,
} from "@/lib/server/math-progress-admin";

function findMatchingParent(storage: { parentAccounts?: ParentAccount[] }, parentId?: string, parentName?: string, parentPin?: string) {
    const normalizedName = parentName?.trim().toLowerCase() || "";
    const normalizedPin = parentPin?.trim() || "";

    return (storage.parentAccounts || []).find((parent) => {
        if (parentId && parent.id === parentId) return true;
        if (!normalizedName || !normalizedPin) return false;
        return parent.name.trim().toLowerCase() === normalizedName && String(parent.pin).trim() === normalizedPin;
    }) || null;
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

        if (!syncId || !username || !pin || !childId || !childSyncId || !parentName || !parentPin) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storage } = await fetchMathProgressRow(childSyncId);
        const childExists = storage.profiles.some((profile) => profile.id === childId);
        if (!childExists) {
            return NextResponse.json({ error: "Child not found in target account" }, { status: 404 });
        }

        const matchedParent = findMatchingParent(storage, parentId, parentName, parentPin);
        const targetParent = matchedParent || {
            id: buildParentId(),
            name: parentName,
            pin: parentPin,
            status: "active" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const nextStorage = assignChildToParentInStorage(
            matchedParent
                ? storage
                : { ...storage, parentAccounts: [...(storage.parentAccounts || []), targetParent] },
            targetParent.id,
            childId,
            childSyncId
        );
        await saveMathProgressRow(childSyncId, nextStorage);

        return NextResponse.json({ success: true, parentId: targetParent.id, targetSyncId: childSyncId });
    } catch (error) {
        console.error("Admin assign child failed:", error);
        return NextResponse.json({ error: "Failed to assign child" }, { status: 500 });
    }
}

