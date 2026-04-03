import type { SubjectId } from './content/types';
import { COURSES } from './content/registry';

export type SupportedGrade = 2 | 3 | 4 | 5;

export const SUPPORTED_GRADES: SupportedGrade[] = [2, 3];

export function getPublishedGradesForSubject(subjectId: SubjectId): number[] {
    const course = COURSES[subjectId];
    return Array.from(new Set(course.topics.flatMap((topic) => topic.skills.map((skill) => skill.grade)))).sort((a, b) => a - b);
}

export function getHighestPublishedGradeForSubject(subjectId: SubjectId): number {
    const grades = getPublishedGradesForSubject(subjectId);

    return grades.length > 0 ? Math.max(...grades) : 2;
}

export function hasPublishedContentForGrade(subjectId: SubjectId, grade: number): boolean {
    const course = COURSES[subjectId];
    return course.topics.some((topic) => topic.skills.some((skill) => skill.grade === grade));
}

export function resolveContentGrade(subjectId: SubjectId, requestedGrade: number): number {
    const grades = getPublishedGradesForSubject(subjectId);
    const exact = grades.find((grade) => grade === requestedGrade);

    if (exact) {
        return exact;
    }

    const lowerOrEqualGrades = grades.filter((grade) => grade <= requestedGrade);
    if (lowerOrEqualGrades.length > 0) {
        return lowerOrEqualGrades[lowerOrEqualGrades.length - 1];
    }

    return grades[0] || 2;
}
