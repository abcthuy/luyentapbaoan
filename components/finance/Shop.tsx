"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Lock } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';

export interface ShopItem {
    id: string;
    name: string;
    price: number;
    emoji: string;
    category: 'food' | 'toy' | 'fun' | 'virtual';
    description?: string;
}

const SHOP_ITEMS: ShopItem[] = [
    { id: 'candy', name: 'Kẹo Mút', price: 2000, emoji: '🍭', category: 'food' },
    { id: 'snack', name: 'Bim Bim', price: 5000, emoji: '🍟', category: 'food' },
    { id: 'soda', name: 'Nước Ngọt', price: 5000, emoji: '🥤', category: 'food' },
    { id: 'icecream', name: 'Kem Ốc Quế', price: 10000, emoji: '🍦', category: 'food' },
    { id: 'coffee_black', name: 'Cà Phê Đen', price: 15000, emoji: '☕', category: 'food' },
    { id: 'coffee_milk', name: 'Cà Phê Sữa Đá', price: 15000, emoji: '🧋', category: 'food' },
    { id: 'milk_tea', name: 'Trà Sữa', price: 20000, emoji: '🧃', category: 'food' },
    { id: 'comic', name: 'Truyện Tranh', price: 20000, emoji: '📖', category: 'fun' },
    { id: 'chicken', name: 'Gà Rán', price: 35000, emoji: '🍗', category: 'food' },
    { id: 'toy_car', name: 'Xe Đồ Chơi', price: 50000, emoji: '🏎️', category: 'toy' },
    { id: 'robot', name: 'Robot', price: 50000, emoji: '🤖', category: 'toy' },
    { id: 'ticket', name: 'Vé Đi Chơi', price: 100000, emoji: '🎟️', category: 'fun' },
    { id: 'lego', name: 'Bộ Lego', price: 500000, emoji: '🧱', category: 'toy' },
    { id: 'lego_technic', name: 'Lego Kỹ Thuật (Lớn)', price: 1500000, emoji: '🏗️', category: 'toy' },
    { id: 'bicycle', name: 'Xe Đạp Thể Thao', price: 2000000, emoji: '🚲', category: 'fun' },
    // Cash withdrawals
    { id: 'cash_5k', name: 'Rút 5.000đ (Chờ duyệt)', price: 5000, emoji: '💵', category: 'virtual' },
    { id: 'cash_10k', name: 'Rút 10.000đ (Chờ duyệt)', price: 10000, emoji: '💵', category: 'virtual' },
    { id: 'cash_20k', name: 'Rút 20.000đ (Chờ duyệt)', price: 20000, emoji: '💵', category: 'virtual' },
    { id: 'cash_50k', name: 'Rút 50.000đ (Chờ duyệt)', price: 50000, emoji: '💵', category: 'virtual' },
];

interface ShopProps {
    balance: number;
    onBuy: (item: ShopItem) => void;
}

type ShopTab = 'all' | 'food' | 'toy' | 'virtual';

export const Shop: React.FC<ShopProps> = ({ balance, onBuy }) => {
    const { play } = useSound();
    const [activeTab, setActiveTab] = React.useState<ShopTab>('all');

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredItems = activeTab === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => {
            if (activeTab === 'virtual') return item.category === 'fun' || item.category === 'virtual'; // Map fun to virtual for now
            return item.category === activeTab;
        });

    return (
        <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Cửa Hàng</h2>
                        <p className="text-slate-500 text-sm font-bold">Đổi tiền lấy quà xịn!</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'food', label: 'Đồ ăn' },
                        { id: 'toy', label: 'Đồ chơi' },
                        { id: 'virtual', label: 'Vui vẻ' }
                    ].map((tab: { id: ShopTab; label: string }) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                    const canAfford = balance >= item.price;
                    return (
                        <motion.button
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (canAfford) {
                                    if (confirm(`Con muốn mua ${item.name} với giá ${formatVND(item.price)} không?`)) {
                                        onBuy(item);
                                    }
                                } else {
                                    play('wrong');
                                }
                            }}
                            className={`relative group bg-white rounded-3xl p-4 border-2 shadow-sm text-center transition-all flex flex-col items-center justify-between h-full
                                ${canAfford
                                    ? 'border-slate-100 hover:border-indigo-200 hover:shadow-indigo-100'
                                    : 'border-slate-100 opacity-60 grayscale'}`}
                        >
                            <div className="text-5xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">{item.emoji}</div>
                            <h4 className="font-bold text-slate-700 text-sm md:text-base mb-2">
                                {item.name}
                            </h4>
                            <div className={`font-black py-1 px-3 rounded-full text-xs md:text-sm
                                ${canAfford ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                {formatVND(item.price)}
                            </div>

                            {!canAfford && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                                    <Lock className="text-slate-400" size={24} />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
