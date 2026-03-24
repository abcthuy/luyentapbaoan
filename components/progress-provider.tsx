"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProgressData, UserProfile, AppStorage, ParentProfile, AdminAccount, InventoryItem, getOverallRank } from '@/lib/mastery';
import { getSubjectScore } from '@/lib/scoring';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { normalizeContentLibrary, setRuntimeContentLibrary } from '@/lib/content/library';
import { syncSkillMap } from '@/lib/skills';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙'];
const getRandomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (Standard Session)

const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('math_device_id');
    if (!deviceId) {
        deviceId = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('math_device_id', deviceId);
    }
    return deviceId;
};

const normalizeStorage = (input: AppStorage): AppStorage => {
    const profiles = (input.profiles || []).map(profile => ({
        ...profile,
        grade: profile.grade || 2,
        avatar: profile.avatar || getRandomAvatar()
    }));

    let adminAccount = input.adminAccount;
    if (!adminAccount?.pin && input.familyCredentials?.pin) {
        adminAccount = {
            username: 'admin',
            displayName: 'Quan tri vien',
            pin: String(input.familyCredentials.pin),
            updatedAt: new Date().toISOString()
        };
    }

    return {
        ...input,
        profiles,
        adminAccount,
        customContentLibrary: normalizeContentLibrary(input.customContentLibrary)
    };
};

interface ProgressContextType {
    storage: AppStorage | null;
    progress: ProgressData | null; // active profile progress
    activeProfile: UserProfile | null;
    activeProfileId: string | null;
    adminAccount?: AdminAccount;
    parents?: ParentProfile[];
    familyCredentials?: {
        username: string;
        pin: string;
    };
    profiles: UserProfile[];
    fullStorage: AppStorage | null;
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
    allParents: { parent: ParentProfile, sourceSyncId: string }[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [storage, setStorage] = useState<AppStorage | null>(null);
    const [allProfiles, setAllProfiles] = useState<{ profile: UserProfile, sourceSyncId: string }[]>([]);
    const [allParents, setAllParents] = useState<{ parent: ParentProfile, sourceSyncId: string }[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setRuntimeContentLibrary(storage?.customContentLibrary);
        syncSkillMap();
    }, [storage?.customContentLibrary]);


    // SESSION_TIMEOUT_MS moved outside (implicitly used by hooks now)

