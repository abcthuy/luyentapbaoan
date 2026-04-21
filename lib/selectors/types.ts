import { CurriculumSelectionContext } from '../curriculum';

export type SelectionBucket = 'review' | 'weak' | 'new' | 'mixed' | 'boss';

export interface SelectorOptions {
    subjectId?: string;
    grade?: number;
    curriculumContext?: CurriculumSelectionContext | null;
    sessionLength?: number;
}
