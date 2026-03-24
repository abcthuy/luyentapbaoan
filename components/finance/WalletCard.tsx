"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Coins } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

interface WalletCardProps {
    balance: number;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance }) => {
    const [displayBalance, setDisplayBalance] = useState(balance);
    const { play } = useSound();
    const [isIncreasing, setIsIncreasing] = useState(false);
    const displayBalanceRef = useRef(balance);

    useEffect(() => {
        const startBalance = displayBalanceRef.current;
        const diff = balance - startBalance;
        if (diff === 0) return;

        setIsIncreasing(diff > 0);
        if (diff > 0) play('coin');

        const steps = 20;
        const duration = 1000;
        const increment = diff / steps;

        let current = startBalance;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                displayBalanceRef.current = balance;
                setDisplayBalance(balance);
                clearInterval(timer);
                setIsIncreasing(false);
            } else {
                const nextValue = Math.round(current);
                displayBalanceRef.current = nextValue;
                setDisplayBalance(nextValue);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [balance, play]);

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-400 rounded-[32px] p-6 text-amber-950 shadow-xl shadow-orange-200/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-yellow-200">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity mix-blend-overlay">
                <Wallet size={140} />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white/30 w-32 h-32 rounded-full blur-2xl"></div>

            {/* Floating Coins Animation */}
            <AnimatePresence>
                {isIncreasing && (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50, x: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: -100,
                                    x: (Math.random() - 0.5) * 100,
                                    rotate: Math.random() * 360
                                }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                                className="absolute bottom-10 left-1/2 text-4xl pointer-events-none z-0"
                            >
                                🪙
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 bg-white/30 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                    <Coins size={16} className="text-amber-800" />
                    <h3 className="text-amber-900 font-bold text-sm uppercase tracking-wider">Tổng Tài Sản</h3>
                </div>

                <div className="flex items-baseline gap-2">
                    <motion.div
                        key={balance}
                        initial={{ scale: 1.2, filter: 'brightness(1.5)' }}
                        animate={{ scale: 1, filter: 'brightness(1)' }}
                        className="text-5xl md:text-6xl font-black tracking-tight text-amber-950 drop-shadow-sm"
                        style={{ textShadow: '0 2px 0 rgba(255,255,255,0.5)' }}
                    >
                        {formatVND(displayBalance)}
                    </motion.div>
                </div>

                <div className="mt-4 flex gap-2">
                    <span className="text-amber-900 text-xs font-bold bg-white/30 px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
                        Thu nhập: {formatVND(balance)} 💰
                    </span>
                </div>
            </div>
        </div>
    );
};
