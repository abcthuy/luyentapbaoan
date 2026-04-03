import { Question } from './types';
import { ValidationIssue } from './validation';

// --- Skill sets ---

const GRADE2_SKILLS = new Set([
    // Vocabulary
    'eng-colors', 'eng-animals', 'eng-family', 'eng-school',
    // Phonics
    'eng-phonics-a', 'eng-phonics-b', 'eng-phonics-c',
    // Grammar
    'eng-hello', 'eng-qa-name', 'eng-qa-this-that',
    // 4 Skills
    'eng2-list', 'eng2-speak', 'eng2-read', 'eng2-write',
]);

const GRADE3_SKILLS = new Set([
    // Vocabulary
    'eng-clothes', 'eng-food', 'eng-routine', 'eng-house',
    // Phonics
    'eng-vowels', 'eng-blends',
    // Grammar
    'eng-grammar-present', 'eng-grammar-continuous', 'eng-prepositions',
    // 4 Skills
    'eng3-list', 'eng3-speak', 'eng3-read', 'eng3-write', 'eng-story-quest',
]);

const ALL_ENGLISH_SKILLS = new Set([...GRADE2_SKILLS, ...GRADE3_SKILLS]);

const LISTENING_SKILLS = new Set(['eng2-list', 'eng3-list']);
const SPEAKING_SKILLS = new Set(['eng2-speak', 'eng3-speak']);
const READING_SKILLS = new Set(['eng2-read', 'eng3-read', 'eng-story-quest']);
const WRITING_SKILLS = new Set(['eng2-write', 'eng3-write']);

// --- Helpers ---

/** Approximate English word count. */
function englishWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Check if text is likely English (contains mostly ASCII-letter words). */
function hasEnglishContent(text: string): boolean {
    const words = text.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).filter(w => w.length >= 2);
    return words.length >= 2;
}

/** Grade 2 vocabulary should use simple, short words. */
const GRADE2_MAX_WORD_LENGTH = 12;

/** Grade 2 reading passages should be short. */
const GRADE2_MAX_PASSAGE_WORDS = 30;
const GRADE3_MAX_PASSAGE_WORDS = 60;

// --- Main validator ---

