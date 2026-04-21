"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/components/progress-provider";
import { ArrowLeft, CheckCircle2, Search, Trash2, UserCircle, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from "@/lib/admin-session";
import type { ParentAccount } from "@/lib/mastery";
import { normalizeDisplayText } from "@/lib/text";

type AdminRequestBase = {
    syncId: string;
    username: string;
    pin: string;
};

type ParentDirectoryEntry = {
    parent: ParentAccount;
    childRefs: { childId: string; childSyncId: string }[];
    sourceSyncIds: string[];
    matchKey: string;
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

export default function AdminParentsPage() {
    const { storage, allProfiles, allParents, isInitialized, refreshData } = useProgress();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPin, setNewPin] = useState("");
    const [assigningParentKey, setAssigningParentKey] = useState<string | null>(null);
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
    const parentEntries = allParents as ParentDirectoryEntry[];

    const parentsWithChildren = useMemo(() => {
        return parentEntries.map((entry) => {
            const children = entry.childRefs
                .map((ref) => {
                    const child = allProfiles.find((item) => item.sourceSyncId === ref.childSyncId && item.profile.id === ref.childId);
                    return child ? { ...ref, profile: child.profile } : null;
                })
                .filter((item): item is { childId: string; childSyncId: string; profile: (typeof allProfiles)[number]["profile"] } => Boolean(item));

            return {
                ...entry,
                children,
            };
        });
    }, [allProfiles, parentEntries]);

    const filteredParents = parentsWithChildren.filter(({ parent }) => parent.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const assigningParent = parentsWithChildren.find((item) => item.matchKey === assigningParentKey) || null;

    const getAdminPayload = (): AdminRequestBase | null => {
        if (!adminUsername || !adminSyncId) {
            alert(normalizeDisplayText("Không tìm thấy thông tin admin hiện tại."));
            return null;
        }

        const pin = window.prompt(normalizeDisplayText("Nhập PIN admin để xác nhận thao tác:"))?.trim() || "";
        if (!pin) return null;

        return {
            syncId: adminSyncId,
            username: adminUsername,
            pin,
        };
    };

    const handleAddParent = async () => {
        if (!newName.trim()) {
            alert(normalizeDisplayText("Vui lòng nhập tên phụ huynh."));
            return;
        }
        if (newPin.length < 4) {
            alert(normalizeDisplayText("Mã PIN phải có ít nhất 4 số."));
            return;
        }

        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/parents/create", {
                ...adminPayload,
                name: newName.trim(),
                parentPin: newPin,
            });
            await refreshData();
            setNewName("");
            setNewPin("");
            setIsAdding(false);
        } catch (error) {
            alert(error instanceof Error ? error.message : normalizeDisplayText("Không thể tạo phụ huynh."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteParent = async (entry: ParentDirectoryEntry) => {
        if (!confirm(normalizeDisplayText(`Bạn có chắc muốn xóa tài khoản phụ huynh "${entry.parent.name}" trên tất cả account?`))) return;

        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/parents/delete", {
                ...adminPayload,
                parentId: entry.parent.id,
                parentName: entry.parent.name,
                parentPin: entry.parent.pin,
            });
            await refreshData();
        } catch (error) {
            alert(error instanceof Error ? error.message : normalizeDisplayText("Không thể xóa phụ huynh."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignChild = async (entry: ParentDirectoryEntry, childId: string, childSyncId: string) => {
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/parents/assign", {
                ...adminPayload,
                parentId: entry.parent.id,
                parentName: entry.parent.name,
                parentPin: entry.parent.pin,
                childId,
                childSyncId,
            });
            await refreshData();
            setAssigningParentKey(null);
        } catch (error) {
            alert(error instanceof Error ? error.message : normalizeDisplayText("Không thể gắn học sinh."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnassignChild = async (entry: ParentDirectoryEntry, childId: string, childSyncId: string) => {
        if (!confirm(normalizeDisplayText("Bạn có chắc muốn gỡ học sinh này khỏi phụ huynh?"))) return;

        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSubmitting(true);
            await postAdminJson("/api/admin/parents/unassign", {
                ...adminPayload,
                parentId: entry.parent.id,
                parentName: entry.parent.name,
                parentPin: entry.parent.pin,
                childId,
                childSyncId,
            });
            await refreshData();
        } catch (error) {
            alert(error instanceof Error ? error.message : normalizeDisplayText("Không thể gỡ học sinh."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin text-indigo-600">{normalizeDisplayText('Đang tải dữ liệu...')}</div>
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
                            className="flex h-10 w-10 items-center justify-center rounded-[32px] bg-white shadow-md transition-colors hover:bg-slate-100"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">{normalizeDisplayText('Quản lý phụ huynh')}</h1>
                            <p className="text-sm font-medium text-slate-500">{normalizeDisplayText('Quản lý phụ huynh và học sinh trên tất cả account')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 rounded-[32px] bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105 hover:bg-indigo-700"
                    >
                        <UserPlus size={20} />
                        <span>{normalizeDisplayText('Thêm phụ huynh')}</span>
                    </button>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 rounded-[32px] border border-slate-100 bg-white p-4 shadow-sm md:flex-row">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={normalizeDisplayText('Tìm kiếm theo tên...')}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-[32px] border-2 border-slate-100 bg-slate-50 py-2 pl-10 pr-4 font-medium transition-all focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="rounded-[32px] bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                        {normalizeDisplayText('Tổng số')}: {parentEntries.length}
                    </div>
                </div>

                <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4 font-black">{normalizeDisplayText('Tên phụ huynh')}</th>
                                    <th className="p-4 text-center font-black">PIN</th>
                                    <th className="p-4 font-black">{normalizeDisplayText('Học sinh quản lý')}</th>
                                    <th className="p-4 text-right font-black">{normalizeDisplayText('Thao tác')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredParents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center font-medium text-slate-400">
                                            {normalizeDisplayText('Không có tài khoản phụ huynh nào.')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParents.map((entry) => (
                                        <tr key={entry.matchKey} className="transition-colors hover:bg-slate-50/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-[32px] bg-emerald-100 text-emerald-600">
                                                        <UserCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{entry.parent.name}</div>
                                                        <div className="text-xs text-slate-400">{entry.sourceSyncIds.length} account</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-mono font-bold text-slate-600">****</td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {entry.children.map(({ childId, childSyncId, profile }) => (
                                                        <span
                                                            key={`${childSyncId}:${childId}`}
                                                            className="inline-flex items-center gap-2 rounded-[32px] border border-amber-200 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800"
                                                        >
                                                            <span>{profile.avatar || "*"} {profile.name}</span>
                                                            <span className="text-[10px] text-amber-700/80">{childSyncId}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleUnassignChild(entry, childId, childSyncId)}
                                                                disabled={isSubmitting}
                                                                className="rounded-[32px] p-0.5 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                                                                title={normalizeDisplayText("Gỡ học sinh")}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <button
                                                        onClick={() => setAssigningParentKey(entry.matchKey)}
                                                        className="rounded-[32px] bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-indigo-600"
                                                    >
                                                        + {normalizeDisplayText('Thêm bé')}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => void handleDeleteParent(entry)}
                                                    disabled={isSubmitting}
                                                    className="rounded-[32px] p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                                                    title={normalizeDisplayText("Xóa phụ huynh")}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
                                className="w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900">{normalizeDisplayText('Thêm phụ huynh')}</h2>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="rounded-[32px] bg-slate-100 p-2 transition-colors hover:bg-slate-200"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">{normalizeDisplayText('Tên phụ huynh / tên gọi')}</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(event) => setNewName(event.target.value)}
                                            className="w-full rounded-[32px] border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                                            placeholder={normalizeDisplayText('Ví dụ: Mẹ Tí, Bố Tèo...')}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">{normalizeDisplayText('Mã PIN (ít nhất 4 số)')}</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            value={newPin}
                                            onChange={(event) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                                            className="w-full rounded-[32px] border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                                            placeholder={normalizeDisplayText('Nhập 4 số...')}
                                        />
                                    </div>

                                    <button
                                        onClick={() => void handleAddParent()}
                                        disabled={isSubmitting}
                                        className="mt-4 w-full rounded-[32px] bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {normalizeDisplayText('Tạo tài khoản')}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {assigningParent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{normalizeDisplayText('Chọn bé quản lý')}</h3>
                                        <p className="text-sm text-slate-500">{normalizeDisplayText('Gắn học sinh từ tất cả account cho')} {assigningParent.parent.name}</p>
                                    </div>
                                    <button
                                        onClick={() => setAssigningParentKey(null)}
                                        className="rounded-[32px] bg-slate-100 p-2 hover:bg-slate-200"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>
                                <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                                    {allProfiles.length === 0 ? (
                                        <div className="space-y-2 p-4 text-center text-sm text-slate-400">
                                            <div>{normalizeDisplayText('Chưa có học sinh nào trong hệ thống.')}</div>
                                        </div>
                                    ) : (
                                        allProfiles.map(({ profile, sourceSyncId }) => {
                                            const refKey = `${sourceSyncId}:${profile.id}`;
                                            const isAssignedToCurrent = assigningParent.childRefs.some((child) => `${child.childSyncId}:${child.childId}` === refKey);
                                            const currentOwner = parentsWithChildren.find((entry) => entry.childRefs.some((child) => `${child.childSyncId}:${child.childId}` === refKey));

                                            return (
                                                <button
                                                    key={refKey}
                                                    disabled={isAssignedToCurrent || isSubmitting}
                                                    onClick={() => void handleAssignChild(assigningParent, profile.id, sourceSyncId)}
                                                    className={`w-full rounded-[32px] border-2 p-4 text-left transition-all ${isAssignedToCurrent ? "cursor-not-allowed border-indigo-500 bg-indigo-50 opacity-50" : "border-slate-100 hover:border-indigo-300 hover:bg-slate-50"}`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{profile.avatar || "*"}</span>
                                                            <div>
                                                                <div className="font-bold text-slate-900">{profile.name}</div>
                                                                <div className="text-xs text-slate-500">{normalizeDisplayText('Lớp')} {profile.grade || 2} · {sourceSyncId}</div>
                                                                {currentOwner && !isAssignedToCurrent ? (
                                                                    <div className="text-[11px] font-medium text-amber-600">{normalizeDisplayText('Đang được gắn cho')} {currentOwner.parent.name}. {normalizeDisplayText('Bấm để chuyển.')}</div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                        {isAssignedToCurrent ? <CheckCircle2 className="text-indigo-600" size={20} /> : null}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

