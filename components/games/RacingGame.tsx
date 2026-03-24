
import React from 'react';
import { GameProps } from '@/lib/types/game';
import { QuestionCard } from '@/components/question-card';
import { motion } from 'framer-motion';
import { Flag, Gauge } from 'lucide-react';

export const RacingGame: React.FC<GameProps> = ({
    question,
    answer,
    setAnswer,
    submitAnswer,
    feedback,
    streak,
    evaluating,
    play
}) => {
    const progress = Math.min(streak * 10, 100);
    const speed = feedback?.isCorrect ? 200 : feedback?.isCorrect === false ? 0 : 50;

    return (
        <div className="flex flex-col gap-6 relative overflow-hidden">
            {/* RACING TRACK HUD */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                {/* Background moving effect could go here */}

                <div className="flex justify-between items-end mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-black/50 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tốc độ</div>
                            <div className="text-3xl font-black text-yellow-400 flex items-center gap-2">
                                <Gauge size={24} />
                                {speed} <span className="text-base text-slate-500">km/h</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flag className="text-emerald-500" />
                        <span className="font-black text-2xl">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* The Track UI */}
                <div className="h-4 bg-slate-800 rounded-full relative overflow-hidden border border-white/10">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 50 }}
                    />

                    {/* The Car Icon */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 text-2xl"
                        animate={{ left: `${progress}%` }}
                    >
                        🏎️
                    </motion.div>
                </div>
            </div>

            {/* Question Card Overlay */}
            <div className="relative z-10">
                <QuestionCard
                    question={question}
                    answer={answer}
                    setAnswer={setAnswer}
                    submitAnswer={submitAnswer}
                    evaluating={evaluating}
                    feedback={feedback}
                    play={play}
                />
            </div>
        </div>
    );
};
