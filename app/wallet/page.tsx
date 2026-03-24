"use client";

import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { BackButton } from '@/components/ui/back-button';
import { getTheme } from '@/lib/theme';
import { Attendance } from '@/components/finance/Attendance';
import { PiggyBank } from '@/components/finance/PiggyBank';
import { Shop, ShopItem } from '@/components/finance/Shop';
import { Inventory } from '@/components/finance/Inventory';
import { TransactionHistory } from '@/components/finance/TransactionHistory';
import { Bank } from '@/components/finance/Bank';
import { InventoryItem, BankDeposit, SavingsGoal } from '@/lib/mastery';
import { useSound } from '@/hooks/use-sound';
import {
    Wallet, ShoppingBag, Landmark, ScrollText,
    Coins, Flame, Gift, Sparkles
} from 'lucide-react';

type TabId = 'wallet' | 'shop' | 'savings' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'wallet', label: 'Ví', icon: <Wallet size={20} />, color: 'text-amber-600' },
    { id: 'shop', label: 'Cửa hàng', icon: <ShoppingBag size={20} />, color: 'text-indigo-600' },
    { id: 'savings', label: 'Tiết kiệm', icon: <Landmark size={20} />, color: 'text-emerald-600' },
    { id: 'history', label: 'Lịch sử', icon: <ScrollText size={20} />, color: 'text-slate-600' },
];

