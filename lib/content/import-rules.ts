import { SubjectId } from './types';

export type ImportValidationIssue = {
    severity: 'error' | 'warning';
    message: string;
};

const VIETNAMESE_DIACRITICS_REGEX = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

function hasAnyKeyword(value: string, keywords: string[]) {
    const normalized = value.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
}

function textContainsDigits(value: string) {
    return /\d/.test(value);
}

function isMostlyNumericChoices(options: string[]) {
    if (options.length === 0) return false;
    return options.every((option) => /^[\d\s.,/:-]+$/.test(option.trim()));
}

export function validateImportedQuestionBySubject(params: {
    subjectId: SubjectId;
    grade?: number;
    skillCode?: string;
    questionType: string;
    text: string;
    answer: string;
    options: string[];
}) {
    const { subjectId, grade, skillCode, questionType, text, answer, options } = params;
    const issues: ImportValidationIssue[] = [];
    const normalizedText = text.trim();
    const normalizedAnswer = answer.trim();
    const joinedOptions = options.join(' ');

    if (subjectId === 'math') {
        const hasMathSignal = textContainsDigits(normalizedText) || hasAnyKeyword(normalizedText, ['cong', 'tru', 'nhan', 'chia', 'so', 'hinh', 'gio', 'phut', 'cm', 'm ', 'kg', 'lit', 'vien', 'bang']);
        if (!hasMathSignal) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'math'}: noi dung chua the hien ro dang toan hoc.` });
        }
        if (questionType === 'input' && normalizedAnswer.length > 20) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'math'}: dap an input qua dai, nen rut gon hon.` });
        }
    }

    if (subjectId === 'english') {
        if (VIETNAMESE_DIACRITICS_REGEX.test(normalizedText) || VIETNAMESE_DIACRITICS_REGEX.test(normalizedAnswer) || VIETNAMESE_DIACRITICS_REGEX.test(joinedOptions)) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'english'}: noi dung tieng Anh khong nen chua dau tieng Viet trong text/dap an/lua chon.` });
        }
        if ((questionType === 'reading' || questionType === 'listening') && normalizedText.length < 8) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'english'}: noi dung doc/nghe qua ngan.` });
        }
        if ((grade || 2) <= 2 && normalizedText.split(/\s+/).filter(Boolean).length > 20) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'english'}: cau hoi co ve dai hon muc lop nho.` });
        }
    }

    if (subjectId === 'vietnamese') {
        if (normalizedText.length < 6) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'vietnamese'}: noi dung tieng Viet qua ngan.` });
        }
        if ((questionType === 'mcq' || questionType === 'reading') && isMostlyNumericChoices(options)) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'vietnamese'}: lua chon hien tai giong bai so hoc hon bai tieng Viet.` });
        }
    }

    if (subjectId === 'finance') {
        const hasFinanceSignal =
            textContainsDigits(normalizedText) ||
            hasAnyKeyword(`${normalizedText} ${joinedOptions} ${normalizedAnswer}`, ['dong', 'nghin', 'tien', 'mua', 'ban', 'tiet kiem', 'heo dat', 'can', 'muon', 'gia']);
        if (!hasFinanceSignal) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'finance'}: noi dung chua the hien ro boi canh tai chinh.` });
        }
        if (questionType === 'input' && normalizedAnswer.length > 24) {
            issues.push({ severity: 'warning', message: `Skill ${skillCode || 'finance'}: dap an input qua dai, nen de ngan gon va ro rang.` });
        }
    }

    return issues;
}
