import { CurriculumPhaseRow, CurriculumRow, CurriculumSkillRow } from '@/lib/curriculum';
import {
    CurriculumSkillQuestionSourceRow,
    QuestionBankRow,
    QuestionSourceRow,
    QuestionTemplateRow,
} from '@/lib/question-management';
import { Question, SubjectId } from '@/lib/content/types';
import { sanitizeQuestion, validateQuestion } from '@/lib/content/validation';
import { getServerSupabase } from '@/lib/server/supabase-admin';

export type QuestionSourceAdminSkillView = CurriculumSkillRow & {
    phaseCode?: string;
    phaseName?: string;
    topicName?: string;
    mapping?: CurriculumSkillQuestionSourceRow | null;
    templates: QuestionTemplateRow[];
    questionBank: QuestionBankRow[];
};

export type QuestionSourceAdminPayload = {
    curriculum: CurriculumRow;
    phases: CurriculumPhaseRow[];
    skills: QuestionSourceAdminSkillView[];
    sources: QuestionSourceRow[];
};

type StageValue = QuestionTemplateRow['stage'];
type AnswerStrategyValue = QuestionTemplateRow['answer_strategy'];
type QualityStatusValue = QuestionBankRow['quality_status'];

export type UpsertQuestionBankInput = {
    questionId?: string;
    curriculumSkillId: string;
    questionSourceId?: string | null;
    templateId?: string | null;
    legacyQuestionId?: string | null;
    difficultyLevel: number;
    stage?: StageValue;
    questionType: QuestionBankRow['question_type'];
    content: Record<string, unknown>;
    canonicalAnswer: string;
    explanation?: string | null;
    tags?: string[] | null;
    qualityStatus: QualityStatusValue;
};

export type QuestionBankImportItemResult = {
    index: number;
    curriculumSkillId: string;
    questionId: string;
    text: string;
    status: 'ready' | 'imported' | 'error';
    message: string;
};

export type QuestionBankImportReport = {
    total: number;
    readyCount: number;
    importedCount: number;
    errorCount: number;
    results: QuestionBankImportItemResult[];
};

function normalizeTags(tags?: string[] | null) {
    if (!Array.isArray(tags)) return null;
    const next = tags.map((tag) => String(tag || '').trim()).filter(Boolean);
    return next.length > 0 ? next : null;
}

function buildQuestionFromBankInput(skillCode: string, row: UpsertQuestionBankInput): Question {
    const text = typeof row.content.text === 'string' ? row.content.text.trim() : '';
    if (!text) {
        throw new Error('Question text is required.');
    }

    const instruction = typeof row.content.instruction === 'string' && row.content.instruction.trim()
        ? row.content.instruction.trim()
        : 'Làm bài tập sau:';

    const options = Array.isArray(row.content.options)
        ? row.content.options.map((option) => String(option || '').trim()).filter(Boolean)
        : undefined;

    const normalized: Question = {
        id: row.questionId?.trim() || `qb-${skillCode}-${Date.now()}`,
        subjectId: row.content.subjectId === 'math' || row.content.subjectId === 'english' || row.content.subjectId === 'vietnamese' || row.content.subjectId === 'finance'
            ? row.content.subjectId
            : 'math',
        skillId: skillCode,
        type: row.questionType,
        instruction,
        content: {
            ...row.content,
            text,
            options,
        },
        answer: row.canonicalAnswer.trim(),
        hint: typeof row.content.hint === 'string' && row.content.hint.trim() ? row.content.hint.trim() : undefined,
        explanation: row.explanation?.trim() || undefined,
    };

    return sanitizeQuestion(normalized);
}

async function getCurriculumSkillContext(curriculumSkillId: string) {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from('curriculum_skills')
        .select('id, skill_code, curriculum_id')
        .eq('id', curriculumSkillId)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Curriculum skill not found');
    return data;
}

