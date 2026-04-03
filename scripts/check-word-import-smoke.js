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

const { buildLibraryTemplateWordDocument, parseLibraryWordDocument } = require('../lib/content/library-word');
const { COURSES } = require('../lib/content/registry');
const { validateImportedQuestionBySubject } = require('../lib/content/import-rules');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function getSkillsForGrade(course, grade) {
    return course.topics.flatMap((topic) =>
        topic.skills
            .filter((skill) => skill.grade === grade)
            .map((skill) => ({
                skillId: skill.id,
                skillName: skill.name,
                topicId: topic.id,
                topicName: topic.name,
            }))
    );
}

async function checkSubjectGrade(subjectId, grade) {
    const course = COURSES[subjectId];
    const skills = getSkillsForGrade(course, grade);
    if (skills.length === 0) {
        return null;
    }

    const blob = buildLibraryTemplateWordDocument({
        subjectId,
        skills,
    });
    const parsed = await parseLibraryWordDocument(await blob.arrayBuffer());

    assert(parsed.skills.length === skills.length, `${subjectId} lop ${grade}: so skill parse lai khong khop (${parsed.skills.length}/${skills.length}).`);
    assert(parsed.questions.length === skills.length * 3, `${subjectId} lop ${grade}: so dong cau hoi mau phai bang 3 lan so skill.`);

    const expectedSkillIds = new Set(skills.map((skill) => skill.skillId));
    const parsedSkillIds = new Set(parsed.skills.map((skill) => skill.skill.id));
    const parsedQuestionSkillIds = new Set(parsed.questions.map((row) => row.skillId));

    skills.forEach((skill) => {
        assert(parsedSkillIds.has(skill.skillId), `${subjectId} lop ${grade}: thieu skill ${skill.skillId} trong bang skill.`);
        assert(parsedQuestionSkillIds.has(skill.skillId), `${subjectId} lop ${grade}: thieu cau hoi mau cho skill ${skill.skillId}.`);
    });

    parsed.questions.forEach((row, index) => {
        assert(expectedSkillIds.has(row.skillId), `${subjectId} lop ${grade}: dong cau hoi ${index + 1} thuoc skill ngoai danh sach.`);
        assert([1, 2, 3].includes(Number(row.level)), `${subjectId} lop ${grade}: dong cau hoi ${index + 1} co level ngoai 1-3.`);
        assert(typeof row.question?.content?.text === 'string' && row.question.content.text.trim().length > 0, `${subjectId} lop ${grade}: dong cau hoi ${index + 1} thieu noi dung.`);
        assert(typeof row.question?.answer === 'string' && row.question.answer.trim().length > 0, `${subjectId} lop ${grade}: dong cau hoi ${index + 1} thieu dap an.`);
        assert(row.question?.subjectId === subjectId, `${subjectId} lop ${grade}: dong cau hoi ${index + 1} sai subjectId.`);

        const subjectIssues = validateImportedQuestionBySubject({
            subjectId,
            grade,
            skillCode: row.skillId,
            questionType: row.question.type,
            text: row.question.content.text,
            answer: row.question.answer,
            options: Array.isArray(row.question.content.options) ? row.question.content.options : [],
        });

        const blockingIssues = subjectIssues.filter((issue) => issue.severity === 'error');
        assert(blockingIssues.length === 0, `${subjectId} lop ${grade}: dong cau hoi ${index + 1} vi pham rule mon hoc (${blockingIssues.map((issue) => issue.message).join('; ')}).`);
    });

    return {
        subjectId,
        grade,
        skillCount: skills.length,
        questionCount: parsed.questions.length,
    };
}

async function main() {
    const subjectIds = ['math', 'english', 'vietnamese', 'finance'];
    const grades = [2, 3];
    const results = [];

    for (const subjectId of subjectIds) {
        for (const grade of grades) {
            const result = await checkSubjectGrade(subjectId, grade);
            if (result) {
                results.push(result);
            }
        }
    }

    assert(results.length > 0, 'Khong co du lieu nao duoc kiem tra.');

    results.forEach((result) => {
        console.log(`[OK] ${result.subjectId} lop ${result.grade}: ${result.skillCount} skill, ${result.questionCount} dong cau hoi mau`);
    });

    console.log('Word template/import smoke checks passed.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