export function validateEnglishQuestion(question: Question): ValidationIssue[] {
    if (question.subjectId !== 'english' || !ALL_ENGLISH_SKILLS.has(question.skillId)) {
        return [];
    }

    const issues: ValidationIssue[] = [];
    const text = question.content?.text || '';
    const options = question.content?.options || [];
    const answer = question.answer || '';
    const instruction = question.instruction || '';

    // === RULE 1: Listening phải có audio source ===
    if (LISTENING_SKILLS.has(question.skillId)) {
        if (question.type !== 'listening') {
            issues.push({
                severity: 'warning',
                message: `Listening skill (${question.skillId}) should use question type "listening", received "${question.type}".`,
            });
        }

        if (!question.content?.audio?.trim()) {
            issues.push({
                severity: 'warning',
                message: 'Listening question should include audio content (text-to-speech source or audio URL).',
            });
        }

        // Listening text phải là tiếng Anh
        if (text && !hasEnglishContent(text)) {
            issues.push({
                severity: 'warning',
                message: 'Listening question text should be in English.',
            });
        }
    }

    // === RULE 2: Speaking/Reading aloud phải có text đọc ===
    if (SPEAKING_SKILLS.has(question.skillId)) {
        if (question.type !== 'reading') {
            issues.push({
                severity: 'warning',
                message: `Speaking/read-aloud skill (${question.skillId}) should use type "reading", received "${question.type}".`,
            });
        }

        if (englishWordCount(text) < 3) {
            issues.push({
                severity: 'warning',
                message: 'Speaking/read-aloud passage is too short. Needs at least 3 English words.',
            });
        }
    }

    // === RULE 3: Reading comprehension — phải có passage + question ===
    if (READING_SKILLS.has(question.skillId)) {
        if (question.type !== 'mcq') {
            issues.push({
                severity: 'warning',
                message: `Reading comprehension (${question.skillId}) should be MCQ type for consistent evaluation.`,
            });
        }

        // Phải có cả đoạn đọc và câu hỏi
        const hasQuestionMark = text.includes('?');
        if (!hasQuestionMark) {
            issues.push({
                severity: 'warning',
                message: 'Reading comprehension should include a question (with "?") after the passage.',
            });
        }

        // Kiểm tra có đoạn đọc không
        const hasReadingCue = /^(Read|Story|Listen|Passage)/im.test(text) || text.includes('\\n') || text.includes('\n');
        if (!hasReadingCue && englishWordCount(text) < 10) {
            issues.push({
                severity: 'warning',
                message: 'Reading comprehension question seems to lack a passage. Include a short text before the question.',
            });
        }
    }

    // === RULE 4: Writing — kiểm tra answer phù hợp ===
    if (WRITING_SKILLS.has(question.skillId)) {
        if (question.type !== 'input') {
            issues.push({
                severity: 'warning',
                message: `Writing skill (${question.skillId}) should use type "input" for free-form answers.`,
            });
        }

        if (!answer.trim()) {
            issues.push({
                severity: 'error',
                message: 'Writing question must include a sample answer for evaluation.',
            });
        }

        // Grade 2 writing answer không nên quá dài
        if (GRADE2_SKILLS.has(question.skillId) && englishWordCount(answer) > 15) {
            issues.push({
                severity: 'warning',
                message: `Grade 2 writing answer is long (${englishWordCount(answer)} words). Keep sample answers short and simple.`,
            });
        }
    }

    // === RULE 5: Độ khó phù hợp Grade 2 ===
    if (GRADE2_SKILLS.has(question.skillId)) {
        // Kiểm tra từ vựng quá khó cho Grade 2
        const allWords = `${text} ${options.join(' ')} ${answer}`.split(/\s+/).filter(w => /^[a-zA-Z]+$/.test(w));
        const hardWords = allWords.filter(w => w.length > GRADE2_MAX_WORD_LENGTH);
        if (hardWords.length > 0) {
            issues.push({
                severity: 'warning',
                message: `Grade 2 question contains complex words: "${hardWords.slice(0, 3).join('", "')}". Consider simpler vocabulary.`,
            });
        }

        // Grade 2 passage không nên quá dài
        if ((READING_SKILLS.has(question.skillId) || LISTENING_SKILLS.has(question.skillId))
            && englishWordCount(text) > GRADE2_MAX_PASSAGE_WORDS) {
            issues.push({
                severity: 'warning',
                message: `Grade 2 passage is long (${englishWordCount(text)} words). Consider keeping under ${GRADE2_MAX_PASSAGE_WORDS} words.`,
            });
        }
    }

    // === RULE 6: Độ khó Grade 3 ===
    if (GRADE3_SKILLS.has(question.skillId)) {
        if ((READING_SKILLS.has(question.skillId) || LISTENING_SKILLS.has(question.skillId))
            && englishWordCount(text) > GRADE3_MAX_PASSAGE_WORDS) {
            issues.push({
                severity: 'warning',
                message: `Grade 3 passage is long (${englishWordCount(text)} words). Consider keeping under ${GRADE3_MAX_PASSAGE_WORDS} words.`,
            });
        }
    }

    // === RULE 7: MCQ options phải là tiếng Anh (cho skills 4-kỹ năng) ===
    if (question.type === 'mcq' && (READING_SKILLS.has(question.skillId) || LISTENING_SKILLS.has(question.skillId))) {
        // Options nên có ít nhất một phần tiếng Anh
        const allOptionsEnglish = options.every(opt => /[a-zA-Z]/.test(opt));
        if (!allOptionsEnglish && options.length > 0) {
            issues.push({
                severity: 'warning',
                message: 'English MCQ options should contain English text.',
            });
        }

        // Đáp án không nên giống hệt một option khác (case-insensitive, đã xử lý bởi generic validator)
    }

    // === RULE 8: Instruction nên có hướng dẫn bằng tiếng Việt (cho trẻ hiểu) ===
    if (!instruction.trim()) {
        issues.push({
            severity: 'warning',
            message: 'English question should have an instruction (in Vietnamese) to guide the student.',
        });
    }

    // === RULE 9: Story Quest đặc biệt — phải có câu chuyện ===
    if (question.skillId === 'eng-story-quest') {
        const hasStoryLabel = /story|câu chuyện/i.test(text);
        if (!hasStoryLabel && englishWordCount(text) < 15) {
            issues.push({
                severity: 'warning',
                message: 'Story Quest question should include a short story passage before the comprehension question.',
            });
        }
    }

    return issues;
}
