import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import {
    fetchMathProgressRow,
    saveMathProgressRow,
    updateProfilePin,
} from "@/lib/server/math-progress-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            targetSyncId?: string;
            username?: string;
            pin?: string;
            profileId?: string;
            newPin?: string;
        } | null;

        const syncId = body?.syncId?.trim();
        const targetSyncId = body?.targetSyncId?.trim() || syncId;
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const profileId = body?.profileId?.trim();
        const newPin = body?.newPin?.trim() || undefined;

        if (!syncId || !targetSyncId || !username || !pin || !profileId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (newPin && newPin.length < 4) {
            return NextResponse.json({ error: "PIN must have at least 4 digits" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storage } = await fetchMathProgressRow(targetSyncId);
        if (!storage.profiles.some((profile) => profile.id === profileId)) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const nextStorage = updateProfilePin(storage, profileId, newPin);
        await saveMathProgressRow(targetSyncId, nextStorage);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin update profile PIN failed:", error);
        return NextResponse.json({ error: "Failed to update profile PIN" }, { status: 500 });
    }
}
