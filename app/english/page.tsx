"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Headphones, Mic, BookOpen, PenTool, Star, Globe2 } from 'lucide-react';
import { useProgress } from '@/components/progress-provider';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { englishCourse } from '@/lib/content/courses/english';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/ui/back-button';
import { getTheme } from '@/lib/theme';
import { getUnlockStatus } from '@/lib/unlock';
import { normalizeDisplayText } from '@/lib/text';
import { GradeContentNotice } from '@/components/grade-content-notice';
import { resolveContentGrade } from '@/lib/grades';

type EnglishTab = 'all' | 'listening' | 'speaking' | 'reading' | 'writing';

type CategoryConfig = {
    id: Exclude<EnglishTab, 'all'>;
    label: string;
    icon: typeof Headphones;
    color: string;
    text: string;
    bg: string;
};

const CATEGORIES: CategoryConfig[] = [
    { id: 'listening', label: 'Listening (Nghe)', icon: Headphones, color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'speaking', label: 'Speaking (Nói)', icon: Mic, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'reading', label: 'Reading (Đọc)', icon: BookOpen, color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'writing', label: 'Writing (Viết)', icon: PenTool, color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
];

function getCategory(skillId: string, name: string): EnglishTab {
    const lower = (skillId + name).toLowerCase();
    if (lower.includes('list') || lower.includes('nghe')) return 'listening';
    if (lower.includes('speak') || lower.includes('nói') || lower.includes('noi') || lower.includes('oratory') || lower.includes('hùng biện') || lower.includes('hung-bien')) return 'speaking';
    if (lower.includes('read') || lower.includes('đọc') || lower.includes('doc') || lower.includes('story')) return 'reading';
    if (lower.includes('writ') || lower.includes('viết') || lower.includes('viet')) return 'writing';
    return 'all';
}

export default function EnglishPage() {
    const router = useRouter();
    const { progress, activeProfile } = useProgress();
    const [activeTab, setActiveTab] = useState<EnglishTab>('all');
    const [isCheckingLock, setIsCheckingLock] = useState(true);
    const theme = getTheme('english');
    const currentGrade = activeProfile?.grade || 2;
    const contentGrade = resolveContentGrade('english', currentGrade);

    useEffect(() => {
        if (!progress) return;

        const status = getUnlockStatus(progress, 'english', currentGrade);
        if (!status.unlocked) {
            const missingReqs = status.requirements.filter((requirement) => !requirement.met);
            const message = missingReqs.map((requirement) => `${requirement.subjectName}: ${requirement.currentPercent}%/${requirement.requiredPercent}%`).join(', ');
            toast.error(`Chưa đủ điều kiện mở khóa! ${message}`, {
                icon: '🔒',
                style: {
                    borderRadius: '20px',
                    background: '#333',
                    color: '#fff',
                    fontWeight: 'bold',
                },
            });
            setTimeout(() => {
                router.push('/subjects');
            }, 100);
            return;
        }

        setIsCheckingLock(false);
    }, [currentGrade, progress, router]);

    const getSkillProgress = (skillId: string) => {
        if (!progress || !progress.skills) return { mastery: 0, stars: 0 };
        const skillState = progress.skills[skillId];
        if (!skillState) return { mastery: 0, stars: 0 };

        return {
            mastery: skillState.mastery * 100,
            stars: skillState.mastery >= 0.8 ? 3 : skillState.mastery >= 0.5 ? 2 : skillState.mastery > 0 ? 1 : 0,
        };
    };

    const visibleTopics = useMemo(() => {
        return englishCourse.topics.map((topic) => ({
            ...topic,
            visibleSkills: topic.skills.filter((skill) => {
                if (skill.grade !== contentGrade) return false;
                const category = getCategory(skill.id, skill.name);
                return activeTab === 'all' || category === activeTab;
            }),
        })).filter((topic) => topic.visibleSkills.length > 0);
    }, [activeTab, contentGrade]);

    if (isCheckingLock) {
        return (
            <div className={`min-h-screen ${theme.colors.light} flex items-center justify-center`}>
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Globe2 size={48} className="text-emerald-500 opacity-50" />
                    <p className="font-bold text-emerald-700/60">Đang kiểm tra mở khóa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.colors.light} relative overflow-hidden font-sans selection:${theme.colors.primary}/30`}>
            <div className="relative z-10 pt-8 pb-12 px-4 text-center">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <BackButton href="/today?subject=english" theme={theme} />
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <WalletButton />
                    <div className="md:hidden">
                        <UserMenu theme={theme} />
                    </div>
                </div>

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-block"
                >
                    <span className={`text-sm font-black ${theme.colors.accent} uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border ${theme.colors.border} mb-4 inline-block backdrop-blur-sm`}>
                        Language Arts
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {theme.label}
                    </h1>
                </motion.div>
                <p className="text-slate-500 mt-4 font-medium text-lg max-w-2xl mx-auto">
                    Chinh phục 4 kỹ năng: Nghe, Nói, Đọc, Viết.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-20 space-y-12">
                <GradeContentNotice subjectId="english" grade={currentGrade} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeTab === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setActiveTab(isActive ? 'all' : category.id)}
                                className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${isActive ? 'bg-white border-slate-900 shadow-xl scale-105' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-md'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl ${category.bg} flex items-center justify-center`}>
                                    <Icon size={24} className={category.text} />
                                </div>
                                <span className={`font-bold text-sm ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{category.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-16">
                    {visibleTopics.map((topic) => (
                        <div key={topic.id} className="relative flex flex-col">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-4"
                            >
                                <div className={`p-3 rounded-2xl ${theme.colors.secondary} ${theme.colors.accent}`}>
                                    <Globe2 size={24} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{normalizeDisplayText(topic.name)}</h2>
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {topic.visibleSkills.map((skill) => {
                                    const { mastery, stars } = getSkillProgress(skill.id);
                                    const categoryId = getCategory(skill.id, skill.name);
                                    const category = CATEGORIES.find((item) => item.id === categoryId) || CATEGORIES[0];
                                    const Icon = category.icon;

                                    return (
                                        <motion.button
                                            key={skill.id}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            whileHover={{ y: -8, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push(`/practice/${skill.id}`)}
                                            className="group relative h-full text-left"
                                        >
                                            <div className="h-full bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all duration-300 relative overflow-hidden hover:border-emerald-200 hover:shadow-emerald-100">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category.bg}`}>
                                                        <Icon size={20} className={category.text} />
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={18}
                                                                className={`${star <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-100'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 transition-colors group-hover:text-emerald-600">
                                                    {normalizeDisplayText(skill.name)}
                                                </h3>

                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                        <span>Tiến độ</span>
                                                        <span className={mastery >= 100 ? 'text-yellow-500' : category.text}>{Math.round(mastery)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${mastery}%` }}
                                                            className={`h-full rounded-full ${category.color}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
