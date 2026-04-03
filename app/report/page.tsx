"use client";

import React from 'react';
import { useProgress } from '@/components/progress-provider';
import { isSkillAvailableForGrade, SKILL_MAP, SkillId } from '@/lib/skills';
import { getMasteryLabel, getOverallRank, MasteryState } from '@/lib/mastery';
import { getAllCourses } from '@/lib/content/registry';
import { Trophy, Star, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getUnlockStatus } from '@/lib/unlock';
import { normalizeDisplayText } from '@/lib/text';

export default function ReportPage() {
    const { progress, activeProfile } = useProgress();
    const router = useRouter();
    const currentGrade = activeProfile?.grade || 2;
    const [selectedSubject, setSelectedSubject] = React.useState<string | 'all'>('all');
    const [selectedMastery, setSelectedMastery] = React.useState<string | 'all'>('all');
    const [selectedSemester, setSelectedSemester] = React.useState<number | 'all'>('all');

    const searchParams = useSearchParams();
    React.useEffect(() => {
        const subject = searchParams.get('subject');
        if (subject) setSelectedSubject(subject);
    }, [searchParams]);

    React.useEffect(() => {
        if (!progress) return;
        const subject = searchParams.get('subject');
        if (!subject) return;

        const status = getUnlockStatus(progress, subject, currentGrade);
        if (!status.unlocked) {
            const missingReqs = status.requirements.filter((r) => !r.met);
            const msg = missingReqs.map((r) => `${r.subjectName}: ${r.currentPercent}%/${r.requiredPercent}%`).join(', ');
            toast.error(`Chưa đủ điều kiện! ${msg}`, {
                icon: '🔒',
                style: { borderRadius: '20px', background: '#333', color: '#fff', fontWeight: 'bold' },
            });
            setTimeout(() => router.push('/subjects'), 100);
        }
    }, [currentGrade, progress, searchParams, router]);

    if (!progress) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                <div className="text-6xl">📊</div>
                <h2 className="text-2xl font-black text-slate-700">Chưa có dữ liệu</h2>
                <p className="text-slate-500">Hãy bắt đầu học để xem tiến bộ của mình nhé!</p>
            </div>
        );
    }

    const allSkillDefinitions = Object.values(SKILL_MAP).filter((skill) => isSkillAvailableForGrade(skill, currentGrade));

    let filteredBySubject = selectedSubject === 'all'
        ? allSkillDefinitions
        : allSkillDefinitions.filter((s) => s.subjectId === selectedSubject);

    if (selectedSemester !== 'all') {
        filteredBySubject = filteredBySubject.filter((s) => s.semester === selectedSemester);
    }

    const relevantSkills = filteredBySubject;
    const totalRelevant = relevantSkills.length;

    const stats = {
        vung: relevantSkills.filter((s) => {
            const prog = progress.skills?.[s.id];
            return prog ? getMasteryLabel(prog) === 'Vững' : false;
        }).length,
        kha: relevantSkills.filter((s) => {
            const prog = progress.skills?.[s.id];
            return prog ? getMasteryLabel(prog) === 'Khá' : false;
        }).length,
        dangLen: relevantSkills.filter((s) => {
            const prog = progress.skills?.[s.id];
            return prog ? getMasteryLabel(prog) === 'Đang lên' : false;
        }).length,
        canLuyen: relevantSkills.filter((s) => {
            const prog = progress.skills?.[s.id];
            return !prog || getMasteryLabel(prog) === 'Cần luyện';
        }).length,
    };

    const rank = getOverallRank(progress);

    const allCourses = getAllCourses();
    const displayedCourses = selectedSubject !== 'all'
        ? allCourses.filter((c) => c.id === selectedSubject)
        : allCourses;

    const hasSkillsToDisplay = displayedCourses.some((course) =>
        course.topics.some((topic) =>
            topic.skills.some((skill) => {
                if (selectedSemester !== 'all' && skill.semester !== selectedSemester) return false;
                if (selectedMastery === 'all') return true;
                return getMasteryLabel(progress.skills?.[skill.id as SkillId]) === selectedMastery;
            }),
        ),
    );

    const pageTitle = selectedSubject && selectedSubject !== 'all'
        ? `Mục tiêu ${normalizeDisplayText(allCourses.find((c) => c.id === selectedSubject)?.name) || 'Học tập'} 🎯`
        : 'Tổng quan học tập 🎯';

    return (
        <div className="space-y-12 pb-10 relative">
            <div className="flex items-center justify-between gap-4 relative z-20 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-3 bg-white rounded-2xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="md:hidden">
                        <UserMenu />
                    </div>
                </div>
                <WalletButton />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{pageTitle}</h1>
                    <p className="text-lg text-slate-600 font-medium italic">Cùng xem bạn đã giỏi đến đâu rồi nhé!</p>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex flex-col md:flex-row items-center gap-4 md:gap-6 rounded-[32px] md:rounded-[40px] border-4 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm ${rank.bg} ${rank.border} text-center md:text-left`}
                >
                    <div className="relative z-10 text-6xl md:text-7xl drop-shadow-xl">{rank.icon}</div>
                    <div className="relative z-10 flex flex-col">
                        <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] ${rank.color} mb-1`}>Cấp độ hiện tại</span>
                        <span className={`text-3xl md:text-4xl font-black ${rank.color} tracking-tight`}>{normalizeDisplayText(rank.label)}</span>
                    </div>
                    <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 bg-current ${rank.color}`} />
                </motion.div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'Tất cả' },
                        { id: 'math', label: 'Toán học' },
                        { id: 'vietnamese', label: 'Tiếng Việt' },
                        { id: 'english', label: 'Tiếng Anh' },
                        { id: 'finance', label: 'Tài chính' },
                    ].map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all ${selectedSubject === subject.id
                                ? 'bg-slate-900 text-white shadow-lg scale-105'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {subject.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'Cả năm' },
                        { id: 1, label: 'Học kỳ 1' },
                        { id: 2, label: 'Học kỳ 2' },
                    ].map((sem) => (
                        <button
                            key={sem.id}
                            onClick={() => setSelectedSemester(sem.id as number | 'all')}
                            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedSemester === sem.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'
                                }`}
                        >
                            {sem.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                <StatCard
                    label="Thành thạo"
                    value={stats.vung}
                    total={totalRelevant}
                    color="bg-emerald-600 shadow-emerald-200"
                    icon={Trophy}
                    active={selectedMastery === 'Vững'}
                    onClick={() => setSelectedMastery(selectedMastery === 'Vững' ? 'all' : 'Vững')}
                />
                <StatCard
                    label="Khá giỏi"
                    value={stats.kha}
                    total={totalRelevant}
                    color="bg-blue-600 shadow-blue-200"
                    icon={Star}
                    active={selectedMastery === 'Khá'}
                    onClick={() => setSelectedMastery(selectedMastery === 'Khá' ? 'all' : 'Khá')}
                />
                <StatCard
                    label="Đang tiến bộ"
                    value={stats.dangLen}
                    total={totalRelevant}
                    color="bg-amber-600 shadow-amber-200"
                    icon={TrendingUp}
                    active={selectedMastery === 'Đang lên'}
                    onClick={() => setSelectedMastery(selectedMastery === 'Đang lên' ? 'all' : 'Đang lên')}
                />
                <StatCard
                    label="Cần luyện thêm"
                    value={stats.canLuyen}
                    total={totalRelevant}
                    color="bg-slate-600 shadow-slate-300"
                    icon={AlertCircle}
                    active={selectedMastery === 'Cần luyện'}
                    onClick={() => setSelectedMastery(selectedMastery === 'Cần luyện' ? 'all' : 'Cần luyện')}
                />
            </div>

            <div className="space-y-16">
                {displayedCourses.map((course) => {
                    const courseDef = allCourses.find((c) => c.id === course.id);
                    if (!courseDef) return null;
                    if (selectedSubject !== 'all' && course.id !== selectedSubject) return null;

                    return (
                        <div key={course.id}>
                            {courseDef.topics.map((topic) => {
                                const topicSkills = topic.skills.filter((skill) => {
                                    if (selectedSemester !== 'all' && skill.semester !== selectedSemester) return false;
                                    if (selectedMastery === 'all') return true;

                                    const label = getMasteryLabel(progress.skills?.[skill.id as SkillId]);
                                    if (selectedMastery === 'Cần luyện') {
                                        return label === 'Cần luyện';
                                    }

                                    return label === selectedMastery;
                                });

                                if (topicSkills.length === 0) return null;

                                return (
                                    <section key={topic.id} className="mb-12 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-2 bg-${course.color}-500 rounded-full`}></div>
                                            <div>
                                                <h2 className="text-2xl md:text-3xl font-black text-slate-800">{normalizeDisplayText(topic.name)}</h2>
                                                <p className="text-slate-500 font-medium text-sm">{normalizeDisplayText(course.name)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {topicSkills.map((skill, index) => {
                                                const state: MasteryState = progress.skills?.[skill.id as SkillId] || {
                                                    mastery: 0,
                                                    attempts: 0,
                                                    streak: 0,
                                                    skillId: skill.id as SkillId,
                                                    stability: 0,
                                                    lastSeen: new Date(0).toISOString(),
                                                    lastCorrect: null,
                                                    correctCount: 0,
                                                    wrongStreak: 0,
                                                    level: 1,
                                                };
                                                const label = getMasteryLabel(state);
                                                const theme =
                                                    label === 'Vững' ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-600', bar: 'bg-emerald-600' } :
                                                        label === 'Khá' ? { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-600', bar: 'bg-blue-600' } :
                                                            label === 'Đang lên' ? { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-600', bar: 'bg-amber-600' } :
                                                                { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', badge: 'bg-slate-500', bar: 'bg-slate-500' };

                                                return (
                                                    <motion.div
                                                        key={skill.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ y: -5, scale: 1.02 }}
                                                        className={`rounded-3xl md:rounded-[32px] border-2 p-6 md:p-8 shadow-sm transition-all ${theme.bg} ${theme.border}`}
                                                    >
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="flex flex-col gap-1 text-left">
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.text} opacity-60`}>{skill.id}</span>
                                                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{normalizeDisplayText(skill.name)}</h3>
                                                            </div>
                                                            <span className={`rounded-xl px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-wider shadow-md ${theme.badge}`}>
                                                                {label}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-tighter">
                                                                <span>Độ thông thạo</span>
                                                                <span>{Math.round(state.mastery * 100)}%</span>
                                                            </div>
                                                            <div className="h-4 w-full rounded-full bg-black/5 overflow-hidden shadow-inner">
                                                                <motion.div
                                                                    className={`h-full ${theme.bar}`}
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${state.mastery * 100}%` }}
                                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">
                                                                <span>Đã giải: {state.attempts} câu</span>
                                                                <span>Chuỗi đúng: {state.streak}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    );
                })}

                {!hasSkillsToDisplay && (
                    <div className="flex flex-col items-center justify-center min-h-[30vh] text-center space-y-4">
                        <div className="text-6xl">🤷‍♀️</div>
                        <h2 className="text-2xl font-black text-slate-700">Không tìm thấy kỹ năng nào</h2>
                        <p className="text-slate-500">Hãy thử thay đổi bộ lọc của bạn nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number;
    total: number;
    color: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    active: boolean;
    onClick: () => void;
}

function StatCard({ label, value, total, color, icon: Icon, active, onClick }: StatCardProps) {
    return (
        <motion.button
            whileHover={{ y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`rounded-[40px] p-8 shadow-2xl flex flex-col items-center text-center gap-2 text-white transition-all w-full ${color} ${active ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-100 scale-105 saturate-150' : 'opacity-90 hover:opacity-100'}`}
        >
            <div className="rounded-full bg-white/20 p-3 md:p-4 mb-2 shadow-inner">
                <Icon size={28} className="md:w-8 md:h-8" strokeWidth={active ? 4 : 3} />
            </div>
            <div className="text-3xl md:text-5xl font-black flex items-baseline gap-1">
                {value}
                <span className="text-lg md:text-2xl opacity-70">/{total}</span>
            </div>
            <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-100">{label}</div>
        </motion.button>
    );
}
