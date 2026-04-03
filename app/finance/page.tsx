"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PiggyBank, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { financeCourse } from '@/lib/content/courses/finance';
import toast from 'react-hot-toast';
import { BackButton } from '@/components/ui/back-button';
import { getTheme } from '@/lib/theme';
import { getUnlockStatus } from '@/lib/unlock';
import { normalizeDisplayText } from '@/lib/text';
import { GradeContentNotice } from '@/components/grade-content-notice';
import { resolveContentGrade } from '@/lib/grades';

export default function FinancePage() {
    const router = useRouter();
    const { progress, activeProfile } = useProgress();
    const [isCheckingLock, setIsCheckingLock] = React.useState(true);
    const theme = getTheme('finance');
    const currentGrade = activeProfile?.grade || 2;
    const contentGrade = resolveContentGrade('finance', currentGrade);

    React.useEffect(() => {
        if (!progress) return;

        const status = getUnlockStatus(progress, 'finance', currentGrade);
        if (!status.unlocked) {
            const missingReqs = status.requirements.filter(r => !r.met);
            const msg = missingReqs.map(r => `${r.subjectName}: ${r.currentPercent}%/${r.requiredPercent}%`).join(', ');
            toast.error(`Chưa đủ điều kiện mở khóa! ${msg}`, {
                icon: '🔒',
                style: {
                    borderRadius: '20px',
                    background: '#333',
                    color: '#fff',
                    fontWeight: 'bold',
                }
            });
            setTimeout(() => {
                router.push('/subjects');
            }, 100);
        } else {
            setTimeout(() => {
                setIsCheckingLock(false);
            }, 0);
        }
    }, [currentGrade, progress, router]);

    const getSkillProgress = (skillId: string) => {
        if (!progress || !progress.skills) return { mastery: 0, stars: 0 };
        const s = progress.skills[skillId];
        if (!s) return { mastery: 0, stars: 0 };
        return {
            mastery: s.mastery * 100,
            stars: s.mastery >= 0.8 ? 3 : s.mastery >= 0.5 ? 2 : s.mastery > 0 ? 1 : 0
        };
    };

    if (isCheckingLock) {
        return (
            <div className={`min-h-screen ${theme.colors.light} flex items-center justify-center`}>
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <PiggyBank size={48} className="text-yellow-500 opacity-50" />
                    <p className="font-bold text-yellow-700/50">Đang kiểm tra mở khóa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.colors.light} relative overflow-hidden font-sans selection:${theme.colors.primary}/30`}>
            <div className="relative z-10 pt-8 pb-12 px-4 text-center">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <BackButton href="/today?subject=finance" theme={theme} />
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
                        Thông thái tài chính
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {theme.label}
                    </h1>
                </motion.div>
                <p className="text-slate-500 mt-4 font-medium text-lg max-w-2xl mx-auto">
                    Học cách kiếm tiền, tiết kiệm và đầu tư thông minh.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-20 space-y-16">
                <GradeContentNotice subjectId="finance" grade={currentGrade} />
                {financeCourse.topics.map((topic) => (
                    <div key={topic.id} className="relative flex flex-col">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-8 flex items-center gap-4"
                        >
                            <div className={`p-3 rounded-2xl ${theme.colors.secondary} ${theme.colors.accent}`}>
                                <TrendingUp size={24} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{normalizeDisplayText(topic.name)}</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topic.skills.filter((skill) => skill.grade === contentGrade).map((skill, skillIndex) => {
                                const { mastery, stars } = getSkillProgress(skill.id);
                                return (
                                    <motion.button
                                        key={skill.id}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: skillIndex * 0.05 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push(`/practice/${skill.id}`)}
                                        className="group relative h-full text-left"
                                    >
                                        <div className={`h-full bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 group-hover:${theme.colors.border} group-hover:${theme.colors.shadow} transition-all duration-300 relative overflow-hidden`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${mastery >= 100 ? 'bg-yellow-100 text-yellow-600' : `${theme.colors.secondary} ${theme.colors.accent}`}`}>
                                                    <PiggyBank size={24} />
                                                </div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3].map(s => (
                                                        <Star
                                                            key={s}
                                                            size={18}
                                                            className={`${s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-100'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <h3 className={`text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:${theme.colors.accent.replace('text-', 'text-')} transition-colors`}>
                                                {normalizeDisplayText(skill.name)}
                                            </h3>

                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                    <span>Tiến độ</span>
                                                    <span className={mastery >= 100 ? 'text-yellow-500' : theme.colors.accent}>{Math.round(mastery)}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${mastery}%` }}
                                                        className={`h-full rounded-full ${mastery >= 100 ? 'bg-yellow-400' : theme.colors.primary}`}
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
    );
}
