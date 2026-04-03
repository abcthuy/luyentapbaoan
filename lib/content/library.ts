import { Course, Question, Skill, SubjectId, Topic } from './types';

export type QuestionBank = Record<string, Record<number, Question[]>>;

export interface ContentLibrarySkillEntry {
    subjectId: SubjectId;
    topicId: string;
    topicName: string;
    skill: Skill;
    questions: Record<number, Question[]>;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContentLibrary {
    skills: ContentLibrarySkillEntry[];
    updatedAt?: string;
}

// Legacy runtime content overlay kept only for compatibility during migration to DB-backed question_bank.
let runtimeContentLibrary: ContentLibrary = { skills: [], updatedAt: undefined };

function cloneQuestion(question: Question): Question {
    return {
        ...question,
        content: {
            ...question.content,
            options: question.content.options ? [...question.content.options] : undefined,
            pairs: question.content.pairs ? question.content.pairs.map((pair) => ({ ...pair })) : undefined,
            items: question.content.items ? question.content.items.map((item) => ({ ...item })) : undefined,
            targets: question.content.targets ? question.content.targets.map((target) => ({ ...target })) : undefined,
        },
    };
}

function cloneSkill(skill: Skill): Skill {
    return { ...skill };
}

function cloneTopic(topic: Topic): Topic {
    return {
        ...topic,
        skills: topic.skills.map((skill) => cloneSkill(skill)),
    };
}

function cloneCourse(course: Course): Course {
    return {
        ...course,
        topics: course.topics.map((topic) => cloneTopic(topic)),
    };
}

export function createEmptyContentLibrary(): ContentLibrary {
    return { skills: [], updatedAt: new Date().toISOString() };
}

export function normalizeContentLibrary(library?: ContentLibrary | null): ContentLibrary {
    if (!library || !Array.isArray(library.skills)) {
        return createEmptyContentLibrary();
    }

    const normalizedSkills = library.skills.map((entry) => {
        const normalizedQuestions: Record<number, Question[]> = {};

        Object.entries(entry.questions || {}).forEach(([levelKey, questions]) => {
            const level = Number(levelKey);
            if (!Number.isFinite(level) || !Array.isArray(questions)) return;
            normalizedQuestions[level] = questions.map((question) => cloneQuestion(question));
        });

        return {
            ...entry,
            skill: cloneSkill(entry.skill),
            questions: normalizedQuestions,
            createdAt: entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || new Date().toISOString(),
        };
    });

    return {
        skills: normalizedSkills,
        updatedAt: library.updatedAt || new Date().toISOString(),
    };
}

export function setRuntimeContentLibrary(library?: ContentLibrary | null) {
    runtimeContentLibrary = normalizeContentLibrary(library);
}

export function getRuntimeContentLibrary(): ContentLibrary {
    return normalizeContentLibrary(runtimeContentLibrary);
}

export function mergeCustomLibraryIntoCourses(baseCourses: Course[], library?: ContentLibrary | null): Course[] {
    const mergedCourses = baseCourses.map((course) => cloneCourse(course));
    const normalizedLibrary = normalizeContentLibrary(library ?? runtimeContentLibrary);

    normalizedLibrary.skills.forEach((entry) => {
        const course = mergedCourses.find((item) => item.id === entry.subjectId);
        if (!course) return;

        let topic = course.topics.find((item) => item.id === entry.topicId);
        if (!topic) {
            topic = {
                id: entry.topicId,
                name: entry.topicName,
                skills: [],
            };
            course.topics.push(topic);
        }

        const existingSkill = topic.skills.find((skill) => skill.id === entry.skill.id);
        if (!existingSkill) {
            topic.skills.push(cloneSkill(entry.skill));
        }
    });

    return mergedCourses;
}

export function mergeCustomLibraryIntoQuestionBank(baseQuestionBank: QuestionBank, library?: ContentLibrary | null): QuestionBank {
    const merged: QuestionBank = {};

    Object.entries(baseQuestionBank).forEach(([skillId, levelMap]) => {
        merged[skillId] = {};
        Object.entries(levelMap).forEach(([levelKey, questions]) => {
            merged[skillId][Number(levelKey)] = questions.map((question) => cloneQuestion(question));
        });
    });

    const normalizedLibrary = normalizeContentLibrary(library ?? runtimeContentLibrary);
    normalizedLibrary.skills.forEach((entry) => {
        if (!merged[entry.skill.id]) {
            merged[entry.skill.id] = {};
        }

        Object.entries(entry.questions).forEach(([levelKey, questions]) => {
            const level = Number(levelKey);
            const existing = merged[entry.skill.id][level] || [];
            merged[entry.skill.id][level] = [...existing, ...questions.map((question) => cloneQuestion(question))];
        });
    });

    return merged;
}

export function findSkillDefinition(courses: Course[], skillId: string): ContentLibrarySkillEntry | null {
    for (const course of courses) {
        for (const topic of course.topics) {
            const skill = topic.skills.find((item) => item.id === skillId);
            if (skill) {
                return {
                    subjectId: course.id,
                    topicId: topic.id,
                    topicName: topic.name,
                    skill: cloneSkill(skill),
                    questions: {},
                };
            }
        }
    }

    return null;
}

export function upsertSkillInLibrary(
    library: ContentLibrary | null | undefined,
    nextEntry: Omit<ContentLibrarySkillEntry, 'questions'> & { questions?: Record<number, Question[]> }
): ContentLibrary {
    const normalizedLibrary = normalizeContentLibrary(library);
    const existingIndex = normalizedLibrary.skills.findIndex((entry) => entry.skill.id === nextEntry.skill.id);
    const preservedQuestions = existingIndex >= 0 ? normalizedLibrary.skills[existingIndex].questions : {};

    const finalEntry: ContentLibrarySkillEntry = {
        subjectId: nextEntry.subjectId,
        topicId: nextEntry.topicId,
        topicName: nextEntry.topicName,
        skill: cloneSkill(nextEntry.skill),
        questions: nextEntry.questions ? normalizeContentLibrary({ skills: [{ ...nextEntry, questions: nextEntry.questions }] }).skills[0].questions : preservedQuestions,
        createdAt: existingIndex >= 0 ? normalizedLibrary.skills[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const nextSkills = [...normalizedLibrary.skills];
    if (existingIndex >= 0) {
        nextSkills[existingIndex] = finalEntry;
    } else {
        nextSkills.push(finalEntry);
    }

    return {
        skills: nextSkills,
        updatedAt: new Date().toISOString(),
    };
}

export function addQuestionToLibrary(
    library: ContentLibrary | null | undefined,
    skillEntry: Omit<ContentLibrarySkillEntry, 'questions'>,
    level: number,
    question: Question
): ContentLibrary {
    const withSkill = upsertSkillInLibrary(library, skillEntry);
    const nextSkills = withSkill.skills.map((entry) => {
        if (entry.skill.id !== skillEntry.skill.id) {
            return entry;
        }

        const currentQuestions = entry.questions[level] || [];
        return {
            ...entry,
            questions: {
                ...entry.questions,
                [level]: [...currentQuestions, cloneQuestion(question)],
            },
            updatedAt: new Date().toISOString(),
        };
    });

    return {
        skills: nextSkills,
        updatedAt: new Date().toISOString(),
    };
}

export function buildLibraryExport(baseCourses: Course[], baseQuestionBank: QuestionBank, library?: ContentLibrary | null) {
    const normalizedLibrary = normalizeContentLibrary(library ?? runtimeContentLibrary);
    const mergedCourses = mergeCustomLibraryIntoCourses(baseCourses, normalizedLibrary);
    const mergedQuestionBank = mergeCustomLibraryIntoQuestionBank(baseQuestionBank, normalizedLibrary);

    const totalQuestionCount = Object.values(mergedQuestionBank).reduce((skillSum, levelMap) => {
        return skillSum + Object.values(levelMap).reduce((levelSum, questions) => levelSum + questions.length, 0);
    }, 0);

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        courses: mergedCourses,
        questionBank: mergedQuestionBank,
        customContentLibrary: normalizedLibrary,
        summary: {
            totalCourses: mergedCourses.length,
            totalSkills: mergedCourses.reduce((sum, course) => sum + course.topics.reduce((topicSum, topic) => topicSum + topic.skills.length, 0), 0),
            totalQuestions: totalQuestionCount,
            customSkillCount: normalizedLibrary.skills.length,
        },
    };
}
