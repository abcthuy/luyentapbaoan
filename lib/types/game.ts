
import { Question } from "@/lib/content/types";

import { SoundType } from "@/hooks/use-sound";

export type GameMode = 'standard' | 'racing' | 'obstacle';

export interface Feedback {
    isCorrect: boolean;
    explain?: string;
    microLesson?: string;
}

export interface GameProps {
    question: Question;
    answer: string;
    setAnswer: (value: string) => void;
    submitAnswer: (value?: string) => void;
    feedback: Feedback | null;
    streak: number;
    lives?: number;
    evaluating: boolean;
    play: (sound: SoundType) => void;
}
