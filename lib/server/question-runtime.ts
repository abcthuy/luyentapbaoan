import { sanitizeQuestion } from '@/lib/content/validation';
import { SubjectId } from '@/lib/content/types';
import { QuestionBankRow } from '@/lib/question-management';
import { getServerSupabase } from '@/lib/server/supabase-admin';

export async function getApprovedQuestionBankQuestion(params: {
    subjectId: SubjectId;
    skillCode: string;
    difficultyLevel: number;
}) {
    const supabase = getServerSupabase();

    const { data: curricula, error: curriculumError } = await supabase
        .from('curricula')
        .select('id')
        .eq('subject_id', params.subjectId)
        .eq('is_active', true);

    if (curriculumError) throw curriculumError;
    if (!curricula || curricula.length === 0) return null;

    const curriculumIds = curricula.map((row) => row.id);
    const { data: skills, error: skillsError } = await supabase
        .from('curriculum_skills')
        .select('id')
        .in('curriculum_id', curriculumIds)
        .eq('skill_code', params.skillCode);

    if (skillsError) throw skillsError;
    if (!skills || skills.length === 0) return null;

    const skillIds = skills.map((row) => row.id);
    const { data: exactRows, error: exactError } = await supabase
        .from('question_bank')
        .select('*')
        .in('curriculum_skill_id', skillIds)
        .eq('quality_status', 'approved')
        .eq('difficulty_level', params.difficultyLevel);

    if (exactError) throw exactError;

    let candidateRows = (exactRows || []) as QuestionBankRow[];
    if (candidateRows.length === 0) {
        const { data: fallbackRows, error: fallbackError } = await supabase
            .from('question_bank')
            .select('*')
            .in('curriculum_skill_id', skillIds)
            .eq('quality_status', 'approved');

        if (fallbackError) throw fallbackError;
        candidateRows = (fallbackRows || []) as QuestionBankRow[];
    }

    if (candidateRows.length === 0) return null;

    const closestRows = candidateRows
        .map((row) => ({ row, delta: Math.abs((row.difficulty_level || 1) - params.difficultyLevel) }))
        .sort((a, b) => a.delta - b.delta);

    const targetDelta = closestRows[0]?.delta ?? 0;
    const finalPool = closestRows.filter((item) => item.delta === targetDelta).map((item) => item.row);
    const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
    const content = selected.content || {};

    return sanitizeQuestion({
        id: selected.id,
        subjectId: content.subjectId === 'math' || content.subjectId === 'english' || content.subjectId === 'vietnamese' || content.subjectId === 'finance'
            ? content.subjectId
            : params.subjectId,
        skillId: params.skillCode,
        type: selected.question_type,
        instruction: typeof content.instruction === 'string' ? content.instruction : 'Lam bai tap sau:',
        content: {
            ...content,
            text: typeof content.text === 'string' ? content.text : '',
            options: Array.isArray(content.options) ? content.options.map((item) => String(item || '')) : undefined,
        },
        answer: selected.canonical_answer,
        hint: typeof content.hint === 'string' ? content.hint : undefined,
        explanation: selected.explanation || undefined,
    });
}
