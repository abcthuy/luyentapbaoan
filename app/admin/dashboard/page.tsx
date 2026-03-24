"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { BookOpen, KeyRound, LogOut, ArrowLeft, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from '@/lib/admin-session';

export default function AdminDashboardPage() {
    const { storage, isInitialized } = useProgress();
    const router = useRouter();

    useEffect(() => {
        if (!isInitialized) return;

        const isAuthorized = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();
        if (!isAuthorized) {
            clearAdminSession();
            router.replace('/admin');
            return;
        }

        touchAdminSession();
    }, [isInitialized, router, storage]);

    const handleLogout = () => {
        clearAdminSession();
        router.push('/');
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin text-indigo-600">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Bảng điều khiển</h1>
                            <p className="text-slate-500 font-medium">Quản lý ứng dụng Math Mastery</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:inline">Thoát</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin/password" className="group">
                        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-indigo-200 transition-all h-full flex flex-col items-start gap-4 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <KeyRound size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Đổi mật khẩu admin</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Cập nhật mã PIN bảo vệ khu vực quản trị và các hành động nhạy cảm.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/users" className="group">
                        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all h-full flex flex-col items-start gap-4 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Quản lý học viên</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Xem danh sách, chỉnh sửa PIN và xóa tài khoản học viên trong bảng quản lý.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/parents" className="group">
                        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all h-full flex flex-col items-start gap-4 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Quản lý phụ huynh</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Thêm tài khoản phụ huynh và liên kết các bé để kiểm duyệt phần quà lưu niệm.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/library" className="group">
                        <div className="bg-white p-8 rounded-[32px] border-2 border-slate-100 shadow-xl hover:shadow-2xl hover:border-violet-200 transition-all h-full flex flex-col items-start gap-4 hover:-translate-y-1">
                            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Thư viện nội dung</h3>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">Xuất toàn bộ thư viện, tải mẫu Word và nhập thêm skill, câu hỏi mới.</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex justify-center pt-8 border-t border-slate-200">
                    <Link href="/profiles">
                        <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
                            <span>Vào màn hình chọn hồ sơ (để học)</span>
                            <ArrowLeft size={20} className="rotate-180" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
