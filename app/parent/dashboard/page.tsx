"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { LogOut, CheckCircle2, XCircle, Clock, Gift, Shield, Target, AlertTriangle } from 'lucide-react';
import { getAllCourses } from '@/lib/content/registry';

export default function ParentDashboardPage() {
    const { storage, allProfiles, processRewardApproval, isInitialized } = useProgress();
    const router = useRouter();
    const [parentId] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem('math_parent_session');
    });

    // Initial Auth Check
    useEffect(() => {
        if (!isInitialized) return;
        if (!parentId) {
            router.push('/login/parent');
        }
    }, [isInitialized, parentId, router]);

    const parentProfile = storage?.parents?.find(p => p.id === parentId);

    useEffect(() => {
        if (!isInitialized || !storage || !parentId) return;
        if (!parentProfile) {
            sessionStorage.removeItem('math_parent_session');
            router.push('/login/parent');
        }
    }, [isInitialized, parentId, parentProfile, router, storage]);

    if (!isInitialized || !parentId || !storage) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-emerald-600">Đang tải dữ liệu...</div></div>;
    }

    if (!parentProfile) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-emerald-600">Đang chuyển hướng...</div></div>;
    }

    const handleLogout = () => {
        sessionStorage.removeItem('math_parent_session');
        router.push('/login/parent');
    };

    // Lọc danh sách học sinh thuộc quyền quản lý của phụ huynh này
    const managedChildren = allProfiles
        .filter(p => parentProfile.childrenIds.includes(p.profile.id))
        .map(p => p.profile);

    // Helpers to get human-readable skill names
    const allCourses = getAllCourses();
    const getSkillInfo = (skillId: string) => {
        for (const course of allCourses) {
            for (const topic of course.topics) {
                const skill = topic.skills.find(s => s.id === skillId);
                if (skill) {
                    return { subjectName: course.name, topicName: topic.name, skillName: skill.name };
                }
            }
        }
        return { subjectName: 'Khác', topicName: 'Chung', skillName: skillId };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Portal Phụ Huynh</h1>
                            <p className="text-slate-500 font-medium">Chào mừng, {parentProfile.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all w-full sm:w-auto"
                    >
                        <LogOut size={18} />
                        <span>Thoát</span>
                    </button>
                </div>

                {managedChildren.length === 0 ? (
                    <div className="bg-white p-12 rounded-[32px] text-center shadow-lg border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gift size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Chưa Có Học Sinh Nào</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                            Tài khoản của bạn chưa được cấp quyền quản lý tiến độ cho bé nào. Vui lòng liên hệ Admin để được hỗ trợ.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {managedChildren.map(child => {
                            // Lọc các món quà đang chờ duyệt
                            const pendingItems = child.progress.inventory.filter(item => item.status === 'pending');

                            // Phân tích điểm yếu (mastery < 0.7 và đã thử ít nhất 2 lần)
                            const weakSkills = Object.entries(child.progress.skills || {})
                                .filter(([, data]) => data.attempts >= 1 && data.mastery < 0.7)
                                .map(([id, data]) => ({
                                    ...data,
                                    id,
                                    info: getSkillInfo(id)
                                }))
                                .sort((a, b) => a.mastery - b.mastery) // Sắp xếp kỹ năng yếu nhất lên đầu
                                .slice(0, 5); // Hiển thị top 5

                            return (
                                <div key={child.id} className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100 flex flex-col">
                                    {/* Child Header */}
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-5xl bg-white/20 p-2 rounded-2xl backdrop-blur-sm shadow-inner">
                                                {child.avatar}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black">{child.name}</h2>
                                                <div className="flex gap-4 mt-1 opacity-90 text-sm font-medium">
                                                    <span>Lớp {child.grade}</span>
                                                    <span>•</span>
                                                    <span>Tổng sao: {child.progress.balance} ⭐</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-3xl font-black">{pendingItems.length}</div>
                                            <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Món Chờ Duyệt</div>
                                        </div>
                                    </div>

                                    {/* Pending Items List */}
                                    <div className="p-8">
                                        {pendingItems.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-700">Không có yêu cầu nào</h3>
                                                <p className="text-slate-500 text-sm mt-1">Tất cả phần quà của bé đã được duyệt.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pendingItems.map(item => (
                                                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 transition-all items-center">
                                                        <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-3xl">
                                                            {item.image.startsWith('http') ? (
                                                                <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                item.image
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                                                    {item.cost} sao
                                                                </span>
                                                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {new Date(item.purchaseDate).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Bạn có chắc muốn duyệt "${item.name}" cho bé?`)) {
                                                                        processRewardApproval(child.id, item.id, 'approve');
                                                                    }
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                                title="Đồng ý tặng quà"
                                                            >
                                                                <CheckCircle2 size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Bạn có chắc muốn từ chối "${item.name}"? Số sao sẽ được trả lại cho bé.`)) {
                                                                        processRewardApproval(child.id, item.id, 'reject');
                                                                    }
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                                title="Từ chối (Hoàn tiền cho bé)"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Nhắc nhở Học tập / Mục tiêu yếu */}
                                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">Mục Tiêu Bé Cần Cố Gắng</h3>
                                                <p className="text-sm font-medium text-slate-500">Các phần kiến thức bé đang làm sai nhiều</p>
                                            </div>
                                        </div>

                                        {weakSkills.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center gap-2 mb-3">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <p className="text-slate-600 font-bold">Thật tuyệt vời! Bé đang học rất tốt.</p>
                                                <p className="text-sm text-slate-500 mt-1">Hiện không có phần kiến thức nào bị báo động đỏ.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {weakSkills.map(skill => (
                                                    <div key={skill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-1">
                                                                <AlertTriangle size={18} className="text-amber-500" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">{skill.info.skillName}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                                                        {skill.info.subjectName}
                                                                    </span>
                                                                    <span className="text-xs font-medium text-slate-400">
                                                                        ({skill.info.topicName})
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 sm:ml-auto">
                                                            <div className="text-right">
                                                                <div className="text-sm font-black text-slate-700">{Math.round(skill.mastery * 100)}%</div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Độ thành thạo</div>
                                                            </div>
                                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${skill.mastery < 0.4 ? 'bg-rose-500' : 'bg-amber-400'}`}
                                                                    style={{ width: `${Math.max(5, skill.mastery * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
