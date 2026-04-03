import React, { useState, useRef, useEffect } from 'react';
import { useProgress } from '@/components/progress-provider';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Book, GraduationCap, Globe2, KeyRound, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubjectTheme } from '@/lib/theme';
import type { CSSProperties } from 'react';
import { SUPPORTED_GRADES } from '@/lib/grades';

interface UserMenuProps {
    children?: React.ReactNode;
    theme?: SubjectTheme;
}

export function UserMenu({ children, theme }: UserMenuProps) {
    const { activeProfile, updateProfileGrade, updateProfileVisibility, updateProfilePin, logout } = useProgress();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [editMode, setEditMode] = useState<'none' | 'user_pin'>('none');
    const [newPin, setNewPin] = useState('');
    const [oldPin, setOldPin] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setEditMode('none');
                setNewPin('');
                setOldPin('');
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleSavePin = () => {
        if (!activeProfile) return;

        if (editMode === 'user_pin' && activeProfile.pin && oldPin !== activeProfile.pin) {
            alert('Mã PIN cũ không chính xác!');
            return;
        }

        if (newPin.trim().length < 4) {
            alert('Mã PIN mới phải có ít nhất 4 chữ số!');
            return;
        }

        if (editMode === 'user_pin') {
            updateProfilePin(activeProfile.id, newPin);
            alert('Đã cập nhật mã PIN cá nhân!');
        }

        setEditMode('none');
        setNewPin('');
        setOldPin('');
    };

    if (!activeProfile) return null;

    const primaryColor = theme ? theme.colors.primary : 'bg-blue-600';
    const accentColor = theme ? theme.colors.accent : 'text-blue-600';

    return (
        <div className="relative z-50 inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={children ? 'focus:outline-none' : 'flex items-center gap-2 bg-white pl-2 pr-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all'}
            >
                {children ? children : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xl border border-slate-200">
                            {activeProfile.avatar}
                        </div>
                        <div className="flex flex-col items-start mr-1">
                            <span className="text-xs font-bold text-slate-700 leading-tight max-w-[80px] truncate">
                                {activeProfile.name}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 leading-tight uppercase tracking-wider">
                                Học viên
                            </span>
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-2 z-[100]"
                    >
                        {editMode === 'none' ? (
                            <div className="space-y-1">
                                <div className="px-3 py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <GraduationCap size={16} className={accentColor} />
                                        <span>Lớp</span>
                                    </div>
                                    {SUPPORTED_GRADES.map((g) => (
                                        <button
                                            key={g}
                                            onClick={() => updateProfileGrade(activeProfile.id, g)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeProfile.grade === g ? `${primaryColor} text-white shadow-md ring-2 ring-opacity-50` : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                                            style={activeProfile.grade === g ? { '--tw-ring-color': theme ? theme.colors.primary.replace('bg-', '') : '#3b82f6' } as CSSProperties : undefined}
                                        >
                                            Lớp {g}
                                        </button>
                                    ))}
                                </div>

                                <div className="px-3 py-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Globe2 size={16} className="text-emerald-500" />
                                        <span>BXH</span>
                                    </div>
                                    <button
                                        onClick={() => updateProfileVisibility(activeProfile.id, !activeProfile.isPublic)}
                                        className={`w-10 h-6 rounded-full relative transition-colors ${activeProfile.isPublic ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${activeProfile.isPublic ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setEditMode('user_pin')}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                                >
                                    <div className="flex items-center gap-2">
                                        <KeyRound size={16} className="text-amber-500" />
                                        <span className="font-bold">Mã PIN của bé</span>
                                    </div>
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-400">
                                        {activeProfile.pin ? 'Đổi mã' : 'Chưa đặt'}
                                    </span>
                                </button>

                                <div className="h-px bg-slate-100 my-1" />

                                <button
                                    onClick={() => router.push('/subjects')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors text-sm font-medium"
                                >
                                    <Book size={16} />
                                    Đổi môn học
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors text-sm font-medium"
                                >
                                    <LogOut size={16} />
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="p-2">
                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                        PIN của bé
                                    </span>
                                    <button onClick={() => setEditMode('none')} className="p-1 hover:bg-slate-100 rounded-full">
                                        <X size={14} className="text-slate-400" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {activeProfile.pin && (
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="Nhập mã PIN cũ..."
                                            value={oldPin}
                                            onChange={(e) => setOldPin(e.target.value)}
                                            className="w-full border-2 rounded-lg px-2 py-2 text-center font-bold text-sm outline-none focus:border-slate-400 border-slate-200 bg-slate-50"
                                        />
                                    )}
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder={activeProfile.pin ? 'PIN mới...' : 'Tạo PIN...'}
                                        value={newPin}
                                        onChange={(e) => setNewPin(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSavePin()}
                                        className="w-full border-2 rounded-lg px-2 py-2 text-center font-black text-lg outline-none placeholder:text-sm placeholder:font-normal focus:border-blue-500 border-slate-200"
                                    />
                                    <button
                                        onClick={handleSavePin}
                                        className={`w-full ${primaryColor} text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all`}
                                    >
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
