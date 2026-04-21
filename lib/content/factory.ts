import { Question, QuestionType, SubjectId } from './types';

export class QuestionFactory {
    /**
     * Create a new question object with a unique ID and consistent structure.
     */
    static create(params: {
        subjectId: SubjectId;
        skillId: string;
        type: QuestionType;
        instruction: string;
        text: string;
        answer: string;
        options?: string[];
        hint?: string;
        explanation?: string;
        image?: string;
        audio?: string;
        imagePrompt?: string;
    }): Question {
        const {
            subjectId,
            skillId,
            type,
            instruction,
            text,
            answer,
            options,
            hint,
            explanation,
            image,
            audio,
            imagePrompt,
        } = params;

        return {
            id: `local-${subjectId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            subjectId,
            skillId,
            type,
            instruction: instruction.trim(),
            content: {
                text: text.trim(),
                options,
                image,
                audio,
                imagePrompt,
            },
            answer: answer.trim(),
            hint,
            explanation,
        };
    }

    /**
     * Create an error placeholder question when generation fails.
     */
    static createError(subjectId: SubjectId, skillId: string, message: string): Question {
        return {
            id: `err-${Date.now()}`,
            subjectId,
            skillId,
            type: 'mcq',
            instruction: subjectId === 'english' ? 'Loading...' : 'Đang tải...',
            content: { text: message },
            answer: '0',
        };
    }
}
