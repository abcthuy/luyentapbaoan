import { NextRequest, NextResponse } from "next/server";
import { INITIAL_PROGRESS, type AppStorage, type UserProfile } from "@/lib/mastery";
import { fetchStorage, syncStorageToDatabase } from "@/lib/server/account/sync";

const AVATARS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function getRandomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            username?: string;
            pin?: string;
            name?: string;
        } | null;

        const cleanUsername = body?.username?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "";
        const pin = body?.pin?.trim() || "";
        const name = body?.name?.trim() || "";

        if (cleanUsername.length < 3 || pin.length < 4 || !name) {
            return NextResponse.json({ error: "Invalid register payload" }, { status: 400 });
        }

        const syncId = `USER-${cleanUsername}`;
        const existing = await fetchStorage(syncId);
        if (existing) {
            return NextResponse.json({ error: "Ten dang nhap da duoc su dung." }, { status: 409 });
        }

        const newProfile: UserProfile = {
            id: `p-${Date.now()}`,
            name,
            avatar: getRandomAvatar(),
            grade: 2,
            isPublic: true,
            progress: INITIAL_PROGRESS(),
        };

        const storage: AppStorage = {
            profiles: [newProfile],
            activeProfileId: newProfile.id,
            lastActive: Date.now(),
            familyCredentials: {
                username: cleanUsername,
                pin,
            },
            adminAccount: {
                username: "admin",
                pin,
                displayName: "Quan tri vien",
                updatedAt: new Date().toISOString(),
            },
        };

        await syncStorageToDatabase(syncId, storage);

        return NextResponse.json({
            success: true,
            syncId,
            username: body?.username?.trim() || cleanUsername,
            storage,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to register account";
        const alreadyExists = /duplicate key|23505/i.test(message);
        return NextResponse.json(
            { error: alreadyExists ? "Ten dang nhap da duoc su dung." : "Failed to register account" },
            { status: alreadyExists ? 409 : 500 }
        );
    }
}

