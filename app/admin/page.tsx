"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { Lock, ShieldCheck, ArrowRight, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { clearAdminSession, hasActiveAdminSession, startAdminSession } from '@/lib/admin-session';
import { verifyPin } from '@/lib/pin-hash';

function getSafeNextPath(rawNext: string | null) {
    if (!rawNext || !rawNext.startsWith('/')) return '/admin/dashboard';
    if (rawNext.startsWith('//')) return '/admin/dashboard';
    return rawNext;
}

export default function AdminLoginPage() {
    const { storage, upsertAdminAccount, isInitialized, refreshData, logout } = useProgress();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = useMemo(() => getSafeNextPath(searchParams.get('next')), [searchParams]);

    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showReset, setShowReset] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowReset(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        if (!storage?.adminAccount) {
            clearAdminSession();
        }
    }, [isInitialized, storage]);

    const adminAccount = storage?.adminAccount;
    const isSetupMode = !adminAccount;
    const hasStoredAdminSession = !isSetupMode && hasActiveAdminSession();

    useEffect(() => {
        if (!storage?.adminAccount) {
            refreshData();
        }
    }, [refreshData, storage?.adminAccount]);

    const finishLogin = () => {
        startAdminSession();
        router.replace(redirectPath);
    };

    const handleLogoutSession = () => {
        clearAdminSession();
        logout();
        setShowLoginForm(true);
        setPin('');
        setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanUsername = (isSetupMode ? username : (adminAccount?.username || '')).trim().toLowerCase();
        const cleanPin = pin.trim();

        if (!cleanUsername || !cleanPin) {
            setError('Vui lòng nhập đầy đủ tài khoản và PIN admin.');
            return;
        }

        if (isSetupMode) {
            if (cleanPin.length < 4) {
                setError('PIN admin phải có ít nhất 4 số.');
                return;
            }

            setIsSubmitting(true);
            await upsertAdminAccount(cleanUsername, cleanPin, 'Quan tri vien');
            startAdminSession();
            router.replace(redirectPath);
            return;
        }

        if (cleanUsername === adminAccount.username.toLowerCase() && await verifyPin(cleanPin, String(adminAccount.pin))) {
            setIsSubmitting(true);
            finishLogin();
            return;
        }

        setError('Tài khoản admin hoặc PIN không chính xác.');
        setPin('');
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
                <div className="animate-spin text-white">Đang tải dữ liệu...</div>
                {showReset && (
                    <button
                        onClick={() => {
                            const keyword = prompt('Tính năng này sẽ xóa sạch dữ liệu. Vui lòng nhập MASTER KEYWORD:');
                            if (keyword === (process.env.NEXT_PUBLIC_MASTER_KEY || 'MAT_KHAU_TOI_THUONG')) {
                                clearAdminSession();
                                localStorage.clear();
                                window.location.reload();
                            } else if (keyword !== null) {
                                alert('Sai MASTER KEYWORD!');
                            }
                        }}
                        className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold shadow-lg hover:bg-rose-600 transition-all"
                    >
                        Reset ứng dụng (cần Master Keyword)
                    </button>
                )}
            </div>
        );
    }

    if (hasStoredAdminSession && !showLoginForm) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
                >
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Phiên admin đang hoạt động</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Tài khoản <span className="font-black text-slate-700">{adminAccount?.username}</span> vẫn còn đăng nhập trên thiết bị này.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => router.replace(redirectPath)}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Tiếp tục vào quản trị</span>
                            <ArrowRight size={18} />
                        </button>

                        <button
                            type="button"
                            onClick={handleLogoutSession}
                            className="w-full py-4 rounded-xl font-bold text-rose-600 bg-rose-50 border-2 border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} />
                            <span>Đăng xuất admin</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { clearAdminSession(); logout(); router.push('/profiles'); }}
                            className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
                        >
                            Quay lại màn hình chọn người dùng
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {isSetupMode ? 'Thiết lập tài khoản admin' : 'Đăng nhập admin'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">
                        {isSetupMode ? 'Tạo tài khoản quản trị riêng cho hệ thống.' : 'Chỉ tài khoản admin mới được quản lý học sinh.'}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={isSetupMode ? username : (adminAccount?.username || username)}
                                onChange={(e) => {
                                    setUsername(e.target.value.replace(/\s+/g, '').toLowerCase());
                                    setError('');
                                }}
                                disabled={!isSetupMode}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-indigo-500 focus:outline-none transition-all disabled:opacity-70"
                                placeholder="Tài khoản admin"
                                autoFocus
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-bold focus:border-indigo-500 focus:outline-none transition-all text-center tracking-[0.5em] text-2xl disabled:opacity-50"
                                placeholder="...."
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-rose-500 text-xs font-bold mt-2 text-center animate-pulse">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span>Đang xử lý...</span>
                        ) : (
                            <>
                                <span>{isSetupMode ? 'Tạo admin và tiếp tục' : 'Đăng nhập'}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => { clearAdminSession(); logout(); router.push('/profiles'); }}
                        className="w-full py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
                    >
                        Quay lại màn hình chọn người dùng
                    </button>
                </form>

                <div className="mt-4 flex justify-between text-xs text-slate-400">
                    <button
                        onClick={() => {
                            refreshData();
                            setError('Đang làm mới dữ liệu...');
                            setTimeout(() => setError(''), 1500);
                        }}
                        className="font-bold hover:text-blue-500 transition-colors"
                    >
                        Làm mới
                    </button>
                    <span>{isSetupMode ? 'Chưa có admin' : `Tài khoản: ${adminAccount?.username}`}</span>
                </div>
            </motion.div>
        </div>
    );
}


