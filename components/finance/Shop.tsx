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
    { id: 'candy', name: 'Káº¹o MÃºt', price: 2000, emoji: 'ðŸ­', category: 'food' },
    { id: 'snack', name: 'Bim Bim', price: 5000, emoji: 'ðŸŸ', category: 'food' },
    { id: 'soda', name: 'NÆ°á»›c Ngá»t', price: 5000, emoji: 'ðŸ¥¤', category: 'food' },
    { id: 'icecream', name: 'Kem á»c Quáº¿', price: 10000, emoji: 'ðŸ¦', category: 'food' },
    { id: 'coffee_black', name: 'CÃ  PhÃª Äen', price: 15000, emoji: 'â˜•', category: 'food' },
    { id: 'coffee_milk', name: 'CÃ  PhÃª Sá»¯a ÄÃ¡', price: 15000, emoji: 'ðŸ§‹', category: 'food' },
    { id: 'milk_tea', name: 'TrÃ  Sá»¯a', price: 20000, emoji: 'ðŸ§ƒ', category: 'food' },
    { id: 'comic', name: 'Truyá»‡n Tranh', price: 20000, emoji: 'ðŸ“–', category: 'fun' },
    { id: 'chicken', name: 'GÃ  RÃ¡n', price: 35000, emoji: 'ðŸ—', category: 'food' },
    { id: 'toy_car', name: 'Xe Äá»“ ChÆ¡i', price: 50000, emoji: 'ðŸŽï¸', category: 'toy' },
    { id: 'robot', name: 'Robot', price: 50000, emoji: 'ðŸ¤–', category: 'toy' },
    { id: 'ticket', name: 'VÃ© Äi ChÆ¡i', price: 100000, emoji: 'ðŸŽŸï¸', category: 'fun' },
    { id: 'lego', name: 'Bá»™ Lego', price: 500000, emoji: 'ðŸ§±', category: 'toy' },
    { id: 'lego_technic', name: 'Lego Ká»¹ Thuáº­t (Lá»›n)', price: 1500000, emoji: 'ðŸ—ï¸', category: 'toy' },
    { id: 'bicycle', name: 'Xe Äáº¡p Thá»ƒ Thao', price: 2000000, emoji: 'ðŸš²', category: 'fun' },
    { id: 'cash_5k', name: 'RÃºt 5.000Ä‘ (Chá» duyá»‡t)', price: 5000, emoji: 'ðŸ’µ', category: 'virtual' },
    { id: 'cash_10k', name: 'RÃºt 10.000Ä‘ (Chá» duyá»‡t)', price: 10000, emoji: 'ðŸ’µ', category: 'virtual' },
    { id: 'cash_20k', name: 'RÃºt 20.000Ä‘ (Chá» duyá»‡t)', price: 20000, emoji: 'ðŸ’µ', category: 'virtual' },
    { id: 'cash_50k', name: 'RÃºt 50.000Ä‘ (Chá» duyá»‡t)', price: 50000, emoji: 'ðŸ’µ', category: 'virtual' },
];

interface ShopProps {
    balance: number;
    onBuy: (item: ShopItem) => void;
}

type ShopTab = 'all' | 'food' | 'toy' | 'virtual';

const SHOP_TABS: Array<{ id: ShopTab; label: string }> = [
    { id: 'all', label: 'Táº¥t cáº£' },
    { id: 'food', label: 'Äá»“ Äƒn' },
    { id: 'toy', label: 'Äá»“ chÆ¡i' },
    { id: 'virtual', label: 'Vui váº»' },
];

export const Shop: React.FC<ShopProps> = ({ balance, onBuy }) => {
    const { play } = useSound();
    const [activeTab, setActiveTab] = React.useState<ShopTab>('all');

    const formatVND = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const filteredItems = activeTab === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter((item) => {
            if (activeTab === 'virtual') {
                return item.category === 'fun' || item.category === 'virtual';
            }
            return item.category === activeTab;
        });

    return (
        <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">Cá»­a HÃ ng</h2>
                        <p className="text-sm font-bold text-slate-500">Äá»•i tiá»n láº¥y quÃ  xá»‹n!</p>
                    </div>
                </div>

                <div className="flex overflow-x-auto rounded-xl bg-slate-100 p-1">
                    {SHOP_TABS.map((tab) => (
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

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                                    if (confirm(`Con muá»‘n mua ${item.name} vá»›i giÃ¡ ${formatVND(item.price)} khÃ´ng?`)) {
                                        onBuy(item);
                                    }
                                } else {
                                    play('wrong');
                                }
                            }}
                            className={`relative flex h-full flex-col items-center justify-between rounded-3xl border-2 bg-white p-4 text-center shadow-sm transition-all
                                ${canAfford
                                    ? 'border-slate-100 hover:border-indigo-200 hover:shadow-indigo-100'
                                    : 'border-slate-100 opacity-60 grayscale'}`}
                        >
                            <div className="group-hover:scale-110 mb-3 text-5xl drop-shadow-sm transition-transform">{item.emoji}</div>
                            <h4 className="mb-2 text-sm font-bold text-slate-700 md:text-base">
                                {item.name}
                            </h4>
                            <div className={`rounded-full px-3 py-1 text-xs font-black md:text-sm
                                ${canAfford ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                {formatVND(item.price)}
                            </div>

                            {!canAfford && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/20 backdrop-blur-[1px]">
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
