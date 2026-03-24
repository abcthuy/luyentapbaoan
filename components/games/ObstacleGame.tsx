
import React from 'react';
import { GameProps } from '@/lib/types/game';
import { QuestionCard } from '@/components/question-card';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const ObstacleGame: React.FC<GameProps> = ({
    question,
    answer,
    setAnswer,
    submitAnswer,
    feedback,
    evaluating,
    play
}) => {
    const characterState: 'run' | 'jump' | 'hit' =
        feedback?.isCorrect === false ? 'hit' : feedback?.isCorrect ? 'jump' : 'run';

    return (
        <div className="flex flex-col gap-6">
            {/* GAME VIEWPORT */}
            <div className="h-64 bg-sky-300 rounded-3xl relative overflow-hidden border-4 border-sky-400 shadow-xl group">
                {/* Clouds */}
                <div className="absolute top-10 left-10 text-6xl opacity-80 animate-pulse">☁️</div>
                <div className="absolute top-5 right-20 text-4xl opacity-60">☁️</div>

                {/* Ground */}
                <div className="absolute bottom-0 w-full h-8 bg-green-500 border-t-4 border-green-600"></div>

                {/* Character */}
                <motion.div
                    className="absolute bottom-8 left-10 text-6xl"
                    animate={characterState === 'jump' ? { y: -100, rotate: 360 } : { y: 0, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                >
                    {characterState === 'hit' ? '😵' : '🏃'}
                </motion.div>

                {/* Obstacle (The Question Concept) */}
                <motion.div
                    className="absolute bottom-8 right-10 text-6xl"
                    initial={{ x: 100 }}
                    animate={{ x: 0 }}
                >
                    🧱
                </motion.div>

                {/* Score / Lives */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {[1, 2, 3].map(i => (
                        <Heart key={i} className="text-rose-500 fill-rose-500" />
                    ))}
                </div>
            </div>

            {/* CONTROLS (Question) */}
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
    );
};
