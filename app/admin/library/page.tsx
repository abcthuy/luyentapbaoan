"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Download, FileText, PlusCircle, Upload } from 'lucide-react';
import { useProgress } from '@/components/progress-provider';
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from '@/lib/admin-session';
import {
    addQuestionToLibrary,
    buildLibraryExport,
    createEmptyContentLibrary,
    findSkillDefinition,
    mergeCustomLibraryIntoCourses,
    normalizeContentLibrary,
    upsertSkillInLibrary,
} from '@/lib/content/library';
import { buildLibraryTemplateWordDocument, buildLibraryWordDocument, buildSkillSummary, parseLibraryWordDocument } from '@/lib/content/library-word';
import { getAllCourses } from '@/lib/content/registry';
import { Question, QuestionType, Skill, SubjectId } from '@/lib/content/types';

type SkillFormState = {
    subjectId: SubjectId;
    topicId: string;
    topicName: string;
    skillId: string;
    skillName: string;
    description: string;
    tier: 1 | 2 | 3;
    grade: 2 | 3;
    semester: 1 | 2;
    instructions: string;
};

type QuestionFormState = {
    skillId: string;
    level: number;
    type: QuestionType;
    instruction: string;
    text: string;
    answer: string;
    options: string;
    hint: string;
    explanation: string;
    extraContentJson: string;
};

const INITIAL_SKILL_FORM: SkillFormState = {
    subjectId: 'math',
    topicId: '',
    topicName: '',
    skillId: '',
    skillName: '',
    description: '',
    tier: 1,
    grade: 2,
    semester: 1,
    instructions: '',
};

const INITIAL_QUESTION_FORM: QuestionFormState = {
    skillId: '',
    level: 1,
    type: 'mcq',
    instruction: '',
    text: '',
    answer: '',
    options: '',
    hint: '',
    explanation: '',
    extraContentJson: '',
};

const INPUT_CLASS =
    'w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100';

