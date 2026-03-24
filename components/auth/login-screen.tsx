"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { useRouter } from 'next/navigation';
import { User, KeyRound, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export function LoginScreen() {
    const { login, register, isSyncing, storage } = useProgress();

    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');

    // Form State
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username || !pin) {
            setError('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        if (mode === 'register' && !displayName) {
            setError('Vui lòng nhập tên hiển thị của bé!');
            return;
        }

        const res = mode === 'login'
            ? await login(username, pin)
            : await register(username, pin, displayName);

        if (!res.success) {
            setError(res.error || 'Có lỗi xảy ra!');
        } else {
            // Redirect to subjects page after successful login/register
            router.push('/subjects');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            {/* Admin Button */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl shadow-sm hover:bg-white hover:scale-105 transition-all group text-slate-500 hover:text-indigo-600"
                >
                    <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <KeyRound size={16} />
                    </div>
                    <span className="text-sm font-bold">
                        {storage?.familyCredentials?.pin ? 'Admin' : 'Thiết Lập Admin'}
                    </span>
                </button>
            </div>

            {/* Parent Button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    onClick={() => router.push('/login/parent')}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm hover:bg-white hover:scale-105 transition-all group text-slate-500 hover:text-emerald-600"
                >
                    <div className="p-1 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors text-emerald-600">
                        <User size={16} />
                    </div>
                    <span className="text-sm font-bold">Phụ Huynh</span>
                </button>
            </div>


            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 w-full max-w-md p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mb-4 transform -rotate-6">
                        <Sparkles size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                        {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                    </h1>
                    <p className="text-slate-500 font-medium">Học toán thật vui, cùng nhau tiến bộ! 🚀</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 relative">
                    <div
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${mode === 'login' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                    />
                    <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-black uppercase tracking-wider relative z-10 transition-colors ${mode === 'login' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Đăng Nhập
                    </button>
                    <button
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-3 text-sm font-black uppercase tracking-wider relative z-10 transition-colors ${mode === 'register' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Đăng Ký
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Tên đăng nhập (Ví dụ: bi, bo, bena...)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 transition-all shadow-sm group-hover:border-slate-200"
                            />
                        </div>

                        {mode === 'register' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="relative group"
                            >
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tên hiển thị của bé (Ví dụ: Bé Na)"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-purple-500 focus:outline-none font-bold text-slate-700 transition-all shadow-sm group-hover:border-slate-200"
                                />
                            </motion.div>
                        )}

                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="password"
                                inputMode="numeric"
                                placeholder="Mã PIN bí mật"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-500 focus:outline-none font-black text-slate-700 tracking-widest transition-all shadow-sm group-hover:border-slate-200"
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-rose-100"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        disabled={isSyncing}
                        className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 relative overflow-hidden group ${mode === 'login' ? 'bg-gradient-to-r from-indigo-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'}`}
                    >
                        {isSyncing ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <span>{mode === 'login' ? 'Vào Học Ngay' : 'Tạo Tài Khoản'}</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} size={20} />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs font-bold text-slate-400 mt-4">
                        {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button
                            type="button"
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                            className={`ml-1 hover:underline ${mode === 'login' ? 'text-indigo-500' : 'text-purple-500'}`}
                        >
                            {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
