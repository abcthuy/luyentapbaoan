import type { AppStorage } from "@/lib/mastery";
import { hashPinIfNeeded, isPinHashed, verifyPinInput } from "@/lib/pin-hash";
import { sanitizeStorage } from "@/lib/server/app-storage";
import { getServerSupabase } from "@/lib/server/supabase-admin";

export type AdminCredentials = {
    syncId: string;
    username: string;
    pin: string;
};

export async function verifyAdminCredentials(credentials: AdminCredentials) {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from("math_progress")
        .select("data")
        .eq("id", credentials.syncId)
        .single();

    if (error || !data) return false;

    const storage = sanitizeStorage(data.data as AppStorage);
    const admin = storage.adminAccount;
    if (!admin?.pin) return false;

    const usernameMatches = admin.username.trim().toLowerCase() === credentials.username.trim().toLowerCase();
    if (!usernameMatches) return false;

    const storedPin = String(admin.pin).trim();
    const isValidPin = await verifyPinInput(credentials.pin, storedPin);
    if (!isValidPin) return false;

    if (!isPinHashed(storedPin)) {
        const hashedPin = await hashPinIfNeeded(credentials.pin);
        if (hashedPin) {
            const nextStorage: AppStorage = {
                ...storage,
                adminAccount: {
                    ...admin,
                    pin: hashedPin,
                    updatedAt: new Date().toISOString(),
                },
            };

            await supabase
                .from("math_progress")
                .update({
                    data: nextStorage,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", credentials.syncId);
        }
    }

    return true;
}
