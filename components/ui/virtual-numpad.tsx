"use client";

import React from 'react';
import { Delete, Check } from 'lucide-react';

interface VirtualNumPadProps {
    value: string;
    onChange: (val: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
}

export function VirtualNumPad({ value, onChange, onSubmit, disabled }: VirtualNumPadProps) {
    const handlePress = (key: string) => {
        if (key === 'backspace') {
            onChange(value.slice(0, -1));
        } else if (key === 'enter') {
            onSubmit();
        } else {
            onChange(value + key);
        }
    };

    const keys = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
        '.', '0', 'backspace'
    ];

    return (
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto mt-4">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => handlePress(key)}
                    disabled={disabled}
                    className={`
                        h-14 rounded-xl font-black text-xl shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center
                        ${key === 'backspace'
                            ? 'bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                        }
                    `}
                >
                    {key === 'backspace' ? <Delete size={24} /> : key}
                </button>
            ))}
            <button
                onClick={() => handlePress('enter')}
                disabled={disabled}
                className="col-span-3 h-14 rounded-xl bg-blue-600 text-white border-b-4 border-blue-800 hover:bg-blue-500 font-black text-lg shadow-md active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
                <Check size={24} />
                Xac nhan
            </button>
        </div>
    );
}

