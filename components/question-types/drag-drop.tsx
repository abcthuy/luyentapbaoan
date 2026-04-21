"use client";

import React, { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { normalizeDisplayText } from '@/lib/text';

interface DragDropQuestionProps {
    items: { id: string; content: string }[];
    onReorder: (items: string[]) => void;
    disabled?: boolean;
}

export function DragDropQuestion({ items, onReorder, disabled }: DragDropQuestionProps) {
    const [orderedItems, setOrderedItems] = useState(items);

    useEffect(() => {
        setOrderedItems(items);
    }, [items]);

    const handleReorder = (newOrder: { id: string; content: string }[]) => {
        if (disabled) return;
        setOrderedItems(newOrder);
        onReorder(newOrder.map(item => item.content)); // Pass back content order as answer
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Reorder.Group axis="y" values={orderedItems} onReorder={handleReorder} className="space-y-3">
                {orderedItems.map((item) => (
                    <Reorder.Item key={item.id} value={item}>
                        <div className={`
                            bg-white border-4 border-slate-100 rounded-[32px] p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all
                            ${disabled ? 'opacity-80 pointer-events-none' : 'hover:border-blue-200'}
                        `}>
                            <div className="text-slate-300">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-slate-700">{item.content}</span>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>
            <p className="text-center text-slate-400 text-sm mt-4 font-medium">{normalizeDisplayText('Kéo thả để sắp xếp')}</p>
        </div>
    );
}
