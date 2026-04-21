import React from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { formatCurrency } from '@/lib/utils';
import { normalizeDisplayText } from '@/lib/text';

interface WalletButtonProps {
    className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
    const router = useRouter();
    const { progress } = useProgress();

    if (!progress) return null;

    return (
        <button
            onClick={() => router.push('/wallet')}
            className={`flex items-center gap-3 bg-white/70 backdrop-blur-xl p-2 pr-6 rounded-[32px] shadow-lg border border-white/50 ring-1 ring-slate-100 group transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
        >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:rotate-12 transition-transform">
                💰
            </div>
            <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">{normalizeDisplayText('Ví của bé')}</span>
                <span className="font-black text-slate-800 text-lg leading-none">{formatCurrency(progress.balance)}</span>
            </div>
        </button>
    );
}
