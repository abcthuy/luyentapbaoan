"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { ParentProfile } from '@/lib/mastery';
import { UserCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ParentOption = {
    parent: ParentProfile;
    sourceSyncId: string;
};

export default function ParentLoginPage() {
    const { allParents, isInitialized } = useProgress();
    const router = useRouter();

    const [selectedParent, setSelectedParent] = useState<ParentOption | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isInitialized) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-indigo-600">Đang tải...</div></div>;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent) return;

        const { parent, sourceSyncId } = selectedParent;

        if (pin === String(parent.pin)) {
            setIsSubmitting(true);
            
            const currentSyncId = localStorage.getItem('math_sync_id');
            if (sourceSyncId !== 'local' && sourceSyncId !== currentSyncId) {
                // Important: We need a way to switch family without knowing a child profile ID
                // For now, we manually set the syncId and refresh storage
                localStorage.setItem('math_sync_id', sourceSyncId);
            }

            sessionStorage.setItem('math_parent_session', parent.id);
            router.push('/parent/dashboard');
        } else {
            setError('Mã PIN không chính xác!');
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Phụ Huynh</h1>
                    <p className="text-slate-500 text-sm font-medium">Đăng nhập để xem tiến độ con em</p>
                </div>

                {!selectedParent ? (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center mb-4">Chọn Tài Khoản</h3>
                        {allParents.length === 0 ? (
                            <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium text-sm">Chưa có tài khoản phụ huynh nào.</p>
                                <p className="text-xs text-slate-400 mt-2">Vui lòng liên hệ Admin để tạo.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                {allParents.map(item => (
                                    <button
                                        key={item.parent.id}
                                        onClick={() => setSelectedParent(item)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600">
                                            <UserCircle size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-lg">{item.parent.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">Quản lý {item.parent.childrenIds.length} học sinh</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="w-full mt-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
                        >
                            Quay lại màn hình chính
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        <motion.form
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                                    <UserCircle size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-emerald-600 uppercase">Tài khoản</div>
                                    <div className="font-black text-slate-900">{selectedParent.parent.name}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedParent(null); setError(''); setPin(''); }}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                                >
                                    Đổi
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Mã PIN của bạn
                                </label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value);
                                        setError('');
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none transition-all text-center tracking-[0.5em] text-2xl"
                                    placeholder="••••"
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-rose-500 text-xs font-bold mt-2 text-center animate-pulse">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || pin.length < 4}
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span>Đang xác thực...</span>
                                ) : (
                                    <>
                                        <span>Đăng Nhập</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}
