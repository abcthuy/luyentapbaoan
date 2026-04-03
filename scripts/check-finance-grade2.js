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

const { sanitizeQuestion, validateQuestion } = require('../lib/content/validation');
const { generateFinanceQuestion } = require('../lib/content/generators/finance');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function extractMoneyValues(question) {
    const haystack = `${question.content.text} ${question.answer} ${(question.content.options || []).join(' ')}`;
    const matches = haystack.match(/\d{1,3}(?:\.\d{3})*đ/g) || [];
    return matches.map((token) => Number(token.replace(/\./g, '').replace(/đ/g, ''))).filter((value) => Number.isFinite(value));
}

const GRADE2_SKILLS = [
    'C3',
    'identify-money',
    'compare-value',
    'money-sum',
    'fin2-shopping',
    'shopping-math',
    'need-vs-want',
    'saving-goal',
    'fin2-saving',
    'job-value',
    'saving-pig',
];

function main() {
    for (const skillId of GRADE2_SKILLS) {
        for (let level = 1; level <= 3; level += 1) {
            for (let i = 0; i < 25; i += 1) {
                const question = sanitizeQuestion(generateFinanceQuestion(skillId, level));
                const issues = validateQuestion(question, skillId).filter((issue) => issue.severity === 'error');
                assert(
                    issues.length === 0,
                    `Finance grade 2 invalid question for ${skillId} level ${level}: ${issues.map((issue) => issue.message).join(' | ')}`
                );

                const moneyValues = extractMoneyValues(question);
                assert(moneyValues.every((value) => value <= 50000), 'Finance grade 2 should not exceed 50.000đ values.');

                if (skillId === 'money-sum') {
                    assert(question.type === 'input', 'money-sum should generate input questions.');
                    assert(/^\d+$/.test(question.answer.trim()), 'money-sum answer should stay numeric only.');
                }

                if (skillId === 'shopping-math') {
                    const haystack = `${question.instruction} ${question.content.text}`.toLowerCase();
                    assert(!haystack.includes('gần 50.000đ nhất'), 'shopping-math should avoid nearest-target wording.');
                }
            }
        }
    }

    console.log('Finance grade 2 checks passed.');
}

main();