    useEffect(() => {
        try {
            // MIGRATION: Force specific corrupted ghost accounts to the correct one
            const currentSyncId = localStorage.getItem('math_sync_id');
            if (currentSyncId === 'MATH-DCJD5PRS' || currentSyncId === 'MATH-F8K2V9A') { // Add any other known ghost IDs here
                console.log("Migrating away from corrupted ghost account...");
                localStorage.setItem('math_sync_id', 'MATH-LQKAR7MF');
                localStorage.removeItem('math_progress_multi');
                window.location.reload();
                return;
            }

            const local = localStorage.getItem('math_progress_multi');
            // currentUser handled by useAuth

            let initialStorage: AppStorage;

            const isSessionActive = sessionStorage.getItem('math_session') === 'active';

            if (local) {
                try {
                    const parsed = JSON.parse(local) as AppStorage;
                    const now = Date.now();
                    let activeId = parsed.activeProfileId;
                    let profiles = parsed.profiles || [];

                    if (parsed.lastActive && (now - parsed.lastActive > SESSION_TIMEOUT_MS)) {
                        console.log("Session expired due to inactivity.");
                        activeId = null;
                    }

                    if (!isSessionActive) {
                        activeId = null;
                    }

                    // MIGRATION: Fix duplicate IDs if they are just 'p1' (one-time fix)
                    profiles = profiles.map(p => {
                        if (p.id === 'p1' || p.id === 'p1-1') {
                            const newId = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                            // Mark as migrated so we don't re-run
                            return { ...p, id: newId, _migrated: true, grade: p.grade || 2, avatar: p.avatar || getRandomAvatar() };
                        }
                        return { ...p, grade: p.grade || 2, avatar: p.avatar || getRandomAvatar() };
                    });

                    initialStorage = normalizeStorage({ ...parsed, profiles, activeProfileId: activeId, lastActive: now });
                } catch (e) {
                    console.error("Failed to parse local storage", e);
                    // Fallback to empty if corrupted
                    initialStorage = normalizeStorage({
                        profiles: [],
                        activeProfileId: null,
                        lastActive: Date.now()
                    });
                }
            } else {
                // New User / No Data
                // We start empty and let UI prompt Login/Register
                initialStorage = normalizeStorage({
                    profiles: [],
                    activeProfileId: null,
                    lastActive: Date.now()
                });
            }

            setStorage(initialStorage);
            save(initialStorage);

            if (initialStorage.profiles) {
                setAllProfiles(initialStorage.profiles.map(p => ({
                    profile: p,
                    sourceSyncId: localStorage.getItem('math_sync_id') || 'local'
                })));
            }

            if (initialStorage.parents) {
                setAllParents(initialStorage.parents.map(p => ({
                    parent: p,
                    sourceSyncId: localStorage.getItem('math_sync_id') || 'local'
                })));
            }

            refreshData();
        } catch (err) {
            console.error("Critical error during initialization:", err);
            // Ensure we at least have empty storage so app doesn't crash
            setStorage(normalizeStorage({
                profiles: [],
                activeProfileId: null,
                lastActive: Date.now()
            }));
        } finally {
            setIsInitialized(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllProfiles = async () => {
        const syncId = localStorage.getItem('math_sync_id');
        const localDataStr = localStorage.getItem('math_progress_multi');
        let localData: AppStorage | null = null;
        if (localDataStr) {
            try { localData = normalizeStorage(JSON.parse(localDataStr) as AppStorage); } catch { }
        }

        // Fetch ALL accounts to show all available profiles for login
        const { data } = await supabase
            .from('math_progress')
            .select('id, data');

        if (data) {
            const all: { profile: UserProfile, sourceSyncId: string }[] = [];
            const allP: { parent: ParentProfile, sourceSyncId: string }[] = [];
            // Track seen profile IDs to prevent duplicates
            const seenIds = new Set<string>();
            const seenParentIds = new Set<string>();

            interface SyncRow {
                id: string;
                data: AppStorage | string;
            }

            (data as unknown as SyncRow[]).forEach((row) => {
                let appData = row.data as AppStorage;
                if (typeof appData === 'string') {
                    try { appData = JSON.parse(appData); } catch { }
                }
                appData = normalizeStorage(appData);

                // CRITICAL FIX: If this row is our current syncId, override it with localData if localData is better
                if (syncId && row.id === syncId && localData) {
                    const localTime = localData.lastActive || 0;
                    const remoteTime = appData?.lastActive || 0;
                    const localScore = localData.profiles?.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0) || 0;
                    const remoteScore = appData.profiles?.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0) || 0;

                    if (localScore > remoteScore) {
                        appData = localData;
                    } else if (remoteScore > localScore) {
                        // keep remote appData
                    } else if (localTime >= remoteTime) {
                        appData = localData;
                    }
                }

                if (appData && appData.profiles) {
                    appData.profiles.forEach(p => {
                        // Skip if we already have this exact profile ID
                        if (seenIds.has(p.id)) return;
                        seenIds.add(p.id);
                        all.push({
                            profile: p,
                            sourceSyncId: row.id
                        });
                    });
                }

                if (appData && appData.parents) {
                    appData.parents.forEach(p => {
                        if (seenParentIds.has(p.id)) return;
                        seenParentIds.add(p.id);
                        allP.push({
                            parent: p,
                            sourceSyncId: row.id
                        });
                    });
                }
            });

            // Also deduplicate by name (keep the one with higher total score)
            const byName = new Map<string, { profile: UserProfile, sourceSyncId: string }>();
            for (const item of all) {
                const nameKey = item.profile.name.toLowerCase().trim();
                const existing = byName.get(nameKey);
                if (!existing || (item.profile.progress?.totalScore || 0) > (existing.profile.progress?.totalScore || 0)) {
                    byName.set(nameKey, item);
                }
            }

            setAllProfiles(Array.from(byName.values()));
            setAllParents(allP);
        } else if (!syncId && storage) {
            // Fallback: show local profiles only
            setAllProfiles(storage.profiles.map(p => ({
                profile: p,
                sourceSyncId: 'local'
            })));
            setAllParents(storage.parents?.map(p => ({
                parent: p,
                sourceSyncId: 'local'
            })) || []);
        }
    };

    const refreshData = async () => {
        // Parallel fetch for speed
        await Promise.all([syncProgress(), fetchAllProfiles()]);
    };

    const save = (newStorage: AppStorage) => {
        // Always update lastActive on save (user interaction)
        const storageToSave = normalizeStorage({ ...newStorage, lastActive: Date.now() });
        localStorage.setItem('math_progress_multi', JSON.stringify(storageToSave));
        // Update state if needed, but usually setStorage is called before save so we might want to ensure state also has it?
        // Actually setStorage callers passed newStorage. 
        // Ideally we should do setStorage(storageToSave) inside here or make sure callers include it?
        // To be safe and simple: We just modify what goes to disk. 
        // Next load/refresh will pick it up, or next save will overwrite it with new now().
    };

    const syncToCloud = async (newStorage: AppStorage) => {
        const syncId = localStorage.getItem('math_sync_id');
        if (!syncId) return;

        setIsSyncing(true);
        try {
            newStorage = normalizeStorage(newStorage);
            const myDeviceId = getDeviceId();
            if (newStorage.activeSession && newStorage.activeSession.deviceId === myDeviceId) {
                newStorage = { ...newStorage, activeSession: { ...newStorage.activeSession, lastSeen: Date.now() } };
            }

            await supabase
                .from('math_progress')
                .upsert({
                    id: syncId,
                    data: newStorage,
                    updated_at: new Date().toISOString()
                });

            const publicProfiles = newStorage.profiles.filter(p => p.isPublic !== false);

            if (publicProfiles.length > 0) {
                const leaderboardUpdates = publicProfiles.map(profile => {
                    const rank = getOverallRank(profile.progress);
                    return {
                        id: profile.id,
                        name: profile.name,
                        total_score: profile.progress.totalScore || 0,
                        last_score: profile.progress.lastSessionScore || 0,
                        best_time: profile.progress.bestTimeSeconds || 999999,
                        tier: rank.label,
                        is_public: true,
                        math_score: getSubjectScore(profile.progress, 'math'),
                        vietnamese_score: getSubjectScore(profile.progress, 'vietnamese'),
                        english_score: getSubjectScore(profile.progress, 'english'),
                        finance_score: getSubjectScore(profile.progress, 'finance'),
                        updated_at: new Date().toISOString()
                    };
                });

                await supabase.from('leaderboard').upsert(leaderboardUpdates);
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
            const { data, error } = await supabase
                .from('math_progress')
                .select('data, updated_at')
                .eq('id', syncId)
                .single();

            if (data && !error) {
                const remoteStorage = normalizeStorage(data.data as AppStorage);

                // Smart Merge Logic: Check if Remote is actually newer
                const local = localStorage.getItem('math_progress_multi');
                let localIsNewerOrEqual = false;
                if (local) {
                    try {
                        const parsedLocal = normalizeStorage(JSON.parse(local) as AppStorage);
                        const localTime = parsedLocal.lastActive || 0;
                        const remoteTime = remoteStorage.lastActive || 0;

                        const localScore = parsedLocal.profiles?.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0) || 0;
                        const remoteScore = remoteStorage.profiles?.reduce((acc, p) => acc + (p.progress?.totalScore || 0), 0) || 0;

                        if (localScore > remoteScore) {
                            // Local has more points! Must push to cloud
                            localIsNewerOrEqual = true;
                            console.log("Local has higher score, pushing to cloud...");
                            syncToCloud(parsedLocal);
                        } else if (remoteScore > localScore) {
                            // Remote has more points!
                            localIsNewerOrEqual = false;
                        } else {
                            // Scores equal, trust timestamps
                            if (localTime >= remoteTime) {
                                localIsNewerOrEqual = true;
                            }

                            // Only push to cloud if local is STRICTLY newer, to avoid infinite sync loops
                            if (localTime > remoteTime) {
                                console.log("Local is newer (equal score), pushing to cloud in background...");
                                syncToCloud(parsedLocal); // Don't await here to avoid blocking initialization
                            }
                        }
                    } catch { }
                }

                if (!localIsNewerOrEqual) {
                    console.log("Applying remote storage (remote is newer)...");
                    setStorage(remoteStorage);
                    localStorage.setItem('math_progress_multi', JSON.stringify(remoteStorage));
                }
            } else {
                // If there's no remote data but we have local data, we should push it
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
        const updatedParents = [...(storage.parents || []), {
            id: newParentId,
            name,
            pin,
            childrenIds: []
        }];
        const updated = { ...storage, parents: updatedParents };
        updateFullStorage(updated);
    };

    const assignChildToParent = (parentId: string, childId: string) => {
        if (!storage || !storage.parents) return;

        const updatedParents = storage.parents.map(p => {
            if (p.id === parentId) {
                // Add if not already there
                if (!p.childrenIds.includes(childId)) {
                    return { ...p, childrenIds: [...p.childrenIds, childId] };
                }
            } else {
                // Remove from other parents if needed (Optional: 1 child can only have 1 parent in this simple system)
                return { ...p, childrenIds: p.childrenIds.filter(id => id !== childId) };
            }
            return p;
        });

        updateFullStorage({ ...storage, parents: updatedParents });
    };

    const processRewardApproval = async (childId: string, itemId: string, action: 'approve' | 'reject') => {
        if (!storage) return;

        // 1. Tìm profile trong allProfiles thay vì chỉ storage để xử lý cả cloud profiles
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
                    // Add refund transaction
                    newTransactions.unshift({
                        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                        amount: item.cost,
                        type: 'earn',
                        description: `Hoàn tiền quà: ${item.name}`,
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

        // 2. Cập nhật UI ngay lập tức
        setAllProfiles(prev => prev.map(p =>
            p.profile.id === childId ? { ...p, profile: updatedProfile } : p
        ));

        // 3. Cập nhật DB (Local hoặc Cloud)
        const sourceSyncId = targetProfileWrapper.sourceSyncId;
        const currentSyncId = localStorage.getItem('math_sync_id');

        if (sourceSyncId === 'local' || sourceSyncId === currentSyncId) {
            // Profile này lưu ở máy hiện tại
            const updatedProfiles = storage.profiles.map(p =>
                p.id === childId ? updatedProfile : p
            );
            updateFullStorage({ ...storage, profiles: updatedProfiles });
        } else {
            // Profile này lưu ở Cloud (do trẻ học ở máy khác)
            try {
                setIsSyncing(true);
                const { data } = await supabase.from('math_progress').select('data').eq('id', sourceSyncId).single();
                if (data && data.data) {
                    const remoteStorage = data.data as AppStorage;
                    const updatedRemoteProfiles = remoteStorage.profiles.map(p =>
                        p.id === childId ? updatedProfile : p
                    );
                    const newRemoteStorage = { ...remoteStorage, profiles: updatedRemoteProfiles };
                    await supabase.from('math_progress').update({
                        data: newRemoteStorage,
                        updated_at: new Date().toISOString()
                    }).eq('id', sourceSyncId);
                }
            } catch (e) {
                console.error("Failed to approve remote profile reward:", e);
                alert("Đã xảy ra lỗi khi đồng bộ lên máy chủ, vui lòng thử lại!");
            } finally {
                setIsSyncing(false);
            }
        }
    };

    const selectCloudProfile = async (sourceSyncId: string, profileId: string) => {
        setIsSyncing(true);
        try {
            const { data } = await supabase
                .from('math_progress')
                .select('data')
                .eq('id', sourceSyncId)
                .single();

            if (data) {
                const remoteStorage = normalizeStorage(data.data as AppStorage);
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

    // --- HOOK INTEGRATION ---

    const {
        currentUser,
        login,
        register,
        logout
    } = useAuth(storage, setStorage, save, syncToCloud, setIsSyncing);

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
            progress,
            activeProfile,
            activeProfileId: storage?.activeProfileId || null,
            adminAccount: storage?.adminAccount,
            parents: storage?.parents || [],
            familyCredentials: storage?.familyCredentials,
            profiles: storage?.profiles || [],
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
    if (!context) throw new Error('useProgress must be used within a ProgressProvider');
    return context;
};

