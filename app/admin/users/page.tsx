"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/components/progress-provider";
import { ArrowLeft, CheckCircle2, Edit, Search, Trash2, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from "@/lib/admin-session";

type AdminRequestBase = {
    syncId: string;
    username: string;
    pin: string;
};

async function postAdminJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
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

export default function AdminUsersPage() {
    const { storage, allProfiles, isInitialized, refreshData } = useProgress();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPinId, setEditingPinId] = useState<string | null>(null);
    const [newPin, setNewPin] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newProfilePin, setNewProfilePin] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isInitialized) return;

        const isAuthorized = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();
        if (!isAuthorized) {
            clearAdminSession();
            router.replace("/admin");
            return;
        }

        touchAdminSession();
    }, [isInitialized, router, storage]);

    const adminUsername = storage?.adminAccount?.username?.trim() || "";
    const adminSyncId = typeof window !== "undefined" ? localStorage.getItem("math_sync_id")?.trim() || "" : "";

    const filteredProfiles = useMemo(() => {
        return allProfiles.filter((item) => item.profile.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allProfiles, searchTerm]);

    const getAdminPayload = (): AdminRequestBase | null => {
        if (!adminUsername || !adminSyncId) {
            alert("Khong tim thay thong tin admin hien tai.");
            return null;
        }

        const pin = window.prompt("Nhap PIN admin de xac nhan thao tac:")?.trim() || "";
        if (!pin) return null;

        return {
            syncId: adminSyncId,
            username: adminUsername,
            pin,
        };
    };

    const handleUpdatePin = async (sourceSyncId: string, profileId: string) => {
        if (newPin && newPin.length < 4) {
            alert("Ma PIN phai co it nhat 4 so.");
            return;
        }

        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/profiles/pin", {
                ...adminPayload,
                targetSyncId: sourceSyncId,
                profileId,
                newPin,
            });
            await refreshData();
            setEditingPinId(null);
            setNewPin("");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Khong the cap nhat PIN.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddProfile = async () => {
        if (!newName.trim()) {
            alert("Vui long nhap ten hoc vien.");
            return;
        }
        if (newProfilePin && newProfilePin.length < 4) {
            alert("Ma PIN phai co it nhat 4 so.");
            return;
        }

        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/profiles/create", {
                ...adminPayload,
                name: newName.trim(),
                profilePin: newProfilePin || undefined,
                skipAutoLogin: true,
            });
            await refreshData();
            setNewName("");
            setNewProfilePin("");
            setIsAdding(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Khong the tao hoc vien.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProfile = async (sourceSyncId: string, profileId: string) => {
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/profiles/delete", {
                ...adminPayload,
                targetSyncId: sourceSyncId,
                profileId,
            });
            await refreshData();
            setShowDeleteConfirm(null);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Khong the xoa hoc vien.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin text-indigo-600">Dang tai du lieu...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/admin/dashboard")}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Quan ly hoc vien</h1>
                            <p className="text-sm font-medium text-slate-500">Danh sach tat ca tai khoan hoc sinh</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700"
                    >
                        <UserPlus size={20} />
                        <span>Them hoc vien</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tim kiem theo ten..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-2 pl-10 pr-4 font-medium transition-all focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                        Tong so: {allProfiles.length}
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="w-20 p-4 font-black">Avatar</th>
                                    <th className="p-4 font-black">Ho ten</th>
                                    <th className="p-4 font-black">Cap do</th>
                                    <th className="p-4 text-center font-black">Diem so</th>
                                    <th className="p-4 text-center font-black">PIN</th>
                                    <th className="p-4 text-right font-black">Thao tac</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProfiles.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center font-medium text-slate-400">
                                            Khong tim thay hoc vien nao.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProfiles.map((item) => {
                                        const profile = item.profile;
                                        return (
                                            <tr key={`${item.sourceSyncId}-${profile.id}`} className="group transition-colors hover:bg-slate-50/50">
                                                <td className="p-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-xl shadow-sm">
                                                        {profile.avatar || "*"}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-900">{profile.name}</div>
                                                    <div className="font-mono text-[10px] text-slate-400">{profile.id.slice(0, 8)}...</div>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-slate-600">Lop {profile.grade || 2}</td>
                                                <td className="p-4 text-center">
                                                    <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                                                        {profile.progress?.totalScore || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {editingPinId === profile.id ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={4}
                                                                className="w-16 rounded-lg border-2 border-indigo-200 bg-white px-2 py-1 text-center text-sm font-bold focus:border-indigo-500 focus:outline-none"
                                                                value={newPin}
                                                                onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                                                                placeholder="PIN"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => void handleUpdatePin(item.sourceSyncId, profile.id)}
                                                                disabled={isSubmitting}
                                                                className="rounded-lg bg-emerald-100 p-1 text-emerald-600 hover:bg-emerald-200 disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingPinId(null);
                                                                    setNewPin("");
                                                                }}
                                                                className="rounded-lg bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 transition-opacity group-hover:opacity-100">
                                                            <span className="text-sm font-mono text-slate-400">{profile.pin ? "****" : "Khong co"}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingPinId(profile.id);
                                                                    setNewPin("");
                                                                }}
                                                                className="p-1 text-slate-300 opacity-0 transition-colors group-hover:opacity-100 hover:text-indigo-500"
                                                                title="Doi PIN"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {showDeleteConfirm === profile.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="animate-pulse text-xs font-bold text-rose-500">Xoa that?</span>
                                                            <button
                                                                onClick={() => void handleDeleteProfile(item.sourceSyncId, profile.id)}
                                                                disabled={isSubmitting}
                                                                className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-600 disabled:opacity-50"
                                                            >
                                                                Co
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(null)}
                                                                className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-300"
                                                            >
                                                                Huy
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(profile.id)}
                                                            className="rounded-xl p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500"
                                                            title="Xoa tai khoan"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900">Them hoc vien</h2>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">Ten hoc vien</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(event) => setNewName(event.target.value)}
                                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                                            placeholder="Nhap ten..."
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">Ma PIN bao ve (tuy chon)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            value={newProfilePin}
                                            onChange={(event) => setNewProfilePin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                                            placeholder="Nhap 4 so..."
                                        />
                                        <p className="mt-1 text-xs font-medium text-slate-400">De trong neu khong muon dung mat khau.</p>
                                    </div>

                                    <button
                                        onClick={() => void handleAddProfile()}
                                        disabled={isSubmitting}
                                        className="mt-4 w-full rounded-2xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Tao tai khoan
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
