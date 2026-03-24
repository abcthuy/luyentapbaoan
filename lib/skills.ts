
import { getAllCourses, SubjectId } from './content/registry';
import { Skill as CoreSkill } from './content/types';

// We derive the map from the Registry to ensure Single Source of Truth
// This allows adding new subjects/courses without touching this file.

export type SkillId = string;

export interface Skill extends CoreSkill {
    category: string;
    subjectId: SubjectId;
}

export function isSkillAvailableForGrade(skill: Pick<CoreSkill, 'grade'>, grade?: number): boolean {
    if (!grade) return true;
    return skill.grade <= grade;
}

export function filterSkillsByGrade<T extends Pick<CoreSkill, 'grade'>>(skills: T[], grade?: number): T[] {
    return skills.filter((skill) => isSkillAvailableForGrade(skill, grade));
}

// Helper to generate the map at runtime (or cached)
export const getSkillMap = (): Record<string, Skill> => {
    const courses = getAllCourses();
    const map: Record<string, Skill> = {};

    courses.forEach(course => {
        course.topics.forEach(topic => {
            topic.skills.forEach(skill => {
                map[skill.id] = {
                    ...skill,
                    category: topic.name, // Use Topic name as Category
                    subjectId: course.id
                };
            });
        });
    });

    return map;
};

// For backward compatibility or ease of use, we can export a proxy or a lazily evaluated object
// But for React components, calling getSkillMap() is fine.
// To match the previous API 'SKILL_MAP[id]', we can expose a const that is populated immediately.
// Note: This assumes registry is loaded synchronously.

export const SKILL_MAP: Record<string, Skill> = getSkillMap();

export function getFilteredSkills(grade?: number, subjectId?: SubjectId): Skill[] {
    return Object.values(SKILL_MAP).filter((skill) => {
        if (subjectId && skill.subjectId !== subjectId) {
            return false;
        }

        return isSkillAvailableForGrade(skill, grade);
    });
}

export function syncSkillMap() {
    Object.keys(SKILL_MAP).forEach((key) => {
        delete SKILL_MAP[key];
    });

    Object.assign(SKILL_MAP, getSkillMap());
}
