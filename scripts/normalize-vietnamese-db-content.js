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

const CURRICULA_UPDATES = [
    {
        id: 'curr-math-grade-2-v1',
        name: 'Toán lớp 2',
        description: 'Curriculum nền cho Toán lớp 2, dùng làm mẫu chuẩn cho selector mới.',
    },
    {
        id: 'curr-english-grade-2-v1',
        name: 'Tiếng Anh lớp 2',
        description: 'Curriculum mở rộng cho Tiếng Anh lớp 2.',
    },
    {
        id: 'curr-vietnamese-grade-2-v1',
        name: 'Tiếng Việt lớp 2',
        description: 'Curriculum mở rộng cho Tiếng Việt lớp 2.',
    },
    {
        id: 'curr-finance-grade-2-v1',
        name: 'Tài chính lớp 2',
        description: 'Curriculum mở rộng cho Tài chính lớp 2.',
    },
];

const PHASE_UPDATES = [
    ['phase-math2-hk1-dau', 'Đầu học kỳ 1'],
    ['phase-math2-hk1-giua', 'Giữa học kỳ 1'],
    ['phase-math2-hk1-cuoi', 'Cuối học kỳ 1'],
    ['phase-math2-hk2-dau', 'Đầu học kỳ 2'],
    ['phase-math2-hk2-giua', 'Giữa học kỳ 2'],
    ['phase-math2-hk2-cuoi', 'Cuối học kỳ 2'],
    ['phase-eng2-hk1-dau', 'Đầu học kỳ 1'],
    ['phase-eng2-hk1-giua', 'Giữa học kỳ 1'],
    ['phase-eng2-hk1-cuoi', 'Cuối học kỳ 1'],
    ['phase-eng2-hk2-dau', 'Đầu học kỳ 2'],
    ['phase-eng2-hk2-giua', 'Giữa học kỳ 2'],
    ['phase-eng2-hk2-cuoi', 'Cuối học kỳ 2'],
    ['phase-tv2-hk1-dau', 'Đầu học kỳ 1'],
    ['phase-tv2-hk1-giua', 'Giữa học kỳ 1'],
    ['phase-tv2-hk1-cuoi', 'Cuối học kỳ 1'],
    ['phase-tv2-hk2-dau', 'Đầu học kỳ 2'],
    ['phase-tv2-hk2-giua', 'Giữa học kỳ 2'],
    ['phase-tv2-hk2-cuoi', 'Cuối học kỳ 2'],
    ['phase-fin2-hk1-dau', 'Đầu học kỳ 1'],
    ['phase-fin2-hk1-giua', 'Giữa học kỳ 1'],
    ['phase-fin2-hk1-cuoi', 'Cuối học kỳ 1'],
    ['phase-fin2-hk2-dau', 'Đầu học kỳ 2'],
    ['phase-fin2-hk2-giua', 'Giữa học kỳ 2'],
    ['phase-fin2-hk2-cuoi', 'Cuối học kỳ 2'],
].map(([id, name]) => ({ id, name }));

const TOPIC_UPDATES = [
    ['topic-math2-so-hoc', 'Số học và phép tính', 'Trục cột số học, cộng trừ, bảng nhân chia, bài toán lời văn.'],
    ['topic-math2-hinh-hoc', 'Hình học và đo lường', 'Độ dài, thời gian, nhận biết và thao tác với hình cơ bản.'],
    ['topic-math2-tu-duy', 'Tư duy và logic', 'Quy luật, bảng số, biểu đồ và bài toán tổng hợp.'],
    ['topic-eng2-vocab', 'Từ vựng', 'Từ vựng quen thuộc và chủ đề gần gũi.'],
    ['topic-eng2-phonics', 'Ngữ âm', 'Nhận biết chữ cái và âm đầu cơ bản.'],
    ['topic-eng2-sentences', 'Mẫu câu', 'Chào hỏi và hỏi đáp đơn giản.'],
    ['topic-eng2-skills', '4 kỹ năng', 'Nghe nói đọc viết mức độ lớp 2.'],
    ['topic-tv2-doc', 'Đọc và cảm thụ', 'Đọc hiểu, thơ và đọc diễn cảm.'],
    ['topic-tv2-tu-cau', 'Luyện từ và câu', 'Từ ngữ, câu và dấu câu cơ bản.'],
    ['topic-tv2-viet', 'Chính tả và viết', 'Chính tả, kể chuyện và tả người thân.'],
    ['topic-tv2-noi', 'Nghe và nói', 'Kể lại việc đã làm và giới thiệu đồ vật.'],
    ['topic-fin2-money', 'Tiền và giá trị', 'Nhận biết tiền, so sánh và tính tổng số tiền.'],
    ['topic-fin2-saving', 'Tiết kiệm và giá trị lao động', 'Tiết kiệm, mục tiêu và giá trị nghề nghiệp.'],
].map(([id, name, description]) => ({ id, name, description }));

