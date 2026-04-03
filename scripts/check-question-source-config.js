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

const { resolveQuestionSourcesForSkill } = require('../lib/question-management');
const { hasRegisteredGenerator } = require('../lib/content/registry');
const { getStaticQuestionBankSnapshot } = require('../lib/content/static');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const questionSources = [
    { id: 'qs-static-bank', code: 'static_bank', name: 'Static Question Bank', source_type: 'static', handler_key: 'static-bank', is_active: true, config: {} },
    { id: 'qs-local-generator', code: 'local_generator', name: 'Local Generator', source_type: 'generator', handler_key: 'local-generator', is_active: true, config: {} },
    { id: 'qs-hybrid-fallback', code: 'hybrid_fallback', name: 'Hybrid Fallback', source_type: 'hybrid', handler_key: 'hybrid-fallback', is_active: true, config: {} },
];

const skillSourceRows = [
    { id: 'skill-source-math2-a1-hybrid', curriculum_skill_id: 'skill-math2-a1', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: {} },
    { id: 'skill-source-math2-a2-hybrid', curriculum_skill_id: 'skill-math2-a2', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: {} },
    { id: 'skill-source-math2-a3-hybrid', curriculum_skill_id: 'skill-math2-a3', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: {} },
    { id: 'skill-source-math2-b1-hybrid', curriculum_skill_id: 'skill-math2-b1', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: { pedagogy: 'one-step-word-problem' } },
    { id: 'skill-source-math2-a4-hybrid', curriculum_skill_id: 'skill-math2-a4', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: { allowedTables: [2, 5] } },
    { id: 'skill-source-math2-b2-hybrid', curriculum_skill_id: 'skill-math2-b2', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: { pedagogy: 'two-step-word-problem' } },
    { id: 'skill-source-math2-c1-hybrid', curriculum_skill_id: 'skill-math2-c1', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: {} },
    { id: 'skill-source-math2-c2-hybrid', curriculum_skill_id: 'skill-math2-c2', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: { timeFormat: 'grade2-friendly' } },
    { id: 'skill-source-math2-d1-hybrid', curriculum_skill_id: 'skill-math2-d1', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['core', 'review', 'mixed'], config_override: {} },
    { id: 'skill-source-math2-d2-hybrid', curriculum_skill_id: 'skill-math2-d2', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['review', 'mixed', 'exam'], config_override: { usage: 'mixed-assessment' } },
    { id: 'skill-source-math2-e1-hybrid', curriculum_skill_id: 'skill-math2-e1', question_source_id: 'qs-hybrid-fallback', priority: 1, is_primary: true, level_min: 1, level_max: 5, allowed_modes: ['review', 'mixed', 'exam'], config_override: { usage: 'mixed-assessment' } },
    { id: 'skill-source-math2-e2-generator', curriculum_skill_id: 'skill-math2-e2', question_source_id: 'qs-local-generator', priority: 1, is_primary: true, level_min: 2, level_max: 5, allowed_modes: ['challenge', 'mixed'], config_override: { usage: 'challenge' } },
    { id: 'skill-source-math2-e3-generator', curriculum_skill_id: 'skill-math2-e3', question_source_id: 'qs-local-generator', priority: 1, is_primary: true, level_min: 2, level_max: 5, allowed_modes: ['challenge', 'mixed'], config_override: { usage: 'challenge' } },
];

function main() {
    const staticBank = getStaticQuestionBankSnapshot();
    const mappedSkillCodes = ['A1', 'A2', 'A3', 'B1', 'A4', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'E3'];

    mappedSkillCodes.forEach((legacySkillId) => {
        const curriculumSkillId = `skill-math2-${legacySkillId.toLowerCase()}`;
        const learningMode = ['D2', 'E1'].includes(legacySkillId)
            ? 'mixed'
            : legacySkillId === 'E2' || legacySkillId === 'E3'
                ? 'challenge'
                : 'core';
        const sources = resolveQuestionSourcesForSkill({
            skillId: curriculumSkillId,
            level: legacySkillId === 'E2' || legacySkillId === 'E3' ? 4 : 3,
            learningMode,
            skillSourceRows,
            sources: questionSources,
        });

        assert(sources.length > 0, `Missing configured source for ${legacySkillId}.`);

        const usesGenerator = hasRegisteredGenerator(legacySkillId);
        const hasStatic = Boolean(staticBank[legacySkillId]);
        const primary = sources[0].source.source_type;

        if (primary === 'generator' || primary === 'hybrid') {
            assert(usesGenerator || hasStatic, `${legacySkillId} maps to generator/hybrid but no local source exists.`);
        }

        if (primary === 'static') {
            assert(hasStatic, `${legacySkillId} maps to static but no static bank exists.`);
        }
    });

    console.log('Question source mapping checks passed.');
}

main();
