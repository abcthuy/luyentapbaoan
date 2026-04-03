import { Question } from './types';

export interface MathGrade2RuleIssue {
    severity: 'error' | 'warning';
    message: string;
}

const GRADE2_MATH_SKILLS = new Set(['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'E3']);

export function validateMathGrade2Question(question: Question): MathGrade2RuleIssue[] {
    if (question.subjectId !== 'math' || !GRADE2_MATH_SKILLS.has(question.skillId)) {
        return [];
    }

    const issues: MathGrade2RuleIssue[] = [];
    const fullText = `${question.instruction || ''} ${question.content?.text || ''} ${question.explanation || ''}`.toLowerCase();
    const numbers = extractPositiveIntegers(fullText);

    if (containsExplicitNegativeValue(fullText)) {
        issues.push({ severity: 'error', message: 'Math Grade 2 question should not contain negative results or quantities.' });
    }

    switch (question.skillId) {
        case 'A1':
        case 'A2': {
            const maxValue = Math.max(0, ...numbers);
            if (maxValue > 1000) {
                issues.push({ severity: 'error', message: `${question.skillId} should stay within 1000.` });
            }
            break;
        }
        case 'A4': {
            const a4Issue = validateA4Expression(question.content?.text || '');
            if (a4Issue) {
                issues.push({ severity: 'error', message: a4Issue });
            }
            break;
        }
        case 'B1': {
            const operationCount = countOperations(question.content?.text || '');
            if (operationCount > 1) {
                issues.push({ severity: 'warning', message: 'B1 should remain a one-step word problem.' });
            }
            if (/[x×:*]/.test(question.content?.text || '')) {
                issues.push({ severity: 'warning', message: 'B1 should prioritize addition/subtraction over multiplication/division.' });
            }
            break;
        }
        case 'B2': {
            const operationCount = countOperations(question.explanation || question.content?.text || '');
            if (operationCount < 2) {
                issues.push({ severity: 'warning', message: 'B2 should feel like a two-step problem.' });
            }
            break;
        }
        case 'C2': {
            if (/\b(13|14|15|16|17|18|19|20|21|22|23|24)\s*gi/.test(fullText)) {
                issues.push({ severity: 'warning', message: 'C2 should keep time reading in a child-friendly range.' });
            }
            break;
        }
        default:
            break;
    }

    return issues;
}

function extractPositiveIntegers(text: string): number[] {
    return Array.from(text.matchAll(/\d+/g)).map((match) => Number(match[0]));
}

function containsExplicitNegativeValue(text: string): boolean {
    return /(^|[\s=:(])-\d+/.test(text);
}

function validateA4Expression(text: string): string | null {
    const multiplication = text.match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (multiplication) {
        const left = Number(multiplication[1]);
        const right = Number(multiplication[2]);
        if (left !== 2 && left !== 5 && right !== 2 && right !== 5) {
            return `A4 should only use multiplication tables 2 and 5. Found: ${left} x ${right}.`;
        }
    }

    const division = text.match(/(\d+)\s*:\s*(\d+)/);
    if (division) {
        const divisor = Number(division[2]);
        if (divisor !== 2 && divisor !== 5) {
            return `A4 should only divide by 2 or 5. Found divisor: ${divisor}.`;
        }
    }

    return null;
}

function countOperations(text: string): number {
    return (text.match(/[+\-x×:]/g) || []).length;
}
