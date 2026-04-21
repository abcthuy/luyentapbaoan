import { Question } from '../types';
import { financeStaticQuestions } from './finance';
import { mathStaticQuestions } from './math';
import { vietnameseStaticQuestions } from './vietnamese';
import { englishStaticQuestions } from './english';
import { getRuntimeContentLibrary, mergeCustomLibraryIntoQuestionBank, QuestionBank } from '../library';
import { sessionTracker } from '../session-tracker';

// Static files remain in repo as seed/history during migration.
// Runtime fallback should gradually shrink once a subject/skill set is migrated to DB.
const RETIRED_RUNTIME_STATIC_SKILLS = new Set([
    'A4',
    'B2',
    'D2',
    'E1',
]);

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

export function getRuntimeStaticQuestionBankSnapshot(): QuestionBank {
    const runtimeStaticBank = Object.fromEntries(
        Object.entries(STATIC_QUESTION_BANK).filter(([skillId]) => !RETIRED_RUNTIME_STATIC_SKILLS.has(skillId))
    ) as QuestionBank;

    return mergeCustomLibraryIntoQuestionBank(runtimeStaticBank, getRuntimeContentLibrary());
}

// ============================================================
// SESSION DEDUP TRACKER (Migrated to session-tracker.ts)

/**
 * Fisher-Yates shuffle — returns a new shuffled array
 */
function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Get a random static question for a skill and level,
 * avoiding recently served questions within the session.
 */
export function getStaticQuestion(skillId: string, level: number): Question | null {
    const combinedQuestionBank = getRuntimeStaticQuestionBankSnapshot();
    const skillQuestions = combinedQuestionBank[skillId];
    if (!skillQuestions) return null;

    const levelQuestions = skillQuestions[level];
    if (!levelQuestions || levelQuestions.length === 0) return null;

    // Shuffle and prefer a question not seen in this session or the immediately previous sessions.
    const shuffled = shuffleArray(levelQuestions);
    const fresh = shuffled.find(q => !sessionTracker.hasStatic(q.id, true));

    if (fresh) {
        sessionTracker.addStatic(fresh.id);
        return { ...fresh };
    }

    const sessionFresh = shuffled.find(q => !sessionTracker.hasStatic(q.id, false));
    if (sessionFresh) {
        sessionTracker.addStatic(sessionFresh.id);
        return { ...sessionFresh };
    }

    // All questions in this pool have been used — reset this skill's IDs and pick any
    for (const q of levelQuestions) {
        sessionTracker.deleteStatic(q.id);
    }
    const fallback = shuffled[0];
    sessionTracker.addStatic(fallback.id);
    return { ...fallback };
}
