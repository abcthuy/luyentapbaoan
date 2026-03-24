"use client";

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/progress-provider';
import { getOverallRank } from '@/lib/mastery';
import { motion } from 'framer-motion';
import {
    Zap, BookOpen
} from 'lucide-react';

interface SubjectDashboardProps {
    subjectId: string;
    subjectName: string;
    mapLink: string;
    arenaLink: string;
    themeColor: string; // e.g., 'blue', 'orange', 'emerald'
}

export default function SubjectDashboard({ subjectName, mapLink, arenaLink, themeColor }: SubjectDashboardProps) {
    const { progress, activeProfile } = useProgress();

    if (!progress) return null;

    const rank = getOverallRank(progress); // Or subject rank

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Sảnh Chính {subjectName}
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 font-medium">Chào mừng {activeProfile?.name} trở lại!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Main Action Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`lg:col-span-8 relative overflow-hidden rounded-[40px] md:rounded-[56px] bg-${themeColor}-900 shadow-2xl shadow-${themeColor}-900/20 group h-full flex flex-col`}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br from-${themeColor}-600 via-${themeColor}-700 to-slate-900 opacity-90`} />

                    <div className="relative z-10 p-8 md:p-14 flex flex-col h-full justify-between">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white tracking-tight">
                                {subjectName}
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed mb-10">
                                Luyện tập bài bản theo lộ trình hoặc thử thách bản thân trong đấu trường!
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch gap-4">
                            <Link href={arenaLink} className="flex-1">
                                <button className="w-full h-full flex items-center justify-center gap-2 md:gap-4 bg-white text-slate-900 px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-all hover:-translate-y-1 active:scale-95 group">
                                    <Zap className="text-amber-500" strokeWidth={3} />
                                    <span className="truncate">VÀO ĐẤU TRƯỜNG</span>
                                </button>
                            </Link>

                            <Link href={mapLink} className="flex-1">
                                <button className="w-full h-full flex items-center justify-center gap-2 md:gap-4 bg-white/10 text-white backdrop-blur-md border-2 border-white/20 px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-base md:text-lg hover:bg-white/20 transition-all hover:-translate-y-1 active:scale-95">
                                    <BookOpen size={20} className="md:w-6 md:h-6 shrink-0" />
                                    <span className="truncate">LUYỆN TẬP (MAP)</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Rank Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`lg:col-span-4 flex flex-col items-center justify-center text-center p-10 rounded-[40px] md:rounded-[56px] border-[6px] shadow-2xl relative overflow-hidden h-full ${rank.bg} ${rank.border}`}
                >
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-8xl md:text-9xl mb-8">{rank.icon}</div>
                        <h3 className={`text-3xl md:text-4xl font-black ${rank.color} mb-2 tracking-tighter uppercase`}>
                            {rank.label}
                        </h3>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
