
import { Course, Question, SubjectId } from './types';
export type { SubjectId }; // Re-export for ease of use
import { mathCourse } from './courses/math';
import { englishCourse } from './courses/english';
import { vietnameseCourse } from './courses/vietnamese';
import { financeCourse } from './courses/finance';
import { getRuntimeContentLibrary, mergeCustomLibraryIntoCourses } from './library';
import {
    generateReadingQuestion,
    generateVocabQuestion,
    generatePunctuationQuestion,
    generateWritingQuestion,
    generateSpeakingQuestion
} from './generators/vietnamese';
import {
    generateEnglishListeningQuestion,
    generateEnglishReadingQuestion,
    generateEnglishSpeakingQuestion,
    generateEnglishWritingQuestion,
    generateEnglishCoreQuestion,
} from './generators/english';
import { generateFinanceQuestion } from './generators/finance';
import {
    generateNumberStructureComparison,
    generateAdditionSubtraction,
    generateMissingNumber,
    generateMultiplicationDivision,
    generateWordProblem,
    generateWordProblem2Steps,
    generateLargeNumbers,
    generateAddSub100k,
    generateMultDivLarge,
    generateMultTable,
    generateLength,
    generateTime,
    generateGeometry,
    generatePerimeterArea,
    generateAngle,
    generateUnit,
    generateChart,
    generateSequence,
    generateNumberGrid,
    generateNumberTower,
    generateStatistics,
    generateFraction,
    generateProbability
} from './generators/math';
import { sanitizeQuestion, validateQuestion } from './validation';

export const COURSES: Record<SubjectId, Course> = {
    'math': mathCourse,
    'english': englishCourse,
    'vietnamese': vietnameseCourse,
    'finance': financeCourse
};

// Generator Registry
type GeneratorFunction = (skillId: string, level?: number) => Question;
const GENERATORS: Record<string, GeneratorFunction> = {};

export function registerGenerator(skillId: string, fn: GeneratorFunction) {
    GENERATORS[skillId] = fn;
}

export function hasRegisteredGenerator(skillId: string): boolean {
    return Boolean(GENERATORS[skillId]);
}

// --- MATH REGISTRATION ---
// Số học Lớp 2
registerGenerator('A1', generateNumberStructureComparison);
registerGenerator('A2', generateAdditionSubtraction);
registerGenerator('A3', generateMissingNumber);
registerGenerator('A4', generateMultiplicationDivision);
registerGenerator('B1', generateWordProblem);
registerGenerator('B2', generateWordProblem2Steps);

// Số học Lớp 3
['m3-so-10k', 'm4-so-lon'].forEach(id => {
    registerGenerator(id, generateLargeNumbers);
});
['m3-cong-tru-100k', 'm4-cong-tru-nhan-chia', 'm5-so-thap-phan', 'm5-ti-so-phan-tram'].forEach(id => {
    registerGenerator(id, generateAddSub100k);
});
['m3-nhan-chia-lon', 'm5-bai-toan-thuc-te'].forEach(id => {
    registerGenerator(id, generateMultDivLarge);
});
registerGenerator('m3-bang-nhan', generateMultTable);

// Hình học & Đo lường Lớp 2
registerGenerator('C1', generateLength);
registerGenerator('C2', generateTime);
registerGenerator('D1', generateGeometry);

// Hình học & Đo lường Lớp 3
['m3-chu-vi', 'm4-dien-tich-hinh', 'm5-the-tich'].forEach(id => {
    registerGenerator(id, generatePerimeterArea);
});
['m3-goc', 'm4-goc-do-thoi-gian'].forEach(id => {
    registerGenerator(id, generateAngle);
});
['m3-don-vi', 'm5-don-vi-do'].forEach(id => {
    registerGenerator(id, generateUnit);
});

// Tư duy & Logic Lớp 2
registerGenerator('D2', generateChart);
registerGenerator('E1', generateSequence);
registerGenerator('E2', generateNumberGrid);
registerGenerator('E3', generateNumberTower);

// Tư duy & Logic Lớp 3
['m3-thong-ke', 'm5-bieu-do'].forEach(id => {
    registerGenerator(id, generateStatistics);
});
['m3-phan-so', 'm4-phan-so'].forEach(id => {
    registerGenerator(id, generateFraction);
});
['m3-xac-suat', 'm4-trung-binh-cong'].forEach(id => {
    registerGenerator(id, generateProbability);
});


// --- VIETNAMESE REGISTRATION ---
// Reading
['tv2-doc-hieu', 'tv3-doc-hieu', 'tv2-tho', 'tv3-nghi-luan', 'tv4-doc-hieu', 'tv4-cam-thu', 'tv5-doc-hieu', 'tv5-nghi-luan'].forEach(id => {
    registerGenerator(id, generateReadingQuestion);
});

