"use client";

import React from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/progress-provider';
import { isSkillAvailableForGrade, SKILL_MAP, SkillId } from '@/lib/skills';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Trophy, Target, Zap } from 'lucide-react';

export default function PracticeListingPage() {
    const { progress, activeProfile } = useProgress();
    const currentGrade = activeProfile?.grade || 2;

    if (!progress) return null;

    // Group skills by Category
    const categories: Record<string, SkillId[]> = {};
    Object.values(SKILL_MAP).filter((skill) => isSkillAvailableForGrade(skill, currentGrade)).forEach(skill => {
        const cat = skill.category || 'Khác';
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(skill.id);
    });

    const getSkillLevel = (id: SkillId) => {
        return progress.skills[id]?.level || 1;
    };

    const getSkillMastery = (id: SkillId) => {
        return Math.round((progress.skills[id]?.mastery || 0) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors">
                        <ArrowLeft size={20} /> Quay lại
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                            <Target size={20} />
                        </div>
                        <span className="font-black text-slate-800 uppercase tracking-widest text-sm md:text-base">Kho Luyện Tập</span>
                    </div>
                    <div className="w-[80px]"></div> {/* Spacer for centering */}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Chọn chủ đề ôn luyện</h1>
                    <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
                        Cày cấp độ cho từng kỹ năng. Thoải mái luyện tập không giới hạn thời gian!
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {Object.entries(categories).map(([category, skillIds]) => (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-8 w-1 bg-indigo-500 rounded-full"></span>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wider">{category}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {skillIds.map(skillId => {
                                    const skill = SKILL_MAP[skillId];
                                    const level = getSkillLevel(skillId);
                                    const mastery = getSkillMastery(skillId);

                                    return (
                                        <Link key={skillId} href={`/practice/${skillId}`}>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="bg-white rounded-3xl border-4 border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-yellow-100">
                                                        <Trophy size={14} /> Level {level}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">{skill.name}</h3>

                                                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Zap size={14} className={mastery > 80 ? 'text-amber-500' : 'text-slate-400'} />
                                                        <span>Thành thạo: {mastery}%</span>
                                                    </div>
                                                </div>

                                                {/* Mastery Bar */}
                                                <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${mastery > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${mastery}%` }}
                                                    ></div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
