"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { ArrowLeft, Trash2, Edit, Search, CheckCircle2, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from '@/lib/admin-session';

export default function AdminUsersPage() {
    const { storage, allProfiles, deleteGhostProfile, updateProfilePinBySource, isInitialized, addProfile } = useProgress();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPinId, setEditingPinId] = useState<string | null>(null);
    const [newPin, setNewPin] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newProfilePin, setNewProfilePin] = useState('');

    useEffect(() => {
        if (!isInitialized) return;

        const isAuthorized = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();
        if (!isAuthorized) {
            clearAdminSession();
            router.replace('/admin');
            return;
        }

        touchAdminSession();
    }, [isInitialized, router, storage]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin text-indigo-600">Đang tải dữ liệu...</div>
            </div>
        );
    }

    const filteredProfiles = allProfiles.filter(item =>
        item.profile.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUpdatePin = async (sourceSyncId: string, id: string) => {
        if (newPin.length < 4) {
            alert('Mã PIN phải có ít nhất 4 số!');
            return;
        }

        await updateProfilePinBySource(sourceSyncId, id, newPin);
        setEditingPinId(null);
        setNewPin('');
    };

    const handleAddProfile = () => {
        if (!newName.trim()) {
            alert('Vui lòng nhập tên học viên!');
            return;
        }
        if (newProfilePin && newProfilePin.length < 4) {
            alert('Mã PIN phải có ít nhất 4 số!');
            return;
        }

        addProfile(newName.trim(), newProfilePin || undefined, undefined, true);
        setNewName('');
        setNewProfilePin('');
        setIsAdding(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Quản lý học viên</h1>
                            <p className="text-slate-500 text-sm font-medium">Danh sách tất cả tài khoản học sinh</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
                    >
                        <UserPlus size={20} />
                        <span>Thêm học viên</span>
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="flex gap-4 text-sm font-bold text-slate-600">
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl">
                            Tổng số: {allProfiles.length}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-black w-20">Avatar</th>
                                    <th className="p-4 font-black">Họ tên</th>
                                    <th className="p-4 font-black">Cấp độ</th>
                                    <th className="p-4 font-black text-center">Điểm số</th>
                                    <th className="p-4 font-black text-center">PIN</th>
                                    <th className="p-4 font-black text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProfiles.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                                            Không tìm thấy học viên nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProfiles.map((item) => {
                                        const p = item.profile;
                                        return (
                                            <tr key={`${item.sourceSyncId}-${p.id}`} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                                                        {p.avatar || '🎓'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-900">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{p.id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-slate-600">
                                                    Lớp {p.grade || 2}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-black">
                                                        {p.progress?.totalScore || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {editingPinId === p.id ? (
                                                        <div className="flex items-center gap-2 justify-center">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                                maxLength={4}
                                                                className="w-16 px-2 py-1 bg-white border-2 border-indigo-200 rounded-lg text-center font-bold text-sm focus:outline-none focus:border-indigo-500"
                                                                value={newPin}
                                                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                                placeholder="PIN"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleUpdatePin(item.sourceSyncId, p.id)}
                                                                className="p-1 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => { setEditingPinId(null); setNewPin(''); }}
                                                                className="p-1 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-sm font-mono text-slate-400">
                                                                {p.pin ? '••••' : 'Không có'}
                                                            </span>
                                                            <button
                                                                onClick={() => { setEditingPinId(p.id); setNewPin(''); }}
                                                                className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Đổi PIN"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {showDeleteConfirm === p.id ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-xs font-bold text-rose-500 animate-pulse">Xóa thật?</span>
                                                            <button
                                                                onClick={() => {
                                                                    deleteGhostProfile(item.sourceSyncId, p.id);
                                                                    setShowDeleteConfirm(null);
                                                                }}
                                                                className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 shadow-md shadow-rose-200"
                                                            >
                                                                Có
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(null)}
                                                                className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(p.id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Xóa tài khoản"
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
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Thêm học viên</h2>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tên học viên</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-900"
                                            placeholder="Nhập tên..."
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Mã PIN bảo vệ (Tùy chọn)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            value={newProfilePin}
                                            onChange={(e) => setNewProfilePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-900"
                                            placeholder="Nhập 4 số..."
                                        />
                                        <p className="text-xs text-slate-400 mt-1 font-medium">Để trống nếu không muốn dùng mật khẩu.</p>
                                    </div>

                                    <button
                                        onClick={handleAddProfile}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all mt-4"
                                    >
                                        Tạo tài khoản
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