function WalletContent() {
    const { progress, updateLocalProgress } = useProgress();
    const { play } = useSound();
    const theme = getTheme('finance');

    const [activeTab, setActiveTab] = React.useState<TabId>('wallet');

    // Derived state
    const balance = progress?.balance || 0;
    const savings = progress?.savings || 0;
    const inventory = progress?.inventory || [];
    const transactions = progress?.transactions || [];
    const savingsGoal = progress?.savingsGoal;
    const streak = progress?.attendanceStreak || 0;

    // Daily Reward Logic
    const [dailyRewardAvailable, setDailyRewardAvailable] = React.useState(false);

    React.useEffect(() => {
        if (!progress) return;
        const lastClaim = progress.lastDailyReward ? new Date(progress.lastDailyReward).toDateString() : '';
        const today = new Date().toDateString();
        if (lastClaim !== today) {
            setDailyRewardAvailable(true);
        }
    }, [progress]);

    const handleClaimDaily = () => {
        if (!progress) return;
        const reward = 1000;
        const now = new Date();

        let newStreak = (progress.attendanceStreak || 0) + 1;

        if (progress.lastDailyReward) {
            const lastDate = new Date(progress.lastDailyReward);
            const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 1) newStreak = 1;
        } else {
            newStreak = 1;
        }

        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            amount: reward,
            type: 'earn' as const,
            description: `Điểm danh ngày ${newStreak}`,
            date: now.toISOString()
        };

        let newInventory = [...inventory];
        let rewardMsg = '';

        if (newStreak === 10) {
            const item = { id: Math.random().toString(36).substr(2, 9), itemId: 'comic', name: 'Truyện Tranh (Thưởng 10 ngày)', image: '📖', cost: 0, status: 'pending' as const, purchaseDate: now.toISOString() };
            newInventory = [item, ...newInventory];
            rewardMsg = 'Thưởng 10 ngày: 📖 Truyện Tranh!';
        } else if (newStreak === 20) {
            const item = { id: Math.random().toString(36).substr(2, 9), itemId: 'robot', name: 'Robot (Thưởng 20 ngày)', image: '🤖', cost: 0, status: 'pending' as const, purchaseDate: now.toISOString() };
            newInventory = [item, ...newInventory];
            rewardMsg = 'Thưởng 20 ngày: 🤖 Robot!';
        } else if (newStreak === 30) {
            const item = { id: Math.random().toString(36).substr(2, 9), itemId: 'ticket', name: 'Vé Đi Chơi (Thưởng 30 ngày)', image: '🎟️', cost: 0, status: 'pending' as const, purchaseDate: now.toISOString() };
            newInventory = [item, ...newInventory];
            rewardMsg = 'Thưởng 30 ngày: 🎟️ Vé Đi Chơi!';
        }

        updateLocalProgress({
            ...progress,
            balance: balance + reward,
            lastDailyReward: now.toISOString(),
            attendanceStreak: newStreak,
            transactions: [newTx, ...transactions],
            inventory: newInventory
        }, true);

        setDailyRewardAvailable(false);
        play('levelup');

        if (rewardMsg) {
            alert(`Chúc mừng bé! ${rewardMsg}`);
        }
    };

    const handleBuy = (item: ShopItem) => {
        if (!progress) return;
        if (balance < item.price) return;

        const newItem: InventoryItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: item.id,
            name: item.name,
            image: item.emoji,
            cost: item.price,
            status: 'pending',
            purchaseDate: new Date().toISOString()
        };

        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            amount: -item.price,
            type: 'spend' as const,
            description: `Mua ${item.name}`,
            date: new Date().toISOString()
        };

        updateLocalProgress({
            ...progress,
            balance: balance - item.price,
            inventory: [newItem, ...inventory],
            transactions: [newTx, ...transactions]
        }, true);
        play('buy');
    };

    const handlePiggyDeposit = (amount: number) => {
        if (!progress || balance < amount) return;
        updateLocalProgress({
            ...progress,
            balance: balance - amount,
            savings: savings + amount,
        }, true);
    };

    const handlePiggyWithdraw = (amount: number) => {
        if (!progress || savings < amount) return;
        updateLocalProgress({
            ...progress,
            balance: balance + amount,
            savings: savings - amount
        }, true);
    };

    const handleBankDeposit = (amount: number, termMonths: number) => {
        if (!progress || balance < amount) return;
        const interestRate = termMonths * 0.01;

        const newDeposit: BankDeposit = {
            id: Math.random().toString(36).substr(2, 9),
            amount,
            termMonths,
            interestRate,
            startDate: new Date().toISOString(),
            isSettled: false
        };

        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            amount: -amount,
            type: 'deposit' as const,
            description: `Gửi tiết kiệm ${termMonths} tháng`,
            date: new Date().toISOString()
        };

        updateLocalProgress({
            ...progress,
            balance: balance - amount,
            bankDeposits: [newDeposit, ...(progress.bankDeposits || [])],
            transactions: [newTx, ...transactions]
        }, true);
    };

    const handleBankSettle = (depositId: string, early: boolean) => {
        if (!progress) return;
        const deposit = progress.bankDeposits?.find(d => d.id === depositId);
        if (!deposit) return;

        let profit = 0;
        if (early) {
            const start = new Date(deposit.startDate).getTime();
            const now = new Date().getTime();
            const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
            profit = Math.floor(deposit.amount * (0.005 * Math.max(0, daysPassed)));
        } else {
            profit = Math.floor(deposit.amount * deposit.interestRate * deposit.termMonths);
        }

        const totalReturn = deposit.amount + profit;

        const newTx = {
            id: Math.random().toString(36).substr(2, 9),
            amount: totalReturn,
            type: 'earn' as const,
            description: early ? `Rút tiền sớm (+${profit}đ lãi)` : `Tất toán tiết kiệm (+${profit}đ lãi)`,
            date: new Date().toISOString()
        };

        const updatedDeposits = progress.bankDeposits?.map(d =>
            d.id === depositId ? { ...d, isSettled: true } : d
        ) || [];

        updateLocalProgress({
            ...progress,
            balance: balance + totalReturn,
            bankDeposits: updatedDeposits,
            transactions: [newTx, ...transactions]
        }, true);

        play(early ? 'click' : 'levelup');
    };

    const handleSetGoal = (goal?: SavingsGoal) => {
        if (!progress) return;
        updateLocalProgress({ ...progress, savingsGoal: goal }, true);
    };

    const handleUseItem = (item: InventoryItem) => {
        if (!progress) return;
        const updatedInventory = inventory.map(i =>
            i.id === item.id ? { ...i, status: 'used' as const } : i
        );
        updateLocalProgress({ ...progress, inventory: updatedInventory }, true);
    };

    const formatVND = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const totalWealth = balance + savings + (progress?.bankDeposits?.filter(d => !d.isSettled).reduce((sum, d) => sum + d.amount, 0) || 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white relative pb-28">

            {/* ===== COMPACT HEADER ===== */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-amber-100/50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <BackButton href="/subjects" theme={theme} />

                        {/* Center: Balance */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-2xl border border-amber-200/60">
                                <Coins size={18} className="text-amber-600" />
                                <span className="text-lg font-black text-amber-800 tabular-nums">
                                    {formatVND(balance)}
                                </span>
                            </div>
                            {streak > 0 && (
                                <div className="flex items-center gap-1 bg-orange-100 px-3 py-2 rounded-2xl border border-orange-200/60">
                                    <Flame size={16} className="text-orange-500" />
                                    <span className="text-sm font-black text-orange-700">{streak}</span>
                                </div>
                            )}
                        </div>

                        {/* Right: Daily Claim */}
                        {dailyRewardAvailable ? (
                            <motion.button
                                onClick={handleClaimDaily}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-shadow"
                            >
                                <Gift size={16} />
                                <span>+1.000đ</span>
                            </motion.button>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-2xl text-slate-400">
                                <Gift size={16} />
                                <span className="text-xs font-bold">Đã nhận</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== HERO SECTION ===== */}
            <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-[28px] p-6 text-amber-950 shadow-xl shadow-orange-200/40 relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={120} />
                    </div>
                    <div className="absolute -bottom-6 -left-6 bg-white/20 w-24 h-24 rounded-full blur-2xl" />

                    <div className="relative z-10">
                        <p className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-1.5">
                            <Sparkles size={14} /> Tổng tài sản
                        </p>
                        <motion.div
                            key={totalWealth}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm"
                            style={{ textShadow: '0 2px 0 rgba(255,255,255,0.4)' }}
                        >
                            {formatVND(totalWealth)}
                        </motion.div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20">
                                💰 Ví: {formatVND(balance)}
                            </span>
                            <span className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20">
                                🐷 Heo: {formatVND(savings)}
                            </span>
                            {(progress?.bankDeposits?.filter(d => !d.isSettled).length || 0) > 0 && (
                                <span className="bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold border border-white/20">
                                    🏦 Tiết kiệm: {progress?.bankDeposits?.filter(d => !d.isSettled).length} sổ
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ===== TAB BAR ===== */}
            <div className="sticky top-[65px] z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-200
                                    ${activeTab === tab.id
                                        ? `bg-amber-100 ${tab.color} shadow-sm border border-amber-200/50`
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== TAB CONTENT ===== */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* TAB: Ví */}
                    {activeTab === 'wallet' && (
                        <motion.div
                            key="wallet"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Attendance mini */}
                            <Attendance
                                available={dailyRewardAvailable}
                                onClaim={handleClaimDaily}
                                lastClaimDate={progress?.lastDailyReward}
                                streak={streak}
                            />

                            {/* Piggy Bank */}
                            <PiggyBank
                                balance={balance}
                                savings={savings}
                                goal={savingsGoal}
                                onDeposit={handlePiggyDeposit}
                                onWithdraw={handlePiggyWithdraw}
                                onSetGoal={handleSetGoal}
                            />

                            {/* Inventory */}
                            <Inventory items={inventory} onUseItem={handleUseItem} />
                        </motion.div>
                    )}

                    {/* TAB: Cửa hàng */}
                    {activeTab === 'shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-lg border border-slate-100">
                                <Shop balance={balance} onBuy={handleBuy} />
                            </div>
                        </motion.div>
                    )}

                    {/* TAB: Tiết kiệm */}
                    {activeTab === 'savings' && (
                        <motion.div
                            key="savings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Bank component shows both deposit form and list */}
                            <Bank
                                balance={balance}
                                deposits={progress?.bankDeposits || []}
                                onDeposit={handleBankDeposit}
                                onSettle={handleBankSettle}
                            />

                            {/* Tips */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-[28px] shadow-lg shadow-emerald-200/30">
                                <h4 className="font-black text-base mb-2 flex items-center gap-2">
                                    <Sparkles size={18} /> Mẹo nhỏ
                                </h4>
                                <p className="font-medium text-sm leading-relaxed opacity-90">
                                    Gửi càng lâu, lãi suất càng cao. Bé hãy học thật tốt để tích lũy thêm nhiều nhé! 🚀
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB: Lịch sử */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TransactionHistory transactions={transactions} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-amber-50 flex items-center justify-center"><div className="text-2xl">⏳</div></div>}>
            <WalletContent />
        </Suspense>
    );
}
