"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, Award, Flame, Zap, PiggyBank, Target, Star } from 'lucide-react';
import { BADGE_DEFINITIONS, getBadgeInfo } from '@/lib/badges';
import { ProgressData } from '@/lib/mastery';

interface BadgeDisplayProps {
    progress: ProgressData;
    newBadgeIds?: string[];
}

function CheckIcon({ size }: { size: number }) {
    return <Check size={size} />;
}

function TrophyIcon({ size }: { size: number }) {
    return <Trophy size={size} />;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ progress, newBadgeIds = [] }) => {
    const earnedBadges = progress?.badges || [];
    const [dismissedPopupIds, setDismissedPopupIds] = useState<string[]>([]);
    const showPopup = newBadgeIds.find((badgeId) => !dismissedPopupIds.includes(badgeId)) || null;

    const categories = [
        { id: 'milestone', name: 'Cột mốc', icon: <Target className="text-blue-500" size={18} /> },
        { id: 'subject', name: 'Môn học', icon: <Award className="text-amber-500" size={18} /> },
        { id: 'streak', name: 'Bền bỉ', icon: <Flame className="text-orange-500" size={18} /> },
        { id: 'performance', name: 'Kỹ năng', icon: <Zap className="text-yellow-500" size={18} /> },
        { id: 'economy', name: 'Tài chính', icon: <PiggyBank className="text-emerald-500" size={18} /> },
        { id: 'rank', name: 'Danh hiệu', icon: <TrophyIcon size={18} /> },
        { id: 'special', name: 'Đặc biệt', icon: <Star className="text-purple-500" size={18} /> },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Badge Unlock Popup */}
            <AnimatePresence>
                {showPopup && (() => {
                    const badge = getBadgeInfo(showPopup);
                    if (!badge) return null;
                    return (
                        <motion.div
                            key="badge-popup"
                            initial={{ opacity: 0, scale: 0.5, y: -50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: -50 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-yellow-300 p-6 text-center min-w-[300px]"
                        >
                            <motion.div
                                className="text-7xl mb-3"
                                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: 2 }}
                            >
                                {badge.icon}
                            </motion.div>
                            <div className="text-lg font-black text-yellow-600 uppercase tracking-wider">Tuyệt vời!</div>
                            <div className="text-xl font-black text-slate-900 mt-1">Huy hiệu: {badge.name}</div>
                            <div className="text-sm text-slate-500 mt-2 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                {badge.description}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDismissedPopupIds((prev) => [...prev, showPopup])}
                                className="mt-6 w-full py-3 bg-yellow-400 text-yellow-900 font-bold text-lg rounded-xl shadow-md border-b-4 border-yellow-500"
                            >
                                Đã hiểu!
                            </motion.button>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Compact Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Trophy size={60} />
                </div>
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-black flex items-center gap-2">
                            🏅 Kho huy hiệu
                        </h2>
                        <div className="text-indigo-100 text-[10px] font-bold opacity-70">
                            Đã nhận {earnedBadges.length} trên {BADGE_DEFINITIONS.length} huy hiệu
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-xl font-black">{Math.round((earnedBadges.length / (BADGE_DEFINITIONS.length || 1)) * 100)}%</div>
                        <div className="h-1.5 w-24 bg-white/20 rounded-full mt-1 overflow-hidden border border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(earnedBadges.length / (BADGE_DEFINITIONS.length || 1)) * 100}%` }}
                                className="h-full bg-yellow-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Category Grid */}
            <div className="space-y-3">
                {categories.map(cat => {
                    const catBadges = BADGE_DEFINITIONS.filter(b => b.category === cat.id);
                    if (catBadges.length === 0) return null;

                    const catEarnedCount = catBadges.filter(b => earnedBadges.includes(b.id)).length;
                    const isCompleted = catEarnedCount === catBadges.length;

                    return (
                        <div key={cat.id} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg shadow-inner">
                                        {cat.icon}
                                    </span>
                                    <h3 className="text-sm font-black text-slate-700">{cat.name}</h3>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[10px] ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {isCompleted && <CheckIcon size={12} />}
                                    {catEarnedCount}/{catBadges.length}
                                </div>
                            </div>

                            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {catBadges.map((badge) => {
                                    const isEarned = earnedBadges.includes(badge.id);
                                    const isNew = newBadgeIds.includes(badge.id);
                                    return (
                                        <div key={badge.id} className="group relative">
                                            <motion.div
                                                initial={isNew ? { scale: 0 } : {}}
                                                animate={isNew ? { scale: [0, 1.2, 1] } : {}}
                                                transition={{ delay: 0.1, type: 'spring' }}
                                                className={`flex flex-col items-center p-1.5 rounded-xl transition-all aspect-square justify-center relative
                                                    ${isEarned
                                                        ? 'bg-gradient-to-b from-yellow-50 to-white border border-yellow-100 shadow-sm hover:translate-y-[-2px]'
                                                        : 'bg-slate-50 border border-slate-100 opacity-25 grayscale'
                                                    }`}
                                            >
                                                <span className={`${isEarned ? 'text-2xl' : 'text-xl'}`}>{badge.icon}</span>

                                                {isNew && (
                                                    <motion.div
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[6px] font-black px-1 rounded-full z-10 shadow-sm border border-white"
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        transition={{ repeat: Infinity, duration: 0.6 }}
                                                    >
                                                        NEW
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            {/* Minimal Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-36 p-3 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[60] text-center shadow-xl border border-white/10">
                                                <div className="font-black text-yellow-400 uppercase tracking-tighter mb-0.5">{badge.name}</div>
                                                <div className="font-medium text-slate-300 leading-tight">{badge.description}</div>
                                                {!isEarned && <div className="mt-1 text-[8px] text-indigo-300 border-t border-white/5 pt-1 uppercase">Chưa đạt</div>}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