// Vocabulary (đồng/trái nghĩa, phân loại từ, mẫu câu)
['tv2-tu-ngu', 'tv2-cau', 'tv3-tu-tu', 'tv3-loai-cau', 'tv4-tu-loai', 'tv4-lien-ket-cau', 'tv5-tu-dong-nghia', 'tv5-lien-ket-van-ban'].forEach(id => {
    registerGenerator(id, generateVocabQuestion);
});

// Dấu câu — generator riêng (dấu chấm, phẩy, hỏi, than)
registerGenerator('tv2-dau-cau', generatePunctuationQuestion);

// Viết/Văn (bổ sung các skill còn thiếu)
['tv2-chinh-ta', 'tv3-viet-thu', 'tv3-bao-cao', 'tv4-chinh-ta', 'tv5-tap-lam-van'].forEach(id => {
    registerGenerator(id, generateWritingQuestion);
});
['tv2-ke-chuyen', 'tv2-ta-nguoi', 'tv3-sang-tao', 'tv4-mieu-ta', 'tv5-van-nghi-luan'].forEach(id => {
    registerGenerator(id, generateWritingQuestion);
});

// Đọc diễn cảm & Hùng biện
['tv2-doc-dien-cam', 'tv3-hung-bien', 'tv4-thuyet-trinh', 'tv5-thao-luan'].forEach(id => {
    registerGenerator(id, generateSpeakingQuestion);
});

// Nói/Nghe fallback
['tv2-noi-nghe', 'tv2-thuyet-trinh', 'tv3-thao-luan', 'tv4-noi-nghe', 'tv5-noi-nghe'].forEach(id => {
    registerGenerator(id, generateSpeakingQuestion);
});

// --- ENGLISH REGISTRATION ---
['eng2-list', 'eng3-list', 'eng4-list', 'eng5-list'].forEach(id => {
    registerGenerator(id, generateEnglishListeningQuestion);
});

['eng2-speak', 'eng3-speak', 'eng4-speak', 'eng5-speak'].forEach(id => {
    registerGenerator(id, generateEnglishSpeakingQuestion);
});

['eng2-read', 'eng3-read', 'eng-story-quest', 'eng4-read', 'eng5-read'].forEach(id => {
    registerGenerator(id, generateEnglishReadingQuestion);
});

['eng2-write', 'eng3-write', 'eng4-write', 'eng5-write'].forEach(id => {
    registerGenerator(id, generateEnglishWritingQuestion);
});

[
    'eng-clothes',
    'eng-food',
    'eng-routine',
    'eng-house',
    'eng-vowels',
    'eng-blends',
    'eng-grammar-present',
    'eng-grammar-continuous',
    'eng-prepositions',
].forEach(id => {
    registerGenerator(id, generateEnglishCoreQuestion);
});

// --- FINANCE REGISTRATION ---
[
    'C3',
    'identify-money',
    'compare-value',
    'money-sum',
    'fin2-shopping',
    'fin3-calc',
    'shopping-math',
    'need-vs-want',
    'saving-goal',
    'fin2-saving',
    'saving-pig',
    'fin3-budget',
    'job-value',
].forEach((id) => {
    registerGenerator(id, generateFinanceQuestion);
});

import { getStaticQuestion, resetStaticQuestionTracker } from './static/index';

const GENERATOR_FIRST_SKILLS = new Set([
    'eng2-list',
    'eng3-list',
    'eng4-list',
    'eng5-list',
    'eng2-speak',
    'eng3-speak',
    'eng4-speak',
    'eng5-speak',
    'eng2-read',
    'eng3-read',
    'eng4-read',
    'eng5-read',
    'eng2-write',
    'eng3-write',
    'eng4-write',
    'eng5-write',
    'eng-story-quest',
    'tv2-doc-dien-cam',
    'tv2-noi-nghe',
    'tv2-thuyet-trinh',
    'tv3-hung-bien',
    'tv3-thao-luan',
    'tv4-noi-nghe',
    'tv4-thuyet-trinh',
    'tv5-noi-nghe',
    'tv5-thao-luan',
    'C3',
    'identify-money',
    'compare-value',
    'money-sum',
    'fin2-shopping',
    'fin3-calc',
    'shopping-math',
    'need-vs-want',
    'saving-goal',
    'fin2-saving',
    'saving-pig',
    'fin3-budget',
    'job-value',
]);

