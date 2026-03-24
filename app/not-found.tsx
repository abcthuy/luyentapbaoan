import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-nunito">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md border-4 border-slate-100">
                <AlertCircle size={80} className="text-amber-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black text-slate-800 mb-4">Ôi hỏng! 👻</h2>
                <p className="text-lg text-slate-500 font-bold mb-8">
                    Trang bạn tìm kiếm đã đi lạc vào vũ trụ toán học rồi.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xl hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-200"
                >
                    <Home size={24} />
                    Về Trang Chủ
                </Link>
            </div>
        </div>
    );
}
