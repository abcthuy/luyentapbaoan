'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-nunito">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md border-4 border-red-50">
                <div className="bg-red-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Đã có lỗi xảy ra! 💥</h2>
                <p className="text-slate-500 font-bold mb-8">
                    Hệ thống gặp chút trục trặc. Đừng lo, hãy thử tải lại nhé!
                </p>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xl hover:bg-slate-800 hover:scale-105 transition-all shadow-xl"
                >
                    <RotateCcw size={24} />
                    Thử lại ngay
                </button>
            </div>
        </div>
    );
}
