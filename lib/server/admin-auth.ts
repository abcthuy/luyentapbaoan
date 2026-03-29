import type { AppStorage } from "@/lib/mastery";
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

    return admin.username.trim().toLowerCase() === credentials.username.trim().toLowerCase()
        && String(admin.pin).trim() === credentials.pin.trim();
}
