import { SubjectId } from './types';

export const UI_STRINGS = {
    loading: {
        vi: 'Đang tải...',
        en: 'Loading...'
    },
    questionNotReady: {
        vi: 'Câu hỏi này chưa sẵn sàng. Bé thử câu khác nhé!',
        en: 'This question is not ready yet. Please try another one!'
    },
    aiBusy: {
        vi: 'Hệ thống AI đang bận hoặc mạng yếu. Bé hãy thử lại sau giây lát nhé! (Mã lỗi: AI-BUSY)',
        en: 'The AI system is busy or network is slow. Please try again! (AI-BUSY)'
    },
    defaultInstruction: {
        vi: 'Làm bài tập sau:',
        en: 'Complete the following task:'
    },
    math: {
        vi: 'Toán Học',
        en: 'Mathematics'
    },
    english: {
        vi: 'Tiếng Anh',
        en: 'English'
    },
    vietnamese: {
        vi: 'Tiếng Việt',
        en: 'Vietnamese'
    },
    finance: {
        vi: 'Tài chính',
        en: 'Finance'
    }
} as const;

export function getLocalizedString(key: keyof typeof UI_STRINGS, subjectId?: SubjectId) {
    const lang = subjectId === 'english' ? 'en' : 'vi';
    return UI_STRINGS[key][lang];
}
