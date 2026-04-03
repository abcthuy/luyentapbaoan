import { useState, useRef, useEffect, useCallback } from "react";
import { AppStorage } from "@/lib/mastery";
import { getDeviceId } from "@/lib/device";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const parseStorage = (raw: string | null): AppStorage | null => {
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AppStorage;
    } catch (error) {
        console.error("Failed to parse local app storage", error);
        return null;
    }
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

export const useAuth = (
    storage: AppStorage | null,
    setStorage: (s: AppStorage | null) => void,
    save: (s: AppStorage) => void,
    syncToCloud: (s: AppStorage) => Promise<void>,
    setIsSyncing: (b: boolean) => void
) => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const logout = useCallback(() => {
        if (!storage) return;
        const updated = { ...storage, activeProfileId: null, activeSession: null };
        sessionStorage.removeItem("math_session");
        localStorage.removeItem("math_current_user");
        setCurrentUser(null);
        setStorage(updated);
        save(updated);
        syncToCloud(updated);
    }, [storage, setStorage, save, syncToCloud]);

    const logoutRef = useRef(logout);
    useEffect(() => {
        logoutRef.current = logout;
    });

    useEffect(() => {
        const checkSession = () => {
            const parsed = parseStorage(localStorage.getItem("math_progress_multi"));
            if (!parsed?.activeProfileId || !parsed.lastActive) return;

            if (Date.now() - parsed.lastActive > SESSION_TIMEOUT_MS) {
                if (logoutRef.current) logoutRef.current();
            }
        };

        const interval = setInterval(checkSession, 60000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                checkSession();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const savedUser = localStorage.getItem("math_current_user");
        if (savedUser) setCurrentUser(savedUser);
    }, []);

    const login = async (username: string, pin: string): Promise<{ success: boolean; error?: string }> => {
        setIsSyncing(true);
        try {
            const payload = await postJson<{
                success: boolean;
                syncId: string;
                username: string;
                storage: AppStorage;
            }>("/api/account/login", {
                username,
                pin: pin.trim(),
                deviceId: getDeviceId(),
            });

            localStorage.setItem("math_sync_id", payload.syncId);
            localStorage.setItem("math_current_user", payload.username);
            sessionStorage.setItem("math_session", "active");
            setStorage(payload.storage);
            save(payload.storage);
            setCurrentUser(payload.username);
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Loi ket noi server.",
            };
        } finally {
            setIsSyncing(false);
        }
    };

    const register = async (username: string, pin: string, name: string): Promise<{ success: boolean; error?: string }> => {
        setIsSyncing(true);
        try {
            const payload = await postJson<{
                success: boolean;
                syncId: string;
                username: string;
                storage: AppStorage;
            }>("/api/account/register", {
                username,
                pin,
                name,
            });

            localStorage.setItem("math_sync_id", payload.syncId);
            localStorage.setItem("math_current_user", payload.username);
            sessionStorage.setItem("math_session", "active");
            setStorage(payload.storage);
            save(payload.storage);
            setCurrentUser(payload.username);
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Loi tao tai khoan.",
            };
        } finally {
            setIsSyncing(false);
        }
    };

    return {
        currentUser,
        login,
        register,
        logout,
    };
};
