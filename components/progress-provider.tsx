"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProgressData, UserProfile, AppStorage, ParentAccount, ParentChildLink, AdminAccount, InventoryItem } from '@/lib/mastery';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { normalizeContentLibrary, setRuntimeContentLibrary } from '@/lib/content/library';
import { syncSkillMap } from '@/lib/skills';

const AVATARS = ['\u{1F436}', '\u{1F431}', '\u{1F42D}', '\u{1F439}', '\u{1F430}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}', '\u{1F428}', '\u{1F42F}', '\u{1F981}', '\u{1F42E}', '\u{1F437}', '\u{1F438}', '\u{1F435}', '\u{1F427}', '\u{1F426}', '\u{1F986}', '\u{1F42C}', '\u{1F433}', '\u{1F984}', '\u{1F98B}', '\u{1F98D}', '\u{1F43B}'];
const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];
const EMPTY_STORAGE: AppStorage = {
    profiles: [],
    activeProfileId: null,
    lastActive: Date.now()
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

type ParentDirectoryEntry = {
    parent: ParentAccount;
    childRefs: { childId: string; childSyncId: string }[];
    sourceSyncIds: string[];
    matchKey: string;
};

type ProgressContextType = {
    storage: AppStorage | null;
    familyCredentials?: { username: string; pin: string };
    profiles: UserProfile[];
    fullStorage: AppStorage | null;
    activeProfile: UserProfile | null;
    progress: ProgressData | null;
    addProfile: (name: string, pin?: string, avatar?: string, skipAutoLogin?: boolean) => void;
    addParent: (name: string, pin: string) => void;
    assignChildToParent: (parentId: string, childId: string) => void;
    processRewardApproval: (childId: string, itemId: string, action: 'approve' | 'reject') => void;
    switchProfile: (id: string) => Promise<boolean>;
    deleteProfile: (id: string) => void;
    updateProfilePin: (id: string, newPin?: string) => void;
    updateProfilePinBySource: (sourceSyncId: string, profileId: string, newPin?: string) => Promise<void>;
    updateFamilyCredentials: (pin: string) => void;
    upsertAdminAccount: (username: string, pin: string, displayName?: string) => void;
    updateProfileVisibility: (id: string, isPublic: boolean) => void;
    updateProfileGrade: (id: string, grade: number) => void;
    updateLocalProgress: (newProgress: ProgressData, immediate?: boolean) => void;
    updateFullStorage: (newStorage: AppStorage) => void;
    syncProgress: () => Promise<void>;
    logout: () => void;
    allProfiles: { profile: UserProfile, sourceSyncId: string }[];
    selectCloudProfile: (sourceSyncId: string, profileId: string) => Promise<void>;
    isSyncing: boolean;
    isInitialized: boolean;
    refreshData: () => Promise<void>;
    login: (username: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    register: (username: string, pin: string, name: string) => Promise<{ success: boolean; error?: string }>;
    currentUser: string | null;
    deleteGhostProfile: (sourceSyncId: string, profileId: string) => Promise<void>;
    allParents: ParentDirectoryEntry[];
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('math_device_id');
    if (!deviceId) {
        deviceId = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('math_device_id', deviceId);
    }
    return deviceId;
};

const parseRawStorage = (input: unknown): ParsedStorage => {
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
};

const buildParentMatchKey = (parent: Pick<ParentAccount, 'name' | 'pin'>) => `${parent.name.trim().toLowerCase()}::${parent.pin.trim()}`;

const buildParentSummaries = (storage: AppStorage, sourceSyncId: string): ParentDirectoryEntry[] => {
    const links = storage.parentChildLinks || [];

    return (storage.parentAccounts || []).map((parent) => ({
        parent,
        childRefs: links
            .filter((link) => link.parentId === parent.id)
            .map((link) => ({ childId: link.childId, childSyncId: link.childSyncId || sourceSyncId })),
        sourceSyncIds: [sourceSyncId],
        matchKey: buildParentMatchKey(parent),
    }));
};

const normalizeStorage = (input: unknown): AppStorage => {
    const parsed = parseRawStorage(input);
    const profiles = (Array.isArray(parsed.profiles) ? parsed.profiles : []).filter(Boolean).map(profile => ({
        ...profile,
        grade: profile.grade || 2,
        avatar: profile.avatar || getRandomAvatar()
    }));

    const profileIds = new Set(profiles.map(profile => profile.id));
    const legacyParents = (Array.isArray(parsed.parents) ? parsed.parents : []).filter(Boolean).map(parent => ({
        id: String(parent.id || '').trim(),
        name: String(parent.name || '').trim(),
        pin: String(parent.pin || '').trim(),
        childrenIds: Array.isArray(parent.childrenIds)
            ? parent.childrenIds.map((childId) => String(childId || '').trim()).filter((childId) => profileIds.has(childId))
            : []
    })).filter((parent) => parent.id && parent.name && parent.pin);

    const parentAccounts = ((Array.isArray(parsed.parentAccounts) ? parsed.parentAccounts : []).filter(Boolean).map(parent => ({
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
            updatedAt: new Date().toISOString()
        } as AdminAccount;
    }

    return {
        ...EMPTY_STORAGE,
        ...rest,
        profiles,
        parentAccounts: normalizedParentAccounts,
        parentChildLinks: normalizedParentChildLinks,
        adminAccount,
        activeProfileId: profiles.some(profile => profile.id === parsed.activeProfileId) ? parsed.activeProfileId || null : null,
        customContentLibrary: normalizeContentLibrary(parsed.customContentLibrary)
    };
};

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [storage, setStorage] = useState<AppStorage | null>(null);
    const [allProfiles, setAllProfiles] = useState<{ profile: UserProfile, sourceSyncId: string }[]>([]);
    const [allParents, setAllParents] = useState<ParentDirectoryEntry[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                let initialStorage: AppStorage;
                const local = localStorage.getItem('math_progress_multi');

                if (local) {
                    try {
                        initialStorage = normalizeStorage(JSON.parse(local) as AppStorage);
                    } catch (e) {
                        console.error('Failed to parse local storage', e);
                        initialStorage = normalizeStorage(EMPTY_STORAGE);
                    }
                } else {
                    initialStorage = normalizeStorage(EMPTY_STORAGE);
                }

                setStorage(initialStorage);
                setRuntimeContentLibrary(initialStorage.customContentLibrary);
                syncSkillMap();
                await Promise.all([syncProgress(), fetchAllProfiles()]);
            } catch (err) {
                console.error('Critical error during initialization:', err);
                setStorage(normalizeStorage(EMPTY_STORAGE));
            } finally {
                setIsInitialized(true);
            }
        };

        initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllProfiles = async () => {
        const syncId = localStorage.getItem('math_sync_id');
        const localDataStr = localStorage.getItem('math_progress_multi');
        let localData: AppStorage | null = null;
        if (localDataStr) {
            try { localData = normalizeStorage(JSON.parse(localDataStr) as AppStorage); } catch { }
        }

        const response = await fetch('/api/account/list');
        if (!response.ok) {
            if (!syncId && storage) {
                setAllProfiles(storage.profiles.map(profile => ({ profile, sourceSyncId: 'local' })));
                setAllParents(buildParentSummaries(storage, 'local'));
            }
            return;
        }

        const payload = await response.json().catch(() => ({ rows: [] })) as {
            rows?: { id: string; data: unknown }[];
        };

        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        const all: { profile: UserProfile, sourceSyncId: string }[] = [];
        const parentMap = new Map<string, ParentDirectoryEntry>();
        const seenIds = new Set<string>();

        rows.forEach((row) => {
            let appData = normalizeStorage(row.data);

            if (syncId && row.id === syncId && localData) {
                const localTime = localData.lastActive || 0;
                const remoteTime = appData.lastActive || 0;
                const localScore = localData.profiles.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0);
                const remoteScore = appData.profiles.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0);

                if (localScore > remoteScore || (localScore === remoteScore && localTime >= remoteTime)) {
                    appData = localData;
                }
            }

            appData.profiles.forEach((profile) => {
                if (seenIds.has(profile.id)) return;
                seenIds.add(profile.id);
                all.push({ profile, sourceSyncId: row.id });
            });

            buildParentSummaries(appData, row.id).forEach((entry) => {
                const existing = parentMap.get(entry.matchKey);
                if (!existing) {
                    parentMap.set(entry.matchKey, {
                        ...entry,
                        childRefs: [...entry.childRefs],
                        sourceSyncIds: [...entry.sourceSyncIds],
                    });
                    return;
                }

                const seenChildRefs = new Set(existing.childRefs.map((child) => `${child.childSyncId}:${child.childId}`));
                entry.childRefs.forEach((child) => {
                    const refKey = `${child.childSyncId}:${child.childId}`;
                    if (!seenChildRefs.has(refKey)) {
                        existing.childRefs.push(child);
                        seenChildRefs.add(refKey);
                    }
                });

                entry.sourceSyncIds.forEach((id) => {
                    if (!existing.sourceSyncIds.includes(id)) existing.sourceSyncIds.push(id);
                });
            });
        });

        const byName = new Map<string, { profile: UserProfile, sourceSyncId: string }>();
        for (const item of all) {
            const nameKey = item.profile.name.toLowerCase().trim();
            const existing = byName.get(nameKey);
            if (!existing || (item.profile.progress?.totalScore || 0) > (existing.profile.progress?.totalScore || 0)) {
                byName.set(nameKey, item);
            }
        }

        setAllProfiles(Array.from(byName.values()));
        setAllParents(Array.from(parentMap.values()));
    };
    const refreshData = async () => {
        await Promise.all([syncProgress(), fetchAllProfiles()]);
    };

    const save = (newStorage: AppStorage) => {
        const storageToSave = normalizeStorage({ ...newStorage, lastActive: Date.now() });
        localStorage.setItem('math_progress_multi', JSON.stringify(storageToSave));
    };

    const syncToCloud = async (newStorage: AppStorage) => {
        const syncId = localStorage.getItem('math_sync_id');
        if (!syncId) return;

        setIsSyncing(true);
        try {
            let normalized = normalizeStorage(newStorage);
            const myDeviceId = getDeviceId();
            if (normalized.activeSession && normalized.activeSession.deviceId === myDeviceId) {
                normalized = { ...normalized, activeSession: { ...normalized.activeSession, lastSeen: Date.now() } };
            }

            const response = await fetch('/api/account/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syncId, storage: normalized })
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(typeof payload?.error === 'string' ? payload.error : 'Cloud sync failed');
            }
        } catch (e) {
            console.error('Cloud sync failed:', e);
        } finally {
            setTimeout(() => setIsSyncing(false), 1000);
        }
    };

    const syncProgress = async () => {
        let syncId = localStorage.getItem('math_sync_id');
        if (!syncId) {
            syncId = 'MATH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
            localStorage.setItem('math_sync_id', syncId);
        }

        setIsSyncing(true);
        try {
            const response = await fetch(`/api/account/storage?syncId=${encodeURIComponent(syncId)}`);
            const payload = await response.json().catch(() => ({})) as {
                row?: { data: unknown; updated_at?: string };
            };

            if (response.ok && payload.row) {
                const remoteStorage = normalizeStorage(payload.row.data);
                const remoteUpdatedAt = payload.row.updated_at ? new Date(payload.row.updated_at).getTime() : 0;
                const local = localStorage.getItem('math_progress_multi');
                let localIsNewerOrEqual = false;
                if (local) {
                    try {
                        const parsedLocal = normalizeStorage(JSON.parse(local) as AppStorage);
                        const localTime = parsedLocal.lastActive || 0;
                        const remoteTime = Math.max(remoteStorage.lastActive || 0, remoteUpdatedAt);
                        const localScore = parsedLocal.profiles.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0);
                        const remoteScore = remoteStorage.profiles.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0);

                        if (localScore > remoteScore) {
                            localIsNewerOrEqual = true;
                            syncToCloud(parsedLocal);
                        } else if (remoteScore > localScore) {
                            localIsNewerOrEqual = false;
                        } else {
                            if (localTime >= remoteTime) {
                                localIsNewerOrEqual = true;
                            }
                            if (localTime > remoteTime) {
                                syncToCloud(parsedLocal);
                            }
                        }
                    } catch { }
                }

                if (!localIsNewerOrEqual) {
                    setStorage(remoteStorage);
                    localStorage.setItem('math_progress_multi', JSON.stringify(remoteStorage));
                }
            } else {
                const local = localStorage.getItem('math_progress_multi');
                if (local) {
                    try {
                        const parsedLocal = normalizeStorage(JSON.parse(local) as AppStorage);
                        syncToCloud(parsedLocal);
                    } catch { }
                }
            }
        } catch (e) {
            console.error('Initial sync/load failed:', e);
        } finally {
            setTimeout(() => setIsSyncing(false), 1000);
        }
    };

    const updateLocalProgress = (newProgress: ProgressData, immediate = false) => {
        if (!storage || !storage.activeProfileId) return;
        const updatedProfiles = storage.profiles.map(p =>
            p.id === storage.activeProfileId ? { ...p, progress: { ...newProgress, updatedAt: new Date().toISOString() } } : p
        );
        const updated = { ...storage, profiles: updatedProfiles };
        setStorage(updated);
        save(updated);

        if (immediate) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncToCloud(updated);
        } else {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                syncToCloud(updated);
            }, 10000);
        }
    };

    const updateFullStorage = (newStorage: AppStorage) => {
        setStorage(newStorage);
        save(newStorage);
        syncToCloud(newStorage);
    };

    const addParent = (name: string, pin: string) => {
        if (!storage) return;
        const newParentId = `pr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const updated = normalizeStorage({
            ...storage,
            parentAccounts: [...(storage.parentAccounts || []), {
                id: newParentId,
                name,
                pin,
                status: "active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }],
        });
        updateFullStorage(updated);
    };

    const assignChildToParent = (parentId: string, childId: string) => {
        if (!storage) return;

        const nextLinks = (storage.parentChildLinks || []).filter((link) => link.childId !== childId);
        nextLinks.push({
            id: `pcl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            parentId,
            childId,
            childSyncId: localStorage.getItem("math_sync_id") || undefined,
            assignedAt: new Date().toISOString(),
        });

        updateFullStorage(normalizeStorage({ ...storage, parentChildLinks: nextLinks }));
    };

    const processRewardApproval = async (childId: string, itemId: string, action: 'approve' | 'reject') => {
        if (!storage) return;

        const targetProfileWrapper = allProfiles.find(p => p.profile.id === childId);
        if (!targetProfileWrapper) return;

        const childProfile = targetProfileWrapper.profile;
        if (!childProfile.progress) return;

        let newBalance = childProfile.progress.balance;
        const newTransactions = [...(childProfile.progress.transactions || [])];

        const updatedInventory: InventoryItem[] = childProfile.progress.inventory.map(item => {
            if (item.id === itemId && item.status === 'pending') {
                if (action === 'reject') {
                    newBalance += item.cost;
                    newTransactions.unshift({
                        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                        amount: item.cost,
                        type: 'earn',
                        description: `Hoan tien qua: ${item.name}`,
                        date: new Date().toISOString()
                    });
                    return { ...item, status: 'rejected' };
                } else if (action === 'approve') {
                    return { ...item, status: 'approved' };
                }
            }
            return item;
        });

        const filteredInventory: InventoryItem[] = updatedInventory.filter(item => item.status !== 'rejected');

        const updatedProgress = {
            ...childProfile.progress,
            balance: newBalance,
            inventory: filteredInventory,
            transactions: newTransactions
        };

        const updatedProfile: UserProfile = { ...childProfile, progress: updatedProgress };

        setAllProfiles(prev => prev.map(p =>
            p.profile.id === childId ? { ...p, profile: updatedProfile } : p
        ));

        const sourceSyncId = targetProfileWrapper.sourceSyncId;
        const currentSyncId = localStorage.getItem('math_sync_id');

        if (sourceSyncId === 'local' || sourceSyncId === currentSyncId) {
            const updatedProfiles = storage.profiles.map(p =>
                p.id === childId ? updatedProfile : p
            );
            updateFullStorage({ ...storage, profiles: updatedProfiles });
        } else {
            try {
                setIsSyncing(true);
                const response = await fetch('/api/account/reward', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sourceSyncId,
                        childId,
                        itemId,
                        action
                    })
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(typeof payload?.error === 'string' ? payload.error : 'Reward sync failed');
                }
            } catch (e) {
                console.error('Failed to approve remote profile reward:', e);
                alert('Da xay ra loi khi dong bo len may chu, vui long thu lai!');
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const selectCloudProfile = async (sourceSyncId: string, profileId: string) => {
        setIsSyncing(true);
        try {
            const response = await fetch(`/api/account/storage?syncId=${encodeURIComponent(sourceSyncId)}`);
            const payload = await response.json().catch(() => ({})) as {
                row?: { data: unknown };
            };

            if (response.ok && payload.row) {
                const remoteStorage = normalizeStorage(payload.row.data);
                localStorage.setItem('math_sync_id', sourceSyncId);
                const updated = { ...remoteStorage, activeProfileId: profileId };
                setStorage(updated);
                save(updated);
                fetchAllProfiles();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    };

    const { currentUser, login, register, logout } = useAuth(storage, setStorage, save, syncToCloud, setIsSyncing);
    const {
        addProfile,
        switchProfile,
        deleteProfile,
        updateProfilePin,
        updateProfilePinBySource,
        upsertAdminAccount,
        updateProfileVisibility,
        updateProfileGrade,
        updateFamilyCredentials,
        deleteGhostProfile
    } = useProfile(storage, setStorage, save, syncToCloud, setAllProfiles, fetchAllProfiles);

    const activeProfile = storage?.profiles.find(p => p.id === storage.activeProfileId) || null;
    const progress = activeProfile?.progress || null;

    return (
        <ProgressContext.Provider value={{
            storage,
            familyCredentials: storage?.familyCredentials,
            profiles: storage?.profiles || [],
            activeProfile,
            progress,
            fullStorage: storage,
            addProfile,
            addParent,
            assignChildToParent,
            processRewardApproval,
            switchProfile,
            deleteProfile,
            updateProfilePin,
            updateProfilePinBySource,
            updateFamilyCredentials,
            upsertAdminAccount,
            updateProfileVisibility,
            updateProfileGrade,
            updateLocalProgress,
            updateFullStorage,
            syncProgress,
            logout,
            allProfiles,
            selectCloudProfile,
            isSyncing,
            isInitialized,
            refreshData,
            login,
            register,
            currentUser,
            deleteGhostProfile,
            allParents
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) throw new Error('useProgress must be used within ProgressProvider');
    return context;
};











