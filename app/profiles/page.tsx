"use client";

import React, { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { getOverallRank, UserProfile } from "@/lib/mastery";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Lock, User, Trophy, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hasActiveAdminSession } from "@/lib/admin-session";
import { verifyPin } from "@/lib/pin-hash";
import { normalizeDisplayText } from "@/lib/text";

const PROFILE_AVATARS = Array.from(
    new Set([
        "\u{1F436}",
        "\u{1F431}",
        "\u{1F42D}",
        "\u{1F439}",
        "\u{1F430}",
        "\u{1F98A}",
        "\u{1F43B}",
        "\u{1F43C}",
        "\u{1F428}",
        "\u{1F42F}",
        "\u{1F981}",
        "\u{1F42E}",
        "\u{1F437}",
        "\u{1F438}",
        "\u{1F435}",
        "\u{1F424}",
        "\u{1F33B}",
        "\u{1F308}",
        "\u{2B50}",
        "\u{1F319}",
    ]),
);

type ProfileItem = {
    profile: UserProfile;
    sourceSyncId: string;
};

const AvatarGrid = React.memo(({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) => {
    return (
        <div className="grid h-32 grid-cols-5 gap-2 overflow-y-auto rounded-xl border-2 border-slate-200 bg-slate-50 p-2">
            {PROFILE_AVATARS.map((avatar) => (
                <button
                    key={avatar}
                    type="button"
                    onClick={() => onSelect(avatar)}
                    className={`rounded-lg p-2 text-2xl transition-all hover:bg-white hover:shadow-md ${selected === avatar ? "scale-110 bg-blue-100 ring-2 ring-blue-500" : ""}`}
                >
                    {avatar}
                </button>
            ))}
        </div>
    );
});
AvatarGrid.displayName = "AvatarGrid";

export default function ProfilesPage() {
    const { addProfile, switchProfile, allProfiles, isInitialized, storage, deleteGhostProfile, selectCloudProfile } = useProgress();
    const router = useRouter();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newProfileName, setNewProfileName] = useState("");
    const [createPin, setCreatePin] = useState("");
    const [createAvatar, setCreateAvatar] = useState(PROFILE_AVATARS[0]);

    const [unlockingProfile, setUnlockingProfile] = useState<ProfileItem | null>(null);
    const [unlockPin, setUnlockPin] = useState("");
    const [unlockError, setUnlockError] = useState("");

    const [deletingProfile, setDeletingProfile] = useState<ProfileItem | null>(null);

    const canManageProfiles = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();

    const leaderboard = useMemo(() => {
        if (allProfiles.length === 0) {
            return [];
        }

        return allProfiles
            .filter((item) => (item.profile.progress?.totalScore || 0) > 0 && item.profile.isPublic !== false)
            .map((item) => {
                const rank = getOverallRank(item.profile.progress);
                return {
                    id: item.profile.id,
                    name: item.profile.name,
                    total_score: item.profile.progress?.totalScore || 0,
                    tier: rank.label,
                };
            })
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 5);
    }, [allProfiles]);

    const openAdminGate = () => {
        router.push("/admin?next=/profiles");
    };

    const handleOpenAddModal = () => {
        if (!canManageProfiles) {
            openAdminGate();
            return;
        }
        setShowAddModal(true);
    };

    const handleAddProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canManageProfiles) {
            openAdminGate();
            return;
        }

        const trimmedName = newProfileName.trim();
        if (!trimmedName) return;

        const isDuplicate = allProfiles.some((item) => item.profile.name.toLowerCase() === trimmedName.toLowerCase());
        if (isDuplicate) {
            alert(normalizeDisplayText("Tên này đã tồn tại, vui lòng chọn tên khác!"));
            return;
        }

        if (createPin && createPin.length < 4) {
            alert(normalizeDisplayText("PIN của hồ sơ phải có ít nhất 4 số!"));
            return;
        }

        await addProfile(trimmedName, createPin || undefined, createAvatar, true);
        setShowAddModal(false);
        setNewProfileName("");
        setCreatePin("");
        setCreateAvatar(PROFILE_AVATARS[0]);
    };

    const finishProfileSelection = async (item: ProfileItem) => {
        const currentSyncId = localStorage.getItem("math_sync_id");
        if (item.sourceSyncId && item.sourceSyncId !== "local" && item.sourceSyncId !== currentSyncId) {
            await selectCloudProfile(item.sourceSyncId, item.profile.id);
        } else {
            await switchProfile(item.profile.id);
        }
        router.push("/subjects");
    };

    const handleSelect = async (item: ProfileItem) => {
        if (item.profile.pin) {
            setUnlockingProfile(item);
            setUnlockPin("");
            setUnlockError("");
            return;
        }

        await finishProfileSelection(item);
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unlockingProfile) return;

        const inputPin = unlockPin.trim();
        const profilePin = unlockingProfile.profile.pin ? String(unlockingProfile.profile.pin).trim() : "";

        const pinMatch = await verifyPin(inputPin, profilePin);
        if (!pinMatch) {
            setUnlockError(normalizeDisplayText("PIN của hồ sơ không đúng, thử lại nhé!"));
            setUnlockPin("");
            return;
        }

        const target = unlockingProfile;
        setUnlockingProfile(null);
        await finishProfileSelection(target);
    };

    const requestDelete = (item: ProfileItem) => {
        if (!canManageProfiles) {
            openAdminGate();
            return;
        }
        setDeletingProfile(item);
    };

    const confirmDelete = async () => {
        if (!deletingProfile) return;
        await deleteGhostProfile(deletingProfile.sourceSyncId, deletingProfile.profile.id);
        setDeletingProfile(null);
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="animate-spin text-blue-600">{normalizeDisplayText("Đang tải dữ liệu...")}</div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="absolute left-6 top-6 z-50">
                <Link href="/admin">
                    <button className="group flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-4 py-2 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-blue-600">
                        <Settings size={20} />
                        <span className="text-sm font-bold">{storage?.adminAccount?.pin ? normalizeDisplayText("Admin") : normalizeDisplayText("Thiết lập admin")}</span>
                    </button>
                </Link>
            </div>

            <div className="absolute right-6 top-6 z-50 flex items-center gap-3">
                <button
                    onClick={() => router.push("/login/parent")}
                    className="group flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-2 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-emerald-600"
                >
                    <div className="rounded-lg bg-emerald-50 p-1 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-bold">{normalizeDisplayText("Phụ huynh")}</span>
                </button>
                <button
                    onClick={handleOpenAddModal}
                    className="group flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-700 group-hover:text-slate-900">{normalizeDisplayText("Thêm hồ sơ")}</span>
                </button>
            </div>

            <div className="relative z-10 flex min-h-[80vh] w-full max-w-[95vw] flex-col items-center justify-center gap-8 lg:flex-row">
                <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-4 text-center">
                        <div className="mb-2 inline-block rounded-full bg-white p-4 shadow-xl">
                            <User size={40} className="text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">{normalizeDisplayText("Ai đang học vậy?")}</h1>
                        <p className="font-medium text-slate-500">{normalizeDisplayText("Chọn hồ sơ để bắt đầu nhé!")}</p>
                    </motion.div>

                    <div className="grid w-full grid-cols-2 justify-items-center gap-6 md:grid-cols-3 lg:grid-cols-4">
                        <AnimatePresence>
                            {allProfiles.map((item, index) => (
                                <motion.div
                                    key={`${item.sourceSyncId}-${item.profile.id}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative aspect-square w-full max-w-[180px]"
                                >
                                    <button
                                        onClick={() => void handleSelect(item)}
                                        className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[32px] border-4 border-transparent bg-white p-4 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-2xl"
                                    >
                                        <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110 md:text-6xl">
                                            {item.profile.avatar || "\u{1F9D2}"}
                                        </div>
                                        <h3 className="w-full truncate px-2 text-center text-lg font-black text-slate-800 md:text-xl">
                                            {item.profile.name}
                                        </h3>
                                        {item.profile.grade && (
                                            <span className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                                                Lớp {item.profile.grade}
                                            </span>
                                        )}
                                        {item.profile.pin && (
                                            <div className="absolute right-4 top-4 text-slate-300 transition-colors group-hover:text-blue-500">
                                                <Lock size={18} />
                                            </div>
                                        )}
                                    </button>

                                    {canManageProfiles && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                requestDelete(item);
                                            }}
                                            className="absolute -right-2 -top-2 z-10 rounded-full bg-rose-500 p-2 text-white opacity-0 shadow-lg transition-all hover:bg-rose-600 active:scale-90 group-hover:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="mt-12 w-full max-w-sm px-4 lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-80 lg:-translate-y-1/2 lg:px-0">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-[32px] border border-white/50 bg-white/80 p-5 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="mb-4 flex items-center gap-3 px-2">
                            <div className="rounded-xl bg-yellow-100 p-2.5 text-yellow-600">
                                <Trophy size={20} fill="currentColor" />
                            </div>
                            <div>
                            <h2 className="leading-tight text-slate-900 text-lg font-black">{normalizeDisplayText("Bảng vàng")}</h2>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{normalizeDisplayText("Top 5 xuất sắc")}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {leaderboard.length === 0 ? (
                                <div className="py-6 text-center text-xs font-medium text-slate-400">Đang tải...</div>
                            ) : (
                                leaderboard.map((user, idx) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 rounded-xl border p-2.5 transition-transform hover:scale-105 ${
                                            idx === 0 ? "border-yellow-200 bg-yellow-50 shadow-sm" : "border-slate-100 bg-white"
                                        }`}
                                    >
                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                                                idx === 0
                                                    ? "bg-yellow-400 text-yellow-900"
                                                    : idx === 1
                                                      ? "bg-slate-300 text-slate-700"
                                                      : idx === 2
                                                        ? "bg-orange-300 text-orange-900"
                                                        : "bg-slate-100 text-slate-400"
                                            }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-xs font-bold text-slate-900">{user.name}</h4>
                                            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                                {user.tier || normalizeDisplayText("Tập sự")}
                                            </p>
                                        </div>
                                        <div className="text-right leading-tight">
                                            <span className="block text-sm font-black text-blue-600">{user.total_score}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md space-y-4 rounded-[32px] bg-white p-8 shadow-2xl"
                        >
                             <h2 className="text-center text-2xl font-black text-slate-900">{normalizeDisplayText("Tạo hồ sơ mới")}</h2>
                            <p className="-mt-2 mb-4 text-center text-sm text-slate-500">{normalizeDisplayText("Bạn đang quản lý với vai trò admin.")}</p>

                            <form onSubmit={handleAddProfile} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">{normalizeDisplayText("Tên học sinh")}</label>
                                    <input
                                        type="text"
                                        placeholder={normalizeDisplayText("Tên của bé...")}
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 transition-all focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">{normalizeDisplayText("Chọn avatar")}</label>
                                    <AvatarGrid selected={createAvatar} onSelect={setCreateAvatar} />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">{normalizeDisplayText("PIN hồ sơ (tùy chọn)")}</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        placeholder={normalizeDisplayText("Nhập 4 số để bảo vệ hồ sơ...")}
                                        value={createPin}
                                        onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center font-bold tracking-widest text-slate-900 transition-all focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 rounded-xl py-3 font-bold text-slate-500 transition-colors hover:bg-slate-100"
                                    >
                                        {normalizeDisplayText("Hủy")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newProfileName.trim()}
                                        className="flex-1 rounded-xl bg-blue-600 py-3 font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {normalizeDisplayText("Tạo ngay")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {unlockingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setUnlockingProfile(null)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm rounded-[32px] border-4 border-white bg-white p-8 shadow-2xl"
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <Lock size={32} />
                            </div>
                             <h2 className="mb-2 text-center text-xl font-black text-slate-900">{normalizeDisplayText("Nhập PIN hồ sơ")}</h2>
                            <p className="mb-6 text-center text-sm text-slate-500">{normalizeDisplayText("Hồ sơ này được bảo vệ.")}</p>

                            <form onSubmit={handleUnlock} className="space-y-4">
                                <input
                                    autoFocus
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    enterKeyHint="go"
                                    autoComplete="one-time-code"
                                    value={unlockPin}
                                    onChange={(e) => {
                                        setUnlockPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                                        setUnlockError("");
                                    }}
                                    className={`w-full rounded-2xl border-2 bg-slate-50 px-6 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 transition-all focus:outline-none ${
                                        unlockError ? "border-rose-300 bg-rose-50 text-rose-600" : "border-slate-200 focus:border-blue-500"
                                    }`}
                                    placeholder="...."
                                />
                                {unlockError && <p className="animate-pulse text-center text-xs font-bold text-rose-500">{unlockError}</p>}
                                <button
                                    type="submit"
                                     className="mt-2 w-full rounded-2xl bg-slate-900 py-4 font-black text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
                                 >
                                     {normalizeDisplayText("Mở khóa")}
                                 </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deletingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeletingProfile(null)}
                            className="absolute inset-0 bg-slate-900/60"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full max-w-sm rounded-[32px] bg-white p-6 shadow-xl"
                        >
                            <h3 className="mb-4 text-lg font-bold text-slate-900">{normalizeDisplayText("Xóa hồ sơ này?")}</h3>
                            <p className="mb-4 text-sm text-slate-500">
                                {normalizeDisplayText("Bạn đang đăng nhập với vai trò admin. Hành động này không thể hoàn tác.")}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setDeletingProfile(null)} className="flex-1 rounded-[32px] bg-slate-100 py-2 font-bold">
                                    {normalizeDisplayText("Hủy")}
                                </button>
                                <button onClick={() => void confirmDelete()} className="flex-1 rounded-[32px] bg-rose-600 py-2 font-bold text-white">
                                    {normalizeDisplayText("Xóa vĩnh viễn")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