const PREFERRED_LOCAL_GENERATOR_SKILLS = new Set([
    'tv2-doc-hieu',
    'tv2-tho',
    'tv2-tu-ngu',
    'tv2-cau',
    'tv2-dau-cau',
    'tv2-chinh-ta',
    'tv2-ke-chuyen',
    'tv2-ta-nguoi',
    'tv2-noi-nghe',
    'tv2-thuyet-trinh',
    'tv4-doc-hieu',
    'tv4-cam-thu',
    'tv4-tu-loai',
    'tv4-lien-ket-cau',
    'tv4-chinh-ta',
    'tv4-mieu-ta',
    'tv4-noi-nghe',
    'tv4-thuyet-trinh',
    'tv5-doc-hieu',
    'tv5-nghi-luan',
    'tv5-tu-dong-nghia',
    'tv5-lien-ket-van-ban',
    'tv5-tap-lam-van',
    'tv5-van-nghi-luan',
    'tv5-noi-nghe',
    'tv5-thao-luan',
    'eng2-list',
    'eng2-speak',
    'eng2-read',
    'eng2-write',
    'eng-clothes',
    'eng-food',
    'eng-routine',
    'eng-house',
    'eng-vowels',
    'eng-blends',
    'eng-grammar-present',
    'eng-grammar-continuous',
    'eng-prepositions',
    'eng4-list',
    'eng4-speak',
    'eng4-read',
    'eng4-write',
    'eng5-list',
    'eng5-speak',
    'eng5-read',
    'eng5-write',
]);

function normalizeRequestedLevel(subjectId: SubjectId, skillId: string, level: number) {
    if (subjectId === 'finance' || GENERATOR_FIRST_SKILLS.has(skillId)) {
        return Math.max(1, Math.min(3, Math.round(level || 1)));
    }

    return level;
}

function resolveQuestionApiBaseUrl() {
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
        || process.env.NEXT_PUBLIC_SITE_URL
        || process.env.VERCEL_URL;

    if (!configuredUrl) {
        return null;
    }

    return configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`;
}

/** Max time to wait for AI API before falling back to local content */
const API_TIMEOUT_MS = 4000;

async function tryQuestionApi(subjectId: SubjectId, skillId: string, level: number): Promise<Question | null> {
    const baseUrl = resolveQuestionApiBaseUrl();
    if (!baseUrl) {
        return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const res = await fetch(`${baseUrl}/api/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                skillId,
                level,
                subjectId,
                mastery: 0,
                studentName: typeof window !== 'undefined'
                    ? (JSON.parse(localStorage.getItem('math-mastery-profiles') || '{}').activeProfile?.name || 'Be')
                    : 'Be',
                studentInterest: typeof window !== 'undefined'
                    ? (JSON.parse(localStorage.getItem('math-mastery-profiles') || '{}').activeProfile?.avatar || 'hoc tap')
                    : 'hoc tap'
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('API response not ok', res.status, errData.details || errData.error);
            return null;
        }

        return await res.json();
    } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
            console.warn(`API timeout (${API_TIMEOUT_MS}ms) for ${skillId} — using local fallback`);
        } else {
            console.error(`AI Gen failed for ${skillId} via ${baseUrl}/api/question`, e);
        }
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ============================================================
// SESSION DEDUP FOR GENERATORS
// Generator pools are small (e.g., 4 reading passages for L1),
// so we track recent content to avoid short-term repeats.
// ============================================================
const _recentGeneratorFingerprints = new Set<string>();
const MAX_RECENT_GENERATOR = 60;
const _recentGlobalGeneratorFingerprints = new Set<string>();
const MAX_RECENT_GLOBAL_GENERATOR = 180;

function getQuestionFingerprint(q: Question): string {
    // Use answer + first 80 chars of text as fingerprint
    const text = (q.content?.text || '').slice(0, 80);
    return `${q.skillId}::${text}::${q.answer}`;
}

/** Reset all session-level question trackers (call when starting a new game session) */
export function resetQuestionSessionTracker() {
    _recentGeneratorFingerprints.clear();
    // Also reset static bank tracker
    resetStaticQuestionTracker();
}

