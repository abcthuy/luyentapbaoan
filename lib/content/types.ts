
export type SubjectId = 'math' | 'english' | 'vietnamese' | 'finance';

export type QuestionType = 'mcq' | 'input' | 'speaking' | 'listening' | 'reading' | 'drag-drop' | 'match' | 'drawing';

export interface QuestionContent {
    text: string;
    image?: string;
    audio?: string; // Text to speak or URL
    options?: string[]; // For MCQ or drag-drop items
    // For Match type
    pairs?: { left: string; right: string }[];
    // For Drag-Drop type
    items?: { id: string; content: string }[];
    targets?: { id: string; content: string }[];
    // For Drawing type
    drawingMode?: 'geometry' | 'coloring' | 'free';
    imagePrompt?: string; // AI Image Prompt
}

export interface Question {
    id: string;
    subjectId: SubjectId;
    skillId: string; // "A1", "math-addition", "eng-vocab-1"
    type: QuestionType;
    instruction: string;
    content: QuestionContent;
    answer: string; // Canonical answer
    hint?: string;
    explanation?: string;
}

export interface Skill {
    id: string;
    name: string;
    description?: string;
    tier: 1 | 2 | 3; // Basic vs Advanced vs Expert
    grade: 2 | 3; // Lớp 2 hoặc Lớp 3
    semester?: 1 | 2; // Học kỳ 1 hoặc 2
    order?: number;
    instructions?: string;
}

export interface Topic {
    id: string;
    name: string;
    skills: Skill[];
}

export interface Course {
    id: SubjectId;
    name: string;
    description: string;
    topics: Topic[];
    icon?: React.ReactNode;
    color?: string; // Main theme color for this subject
}
