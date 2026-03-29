"use client";

import React from "react";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { ProgressData } from "@/lib/mastery";

export function AnalyticsChart({ progress }: { progress: ProgressData | null }) {
    if (!progress) return null;

    const skillData = Object.values(progress.skills)
        .filter((skill) => skill.attempts > 0)
        .map((skill) => ({
            name: skill.skillId.split("-")[1] || skill.skillId,
            mastery: Math.max(10, Math.round(skill.mastery * 100)),
            fullMark: 100,
            attempts: skill.attempts,
        }))
        .slice(0, 6);

    const useRadar = skillData.length >= 3;

    return (
        <div className="group relative overflow-hidden rounded-[40px] border-4 border-slate-50 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="pointer-events-none absolute top-0 right-0 p-12 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                <div className="h-64 w-64 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-50 blur-3xl" />
            </div>

            <div className="relative z-10 mb-8 flex items-center justify-between">
                <div>
                    <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
                        Bieu do nang luc
                    </h3>
                    <p className="font-medium text-slate-500">Phan tich diem manh va diem yeu</p>
                </div>
                {useRadar ? (
                    <div className="hidden rounded-xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:bg-slate-700 dark:text-blue-300 md:block">
                        Radar View
                    </div>
                ) : null}
            </div>

            <div className="relative z-10 flex h-[350px] w-full items-center justify-center">
                {skillData.length === 0 ? (
                    <div className="text-center text-slate-400">
                        <p className="mb-4 text-6xl">Chart</p>
                        <p className="font-bold">Chua co du lieu de phan tich.</p>
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
                                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 800 }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Nang luc"
                                dataKey="mastery"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#radarFill)"
                                fillOpacity={0.6}
                                isAnimationActive
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "16px",
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    border: "none",
                                    boxShadow:
                                        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                    padding: "16px",
                                }}
                                itemStyle={{ color: "#1e293b", fontWeight: 800 }}
                                formatter={(value) => {
                                    const numericValue = typeof value === "number" ? value : Number(value) || 0;
                                    return [`${numericValue}%`, "Thanh thao"];
                                }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full max-w-lg space-y-6">
                        {skillData.map((skill) => (
                            <div key={skill.name} className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{skill.name}</span>
                                    <span className="font-black text-blue-600 dark:text-blue-400">
                                        {skill.mastery}%
                                    </span>
                                </div>
                                <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.mastery}%` }}
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
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
