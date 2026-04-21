import { buildCurriculumSelectorPools } from '../curriculum';
import { ProgressData } from '../mastery';
import { SELECTOR_CONFIG } from '../selector-config';
import { SkillId } from '../skills';
import { SelectionBucket } from './types';
import { getRandomFromList, getWeakOrNewSkill, getReviewSkill, getWeakSkill, getNewSkill } from './utils';

export function selectFromCurriculumPools(
    pools: ReturnType<typeof buildCurriculumSelectorPools>,
    progress: ProgressData,
    sessionHistory: SkillId[],
    isBossLevel: boolean,
    isPushRound: boolean,
    currentPerformance: number
): { skillId: SkillId; bucket: SelectionBucket } | null {
    const {
        allowedSkillIds,
        currentPhaseSkillIds,
        coreSkillIds,
        mixedSkillIds,
        reviewSkillIds,
        challengeSkillIds,
        learningMode,
        skillConfigByLegacyId,
    } = pools;
    if (allowedSkillIds.length === 0) return null;

    if (isBossLevel && currentPerformance > SELECTOR_CONFIG.curriculumBossThreshold && challengeSkillIds.length > 0) {
        return { skillId: getRandomFromList(challengeSkillIds, sessionHistory), bucket: 'boss' };
    }

    if (learningMode === 'challenge' && challengeSkillIds.length > 0) {
        const target = getWeakOrNewSkill(challengeSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getRandomFromList(challengeSkillIds, sessionHistory);
        return { skillId: target, bucket: 'boss' };
    }

    if (learningMode === 'review' && reviewSkillIds.length > 0) {
        const target = getWeakOrNewSkill(reviewSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getRandomFromList(reviewSkillIds, sessionHistory);
        return { skillId: target, bucket: 'review' };
    }

    if (learningMode === 'mixed' && mixedSkillIds.length > 0) {
        const mixedTarget = getWeakOrNewSkill(mixedSkillIds, progress, skillConfigByLegacyId, sessionHistory)
            || getReviewSkill(mixedSkillIds, progress, sessionHistory)
            || getRandomFromList(mixedSkillIds, sessionHistory);
        return { skillId: mixedTarget, bucket: 'mixed' };
    }

    const pushPool = coreSkillIds.length > 0 ? coreSkillIds : currentPhaseSkillIds.length > 0 ? currentPhaseSkillIds : allowedSkillIds;
    const reviewPool = reviewSkillIds.length > 0 ? reviewSkillIds : allowedSkillIds;

    if (isPushRound) {
        const weakTarget = getWeakSkill(pushPool, progress, sessionHistory);
        if (weakTarget) {
            return { skillId: weakTarget, bucket: 'weak' };
        }

        const newTarget = getNewSkill(pushPool, progress, skillConfigByLegacyId, sessionHistory);
        if (newTarget) {
            return { skillId: newTarget, bucket: 'new' };
        }
    } else {
        const reviewTarget = getReviewSkill(reviewPool, progress, sessionHistory);
        if (reviewTarget) {
            return { skillId: reviewTarget, bucket: 'review' };
        }
    }

    return { skillId: getRandomFromList(pushPool, sessionHistory), bucket: 'mixed' };
}
