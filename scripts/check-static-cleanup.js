const fs = require('fs');
const path = require('path');
require('ts-node').register({
  skipProject: true,
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es2020',
    esModuleInterop: true,
    ignoreDeprecations: '6.0',
  },
});

const staticIndex = require(path.resolve(process.cwd(), 'lib/content/static/index.ts'));
const { mathStaticQuestions } = require(path.resolve(process.cwd(), 'lib/content/static/math.ts'));

const retiredMath2Skills = ['A4', 'B2', 'D2', 'E1'];
const fullSnapshot = staticIndex.getStaticQuestionBankSnapshot();
const runtimeSnapshot = staticIndex.getRuntimeStaticQuestionBankSnapshot();

for (const skillId of retiredMath2Skills) {
  if (!fullSnapshot[skillId]) {
    throw new Error(`Thieu static snapshot day du cho skill ${skillId}.`);
  }
  if (runtimeSnapshot[skillId]) {
    throw new Error(`Runtime static snapshot van con skill da migrate ${skillId}.`);
  }
  if (!mathStaticQuestions[skillId]) {
    throw new Error(`File static math.ts thieu du lieu cho ${skillId}.`);
  }
}

const runtimeSkillCount = Object.keys(runtimeSnapshot).length;
const fullSkillCount = Object.keys(fullSnapshot).length;
console.log(`Static cleanup check passed. Runtime snapshot con ${runtimeSkillCount}/${fullSkillCount} skill fallback.`);
