import { Question } from '../types';
import { financeStaticQuestions } from './finance';
import { mathStaticQuestions } from './math';
import { vietnameseStaticQuestions } from './vietnamese';
import { englishStaticQuestions } from './english';
import { getRuntimeContentLibrary, mergeCustomLibraryIntoQuestionBank, QuestionBank } from '../library';

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
// SESSION DEDUP TRACKER
// Tracks recently served question IDs to avoid duplicates
// within a learning session. Auto-resets after MAX capacity.
// ============================================================
const _recentStaticIds = new Set<string>();
const MAX_RECENT_STATIC = 100;
const _recentGlobalStaticIds = new Set<string>();
const MAX_RECENT_GLOBAL_STATIC = 240;

/** Call this to reset the tracker (e.g., new session) */
export function resetStaticQuestionTracker() {
    _recentStaticIds.clear();
}

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

    // Auto-reset if tracker is full (prevents memory leak over long sessions)
    if (_recentStaticIds.size >= MAX_RECENT_STATIC) {
        _recentStaticIds.clear();
    }
    if (_recentGlobalStaticIds.size >= MAX_RECENT_GLOBAL_STATIC) {
        _recentGlobalStaticIds.clear();
    }

    // Shuffle and prefer a question not seen in this session or the immediately previous sessions.
    const shuffled = shuffleArray(levelQuestions);
    const fresh = shuffled.find(q => !_recentStaticIds.has(q.id) && !_recentGlobalStaticIds.has(q.id));

    if (fresh) {
        _recentStaticIds.add(fresh.id);
        _recentGlobalStaticIds.add(fresh.id);
        return { ...fresh };
    }

    const sessionFresh = shuffled.find(q => !_recentStaticIds.has(q.id));
    if (sessionFresh) {
        _recentStaticIds.add(sessionFresh.id);
        _recentGlobalStaticIds.add(sessionFresh.id);
        return { ...sessionFresh };
    }

    // All questions in this pool have been used — reset this skill's IDs and pick any
    for (const q of levelQuestions) {
        _recentStaticIds.delete(q.id);
    }
    const fallback = shuffled[0];
    _recentStaticIds.add(fallback.id);
    _recentGlobalStaticIds.add(fallback.id);
    return { ...fallback };
}
