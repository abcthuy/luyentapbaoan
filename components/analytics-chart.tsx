"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { ProgressData } from '@/lib/mastery';
import { motion } from 'framer-motion';

export function AnalyticsChart({ progress }: { progress: ProgressData | null }) {
    if (!progress) return null;

    // Transform skills data
    const skillData = Object.values(progress.skills)
        .filter(s => s.attempts > 0)
        .map(s => ({
            name: s.skillId.split('-')[1] || s.skillId,
            mastery: Math.max(10, Math.round(s.mastery * 100)), // Min 10 for visibility
            fullMark: 100,
            attempts: s.attempts
        }))
        .slice(0, 6); // Max 6 for meaningful hexagon/shape

    // If less than 3 skills, Radar looks bad. Fallback to nice Progress Bars.
    const useRadar = skillData.length >= 3;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 shadow-2xl border-4 border-slate-50 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-3xl opacity-50" />
            </div>

            <div className="relative z-10 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Biểu đồ Năng lực 🕸️</h3>
                    <p className="text-slate-500 font-medium">Phân tích điểm mạnh & điểm yếu</p>
                </div>
                {useRadar && <div className="hidden md:block px-4 py-2 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-black uppercase tracking-widest">Radar View</div>}
            </div>

            <div className="h-[350px] w-full relative z-10 flex items-center justify-center">
                {skillData.length === 0 ? (
                    <div className="text-center text-slate-400">
                        <p className="text-6xl mb-4">📊</p>
                        <p className="font-bold">Chưa có dữ liệu để phân tích.</p>
                    </div>
                ) : useRadar ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                            <defs>
                                <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <PolarGrid gridType="polygon" stroke="#cbd5e1" strokeDasharray="4 4" />
                            <PolarAngleAxis
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Năng lực"
                                dataKey="mastery"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#radarFill)"
                                fillOpacity={0.6}
                                isAnimationActive={true}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                    padding: '16px'
                                }}
                                itemStyle={{ color: '#1e293b', fontWeight: 800 }}
                                formatter={(value: number | undefined) => [`${value || 0}%`, 'Thành thạo']}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full max-w-lg space-y-6">
                        {skillData.map((skill) => (
                            <div key={skill.name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{skill.name}</span>
                                    <span className="font-black text-blue-600 dark:text-blue-400">{skill.mastery}%</span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.mastery}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
