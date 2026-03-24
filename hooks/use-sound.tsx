"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'click' | 'correct' | 'wrong' | 'complete' | 'levelup' | 'win' | 'buy' | 'unlock' | 'coin';

const SOUNDS: Record<SoundType, string> = {
    click: '/sounds/click.wav',
    correct: '/sounds/correct.wav',
    wrong: '/sounds/wrong.wav',
    complete: '/sounds/complete.wav',
    levelup: '/sounds/levelup.wav',
    win: '/sounds/complete.wav',
    buy: '/sounds/click.wav',
    unlock: '/sounds/levelup.wav',
    coin: '/sounds/click.wav', // Reuse click for now
};

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    play: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const stored = localStorage.getItem('math_mastery_muted');
        return stored ? JSON.parse(stored) : false;
    });
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        // Preload sounds
        Object.keys(SOUNDS).forEach((key) => {
            const audio = new Audio(SOUNDS[key as SoundType]);
            audio.volume = 0.5;
            audioRefs.current[key] = audio;
        });

        const currentAudioRefs = audioRefs.current;

        // Cleanup
        return () => {
            Object.values(currentAudioRefs).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            localStorage.setItem('math_mastery_muted', JSON.stringify(next));
            return next;
        });
    }, []);

    const play = useCallback((type: SoundType) => {
        if (isMuted) return;
        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Audio play failed", e));
        }
    }, [isMuted]);

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, play }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}

export default useSound;

