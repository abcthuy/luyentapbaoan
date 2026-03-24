"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank as PigIcon, Target, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/use-sound';
import { SavingsGoal } from '@/lib/mastery';

interface PiggyBankProps {
    balance: number;
    savings: number;
    goal?: SavingsGoal;
    onDeposit: (amount: number) => void;
    onWithdraw: (amount: number) => void;
    onSetGoal: (goal?: SavingsGoal) => void;
}

export const PiggyBank: React.FC<PiggyBankProps> = ({ balance, savings, goal, onDeposit, onWithdraw, onSetGoal }) => {
    const { play } = useSound();
    const [isSettingGoal, setIsSettingGoal] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleDeposit = (amount: number) => {
        if (balance >= amount) {
            onDeposit(amount);
            play('correct');
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#FFD700', '#FFA500']
            });
        } else {
            play('wrong');
        }
    };

    const handleSetGoal = () => {
        if (!goalName || !goalAmount) return;
        const amount = parseInt(goalAmount.replace(/\D/g, ''));
        if (isNaN(amount) || amount <= 0) return;

        onSetGoal({
            name: goalName,
            targetAmount: amount,
            currentAmount: savings,
            image: '🎁'
        });
        setIsSettingGoal(false);
        play('levelup');
    };

    // Calculate progress
    const target = goal?.targetAmount || 1; // avoid div by 0
    const progressPercent = Math.min(100, (savings / target) * 100);

    return (
        <div className="bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-xl relative overflow-hidden h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <span className="bg-pink-100 text-pink-500 p-2 rounded-xl">
                            {goal ? <Target size={28} /> : <PigIcon size={28} />}
                        </span>
                        {goal ? 'Hũ Ước Mơ' : 'Heo Đất'}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm">
                        {goal ? `Đang tiết kiệm mua: ${goal.name}` : 'Tiết kiệm để mua quà to!'}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Đã có</p>
                    <p className="text-2xl font-black text-pink-500">{formatVND(savings)}</p>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center">
                {!goal && !isSettingGoal ? (
                    <div className="text-center py-6">
                        <div className="text-6xl mb-4">🏺</div>
                        <p className="text-slate-600 font-bold mb-4">Con chưa có mục tiêu nào!</p>
                        <button
                            onClick={() => setIsSettingGoal(true)}
                            className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-pink-200 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                        >
                            <Plus size={20} />
                            Đặt Mục Tiêu Mới
                        </button>
                    </div>
                ) : isSettingGoal ? (
                    <div className="space-y-4 py-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Con muốn mua gì?</label>
                            <input
                                type="text"
                                value={goalName}
                                onChange={(e) => setGoalName(e.target.value)}
                                placeholder="Ví dụ: Bộ Lego, Xe đạp thể thao..."
                                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-500 focus:outline-none font-bold text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giá bao nhiêu?</label>
                            <input
                                type="number"
                                value={goalAmount}
                                onChange={(e) => setGoalAmount(e.target.value)}
                                placeholder="Ví dụ: 500000 hoặc 2000000"
                                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-500 focus:outline-none font-bold text-slate-700"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsSettingGoal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSetGoal}
                                className="flex-1 py-3 rounded-xl font-bold bg-pink-500 text-white shadow-lg shadow-pink-200"
                            >
                                Xong!
                            </button>
                        </div>
                    </div>
                ) : (
                    // Show Goal Progress
                    <div className="space-y-6">
                        <div className="relative">
                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                                <span>0đ</span>
                                <span>{formatVND(goal!.targetAmount)}</span>
                            </div>
                            <div className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    className="h-full bg-gradient-to-r from-pink-400 to-rose-500 relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </motion.div>
                            </div>
                            <div className="mt-2 text-center text-sm font-bold text-slate-600">
                                {progressPercent.toFixed(0)}% chặng đường
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4">
                            <p className="text-center text-xs font-bold text-slate-400 uppercase mb-3">Bỏ ống thêm</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[1000, 5000, 10000].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => handleDeposit(amt)}
                                        disabled={balance < amt}
                                        className={`py-2 px-1 rounded-xl font-bold text-xs transition-all border-b-4 active:border-b-0 active:translate-y-1 
                                            ${balance >= amt
                                                ? 'bg-white border-slate-200 text-slate-700 hover:border-pink-300 hover:bg-pink-50'
                                                : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'}`}
                                    >
                                        +{formatVND(amt)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {progressPercent >= 100 && (
                            <button
                                onClick={() => {
                                    if (confirm('Con đã tiết kiệm đủ tiền! Con có muốn "đập heo" để mua món quà này không?')) {
                                        onWithdraw(savings);
                                        onSetGoal(undefined);
                                        play('unlock');
                                    }
                                }}
                                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-200 animate-bounce"
                            >
                                🎉 MUA QUÀ NGAY! 🎉
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
