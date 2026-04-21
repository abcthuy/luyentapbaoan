import { Course, SubjectId } from '../types';
import { mathCourse } from './math';
import { englishCourse } from './english';
import { vietnameseCourse } from './vietnamese';
import { financeCourse } from './finance';

export const COURSES: Record<SubjectId, Course> = {
    'math': mathCourse,
    'english': englishCourse,
    'vietnamese': vietnameseCourse,
    'finance': financeCourse
};
