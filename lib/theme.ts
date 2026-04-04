import {
    Calculator, Book, Languages, PiggyBank,
    Sigma, PenTool, Globe2, Coins,
    LucideIcon
} from 'lucide-react';

export interface SubjectTheme {
    id: string;
    label: string;
    icon: LucideIcon;
    bgIcon: LucideIcon;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        gradient: string;
        shadow: string;
        border: string;
        light: string;
    };
}

export const SUBJECT_THEMES: Record<string, SubjectTheme> = {
    math: {
        id: 'math',
        label: 'Toán Học',
        icon: Calculator,
        bgIcon: Sigma,
        colors: {
            primary: 'bg-blue-600',
            secondary: 'bg-blue-100',
            accent: 'text-blue-600',
            gradient: 'from-blue-600 to-indigo-600',
            shadow: 'shadow-blue-500/30',
            border: 'border-blue-200',
            light: 'bg-blue-50'
        }
    },
    vietnamese: {
        id: 'vietnamese',
        label: 'Tiếng Việt',
        icon: Book,
        bgIcon: PenTool,
        colors: {
            primary: 'bg-orange-500',
            secondary: 'bg-orange-100',
            accent: 'text-orange-600',
            gradient: 'from-orange-500 to-amber-600',
            shadow: 'shadow-orange-500/30',
            border: 'border-orange-200',
            light: 'bg-orange-50'
        }
    },
    english: {
        id: 'english',
        label: 'Tiếng Anh',
        icon: Languages,
        bgIcon: Globe2,
        colors: {
            primary: 'bg-emerald-600',
            secondary: 'bg-emerald-100',
            accent: 'text-emerald-600',
            gradient: 'from-emerald-600 to-teal-600',
            shadow: 'shadow-emerald-500/30',
            border: 'border-emerald-200',
            light: 'bg-emerald-50'
        }
    },
    finance: {
        id: 'finance',
        label: 'Tài Chính',
        icon: PiggyBank,
        bgIcon: Coins,
        colors: {
            primary: 'bg-yellow-500',
            secondary: 'bg-yellow-100',
            accent: 'text-yellow-700',
            gradient: 'from-yellow-400 to-amber-500',
            shadow: 'shadow-yellow-500/30',
            border: 'border-yellow-200',
            light: 'bg-yellow-50'
        }
    }
};

export const DEFAULT_THEME = SUBJECT_THEMES['math'];

export const getTheme = (subjectId?: string | null) => {
    return SUBJECT_THEMES[subjectId || ''] || DEFAULT_THEME;
};
