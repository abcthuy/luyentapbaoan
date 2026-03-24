"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/progress-provider';
import { getOverallRank } from '@/lib/mastery';
import {
  Trophy,
  Star,
  Zap,
  ArrowRight,
  Settings,
  Brain,
  BookOpen,
  LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LoginScreen } from '@/components/auth/login-screen';

// Constants: avoid magic numbers scattered through the code
const DAILY_QUESTION_QUOTA = 30;
const INITIAL_BEST_TIME = 999999;
const PROVINCIAL_SCORE_THRESHOLD = 3000;
const PROVINCIAL_ATTEMPTS_THRESHOLD = 600;

export default function DashboardPage() {
  const { progress, activeProfile } = useProgress();
  const router = useRouter();

  // ALL hooks must be called before any conditional returns (Rules of Hooks)
  const currentGrade = activeProfile?.grade || 2;
  const today = new Date().toISOString().split('T')[0];
  const todayCount = progress && progress.lastSessionDate === today ? (progress.lastSessionCount || 0) : 0;
  const isTaskDone = todayCount >= DAILY_QUESTION_QUOTA;

  // Memoized computed values for performance
  const { rank, totalScore, totalAttempts, avgMastery } = useMemo(() => {
    if (!progress) return { rank: getOverallRank(undefined), totalScore: 0, totalAttempts: 0, avgMastery: 0 };
    const skillsList = progress.skills ? Object.values(progress.skills) : [];
    return {
      rank: getOverallRank(progress),
      totalScore: progress.totalScore || 0,
      totalAttempts: skillsList.reduce((acc, s) => acc + s.attempts, 0),
      avgMastery: skillsList.length > 0 ? skillsList.reduce((acc, s) => acc + s.mastery, 0) / skillsList.length : 0
    };
  }, [progress]);

  // Early returns AFTER all hooks
  if (!progress) return <div className="min-h-screen flex items-center justify-center bg-blue-50"><div className="animate-spin text-blue-600">Đang tải dữ liệu...</div></div>;

  if (!activeProfile) {
    return <LoginScreen />;
  }

  // Simplified derivation for UI:
  const isProvincial = totalScore > PROVINCIAL_SCORE_THRESHOLD || totalAttempts > PROVINCIAL_ATTEMPTS_THRESHOLD;

  const currentStage = isProvincial ? 'Cấp Tỉnh/Huyện' : 'Cấp Trường';
  const stageColor = isProvincial ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <div className="space-y-10 pb-10">
      {/* Header / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="flex flex-col gap-2 group cursor-pointer">
          <div className={`w-fit px-4 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-widest mb-1 ${stageColor} group-hover:bg-white group-hover:border-purple-300 transition-colors`}>
            Giai đoạn: {currentStage} • Lớp {currentGrade}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 group-hover:text-blue-600 transition-colors">
            {activeProfile?.avatar && <span className="text-4xl md:text-5xl">{activeProfile.avatar}</span>}
            <span>Chào {activeProfile?.name || 'bạn nhỏ'}! 👋</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 font-medium group-hover:text-slate-800">Hôm nay con muốn chinh phục thử thách nào?</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Settings Button */}
          <button
            onClick={() => router.push('/subjects')}
            className="p-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
          >
            <Settings size={24} />
          </button>

          {progress.bestTimeSeconds < INITIAL_BEST_TIME && (
            <div className="bg-emerald-50 border-2 border-emerald-100 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-sm text-emerald-700 hidden md:flex">
              <Zap size={20} fill="currentColor" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60">Kỷ lục thời gian</span>
                <span className="text-xl font-black">
                  {Math.floor(progress.bestTimeSeconds / 60)}:{String(progress.bestTimeSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Super Hero Card */}
        <div
          className="lg:col-span-8 relative overflow-hidden rounded-[40px] md:rounded-[56px] bg-slate-900 shadow-2xl shadow-blue-900/20 group h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 opacity-90" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700" />

          <Link href="/leaderboard" className="absolute top-6 right-6 z-20">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-blue-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" />
              Bảng Xếp Hạng
            </button>
          </Link>

          <div className="relative z-10 p-8 md:p-14 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-3 bg-white/10 w-fit px-5 py-2 rounded-full mb-8 backdrop-blur-xl border border-white/20">
                <div className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTaskDone ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isTaskDone ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-50">
                  {isTaskDone ? 'NHIỆM VỤ HOÀN THÀNH' : `TIẾN ĐỘ: ${todayCount}/${DAILY_QUESTION_QUOTA} CÂU`}
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white tracking-tight">
                {isTaskDone ? 'Tuyệt đỉnh Công phu!' : 'Đấu Trường Trí Tuệ'}
              </h2>
              <p className="text-blue-100/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed mb-10">
                {isTaskDone
                  ? 'Bạn đã hoàn thành thử thách hôm nay một cách xuất sắc. Hãy tiếp tục duy trì phong độ này nhé!'
                  : '30 câu đố thử thách đang chờ đón bạn. Hãy thể hiện tài năng và sự thông minh của mình ngay nào!'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4">
              <Link href="/today" className="flex-1">
                <button className="w-full h-full flex items-center justify-center gap-2 md:gap-4 bg-white text-slate-900 px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:bg-blue-50 transition-all hover:-translate-y-1 active:scale-95 group">
                  <span className="truncate">VÀO ĐẤU TRƯỜNG</span>
                  <ArrowRight className="group-hover:translate-x-2 transition-transform shrink-0" strokeWidth={3} />
                </button>
              </Link>

              <Link href="/subjects" className="flex-1">
                <button className="w-full h-full flex items-center justify-center gap-2 md:gap-4 bg-white/10 text-white backdrop-blur-md border-2 border-white/20 px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-base md:text-lg hover:bg-white/20 transition-all hover:-translate-y-1 active:scale-95">
                  <BookOpen size={20} className="md:w-6 md:h-6 shrink-0" />
                  <span className="truncate">KHO BÀI HỌC</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Icon Overlay */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
            <Brain size={400} strokeWidth={1} />
          </div>
        </div>

        {/* Level & Achievement Widget */}
        <div
          className={`lg:col-span-4 flex flex-col items-center justify-center text-center p-10 rounded-[40px] md:rounded-[56px] border-[6px] shadow-2xl relative overflow-hidden h-full ${rank.bg} ${rank.border} animate-in fade-in slide-in-from-right-4 duration-700 delay-150 fill-mode-backwards`}
        >
          {/* Badge Background Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/40 blur-3xl opacity-50" />

          <div className="relative z-10 flex flex-col items-center">
            <div
              className="text-8xl md:text-9xl mb-8 drop-shadow-[0_25px_30px_rgba(0,0,0,0.2)] filter grayscale-[0.2] hover:grayscale-0 transition-all duration-300 hover:rotate-6 hover:scale-110"
            >
              {rank.icon}
            </div>

            <div className={`inline-block px-4 py-1.5 rounded-full ${rank.color} bg-white/50 backdrop-blur-sm border border-current/20 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4`}>
              Xếp Hạng
            </div>

            <h3 className={`text-3xl md:text-4xl font-black ${rank.color} mb-8 tracking-tighter uppercase`}>
              {rank.label}
            </h3>

            <div className="w-full max-w-[200px] space-y-3">
              <div className="h-4 bg-white/60 rounded-full p-1 border border-white/80 shadow-inner overflow-hidden">
                <div
                  style={{ width: `${avgMastery * 100}%` }}
                  className={`h-full rounded-full bg-gradient-to-r from-current to-white/40 shadow-lg ${rank.color} transition-all duration-1000 ease-out`}
                />
              </div>
              <div className={`text-[11px] font-black uppercase tracking-widest ${rank.color} flex justify-between px-1`}>
                <span>Tiến độ</span>
                <span>{Math.round(avgMastery * 100)}%</span>
              </div>
            </div>

            <div className={`mt-10 pt-8 border-t-2 border-current/10 w-full flex flex-col gap-2`}>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-60 ${rank.color}`}>Hạng tiếp theo:</span>
              <span className={`text-sm font-black ${rank.color}`}>QUÁN QUÂN 👑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatBox icon={Zap} label="Chuỗi ngày" value={progress.overallStreak} color="text-orange-500" bg="bg-orange-50" />
        <StatBox icon={Star} label="Tổng điểm" value={progress.totalScore || 0} color="text-yellow-500" bg="bg-yellow-50" />
        <StatBox icon={BookOpen} label="Học phần" value={Object.values(progress.skills).filter(s => s.attempts > 0).length} color="text-purple-500" bg="bg-purple-50" />
        <StatBox icon={Trophy} label="Thành thạo" value={Object.values(progress.skills).filter(s => s.mastery >= 0.85).length} color="text-emerald-500" bg="bg-emerald-50" />
      </div>
    </div>
  );
}

interface StatBoxProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function StatBox({ icon: Icon, label, value, color, bg }: StatBoxProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 md:p-10 rounded-[32px] md:rounded-[40px] border-2 border-slate-50 ${bg} shadow-sm group hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={`${color} mb-3 md:mb-4 relative z-10`}>
        <Icon size={28} className="md:w-10 md:h-10 text-current" strokeWidth={2.5} />
      </div>
      <div className="text-2xl md:text-4xl font-black text-slate-900 mb-1 md:mb-1.5 relative z-10 tracking-tight">{value}</div>
      <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center relative z-10">{label}</div>
    </div>
  );
}
