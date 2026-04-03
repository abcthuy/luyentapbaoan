import { Question } from './content/types';

function normalizeUnicode(value: string): string {
    return value.normalize('NFC').trim();
}

function normalizeText(value: string): string {
    return normalizeUnicode(value)
        .toLowerCase()
        .replace(/["'`´]/g, '')
        .replace(/[.,!?;:()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function isNumericLike(value: string): boolean {
    const compact = normalizeUnicode(value)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/đ|dong|vnd|cm2|m2|km2|cm|mm|km|kg|g|ml|l|%/g, '');

    return /^[-+]?\d[\d.,/]*$/.test(compact);
}

function normalizeNumeric(value: string): string {
    return normalizeUnicode(value)
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/,/g, '')
        .replace(/đ|dong|vnd|cm2|m2|km2|cm|mm|km|kg|g|ml|l/g, '');
}

export function isAnswerCorrect(question: Question, studentAnswer: string): boolean {
    const expectedAnswer = question.answer || '';
    const providedAnswer = studentAnswer || '';

    if (!expectedAnswer.trim() || !providedAnswer.trim()) {
        return false;
    }

    if (question.type === 'speaking' || question.type === 'reading') {
        return false;
    }

    if (isNumericLike(expectedAnswer) && isNumericLike(providedAnswer)) {
        return normalizeNumeric(providedAnswer) === normalizeNumeric(expectedAnswer);
    }

    return normalizeText(providedAnswer) === normalizeText(expectedAnswer);
}
