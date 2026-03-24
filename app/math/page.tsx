"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Calculator, Zap, Map as MapIcon, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgress } from '@/components/progress-provider';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { mathCourse } from '@/lib/content/courses/math';

const ZONE_NAMES = [
    { name: "Rừng Số Học", color: "from-emerald-400 to-green-600", icon: Calculator },
    { name: "Thung Lũng Hình Học", color: "from-blue-400 to-indigo-600", icon: MapIcon },
    { name: "Đỉnh Núi Tư Duy", color: "from-purple-400 to-pink-600", icon: Zap },
];

import { BackButton } from '@/components/ui/back-button';
import { getTheme } from '@/lib/theme';
import { isSkillAvailableForGrade } from '@/lib/skills';

export default function MathPage() {
    const router = useRouter();
    const { progress, activeProfile } = useProgress();
    const theme = getTheme('math');
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
                    <BackButton href="/today?subject=math" theme={theme} />
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-3">
                    <WalletButton />
                    {/* Only show UserMenu on mobile here, as desktop has it in sidebar */}
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
                        Luyện tập theo chủ đề
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                        {theme.label}
                    </h1>
                </motion.div>
                <p className="text-slate-500 mt-4 font-medium text-lg max-w-2xl mx-auto">
                    Chọn một kỹ năng bên dưới để bắt đầu luyện tập!
                </p>
            </div>

            {/* Main Map Content */}
            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-20 space-y-24">
                {mathCourse.topics.map((topic, index) => {
                    const zone = ZONE_NAMES[index] || ZONE_NAMES[0];
                    const ZoneIcon = zone.icon;

                    return (
                        <div key={topic.id} className="relative flex flex-col">

                            {/* Zone Title */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="mb-8 flex items-center gap-4"
                            >
                                <div className={`p-4 rounded-3xl bg-gradient-to-br ${zone.color} shadow-lg shadow-blue-900/5`}>
                                    <ZoneIcon className="text-white" size={32} />
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs font-black uppercase tracking-widest">Khu vực {index + 1}</div>
                                    <h2 className="text-3xl font-black text-slate-900">{zone.name}</h2>
                                </div>
                            </motion.div>

                            {/* Skills / Nodes Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
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
                                            <div className="h-full bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-xl shadow-slate-200/50 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">

                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${mastery >= 100 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {skillIndex + 1}
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

                                                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {skill.name}
                                                </h3>

                                                <div className="mt-4">
                                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                        <span>Tiến độ</span>
                                                        <span className={mastery >= 100 ? 'text-yellow-500' : 'text-blue-500'}>{Math.round(mastery)}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${mastery}%` }}
                                                            className={`h-full rounded-full ${mastery >= 100 ? 'bg-yellow-400' : 'bg-blue-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
