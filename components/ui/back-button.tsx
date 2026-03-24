import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SubjectTheme } from '@/lib/theme';

interface BackButtonProps {
    href?: string;
    onClick?: () => void;
    className?: string;
    theme?: SubjectTheme;
}

export function BackButton({ href, onClick, className = '', theme }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    const hoverClass = theme
        ? theme.colors.accent.replace('text-', 'hover:text-')
        : 'hover:text-slate-900';

    const borderClass = theme
        ? theme.colors.border.replace('border-', 'hover:border-')
        : 'hover:border-slate-300';

    return (
        <button
            onClick={handleClick}
            className={`p-3 bg-white rounded-2xl text-slate-600 ${hoverClass} transition-all duration-200 ease-out border border-slate-200 shadow-sm hover:shadow-md ${borderClass} flex items-center justify-center hover:-translate-x-1 hover:scale-105 active:scale-95 ${className}`}
            title="Quay lại"
        >
            <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
    );
}
