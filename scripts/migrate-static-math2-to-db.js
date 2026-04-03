require('ts-node').register({
    skipProject: true,
    transpileOnly: true,
    compilerOptions: {
        module: 'commonjs',
        moduleResolution: 'node',
        target: 'es2020',
        esModuleInterop: true,
        jsx: 'react-jsx',
        ignoreDeprecations: '6.0',
    },
});

const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { mathStaticQuestions } = require('../lib/content/static/math');
const { sanitizeQuestion, validateQuestion } = require('../lib/content/validation');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const GRADE2_MATH_SKILLS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'E3'];

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function getMath2Context() {
    const { data: curriculum, error: curriculumError } = await supabase
        .from('curricula')
        .select('id, subject_id, grade')
        .eq('subject_id', 'math')
        .eq('grade', 2)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (curriculumError) throw curriculumError;
    assert(curriculum, 'Khong tim thay curriculum Toan lop 2 trong DB.');

    const { data: skills, error: skillsError } = await supabase
        .from('curriculum_skills')
        .select('id, skill_code')
        .eq('curriculum_id', curriculum.id)
        .in('skill_code', GRADE2_MATH_SKILLS);

    if (skillsError) throw skillsError;

    const { data: mappings, error: mappingsError } = await supabase
        .from('curriculum_skill_question_sources')
        .select('curriculum_skill_id, question_source_id, priority')
        .in('curriculum_skill_id', (skills || []).map((skill) => skill.id));

    if (mappingsError) throw mappingsError;

    const sourceBySkillId = new Map();
    (mappings || []).forEach((row) => {
        const existing = sourceBySkillId.get(row.curriculum_skill_id);
        if (!existing || row.priority < existing.priority) {
            sourceBySkillId.set(row.curriculum_skill_id, row.question_source_id || null);
        }
    });

    return {
        skillByCode: new Map((skills || []).map((skill) => [skill.skill_code, skill])),
        sourceBySkillId,
    };
}

function buildRow({ question, curriculumSkillId, questionSourceId, level, ordinal }) {
    const sanitized = sanitizeQuestion(question);
    const issues = validateQuestion(sanitized, sanitized.skillId).filter((issue) => issue.severity === 'error');
    if (issues.length > 0) {
        throw new Error(`Cau hoi ${question.id} khong hop le: ${issues.map((issue) => issue.message).join(' | ')}`);
    }

    return {
        id: `seed-math2-${sanitized.skillId.toLowerCase()}-lv${level}-${ordinal}`,
        curriculum_skill_id: curriculumSkillId,
        question_source_id: questionSourceId || null,
        template_id: null,
        legacy_question_id: sanitized.id,
        difficulty_level: Number(level),
        stage: null,
        question_type: sanitized.type,
        content: {
            ...sanitized.content,
            instruction: sanitized.instruction,
            subjectId: sanitized.subjectId,
            hint: sanitized.hint || null,
        },
        canonical_answer: sanitized.answer,
        explanation: sanitized.explanation || null,
        tags: ['seed', 'static-math2'],
        quality_status: 'approved',
        updated_at: new Date().toISOString(),
    };
}

async function main() {
    const dryRun = !process.argv.includes('--apply');
    const { skillByCode, sourceBySkillId } = await getMath2Context();
    const rows = [];

    for (const skillCode of GRADE2_MATH_SKILLS) {
        const skill = skillByCode.get(skillCode);
        assert(skill, `DB thieu skill ${skillCode} trong curriculum Toan lop 2.`);

        const levels = mathStaticQuestions[skillCode] || {};
        for (const [levelKey, questions] of Object.entries(levels)) {
            questions.forEach((question, index) => {
                rows.push(
                    buildRow({
                        question,
                        curriculumSkillId: skill.id,
                        questionSourceId: sourceBySkillId.get(skill.id) || null,
                        level: Number(levelKey),
                        ordinal: index + 1,
                    })
                );
            });
        }
    }

    if (dryRun) {
        console.log(`Dry run: se migrate ${rows.length} cau hoi static Toan lop 2 vao question_bank.`);
        console.log('Dung --apply de ghi that vao DB.');
        return;
    }

    const { error } = await supabase.from('question_bank').upsert(rows, { onConflict: 'id' });
    if (error) throw error;

    console.log(`Da migrate ${rows.length} cau hoi static Toan lop 2 vao question_bank.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
