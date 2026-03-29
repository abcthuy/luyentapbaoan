"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/components/progress-provider';
import { LogOut, CheckCircle2, XCircle, Clock, Gift, Shield, Target, AlertTriangle } from 'lucide-react';
import { getAllCourses } from '@/lib/content/registry';

type ParentSession = {
    parentId: string;
    sourceSyncId: string;
    parentMatchKey?: string;
};

const PARENT_SESSION_KEY = 'math_parent_session';

function readParentSession(): ParentSession | null {
    if (typeof window === 'undefined') return null;

    const raw = sessionStorage.getItem(PARENT_SESSION_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as Partial<ParentSession>;
        if (parsed.parentId && parsed.sourceSyncId) {
            return {
                parentId: parsed.parentId,
                sourceSyncId: parsed.sourceSyncId,
                parentMatchKey: parsed.parentMatchKey,
            };
        }
    } catch {
        return {
            parentId: raw,
            sourceSyncId: localStorage.getItem('math_sync_id') || '',
        };
    }

    return null;
}

export default function ParentDashboardPage() {
    const { storage, allProfiles, allParents, processRewardApproval, isInitialized, refreshData } = useProgress();
    const router = useRouter();
    const [parentSession, setParentSession] = useState<ParentSession | null>(() => readParentSession());

    useEffect(() => {
        if (!isInitialized) return;
        if (!parentSession?.parentId || !parentSession.sourceSyncId) {
            router.push('/login/parent');
            return;
        }

        const currentSyncId = localStorage.getItem('math_sync_id') || '';
        if (currentSyncId !== parentSession.sourceSyncId) {
            localStorage.setItem('math_sync_id', parentSession.sourceSyncId);
            void refreshData();
        }
    }, [isInitialized, parentSession, refreshData, router]);

    const parentEntry = useMemo(() => {
        if (!parentSession?.parentId) return null;

        if (parentSession.parentMatchKey) {
            return allParents.find((entry) => entry.matchKey === parentSession.parentMatchKey) || null;
        }

        return allParents.find((entry) => entry.parent.id === parentSession.parentId) || null;
    }, [allParents, parentSession?.parentId, parentSession?.parentMatchKey]);

    const parentProfile = parentEntry?.parent || null;

    const managedChildren = useMemo(() => {
        if (!parentEntry) return [];

        return parentEntry.childRefs
            .map((childRef) => allProfiles.find((item) => item.sourceSyncId === childRef.childSyncId && item.profile.id === childRef.childId)?.profile || null)
            .filter((child): child is NonNullable<typeof child> => Boolean(child));
    }, [allProfiles, parentEntry]);

    useEffect(() => {
        if (!isInitialized || !parentSession?.parentId) return;
        if (!parentProfile) {
            sessionStorage.removeItem(PARENT_SESSION_KEY);
            setParentSession(null);
            router.push('/login/parent');
        }
    }, [isInitialized, parentProfile, parentSession?.parentId, router]);

    if (!isInitialized || !parentSession?.parentId) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-emerald-600">Dang tai du lieu...</div></div>;
    }

    if (!parentProfile) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-emerald-600">Dang chuyen huong...</div></div>;
    }

    const handleLogout = () => {
        sessionStorage.removeItem(PARENT_SESSION_KEY);
        setParentSession(null);
        router.push('/login/parent');
    };

    const allCourses = getAllCourses();
    const getSkillInfo = (skillId: string) => {
        for (const course of allCourses) {
            for (const topic of course.topics) {
                const skill = topic.skills.find((s) => s.id === skillId);
                if (skill) {
                    return { subjectName: course.name, topicName: topic.name, skillName: skill.name };
                }
            }
        }
        return { subjectName: 'Khac', topicName: 'Chung', skillName: skillId };
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Portal Phu Huynh</h1>
                            <p className="text-slate-500 font-medium">Chao mung, {parentProfile.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all w-full sm:w-auto"
                    >
                        <LogOut size={18} />
                        <span>Thoat</span>
                    </button>
                </div>

                {managedChildren.length === 0 ? (
                    <div className="bg-white p-12 rounded-[32px] text-center shadow-lg border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Gift size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Chua Co Hoc Sinh Nao</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                            Tai khoan cua ban chua duoc cap quyen quan ly tien do cho be nao. Vui long lien he Admin de duoc ho tro.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {managedChildren.map((child) => {
                            const pendingItems = child.progress.inventory.filter((item) => item.status === 'pending');
                            const weakSkills = Object.entries(child.progress.skills || {})
                                .filter(([, data]) => data.attempts >= 1 && data.mastery < 0.7)
                                .map(([id, data]) => ({
                                    ...data,
                                    id,
                                    info: getSkillInfo(id)
                                }))
                                .sort((a, b) => a.mastery - b.mastery)
                                .slice(0, 5);

                            return (
                                <div key={child.id} className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100 flex flex-col">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-5xl bg-white/20 p-2 rounded-2xl backdrop-blur-sm shadow-inner">
                                                {child.avatar}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black">{child.name}</h2>
                                                <div className="flex gap-4 mt-1 opacity-90 text-sm font-medium">
                                                    <span>Lop {child.grade}</span>
                                                    <span>•</span>
                                                    <span>Tong sao: {child.progress.balance} ?</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-3xl font-black">{pendingItems.length}</div>
                                            <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Mon Cho Duyet</div>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        {pendingItems.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 size={32} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-700">Khong co yeu cau nao</h3>
                                                <p className="text-slate-500 text-sm mt-1">Tat ca phan qua cua be da duoc duyet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pendingItems.map((item) => (
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
                                                                    if (confirm(`Ban co chac muon duyet "${item.name}" cho be?`)) {
                                                                        processRewardApproval(child.id, item.id, 'approve');
                                                                    }
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                                title="Dong y tang qua"
                                                            >
                                                                <CheckCircle2 size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Ban co chac muon tu choi "${item.name}"? So sao se duoc tra lai cho be.`)) {
                                                                        processRewardApproval(child.id, item.id, 'reject');
                                                                    }
                                                                }}
                                                                className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                                                                title="Tu choi"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                                                <Target size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">Muc Tieu Be Can Co Gang</h3>
                                                <p className="text-sm font-medium text-slate-500">Cac phan kien thuc be dang lam sai nhieu</p>
                                            </div>
                                        </div>

                                        {weakSkills.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center gap-2 mb-3">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <p className="text-slate-600 font-bold">That tuyet voi! Be dang hoc rat tot.</p>
                                                <p className="text-sm text-slate-500 mt-1">Hien khong co phan kien thuc nao bi bao dong do.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {weakSkills.map((skill) => (
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
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Do thanh thao</div>
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

