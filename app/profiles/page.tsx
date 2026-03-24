"use client";

import React, { useMemo, useState } from 'react';
import { useProgress } from '@/components/progress-provider';
import { getOverallRank, UserProfile } from '@/lib/mastery';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Lock, User, Trophy, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hasActiveAdminSession } from '@/lib/admin-session';

const PROFILE_AVATARS = Array.from(new Set(['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐤', '🌻', '🌈', '⭐', '🌙']));

type ProfileItem = {
    profile: UserProfile;
    sourceSyncId: string;
};

const AvatarGrid = React.memo(({ selected, onSelect }: { selected: string; onSelect: (avatar: string) => void }) => {
    return (
        <div className="grid grid-cols-5 gap-2 h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border-2 border-slate-200">
            {PROFILE_AVATARS.map((avatar) => (
                <button
                    key={avatar}
                    type="button"
                    onClick={() => onSelect(avatar)}
                    className={`text-2xl p-2 rounded-lg transition-all hover:bg-white hover:shadow-md ${selected === avatar ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : ''}`}
                >
                    {avatar}
                </button>
            ))}
        </div>
    );
});
AvatarGrid.displayName = 'AvatarGrid';

export default function ProfilesPage() {
    const { addProfile, switchProfile, allProfiles, isInitialized, storage, deleteGhostProfile, selectCloudProfile } = useProgress();
    const router = useRouter();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [createPin, setCreatePin] = useState('');
    const [createAvatar, setCreateAvatar] = useState(PROFILE_AVATARS[0]);

    const [unlockingProfile, setUnlockingProfile] = useState<ProfileItem | null>(null);
    const [unlockPin, setUnlockPin] = useState('');
    const [unlockError, setUnlockError] = useState('');

    const [deletingProfile, setDeletingProfile] = useState<ProfileItem | null>(null);

    const canManageProfiles = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();

    const leaderboard = useMemo(() => {
        if (allProfiles.length === 0) {
            return [];
        }

        return allProfiles
            .filter(item => (item.profile.progress?.totalScore || 0) > 0 && item.profile.isPublic !== false)
            .map(item => {
                const rank = getOverallRank(item.profile.progress);
                return {
                    id: item.profile.id,
                    name: item.profile.name,
                    total_score: item.profile.progress?.totalScore || 0,
                    tier: rank.label
                };
            })
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 5);
    }, [allProfiles]);

    const openAdminGate = () => {
        router.push('/admin?next=/profiles');
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

        const isDuplicate = allProfiles.some(item => item.profile.name.toLowerCase() === trimmedName.toLowerCase());
        if (isDuplicate) {
            alert('Tên này đã tồn tại, vui lòng chọn tên khác!');
            return;
        }

        if (createPin && createPin.length < 4) {
            alert('PIN của hồ sơ phải có ít nhất 4 số!');
            return;
        }

        await addProfile(trimmedName, createPin || undefined, createAvatar, true);
        setShowAddModal(false);
        setNewProfileName('');
        setCreatePin('');
        setCreateAvatar(PROFILE_AVATARS[0]);
    };

    const finishProfileSelection = async (item: ProfileItem) => {
        const currentSyncId = localStorage.getItem('math_sync_id');
        if (item.sourceSyncId && item.sourceSyncId !== 'local' && item.sourceSyncId !== currentSyncId) {
            await selectCloudProfile(item.sourceSyncId, item.profile.id);
        } else {
            await switchProfile(item.profile.id);
        }
        router.push('/subjects');
    };

    const handleSelect = async (item: ProfileItem) => {
        if (item.profile.pin) {
            setUnlockingProfile(item);
            setUnlockPin('');
            setUnlockError('');
            return;
        }

        await finishProfileSelection(item);
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unlockingProfile) return;

        const inputPin = unlockPin.trim();
        const profilePin = unlockingProfile.profile.pin ? String(unlockingProfile.profile.pin).trim() : '';

        if (inputPin !== profilePin) {
            setUnlockError('PIN của hồ sơ không đúng, thử lại nhé!');
            setUnlockPin('');
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
        return <div className="min-h-screen flex items-center justify-center bg-blue-50"><div className="animate-spin text-blue-600">Đang tải dữ liệu...</div></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="absolute top-6 left-6 z-50">
                <Link href="/admin">
                    <button className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl shadow-sm hover:bg-white hover:scale-105 transition-all group text-slate-500 hover:text-blue-600">
                        <Settings size={20} />
                        <span className="text-sm font-bold">{storage?.adminAccount?.pin ? 'Admin' : 'Thiết lập admin'}</span>
                    </button>
                </Link>
            </div>

            <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
                <button
                    onClick={() => router.push('/login/parent')}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm hover:bg-white hover:scale-105 transition-all group text-slate-500 hover:text-emerald-600"
                >
                    <div className="p-1 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors text-emerald-600">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-bold">Phụ huynh</span>
                </button>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl shadow-lg hover:bg-white hover:scale-105 transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-700 group-hover:text-slate-900">Thêm hồ sơ</span>
                </button>
            </div>

            <div className="relative z-10 w-full max-w-[95vw] flex flex-col lg:flex-row items-center justify-center gap-8 min-h-[80vh]">
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10 space-y-4"
                    >
                        <div className="inline-block p-4 rounded-full bg-white shadow-xl mb-2">
                            <User size={40} className="text-blue-600" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Ai đang học vậy?
                        </h1>
                        <p className="text-slate-500 font-medium">Chọn hồ sơ để bắt đầu nhé!</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center">
                        <AnimatePresence>
                            {allProfiles.map((item, index) => (
                                <motion.div
                                    key={`${item.sourceSyncId}-${item.profile.id}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative w-full aspect-square max-w-[180px]"
                                >
                                    <button
                                        onClick={() => handleSelect(item)}
                                        className="w-full h-full bg-white rounded-[32px] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center p-4 border-4 border-transparent hover:border-blue-400 relative overflow-hidden"
                                    >
                                        <div className="text-5xl md:text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                            {item.profile.avatar || '🧒'}
                                        </div>
                                        <h3 className="text-lg md:text-xl font-black text-slate-800 truncate w-full px-2 text-center">
                                            {item.profile.name}
                                        </h3>
                                        {item.profile.grade && (
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Lớp {item.profile.grade}
                                            </span>
                                        )}
                                        {item.profile.pin && (
                                            <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors">
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
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:bg-rose-600 active:scale-90 transition-all z-10 opacity-0 group-hover:opacity-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-full max-w-sm lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-80 mt-12 lg:mt-0 px-4 lg:px-0">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[32px] p-5 shadow-2xl border border-white/50"
                    >
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl">
                                <Trophy size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-tight">Bảng vàng</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top 5 xuất sắc</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {leaderboard.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-xs font-medium">Đang tải...</div>
                            ) : (
                                leaderboard.map((user, idx) => (
                                    <div key={user.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-transform hover:scale-105 ${idx === 0 ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-white border-slate-100'}`}>
                                        <div className={`w-6 h-6 flex items-center justify-center rounded-full font-black text-xs ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate text-xs">{user.name}</h4>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">{user.tier || 'Tập sự'}</p>
                                        </div>
                                        <div className="text-right leading-tight">
                                            <span className="block font-black text-blue-600 text-sm">{user.total_score}</span>
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
                            className="relative bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl space-y-4"
                        >
                            <h2 className="text-2xl font-black text-slate-900 text-center">Tạo hồ sơ mới</h2>
                            <p className="text-slate-500 text-sm text-center -mt-2 mb-4">Bạn đang quản lý với vai trò admin.</p>

                            <form onSubmit={handleAddProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tên học sinh</label>
                                    <input
                                        type="text"
                                        placeholder="Tên của bé..."
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn avatar</label>
                                    <AvatarGrid selected={createAvatar} onSelect={setCreateAvatar} />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PIN hồ sơ (tùy chọn)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        placeholder="Nhập 4 số để bảo vệ hồ sơ..."
                                        value={createPin}
                                        onChange={(e) => setCreatePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-all tracking-widest text-center"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newProfileName.trim()}
                                        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Tạo ngay
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
                            className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl border-4 border-white"
                        >
                            <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-2 text-center">Nhập PIN hồ sơ</h2>
                            <p className="text-slate-500 text-sm text-center mb-6">Hồ sơ này được bảo vệ.</p>

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
                                        setUnlockPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                        setUnlockError('');
                                    }}
                                    className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 text-3xl font-black text-center text-slate-900 tracking-[0.5em] focus:outline-none transition-all ${unlockError ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 focus:border-blue-500'}`}
                                    placeholder="...."
                                />
                                {unlockError && (
                                    <p className="text-rose-500 text-xs font-bold text-center animate-pulse">
                                        {unlockError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all mt-2"
                                >
                                    Mở khóa
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
                            className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
                        >
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Xóa hồ sơ này?</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Bạn đang đăng nhập với vai trò admin. Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeletingProfile(null)}
                                    className="flex-1 py-2 rounded-lg bg-slate-100 font-bold"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 rounded-lg bg-rose-600 text-white font-bold"
                                >
                                    Xóa vĩnh viễn
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
