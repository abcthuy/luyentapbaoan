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

const { getStaticQuestionBankSnapshot } = require('../lib/content/static');
const { generateQuestion, hasRegisteredGenerator } = require('../lib/content/registry');
const { sanitizeQuestion, validateQuestion } = require('../lib/content/validation');
const { SKILL_MAP } = require('../lib/skills');

async function main() {
    const errors = [];
    const warnings = [];

    const staticBank = getStaticQuestionBankSnapshot();
    const staticSkillIds = new Set(Object.keys(staticBank));

    for (const [skillId, levels] of Object.entries(staticBank)) {
        for (const [level, questions] of Object.entries(levels)) {
            questions.forEach((question, index) => {
                const sanitized = sanitizeQuestion(question);
                const issues = validateQuestion(sanitized, skillId);
                issues.forEach((issue) => {
                    const line = `[static] ${skillId} level ${level} item ${index}: ${issue.message}`;
                    if (issue.severity === 'error') errors.push(line);
                    else warnings.push(line);
                });
            });
        }
    }

    for (const skill of Object.values(SKILL_MAP)) {
        const hasLocalSource = hasRegisteredGenerator(skill.id) || staticSkillIds.has(skill.id);
        if (!hasLocalSource) {
            continue;
        }

        const levelsToCheck = staticSkillIds.has(skill.id)
            ? Object.keys(staticBank[skill.id] || {}).map(Number)
            : [1, 2, 3, 4, 5];

        for (const level of [1, 2, 3, 4, 5]) {
            if (!levelsToCheck.includes(level) && !hasRegisteredGenerator(skill.id)) {
                continue;
            }

            try {
                const question = await generateQuestion(skill.subjectId, skill.id, level);
                const sanitized = sanitizeQuestion(question);
                const issues = validateQuestion(sanitized, skill.id);
                issues.forEach((issue) => {
                    const line = `[generated] ${skill.id} level ${level}: ${issue.message}`;
                    if (issue.severity === 'error') errors.push(line);
                    else warnings.push(line);
                });
            } catch (error) {
                errors.push(`[generated] ${skill.id} level ${level}: ${error.message}`);
            }
        }
    }

    warnings.slice(0, 20).forEach((warning) => console.warn(warning));
    if (warnings.length > 20) {
        console.warn(`... ${warnings.length - 20} more warnings`);
    }

    if (errors.length > 0) {
        errors.forEach((error) => console.error(error));
        console.error(`Question bank check failed with ${errors.length} errors and ${warnings.length} warnings.`);
        process.exit(1);
    }

    console.log(`Question bank check passed with ${warnings.length} warnings.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
