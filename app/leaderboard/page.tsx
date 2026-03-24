"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Crown, Star } from 'lucide-react';

interface LeaderboardEntry {
    id: string;
    name: string;
    total_score: number;
    last_score: number;
    best_time: number;
    tier: string;
    updated_at: string;
    math_score: number;
    vietnamese_score: number;
    english_score: number;
    finance_score: number;
}

import { LeaderboardSyncButton } from './sync-button';

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();

        // Polling every 30s
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_score', { ascending: false })
                .limit(100);

            if (data) {
                // Filter out 0-score entries and deduplicate by name
                const filtered = data.filter((e: LeaderboardEntry) => e.total_score > 0);
                const deduped = new Map<string, LeaderboardEntry>();
                for (const entry of filtered) {
                    const key = entry.name.toLowerCase().trim();
                    const existing = deduped.get(key);
                    if (!existing || entry.total_score > existing.total_score) {
                        deduped.set(key, entry);
                    }
                }
                const sorted = Array.from(deduped.values()).sort((a, b) => b.total_score - a.total_score);
                setEntries(sorted);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown className="text-yellow-500 fill-yellow-200" size={32} />;
        if (index === 1) return <Medal className="text-slate-400 fill-slate-200" size={28} />;
        if (index === 2) return <Medal className="text-amber-700 fill-amber-300" size={28} />;
        return <span className="text-xl font-black text-slate-400">#{index + 1}</span>;
    };

    const getRowStyle = (index: number) => {
        if (index === 0) return 'bg-yellow-50 border-yellow-200 ring-4 ring-yellow-50/50 scale-[1.02]';
        if (index === 1) return 'bg-slate-50 border-slate-200';
        if (index === 2) return 'bg-orange-50 border-orange-200';
        return 'bg-white border-slate-100';
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-3 bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:bg-slate-50 transition-all">
                            <ArrowLeft size={24} className="text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-3">
                                <Trophy className="text-yellow-500" size={40} />
                                Bảng Xếp Hạng
                            </h1>
                            <p className="text-slate-500 font-medium">Top 100 Nhà Toán Học Xuất Sắc Nhất</p>
                        </div>
                    </div>
                    <LeaderboardSyncButton />
                </div>

                <div className="space-y-4">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400">
                        <div className="col-span-1 text-center">Hạng</div>
                        <div className="col-span-4 pl-4">Học Sinh</div>
                        <div className="col-span-5 grid grid-cols-4 text-center gap-2">
                            <span>Toán</span>
                            <span>T.Việt</span>
                            <span>T.Anh</span>
                            <span>T.Chính</span>
                        </div>
                        <div className="col-span-3 text-center">Tổng Điểm</div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-white rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        entries.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-4 md:p-6 rounded-[24px] border-4 flex flex-col md:grid md:grid-cols-12 items-center gap-4 shadow-sm transition-transform hover:-translate-y-1 ${getRowStyle(index)}`}
                            >
                                {/* Rank */}
                                <div className="col-span-1 flex justify-center">
                                    {getRankIcon(index)}
                                </div>

                                {/* Name & Tier */}
                                <div className="col-span-4 w-full text-center md:text-left">
                                    <h3 className="text-xl font-black text-slate-900 truncate">{entry.name}</h3>
                                    <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            {entry.tier || 'Tập sự'}
                                        </span>
                                        {entry.math_score > 1000 && <span title="Thần đồng Toán" className="text-xs">🧮</span>}
                                        {entry.vietnamese_score > 1000 && <span title="Vua Tiếng Việt" className="text-xs">✍️</span>}
                                        {entry.english_score > 1000 && <span title="Siêu sao Tiếng Anh" className="text-xs">🌍</span>}
                                    </div>
                                </div>

                                {/* Subject Scores */}
                                <div className="col-span-5 grid grid-cols-4 gap-2">
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-blue-50/50 border border-blue-100">
                                        <span className="text-lg font-black text-blue-700">{entry.math_score || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-orange-50/50 border border-orange-100">
                                        <span className="text-lg font-black text-orange-700">{entry.vietnamese_score || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                                        <span className="text-lg font-black text-purple-700">{entry.english_score || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                        <span className="text-lg font-black text-emerald-700">{entry.finance_score || 0}</span>
                                    </div>
                                </div>

                                {/* Total Score */}
                                <div className="col-span-2 flex flex-col items-center justify-center">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-2xl font-black">{entry.total_score}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
