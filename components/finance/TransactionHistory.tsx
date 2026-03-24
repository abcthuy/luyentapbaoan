import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '@/lib/mastery';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, ShoppingBag, Gift } from 'lucide-react';

interface TransactionHistoryProps {
    transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
    // Sort by date desc
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(amount));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'earn': return <ArrowDownLeft className="text-emerald-500" />;
            case 'spend': return <ShoppingBag className="text-rose-500" />;
            case 'deposit': return <PiggyBank className="text-yellow-500" />;
            case 'withdraw': return <ArrowUpRight className="text-blue-500" />;
            default: return <Gift className="text-purple-500" />;
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm text-center">
                <div className="text-4xl mb-2">📜</div>
                <h3 className="text-slate-800 font-bold mb-1">Nhật Ký Giao Dịch</h3>
                <p className="text-slate-400 text-sm">Chưa có giao dịch nào.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-lg max-h-[400px] flex flex-col">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-slate-50 text-slate-500 p-2 rounded-xl border border-slate-100">📜</span> Nhật Ký Giao Dịch
            </h3>

            <div className="overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1">
                {sorted.map((tx) => (
                    <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                {getIcon(tx.type)}
                            </div>
                            <div>
                                <div className="font-black text-slate-800 text-sm">{tx.description}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase">
                                    {new Date(tx.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                        <div className={`font-black text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.amount > 0 ? '+' : '-'}{formatVND(tx.amount)}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
