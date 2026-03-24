"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, CheckCircle, Clock } from 'lucide-react';
import { InventoryItem } from '@/lib/mastery';
import { useSound } from '@/hooks/use-sound';

interface InventoryProps {
    items: InventoryItem[];
    onUseItem: (item: InventoryItem) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, onUseItem }) => {
    const [isParentMode, setIsParentMode] = useState(false);
    const { play } = useSound();

    const toggleParentMode = () => {
        if (isParentMode) {
            setIsParentMode(false);
            return;
        }

        const answer = prompt('Ba mẹ hãy nhập kết quả: 5 x 7 = ?');
        if (answer === '35') {
            setIsParentMode(true);
            play('unlock');
        } else {
            alert('Sai rồi! Chỉ ba mẹ mới được vào đây nhé.');
            play('wrong');
        }
    };

    const pendingItems = items.filter((item) => item.status === 'pending');
    const approvedItems = items.filter((item) => item.status === 'approved');
    const usedItems = items.filter((item) => item.status === 'used');

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-6 border-4 border-white/50 shadow-xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-orange-100 text-orange-500 p-2 rounded-xl">
                        <Archive size={28} />
                    </span>
                    Túi đồ của bé
                </h3>
                <button
                    onClick={toggleParentMode}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                        isParentMode
                            ? 'bg-rose-500 text-white border-rose-600 shadow-rose-200'
                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {isParentMode ? 'Tắt chế độ phụ huynh' : 'Phụ huynh'}
                </button>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p className="text-6xl mb-4">🎒</p>
                    <p>Túi đang trống. Hãy mua quà ở cửa hàng nhé!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingItems.length > 0 && (
                        <div>
                            <h4 className="font-bold text-slate-600 mb-3 uppercase text-xs tracking-wider">Đang chờ duyệt ({pendingItems.length})</h4>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {pendingItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl">{item.image}</div>
                                                <div>
                                                    <h5 className="font-black text-slate-800">{item.name}</h5>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                                        <Clock size={12} /> Mua lúc: {new Date(item.purchaseDate).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {isParentMode ? (
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Xác nhận đã đưa ${item.name} cho bé?`)) {
                                                            onUseItem(item);
                                                            play('correct');
                                                        }
                                                    }}
                                                    className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-900 border-2 border-emerald-200 font-black py-2 px-6 rounded-xl shadow-lg shadow-emerald-100/50 transition-all hover:scale-[1.02] active:scale-95"
                                                >
                                                    Duyệt
                                                </button>
                                            ) : (
                                                <span className="bg-white text-orange-600 font-black px-4 py-1 rounded-xl text-sm border-2 border-orange-100 shadow-sm">
                                                    Chờ phụ huynh duyệt
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {approvedItems.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-bold text-emerald-600 mb-3 uppercase text-xs tracking-wider">Đã được duyệt ({approvedItems.length})</h4>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {approvedItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-4xl">{item.image}</div>
                                                <div>
                                                    <h5 className="font-black text-slate-800">{item.name}</h5>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                                        <CheckCircle size={12} className="text-emerald-500" /> Sẵn sàng sử dụng
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (confirm(`Bạn muốn xác nhận ĐÃ NHẬN phần quà ${item.name} này chứ?`)) {
                                                        onUseItem(item);
                                                        play('correct');
                                                    }
                                                }}
                                                className="bg-emerald-500 text-white font-black py-2 px-6 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 hover:scale-[1.02] active:scale-95"
                                            >
                                                Đã nhận
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {usedItems.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="font-bold text-slate-400 mb-3 uppercase text-xs tracking-wider">Đã dùng ({usedItems.length})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 opacity-60">
                                {usedItems.map((item) => (
                                    <div key={item.id} className="p-2 bg-slate-50 rounded-xl flex items-center gap-2 border border-slate-100">
                                        <span className="text-xl grayscale">{item.image}</span>
                                        <span className="text-xs font-medium text-slate-500 line-through">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isParentMode && (
                <div className="mt-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100">
                    <strong>Lưu ý:</strong> Tính năng duyệt quà trực tiếp ở màn hình này đã cũ.
                    Ba mẹ vui lòng sử dụng <strong>Cổng thông tin Phụ huynh (Parent Portal)</strong> để quản lý đầy đủ hơn nhé!
                </div>
            )}
        </div>
    );
};
