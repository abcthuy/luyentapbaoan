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

const { buildCurriculumSelectionContext, buildCurriculumSelectorPools } = require('../lib/curriculum');
const { selectNextSkill } = require('../lib/selector');
const { sanitizeQuestion, validateQuestion } = require('../lib/content/validation');
const { generateMultiplicationDivision, generateWordProblem, generateWordProblem2Steps } = require('../lib/content/generators/math');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function createSkillState(skillId, mastery, attempts, level) {
    return {
        skillId,
        mastery,
        stability: mastery >= 0.8 ? 3 : 1,
        lastSeen: '2026-04-01T00:00:00.000Z',
        lastCorrect: mastery >= 0.7 ? '2026-04-01T00:00:00.000Z' : null,
        attempts,
        correctCount: Math.max(0, Math.round(attempts * mastery)),
        wrongStreak: 0,
        streak: mastery >= 0.7 ? 2 : 0,
        level,
    };
}

function createBaseProgress() {
    return {
        skills: {
            A1: createSkillState('A1', 0.92, 5, 1),
            A2: createSkillState('A2', 0.9, 5, 1),
            A3: createSkillState('A3', 0.88, 4, 1),
            B1: createSkillState('B1', 0.82, 4, 1),
            C1: createSkillState('C1', 0.85, 4, 1),
            D1: createSkillState('D1', 0.84, 4, 1),
            A4: createSkillState('A4', 0.74, 3, 2),
            B2: createSkillState('B2', 0.56, 2, 3),
            C2: createSkillState('C2', 0.6, 2, 2),
            D2: createSkillState('D2', 0.52, 1, 2),
            E1: createSkillState('E1', 0.5, 1, 2),
            E2: createSkillState('E2', 0.2, 0, 2),
            E3: createSkillState('E3', 0.18, 0, 2),
        },
        overallStreak: 0,
        lastSessionDate: null,
        lastSessionCount: 0,
        lastSessionScore: 0,
        totalScore: 0,
        bestTimeSeconds: 0,
        totalTimeMinutes: 0,
        updatedAt: '2026-04-02T00:00:00.000Z',
        balance: 0,
        savings: 0,
        inventory: [],
        reviewQueue: [],
        badges: [],
    };
}

function phase(curriculumId, id, code, semester, order) {
    return { id, curriculum_id: curriculumId, code, name: code, semester, order_index: order };
}

function skill(curriculumId, legacyId, phaseId, order, stage, isCore, isMixedEligible, isChallenge, minAttempts, minMastery) {
    return {
        id: `skill-${legacyId}`,
        curriculum_id: curriculumId,
        topic_id: 'topic-math2',
        phase_id: phaseId,
        skill_code: legacyId,
        name: legacyId,
        semester: ['p1', 'p2', 'p3'].includes(phaseId) ? 1 : 2,
        order_index: order,
        stage,
        difficulty_band: stage === 'challenge' ? 'challenge' : stage === 'foundation' ? 'foundation' : 'standard',
        difficulty_base: stage === 'challenge' ? 4 : 2,
        min_attempts: minAttempts,
        min_mastery_to_unlock_next: minMastery,
        question_types: ['mcq', 'input'],
        is_core: isCore,
        is_reviewable: true,
        is_mixed_exam_eligible: isMixedEligible,
        is_challenge: isChallenge,
        metadata: { legacySkillId: legacyId },
    };
}

function prereq(skillCode, prerequisiteCode) {
    return {
        skill_id: `skill-${skillCode}`,
        prerequisite_skill_id: `skill-${prerequisiteCode}`,
        relation_type: 'required',
    };
}

function createPayload(learningMode) {
    const curriculumId = 'math-2-v1';
    const phases = [
        phase(curriculumId, 'p1', 'hk1_dau', 1, 1),
        phase(curriculumId, 'p2', 'hk1_giua', 1, 2),
        phase(curriculumId, 'p3', 'hk1_cuoi', 1, 3),
        phase(curriculumId, 'p4', 'hk2_dau', 2, 4),
        phase(curriculumId, 'p5', 'hk2_giua', 2, 5),
        phase(curriculumId, 'p6', 'hk2_cuoi', 2, 6),
    ];

    const skills = [
        skill(curriculumId, 'A1', 'p1', 1, 'foundation', true, false, false, 3, 0.65),
        skill(curriculumId, 'A2', 'p1', 2, 'foundation', true, false, false, 3, 0.65),
        skill(curriculumId, 'A3', 'p2', 3, 'foundation', true, false, false, 3, 0.65),
        skill(curriculumId, 'B1', 'p3', 4, 'core', true, true, false, 3, 0.68),
        skill(curriculumId, 'C1', 'p3', 5, 'core', true, false, false, 3, 0.68),
        skill(curriculumId, 'D1', 'p3', 6, 'core', true, false, false, 3, 0.68),
        skill(curriculumId, 'A4', 'p4', 7, 'core', true, true, false, 3, 0.7),
        skill(curriculumId, 'B2', 'p5', 8, 'core', true, true, false, 3, 0.72),
        skill(curriculumId, 'C2', 'p5', 9, 'core', false, true, false, 3, 0.72),
        skill(curriculumId, 'D2', 'p5', 10, 'core', true, true, false, 3, 0.72),
        skill(curriculumId, 'E1', 'p5', 11, 'mixed', true, true, false, 3, 0.72),
        skill(curriculumId, 'E2', 'p6', 12, 'challenge', false, true, true, 2, 0.75),
        skill(curriculumId, 'E3', 'p6', 13, 'challenge', false, false, true, 2, 0.75),
    ];

    const prerequisites = [
        prereq('A2', 'A1'),
        prereq('A3', 'A2'),
        prereq('B1', 'A3'),
        prereq('A4', 'B1'),
        prereq('B2', 'A4'),
        prereq('C2', 'C1'),
        prereq('D2', 'D1'),
        prereq('E1', 'A4'),
        prereq('E2', 'E1'),
        prereq('E3', 'E1'),
    ];

    return {
        enabled: true,
        curriculum: {
            id: curriculumId,
            subject_id: 'math',
            grade: 2,
            name: 'Toan lop 2',
            academic_year: '2025-2026',
            version: 1,
            is_active: true,
        },
        phases,
        skills,
        prerequisites,
        studentState: {
            profile_id: 'p-be-1',
            curriculum_id: curriculumId,
            current_phase_id: 'p5',
            current_skill_id: 'B2',
            pace_mode: 'standard',
            learning_mode: learningMode,
            acceleration_level: learningMode === 'challenge' ? 'advanced' : 'standard',
            parent_override_mode: false,
            notes: null,
        },
    };
}

