"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from '@/lib/admin-session';
import { verifyPin } from '@/lib/pin-hash';

export default function AdminPasswordPage() {
    const { storage, upsertAdminAccount, isInitialized } = useProgress();
    const router = useRouter();

    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
                <div className="animate-spin text-slate-400">Đang tải dữ liệu...</div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!storage?.adminAccount?.pin || !(await verifyPin(currentPin, storage.adminAccount.pin))) {
            setMessage({ type: 'error', text: 'Mật khẩu hiện tại không đúng!' });
            return;
        }

        if (newPin.length < 4) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 4 số!' });
            return;
        }

        if (newPin !== confirmPin) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        await upsertAdminAccount(storage?.adminAccount?.username || 'admin', newPin, storage?.adminAccount?.displayName);
        touchAdminSession();
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });

        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');

        setTimeout(() => {
            router.push('/admin/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-slate-100"
            >
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Đổi mật khẩu admin</h1>
                        <p className="text-slate-500 text-xs font-medium">Bảo vệ quyền quản trị của bạn</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={currentPin}
                                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-indigo-500 focus:outline-none transition-all tracking-widest text-lg"
                                placeholder="...."
                                required
                            />
                            <ShieldAlert className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mật khẩu mới</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-indigo-500 focus:outline-none transition-all tracking-widest text-lg"
                            placeholder="...."
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nhập lại mật khẩu mới</label>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-indigo-500 focus:outline-none transition-all tracking-widest text-lg"
                            placeholder="...."
                            required
                        />
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-3 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all mt-4"
                    >
                        Lưu thay đổi
                    </button>
                </form>
            </motion.div>
        </div>
    );
}