async function ensureQuestionSourceExists(questionSourceId?: string | null) {
    if (!questionSourceId) return;
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from('question_sources')
        .select('id')
        .eq('id', questionSourceId)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Question source not found');
}

async function ensureTemplateExists(templateId?: string | null, curriculumSkillId?: string) {
    if (!templateId) return;
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from('question_templates')
        .select('id, curriculum_skill_id')
        .eq('id', templateId)
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Question template not found');
    if (curriculumSkillId && data.curriculum_skill_id !== curriculumSkillId) {
        throw new Error('Question template does not belong to this curriculum skill');
    }
}

export async function fetchQuestionSourceAdminPayload(subjectId: SubjectId, grade: number): Promise<QuestionSourceAdminPayload | null> {
    const supabase = getServerSupabase();

    const { data: curriculum, error: curriculumError } = await supabase
        .from('curricula')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('grade', grade)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (curriculumError) throw curriculumError;
    if (!curriculum) return null;

    const [phasesResult, topicsResult, skillsResult, sourcesResult] = await Promise.all([
        supabase.from('curriculum_phases').select('*').eq('curriculum_id', curriculum.id).order('order_index', { ascending: true }),
        supabase.from('curriculum_topics').select('*').eq('curriculum_id', curriculum.id).order('order_index', { ascending: true }),
        supabase.from('curriculum_skills').select('*').eq('curriculum_id', curriculum.id).order('order_index', { ascending: true }),
        supabase.from('question_sources').select('*').eq('is_active', true).order('name', { ascending: true }),
    ]);

    if (phasesResult.error) throw phasesResult.error;
    if (topicsResult.error) throw topicsResult.error;
    if (skillsResult.error) throw skillsResult.error;
    if (sourcesResult.error) throw sourcesResult.error;

    const skills = skillsResult.data || [];
    const skillIds = skills.map((skill) => skill.id);

    const [mappingsResult, templatesResult, questionBankResult] = await Promise.all([
        skillIds.length > 0
            ? supabase
                .from('curriculum_skill_question_sources')
                .select('*')
                .in('curriculum_skill_id', skillIds)
                .order('priority', { ascending: true })
            : Promise.resolve({ data: [], error: null }),
        skillIds.length > 0
            ? supabase
                .from('question_templates')
                .select('*')
                .in('curriculum_skill_id', skillIds)
                .order('difficulty_level', { ascending: true })
            : Promise.resolve({ data: [], error: null }),
        skillIds.length > 0
            ? supabase
                .from('question_bank')
                .select('*')
                .in('curriculum_skill_id', skillIds)
                .order('difficulty_level', { ascending: true })
            : Promise.resolve({ data: [], error: null }),
    ]);

    if ('error' in mappingsResult && mappingsResult.error) throw mappingsResult.error;
    if ('error' in templatesResult && templatesResult.error) throw templatesResult.error;
    if ('error' in questionBankResult && questionBankResult.error) throw questionBankResult.error;

    const phases = phasesResult.data || [];
    const topics = topicsResult.data || [];
    const sources = sourcesResult.data || [];
    const mappings = (mappingsResult.data || []) as CurriculumSkillQuestionSourceRow[];
    const templates = (templatesResult.data || []) as QuestionTemplateRow[];
    const questionBank = (questionBankResult.data || []) as QuestionBankRow[];

    const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
    const topicById = new Map(topics.map((topic) => [topic.id, topic]));
    const mappingBySkillId = new Map<string, CurriculumSkillQuestionSourceRow>();
    const templateBySkillId = new Map<string, QuestionTemplateRow[]>();
    const questionBankBySkillId = new Map<string, QuestionBankRow[]>();

    mappings.forEach((mapping) => {
        const current = mappingBySkillId.get(mapping.curriculum_skill_id);
        if (!current || mapping.priority < current.priority || mapping.is_primary) {
            mappingBySkillId.set(mapping.curriculum_skill_id, mapping);
        }
    });

    templates.forEach((template) => {
        const list = templateBySkillId.get(template.curriculum_skill_id) || [];
        list.push(template);
        templateBySkillId.set(template.curriculum_skill_id, list);
    });

    questionBank.forEach((row) => {
        const list = questionBankBySkillId.get(row.curriculum_skill_id) || [];
        list.push(row);
        questionBankBySkillId.set(row.curriculum_skill_id, list);
    });

    return {
        curriculum,
        phases,
        skills: skills.map((skill) => {
            const phase = phaseById.get(skill.phase_id);
            const topic = topicById.get(skill.topic_id);
            return {
                ...skill,
                phaseCode: phase?.code,
                phaseName: phase?.name,
                topicName: topic?.name,
                mapping: mappingBySkillId.get(skill.id) || null,
                templates: templateBySkillId.get(skill.id) || [],
                questionBank: questionBankBySkillId.get(skill.id) || [],
            };
        }),
        sources,
    };
}