function checkSelectorModes() {
    const progress = createBaseProgress();
    const availableSkills = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'E3'];

    const coreContext = buildCurriculumSelectionContext(createPayload('core'));
    assert(coreContext, 'Core curriculum context should exist.');
    const corePools = buildCurriculumSelectorPools(coreContext, progress, availableSkills);
    assert(corePools.coreSkillIds.includes('B2'), 'Core pool should include B2.');
    assert(corePools.coreSkillIds.includes('D2'), 'Core pool should include D2.');
    assert(corePools.coreSkillIds.includes('E1'), 'Core pool should include E1.');
    assert(!corePools.coreSkillIds.includes('A1'), 'Core pool should not fall back to early HK1 skills at hk2_giua.');

    const coreSelection = selectNextSkill(progress, [], 0, 0.7, { subjectId: 'math', grade: 2, curriculumContext: coreContext });
    assert(['B2', 'D2', 'E1'].includes(coreSelection.skillId), `Core mode should focus current core skills, got ${coreSelection.skillId}.`);

    const reviewContext = buildCurriculumSelectionContext(createPayload('review'));
    const reviewSelection = selectNextSkill(progress, [], 1, 0.7, { subjectId: 'math', grade: 2, curriculumContext: reviewContext });
    assert(['A4', 'B2', 'C2', 'D2', 'E1'].includes(reviewSelection.skillId), `Review mode should target reviewable skills, got ${reviewSelection.skillId}.`);

    const mixedContext = buildCurriculumSelectionContext(createPayload('mixed'));
    const mixedPools = buildCurriculumSelectorPools(mixedContext, progress, availableSkills);
    assert(mixedPools.mixedSkillIds.includes('B1'), 'Mixed pool should include prior mixed-eligible knowledge.');
    assert(mixedPools.mixedSkillIds.includes('A4'), 'Mixed pool should include semester 2 mixed-eligible knowledge.');
    const mixedSelection = selectNextSkill(progress, [], 0, 0.7, { subjectId: 'math', grade: 2, curriculumContext: mixedContext });
    assert(['B1', 'A4', 'B2', 'C2', 'D2', 'E1'].includes(mixedSelection.skillId), `Mixed mode should draw from mixed-eligible skills, got ${mixedSelection.skillId}.`);

    const challengeProgress = createBaseProgress();
    challengeProgress.skills.E1 = createSkillState('E1', 0.82, 4, 3);
    const challengeContext = buildCurriculumSelectionContext(createPayload('challenge'));
    const challengeSelection = selectNextSkill(challengeProgress, [], 0, 0.9, { subjectId: 'math', grade: 2, curriculumContext: challengeContext });
    assert(['E2', 'E3'].includes(challengeSelection.skillId), `Challenge mode should target challenge skills, got ${challengeSelection.skillId}.`);
}

function checkGenerators() {
    for (let i = 0; i < 40; i += 1) {
        const multQuestion = sanitizeQuestion(generateMultiplicationDivision('A4', 5));
        const multIssues = validateQuestion(multQuestion, 'A4');
        assert(multIssues.every((issue) => issue.severity !== 'error'), `A4 should not create invalid grade-2 multiplication/division content: ${multIssues.map((issue) => issue.message).join(' | ')}`);

        const wordQuestion = sanitizeQuestion(generateWordProblem('B1', 5));
        const wordIssues = validateQuestion(wordQuestion, 'B1');
        assert(wordIssues.every((issue) => !issue.message.includes('multiplication/division')), `B1 should stay in one-step add/sub range: ${wordIssues.map((issue) => issue.message).join(' | ')}`);

        const twoStepQuestion = sanitizeQuestion(generateWordProblem2Steps('B2', 3));
        const twoStepIssues = validateQuestion(twoStepQuestion, 'B2');
        assert(twoStepIssues.every((issue) => issue.severity !== 'error'), `B2 level 3 should remain valid: ${twoStepIssues.map((issue) => issue.message).join(' | ')}`);
        assert(!/\d+\s*[x×]\s*\d+/.test(twoStepQuestion.content.text), `B2 level 3 should not unlock multiplication too early: ${twoStepQuestion.content.text}`);
    }
}

function main() {
    checkSelectorModes();
    checkGenerators();
    console.log('Math Grade 2 curriculum checks passed.');
}

main();
