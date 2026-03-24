"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { ArrowLeft, Trash2, UserPlus, X, Search, CheckCircle2, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from '@/lib/admin-session';

export default function AdminParentsPage() {
    const { storage, allProfiles, addParent, assignChildToParent, isInitialized, updateFullStorage } = useProgress();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPin, setNewPin] = useState('');
    const [assigningParentId, setAssigningParentId] = useState<string | null>(null);

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

    const currentParents = storage?.parents || [];
    const filteredParents = currentParents.filter(parent =>
        parent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddParent = () => {
        if (!newName.trim()) {
            alert('Vui lòng nhập tên phụ huynh!');
            return;
        }
        if (newPin.length < 4) {
            alert('Mã PIN phải có ít nhất 4 số để bảo mật!');
            return;
        }

        addParent(newName.trim(), newPin);
        setNewName('');
        setNewPin('');
        setIsAdding(false);
    };

    const handleDeleteParent = (id: string) => {
        if (!storage) return;
        if (confirm('Bạn có chắc muốn xóa tài khoản phụ huynh này?')) {
            const updatedParents = currentParents.filter(parent => parent.id !== id);
            updateFullStorage({ ...storage, parents: updatedParents });
        }
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
                            <h1 className="text-2xl font-black text-slate-900">Quản lý phụ huynh</h1>
                            <p className="text-slate-500 text-sm font-medium">Danh sách tài khoản kiểm duyệt thẻ quà tặng</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
                    >
                        <UserPlus size={20} />
                        <span>Thêm phụ huynh</span>
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
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
                        Tổng số: {currentParents.length}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-black">Tên phụ huynh</th>
                                    <th className="p-4 font-black text-center">Mã PIN</th>
                                    <th className="p-4 font-black">Học sinh quản lý</th>
                                    <th className="p-4 font-black text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredParents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                                            Không có tài khoản phụ huynh nào.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParents.map((parent) => (
                                        <tr key={parent.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <UserCircle size={24} />
                                                    </div>
                                                    <div className="font-bold text-slate-900">{parent.name}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-mono font-bold text-slate-600">
                                                {parent.pin}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {parent.childrenIds.map(childId => {
                                                        const childProfile = allProfiles.find(item => item.profile.id === childId)?.profile;
                                                        return (
                                                            <span key={childId} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs font-bold border border-amber-200 flex items-center gap-1">
                                                                {childProfile?.avatar} {childProfile?.name || 'Không rõ'}
                                                            </span>
                                                        );
                                                    })}
                                                    <button
                                                        onClick={() => setAssigningParentId(parent.id)}
                                                        className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 hover:text-indigo-600 transition-colors"
                                                    >
                                                        + Thêm bé
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteParent(parent.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Xóa phụ huynh"
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
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-slate-900">Thêm phụ huynh</h2>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tên phụ huynh / Tên gọi</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-900"
                                            placeholder="Ví dụ: Mẹ Tí, Bố Tèo..."
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Mã PIN (Yêu cầu ít nhất 4 số)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={4}
                                            value={newPin}
                                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-900"
                                            placeholder="Nhập 4 số..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleAddParent}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all mt-4"
                                    >
                                        Tạo tài khoản
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {assigningParentId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-900">Chọn bé quản lý</h3>
                                    <button
                                        onClick={() => setAssigningParentId(null)}
                                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto space-y-2">
                                    {allProfiles.length === 0 ? (
                                        <div className="text-center text-slate-400 text-sm p-4">Chưa có học sinh nào trên hệ thống.</div>
                                    ) : (
                                        allProfiles.map(item => {
                                            const isAssigned =
                                                currentParents.find(parent => parent.id === assigningParentId)?.childrenIds.includes(item.profile.id);

                                            return (
                                                <button
                                                    key={`${item.sourceSyncId}-${item.profile.id}`}
                                                    disabled={isAssigned}
                                                    onClick={() => {
                                                        assignChildToParent(assigningParentId, item.profile.id);
                                                        setAssigningParentId(null);
                                                    }}
                                                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isAssigned ? 'border-indigo-500 bg-indigo-50 opacity-50 cursor-not-allowed' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{item.profile.avatar}</span>
                                                        <div className="text-left">
                                                            <div className="font-bold text-slate-900">{item.profile.name}</div>
                                                            <div className="text-xs text-slate-500">Lớp {item.profile.grade}</div>
                                                        </div>
                                                    </div>
                                                    {isAssigned && <CheckCircle2 className="text-indigo-600" size={20} />}
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
