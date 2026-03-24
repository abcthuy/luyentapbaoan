"use client";

const ADMIN_SESSION_KEY = "math_admin_session";
const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;

interface AdminSessionData {
    lastVerifiedAt: number;
    syncId: string | null;
}

function canUseSessionStorage() {
    return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function readAdminSession(): AdminSessionData | null {
    if (!canUseSessionStorage()) return null;

    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as AdminSessionData;
    } catch {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        return null;
    }
}

function getCurrentSyncId() {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
    return localStorage.getItem("math_sync_id");
}

export function startAdminSession(syncId = getCurrentSyncId()) {
    if (!canUseSessionStorage()) return;

    sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ lastVerifiedAt: Date.now(), syncId })
    );
}

export function clearAdminSession() {
    if (!canUseSessionStorage()) return;
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasActiveAdminSession() {
    const session = readAdminSession();
    if (!session) return false;

    if (session.syncId !== getCurrentSyncId()) {
        clearAdminSession();
        return false;
    }

    if (Date.now() - session.lastVerifiedAt > ADMIN_SESSION_TIMEOUT_MS) {
        clearAdminSession();
        return false;
    }

    return true;
}

export function touchAdminSession() {
    if (!hasActiveAdminSession()) return false;
    startAdminSession();
    return true;
}
