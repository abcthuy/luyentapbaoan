import { Question } from './types';
import { ValidationIssue } from './validation';

// --- Skill sets ---

const READING_SKILLS = new Set([
    'tv2-doc-hieu', 'tv2-tho', 'tv3-doc-hieu', 'tv3-nghi-luan',
]);

const EXPRESSIVE_READING_SKILLS = new Set([
    'tv2-doc-dien-cam',
]);

const VOCAB_SKILLS = new Set([
    'tv2-tu-ngu', 'tv2-cau', 'tv2-dau-cau', 'tv3-tu-tu', 'tv3-loai-cau',
]);

const WRITING_SKILLS = new Set([
    'tv2-chinh-ta', 'tv2-ke-chuyen', 'tv2-ta-nguoi',
    'tv3-viet-thu', 'tv3-bao-cao', 'tv3-sang-tao',
]);

const SPEAKING_SKILLS = new Set([
    'tv2-noi-nghe', 'tv2-thuyet-trinh', 'tv3-thao-luan', 'tv3-hung-bien',
]);

const ALL_VIETNAMESE_SKILLS = new Set([
    ...READING_SKILLS, ...EXPRESSIVE_READING_SKILLS,
    ...VOCAB_SKILLS, ...WRITING_SKILLS, ...SPEAKING_SKILLS,
]);

// --- Helpers ---

/** Detect text that looks like it has no Vietnamese diacritics (all ASCII lowercase). */
function looksUnaccented(text: string): boolean {
    if (!text || text.length < 10) return false;
    // Strip numbers, punctuation, whitespace — keep only words
    const words = text.replace(/[^a-zA-ZÀ-ỹ]/g, ' ').trim().split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 3) return false;
    // If every word is pure ASCII (no accented chars), flag it
    return words.every(w => /^[a-zA-Z]+$/.test(w));
}

/** Count Vietnamese words (rough segmentation by whitespace). */
function wordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Check if text contains a reading passage (multi-sentence or poem). */
function hasPassage(text: string): boolean {
    // A passage should have at least 2 sentences or line breaks
    const sentences = text.split(/[.!?…]\s|\\n|\n/).filter(s => s.trim().length > 5);
    return sentences.length >= 2;
}

// --- Main validator ---