function downloadWordFile(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

function getSubjectLabel(subjectId: SubjectId) {
    if (subjectId === 'math') return 'Toán';
    if (subjectId === 'english') return 'Tiếng Anh';
    if (subjectId === 'vietnamese') return 'Tiếng Việt';
    return 'Tài chính';
}

export default function AdminLibraryPage() {
    const router = useRouter();
    const { fullStorage, updateFullStorage, isInitialized } = useProgress();
    const [skillForm, setSkillForm] = useState(INITIAL_SKILL_FORM);
    const [questionForm, setQuestionForm] = useState(INITIAL_QUESTION_FORM);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        if (!isInitialized) return;
        if (!hasActiveAdminSession()) {
            clearAdminSession();
            router.replace('/admin?next=/admin/library');
            return;
        }
        touchAdminSession();
    }, [isInitialized, router]);

    const customLibrary = useMemo(
        () => normalizeContentLibrary(fullStorage?.customContentLibrary || createEmptyContentLibrary()),
        [fullStorage?.customContentLibrary]
    );
    const courses = getAllCourses();
    const allSkills = useMemo(
        () =>
            courses.flatMap((course) =>
                course.topics.flatMap((topic) =>
                    topic.skills.map((skill) => ({ subjectId: course.id, topicId: topic.id, topicName: topic.name, skill }))
                )
            ),
        [courses]
    );
    const totalCustomQuestions = customLibrary.skills.reduce(
        (sum, entry) => sum + Object.values(entry.questions).reduce((inner, questions) => inner + questions.length, 0),
        0
    );

    const showMessage = (next: { type: 'success' | 'error'; text: string }) => {
        setMessage(next);
        window.clearTimeout((showMessage as unknown as { timer?: number }).timer);
        (showMessage as unknown as { timer?: number }).timer = window.setTimeout(() => setMessage(null), 3000);
    };

    const handleExportLibrary = async () => {
        if (!fullStorage) return;
        setIsExporting(true);
        try {
            const [{ COURSES }, { STATIC_QUESTION_BANK }] = await Promise.all([import('@/lib/content/registry'), import('@/lib/content/static')]);
            const exportPayload = buildLibraryExport(Object.values(COURSES), STATIC_QUESTION_BANK, fullStorage.customContentLibrary);
            downloadWordFile(`thu-vien-math-mastery-${new Date().toISOString().slice(0, 10)}.docx`, buildLibraryWordDocument(exportPayload));
            showMessage({ type: 'success', text: 'Đã xuất toàn bộ thư viện ra file .docx.' });
        } catch (error) {
            console.error(error);
            showMessage({ type: 'error', text: 'Xuất thư viện thất bại.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        downloadWordFile('mau-nhap-thu-vien-math-mastery.docx', buildLibraryTemplateWordDocument());
        showMessage({ type: 'success', text: 'Đã tải file mẫu .docx.' });
    };

    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullStorage) return;
        const cleanSkillId = skillForm.skillId.trim();
        if (!skillForm.topicId.trim() || !skillForm.topicName.trim() || !cleanSkillId || !skillForm.skillName.trim()) {
            showMessage({ type: 'error', text: 'Vui lòng nhập đủ thông tin skill.' });
            return;
        }
        const alreadyInCustom = customLibrary.skills.some((entry) => entry.skill.id === cleanSkillId);
        const existsInBuiltIn = allSkills.some(({ skill }) => skill.id === cleanSkillId) && !alreadyInCustom;
        if (existsInBuiltIn) {
            showMessage({ type: 'error', text: 'Skill ID đã tồn tại trong thư viện gốc.' });
            return;
        }
        const nextSkill: Skill = {
            id: cleanSkillId,
            name: skillForm.skillName.trim(),
            description: skillForm.description.trim() || undefined,
            tier: skillForm.tier,
            grade: skillForm.grade,
            semester: skillForm.semester,
            instructions: skillForm.instructions.trim() || undefined,
        };
        const nextLibrary = upsertSkillInLibrary(customLibrary, {
            subjectId: skillForm.subjectId,
            topicId: skillForm.topicId.trim(),
            topicName: skillForm.topicName.trim(),
            skill: nextSkill,
        });
        updateFullStorage({ ...fullStorage, customContentLibrary: nextLibrary });
        setSkillForm((prev) => ({ ...INITIAL_SKILL_FORM, subjectId: prev.subjectId }));
        setQuestionForm((prev) => ({ ...prev, skillId: cleanSkillId }));
        showMessage({ type: 'success', text: 'Đã thêm skill mới.' });
    };

    const handleAddQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullStorage) return;
        const selectedSkill = findSkillDefinition(courses, questionForm.skillId.trim());
        if (!selectedSkill) {
            showMessage({ type: 'error', text: 'Không tìm thấy skill.' });
            return;
        }
        if (!questionForm.text.trim() || !questionForm.answer.trim()) {
            showMessage({ type: 'error', text: 'Câu hỏi và đáp án là bắt buộc.' });
            return;
        }
        let extraContent: Record<string, unknown> = {};
        if (questionForm.extraContentJson.trim()) {
            try {
                extraContent = JSON.parse(questionForm.extraContentJson) as Record<string, unknown>;
            } catch {
                showMessage({ type: 'error', text: 'Extra JSON chưa hợp lệ.' });
                return;
            }
        }
        const optionList = questionForm.options.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
        if ((questionForm.type === 'mcq' || questionForm.type === 'listening') && optionList.length < 2) {
            showMessage({ type: 'error', text: 'MCQ hoặc listening cần ít nhất 2 lựa chọn.' });
            return;
        }
        const question: Question = {
            id: `custom-${questionForm.skillId.trim()}-${Date.now()}`,
            subjectId: selectedSkill.subjectId,
            skillId: questionForm.skillId.trim(),
            type: questionForm.type,
            instruction: questionForm.instruction.trim() || 'Làm bài tập sau:',
            content: { text: questionForm.text.trim(), ...(optionList.length > 0 ? { options: optionList } : {}), ...extraContent },
            answer: questionForm.answer.trim(),
            hint: questionForm.hint.trim() || undefined,
            explanation: questionForm.explanation.trim() || undefined,
        };
        const nextLibrary = addQuestionToLibrary(customLibrary, selectedSkill, Number(questionForm.level), question);
        updateFullStorage({ ...fullStorage, customContentLibrary: nextLibrary });
        setQuestionForm((prev) => ({ ...INITIAL_QUESTION_FORM, skillId: prev.skillId, level: prev.level, type: prev.type }));
        showMessage({ type: 'success', text: 'Đã thêm câu hỏi mới.' });
    };

    const handleImportWordFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!fullStorage) return;
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        try {
            const imported = await parseLibraryWordDocument(await file.arrayBuffer());
            if (imported.skills.length === 0 && imported.questions.length === 0) {
                showMessage({ type: 'error', text: 'Không đọc được file .docx mẫu.' });
                return;
            }
            let workingLibrary = customLibrary;
            imported.skills.forEach((row) => {
                const alreadyInCustom = workingLibrary.skills.some((entry) => entry.skill.id === row.skill.id);
                const existsInBuiltIn = allSkills.some(({ skill }) => skill.id === row.skill.id) && !alreadyInCustom;
                if (!existsInBuiltIn) {
                    workingLibrary = upsertSkillInLibrary(workingLibrary, row);
                }
            });
            const mergedCourses = mergeCustomLibraryIntoCourses(courses, workingLibrary);
            let importedQuestionCount = 0;
            imported.questions.forEach((row) => {
                const selectedSkill = findSkillDefinition(mergedCourses, row.skillId);
                if (!selectedSkill) return;
                workingLibrary = addQuestionToLibrary(workingLibrary, selectedSkill, row.level, {
                    ...row.question,
                    subjectId: selectedSkill.subjectId,
                    skillId: selectedSkill.skill.id,
                });
                importedQuestionCount += 1;
            });
            updateFullStorage({ ...fullStorage, customContentLibrary: workingLibrary });
            showMessage({ type: 'success', text: `Đã nhập ${imported.skills.length} skill và ${importedQuestionCount} câu hỏi từ file .docx.` });
        } catch (error) {
            console.error(error);
            showMessage({ type: 'error', text: 'Nhập file .docx thất bại.' });
        } finally {
            setIsImporting(false);
            e.target.value = '';
        }
    };

    if (!isInitialized) {
        return <div className="flex min-h-screen items-center justify-center bg-slate-50 font-bold text-slate-500">Đang tải thư viện...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900">Thư viện nội dung</h1>
                            <p className="font-medium text-slate-500">Xuất toàn bộ thư viện và thêm skill, câu hỏi bằng form hoặc file mẫu .docx.</p>
                        </div>
                    </div>
                    <Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-600">
                        <ArrowLeft size={18} />
                        Quay lại
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">Skill custom</div><div className="mt-2 text-4xl font-black text-slate-900">{customLibrary.skills.length}</div></div>
                    <div className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">Câu hỏi custom</div><div className="mt-2 text-4xl font-black text-slate-900">{totalCustomQuestions}</div></div>
                    <div className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">Tổng skill hệ thống</div><div className="mt-2 text-4xl font-black text-slate-900">{allSkills.length}</div></div>
                </div>

                <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <button onClick={handleExportLibrary} disabled={isExporting} className="rounded-3xl bg-indigo-600 px-5 py-5 text-left text-white">
                            <Download size={22} className="mb-3" />
                            <div className="font-black">{isExporting ? 'Đang xuất...' : 'Xuất toàn bộ thư viện'}</div>
                            <div className="mt-1 text-sm font-medium text-indigo-100">File .docx</div>
                        </button>
                        <button onClick={handleDownloadTemplate} className="rounded-3xl bg-emerald-600 px-5 py-5 text-left text-white">
                            <FileText size={22} className="mb-3" />
                            <div className="font-black">Tải file mẫu .docx</div>
                        </button>
                        <label className="cursor-pointer rounded-3xl bg-amber-500 px-5 py-5 text-left text-white">
                            <Upload size={22} className="mb-3" />
                            <div className="font-black">{isImporting ? 'Đang nhập...' : 'Nhập từ file .docx'}</div>
                            <input type="file" accept=".docx,.doc,.html,.htm" className="hidden" onChange={handleImportWordFile} disabled={isImporting} />
                        </label>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Hãy dùng đúng file mẫu `.docx` của hệ thống. File cũ vẫn được hỗ trợ để chuyển tiếp, nhưng định dạng chuẩn hiện tại là `.docx`.</div>
                </div>

                {message && <div className={`rounded-2xl border px-5 py-4 text-sm font-bold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{message.text}</div>}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <form onSubmit={handleAddSkill} className="space-y-4 rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100">
                        <h2 className="text-xl font-black text-slate-900">Thêm skill mới</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <select className={INPUT_CLASS} value={skillForm.subjectId} onChange={(e) => setSkillForm((prev) => ({ ...prev, subjectId: e.target.value as SubjectId }))}><option value="math">Toán</option><option value="english">Tiếng Anh</option><option value="vietnamese">Tiếng Việt</option><option value="finance">Tài chính</option></select>
                            <input className={INPUT_CLASS} value={skillForm.topicId} onChange={(e) => setSkillForm((prev) => ({ ...prev, topicId: e.target.value }))} placeholder="Topic ID" />
                            <input className={INPUT_CLASS} value={skillForm.topicName} onChange={(e) => setSkillForm((prev) => ({ ...prev, topicName: e.target.value }))} placeholder="Tên chủ đề" />
                            <input className={INPUT_CLASS} value={skillForm.skillId} onChange={(e) => setSkillForm((prev) => ({ ...prev, skillId: e.target.value }))} placeholder="Skill ID" />
                            <input className={INPUT_CLASS} value={skillForm.skillName} onChange={(e) => setSkillForm((prev) => ({ ...prev, skillName: e.target.value }))} placeholder="Tên skill" />
                            <select className={INPUT_CLASS} value={skillForm.tier} onChange={(e) => setSkillForm((prev) => ({ ...prev, tier: Number(e.target.value) as 1 | 2 | 3 }))}><option value={1}>Tier 1</option><option value={2}>Tier 2</option><option value={3}>Tier 3</option></select>
                            <select className={INPUT_CLASS} value={skillForm.grade} onChange={(e) => setSkillForm((prev) => ({ ...prev, grade: Number(e.target.value) as 2 | 3 }))}><option value={2}>Lớp 2</option><option value={3}>Lớp 3</option></select>
                            <select className={INPUT_CLASS} value={skillForm.semester} onChange={(e) => setSkillForm((prev) => ({ ...prev, semester: Number(e.target.value) as 1 | 2 }))}><option value={1}>Học kỳ 1</option><option value={2}>Học kỳ 2</option></select>
                        </div>
                        <textarea className={`${INPUT_CLASS} min-h-24`} value={skillForm.description} onChange={(e) => setSkillForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Mô tả" />
                        <textarea className={`${INPUT_CLASS} min-h-28`} value={skillForm.instructions} onChange={(e) => setSkillForm((prev) => ({ ...prev, instructions: e.target.value }))} placeholder="Hướng dẫn" />
                        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white"><PlusCircle size={18} />Thêm skill</button>
                    </form>

                    <form onSubmit={handleAddQuestion} className="space-y-4 rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100">
                        <h2 className="text-xl font-black text-slate-900">Thêm câu hỏi</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input className={INPUT_CLASS} value={questionForm.skillId} onChange={(e) => setQuestionForm((prev) => ({ ...prev, skillId: e.target.value }))} placeholder="Skill ID" />
                            <input className={INPUT_CLASS} type="number" min={1} max={10} value={questionForm.level} onChange={(e) => setQuestionForm((prev) => ({ ...prev, level: Number(e.target.value) || 1 }))} placeholder="Level" />
                            <select className={INPUT_CLASS} value={questionForm.type} onChange={(e) => setQuestionForm((prev) => ({ ...prev, type: e.target.value as QuestionType }))}><option value="mcq">mcq</option><option value="input">input</option><option value="speaking">speaking</option><option value="listening">listening</option><option value="reading">reading</option><option value="drag-drop">drag-drop</option><option value="match">match</option><option value="drawing">drawing</option></select>
                            <input className={INPUT_CLASS} value={questionForm.instruction} onChange={(e) => setQuestionForm((prev) => ({ ...prev, instruction: e.target.value }))} placeholder="Instruction" />
                        </div>
                        <textarea className={`${INPUT_CLASS} min-h-28`} value={questionForm.text} onChange={(e) => setQuestionForm((prev) => ({ ...prev, text: e.target.value }))} placeholder="Nội dung câu hỏi" />
                        <input className={INPUT_CLASS} value={questionForm.answer} onChange={(e) => setQuestionForm((prev) => ({ ...prev, answer: e.target.value }))} placeholder="Đáp án chuẩn" />
                        <textarea className={`${INPUT_CLASS} min-h-24`} value={questionForm.options} onChange={(e) => setQuestionForm((prev) => ({ ...prev, options: e.target.value }))} placeholder="Lựa chọn, mỗi dòng hoặc dấu phẩy" />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <textarea className={`${INPUT_CLASS} min-h-24`} value={questionForm.hint} onChange={(e) => setQuestionForm((prev) => ({ ...prev, hint: e.target.value }))} placeholder="Gợi ý" />
                            <textarea className={`${INPUT_CLASS} min-h-24`} value={questionForm.explanation} onChange={(e) => setQuestionForm((prev) => ({ ...prev, explanation: e.target.value }))} placeholder="Giải thích" />
                        </div>
                        <textarea className={`${INPUT_CLASS} min-h-24 font-mono text-sm`} value={questionForm.extraContentJson} onChange={(e) => setQuestionForm((prev) => ({ ...prev, extraContentJson: e.target.value }))} placeholder='Extra JSON: {"audio":"..."}' />
                        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white"><PlusCircle size={18} />Thêm câu hỏi</button>
                    </form>
                </div>

                <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100">
                    <h2 className="mb-4 text-xl font-black text-slate-900">Nội dung custom hiện có</h2>
                    {customLibrary.skills.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-slate-500">Chưa có skill custom nào.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {customLibrary.skills.map((entry) => {
                                const summary = buildSkillSummary(entry);
                                return (
                                    <div key={entry.skill.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">{getSubjectLabel(entry.subjectId)} • {entry.topicName}</div>
                                        <div className="text-lg font-black text-slate-900">{entry.skill.name}</div>
                                        <div className="text-sm text-slate-500">{entry.skill.id}</div>
                                        <div className="mt-3 text-sm text-slate-600">{summary.questionCount} câu hỏi • Level {summary.levels.length > 0 ? summary.levels.join(', ') : 'chưa có'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
