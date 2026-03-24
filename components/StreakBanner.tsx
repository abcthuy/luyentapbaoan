"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { getReviewCount } from '@/lib/spaced-repetition';
import { ProgressData } from '@/lib/mastery';

interface StreakBannerProps {
    progress: ProgressData;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ progress }) => {
    const streak = progress.dailyStreak || 0;
    const longestStreak = progress.longestStreak || 0;
    const reviewCount = getReviewCount(progress);

    // Streak color tiers
    const getStreakColor = () => {
        if (streak >= 30) return 'from-amber-400 to-orange-500';
        if (streak >= 14) return 'from-purple-400 to-pink-500';
        if (streak >= 7) return 'from-blue-400 to-indigo-500';
        if (streak >= 3) return 'from-emerald-400 to-teal-500';
        return 'from-slate-300 to-slate-400';
    };

    const getStreakEmoji = () => {
        if (streak >= 30) return '💎';
        if (streak >= 14) return '💪';
        if (streak >= 7) return '🔥';
        if (streak >= 3) return '📚';
        return '🌱';
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 bg-gradient-to-r ${getStreakColor()} rounded-2xl p-4 text-white shadow-lg`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.span
                            className="text-3xl"
                            animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            {getStreakEmoji()}
                        </motion.span>
                        <div>
                            <div className="text-2xl font-black">
                                {streak} ngày
                            </div>
                            <div className="text-xs opacity-80 font-bold">
                                {streak === 0 ? 'Bắt đầu học nào!' : 'Liên tục học'}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-xs opacity-80">
                            <Trophy size={12} />
                            <span>Kỷ lục: {longestStreak}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Review Count */}
            {reviewCount > 0 && (
                <Link href="/today" className="block focus:outline-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow h-full"
                    >
                        <div className="text-2xl">📝</div>
                        <div>
                            <div className="font-black text-amber-700">{reviewCount} câu cần ôn</div>
                            <div className="text-xs text-amber-500 font-bold">Ôn lại để nhớ lâu!</div>
                        </div>
                    </motion.div>
                </Link>
            )}
        </div>
    );
};
