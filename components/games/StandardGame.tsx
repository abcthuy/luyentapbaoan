
import React from 'react';
import { GameProps } from '@/lib/types/game';
import { QuestionCard } from '@/components/question-card';


export const StandardGame: React.FC<GameProps> = ({
    question,
    answer,
    setAnswer,
    submitAnswer,
    feedback,
    evaluating,
    play
}) => {
    return (
        <div className="flex flex-col gap-6">


            {/* Main Card */}
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