export async function updateSkillQuestionSourceMapping(input: {
    curriculumSkillId: string;
    mappingId?: string;
    questionSourceId: string;
    priority: number;
    isPrimary: boolean;
    levelMin: number;
    levelMax: number;
    allowedModes: string[];
    configOverride: Record<string, unknown>;
}) {
    const supabase = getServerSupabase();

    const mappingId = input.mappingId?.trim() || `skill-source-${input.curriculumSkillId}-${Date.now()}`;

    const { data: skill, error: skillError } = await supabase
        .from('curriculum_skills')
        .select('id')
        .eq('id', input.curriculumSkillId)
        .maybeSingle();

    if (skillError) throw skillError;
    if (!skill) throw new Error('Curriculum skill not found');

    const { data: source, error: sourceError } = await supabase
        .from('question_sources')
        .select('id')
        .eq('id', input.questionSourceId)
        .maybeSingle();

    if (sourceError) throw sourceError;
    if (!source) throw new Error('Question source not found');

    if (input.levelMin > input.levelMax) {
        throw new Error('levelMin cannot be greater than levelMax');
    }

    if (input.isPrimary) {
        const { error: resetError } = await supabase
            .from('curriculum_skill_question_sources')
            .update({ is_primary: false, updated_at: new Date().toISOString() })
            .eq('curriculum_skill_id', input.curriculumSkillId);

        if (resetError) throw resetError;
    }

    const row: CurriculumSkillQuestionSourceRow & { updated_at: string } = {
        id: mappingId,
        curriculum_skill_id: input.curriculumSkillId,
        question_source_id: input.questionSourceId,
        priority: input.priority,
        is_primary: input.isPrimary,
        level_min: input.levelMin,
        level_max: input.levelMax,
        allowed_modes: input.allowedModes as never,
        config_override: input.configOverride,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('curriculum_skill_question_sources')
        .upsert(row, { onConflict: 'id' });

    if (error) throw error;
}

export async function updateQuestionTemplate(input: {
    templateId: string;
    title: string;
    difficultyLevel: number;
    stage: StageValue;
    promptTemplate?: string | null;
    answerStrategy: AnswerStrategyValue;
    metadata: Record<string, unknown>;
    isActive: boolean;
}) {
    const supabase = getServerSupabase();

    const { data: template, error: templateError } = await supabase
        .from('question_templates')
        .select('id')
        .eq('id', input.templateId)
        .maybeSingle();

    if (templateError) throw templateError;
    if (!template) throw new Error('Question template not found');

    if (input.difficultyLevel < 1 || input.difficultyLevel > 10) {
        throw new Error('difficultyLevel must be between 1 and 10');
    }

    const { error } = await supabase
        .from('question_templates')
        .update({
            title: input.title,
            difficulty_level: input.difficultyLevel,
            stage: input.stage,
            prompt_template: input.promptTemplate || null,
            answer_strategy: input.answerStrategy,
            metadata: input.metadata,
            is_active: input.isActive,
            updated_at: new Date().toISOString(),
        })
        .eq('id', input.templateId);

    if (error) throw error;
}

async function prepareQuestionBankEntry(input: UpsertQuestionBankInput) {
    const skill = await getCurriculumSkillContext(input.curriculumSkillId);

    await ensureQuestionSourceExists(input.questionSourceId);
    await ensureTemplateExists(input.templateId, input.curriculumSkillId);

    if (input.difficultyLevel < 1 || input.difficultyLevel > 10) {
        throw new Error('difficultyLevel must be between 1 and 10');
    }

    const question = buildQuestionFromBankInput(skill.skill_code, input);
    const issues = validateQuestion(question, skill.skill_code).filter((issue) => issue.severity === 'error');
    if (issues.length > 0) {
        throw new Error(issues.map((issue) => issue.message).join(' | '));
    }

    const row: QuestionBankRow = {
        id: input.questionId?.trim() || `qb-${input.curriculumSkillId}-${Date.now()}`,
        curriculum_skill_id: input.curriculumSkillId,
        question_source_id: input.questionSourceId || null,
        template_id: input.templateId || null,
        legacy_question_id: input.legacyQuestionId?.trim() || null,
        difficulty_level: input.difficultyLevel,
        stage: input.stage || null,
        question_type: input.questionType,
        content: {
            ...question.content,
            instruction: question.instruction,
            subjectId: question.subjectId,
            hint: question.hint || null,
        },
        canonical_answer: question.answer,
        explanation: question.explanation || null,
        tags: normalizeTags(input.tags),
        quality_status: input.qualityStatus,
    };

    return {
        row,
        previewText: String(question.content?.text || '').trim(),
    };
}

export async function upsertQuestionBankEntry(input: UpsertQuestionBankInput) {
    const supabase = getServerSupabase();
    const prepared = await prepareQuestionBankEntry(input);
    const { error } = await supabase.from('question_bank').upsert(prepared.row, { onConflict: 'id' });
    if (error) throw error;
    return prepared.row.id;
}

export async function importQuestionBankEntries(input: { rows: UpsertQuestionBankInput[]; dryRun?: boolean }): Promise<QuestionBankImportReport> {
    if (!Array.isArray(input.rows) || input.rows.length === 0) {
        throw new Error('Import payload is empty');
    }

    const dryRun = Boolean(input.dryRun);
    const supabase = getServerSupabase();
    const results: QuestionBankImportItemResult[] = [];
    let readyCount = 0;
    let importedCount = 0;
    let errorCount = 0;

    for (let index = 0; index < input.rows.length; index += 1) {
        const current = input.rows[index];
        try {
            const prepared = await prepareQuestionBankEntry(current);

            if (dryRun) {
                readyCount += 1;
                results.push({
                    index,
                    curriculumSkillId: current.curriculumSkillId,
                    questionId: prepared.row.id,
                    text: prepared.previewText,
                    status: 'ready',
                    message: 'Hop le, san sang import.',
                });
                continue;
            }

            const { error } = await supabase.from('question_bank').upsert(prepared.row, { onConflict: 'id' });
            if (error) throw error;

            importedCount += 1;
            results.push({
                index,
                curriculumSkillId: current.curriculumSkillId,
                questionId: prepared.row.id,
                text: prepared.previewText,
                status: 'imported',
                message: 'Da import thanh cong.',
            });
        } catch (error) {
            errorCount += 1;
            results.push({
                index,
                curriculumSkillId: current.curriculumSkillId,
                questionId: current.questionId?.trim() || '',
                text: typeof current.content?.text === 'string' ? current.content.text.trim() : '',
                status: 'error',
                message: error instanceof Error ? error.message : 'Import failed.',
            });
        }
    }

    return {
        total: input.rows.length,
        readyCount,
        importedCount,
        errorCount,
        results,
    };
}
