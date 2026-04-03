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

const { COURSES, hasRegisteredGenerator, generateQuestion } = require('../lib/content/registry');
const { getStaticQuestion } = require('../lib/content/static');
const { sanitizeQuestion, validateQuestion } = require('../lib/content/validation');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function getGradeSkills(subjectId, grade) {
    const course = COURSES[subjectId];
    return course.topics.flatMap((topic) =>
        topic.skills
            .filter((skill) => skill.grade === grade)
            .map((skill) => ({
                subjectId,
                topicId: topic.id,
                topicName: topic.name,
                skillId: skill.id,
                semester: skill.semester || 1,
            }))
    );
}

async function checkCoverage(subjectId, grade) {
    const skills = getGradeSkills(subjectId, grade);
    assert(skills.length > 0, `No skills found for ${subjectId} grade ${grade}.`);

    for (const skill of skills) {
        const hasStatic = Boolean(getStaticQuestion(skill.skillId, 1));
        const hasGenerator = hasRegisteredGenerator(skill.skillId);
        assert(hasStatic || hasGenerator, `${subjectId}/${skill.skillId} has no static bank or generator coverage.`);

        const sampleLevels = [1];
        for (const level of sampleLevels) {
            const question = sanitizeQuestion(await generateQuestion(subjectId, skill.skillId, level));
            const issues = validateQuestion(question, skill.skillId).filter((issue) => issue.severity === 'error');
            assert(
                issues.length === 0,
                `${subjectId}/${skill.skillId} level ${level} generated invalid content: ${issues.map((issue) => issue.message).join(' | ')}`
            );
        }
    }
}

async function main() {
    await checkCoverage('english', 2);
    await checkCoverage('vietnamese', 2);
    await checkCoverage('finance', 2);
    console.log('Curriculum expansion checks passed for English grade 2, Vietnamese grade 2, and Finance grade 2.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