export function validateVietnameseQuestion(question: Question): ValidationIssue[] {
    if (question.subjectId !== 'vietnamese' || !ALL_VIETNAMESE_SKILLS.has(question.skillId)) {
        return [];
    }

    const issues: ValidationIssue[] = [];
    const text = question.content?.text || '';
    const instruction = question.instruction || '';
    const options = question.content?.options || [];
    const allText = `${instruction} ${text} ${options.join(' ')} ${question.answer || ''}`;

    // === RULE 1: Phát hiện text không dấu (encoding bug) ===
    if (looksUnaccented(text)) {
        issues.push({
            severity: 'error',
            message: 'Tiếng Việt question text appears to have no diacritics (không dấu). This is unreadable for grade 2-3 students.',
        });
    }

    // Kiểm tra options không dấu
    for (const opt of options) {
        if (looksUnaccented(opt)) {
            issues.push({
                severity: 'error',
                message: `Option "${opt.substring(0, 30)}..." appears to have no Vietnamese diacritics.`,
            });
            break; // Chỉ báo 1 lần
        }
    }

    // === RULE 2: Đọc hiểu phải có đoạn văn ===
    if (READING_SKILLS.has(question.skillId)) {
        if (question.type === 'mcq' && !hasPassage(text)) {
            issues.push({
                severity: 'warning',
                message: `Reading comprehension question (${question.skillId}) should include a passage before the question.`,
            });
        }

        // Đoạn đọc hiểu quá ngắn (dưới 15 từ)
        const passagePart = text.split('❓')[0] || text;
        if (wordCount(passagePart) < 15) {
            issues.push({
                severity: 'warning',
                message: `Reading passage is very short (${wordCount(passagePart)} words). Consider at least 15 words for meaningful comprehension.`,
            });
        }
    }

    // === RULE 3: Đọc diễn cảm phải có nội dung đọc ===
    if (EXPRESSIVE_READING_SKILLS.has(question.skillId)) {
        if (question.type !== 'reading') {
            issues.push({
                severity: 'warning',
                message: 'Expressive reading (đọc diễn cảm) should use question type "reading", not "' + question.type + '".',
            });
        }

        if (wordCount(text) < 10) {
            issues.push({
                severity: 'warning',
                message: 'Expressive reading passage is too short. Needs at least 10 words for a meaningful reading exercise.',
            });
        }
    }

    // === RULE 4: Từ vựng - kiểm tra skill-content alignment ===
    if (question.skillId === 'tv2-dau-cau') {
        // Skill "Dấu chấm, phẩy, chấm hỏi" — nội dung phải liên quan đến dấu câu
        const punctuationKeywords = ['dấu', 'chấm', 'phẩy', 'hỏi', 'câu', 'chấm than', 'chấm hỏi', 'dấu câu'];
        const hasPunctuationContent = punctuationKeywords.some(k => allText.toLowerCase().includes(k));
        if (!hasPunctuationContent) {
            issues.push({
                severity: 'warning',
                message: 'tv2-dau-cau (Dấu câu) question does not appear to be about punctuation. Check skill-generator mapping.',
            });
        }
    }

    if (question.skillId === 'tv2-tu-ngu' || question.skillId === 'tv2-cau') {
        // Nên có instruction rõ ràng về loại bài (đồng/trái nghĩa, phân loại từ, mẫu câu)
        if (!instruction.trim()) {
            issues.push({
                severity: 'warning',
                message: `${question.skillId} should have a clear instruction describing the exercise type.`,
            });
        }
    }

    if (question.skillId === 'tv3-tu-tu') {
        // Biện pháp tu từ — nên đề cập "so sánh", "nhân hóa", "ẩn dụ"...
        const rhetoricKeywords = ['so sánh', 'nhân hóa', 'ẩn dụ', 'điệp từ', 'biện pháp', 'tu từ'];
        const hasRhetoric = rhetoricKeywords.some(k => allText.toLowerCase().includes(k));
        if (!hasRhetoric) {
            issues.push({
                severity: 'warning',
                message: 'tv3-tu-tu (Biện pháp tu từ) question should reference rhetorical devices (so sánh, nhân hóa, ẩn dụ).',
            });
        }
    }

    // === RULE 5: Viết — kiểm tra tính phù hợp ===
    if (WRITING_SKILLS.has(question.skillId)) {
        if (question.type === 'input' && !question.answer?.trim()) {
            issues.push({
                severity: 'error',
                message: 'Writing question must have a sample answer.',
            });
        }

        // Chính tả (tv2-chinh-ta) nên liên quan đến phân biệt phụ âm
        if (question.skillId === 'tv2-chinh-ta') {
            const spellingKeywords = ['tr', 'ch', 's', 'x', 'r', 'd', 'gi', 'điền', 'chính tả', 'phân biệt'];
            const hasSpellingContent = spellingKeywords.some(k => allText.toLowerCase().includes(k));
            if (!hasSpellingContent) {
                issues.push({
                    severity: 'warning',
                    message: 'tv2-chinh-ta should focus on spelling distinctions (tr/ch, s/x, r/d/gi).',
                });
            }
        }
    }

    // === RULE 6: Hùng biện & Nói — phải có hint/dàn ý ===
    if (SPEAKING_SKILLS.has(question.skillId)) {
        if (question.type !== 'speaking' && question.type !== 'reading') {
            issues.push({
                severity: 'warning',
                message: `Speaking/debate skill (${question.skillId}) should use type "speaking" or "reading", not "${question.type}".`,
            });
        }

        if (question.skillId === 'tv3-hung-bien' && !question.hint) {
            issues.push({
                severity: 'warning',
                message: 'Debate question (tv3-hung-bien) should include a hint with outline (dàn ý) to scaffold the student.',
            });
        }
    }

    // === RULE 7: Độ dài nội dung phù hợp lứa tuổi ===
    if (question.type === 'mcq' || question.type === 'input') {
        // Câu hỏi text quá dài cho trẻ lớp 2 (> 200 từ)
        const grade2Skills = new Set([
            'tv2-doc-hieu', 'tv2-tho', 'tv2-tu-ngu', 'tv2-cau', 'tv2-dau-cau',
            'tv2-chinh-ta', 'tv2-ke-chuyen', 'tv2-ta-nguoi',
        ]);

        if (grade2Skills.has(question.skillId) && wordCount(text) > 200) {
            issues.push({
                severity: 'warning',
                message: `Grade 2 question text is very long (${wordCount(text)} words). Consider keeping under 200 words for young learners.`,
            });
        }
    }

    return issues;
}
