import { Course, SubjectId } from './types';
export type { SubjectId };

import { COURSES } from './courses/index';
import { getRuntimeContentLibrary, mergeCustomLibraryIntoCourses } from './library';
import { generatorRegistry } from './generator-registry';

// Import generators
import * as VietnameseGen from './generators/vietnamese';
import * as EnglishGen from './generators/english';
import * as FinanceGen from './generators/finance';
import * as MathGen from './generators/math';

// Registration Logic
export function initializeRegistry() {
    // Math
    generatorRegistry.register('A1', MathGen.generateNumberStructureComparison);
    generatorRegistry.register('A2', MathGen.generateAdditionSubtraction);
    generatorRegistry.register('A3', MathGen.generateMissingNumber);
    generatorRegistry.register('A4', MathGen.generateMultiplicationDivision);
    generatorRegistry.register('B1', MathGen.generateWordProblem);
    generatorRegistry.register('B2', MathGen.generateWordProblem2Steps);
    
    ['m3-so-10k', 'm4-so-lon'].forEach(id => generatorRegistry.register(id, MathGen.generateLargeNumbers));
    ['m3-cong-tru-100k', 'm4-cong-tru-nhan-chia', 'm5-so-thap-phan', 'm5-ti-so-phan-tram'].forEach(id => generatorRegistry.register(id, MathGen.generateAddSub100k));
    ['m3-nhan-chia-lon', 'm5-bai-toan-thuc-te'].forEach(id => generatorRegistry.register(id, MathGen.generateMultDivLarge));
    generatorRegistry.register('m3-bang-nhan', MathGen.generateMultTable);
    
    generatorRegistry.register('C1', MathGen.generateLength);
    generatorRegistry.register('C2', MathGen.generateTime);
    generatorRegistry.register('D1', MathGen.generateGeometry);
    
    ['m3-chu-vi', 'm4-dien-tich-hinh', 'm5-the-tich'].forEach(id => generatorRegistry.register(id, MathGen.generatePerimeterArea));
    ['m3-goc', 'm4-goc-do-thoi-gian'].forEach(id => generatorRegistry.register(id, MathGen.generateAngle));
    ['m3-don-vi', 'm5-don-vi-do'].forEach(id => generatorRegistry.register(id, MathGen.generateUnit));
    
    generatorRegistry.register('D2', MathGen.generateChart);
    generatorRegistry.register('E1', MathGen.generateSequence);
    generatorRegistry.register('E2', MathGen.generateNumberGrid);
    generatorRegistry.register('E3', MathGen.generateNumberTower);
    
    ['m3-thong-ke', 'm5-bieu-do'].forEach(id => generatorRegistry.register(id, MathGen.generateStatistics));
    ['m3-phan-so', 'm4-phan-so'].forEach(id => generatorRegistry.register(id, MathGen.generateFraction));
    ['m3-xac-suat', 'm4-trung-binh-cong'].forEach(id => generatorRegistry.register(id, MathGen.generateProbability));

    // Vietnamese
    ['tv2-doc-hieu', 'tv3-doc-hieu', 'tv2-tho', 'tv3-nghi-luan', 'tv4-doc-hieu', 'tv4-cam-thu', 'tv5-doc-hieu', 'tv5-nghi-luan'].forEach(id => generatorRegistry.register(id, VietnameseGen.generateReadingQuestion));
    ['tv2-tu-ngu', 'tv2-cau', 'tv3-tu-tu', 'tv3-loai-cau', 'tv4-tu-loai', 'tv4-lien-ket-cau', 'tv5-tu-dong-nghia', 'tv5-lien-ket-van-ban'].forEach(id => generatorRegistry.register(id, VietnameseGen.generateVocabQuestion));
    generatorRegistry.register('tv2-dau-cau', VietnameseGen.generatePunctuationQuestion);
    ['tv2-chinh-ta', 'tv3-viet-thu', 'tv3-bao-cao', 'tv4-chinh-ta', 'tv5-tap-lam-van', 'tv2-ke-chuyen', 'tv2-ta-nguoi', 'tv3-sang-tao', 'tv4-mieu-ta', 'tv5-van-nghi-luan'].forEach(id => generatorRegistry.register(id, VietnameseGen.generateWritingQuestion));
    ['tv2-doc-dien-cam', 'tv3-hung-bien', 'tv4-thuyet-trinh', 'tv5-thao-luan', 'tv2-noi-nghe', 'tv2-thuyet-trinh', 'tv3-thao-luan', 'tv4-noi-nghe', 'tv5-noi-nghe'].forEach(id => generatorRegistry.register(id, VietnameseGen.generateSpeakingQuestion));

    // English
    ['eng2-list', 'eng3-list', 'eng4-list', 'eng5-list'].forEach(id => generatorRegistry.register(id, EnglishGen.generateEnglishListeningQuestion));
    ['eng2-speak', 'eng3-speak', 'eng4-speak', 'eng5-speak'].forEach(id => generatorRegistry.register(id, EnglishGen.generateEnglishSpeakingQuestion));
    ['eng2-read', 'eng3-read', 'eng-story-quest', 'eng4-read', 'eng5-read'].forEach(id => generatorRegistry.register(id, EnglishGen.generateEnglishReadingQuestion));
    ['eng2-write', 'eng3-write', 'eng4-write', 'eng5-write'].forEach(id => generatorRegistry.register(id, EnglishGen.generateEnglishWritingQuestion));
    ['eng-colors', 'eng-animals', 'eng-family', 'eng-school', 'eng-phonics-a', 'eng-phonics-b', 'eng-phonics-c', 'eng-hello', 'eng-qa-name', 'eng-qa-this-that', 'eng-clothes', 'eng-food', 'eng-routine', 'eng-house', 'eng-vowels', 'eng-blends', 'eng-grammar-present', 'eng-grammar-continuous', 'eng-prepositions'].forEach(id => generatorRegistry.register(id, EnglishGen.generateEnglishCoreQuestion));

    // Finance
    ['C3', 'identify-money', 'compare-value', 'money-sum', 'fin2-shopping', 'fin3-calc', 'shopping-math', 'need-vs-want', 'saving-goal', 'fin2-saving', 'saving-pig', 'fin3-budget', 'job-value'].forEach(id => generatorRegistry.register(id, FinanceGen.generateFinanceQuestion));
}

// Initialize on load
initializeRegistry();

// Exported public API
export { COURSES };
export { generateQuestion, resetQuestionSessionTracker } from './selection';

export function getCourse(id: SubjectId): Course {
    return getAllCourses().find((course) => course.id === id) || COURSES[id];
}

export function getAllCourses(): Course[] {
    return mergeCustomLibraryIntoCourses(Object.values(COURSES), getRuntimeContentLibrary());
}
