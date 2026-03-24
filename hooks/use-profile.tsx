import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppStorage, UserProfile, INITIAL_PROGRESS } from '@/lib/mastery';

const getRandomAvatar = () => {
    const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙'];
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

export const useProfile = (
    storage: AppStorage | null,
    setStorage: (s: AppStorage) => void,
    save: (s: AppStorage) => void,
    syncToCloud: (s: AppStorage) => Promise<void>,
    setAllProfiles: React.Dispatch<React.SetStateAction<{ profile: UserProfile, sourceSyncId: string }[]>>,
    fetchAllProfiles: () => Promise<void>
) => {

    const addProfile = useCallback(async (name: string, pin?: string, avatar?: string, skipAutoLogin?: boolean) => {
        if (!storage) return;
        const newProfile: UserProfile = {
            id: Math.random().toString(36).substring(7),
            name,
            pin,
            avatar: avatar || getRandomAvatar(),
            isPublic: true,
            grade: 2,
            progress: INITIAL_PROGRESS()
        };
        const updated = {
            ...storage,
            profiles: [...storage.profiles, newProfile],
            activeProfileId: skipAutoLogin ? storage.activeProfileId : (storage.activeProfileId || newProfile.id)
        };
        setStorage(updated);
        save(updated);

        // Optimistic update for UI responsiveness
        const syncId = localStorage.getItem('math_sync_id') || 'local';
        setAllProfiles(prev => [...prev, { profile: newProfile, sourceSyncId: syncId }]);

        await syncToCloud(updated);
        // Background refresh to ensure consistency
        fetchAllProfiles();
    }, [storage, setStorage, save, syncToCloud, setAllProfiles, fetchAllProfiles]);

    const switchProfile = useCallback(async (id: string): Promise<boolean> => {
        if (!storage) return false;

        const profile = storage.profiles.find(p => p.id === id);
        if (profile) {
            const updated = { ...storage, activeProfileId: id, lastActive: Date.now() };
            sessionStorage.setItem('math_session', 'active'); // Mark session active
            setStorage(updated);
            save(updated); // This saves to localStorage 'math_progress_multi'
            await syncToCloud(updated); // Await cloud sync
            return true;
        }
        return false;
    }, [storage, setStorage, save, syncToCloud]);

    const deleteProfile = useCallback(async (id: string) => {
        if (!storage) return;
        const updated = {
            ...storage,
            profiles: storage.profiles.filter(p => p.id !== id),
            activeProfileId: storage.activeProfileId === id ? (storage.profiles.find(p => p.id !== id)?.id || null) : storage.activeProfileId
        };
        setStorage(updated);
        save(updated);

        // Optimistic update
        setAllProfiles(prev => prev.filter(p => p.profile.id !== id));

        await syncToCloud(updated);
        fetchAllProfiles();
    }, [storage, setStorage, save, syncToCloud, setAllProfiles, fetchAllProfiles]);

    const updateProfilePin = useCallback((id: string, newPin?: string) => {
        if (!storage) return;

        const updatedProfiles = storage.profiles.map(p =>
            p.id === id ? { ...p, pin: newPin } : p
        );

        const updated = {
            ...storage,
            profiles: updatedProfiles
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateProfilePinBySource = useCallback(async (sourceSyncId: string, profileId: string, newPin?: string) => {
        const currentSyncId = localStorage.getItem('math_sync_id');

        if (sourceSyncId === currentSyncId || sourceSyncId === 'local') {
            updateProfilePin(profileId, newPin);
            setAllProfiles(prev => prev.map(item =>
                item.sourceSyncId === sourceSyncId && item.profile.id === profileId
                    ? { ...item, profile: { ...item.profile, pin: newPin } }
                    : item
            ));
            return;
        }

        try {
            const { data } = await supabase
                .from('math_progress')
                .select('data')
                .eq('id', sourceSyncId)
                .single();

            if (data && data.data) {
                let remoteApp = data.data as AppStorage;
                if (typeof remoteApp === 'string') {
                    try {
                        remoteApp = JSON.parse(remoteApp);
                    } catch {
                        return;
                    }
                }

                const updatedProfiles = (remoteApp.profiles || []).map(profile =>
                    profile.id === profileId ? { ...profile, pin: newPin } : profile
                );

                await supabase
                    .from('math_progress')
                    .update({
                        data: { ...remoteApp, profiles: updatedProfiles },
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', sourceSyncId);

                setAllProfiles(prev => prev.map(item =>
                    item.sourceSyncId === sourceSyncId && item.profile.id === profileId
                        ? { ...item, profile: { ...item.profile, pin: newPin } }
                        : item
                ));
            }
        } catch (e) {
            console.error('Failed to update remote profile PIN', e);
        }
    }, [setAllProfiles, updateProfilePin]);

    const updateProfileVisibility = useCallback((id: string, isPublic: boolean) => {
        if (!storage) return;

        const updatedProfiles = storage.profiles.map(p =>
            p.id === id ? { ...p, isPublic } : p
        );

        const updated = {
            ...storage,
            profiles: updatedProfiles
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateProfileGrade = useCallback((id: string, grade: number) => {
        if (!storage) return;

        const updatedProfiles = storage.profiles.map(p =>
            p.id === id ? { ...p, grade } : p
        );

        const updated = {
            ...storage,
            profiles: updatedProfiles
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateFamilyCredentials = useCallback((pin: string) => {
        if (!storage) return;

        const updated = {
            ...storage,
            familyCredentials: {
                username: 'admin',
                pin: pin
            }
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const upsertAdminAccount = useCallback((username: string, pin: string, displayName?: string) => {
        if (!storage) return;

        const updated = {
            ...storage,
            adminAccount: {
                username: username.trim(),
                pin,
                displayName: displayName?.trim() || 'Quan tri vien',
                updatedAt: new Date().toISOString()
            }
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const deleteGhostProfile = useCallback(async (sourceSyncId: string, profileId: string) => {
        const currentSyncId = localStorage.getItem('math_sync_id');
        if (sourceSyncId === currentSyncId || sourceSyncId === 'local') {
            await deleteProfile(profileId);
            return;
        }

        // Admin/Ghost Delete from other accounts
        try {
            // Fetch remote data
            const { data } = await supabase
                .from('math_progress')
                .select('data')
                .eq('id', sourceSyncId)
                .single();

            if (data && data.data) {
                let remoteApp = data.data as AppStorage;
                // Parse if needed
                if (typeof remoteApp === 'string') {
                    try { remoteApp = JSON.parse(remoteApp); } catch { }
                }

                // Filter out the profile
                const updatedProfiles = (remoteApp.profiles || []).filter(p => p.id !== profileId);

                // If no profiles left, delete the whole row? 
                // Maybe yes, if it's a ghost account.
                if (updatedProfiles.length === 0) {
                    await supabase.from('math_progress').delete().eq('id', sourceSyncId);
                } else {
                    remoteApp.profiles = updatedProfiles;
                    // If active was this one, reset it
                    if (remoteApp.activeProfileId === profileId) {
                        remoteApp.activeProfileId = updatedProfiles[0]?.id || null;
                    }

                    await supabase
                        .from('math_progress')
                        .update({ data: remoteApp })
                        .eq('id', sourceSyncId);
                }

                // Also delete from Leaderboard
                await supabase.from('leaderboard').delete().eq('id', profileId);

                // Update UI
                setAllProfiles(prev => prev.filter(p => !(p.sourceSyncId === sourceSyncId && p.profile.id === profileId)));
            }
        } catch (e) {
            console.error('Failed to delete ghost', e);
        }
    }, [deleteProfile, setAllProfiles]);

    return {
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
    };
};
