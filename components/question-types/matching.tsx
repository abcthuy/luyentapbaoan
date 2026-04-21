"use client";

import React, { useState } from 'react';

interface MatchingQuestionProps {
    pairs: { left: string; right: string }[];
    onMatch: (matches: string[]) => void; // Returns array of "left:right" strings
    disabled?: boolean;
}

export function MatchingQuestion({ pairs, onMatch, disabled }: MatchingQuestionProps) {
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matches, setMatches] = useState<Record<string, string>>({}); // left -> right

    // Randomize right side display order (simple shuffle for visual only)
    // In a real app, this should be shuffled prop or memoized to avoid re-shuffle on render
    const rightItems = pairs.map(p => p.right);

    const handleLeftClick = (leftVal: string) => {
        if (disabled || matches[leftVal]) return;
        if (selectedLeft === leftVal) {
            setSelectedLeft(null); // Deselect
        } else {
            setSelectedLeft(leftVal);
        }
    };

    const handleRightClick = (rightVal: string) => {
        if (disabled) return;
        if (selectedLeft) {
            // Check if this left item is already matched (shouldn't be, but safety check)
            if (matches[selectedLeft]) return;

            // Check if this right item is already matched
            if (Object.values(matches).includes(rightVal)) return;

            // Create match
            const newMatches = { ...matches, [selectedLeft]: rightVal };
            setMatches(newMatches);
            setSelectedLeft(null);

            // Report logic: Construct generic "answer string"
            // For simplicity, we just pass the raw matches object as JSON-like or specific format expected by parent
            // Let's assume parent expects "left1:right1,left2:right2"
            const answerString = Object.entries(newMatches).map(([l, r]) => `${l}:${r}`).join(',');
            onMatch([answerString]);
        }
    };

    const isMatchedLeft = (val: string) => !!matches[val];
    const isMatchedRight = (val: string) => Object.values(matches).includes(val);

    return (
        <div className="flex justify-between gap-8 max-w-2xl mx-auto w-full">
            {/* Left Column */}
            <div className="flex flex-col gap-4 flex-1">
                {pairs.map((p) => (
                    <button
                        key={p.left}
                        onClick={() => handleLeftClick(p.left)}
                        disabled={disabled || isMatchedLeft(p.left)}
                        className={`
                            p-4 rounded-[32px] border-4 font-bold text-lg transition-all shadow-sm
                            ${isMatchedLeft(p.left)
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-80'
                                : selectedLeft === p.left
                                    ? 'bg-blue-100 border-blue-500 text-blue-800 scale-105 shadow-md'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                            }
                        `}
                    >
                        {p.left}
                    </button>
                ))}
            </div>

            {/* Right Column (Should be shuffled in real implementation) */}
            <div className="flex flex-col gap-4 flex-1">
                {rightItems.map((r, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleRightClick(r)}
                        disabled={disabled || isMatchedRight(r)}
                        className={`
                            p-4 rounded-[32px] border-4 font-bold text-lg transition-all shadow-sm
                            ${isMatchedRight(r)
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-80'
                                : selectedLeft && !isMatchedRight(r)
                                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer animate-pulse'
                                    : 'bg-white border-slate-100 text-slate-400 cursor-default'
                            }
                        `}
                    >
                        {r}
                    </button>
                ))}
            </div>
        </div>
    );
}
