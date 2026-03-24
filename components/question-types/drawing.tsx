"use client";

import React, { useState } from 'react';

interface DrawingQuestionProps {
    mode?: 'geometry' | 'coloring' | 'free';
    content?: {
        totalParts?: number;
        cols?: number;
    };
    onAnswer: (data: string) => void;
    disabled?: boolean;
}

export function DrawingQuestion({ mode = 'free', content, onAnswer, disabled }: DrawingQuestionProps) {
    // Coloring Mode (Fraction Coloring)
    // Simple implementation: A grid of squares or circle segments
    // For MVP, let's do a Grid of squares (easier to render responsive HTML/CSS)
    const [coloredParts, setColoredParts] = useState<number[]>([]);

    // Default to a 2x2 or 3x3 grid if not specified
    const totalParts = content?.totalParts || 4;
    const cols = content?.cols || 2;

    const togglePart = (index: number) => {
        if (disabled) return;

        let newColored;
        if (coloredParts.includes(index)) {
            newColored = coloredParts.filter(i => i !== index);
        } else {
            newColored = [...coloredParts, index];
        }

        setColoredParts(newColored);
        // Answer is the fraction string "colored/total"
        onAnswer(`${newColored.length}/${totalParts}`);
    };

    if (mode === 'coloring') {
        return (
            <div className="flex flex-col items-center gap-6">
                <div
                    className="grid gap-2 border-4 border-slate-800 p-2 bg-white"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        width: 'min(300px, 80vw)'
                    }}
                >
                    {Array.from({ length: totalParts }).map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => togglePart(idx)}
                            className={`
                                aspect-square border-2 border-slate-200 cursor-pointer transition-all
                                ${coloredParts.includes(idx) ? 'bg-blue-500 border-blue-600' : 'bg-white hover:bg-blue-50'}
                                ${disabled ? 'pointer-events-none opacity-80' : ''}
                            `}
                        />
                    ))}
                </div>
                <p className="text-slate-500 font-medium">Click vào các ô để tô màu</p>
            </div>
        );
    }

    return (
        <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-slate-400">Chế độ vẽ này đang được cập nhật...</p>
        </div>
    );
}
