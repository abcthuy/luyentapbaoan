"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { useSound } from '@/hooks/use-sound';

export const WalletButton = () => {
    const router = useRouter();
    const { progress } = useProgress();
    const { play } = useSound();

    const balance = progress?.balance || 0;

    const formatVND = (amount: number) => {
        // Compact format: 20k, 1.5tr etc if needed, or just full for small amounts
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'tr';
        if (amount >= 1000) return (amount / 1000).toFixed(0) + 'k';
        return amount + 'đ';
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
                play('click');
                router.push('/wallet');
            }}
            className="flex items-center gap-2 bg-white pl-1 pr-3 py-1 rounded-full border-2 border-yellow-400 shadow-[0_4px_0_rgb(250,204,21)] hover:shadow-[0_2px_0_rgb(250,204,21)] hover:translate-y-[2px] transition-all"
        >
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xl border border-yellow-300">
                🐷
            </div>
            <div className="flex flex-col items-start -space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Ví của bé</span>
                <span className="text-sm font-black text-slate-800">{formatVND(balance)}</span>
            </div>
        </motion.button>
    );
};
