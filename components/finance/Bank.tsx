import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, PiggyBank, CheckCircle2, LogOut } from 'lucide-react';
import { BankDeposit } from '@/lib/mastery';
import { useSound } from '@/hooks/use-sound';
import confetti from 'canvas-confetti';

interface BankProps {
    balance: number;
    deposits: BankDeposit[];
    onDeposit: (amount: number, termMonths: number) => void;
    onSettle: (depositId: string, early: boolean) => void;
    forcedTab?: 'deposit' | 'list';
}

const TERM_OPTIONS = [
    { months: 1, rate: 0.01, label: '1 Tháng', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { months: 2, rate: 0.02, label: '2 Tháng', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { months: 3, rate: 0.03, label: '3 Tháng', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { months: 4, rate: 0.04, label: '4 Tháng', color: 'bg-pink-50 text-pink-600 border-pink-200' },
    { months: 5, rate: 0.05, label: '5 Tháng', color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { months: 6, rate: 0.06, label: '6 Tháng', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

export const Bank: React.FC<BankProps> = ({ balance, deposits, onDeposit, onSettle, forcedTab }) => {
    const [internalActiveTab, setInternalActiveTab] = useState<'deposit' | 'list'>(forcedTab || 'deposit');
    const [amount, setAmount] = useState('');
    const [selectedTerm, setSelectedTerm] = useState(1);
    const { play } = useSound();
    const activeTab = forcedTab || internalActiveTab;

    // Helper: 1 Week (Real) = 1 Month (Bank)
    // To check maturity: Start Date + Term (Months * 7 days) < Now
    const isMature = (deposit: BankDeposit) => {
        const start = new Date(deposit.startDate).getTime();
        const now = new Date().getTime();
        const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
        return daysPassed >= (deposit.termMonths * 7);
    };

    const getProgress = (deposit: BankDeposit) => {
        const start = new Date(deposit.startDate).getTime();
        const now = new Date().getTime();
        const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
        // 1 month = 7 days
        return Math.min(100, (daysPassed / (deposit.termMonths * 7)) * 100);
    };

    const calculateInterest = (deposit: BankDeposit, early: boolean = false) => {
        if (early) {
            // 0.5% per month penalty rate
            const start = new Date(deposit.startDate).getTime();
            const now = new Date().getTime();
            const daysPassed = (now - start) / (1000 * 60 * 60 * 24);
            // 1 week = 1 month
            const monthsPassed = daysPassed / 7;
            const monthsRatio = Math.max(0, monthsPassed);
            return Math.floor(deposit.amount * (0.005 * monthsRatio));
        } else {
            // Full Term Rate * Amount * Months
            return Math.floor(deposit.amount * deposit.interestRate * deposit.termMonths);
        }
    };

    const handleDeposit = () => {
        // Normalize amount: remove non-digits, prevent leading zeros unless 0
        const rawVal = amount.replace(/\D/g, '');
        const val = parseInt(rawVal || '0');

        if (val > 0 && val <= balance) {
            // Balance deduction is handled by parent, but we verify here
            onDeposit(val, selectedTerm);
            setAmount('');
            play('coin');
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#10B981', '#34D399']
            });
            setInternalActiveTab('list');
        } else {
            play('wrong');
        }
    };

    const formatVND = (num: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    };

    const activeDeposits = deposits.filter(d => !d.isSettled);

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 border-4 border-white/50 shadow-xl min-h-[400px] relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                    <Landmark size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Ngân Hàng</h2>
                    <p className="text-xs font-bold text-slate-400">Gửi tiết kiệm - Lãi suất cao (1 tuần = 1 tháng)</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                    onClick={() => setInternalActiveTab('deposit')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Gửi Mới
                </button>
                <button
                    onClick={() => setInternalActiveTab('list')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Sổ Tiết Kiệm ({activeDeposits.length})
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'deposit' ? (
                    <motion.div
                        key="deposit"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Amount Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Số tiền muốn gửi</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount ? parseInt(amount).toLocaleString('vi-VN') : ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setAmount(val);
                                    }}
                                    placeholder="0"
                                    className="w-full text-3xl font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">VND</span>
                            </div>
                            <div className="mt-2 flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Số dư: {formatVND(balance)}</span>
                                <button onClick={() => setAmount(balance.toString())} className="text-indigo-500 hover:text-indigo-600">Tất cả</button>
                            </div>
                        </div>

                        {/* Term Selection */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Kỳ hạn gửi (1 tuần = 1 tháng)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {TERM_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.months}
                                        onClick={() => setSelectedTerm(opt.months)}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTerm === opt.months ? `ring-2 ring-indigo-500 ring-offset-2 ${opt.color}` : 'border-slate-100 opacity-60 hover:opacity-100 bg-white'}`}
                                    >
                                        <div className="text-xs font-black uppercase mb-1">{opt.label}</div>
                                        <div className="text-2xl font-black">{opt.rate * 100}%<span className="text-[10px] ml-1 text-current opacity-70">/tháng</span></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        {amount && parseInt(amount) > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-emerald-600 uppercase">Lãi dự kiến</span>
                                    <span className="text-lg font-black text-emerald-700">
                                        +{formatVND(parseInt(amount) * TERM_OPTIONS.find(t => t.months === selectedTerm)!.rate * selectedTerm)}
                                    </span>
                                </div>
                                <p className="text-[10px] font-medium text-emerald-600 opacity-80">
                                    Nhận lại gốc và lãi sau {selectedTerm} tuần (thực tế).
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleDeposit}
                            disabled={!amount || parseInt(amount) <= 0 || parseInt(amount) > balance}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-900 font-black text-lg shadow-xl shadow-indigo-100/50 border-2 border-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            Xác Nhận Gửi Tiền
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {activeDeposits.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <PiggyBank size={48} className="mx-auto mb-3 text-slate-300" />
                                <p className="font-bold text-slate-400">Chưa có khoản tiết kiệm nào</p>
                            </div>
                        ) : (
                            activeDeposits.map((deposit) => {
                                const mature = isMature(deposit);
                                const profit = calculateInterest(deposit, !mature);
                                const progress = getProgress(deposit);

                                return (
                                    <div key={deposit.id} className="border-2 border-slate-100 bg-slate-50/30 rounded-2xl p-4 relative overflow-hidden group">
                                        {mature && (
                                            <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l-[1px] border-b-[1px] border-amber-200 shadow-sm z-10">
                                                Đến hạn!
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <div>
                                                <div className="text-2xl font-black text-slate-900">{formatVND(deposit.amount)}</div>
                                                <div className="text-xs font-bold text-slate-500">Kỳ hạn {deposit.termMonths} tháng • {deposit.interestRate * 100}%/tháng</div>
                                            </div>
                                            <div className={`text-right ${mature ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                <div className="text-sm font-bold">Lãi: +{formatVND(profit)}</div>
                                                <div className="text-[10px] font-bold opacity-70">{mature ? 'Lãi suất tối đa' : 'Lãi suất 0.5% (Trước hạn)'}</div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${mature ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        <button
                                            onClick={() => onSettle(deposit.id, !mature)}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mature
                                                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 border-2 border-emerald-200 shadow-lg shadow-emerald-100/50 hover:scale-[1.02]'
                                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600'
                                                }`}
                                        >
                                            {mature ? (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Tất toán (+{formatVND(profit)})
                                                </>
                                            ) : (
                                                <>
                                                    <LogOut size={16} className="rotate-180" />
                                                    Rút trước hạn
                                                </>
                                            )}
                                        </button>

                                        {!mature && (
                                            <p className="text-[10px] text-center mt-2 text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                Cảnh báo: Rút ngay chỉ nhận lãi 0.5%/tháng
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