export async function generateQuestion(subjectId: SubjectId, skillId: string, level: number = 1): Promise<Question> {
    const normalizedLevel = normalizeRequestedLevel(subjectId, skillId, level);
    const generator = GENERATORS[skillId];

    const finalizeQuestion = (question: Question): Question => {
        const sanitized = sanitizeQuestion(question);
        const issues = validateQuestion(sanitized, skillId);
        const fatalIssues = issues.filter((issue) => issue.severity === 'error');

        if (fatalIssues.length > 0) {
            console.error(`Invalid question generated for ${skillId}:`, fatalIssues.map((issue) => issue.message));
            return {
                id: `err-${Date.now()}`,
                subjectId,
                skillId,
                type: 'mcq',
                instruction: subjectId === 'english' ? 'Loading...' : 'Đang tải...',
                content: { text: subjectId === 'english' ? 'This question is not ready yet. Please try another one!' : 'Câu hỏi này chưa sẵn sàng. Bé thử câu khác nhé!' },
                answer: '0'
            };
        }

        return sanitized;
    };

    /** Try generator up to maxAttempts times, avoiding recent duplicates */
    const tryGenerator = (maxAttempts: number = 3): Question | null => {
        if (!generator) return null;

        // Auto-reset if tracker is full
        if (_recentGeneratorFingerprints.size >= MAX_RECENT_GENERATOR) {
            _recentGeneratorFingerprints.clear();
        }
        if (_recentGlobalGeneratorFingerprints.size >= MAX_RECENT_GLOBAL_GENERATOR) {
            _recentGlobalGeneratorFingerprints.clear();
        }

        let bestCandidate: Question | null = null;
        for (let i = 0; i < maxAttempts; i++) {
            const q = generator(skillId, normalizedLevel);
            const fp = getQuestionFingerprint(q);
            if (!_recentGeneratorFingerprints.has(fp) && !_recentGlobalGeneratorFingerprints.has(fp)) {
                _recentGeneratorFingerprints.add(fp);
                _recentGlobalGeneratorFingerprints.add(fp);
                return q;
            }
            bestCandidate = q; // Keep last attempt as fallback
        }

        for (let i = 0; i < maxAttempts; i++) {
            const q = generator(skillId, normalizedLevel);
            const fp = getQuestionFingerprint(q);
            if (!_recentGeneratorFingerprints.has(fp)) {
                _recentGeneratorFingerprints.add(fp);
                _recentGlobalGeneratorFingerprints.add(fp);
                return q;
            }
            bestCandidate = q;
        }

        // All attempts were duplicates — accept the last one anyway
        if (bestCandidate) {
            const fingerprint = getQuestionFingerprint(bestCandidate);
            _recentGeneratorFingerprints.add(fingerprint);
            _recentGlobalGeneratorFingerprints.add(fingerprint);
        }
        return bestCandidate;
    };

    // ============================================================
    // PRIORITY ORDER (optimized for instant UX + maximum variety):
    //   1. Blend: static bank (large pool) + generator (small pool)
    //      → 65% static / 35% generator for maximum diversity
    //   2. Generator-only or Static-only → instant fallback
    //   3. AI API → slow (2-5s), last resort for unknown skills
    // ============================================================

    // Step 1: Blend both sources for maximum variety (both instant)
    const staticQ = getStaticQuestion(skillId, normalizedLevel);

    if (generator !== undefined && staticQ) {
        const preferGenerator = PREFERRED_LOCAL_GENERATOR_SKILLS.has(skillId);
        // Both sources available → favor static bank for large healthy pools,
        // but prefer curated generators for grade-2 aligned skills.
        if (!preferGenerator && Math.random() < 0.65) {
            return finalizeQuestion(staticQ);
        }
        const genQ = tryGenerator(3);
        if (preferGenerator && genQ) {
            return finalizeQuestion(genQ);
        }
        return finalizeQuestion(genQ || staticQ);
    }

    // Step 2: Only one source available
    if (generator !== undefined) {
        const genQ = tryGenerator(3);
        if (genQ) return finalizeQuestion(genQ);
    }
    if (staticQ) {
        return finalizeQuestion(staticQ);
    }

    // Step 3: AI API as last resort (only for skills without any local content)
    const apiQuestion = await tryQuestionApi(subjectId, skillId, normalizedLevel);
    if (apiQuestion) {
        return finalizeQuestion(apiQuestion);
    }

    // All sources exhausted — return error placeholder
    return {
        id: `err-${Date.now()}`,
        subjectId,
        skillId,
        type: 'mcq',
        instruction: subjectId === 'english' ? 'Loading...' : 'Đang tải...',
        content: { text: subjectId === 'english' ? 'The AI system is busy or network is slow. Please try again! (AI-BUSY)' : 'Hệ thống AI đang bận hoặc mạng yếu. Bé hãy thử lại sau giây lát nhé! (Mã lỗi: AI-BUSY)' },
        answer: '0'
    };
}

export function getCourse(id: SubjectId): Course {
    return getAllCourses().find((course) => course.id === id) || COURSES[id];
}

export function getAllCourses(): Course[] {
    return mergeCustomLibraryIntoCourses(Object.values(COURSES), getRuntimeContentLibrary());
}
