import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

type LooseRecord = Record<string, unknown>;
type LegacyParentProfile = { id: string; name: string; pin: string; childrenIds: string[] };
type ParentAccount = { id: string; name: string; pin: string; status?: "active" | "disabled"; createdAt?: string; updatedAt?: string; displayOrder?: number };
type ParentChildLink = { id: string; parentId: string; childId: string; childSyncId?: string; assignedAt?: string };
type AppStorage = LooseRecord & {
    profiles?: LooseRecord[];
    parentAccounts?: ParentAccount[];
    parentChildLinks?: ParentChildLink[];
    activeProfileId?: string | null;
    lastActive?: number;
};

type LegacyStorage = AppStorage & {
    parents?: LegacyParentProfile[];
};

function parseStorage(input: unknown): LegacyStorage {
    if (!input) return {};
    if (typeof input === "string") {
        try {
            return JSON.parse(input) as LegacyStorage;
        } catch {
            return {};
        }
    }
    return (typeof input === "object" && input !== null ? input : {}) as LegacyStorage;
}

function migrateStorage(raw: unknown, syncId: string): AppStorage {
    const parsed = parseStorage(raw);
    const profiles = (Array.isArray(parsed.profiles) ? parsed.profiles : []).filter(Boolean) as LooseRecord[];
    const profileIds = new Set(profiles.map((profile) => String(profile.id || "")).filter(Boolean));
    const legacyParents = (Array.isArray(parsed.parents) ? parsed.parents : [])
        .filter(Boolean)
        .map((parent) => ({
            id: String(parent.id || "").trim(),
            name: String(parent.name || "").trim(),
            pin: String(parent.pin || "").trim(),
            childrenIds: Array.isArray(parent.childrenIds)
                ? parent.childrenIds.map((childId) => String(childId || "").trim()).filter((childId) => profileIds.has(childId))
                : [],
        }))
        .filter((parent) => parent.id && parent.name && parent.pin) as LegacyParentProfile[];

    const parentAccounts = (Array.isArray(parsed.parentAccounts) ? parsed.parentAccounts : [])
        .filter(Boolean)
        .map((parent) => ({
            ...parent,
            id: String(parent.id || "").trim(),
            name: String(parent.name || "").trim(),
            pin: String(parent.pin || "").trim(),
            status: parent.status === "disabled" ? "disabled" : "active",
            createdAt: parent.createdAt || undefined,
            updatedAt: parent.updatedAt || undefined,
            displayOrder: typeof parent.displayOrder === "number" ? parent.displayOrder : undefined,
        }))
        .filter((parent) => parent.id && parent.name && parent.pin) as ParentAccount[];

    const normalizedParentAccounts: ParentAccount[] = parentAccounts.length > 0
        ? parentAccounts.map((parent) => ({
            ...parent,
            createdAt: parent.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }))
        : legacyParents.map((parent) => ({
            id: parent.id,
            name: parent.name,
            pin: parent.pin,
            status: "active" as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

    const validParentIds = new Set(normalizedParentAccounts.map((parent) => parent.id));
    const parentChildLinks = (Array.isArray(parsed.parentChildLinks) ? parsed.parentChildLinks : [])
        .filter(Boolean)
        .map((link) => ({
            ...link,
            id: String(link.id || "").trim(),
            parentId: String(link.parentId || "").trim(),
            childId: String(link.childId || "").trim(),
            childSyncId: link.childSyncId ? String(link.childSyncId).trim() : syncId,
            assignedAt: link.assignedAt || new Date().toISOString(),
        }))
        .filter((link) => link.id && validParentIds.has(link.parentId) && link.childId) as ParentChildLink[];

    const normalizedParentChildLinks = parentChildLinks.length > 0
        ? parentChildLinks
        : legacyParents.flatMap((parent) =>
            parent.childrenIds.map((childId) => ({
                id: `${parent.id}:${childId}`,
                parentId: parent.id,
                childId,
                childSyncId: syncId,
                assignedAt: new Date().toISOString(),
            }))
        );

    const { parents: _legacyParents, ...rest } = parsed;

    return {
        ...rest,
        profiles,
        parentAccounts: normalizedParentAccounts,
        parentChildLinks: normalizedParentChildLinks,
        lastActive: typeof parsed.lastActive === "number" ? parsed.lastActive : Date.now(),
    };
}

async function main() {
    const { data, error } = await supabase.from("math_progress").select("id, data").order("updated_at", { ascending: false });
    if (error) throw error;

    const rows = (data || []) as { id: string; data: unknown }[];
    let changed = 0;

    for (const row of rows) {
        const finalStorage = migrateStorage(row.data, row.id);
        const before = JSON.stringify(parseStorage(row.data));
        const after = JSON.stringify(finalStorage);
        if (before === after) continue;

        const { error: updateError } = await supabase
            .from("math_progress")
            .update({
                data: finalStorage,
                updated_at: new Date().toISOString(),
            })
            .eq("id", row.id);

        if (updateError) throw updateError;
        changed += 1;
        console.log(`Migrated ${row.id}: parentAccounts=${finalStorage.parentAccounts?.length || 0}, parentChildLinks=${finalStorage.parentChildLinks?.length || 0}`);
    }

    console.log(`Done. Updated ${changed}/${rows.length} rows.`);
}

main().catch((error) => {
    console.error("Parent migration failed:", error);
    process.exit(1);
});

