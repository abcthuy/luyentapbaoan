import { LearningMode } from './curriculum';

export type QuestionSourceType = 'static' | 'generator' | 'hybrid' | 'ai-reviewed';
export type QuestionTemplateKind = 'static' | 'generator-rule' | 'prompt';
export type QuestionQualityStatus = 'draft' | 'approved' | 'disabled';

export interface QuestionSourceRow {
    id: string;
    code: string;
    name: string;
    source_type: QuestionSourceType;
    handler_key?: string | null;
    description?: string | null;
    config?: Record<string, unknown> | null;
    is_active: boolean;
}

export interface CurriculumSkillQuestionSourceRow {
    id: string;
    curriculum_skill_id: string;
    question_source_id: string;
    priority: number;
    is_primary: boolean;
    level_min: number;
    level_max: number;
    allowed_modes: LearningMode[];
    config_override?: Record<string, unknown> | null;
}

export interface QuestionTemplateRow {
    id: string;
    curriculum_skill_id: string;
    question_source_id?: string | null;
    code: string;
    title: string;
    template_kind: QuestionTemplateKind;
    difficulty_level: number;
    stage?: 'foundation' | 'core' | 'mixed' | 'challenge' | null;
    prompt_template?: string | null;
    answer_strategy: 'exact' | 'normalized' | 'manual-review' | 'rubric';
    metadata?: Record<string, unknown> | null;
    is_active: boolean;
}

export interface QuestionBankRow {
    id: string;
    curriculum_skill_id: string;
    question_source_id?: string | null;
    template_id?: string | null;
    legacy_question_id?: string | null;
    difficulty_level: number;
    stage?: 'foundation' | 'core' | 'mixed' | 'challenge' | null;
    question_type: 'mcq' | 'input' | 'reading' | 'speaking' | 'listening';
    content: Record<string, unknown>;
    canonical_answer: string;
    explanation?: string | null;
    tags?: string[] | null;
    quality_status: QuestionQualityStatus;
    created_at?: string;
    updated_at?: string;
}

export interface QuestionSourceResolution {
    skillSource: CurriculumSkillQuestionSourceRow;
    source: QuestionSourceRow;
}

export function resolveQuestionSourcesForSkill(params: {
    skillId: string;
    level: number;
    learningMode: LearningMode;
    skillSourceRows: CurriculumSkillQuestionSourceRow[];
    sources: QuestionSourceRow[];
}): QuestionSourceResolution[] {
    const sourceById = new Map(params.sources.filter((source) => source.is_active).map((source) => [source.id, source]));

    return params.skillSourceRows
        .filter((row) => row.curriculum_skill_id === params.skillId)
        .filter((row) => params.level >= row.level_min && params.level <= row.level_max)
        .filter((row) => row.allowed_modes.includes(params.learningMode))
        .sort((a, b) => a.priority - b.priority)
        .map((row) => {
            const source = sourceById.get(row.question_source_id);
            return source ? { skillSource: row, source } : null;
        })
        .filter((value): value is QuestionSourceResolution => Boolean(value));
}
