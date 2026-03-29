"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { ParentAccount } from '@/lib/mastery';
import { UserCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ParentOption = {
    parent: ParentAccount;
    childRefs: { childId: string; childSyncId: string }[];
    sourceSyncIds: string[];
    matchKey: string;
};

type ParentSession = {
    parentId: string;
    sourceSyncId: string;
    parentMatchKey: string;
};

const PARENT_SESSION_KEY = 'math_parent_session';

export default function ParentLoginPage() {
    const { allParents, isInitialized } = useProgress();
    const router = useRouter();

    const [selectedParent, setSelectedParent] = useState<ParentOption | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const parentOptions = useMemo(() => allParents, [allParents]);

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-indigo-600">Dang tai...</div></div>;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedParent) return;

        const { parent, sourceSyncIds, matchKey } = selectedParent;

        if (pin !== String(parent.pin)) {
            setError('Ma PIN khong chinh xac!');
            setPin('');
            return;
        }

        setIsSubmitting(true);

        const parentSession: ParentSession = {
            parentId: parent.id,
            sourceSyncId: sourceSyncIds[0] || '',
            parentMatchKey: matchKey,
        };

        if (parentSession.sourceSyncId) {
            localStorage.setItem('math_sync_id', parentSession.sourceSyncId);
        }
        sessionStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(parentSession));
        window.location.href = '/parent/dashboard';
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
                    <h1 className="text-2xl font-black text-slate-900">Phu Huynh</h1>
                    <p className="text-slate-500 text-sm font-medium">Dang nhap de xem tien do con em</p>
                </div>

                {!selectedParent ? (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center mb-4">Chon Tai Khoan</h3>
                        {parentOptions.length === 0 ? (
                            <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium text-sm">Chua co tai khoan phu huynh nao.</p>
                                <p className="text-xs text-slate-400 mt-2">Vui long lien he Admin de tao.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                {parentOptions.map((item) => (
                                    <button
                                        key={item.matchKey}
                                        onClick={() => setSelectedParent(item)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600">
                                            <UserCircle size={24} />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-lg">{item.parent.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">Quan ly {item.childRefs.length} hoc sinh</div>
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
                            Quay lai man hinh chinh
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
                                    <div className="text-xs font-bold text-emerald-600 uppercase">Tai khoan</div>
                                    <div className="font-black text-slate-900">{selectedParent.parent.name}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedParent(null); setError(''); setPin(''); }}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
                                >
                                    Doi
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ma PIN cua ban
                                </label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                                        setError('');
                                    }}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none transition-all text-center tracking-[0.5em] text-2xl"
                                    placeholder="...."
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
                                    <span>Dang xac thuc...</span>
                                ) : (
                                    <>
                                        <span>Dang Nhap</span>
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

