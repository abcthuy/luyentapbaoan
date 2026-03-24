
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
    generateWritingQuestion,
    generateSpeakingQuestion
} from './generators/vietnamese';
import {
    generateEnglishListeningQuestion,
    generateEnglishReadingQuestion,
    generateEnglishSpeakingQuestion,
    generateEnglishWritingQuestion,
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

// --- MATH REGISTRATION ---
// Số học Lớp 2
registerGenerator('A1', generateNumberStructureComparison);
registerGenerator('A2', generateAdditionSubtraction);
registerGenerator('A3', generateMissingNumber);
registerGenerator('A4', generateMultiplicationDivision);
registerGenerator('B1', generateWordProblem);
registerGenerator('B2', generateWordProblem2Steps);

// Số học Lớp 3
registerGenerator('m3-so-10k', generateLargeNumbers);
registerGenerator('m3-cong-tru-100k', generateAddSub100k);
registerGenerator('m3-nhan-chia-lon', generateMultDivLarge);
registerGenerator('m3-bang-nhan', generateMultTable);

// Hình học & Đo lường Lớp 2
registerGenerator('C1', generateLength);
registerGenerator('C2', generateTime);
registerGenerator('D1', generateGeometry);

// Hình học & Đo lường Lớp 3
registerGenerator('m3-chu-vi', generatePerimeterArea);
registerGenerator('m3-goc', generateAngle);
registerGenerator('m3-don-vi', generateUnit);

// Tư duy & Logic Lớp 2
registerGenerator('D2', generateChart);
registerGenerator('E1', generateSequence);
registerGenerator('E2', generateNumberGrid);
registerGenerator('E3', generateNumberTower);

// Tư duy & Logic Lớp 3
registerGenerator('m3-thong-ke', generateStatistics);
registerGenerator('m3-phan-so', generateFraction);
registerGenerator('m3-xac-suat', generateProbability);


// --- VIETNAMESE REGISTRATION ---
// Reading
['tv2-doc-hieu', 'tv3-doc-hieu', 'tv2-tho', 'tv3-nghi-luan'].forEach(id => {
    registerGenerator(id, generateReadingQuestion);
});

// Vocabulary
['tv2-tu-ngu', 'tv2-cau', 'tv3-tu-tu', 'tv3-loai-cau', 'tv2-dau-cau'].forEach(id => {
    registerGenerator(id, generateVocabQuestion);
});

// Viết/Văn (bổ sung các skill còn thiếu)
['tv2-chinh-ta', 'tv3-viet-thu', 'tv3-bao-cao'].forEach(id => {
    registerGenerator(id, generateWritingQuestion);
});
['tv2-ke-chuyen', 'tv2-ta-nguoi', 'tv3-sang-tao'].forEach(id => {
    registerGenerator(id, generateWritingQuestion);
});

// Đọc diễn cảm & Hùng biện
['tv2-doc-dien-cam', 'tv3-hung-bien'].forEach(id => {
    registerGenerator(id, generateSpeakingQuestion);
});

// Nói/Nghe fallback
['tv2-noi-nghe', 'tv2-thuyet-trinh', 'tv3-thao-luan'].forEach(id => {
    registerGenerator(id, generateSpeakingQuestion);
});

// --- ENGLISH REGISTRATION ---
['eng2-list', 'eng3-list'].forEach(id => {
    registerGenerator(id, generateEnglishListeningQuestion);
});

['eng2-speak', 'eng3-speak'].forEach(id => {
    registerGenerator(id, generateEnglishSpeakingQuestion);
});

['eng2-read', 'eng3-read', 'eng-story-quest'].forEach(id => {
    registerGenerator(id, generateEnglishReadingQuestion);
});

['eng2-write', 'eng3-write'].forEach(id => {
    registerGenerator(id, generateEnglishWritingQuestion);
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

import { getStaticQuestion } from './static';

const GENERATOR_FIRST_SKILLS = new Set([
    'eng2-list',
    'eng3-list',
    'eng2-speak',
    'eng3-speak',
    'eng2-read',
    'eng3-read',
    'eng2-write',
    'eng3-write',
    'eng-story-quest',
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

function normalizeRequestedLevel(subjectId: SubjectId, skillId: string, level: number) {
    if (subjectId === 'finance' || GENERATOR_FIRST_SKILLS.has(skillId)) {
        return Math.max(1, Math.min(3, Math.round(level || 1)));
    }

    return level;
}

export async function generateQuestion(subjectId: SubjectId, skillId: string, level: number = 1): Promise<Question> {
    const normalizedLevel = normalizeRequestedLevel(subjectId, skillId, level);
    const generator = GENERATORS[skillId];

    if (generator && (subjectId === 'finance' || GENERATOR_FIRST_SKILLS.has(skillId))) {
        return generator(skillId, normalizedLevel);
    }

    // 1. Try to get from Static Question Bank first (Hybrid Mechanism)
    const staticQ = getStaticQuestion(skillId, normalizedLevel);
    if (staticQ) {
        return staticQ;
    }

    // 2. Fallback to Local Generators
    if (generator) {
        return generator(skillId, normalizedLevel);
    }

    // Universal AI Generator
    try {
        // Fetch from server API to avoid exposing keys and fix client-side errors
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${baseUrl}/api/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                skillId,
                level: normalizedLevel,
                subjectId,
                // These will be processed by the API
                mastery: 0,
                studentName: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('math-mastery-profiles') || '{}').activeProfile?.name || 'Bé') : 'Bé',
                studentInterest: typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('math-mastery-profiles') || '{}').activeProfile?.avatar || 'học tập') : 'học tập'
            })
        });

        if (res.ok) {
            return await res.json();
        }
        const errData = await res.json();
        console.error("API response not ok", res.status, errData.details || errData.error);
    } catch (e) {
        console.error("AI Gen failed", e);
    }

    // Ultimate Fallback
    return {
        id: `err-${Date.now()}`,
        subjectId,
        skillId,
        type: 'mcq',
        instruction: 'Đang tải...',
        content: { text: 'Hệ thống AI đang bận hoặc mạng yếu. Bé hãy thử lại sau giây lát nhé! (Mã lỗi: AI-BUSY)' },
        answer: '0'
    };
}


export function getCourse(id: SubjectId): Course {
    return getAllCourses().find((course) => course.id === id) || COURSES[id];
}

export function getAllCourses(): Course[] {
    return mergeCustomLibraryIntoCourses(Object.values(COURSES), getRuntimeContentLibrary());
}
