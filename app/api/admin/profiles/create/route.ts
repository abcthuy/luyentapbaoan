import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PROGRESS, type UserProfile } from "@/lib/mastery";
import { verifyAdminCredentials } from "@/lib/server/admin-auth";
import {
    addProfileToStorage,
    buildProfileId,
    fetchMathProgressRow,
    saveMathProgressRow,
} from "@/lib/server/math-progress-admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            syncId?: string;
            targetSyncId?: string;
            username?: string;
            pin?: string;
            name?: string;
            profilePin?: string;
            avatar?: string;
            grade?: number;
            skipAutoLogin?: boolean;
        } | null;

        const syncId = body?.syncId?.trim();
        const targetSyncId = body?.targetSyncId?.trim() || syncId;
        const username = body?.username?.trim();
        const pin = body?.pin?.trim();
        const name = body?.name?.trim();
        const profilePin = body?.profilePin?.trim() || undefined;
        const avatar = body?.avatar?.trim() || "??";
        const grade = typeof body?.grade === "number" ? body.grade : 2;
        const skipAutoLogin = Boolean(body?.skipAutoLogin);

        if (!syncId || !targetSyncId || !username || !pin || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const isAuthorized = await verifyAdminCredentials({ syncId, username, pin });
        if (!isAuthorized) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { storage } = await fetchMathProgressRow(targetSyncId);
        const profile: UserProfile = {
            id: buildProfileId(),
            name,
            pin: profilePin,
            avatar,
            grade,
            isPublic: true,
            progress: INITIAL_PROGRESS(),
        };

        const nextStorage = addProfileToStorage(storage, profile, skipAutoLogin);
        await saveMathProgressRow(targetSyncId, nextStorage);

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Admin create profile failed:", error);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }
}
