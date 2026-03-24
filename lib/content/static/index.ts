
import { Question } from '../types';
import { financeStaticQuestions } from './finance';
import { mathStaticQuestions } from './math';
import { vietnameseStaticQuestions } from './vietnamese';
import { englishStaticQuestions } from './english';
import { getRuntimeContentLibrary, mergeCustomLibraryIntoQuestionBank, QuestionBank } from '../library';

// Combine all static question exports
export const STATIC_QUESTION_BANK: Record<string, Record<number, Question[]>> = {
    ...financeStaticQuestions,
    ...mathStaticQuestions,
    ...vietnameseStaticQuestions,
    ...englishStaticQuestions,
};

export function getStaticQuestionBankSnapshot(): QuestionBank {
    return mergeCustomLibraryIntoQuestionBank(STATIC_QUESTION_BANK, getRuntimeContentLibrary());
}

/**
 * Helper to get a random static question for a skill and level
 */
export function getStaticQuestion(skillId: string, level: number): Question | null {
    const combinedQuestionBank = getStaticQuestionBankSnapshot();
    const skillQuestions = combinedQuestionBank[skillId];
    if (!skillQuestions) return null;

    const levelQuestions = skillQuestions[level];
    if (!levelQuestions || levelQuestions.length === 0) return null;

    // Pick random
    const randomIndex = Math.floor(Math.random() * levelQuestions.length);
    return { ...levelQuestions[randomIndex] };
}