const SKILL_UPDATES = [
    ['skill-math2-a1', 'Cấu tạo số và so sánh (<=1000)'],
    ['skill-math2-a2', 'Cộng trừ (<=1000)'],
    ['skill-math2-a3', 'Điền số còn thiếu'],
    ['skill-math2-c1', 'Độ dài và đường gấp khúc'],
    ['skill-math2-d1', 'Hình học cơ bản'],
    ['skill-math2-b1', 'Lời văn 1 bước'],
    ['skill-math2-a4', 'Bảng nhân chia 2 và 5'],
    ['skill-math2-c2', 'Thời gian (giờ phút)'],
    ['skill-math2-b2', 'Lời văn 2 bước'],
    ['skill-math2-d2', 'Biểu đồ tranh và bảng'],
    ['skill-math2-e1', 'Quy luật dãy số'],
    ['skill-math2-e2', 'Bảng ô số (hàng cột)'],
    ['skill-math2-e3', 'Tháp số'],
    ['skill-tv2-tu-ngu', 'Từ chỉ sự vật, hoạt động, đặc điểm'],
    ['skill-tv2-cau', 'Câu giới thiệu, câu nêu hoạt động'],
    ['skill-tv2-doc-hieu', 'Đọc hiểu văn bản ngắn'],
    ['skill-tv2-dau-cau', 'Dấu chấm, phẩy, chấm hỏi'],
    ['skill-tv2-tho', 'Đọc thơ và ca dao'],
    ['skill-tv2-doc-dien-cam', 'Đọc diễn cảm'],
    ['skill-tv2-chinh-ta', 'Phân biệt tr/ch, s/x, r/d/gi'],
    ['skill-tv2-noi-nghe', 'Kể lại việc đã làm'],
    ['skill-tv2-ke-chuyen', 'Viết: Kể chuyện theo tranh'],
    ['skill-tv2-ta-nguoi', 'Viết: Tả người thân'],
    ['skill-tv2-thuyet-trinh', 'Giới thiệu đồ vật/sách'],
    ['skill-fin2-c3', 'Nhận biết tiền Việt Nam'],
    ['skill-fin2-compare', 'So sánh giá trị tiền'],
    ['skill-fin2-sum', 'Cộng tiền đơn giản'],
    ['skill-fin2-shopping', 'Đi chợ: Tính tiền 2 món'],
    ['skill-fin2-shopping-math', 'Đi chợ thông minh'],
    ['skill-fin2-need-vs-want', 'Cần hay muốn?'],
    ['skill-fin2-saving-goal', 'Đặt mục tiêu tiết kiệm'],
    ['skill-fin2-saving', 'Heo đất: Tập tiết kiệm'],
    ['skill-fin2-job', 'Nghề nghiệp và giá trị lao động'],
].map(([id, name]) => ({ id, name }));

const QUESTION_SOURCE_UPDATES = [
    ['qs-static-bank', 'Static Question Bank', 'Nguồn câu hỏi tĩnh đã được duyệt.'],
    ['qs-local-generator', 'Local Generator', 'Sinh câu hỏi bằng code trong repo.'],
    ['qs-hybrid-fallback', 'Hybrid Fallback', 'Thử static trước, sau đó tới generator local.'],
    ['qs-ai-reviewed', 'AI Reviewed Source', 'Nguồn AI chỉ dùng khi được bật rõ ràng.'],
].map(([id, name, description]) => ({ id, name, description }));

const QUESTION_TEMPLATE_UPDATES = [
    ['qt-math2-a4-core', 'Bảng nhân chia 2 và 5'],
    ['qt-math2-b1-core', 'Lời văn 1 bước'],
    ['qt-math2-b2-mixed', 'Lời văn 2 bước'],
    ['qt-math2-e2-challenge', 'Bảng ô số nâng cao'],
    ['qt-math2-e3-challenge', 'Tháp số nâng cao'],
].map(([id, title]) => ({ id, title }));

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

async function updateRows(table, rows, fields) {
    for (const row of rows) {
        const payload = {};
        fields.forEach((field) => {
            payload[field] = row[field];
        });
        const { error } = await supabase.from(table).update(payload).eq('id', row.id);
        if (error) throw error;
    }
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
    assert(curriculum, 'Không tìm thấy curriculum Toán lớp 2 trong DB.');

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

function buildMathSeedRow({ question, curriculumSkillId, questionSourceId, level, ordinal }) {
    const sanitized = sanitizeQuestion(question);
    const issues = validateQuestion(sanitized, sanitized.skillId).filter((issue) => issue.severity === 'error');
    if (issues.length > 0) {
        throw new Error(`Câu hỏi ${question.id} không hợp lệ: ${issues.map((issue) => issue.message).join(' | ')}`);
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

async function normalizeMathQuestionBank() {
    const { skillByCode, sourceBySkillId } = await getMath2Context();
    const rows = [];

    for (const skillCode of GRADE2_MATH_SKILLS) {
        const skill = skillByCode.get(skillCode);
        assert(skill, `DB thiếu skill ${skillCode} trong curriculum Toán lớp 2.`);

        const levels = mathStaticQuestions[skillCode] || {};
        for (const [levelKey, questions] of Object.entries(levels)) {
            questions.forEach((question, index) => {
                rows.push(
                    buildMathSeedRow({
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

    const { error } = await supabase.from('question_bank').upsert(rows, { onConflict: 'id' });
    if (error) throw error;

    return rows.length;
}

async function main() {
    await updateRows('curricula', CURRICULA_UPDATES, ['name', 'description']);
    await updateRows('curriculum_phases', PHASE_UPDATES, ['name']);
    await updateRows('curriculum_topics', TOPIC_UPDATES, ['name', 'description']);
    await updateRows('curriculum_skills', SKILL_UPDATES, ['name']);
    await updateRows('question_sources', QUESTION_SOURCE_UPDATES, ['name', 'description']);
    await updateRows('question_templates', QUESTION_TEMPLATE_UPDATES, ['title']);

    const updatedQuestionCount = await normalizeMathQuestionBank();

    console.log(`Đã chuẩn hóa tên/ mô tả trên DB và đồng bộ ${updatedQuestionCount} câu hỏi Toán lớp 2.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
