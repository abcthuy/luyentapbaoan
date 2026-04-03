import type { AppStorage, ParentAccount, ParentChildLink, UserProfile } from "@/lib/mastery";

type LegacyParentRecord = {
    id?: string;
    name?: string;
    pin?: string;
    childrenIds?: string[];
};

type ParsedAppStorage = Partial<AppStorage> & {
    parents?: LegacyParentRecord[];
};

export const EMPTY_APP_STORAGE: AppStorage = {
    profiles: [],
    deletedProfileIds: [],
    deletedParentKeys: [],
    activeProfileId: null,
    lastActive: Date.now(),
};

export function parseAppStorage(input: unknown): ParsedAppStorage {
    if (!input) return {};

    if (typeof input === "string") {
        try {
            const parsed = JSON.parse(input);
            return typeof parsed === "object" && parsed !== null ? (parsed as ParsedAppStorage) : {};
        } catch {
            return {};
        }
    }

    return typeof input === "object" && input !== null ? (input as ParsedAppStorage) : {};
}

function normalizeLegacyParents(input: ParsedAppStorage, profileIds: Set<string>) {
    return (Array.isArray(input.parents) ? input.parents : [])
        .filter(Boolean)
        .map((parent) => ({
            id: String(parent.id || "").trim(),
            name: String(parent.name || "").trim(),
            pin: String(parent.pin || "").trim(),
            childrenIds: Array.isArray(parent.childrenIds)
                ? parent.childrenIds.map((childId) => String(childId || "").trim()).filter((childId) => profileIds.has(childId))
                : [],
        }))
        .filter((parent) => parent.id && parent.name && parent.pin);
}

function normalizeParentAccounts(input: ParsedAppStorage, legacyParents: ReturnType<typeof normalizeLegacyParents>) {
    const parentAccounts = (Array.isArray(input.parentAccounts) ? input.parentAccounts : [])
        .filter(Boolean)
        .map((parent) => ({
            ...(parent as ParentAccount),
            id: String((parent as ParentAccount).id || "").trim(),
            name: String((parent as ParentAccount).name || "").trim(),
            pin: String((parent as ParentAccount).pin || "").trim(),
            displayOrder: typeof (parent as ParentAccount).displayOrder === "number" ? (parent as ParentAccount).displayOrder : undefined,
            status: (parent as ParentAccount).status === "disabled" ? "disabled" : "active",
            createdAt: (parent as ParentAccount).createdAt || undefined,
            updatedAt: (parent as ParentAccount).updatedAt || undefined,
        }))
        .filter((parent) => parent.id && parent.name && parent.pin) as ParentAccount[];

    if (parentAccounts.length > 0) return parentAccounts;

    return legacyParents.map((parent) => ({
        id: parent.id,
        name: parent.name,
        pin: parent.pin,
        status: "active" as const,
    }));
}

function normalizeParentChildLinks(
    input: ParsedAppStorage,
    parentAccounts: ParentAccount[],
    legacyParents: ReturnType<typeof normalizeLegacyParents>
) {
    const validParentIds = new Set(parentAccounts.map((parent) => parent.id));
    const links = (Array.isArray(input.parentChildLinks) ? input.parentChildLinks : [])
        .filter(Boolean)
        .map((link) => ({
            ...(link as ParentChildLink),
            id: String((link as ParentChildLink).id || "").trim(),
            parentId: String((link as ParentChildLink).parentId || "").trim(),
            childId: String((link as ParentChildLink).childId || "").trim(),
            childSyncId: (link as ParentChildLink).childSyncId ? String((link as ParentChildLink).childSyncId).trim() : undefined,
            assignedAt: (link as ParentChildLink).assignedAt || undefined,
        }))
        .filter((link) => link.id && validParentIds.has(link.parentId) && link.childId) as ParentChildLink[];

    if (links.length > 0) return links;

    return legacyParents.flatMap((parent) =>
        parent.childrenIds.map((childId) => ({
            id: `${parent.id}:${childId}`,
            parentId: parent.id,
            childId,
        }))
    );
}

export function sanitizeStorage(storage: unknown): AppStorage {
    const parsed = parseAppStorage(storage);
    const profiles = (Array.isArray(parsed.profiles) ? parsed.profiles : []).filter(Boolean) as UserProfile[];
    const profileIds = new Set(profiles.map((profile) => profile.id));
    const legacyParents = normalizeLegacyParents(parsed, profileIds);
    const parentAccounts = normalizeParentAccounts(parsed, legacyParents);
    const parentChildLinks = normalizeParentChildLinks(parsed, parentAccounts, legacyParents);
    const { parents: _legacyParents, ...rest } = parsed;

    const adminAccount = parsed.adminAccount?.pin
        ? parsed.adminAccount
        : parsed.familyCredentials?.pin
            ? {
                username: "admin",
                displayName: "Quan tri vien",
                pin: String(parsed.familyCredentials.pin),
                updatedAt: new Date().toISOString(),
            }
            : undefined;

    return {
        ...EMPTY_APP_STORAGE,
        ...rest,
        profiles,
        deletedProfileIds: Array.isArray(parsed.deletedProfileIds)
            ? Array.from(new Set(parsed.deletedProfileIds.map((id) => String(id || "").trim()).filter(Boolean)))
            : [],
        deletedParentKeys: Array.isArray(parsed.deletedParentKeys)
            ? Array.from(new Set(parsed.deletedParentKeys.map((key) => String(key || "").trim().toLowerCase()).filter(Boolean)))
            : [],
        parentAccounts,
        parentChildLinks,
        adminAccount,
        activeProfileId: profiles.some((profile) => profile.id === parsed.activeProfileId)
            ? parsed.activeProfileId || null
            : null,
    };
}


