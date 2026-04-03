import { Question } from './types';
import { ValidationIssue } from './validation';

const MONEY_PATTERN = /\d{1,3}(?:\.\d{3})*đ/g;
const GRADE2_MAX_MONEY = 50000;
const GRADE2_FINANCE_SKILLS = new Set([
    'C3',
    'identify-money',
    'compare-value',
    'money-sum',
    'fin2-shopping',
    'shopping-math',
    'need-vs-want',
    'saving-goal',
    'fin2-saving',
    'job-value',
    'saving-pig',
]);

const ALLOWED_GRADE2_MONEY = new Set([
    '1.000đ',
    '2.000đ',
    '5.000đ',
    '10.000đ',
    '20.000đ',
    '50.000đ',
]);

function parseMoneyToken(token: string): number | null {
    const normalized = token.replace(/\./g, '').replace(/đ/g, '').trim();
    if (!/^\d+$/.test(normalized)) return null;
    return Number(normalized);
}

function extractMoneyTokens(question: Question): string[] {
    return [
        ...(question.content.text.match(MONEY_PATTERN) || []),
        ...((question.content.options || []).flatMap((option) => option.match(MONEY_PATTERN) || [])),
        ...(question.answer.match(MONEY_PATTERN) || []),
    ];
}

function extractMoneyValues(question: Question): number[] {
    return extractMoneyTokens(question)
        .map((token) => parseMoneyToken(token))
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

function questionMentionsAny(question: Question, words: string[]) {
    const haystack = `${question.instruction} ${question.content.text} ${(question.content.options || []).join(' ')}`.toLowerCase();
    return words.some((word) => haystack.includes(word.toLowerCase()));
}

export function validateFinanceGrade2Question(question: Question): ValidationIssue[] {
    if (question.subjectId !== 'finance' || !GRADE2_FINANCE_SKILLS.has(question.skillId)) return [];
    if (!question.id.startsWith('fin-') && !question.id.startsWith('local-')) return [];

    const issues: ValidationIssue[] = [];
    const moneyValues = extractMoneyValues(question);

    if (moneyValues.some((value) => value > GRADE2_MAX_MONEY)) {
        issues.push({ severity: 'error', message: 'Finance grade 2 should not exceed 50.000đ values.' });
    }

    if (question.skillId === 'C3' || question.skillId === 'identify-money') {
        const allMoneyTokens = extractMoneyTokens(question);
        if (allMoneyTokens.some((token) => !ALLOWED_GRADE2_MONEY.has(token))) {
            issues.push({ severity: 'error', message: 'Money identification should use approved grade-2 denominations only.' });
        }
    }

    if (question.skillId === 'fin2-shopping') {
        const moneyMentionCount = (question.content.text.match(MONEY_PATTERN) || []).length;
        if (moneyMentionCount > 3) {
            issues.push({ severity: 'error', message: 'fin2-shopping should stay within simple two-item shopping situations.' });
        }
    }

    if (question.skillId === 'shopping-math' && questionMentionsAny(question, ['gan 50.000d nhat', 'gần 50.000đ nhất'])) {
        issues.push({ severity: 'error', message: 'shopping-math should use exact comparison wording, not nearest-target wording.' });
    }

    return issues;
}
