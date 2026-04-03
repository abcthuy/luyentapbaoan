import { Question } from './types';
import { validateMathGrade2Question } from './math-grade2-rules';
import { validateFinanceGrade2Question } from './finance-grade2-rules';
import { validateVietnameseQuestion } from './vietnamese-rules';
import { validateEnglishQuestion } from './english-rules';
import { normalizeDisplayText } from '../text';

export interface ValidationIssue {
    severity: 'error' | 'warning';
    message: string;
}

function uniqueNonEmpty(values: string[] | undefined): string[] {
    if (!values) return [];

    const seen = new Set<string>();
    const result: string[] = [];

    values.forEach((value) => {
        const trimmed = value?.trim();
        if (!trimmed) return;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(trimmed);
    });

    return result;
}

function shuffleArray<T>(values: T[]): T[] {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function sanitizeQuestion(question: Question): Question {
    const sanitized: Question = {
        ...question,
        instruction: normalizeDisplayText(question.instruction?.trim()) || '',
        answer: normalizeDisplayText(question.answer?.trim()) || '',
        hint: normalizeDisplayText(question.hint?.trim()) || undefined,
        explanation: normalizeDisplayText(question.explanation?.trim()) || undefined,
        content: {
            ...question.content,
            text: normalizeDisplayText(question.content?.text?.trim()) || '',
            audio: normalizeDisplayText(question.content?.audio?.trim()) || undefined,
            image: normalizeDisplayText(question.content?.image?.trim()) || undefined,
            options: uniqueNonEmpty(question.content?.options?.map((option) => normalizeDisplayText(option))),
        },
    };

    if ((sanitized.type === 'mcq' || sanitized.type === 'listening') && sanitized.content.options) {
        const answerExists = sanitized.content.options.some((option) => option === sanitized.answer);
        if (!answerExists && sanitized.answer) {
            sanitized.content.options = [...sanitized.content.options, sanitized.answer];
        }
        sanitized.content.options = shuffleArray(sanitized.content.options);
    }

    return sanitized;
}

export function validateQuestion(question: Question, expectedSkillId?: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const { SKILL_MAP } = require('../skills') as typeof import('../skills');
    const skill = SKILL_MAP[question.skillId];

    if (!question.id?.trim()) {
        issues.push({ severity: 'error', message: 'Missing question id.' });
    }

    if (!question.content?.text?.trim() && question.type !== 'speaking' && question.type !== 'reading') {
        issues.push({ severity: 'error', message: 'Missing question text.' });
    }

    if (!question.answer?.trim()) {
        issues.push({ severity: 'error', message: 'Missing canonical answer.' });
    }

    if (expectedSkillId && question.skillId !== expectedSkillId) {
        issues.push({ severity: 'error', message: `Question skillId mismatch: expected ${expectedSkillId}, received ${question.skillId}.` });
    }

    if (!skill) {
        issues.push({ severity: 'warning', message: `Unknown skillId: ${question.skillId}.` });
    } else if (skill.subjectId !== question.subjectId) {
        issues.push({ severity: 'error', message: `subjectId mismatch for ${question.skillId}: expected ${skill.subjectId}, received ${question.subjectId}.` });
    }

    if (question.type === 'mcq' || question.type === 'listening') {
        const options = question.content.options || [];
        if (options.length < 2) {
            issues.push({ severity: 'error', message: 'MCQ/listening question must have at least 2 options.' });
        }

        const uniqueOptions = uniqueNonEmpty(options);
        if (uniqueOptions.length !== options.length) {
            issues.push({ severity: 'warning', message: 'Question options contain duplicates or empty values.' });
        }

        if (!uniqueOptions.includes(question.answer)) {
            issues.push({ severity: 'error', message: 'Canonical answer is not present in options.' });
        }
    }

    if (question.type === 'input' && !question.answer.trim()) {
        issues.push({ severity: 'error', message: 'Input question must include an answer.' });
    }

    validateMathGrade2Question(question).forEach((issue) => issues.push(issue));
    validateFinanceGrade2Question(question).forEach((issue) => issues.push(issue));
    validateVietnameseQuestion(question).forEach((issue) => issues.push(issue));
    validateEnglishQuestion(question).forEach((issue) => issues.push(issue));

    return issues;
}
