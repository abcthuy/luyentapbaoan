"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Book, PenTool, Feather, Star, Mic, Layers, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { vietnameseCourse } from '@/lib/content/courses/vietnamese';

import { BackButton } from '@/components/ui/back-button';
import { getTheme } from '@/lib/theme';
import { isSkillAvailableForGrade } from '@/lib/skills';

export default function VietnamesePage() {
    const router = useRouter();
    const { progress, activeProfile } = useProgress();
    const theme = getTheme('vietnamese');
    const currentGrade = activeProfile?.grade || 2;

    const getSkillProgress = (skillId: string) => {
        if (!progress || !progress.skills) return { mastery: 0, stars: 0 };
        const s = progress.skills[skillId];
        if (!s) return { mastery: 0, stars: 0 };
        return {
            mastery: s.mastery * 100,
            stars: s.mastery >= 0.8 ? 3 : s.mastery >= 0.5 ? 2 : s.mastery > 0 ? 1 : 0
        };
    };

    return (
        <div className={`min-h-screen ${theme.colors.light} relative overflow-hidden font-sans selection:${theme.colors.primary}/30`}>
            {/* Header */}
            <div className="relative z-10 pt-8 pb-12 px-4 text-center">
                <div className="absolute top-6 left-6 flex items-center gap-3">
                    <BackButton href="/today?subject=vietnamese" theme={theme} />
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <WalletButton />
                    {/* Only show UserMenu on mobile here */}
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
                        Luyện từ & câu
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {theme.label}
                    </h1>
                </motion.div>
                <p className="text-slate-500 mt-4 font-medium text-lg max-w-2xl mx-auto">
                    Khám phá vẻ đẹp của ngôn ngữ tiếng Việt qua từng bài học.
                </p>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-20 space-y-16">
                {vietnameseCourse.topics.map((topic) => (
                    <div key={topic.id} className="relative flex flex-col">

                        {/* Topic Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-8 flex items-center gap-4"
                        >
                            <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                                {topic.id === 'doc-hieu' && <BookOpen size={24} />}
                                {topic.id === 'luyen-tu-cau' && <Layers size={24} />}
                                {topic.id === 'chinh-ta-tap-lam-van' && <PenTool size={24} />}
                                {topic.id === 'nghe-noi' && <Mic size={24} />}
                                {!['doc-hieu', 'luyen-tu-cau', 'chinh-ta-tap-lam-van', 'nghe-noi'].includes(topic.id) && <Feather size={24} />}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{topic.name}</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topic.skills.filter((skill) => isSkillAvailableForGrade(skill, currentGrade)).map((skill, skillIndex) => {
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
                                        <div className="h-full bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 group-hover:border-orange-500/30 group-hover:shadow-orange-500/10 transition-all duration-300 relative overflow-hidden">

                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${mastery >= 100 ? 'bg-yellow-100 text-yellow-600' : 'bg-orange-50 text-orange-500'}`}>
                                                    <Book size={20} />
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

                                            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                                {skill.name}
                                            </h3>

                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                    <span>Tiến độ</span>
                                                    <span className={mastery >= 100 ? 'text-yellow-500' : 'text-orange-500'}>{Math.round(mastery)}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${mastery}%` }}
                                                        className={`h-full rounded-full ${mastery >= 100 ? 'bg-yellow-400' : 'bg-orange-500'}`}
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
