import { useCallback } from "react";
import { AppStorage, UserProfile, INITIAL_PROGRESS } from "@/lib/mastery";
import { hashPin, hashPinIfNeeded } from "@/lib/pin-hash";

const getRandomAvatar = () => {
    const AVATARS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

async function postJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Request failed");
    }

    return data as T;
}

export const useProfile = (
    storage: AppStorage | null,
    setStorage: (s: AppStorage) => void,
    save: (s: AppStorage) => void,
    syncToCloud: (s: AppStorage) => Promise<void>,
    setAllProfiles: React.Dispatch<React.SetStateAction<{ profile: UserProfile, sourceSyncId: string }[]>>,
    fetchAllProfiles: () => Promise<void>
) => {
    const getAdminPayload = useCallback(() => {
        const syncId = localStorage.getItem("math_sync_id") || "";
        const username = storage?.adminAccount?.username?.trim() || "";
        const pin = storage?.adminAccount?.pin?.trim() || "";
        if (!syncId || !username || !pin) {
            throw new Error("Admin account is required for cross-account changes.");
        }

        return { syncId, username, pin };
    }, [storage]);

    const addProfile = useCallback(async (name: string, pin?: string, avatar?: string, skipAutoLogin?: boolean) => {
        if (!storage) return;
        const hashedPin = pin ? await hashPin(pin) : undefined;
        const newProfile: UserProfile = {
            id: Math.random().toString(36).substring(7),
            name,
            pin: hashedPin,
            avatar: avatar || getRandomAvatar(),
            isPublic: true,
            grade: 2,
            progress: INITIAL_PROGRESS(),
        };
        const updated = {
            ...storage,
            profiles: [...storage.profiles, newProfile],
            activeProfileId: skipAutoLogin ? storage.activeProfileId : (storage.activeProfileId || newProfile.id),
        };
        setStorage(updated);
        save(updated);

        const syncId = localStorage.getItem("math_sync_id") || "local";
        setAllProfiles((prev) => [...prev, { profile: newProfile, sourceSyncId: syncId }]);

        await syncToCloud(updated);
        fetchAllProfiles();
    }, [storage, setStorage, save, syncToCloud, setAllProfiles, fetchAllProfiles]);

    const switchProfile = useCallback(async (id: string): Promise<boolean> => {
        if (!storage) return false;

        const profile = storage.profiles.find((item) => item.id === id);
        if (!profile) return false;

        const updated = { ...storage, activeProfileId: id, lastActive: Date.now() };
        sessionStorage.setItem("math_session", "active");
        setStorage(updated);
        save(updated);
        await syncToCloud(updated);
        return true;
    }, [storage, setStorage, save, syncToCloud]);

    const deleteProfile = useCallback(async (id: string) => {
        if (!storage) return;
        const deletedProfileIds = Array.from(new Set([...(storage.deletedProfileIds || []), id]));
        const updated = {
            ...storage,
            profiles: storage.profiles.filter((profile) => profile.id !== id),
            deletedProfileIds,
            parentChildLinks: (storage.parentChildLinks || []).filter((link) => link.childId !== id),
            activeProfileId: storage.activeProfileId === id ? null : storage.activeProfileId,
        };
        setStorage(updated);
        save(updated);
        setAllProfiles((prev) => prev.filter((item) => item.profile.id !== id));
        await syncToCloud(updated);
        fetchAllProfiles();
    }, [storage, setStorage, save, syncToCloud, setAllProfiles, fetchAllProfiles]);

    const updateProfilePin = useCallback(async (id: string, newPin?: string) => {
        if (!storage) return;
        const hashedPin = newPin ? await hashPin(newPin) : undefined;

        const updatedProfiles = storage.profiles.map((profile) =>
            profile.id === id ? { ...profile, pin: hashedPin } : profile
        );

        const updated = {
            ...storage,
            profiles: updatedProfiles,
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateProfilePinBySource = useCallback(async (sourceSyncId: string, profileId: string, newPin?: string) => {
        const currentSyncId = localStorage.getItem("math_sync_id");

        if (sourceSyncId === currentSyncId || sourceSyncId === "local") {
            updateProfilePin(profileId, newPin);
            setAllProfiles((prev) => prev.map((item) =>
                item.sourceSyncId === sourceSyncId && item.profile.id === profileId
                    ? { ...item, profile: { ...item.profile, pin: newPin } }
                    : item
            ));
            return;
        }

        const adminPayload = getAdminPayload();
        await postJson("/api/admin/profiles/pin", {
            ...adminPayload,
            targetSyncId: sourceSyncId,
            profileId,
            newPin,
        });

        setAllProfiles((prev) => prev.map((item) =>
            item.sourceSyncId === sourceSyncId && item.profile.id === profileId
                ? { ...item, profile: { ...item.profile, pin: newPin } }
                : item
        ));
        await fetchAllProfiles();
    }, [fetchAllProfiles, getAdminPayload, setAllProfiles, updateProfilePin]);

    const updateProfileVisibility = useCallback((id: string, isPublic: boolean) => {
        if (!storage) return;

        const updated = {
            ...storage,
            profiles: storage.profiles.map((profile) =>
                profile.id === id ? { ...profile, isPublic } : profile
            ),
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateProfileGrade = useCallback((id: string, grade: number) => {
        if (!storage) return;

        const updated = {
            ...storage,
            profiles: storage.profiles.map((profile) =>
                profile.id === id ? { ...profile, grade } : profile
            ),
        };

        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const updateFamilyCredentials = useCallback(async (pin: string) => {
        if (!storage) return;
        const hashedPin = await hashPinIfNeeded(pin);
        if (!hashedPin) return;

        const updated = {
            ...storage,
            familyCredentials: {
                username: "admin",
                pin: hashedPin,
            },
        };

        setStorage(updated);
        save(updated);
        await syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const upsertAdminAccount = useCallback(async (username: string, pin: string, displayName?: string) => {
        if (!storage) return;
        const hashedPin = await hashPinIfNeeded(pin);
        if (!hashedPin) return;

        const updated = {
            ...storage,
            adminAccount: {
                username: username.trim(),
                pin: hashedPin,
                displayName: displayName?.trim() || "Quan tri vien",
                updatedAt: new Date().toISOString(),
            },
        };

        setStorage(updated);
        save(updated);
        await syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const deleteGhostProfile = useCallback(async (sourceSyncId: string, profileId: string) => {
        const currentSyncId = localStorage.getItem("math_sync_id");
        if (sourceSyncId === currentSyncId || sourceSyncId === "local") {
            await deleteProfile(profileId);
            return;
        }

        const adminPayload = getAdminPayload();
        await postJson("/api/admin/profiles/delete", {
            ...adminPayload,
            targetSyncId: sourceSyncId,
            profileId,
        });

        setAllProfiles((prev) => prev.filter((item) => !(item.sourceSyncId === sourceSyncId && item.profile.id === profileId)));
        await fetchAllProfiles();
    }, [deleteProfile, fetchAllProfiles, getAdminPayload, setAllProfiles]);

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
        deleteGhostProfile,
    };
};


