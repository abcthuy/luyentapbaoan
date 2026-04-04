"use client";

import React from 'react';
import Link from 'next/link';
import {
    Home,
    BarChart2,
    LayoutList,
    Map as MapIcon,
    Mic,
    Users,
    Globe2,
    Volume2,
    VolumeX,
    Sun,
    Moon,
    Settings,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useProgress } from '@/components/progress-provider';
import { useSound } from '@/hooks/use-sound';
import { useTheme } from '@/hooks/use-theme';
import { UserMenu } from '@/components/user-menu';
import { getTheme } from '@/lib/theme';
import { SKILL_MAP } from '@/lib/skills';
import { normalizeDisplayText } from '@/lib/text';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function SoundToggle() {
    const { isMuted, toggleMute } = useSound();

    return (
        <button
            onClick={toggleMute}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900 transition-all active:scale-95"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
    );
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-yellow-400 hover:border-amber-200 dark:hover:border-yellow-900 transition-all active:scale-95"
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}

const t = normalizeDisplayText;

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeProfile, refreshData, isInitialized } = useProgress();

    const lastRefreshRef = React.useRef<number>(0);
    const REFRESH_DEBOUNCE_MS = 30_000;

    React.useEffect(() => {
        if (!isInitialized) return;

        const now = Date.now();
        if (now - lastRefreshRef.current > REFRESH_DEBOUNCE_MS) {
            lastRefreshRef.current = now;
            refreshData();
        }

        if (pathname === '/login' && activeProfile) {
            router.push('/');
            return;
        }

        const isAuthOrAdminOrParentRoutes =
            pathname.startsWith('/login') ||
            pathname === '/profiles' ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/parent');

        if (!activeProfile && !isAuthOrAdminOrParentRoutes) {
            router.push('/profiles');
        }
    }, [activeProfile, isInitialized, pathname, refreshData, router]);

    const getSubjectContext = () => {
        const searchParamValue =
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('subject')
                : searchParams.get('subject');
        const subjectParam = searchParamValue || searchParams.get('subject');

        if (pathname.startsWith('/math')) return { id: 'math', label: 'Toán học' };
        if (pathname.startsWith('/vietnamese')) return { id: 'vietnamese', label: 'Tiếng Việt' };
        if (pathname.startsWith('/english')) return { id: 'english', label: 'Tiếng Anh' };
        if (pathname.startsWith('/finance')) return { id: 'finance', label: 'Tài chính' };

        if (subjectParam === 'math') return { id: 'math', label: 'Toán học' };
        if (subjectParam === 'vietnamese') return { id: 'vietnamese', label: 'Tiếng Việt' };
        if (subjectParam === 'english') return { id: 'english', label: 'Tiếng Anh' };
        if (subjectParam === 'finance') return { id: 'finance', label: 'Tài chính' };

        if (pathname.startsWith('/practice/')) {
            const skillId = pathname.split('/practice/')[1];
            if (skillId) {
                const skill = SKILL_MAP[skillId];
                if (skill?.subjectId === 'math') return { id: 'math', label: 'Toán học' };
                if (skill?.subjectId === 'vietnamese') return { id: 'vietnamese', label: 'Tiếng Việt' };
                if (skill?.subjectId === 'english') return { id: 'english', label: 'Tiếng Anh' };
                if (skill?.subjectId === 'finance') return { id: 'finance', label: 'Tài chính' };
            }
        }

        return null;
    };

    const ctx = getSubjectContext();
    const theme = getTheme(ctx?.id);

    const navItems = ctx
        ? [
              { href: `/today?subject=${ctx.id}`, icon: LayoutList, label: 'Đấu trường' },
              { href: `/${ctx.id}`, icon: MapIcon, label: 'Luyện tập' },
              { href: `/report?subject=${ctx.id}`, icon: BarChart2, label: 'Mục tiêu' },
              ...(ctx.id === 'vietnamese'
                  ? [
                        { href: '/practice/tv2-doc-dien-cam', icon: Mic, label: 'Đọc diễn cảm' },
                        { href: '/practice/tv3-hung-bien', icon: Users, label: 'Góc hùng biện' },
                    ]
                  : []),
              ...(ctx.id === 'english'
                  ? [
                        { href: '/practice/eng3-speak', icon: Mic, label: 'Luyện phát âm' },
                        { href: '/practice/eng-story-quest', icon: Globe2, label: 'Story Quest' },
                    ]
                  : []),
          ]
        : pathname.startsWith('/wallet')
          ? [{ href: '/wallet', icon: Home, label: 'Ví của bé' }]
          : [
                { href: '/subjects', icon: Home, label: 'Sảnh chính' },
                { href: '/today', icon: LayoutList, label: 'Thử thách chung' },
                { href: '/', icon: BarChart2, label: 'Tổng quan' },
            ];

    const shouldHideSidebar = pathname
        ? pathname.startsWith('/login') ||
          pathname === '/profiles' ||
          pathname === '/subjects' ||
          pathname.startsWith('/admin') ||
          pathname.startsWith('/parent')
        : false;

    const activeBg = ctx ? theme.colors.primary : 'bg-blue-600';
    const activeText = ctx ? theme.colors.accent : 'text-blue-600';
    const activeShadow = ctx ? theme.colors.shadow : 'shadow-blue-200';
    const hoverBg = ctx ? theme.colors.light : 'hover:bg-slate-50';

    return (
        <div
            className={cn(
                'min-h-screen bg-slate-50 flex flex-col transition-all',
                !shouldHideSidebar && 'pb-24 md:pb-0 md:pl-64'
            )}
        >
            {!shouldHideSidebar && (
                <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white md:flex flex-col shadow-xl z-20">
                    <div className="flex-1 overflow-y-auto px-6 py-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="mb-8">
                            <UserMenu theme={theme}>
                                <div className="flex items-center gap-3 p-4 rounded-[32px] bg-slate-50 border-2 border-slate-100 hover:border-blue-200 transition-all group w-full cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border-2 border-white group-hover:scale-110 transition-transform">
                                        {activeProfile?.avatar || (activeProfile ? '🧒' : '?')}
                                    </div>
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Đang học
                                        </span>
                                        <span className="text-sm font-black text-slate-700 truncate max-w-[120px]">
                                            {activeProfile?.name || 'Chưa chọn'}
                                        </span>
                                    </div>
                                </div>
                            </UserMenu>
                        </div>

                        {(() => {
                            const isWallet = pathname.startsWith('/wallet');
                            const branding = isWallet
                                ? {
                                      title: 'TIỀN',
                                      slogan: 'Không dễ kiếm nên phải xài tiết kiệm nhé!',
                                      gradient: 'bg-gradient-to-br from-yellow-100 via-orange-100 to-amber-200',
                                      shadow: 'shadow-yellow-100/50',
                                      textColor: 'text-amber-900',
                                  }
                                : ctx
                                  ? {
                                        title: ctx.label,
                                        slogan:
                                            ctx.id === 'vietnamese'
                                                ? 'Giữ gìn sự trong sáng'
                                                : ctx.id === 'english'
                                                  ? 'Chinh phục ngoại ngữ'
                                                  : ctx.id === 'finance'
                                                    ? 'Quản lý tiền thông minh'
                                                    : 'Đánh thức tiềm năng',
                                        gradient: `bg-gradient-to-br ${theme.colors.gradient}`,
                                        shadow: theme.colors.shadow,
                                        textColor: 'text-white',
                                    }
                                  : {
                                        title: 'SuperKids',
                                        slogan: 'Học giỏi toàn diện',
                                        gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
                                        shadow: 'shadow-indigo-200',
                                        textColor: 'text-white',
                                    };

                            return (
                                <div
                                    className={`mb-10 px-6 py-10 ${branding.gradient} rounded-[32px] ${branding.textColor} shadow-lg ${branding.shadow}`}
                                >
                                    <h1 className="text-2xl font-black tracking-tight leading-tight">
                                        {branding.title}
                                    </h1>
                                    <p className={`text-[10px] ${isWallet ? 'opacity-80' : 'opacity-90'} font-black uppercase tracking-widest mt-1`}>
                                        {branding.slogan}
                                    </p>
                                </div>
                            );
                        })()}

                        <nav className="space-y-4 pb-6">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const baseHref = item.href.split('?')[0];
                                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(baseHref);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-black transition-all group',
                                            isActive
                                                ? `${activeBg} text-white shadow-lg ${activeShadow} scale-[1.05]`
                                                : `text-slate-600 ${hoverBg} ${activeText.replace('text-', 'hover:text-')}`
                                        )}
                                    >
                                        <Icon
                                            size={24}
                                            strokeWidth={isActive ? 3 : 2}
                                            className={cn('transition-transform group-hover:scale-110')}
                                        />
                                        {t(item.label)}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6 pt-0 space-y-4 bg-white">
                        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">
                                    Cần giúp gì?
                                </p>
                                <p className="text-xs font-bold text-amber-800">
                                    Cứ học đi, gia sư AI sẽ luôn ở bên bạn!
                                </p>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-200 rounded-full opacity-50 blur-xl" />
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex gap-2">
                                <SoundToggle />
                                <ThemeToggle />
                            </div>
                            <button className="p-3 text-slate-300 hover:text-slate-500 transition-colors">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            <main className={cn('flex-1 w-full', !shouldHideSidebar && 'p-6 md:p-12 max-w-5xl mx-auto')}>
                {children}
            </main>

            {!shouldHideSidebar && (
                <nav className="fixed bottom-4 left-4 right-4 flex h-20 items-center justify-around rounded-[28px] border-4 border-white bg-white/80 backdrop-blur-xl shadow-2xl md:hidden z-50">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1.5 px-6 py-2 rounded-2xl transition-all',
                                    isActive ? `${activeBg} text-white scale-110 shadow-lg ${activeShadow}` : 'text-slate-600'
                                )}
                            >
                                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {t(item.label)}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
