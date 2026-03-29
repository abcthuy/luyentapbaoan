import { NextRequest, NextResponse } from "next/server";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

const SESSION_LOCK_TIMEOUT_MS = 30 * 60 * 1000;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            username?: string;
            pin?: string;
            deviceId?: string;
        } | null;

        const normalizedUsername = body?.username?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "";
        const pin = body?.pin?.trim() || "";
        const deviceId = body?.deviceId?.trim() || "";

        if (!normalizedUsername || !pin || !deviceId) {
            return NextResponse.json({ error: "Missing login fields" }, { status: 400 });
        }

        const syncId = `USER-${normalizedUsername}`;
        const supabase = getServerSupabase();
        const { data, error } = await supabase
            .from("math_progress")
            .select("data")
            .eq("id", syncId)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Ten dang nhap khong ton tai." }, { status: 404 });
        }

        const storage = sanitizeStorage(data.data);
        const storedPin = storage.familyCredentials?.pin ? String(storage.familyCredentials.pin).trim() : "";
        if (!storedPin || storedPin !== pin) {
            return NextResponse.json({ error: "Ma PIN khong dung." }, { status: 401 });
        }

        if (storage.activeSession) {
            const timeSinceLastSeen = Date.now() - storage.activeSession.lastSeen;
            if (storage.activeSession.deviceId !== deviceId && timeSinceLastSeen < SESSION_LOCK_TIMEOUT_MS) {
                const minutesAgo = Math.round(timeSinceLastSeen / 60000);
                return NextResponse.json(
                    { error: `Tai khoan dang duoc su dung tren thiet bi khac (${minutesAgo} phut truoc).` },
                    { status: 409 }
                );
            }
        }

        const nextStorage = {
            ...storage,
            activeSession: {
                deviceId,
                lastSeen: Date.now(),
            },
            lastActive: Date.now(),
        };

        const { error: updateError } = await supabase
            .from("math_progress")
            .update({
                data: nextStorage,
                updated_at: new Date().toISOString(),
            })
            .eq("id", syncId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            syncId,
            username: body?.username?.trim() || normalizedUsername,
            storage: nextStorage,
        });
    } catch (error) {
        console.error("Account login failed:", error);
        return NextResponse.json({ error: "Loi ket noi server." }, { status: 500 });
    }
}
