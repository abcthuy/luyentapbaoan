"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Calculator, Languages, Book, ArrowRight, Settings,
    KeyRound, CheckCircle2, XCircle,
    ChevronDown, ChevronUp, GraduationCap, Globe2,
    PenTool, Sigma, PiggyBank, Coins, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCourses } from '@/lib/content/registry';
import { useProgress } from '@/components/progress-provider';
import { UserMenu } from '@/components/user-menu';
import { WalletButton } from '@/components/ui/wallet-button';
import { isSkillAvailableForGrade, SKILL_MAP } from '@/lib/skills';
import { StreakBanner } from '@/components/StreakBanner';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { getUnlockStatus, getUnlockMessage } from '@/lib/unlock';

export default function SubjectsPage() {
    const router = useRouter();
    const { activeProfile, updateProfileGrade, updateProfileVisibility, updateProfilePin, progress } = useProgress();

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [showPinChange, setShowPinChange] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [currentGrade, setCurrentGrade] = useState(activeProfile?.grade || 2);

    useEffect(() => {
        if (activeProfile?.grade) {
            setCurrentGrade(activeProfile.grade);
        }
    }, [activeProfile]);

    const subjects = [
        {
            id: 'math',
            icon: Calculator,
            bgIcon: Sigma,
            label: 'Toán học',
            desc: 'Khám phá thế giới số học kỳ thú.',
            color: 'bg-blue-600',
            shadow: 'shadow-blue-500/30',
            pattern: 'opacity-10 text-white text-9xl absolute -bottom-10 -right-10 rotate-12 font-mono font-black select-none pointer-events-none'
        },
        {
            id: 'vietnamese',
            icon: Book,
            bgIcon: PenTool,
            label: 'Tiếng Việt',
            desc: 'Rèn luyện ngôn ngữ và văn học.',
            color: 'bg-orange-500',
            shadow: 'shadow-orange-500/30',
            pattern: 'opacity-10 text-white text-9xl absolute -bottom-10 -right-10 -rotate-12 font-serif font-black select-none pointer-events-none'
        },
        {
            id: 'english',
            icon: Languages,
            bgIcon: Globe2,
            label: 'Tiếng Anh',
            desc: 'Kết nối toàn cầu qua ngôn ngữ.',
            color: 'bg-emerald-600',
            shadow: 'shadow-emerald-500/30',
            pattern: 'opacity-10 text-white text-9xl absolute -bottom-10 -right-10 rotate-6 font-sans font-black select-none pointer-events-none'
        },
        {
            id: 'finance',
            icon: PiggyBank,
            bgIcon: Coins,
            label: 'Tài chính',
            desc: 'Học cách quản lý tiền và chi tiêu.',
            color: 'bg-yellow-500',
            shadow: 'shadow-yellow-500/30',
            pattern: 'opacity-10 text-white text-9xl absolute -bottom-10 -right-10 -rotate-6 font-sans font-black select-none pointer-events-none'
        }
    ];

    const handleSelect = (id: string) => {
        const status = getUnlockStatus(progress, id, currentGrade);
        if (!status.unlocked) {
            const missingReqs = status.requirements.filter(r => !r.met);
            const msg = missingReqs.map(r => `${r.subjectName}: ${r.currentPercent}%/${r.requiredPercent}%`).join(', ');
            toast.error(`Chưa đủ điều kiện! ${msg}`, {
                icon: '🔒',
                style: { borderRadius: '20px', background: '#333', color: '#fff', fontWeight: 'bold' }
            });
            return;
        }
        router.push(`/today?subject=${id}`);
    };

    const handleChangePin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProfile) return;

        if (!newPin.trim()) {
            setPinMessage({ type: 'error', text: 'Vui lòng nhập mã PIN mới' });
            return;
        }

        if (newPin.length < 4) {
            setPinMessage({ type: 'error', text: 'Mã PIN phải có ít nhất 4 số' });
            return;
        }

        if (newPin !== confirmPin) {
            setPinMessage({ type: 'error', text: 'Mã PIN nhập lại không khớp' });
            return;
        }

        updateProfilePin(activeProfile.id, newPin);
        setPinMessage({ type: 'success', text: 'Đổi mã PIN thành công!' });
        setNewPin('');
        setConfirmPin('');

        setTimeout(() => {
            setPinMessage(null);
        }, 1500);
    };

    const handleRemovePin = () => {
        if (!activeProfile) return;
        if (confirm('Bạn có chắc muốn xóa mã PIN không? Hồ sơ sẽ không còn được bảo vệ.')) {
            updateProfilePin(activeProfile.id, undefined);
            setPinMessage({ type: 'success', text: 'Đã xóa mã PIN!' });
            setTimeout(() => setPinMessage(null), 1500);
        }
    };

    // Calculate Progress per Subject
    const getSubjectStats = (subjectId: string) => {
        // 1. Total skills in curriculum
        const course = getAllCourses().find(c => c.id === subjectId);
        let total = 0;
        if (course) {
            course.topics.forEach(t => total += t.skills.filter(skill => isSkillAvailableForGrade(skill, currentGrade)).length);
        }

        // 2. User progress
        let mastered = 0;
        let attempted = 0;

        if (progress && progress.skills) {
            Object.values(progress.skills).forEach(s => {
                const skillInfo = SKILL_MAP[s.skillId];
                // If skill belongs to this subject
                if (skillInfo && skillInfo.subjectId === subjectId && isSkillAvailableForGrade(skillInfo, currentGrade)) {
                    attempted++;
                    if (s.mastery >= 0.8) mastered++;
                }
            });
        }

        return { total, mastered, attempted, percent: total > 0 ? (mastered / total) * 100 : 0 };
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />
            </div>

            {/* Header: User Profile & Actions */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                {/* User Info - Glassmorphism Card */}
                <UserMenu>
                    <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl p-3 pr-6 rounded-2xl shadow-lg border border-white/50 ring-1 ring-slate-100 group hover:scale-105 transition-transform cursor-pointer select-none">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl border-2 border-white shadow-md relative overflow-hidden group-hover:rotate-6 transition-transform">
                                {activeProfile?.avatar || '👤'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm">
                                {currentGrade}
                            </div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-black text-slate-800 text-lg leading-tight tracking-tight">{activeProfile?.name}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <GraduationCap size={12} />
                                Học sinh Lớp {currentGrade}
                            </span>
                        </div>
                    </div>
                </UserMenu>

                <div className="flex items-center gap-3">
                    <WalletButton />
                    <button
                        type="button"
                        onClick={() => setShowSettings(true)}
                        className="p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-lg active:scale-95"
                        title="Cài đặt cá nhân"
                    >
                        <Settings size={22} />
                    </button>
                </div>
            </div>

            <div className="w-full max-w-[95vw] xl:max-w-7xl mt-24">
                <div className="flex flex-col lg:flex-row gap-8 px-4 w-full">
                    {/* LEFT COLUMN: Subjects */}
                    <div className="flex-1">
                        <div className="text-left mb-8 space-y-2 relative z-10">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter drop-shadow-sm">
                                Chọn môn học
                            </h1>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Hôm nay <span className="text-blue-600 font-bold">{activeProfile?.name}</span> muốn khám phá điều gì?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subjects.map((sub, index) => {
                                const Icon = sub.icon;
                                const BgIcon = sub.bgIcon;
                                const stats = getSubjectStats(sub.id);
                                const unlockInfo = getUnlockStatus(progress, sub.id, currentGrade);
                                const isLocked = !unlockInfo.unlocked;
                                const motivation = isLocked ? getUnlockMessage(unlockInfo.overallPercent) : null;

                                return (
                                    <motion.button
                                        key={sub.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                                        whileHover={!isLocked ? { scale: 1.03 } : {}}
                                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                                        onClick={() => handleSelect(sub.id)}
                                        className={`group relative h-[28rem] rounded-[48px] ${isLocked ? 'bg-slate-300 cursor-not-allowed filter grayscale-[0.8]' : sub.color} p-8 flex flex-col justify-between text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ring-4 ring-transparent ${!isLocked ? 'hover:ring-white/30' : ''}`}
                                    >
                                        {/* Decorative Background Elements */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                        <div className={`absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl ${!isLocked && 'group-hover:scale-150'} transition-transform duration-700 ease-in-out`} />
                                        <div className={`absolute -bottom-10 -right-10 text-white/5 pointer-events-none select-none transform ${!isLocked && 'group-hover:scale-110 group-hover:rotate-12'} transition-transform duration-500`}>
                                            <BgIcon size={300} strokeWidth={0.5} />
                                        </div>
                                        <div className={sub.pattern}>
                                            {sub.id === 'math' && "123"}
                                            {sub.id === 'vietnamese' && "A ă â"}
                                            {sub.id === 'english' && "Hello"}
                                            {sub.id === 'finance' && "$$$"}
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 w-full h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20 ${!isLocked && 'group-hover:scale-110'} transition-transform duration-300 relative`}>
                                                    {isLocked ? (
                                                        <Lock size={40} className="drop-shadow-md text-slate-500" />
                                                    ) : (
                                                        <Icon size={40} className="drop-shadow-md" />
                                                    )}
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider shadow-sm">
                                                    Lớp {currentGrade}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-auto text-left">
                                                <div>
                                                    <h2 className={`text-4xl font-black tracking-tight mb-2 drop-shadow-md ${!isLocked && 'group-hover:translate-x-1'} transition-transform`}>
                                                        {sub.label} {isLocked && <span className="text-xl ml-2 text-slate-500">🔒</span>}
                                                    </h2>
                                                    <p className="text-white/80 font-medium text-base leading-snug max-w-[90%]">
                                                        {isLocked ? `${motivation?.emoji} ${motivation?.text}` : sub.desc}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats & Action */}
                                            {!isLocked && (
                                                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                                    <div className="flex justify-between items-end text-sm font-bold text-white/90">
                                                        <span>Tiến độ</span>
                                                        <span>{Math.round(stats.percent)}%</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-[2px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${stats.percent}%` }}
                                                            transition={{ duration: 1.2, delay: 0.2 + (index * 0.05), ease: "circOut" }}
                                                            className="h-full bg-white shadow-sm rounded-full relative overflow-hidden"
                                                        >
                                                            <div className="absolute inset-0 bg-white/50 animate-[shimmer_2s_infinite] skew-x-12" />
                                                        </motion.div>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2 pt-2 group-hover:translate-x-1 transition-transform">
                                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Bắt đầu học</span>
                                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-current transition-colors">
                                                            <ArrowRight size={20} className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {isLocked && (
                                                <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                                                    {/* Unlock Progress Bar */}
                                                    <div>
                                                        <div className="flex justify-between text-xs font-bold text-white/80 mb-2">
                                                            <span>Tiến độ mở khóa</span>
                                                            <span>{unlockInfo.overallPercent}%</span>
                                                        </div>
                                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-1000 ${unlockInfo.overallPercent >= 80 ? 'bg-emerald-400 animate-pulse' :
                                                                        unlockInfo.overallPercent >= 50 ? 'bg-amber-400' : 'bg-white/60'
                                                                    }`}
                                                                style={{ width: `${Math.max(3, unlockInfo.overallPercent)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Per-subject requirements */}
                                                    <div className="space-y-2">
                                                        {unlockInfo.requirements.map(req => (
                                                            <div key={req.subjectId} className="flex items-center justify-between text-[11px] font-bold text-white/70 bg-white/5 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                                                                <span>{req.met ? '✅' : '⏳'} {req.subjectName}</span>
                                                                <span className={req.met ? 'text-emerald-300' : 'text-white/50'}>
                                                                    {req.currentPercent}% / {req.requiredPercent}%
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Stats */}
                    <div className="w-full lg:w-[320px] xl:w-[380px] shrink-0 space-y-6">
                        {progress && (
                            <>
                                <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 shadow-lg sticky top-24">
                                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                                        🔥 Thành tích
                                    </h3>
                                    <div className="space-y-6">
                                        <StreakBanner progress={progress} />
                                        <div className="h-px bg-slate-200" />
                                        <BadgeDisplay progress={progress} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Modal - Redesigned */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-[48px] p-8 md:p-10 w-full max-w-md shadow-2xl shadow-black/20 border-8 border-slate-50 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-6 shadow-lg shadow-blue-100 ring-4 ring-blue-50">
                                    <Settings size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Cài đặt cá nhân</h2>
                                <p className="text-slate-500 mb-8 text-center text-base font-medium max-w-xs mx-auto">
                                    Điều chỉnh trải nghiệm học tập cho <b>{activeProfile?.name}</b>.
                                </p>

                                <div className="space-y-4 w-full">
                                    {/* Grade Selection */}
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                <GraduationCap size={18} className="text-blue-500" />
                                                Lớp học
                                            </h4>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Chương trình học</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {[2, 3].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => {
                                                        if (activeProfile) {
                                                            updateProfileGrade(activeProfile.id, g);
                                                        }
                                                        setCurrentGrade(g);
                                                    }}
                                                    className={`w-12 h-12 rounded-2xl font-black text-lg transition-all shadow-sm ${currentGrade === g ? 'bg-blue-600 text-white shadow-blue-300 scale-105 ring-2 ring-blue-200 ring-offset-2' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-400'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div>
                                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Globe2 size={18} className="text-emerald-500" />
                                                Công khai
                                            </h4>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Hiện trên BXH</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (activeProfile) {
                                                    updateProfileVisibility(activeProfile.id, !activeProfile.isPublic);
                                                }
                                            }}
                                            className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${activeProfile?.isPublic !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${activeProfile?.isPublic !== false ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    {/* Collapsible PIN Section */}
                                    <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300">
                                        <button
                                            onClick={() => setShowPinChange(!showPinChange)}
                                            className={`w-full flex items-center justify-between p-5 text-slate-900 font-bold hover:bg-slate-100 transition-colors ${showPinChange ? 'bg-slate-100' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <KeyRound size={18} className="text-slate-500" />
                                                <span>Bảo mật (PIN)</span>
                                            </div>
                                            {showPinChange ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {showPinChange && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 pt-0 space-y-4 border-t border-slate-200/50 mt-2">
                                                        <form onSubmit={handleChangePin} className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 mb-1 block">Mã mới</label>
                                                                    <input
                                                                        type="password"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                        maxLength={4}
                                                                        value={newPin}
                                                                        onChange={(e) => setNewPin(e.target.value)}
                                                                        placeholder="...."
                                                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-2 py-3 text-lg font-black text-center text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 mb-1 block">Xác nhận</label>
                                                                    <input
                                                                        type="password"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                        maxLength={4}
                                                                        value={confirmPin}
                                                                        onChange={(e) => setConfirmPin(e.target.value)}
                                                                        placeholder="...."
                                                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-2 py-3 text-lg font-black text-center text-slate-900 outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {pinMessage && (
                                                                <div className={`flex items-center gap-2 text-xs font-bold ${pinMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} justify-center py-1 bg-white rounded-lg border border-slate-100 shadow-sm`}>
                                                                    {pinMessage.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                                    {pinMessage.text}
                                                                </div>
                                                            )}

                                                            <button
                                                                type="submit"
                                                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-black shadow-lg hover:bg-blue-600 transition-all active:scale-95 text-sm"
                                                            >
                                                                Cập nhật PIN
                                                            </button>
                                                            {activeProfile?.pin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleRemovePin}
                                                                    className="w-full bg-white text-rose-600 py-3 rounded-xl font-black border-2 border-rose-100 hover:bg-rose-50 transition-all active:scale-95 text-sm"
                                                                >
                                                                    Xóa PIN hiện tại
                                                                </button>
                                                            )}


                                                        </form>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowSettings(false)}
                                    className="w-full text-slate-400 font-bold py-4 hover:text-slate-600 transition-colors mt-4 text-sm uppercase tracking-widest"
                                >
                                    Đóng cài đặt
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
