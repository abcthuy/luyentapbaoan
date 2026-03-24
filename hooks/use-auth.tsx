import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AppStorage, UserProfile, INITIAL_PROGRESS } from '@/lib/mastery';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_LOCK_TIMEOUT_MS = 30 * 60 * 1000;

const getRandomAvatar = () => {
    const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙'];
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('math_device_id');
    if (!deviceId) {
        deviceId = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('math_device_id', deviceId);
    }
    return deviceId;
};

export const useAuth = (
    storage: AppStorage | null,
    setStorage: (s: AppStorage | null) => void,
    save: (s: AppStorage) => void,
    syncToCloud: (s: AppStorage) => Promise<void>,
    setIsSyncing: (b: boolean) => void
) => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // Logout function needs to be defined before it's used in ref
    const logout = useCallback(() => {
        if (!storage) return;
        const updated = { ...storage, activeProfileId: null, activeSession: null };
        sessionStorage.removeItem('math_session');
        localStorage.removeItem('math_current_user');
        setCurrentUser(null);
        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    // Use ref to hold latest logout function to avoid resetting interval on storage change
    const logoutRef = useRef(logout);
    useEffect(() => {
        logoutRef.current = logout;
    });

    useEffect(() => {
        const checkSession = () => {
            const local = localStorage.getItem('math_progress_multi');
            if (!local) return;

            const parsed = JSON.parse(local) as AppStorage;
            if (parsed.activeProfileId && parsed.lastActive) {
                const now = Date.now();
                if (now - parsed.lastActive > SESSION_TIMEOUT_MS) {
                    console.log("Session expired (runtime check).");
                    if (logoutRef.current) logoutRef.current();
                }
            }
        };

        const interval = setInterval(checkSession, 60000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkSession();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem('math_current_user');
        if (savedUser) setCurrentUser(savedUser);
    }, []);

    const login = async (username: string, pin: string): Promise<{ success: boolean; error?: string }> => {
        setIsSyncing(true);
        try {
            const syncId = `USER-${username.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

            const { data, error } = await supabase
                .from('math_progress')
                .select('data')
                .eq('id', syncId)
                .single();

            if (error || !data) {
                return { success: false, error: 'Tên đăng nhập không tồn tại!' };
            }

            let remoteStorage = data.data;
            if (typeof remoteStorage === 'string') {
                try {
                    remoteStorage = JSON.parse(remoteStorage);
                } catch (e) {
                    console.error("Parse error", e);
                }
            }

            const appStorage = remoteStorage as AppStorage;
            let storedPin = appStorage.familyCredentials?.pin;
            const cleanPin = pin.trim();

            if (!storedPin) {
                if (!appStorage.familyCredentials) {
                    appStorage.familyCredentials = {
                        username: username.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                        pin: cleanPin
                    };
                } else {
                    appStorage.familyCredentials.pin = cleanPin;
                }

                await supabase
                    .from('math_progress')
                    .update({ data: appStorage })
                    .eq('id', syncId);

                storedPin = cleanPin;
            }

            const cleanStoredPin = storedPin ? String(storedPin).trim() : null;

            if (!cleanStoredPin || cleanStoredPin !== cleanPin) {
                return { success: false, error: `Mã PIN không đúng!` };
            }

            const myDeviceId = getDeviceId();
            if (appStorage.activeSession) {
                const { deviceId: otherDevice, lastSeen } = appStorage.activeSession;
                const timeSinceLastSeen = Date.now() - lastSeen;
                if (otherDevice !== myDeviceId && timeSinceLastSeen < SESSION_LOCK_TIMEOUT_MS) {
                    const minutesAgo = Math.round(timeSinceLastSeen / 60000);
                    return { success: false, error: `Tài khoản đang được sử dụng trên thiết bị khác (hoạt động ${minutesAgo} phút trước). Vui lòng đợi 30 phút hoặc đăng xuất ở thiết bị kia.` };
                }
            }

            appStorage.activeSession = {
                deviceId: myDeviceId,
                lastSeen: Date.now()
            };

            localStorage.setItem('math_sync_id', syncId);
            localStorage.setItem('math_current_user', username);
            sessionStorage.setItem('math_session', 'active');

            setStorage(appStorage);
            save(appStorage);
            setCurrentUser(username);

            await syncToCloud(appStorage);

            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Lỗi kết nối server!' };
        } finally {
            setIsSyncing(false);
        }
    };

    const register = async (username: string, pin: string, name: string): Promise<{ success: boolean; error?: string }> => {
        setIsSyncing(true);
        try {
            const cleanUsername = username.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (cleanUsername.length < 3) return { success: false, error: 'Tên đăng nhập phải ít nhất 3 ký tự (chữ/số)' };

            const syncId = `USER-${cleanUsername}`;

            const { data: existing } = await supabase
                .from('math_progress')
                .select('id')
                .eq('id', syncId)
                .single();

            if (existing) {
                return { success: false, error: 'Tên đăng nhập đã được sử dụng!' };
            }

            const newProfile: UserProfile = {
                id: `p-${Date.now()}`,
                name: name,
                avatar: getRandomAvatar(),
                grade: 2,
                isPublic: true,
                progress: INITIAL_PROGRESS()
            };

            const newStorage: AppStorage = {
                profiles: [newProfile],
                activeProfileId: newProfile.id,
                lastActive: Date.now(),
                familyCredentials: {
                    username: cleanUsername,
                    pin: pin
                }
            };

            const { error: upsertError } = await supabase
                .from('math_progress')
                .insert({
                    id: syncId,
                    data: newStorage,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            localStorage.setItem('math_sync_id', syncId);
            localStorage.setItem('math_current_user', username);
            sessionStorage.setItem('math_session', 'active');
            setStorage(newStorage);
            save(newStorage);
            setCurrentUser(username);

            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: 'Lỗi tạo tài khoản!' };
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        currentUser,
        login,
        register,
        logout
    };
};
