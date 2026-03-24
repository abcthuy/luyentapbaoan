"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react';

interface AttendanceProps {
    available: boolean;
    onClaim: () => void;
    lastClaimDate?: string;
    streak: number;
}

export const Attendance: React.FC<AttendanceProps> = ({ available, onClaim, streak }) => {
    // Current week dates for display
    const days = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];
    const today = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const displayToday = today === 0 ? 6 : today - 1; // Adjust to start with Monday (Th 2)

    const milestones = [
        { day: 10, reward: '📖', label: 'Truyện Tranh' },
        { day: 20, reward: '🤖', label: 'Robot' },
        { day: 30, reward: '🎟️', label: 'Vé Đi Chơi' }
    ];

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 shadow-xl border-4 border-white/50 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-[100px] -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Điểm Danh</h2>
                            <p className="text-xs font-bold text-slate-400">Chuỗi hiện tại: <span className="text-amber-600 font-black">{streak} ngày</span> 🔥</p>
                        </div>
                    </div>

                    {available ? (
                        <div className="px-4 py-2 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center gap-2 animate-bounce">
                            <span className="text-xl">🎁</span>
                            <span className="text-xs font-black text-rose-600 uppercase">Có quà!</span>
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className="text-xs font-black text-emerald-600 uppercase">Đã xong</span>
                        </div>
                    )}
                </div>

                {/* Week Tracker */}
                <div className="grid grid-cols-7 gap-2 mb-8">
                    {days.map((day, idx) => {
                        const isPast = idx < displayToday;
                        const isToday = idx === displayToday;
                        const isDone = isPast || (isToday && !available);

                        return (
                            <div key={day} className="flex flex-col items-center gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-amber-600' : 'text-slate-400'}`}>
                                    {day}
                                </span>
                                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all border-2 ${isDone
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-600 shadow-inner'
                                    : isToday
                                        ? 'bg-amber-50 border-amber-400 text-amber-600 shadow-md scale-110 ring-2 ring-amber-200 ring-offset-2'
                                        : 'bg-slate-50 border-slate-100 text-slate-300'
                                    }`}>
                                    {isDone ? '✨' : isToday ? '⭐' : '🎁'}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Milestones Info */}
                <div className="mb-8 p-5 bg-gradient-to-br from-white to-slate-50/30 rounded-[24px] border-2 border-slate-50 shadow-inner">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-amber-500" />
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quà tặng tích lũy</h3>
                    </div>
                    <div className="flex justify-between items-center relative py-2">
                        {/* Connecting Line */}
                        <div className="absolute top-7 left-5 right-5 h-[2px] bg-slate-100 -z-0"></div>

                        {milestones.map((m) => {
                            const reached = streak >= m.day;
                            return (
                                <div key={m.day} className={`flex flex-col items-center gap-2 relative z-10 transition-all duration-500 ${reached ? 'scale-105' : 'opacity-60'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-colors ${reached ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-lg shadow-amber-100' : 'bg-white border-slate-200'}`}>
                                        {m.reward}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] font-black ${reached ? 'text-amber-700' : 'text-slate-500'}`}>{m.day} Ngày</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{m.label}</span>
                                    </div>
                                    {reached && (
                                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 size={10} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Claim Section */}
                {available ? (
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClaim}
                        className="w-full bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-200 p-6 rounded-[24px] text-amber-900 border-2 border-amber-200 shadow-xl shadow-amber-100/50 flex items-center justify-between group/btn overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                🧧
                            </div>
                            <div className="text-left">
                                <div className="text-lg font-black leading-none text-slate-900">Bấm Để Nhận Quà</div>
                                <div className="text-xs font-bold text-amber-700/80 mt-1 uppercase tracking-widest text-dark-amber">+1.000đ Mỗi Ngày</div>
                            </div>
                        </div>
                        <ChevronRight size={24} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.button>
                ) : (
                    <div className="w-full bg-slate-50 p-6 rounded-[24px] border-2 border-slate-100 flex items-center gap-4 shadow-inner">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                            🎉
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-black text-slate-400 leading-none">Đã Nhận Quà Hôm Nay</div>
                            <div className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-widest">Hẹn gặp lại bé ngày mai!</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
