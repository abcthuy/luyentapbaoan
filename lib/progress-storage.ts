import { normalizeContentLibrary } from '@/lib/content/library';
import { AdminAccount, AppStorage, ParentAccount, ParentChildLink, UserProfile } from '@/lib/mastery';

export const EMPTY_STORAGE: AppStorage = {
    profiles: [],
    activeProfileId: null,
    lastActive: Date.now(),
};

type LegacyParentRecord = {
    id?: string;
    name?: string;
    pin?: string;
    childrenIds?: string[];
};

type ParsedStorage = Partial<AppStorage> & {
    parents?: LegacyParentRecord[];
};

export type ParentDirectoryEntry = {
    parent: ParentAccount;
    childRefs: { childId: string; childSyncId: string }[];
    sourceSyncIds: string[];
    matchKey: string;
};

const AVATARS = ['\u{1F436}', '\u{1F431}', '\u{1F42D}', '\u{1F439}', '\u{1F430}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F428}', '\u{1F42F}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F438}', '\u{1F435}', '\u{1F427}', '\u{1F426}', '\u{1F986}', '\u{1F42C}', '\u{1F433}', '\u{1F984}', '\u{1F98B}', '\u{1F98D}', '\u{1F43B}'];
const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

function parseRawStorage(input: unknown): ParsedStorage {
    if (!input) return {};
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            return typeof parsed === 'object' && parsed !== null ? parsed as ParsedStorage : {};
        } catch {
            return {};
        }
    }
    return typeof input === 'object' && input !== null ? input as ParsedStorage : {};
}

export function buildParentMatchKey(parent: Pick<ParentAccount, 'name' | 'pin'>) {
    return `${parent.name.trim().toLowerCase()}::${parent.pin.trim()}`;
}

export function buildParentSummaries(storage: AppStorage, sourceSyncId: string): ParentDirectoryEntry[] {
    const links = storage.parentChildLinks || [];

    return (storage.parentAccounts || []).map((parent) => ({
        parent,
        childRefs: links
            .filter((link) => link.parentId === parent.id)
            .map((link) => ({ childId: link.childId, childSyncId: link.childSyncId || sourceSyncId })),
        sourceSyncIds: [sourceSyncId],
        matchKey: buildParentMatchKey(parent),
    }));
}

export function normalizeStorage(input: unknown): AppStorage {
    const parsed = parseRawStorage(input);
    const profiles = (Array.isArray(parsed.profiles) ? parsed.profiles : []).filter(Boolean).map((profile) => ({
        ...profile,
        grade: profile.grade || 2,
        avatar: profile.avatar || getRandomAvatar(),
    })) as UserProfile[];

    const profileIds = new Set(profiles.map((profile) => profile.id));
    const legacyParents = (Array.isArray(parsed.parents) ? parsed.parents : []).filter(Boolean).map((parent) => ({
        id: String(parent.id || '').trim(),
        name: String(parent.name || '').trim(),
        pin: String(parent.pin || '').trim(),
        childrenIds: Array.isArray(parent.childrenIds)
            ? parent.childrenIds.map((childId) => String(childId || '').trim()).filter((childId) => profileIds.has(childId))
            : [],
    })).filter((parent) => parent.id && parent.name && parent.pin);

    const parentAccounts = ((Array.isArray(parsed.parentAccounts) ? parsed.parentAccounts : []).filter(Boolean).map((parent) => ({
        ...parent,
        id: String(parent.id || '').trim(),
        name: String(parent.name || '').trim(),
        pin: String(parent.pin || '').trim(),
        displayOrder: typeof parent.displayOrder === 'number' ? parent.displayOrder : undefined,
        status: parent.status === 'disabled' ? 'disabled' : 'active',
        createdAt: parent.createdAt || undefined,
        updatedAt: parent.updatedAt || undefined,
    })) as ParentAccount[]).filter((parent) => parent.id && parent.name && parent.pin);

    const normalizedParentAccounts = parentAccounts.length > 0
        ? parentAccounts
        : legacyParents.map((parent) => ({
            id: parent.id,
            name: parent.name,
            pin: parent.pin,
            status: 'active' as const,
        }));

    const validParentIds = new Set(normalizedParentAccounts.map((parent) => parent.id));
    const parentChildLinks = ((Array.isArray(parsed.parentChildLinks) ? parsed.parentChildLinks : []).filter(Boolean).map((link) => ({
        ...link,
        id: String(link.id || '').trim(),
        parentId: String(link.parentId || '').trim(),
        childId: String(link.childId || '').trim(),
        childSyncId: link.childSyncId ? String(link.childSyncId).trim() : undefined,
        assignedAt: link.assignedAt || undefined,
    })) as ParentChildLink[]).filter((link) => link.id && validParentIds.has(link.parentId) && link.childId);

    const normalizedParentChildLinks = parentChildLinks.length > 0
        ? parentChildLinks
        : legacyParents.flatMap((parent) => parent.childrenIds.map((childId) => ({
            id: `${parent.id}:${childId}`,
            parentId: parent.id,
            childId,
        })));

    const { parents: _legacyParents, ...rest } = parsed;

    let adminAccount = parsed.adminAccount;
    if (!adminAccount?.pin && parsed.familyCredentials?.pin) {
        adminAccount = {
            username: 'admin',
            displayName: 'Quan tri vien',
            pin: String(parsed.familyCredentials.pin),
            updatedAt: new Date().toISOString(),
        } as AdminAccount;
    }

    return {
        ...EMPTY_STORAGE,
        ...rest,
        profiles,
        parentAccounts: normalizedParentAccounts,
        parentChildLinks: normalizedParentChildLinks,
        adminAccount,
        activeProfileId: profiles.some((profile) => profile.id === parsed.activeProfileId) ? parsed.activeProfileId || null : null,
        customContentLibrary: normalizeContentLibrary(parsed.customContentLibrary),
    };
}
