import { Question, SubjectId } from './types';
import { generatorRegistry } from './generator-registry';
import { getStaticQuestion } from './static/index';
import { tryQuestionApi } from './api';
import { sanitizeQuestion, validateQuestion } from './validation';
import { COURSES } from './courses/index';
import { getLocalizedString } from './i18n';
import { QuestionFactory } from './factory';
import { sessionTracker } from './session-tracker';

const GENERATOR_FIRST_SKILLS = new Set([
    'eng2-list', 'eng3-list', 'eng4-list', 'eng5-list',
    'eng2-speak', 'eng3-speak', 'eng4-speak', 'eng5-speak',
    'eng2-read', 'eng3-read', 'eng4-read', 'eng5-read',
    'eng2-write', 'eng3-write', 'eng4-write', 'eng5-write',
    'eng-story-quest', 'tv2-doc-dien-cam', 'tv2-noi-nghe',
    'tv2-thuyet-trinh', 'tv3-hung-bien', 'tv3-thao-luan',
    'tv4-noi-nghe', 'tv4-thuyet-trinh', 'tv5-noi-nghe', 'tv5-thao-luan',
    'C3', 'identify-money', 'compare-value', 'money-sum',
    'fin2-shopping', 'fin3-calc', 'shopping-math', 'need-vs-want',
    'saving-goal', 'fin2-saving', 'saving-pig', 'fin3-budget', 'job-value',
]);

const PREFERRED_LOCAL_GENERATOR_SKILLS = new Set([
    'tv2-doc-hieu', 'tv2-tho', 'tv2-tu-ngu', 'tv2-cau', 'tv2-dau-cau',
    'tv2-chinh-ta', 'tv2-ke-chuyen', 'tv2-ta-nguoi', 'tv2-noi-nghe',
    'tv2-thuyet-trinh', 'tv4-doc-hieu', 'tv4-cam-thu', 'tv4-tu-loai',
    'tv4-lien-ket-cau', 'tv4-chinh-ta', 'tv4-mieu-ta', 'tv4-noi-nghe',
    'tv4-thuyet-trinh', 'tv5-doc-hieu', 'tv5-nghi-luan', 'tv5-tu-dong-nghia',
    'tv5-lien-ket-van-ban', 'tv5-tap-lam-van', 'tv5-van-nghi-luan',
    'tv5-noi-nghe', 'tv5-thao-luan', 'eng2-list', 'eng2-speak',
    'eng2-read', 'eng2-write', 'eng-clothes', 'eng-food', 'eng-routine',
    'eng-house', 'eng-vowels', 'eng-blends', 'eng-grammar-present',
    'eng-grammar-continuous', 'eng-prepositions', 'eng4-list',
    'eng4-speak', 'eng4-read', 'eng4-write', 'eng5-list',
    'eng5-speak', 'eng5-read', 'eng5-write',
]);

// --- DEDUPLICATION STATE ---

function getQuestionFingerprint(q: Question): string {
    const text = (q.content?.text || '').slice(0, 80);
    return `${q.skillId}::${text}::${q.answer}`;
}

export function resetQuestionSessionTracker() {
    sessionTracker.resetSession();
}

function normalizeRequestedLevel(subjectId: SubjectId, skillId: string, level: number) {
    if (subjectId === 'finance' || GENERATOR_FIRST_SKILLS.has(skillId)) {
        return Math.max(1, Math.min(3, Math.round(level || 1)));
    }
    return level;
}

function finalizeQuestion(subjectId: SubjectId, skillId: string, question: Question): Question {
    const sanitized = sanitizeQuestion(question);
    
    // Find skill info for validation
    const course = COURSES[subjectId];
    let skill;
    if (course) {
        for (const topic of course.topics) {
            const found = topic.skills.find(s => s.id === skillId);
            if (found) {
                skill = { ...found, subjectId: course.id, category: topic.name };
                break;
            }
        }
    }

    const issues = validateQuestion(sanitized, { expectedSkillId: skillId, skill });
    const fatalIssues = issues.filter((issue) => issue.severity === 'error');

    if (fatalIssues.length > 0) {
        console.error(`Invalid question generated for ${skillId}:`, fatalIssues.map((issue) => issue.message));
        return QuestionFactory.createError(subjectId, skillId, getLocalizedString('questionNotReady', subjectId));
    }

    return sanitized;
}

function tryGenerator(skillId: string, level: number, maxAttempts: number = 3): Question | null {
    const generator = generatorRegistry.get(skillId);
    if (!generator) return null;

    let bestCandidate: Question | null = null;
    for (let i = 0; i < maxAttempts; i++) {
        const q = generator(skillId, level);
        const fp = getQuestionFingerprint(q);
        if (!sessionTracker.hasGenerator(fp)) {
            sessionTracker.addGenerator(fp);
            return q;
        }
        bestCandidate = q;
    }

    if (bestCandidate) {
        sessionTracker.addGenerator(getQuestionFingerprint(bestCandidate));
    }
    return bestCandidate;
}

export async function generateQuestion(subjectId: SubjectId, skillId: string, level: number = 1): Promise<Question> {
    const normalizedLevel = normalizeRequestedLevel(subjectId, skillId, level);
    const hasGenerator = generatorRegistry.has(skillId);
    const staticQ = getStaticQuestion(skillId, normalizedLevel);

    // 1. Blend: Static bank + Local Generator
    if (hasGenerator && staticQ) {
        const preferGenerator = PREFERRED_LOCAL_GENERATOR_SKILLS.has(skillId);
        if (!preferGenerator && Math.random() < 0.65) {
            return finalizeQuestion(subjectId, skillId, staticQ);
        }
        const genQ = tryGenerator(skillId, normalizedLevel);
        if (preferGenerator && genQ) {
            return finalizeQuestion(subjectId, skillId, genQ);
        }
        return finalizeQuestion(subjectId, skillId, genQ || staticQ);
    }

    // 2. Single Source
    if (hasGenerator) {
        const genQ = tryGenerator(skillId, normalizedLevel);
        if (genQ) return finalizeQuestion(subjectId, skillId, genQ);
    }
    if (staticQ) {
        return finalizeQuestion(subjectId, skillId, staticQ);
    }

    // 3. AI API Fallback
    const apiQuestion = await tryQuestionApi(subjectId, skillId, normalizedLevel);
    if (apiQuestion) {
        return finalizeQuestion(subjectId, skillId, apiQuestion);
    }

    return QuestionFactory.createError(subjectId, skillId, getLocalizedString('aiBusy', subjectId));
}
