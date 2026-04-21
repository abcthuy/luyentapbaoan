
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Database, Download, RefreshCw, Save, Upload } from "lucide-react";
import { clearAdminSession, hasActiveAdminSession, touchAdminSession } from "@/lib/admin-session";
import { useProgress } from "@/components/progress-provider";
import { buildLibraryTemplateWordDocument, parseLibraryWordDocument } from "@/lib/content/library-word";
import { validateImportedQuestionBySubject } from "@/lib/content/import-rules";
import { SUPPORTED_GRADES } from "@/lib/grades";
import { normalizeDisplayText } from "@/lib/text";

const SKILL_LABELS: Record<string, string> = {
    A1: normalizeDisplayText('Cấu tạo số và so sánh'),
    A2: normalizeDisplayText('Cộng trừ trong phạm vi 1000'),
    A3: normalizeDisplayText('Điền số còn thiếu'),
    A4: normalizeDisplayText('Nhân chia bảng 2 và 5'),
    B1: normalizeDisplayText('Toán có lời văn 1 bước'),
    B2: normalizeDisplayText('Toán có lời văn 2 bước'),
    C1: normalizeDisplayText('Độ dài và đường gấp khúc'),
    C2: normalizeDisplayText('Xem giờ và thời gian'),
    D1: normalizeDisplayText('Nhận biết hình học'),
    D2: normalizeDisplayText('Biểu đồ tranh và bảng'),
    E1: normalizeDisplayText('Quy luật dãy số'),
    E2: normalizeDisplayText('Bảng ô số hàng cột'),
    E3: normalizeDisplayText('Thập số'),
    'eng-hello': normalizeDisplayText('Greetings (Chào hỏi)'),
    'eng-colors': normalizeDisplayText('Colors (Màu sắc)'),
    'eng-school': normalizeDisplayText('School (Trường học)'),
    'eng-phonics-a': normalizeDisplayText('Letter A'),
    'eng-phonics-b': normalizeDisplayText('Letter B'),
    'eng-family': normalizeDisplayText('Family (Gia đình)'),
    "eng-qa-name": normalizeDisplayText("What's your name?"),
    'eng-phonics-c': normalizeDisplayText('Letter C'),
    'eng2-list': normalizeDisplayText('Listening: Colors & Numbers'),
    'eng2-read': normalizeDisplayText('Reading: Short Sentences'),
    'eng2-write': normalizeDisplayText('Writing: Simple Words'),
    'eng-animals': normalizeDisplayText('Animals (Động vật)'),
    "eng-qa-this-that": normalizeDisplayText("What's this/that?"),
    'eng2-speak': normalizeDisplayText('Speaking: Introduce Yourself'),
    'tv2-tu-ngu': normalizeDisplayText('Từ chỉ sự vật, hoạt động, đặc điểm'),
    'tv2-cau': normalizeDisplayText('Câu giới thiệu, câu nêu hoạt động'),
    'tv2-doc-hieu': normalizeDisplayText('Đọc hiểu văn bản ngắn'),
    'tv2-dau-cau': normalizeDisplayText('Dấu chấm, phẩy, chấm hỏi'),
    'tv2-tho': normalizeDisplayText('Đọc thơ và ca dao'),
    'tv2-doc-dien-cam': normalizeDisplayText('Đọc diễn cảm'),
    'tv2-chinh-ta': normalizeDisplayText('Phân biệt tr/ch, s/x, r/d/gi'),
    'tv2-noi-nghe': normalizeDisplayText('Kể lại việc đã làm'),
    'tv2-ke-chuyen': normalizeDisplayText('Việt: Kể chuyện theo tranh'),
    'tv2-ta-nguoi': normalizeDisplayText('Việt: Tả người thân'),
    'tv2-thuyet-trinh': normalizeDisplayText('Giới thiệu đồ vật/sách'),
    C3: normalizeDisplayText('Nhận biết tiền Việt Nam'),
    'identify-money': normalizeDisplayText('Nhận biết tờ tiền cơ bản'),
    'compare-value': normalizeDisplayText('So sánh giá trị tiền'),
    'money-sum': normalizeDisplayText('Cộng tiền đơn giản'),
    'fin2-shopping': normalizeDisplayText('Đi chợ: Tính tiền 2 món'),
    'shopping-math': normalizeDisplayText('Đi chợ thông minh'),
    'need-vs-want': normalizeDisplayText('Cần hay Muốn?'),
    'saving-goal': normalizeDisplayText('Đặt mục tiêu tiết kiệm'),
    'fin2-saving': normalizeDisplayText('Heo đất: Tập tiết kiệm'),
    'job-value': normalizeDisplayText('Nghề nghiệp và thu nhập'),
    'saving-pig': normalizeDisplayText('Nuôi heo đất cơ bản'),
};
function getSkillDisplayName(skill: any) {
    const key = skill?.skill_code || skill?.legacySkillId || skill?.id || '';
    return SKILL_LABELS[key] || skill?.name || key;
}

const IMPORT_PLACEHOLDER = `[
  {
    "difficultyLevel": 2,
    "questionType": "mcq",
    "qualityStatus": "approved",
    "content": {
      "instruction": "Chọn đáp án đúng:",
      "text": "5.000 đồng lớn hơn hay nhỏ hơn 2.000 đồng?",
      "options": ["Lớn hơn", "Nhỏ hơn"]
    },
    "canonicalAnswer": "Lớn hơn"
  }
]`;
const QUESTION_TYPES_REQUIRING_OPTIONS = new Set(["mcq"]);

function normalizeComparisonValue(value: string) {
    return String(value || "").trim().toLowerCase();
}

function validateImportedWordRow(params: {
    row: any;
    rowIndex: number;
    targetSkill: any;
    currentSubjectId: string;
    existingKeys: Set<string>;
    seenKeysInFile: Set<string>;
}) {
    const { row, rowIndex, targetSkill, currentSubjectId, existingKeys, seenKeysInFile } = params;
    const issues: string[] = [];
    const warnings: string[] = [];
    const questionText = String(row.question?.content?.text || "").trim();
    const answer = String(row.question?.answer || "").trim();
    const questionType = String(row.question?.type || "input").trim();
    const subjectId = String(row.question?.subjectId || currentSubjectId).trim();
    const level = Number(row.level || 1);
    const options = Array.isArray(row.question?.content?.options)
        ? row.question.content.options.map((item: unknown) => String(item || "").trim()).filter(Boolean)
        : [];
    const duplicateKey = `${normalizeComparisonValue(questionText)}::${normalizeComparisonValue(answer)}`;
    const allowedTypes = Array.isArray(targetSkill?.question_types)
        ? targetSkill.question_types.map((item: unknown) => String(item || ""))
        : [];
    const levelMin = Number(targetSkill?.mapping?.level_min || 1);
    const levelMax = Number(targetSkill?.mapping?.level_max || 5);

    if (!questionText || !answer) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex}: ${normalizeDisplayText('thiếu nội dung câu hỏi hoặc đáp án')}.`);
        return { issues, warnings, duplicateKey };
    }

    if (subjectId !== currentSubjectId) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('môn trong file là')} ${subjectId}, ${normalizeDisplayText('không khớp với môn đang chọn')} ${currentSubjectId}.`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(questionType)) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('loại câu hỏi')} ${questionType} ${normalizeDisplayText('không nằm trong cấu hình của skill')}.`);
    }

    if (!Number.isFinite(level) || level < levelMin || level > levelMax) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): level ${row.level} ${normalizeDisplayText('nằm ngoài phạm vi')} ${levelMin}-${levelMax}.`);
    }

    if (QUESTION_TYPES_REQUIRING_OPTIONS.has(questionType) && options.length < 2) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('câu hỏi')} ${questionType} ${normalizeDisplayText('cần ít nhất 2 lựa chọn')}.`);
    }

    if (QUESTION_TYPES_REQUIRING_OPTIONS.has(questionType) && options.length > 0) {
        const normalizedOptions = new Set(options.map(normalizeComparisonValue));
        if (!normalizedOptions.has(normalizeComparisonValue(answer))) {
            issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('đáp án chuẩn không nằm trong danh sách lựa chọn')}.`);
        }
    }

    if (seenKeysInFile.has(duplicateKey)) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('câu hỏi bị trùng ngay trong file Word')}.`);
    }

    if (existingKeys.has(duplicateKey)) {
        issues.push(`${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${normalizeDisplayText('câu hỏi bị trùng với dữ liệu đã có')}.`);
    }

    const subjectIssues = validateImportedQuestionBySubject({
        subjectId: currentSubjectId as any,
        grade: Number(targetSkill?.grade || 2),
        skillCode: targetSkill.skill_code,
        questionType,
        text: questionText,
        answer,
        options,
    });

    subjectIssues.forEach((issue) => {
        const message = `${normalizeDisplayText('Dòng')} ${rowIndex} (${targetSkill.skill_code}): ${issue.message}`;
        if (issue.severity === "error") {
            issues.push(message);
            return;
        }
        warnings.push(message);
    });

    return { issues, warnings, duplicateKey };
}

async function postAdminJson(url: string, payload: Record<string, unknown>) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : normalizeDisplayText("Yêu cầu thất bại"));
    return data;
}

function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
function jsonText(value: unknown) {
    return JSON.stringify(value || {}, null, 2);
}

function pickExtra(content: Record<string, unknown>) {
    const { text: _text, options: _options, instruction: _instruction, hint: _hint, subjectId: _subjectId, ...rest } = content;
    return rest;
}

function buildQuestionDraft(question?: any) {
    const content = question?.content || {};
    const options = Array.isArray(content.options) ? content.options.map((item: unknown) => String(item || "")).filter(Boolean) : [];
    return {
        questionId: question?.id || "",
        questionSourceId: question?.question_source_id || "",
        templateId: question?.template_id || "",
        legacyQuestionId: question?.legacy_question_id || "",
        difficultyLevel: question?.difficulty_level || 1,
        stage: question?.stage || "",
        questionType: question?.question_type || "mcq",
        qualityStatus: question?.quality_status || "draft",
        instruction: typeof content.instruction === "string" ? content.instruction : normalizeDisplayText("Chọn đáp án đúng:"),
        text: typeof content.text === "string" ? content.text : "",
        answer: question?.canonical_answer || "",
        optionsText: options.join("\n"),
        hint: typeof content.hint === "string" ? content.hint : "",
        explanation: question?.explanation || "",
        tagsText: Array.isArray(question?.tags) ? question.tags.join(", ") : "",
        extraContentText: jsonText(pickExtra(content)),
    };
}

function QuestionEditor({ draft, onChange, sources, templates }: { draft: any; onChange: (updater: (value: any) => any) => void; sources: any[]; templates: any[] }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Nguồn')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.questionSourceId} onChange={(e) => onChange((current: any) => ({ ...current, questionSourceId: e.target.value }))}><option value="">{normalizeDisplayText('Không gắn nguồn')}</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Template')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.templateId} onChange={(e) => onChange((current: any) => ({ ...current, templateId: e.target.value }))}><option value="">{normalizeDisplayText('Không gắn template')}</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.code}</option>)}</select></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Loại câu hỏi')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.questionType} onChange={(e) => onChange((current: any) => ({ ...current, questionType: e.target.value }))}><option value="mcq">mcq</option><option value="input">input</option><option value="reading">reading</option><option value="speaking">speaking</option><option value="listening">listening</option></select></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Độ khó')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" type="number" min={1} max={10} value={draft.difficultyLevel} onChange={(e) => onChange((current: any) => ({ ...current, difficultyLevel: Number(e.target.value) || 1 }))} /></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Stage')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.stage} onChange={(e) => onChange((current: any) => ({ ...current, stage: e.target.value }))}><option value="">{normalizeDisplayText('Không gắn stage')}</option><option value="foundation">foundation</option><option value="core">core</option><option value="mixed">mixed</option><option value="challenge">challenge</option></select></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Trạng thái')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.qualityStatus} onChange={(e) => onChange((current: any) => ({ ...current, qualityStatus: e.target.value }))}><option value="draft">draft</option><option value="approved">approved</option><option value="disabled">disabled</option></select></label>
            </div>
            <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Hướng dẫn')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.instruction} onChange={(e) => onChange((current: any) => ({ ...current, instruction: e.target.value }))} /></label>
            <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Nội dung câu hỏi')}</div><textarea className="min-h-24 w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800" value={draft.text} onChange={(e) => onChange((current: any) => ({ ...current, text: e.target.value }))} /></label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Đáp án chuẩn')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.answer} onChange={(e) => onChange((current: any) => ({ ...current, answer: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Gợi ý')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.hint} onChange={(e) => onChange((current: any) => ({ ...current, hint: e.target.value }))} /></label>
            </div>
            <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Lựa chọn')}</div><textarea className="min-h-24 w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800" value={draft.optionsText} onChange={(e) => onChange((current: any) => ({ ...current, optionsText: e.target.value }))} /></label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Thẻ')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.tagsText} onChange={(e) => onChange((current: any) => ({ ...current, tagsText: e.target.value }))} /></label>
                <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Legacy ID')}</div><input className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={draft.legacyQuestionId} onChange={(e) => onChange((current: any) => ({ ...current, legacyQuestionId: e.target.value }))} /></label>
            </div>
            <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Giải thích')}</div><textarea className="min-h-20 w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800" value={draft.explanation} onChange={(e) => onChange((current: any) => ({ ...current, explanation: e.target.value }))} /></label>
            <label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Extra content (JSON)')}</div><textarea className="min-h-24 w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-800" value={draft.extraContentText} onChange={(e) => onChange((current: any) => ({ ...current, extraContentText: e.target.value }))} /></label>
        </div>
    );
}

export default function AdminQuestionSourcesPage() {
    const router = useRouter();
    const { storage, isInitialized } = useProgress();
    const [payload, setPayload] = useState<any>(null);
    const [mappingDrafts, setMappingDrafts] = useState<Record<string, any>>({});
    const [templateDrafts, setTemplateDrafts] = useState<Record<string, any>>({});
    const [questionDrafts, setQuestionDrafts] = useState<Record<string, any>>({});
    const [importDrafts, setImportDrafts] = useState<Record<string, string>>({});
    const [selectedSkillId, setSelectedSkillId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingId, setIsSavingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [importIssues, setImportIssues] = useState<string[]>([]);
    const [grade, setGrade] = useState<2 | 3 | 4 | 5>(2);
    const [subjectId, setSubjectId] = useState<"math" | "english" | "vietnamese" | "finance">("math");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [importPreview, setImportPreview] = useState<{
        fileName: string;
        rows: any[];
        validRows: { row: any; targetSkill: any; duplicateKey: string }[];
        issueLines: string[];
        warningLines: string[];
    } | null>(null);
    const [jsonImportPreview, setJsonImportPreview] = useState<{
        skillId: string;
        rows: any[];
        report: any;
    } | null>(null);

    useEffect(() => {
        if (!isInitialized) return;
        const isAuthorized = Boolean(storage?.adminAccount?.pin) && hasActiveAdminSession();
        if (!isAuthorized) {
            clearAdminSession();
            router.replace("/admin");
            return;
        }
        touchAdminSession();
    }, [isInitialized, router, storage]);

    const adminUsername = storage?.adminAccount?.username?.trim() || "";
    const adminSyncId = typeof window !== "undefined" ? localStorage.getItem("math_sync_id")?.trim() || "" : "";
    const sourceOptions = useMemo(() => payload?.sources || [], [payload]);

    const subjectLabel = subjectId === "math"
        ? `${normalizeDisplayText('Toán lớp')} ${grade}`
        : subjectId === "english"
            ? `${normalizeDisplayText('Tiếng Anh lớp')} ${grade}`
            : subjectId === "vietnamese"
                ? `${normalizeDisplayText('Tiếng Việt lớp')} ${grade}`
                : `${normalizeDisplayText('Tài chính lớp')} ${grade}`;
    const selectedSkill = useMemo(() => (payload?.skills || []).find((skill: any) => skill.id === selectedSkillId) || null, [payload, selectedSkillId]);

    const resetViewState = () => {
        setPayload(null);
        setSelectedSkillId("");
        setMessage("");
        setImportIssues([]);
        setImportPreview(null);
        setJsonImportPreview(null);
        setIsCreateModalOpen(false);
    };

    const getAdminPayload = () => {
        if (!adminUsername || !adminSyncId) {
            alert(normalizeDisplayText("Không tìm thấy thông tin admin hiện tại."));
            return null;
        }
        const pin = storage?.adminAccount?.pin?.trim() || "";
        if (!pin) return null;
        return { syncId: adminSyncId, username: adminUsername, pin };
    };

    const loadConfig = async () => {
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;
        try {
            setIsLoading(true);
            const response = await postAdminJson("/api/admin/question-sources/list", { ...adminPayload, subjectId, grade }) as any;
            const skills = response.payload.skills || [];
            const nextMappings: Record<string, any> = {};
            const nextTemplates: Record<string, any> = {};
            const nextQuestions: Record<string, any> = {};
            const nextImports: Record<string, string> = {};
            skills.forEach((skill: any) => {
                nextMappings[skill.id] = {
                    mappingId: skill.mapping?.id,
                    questionSourceId: skill.mapping?.question_source_id || "",
                    priority: skill.mapping?.priority || 1,
                    isPrimary: skill.mapping?.is_primary ?? true,
                    levelMin: skill.mapping?.level_min || 1,
                    levelMax: skill.mapping?.level_max || 5,
                    allowedModes: skill.mapping?.allowed_modes || ["core", "review", "mixed"],
                    configText: jsonText(skill.mapping?.config_override),
                };
                (skill.templates || []).forEach((template: any) => {
                    nextTemplates[template.id] = {
                        title: template.title,
                        difficultyLevel: template.difficulty_level,
                        stage: template.stage || "",
                        answerStrategy: template.answer_strategy,
                        promptTemplate: template.prompt_template || "",
                        metadataText: jsonText(template.metadata),
                        isActive: template.is_active !== false,
                    };
                });
                (skill.questionBank || []).forEach((question: any) => { nextQuestions[question.id] = buildQuestionDraft(question); });
                nextQuestions[`new:${skill.id}`] = buildQuestionDraft();
                nextImports[skill.id] = IMPORT_PLACEHOLDER;
            });
            setPayload(response.payload);
            setMappingDrafts(nextMappings);
            setTemplateDrafts(nextTemplates);
            setQuestionDrafts(nextQuestions);
            setImportDrafts(nextImports);
            setSelectedSkillId(skills[0]?.id || "");
            setMessage(normalizeDisplayText("Đã tải dữ liệu."));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : normalizeDisplayText("Không thể tải dữ liệu."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isInitialized) return;
        if (!storage?.adminAccount?.pin || !hasActiveAdminSession()) return;
        void loadConfig();
    }, [grade, isInitialized, storage?.adminAccount?.pin, subjectId]);

    const saveMapping = async () => {
        if (!selectedSkill) return;
        const draft = mappingDrafts[selectedSkill.id];
        if (!draft?.questionSourceId) return alert(normalizeDisplayText("Vui lòng chọn nguồn câu hỏi."));
        if (!draft.allowedModes?.length) return alert(normalizeDisplayText("Vui lòng chọn ít nhất 1 chế độ học."));
        let configOverride = {};
        try { configOverride = draft.configText.trim() ? JSON.parse(draft.configText) : {}; } catch { return alert(normalizeDisplayText("Config override JSON chưa hợp lệ.")); }
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;
        try {
            setIsSavingId(`source:${selectedSkill.id}`);
            await postAdminJson("/api/admin/question-sources/update", { ...adminPayload, mappingId: draft.mappingId, curriculumSkillId: selectedSkill.id, questionSourceId: draft.questionSourceId, priority: draft.priority, isPrimary: draft.isPrimary, levelMin: draft.levelMin, levelMax: draft.levelMax, allowedModes: draft.allowedModes, configOverride });
            await loadConfig();
            setSelectedSkillId(selectedSkill.id);
            setMessage(normalizeDisplayText(`Đã lưu nguồn cho ${selectedSkill.skill_code}.`));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : normalizeDisplayText("Không thể lưu mapping."));
        } finally {
            setIsSavingId(null);
        }
    };

    const saveTemplate = async (templateId: string) => {
        const draft = templateDrafts[templateId];
        if (!draft?.title?.trim()) return alert(normalizeDisplayText("Tên template không được để trống."));
        let metadata = {};
        try { metadata = draft.metadataText.trim() ? JSON.parse(draft.metadataText) : {}; } catch { return alert(normalizeDisplayText("Template metadata JSON chưa hợp lệ.")); }
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;
        try {
            setIsSavingId(`template:${templateId}`);
            await postAdminJson("/api/admin/question-templates/update", { ...adminPayload, templateId, title: draft.title, difficultyLevel: draft.difficultyLevel, stage: draft.stage || null, promptTemplate: draft.promptTemplate || null, answerStrategy: draft.answerStrategy, metadata, isActive: draft.isActive });
            await loadConfig();
            setSelectedSkillId(selectedSkillId);
            setMessage(normalizeDisplayText("Đã lưu template."));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : normalizeDisplayText("Không thể lưu template."));
        } finally {
            setIsSavingId(null);
        }
    };

    const saveQuestion = async (draftKey: string) => {
        if (!selectedSkill) return;
        const draft = questionDrafts[draftKey];
        if (!draft?.text?.trim() || !draft?.answer?.trim()) return alert(normalizeDisplayText("Nội dung câu hỏi và đáp án là bắt buộc."));
        let extraContent = {};
        try { extraContent = draft.extraContentText.trim() ? JSON.parse(draft.extraContentText) : {}; } catch { return alert(normalizeDisplayText("Extra content JSON chưa hợp lệ.")); }
        const options = draft.optionsText.split(/\r?\n|,/).map((item: string) => item.trim()).filter(Boolean);
        const content: Record<string, unknown> = { ...extraContent, instruction: draft.instruction.trim() || normalizeDisplayText("Làm bài tập sau:"), text: draft.text.trim(), hint: draft.hint.trim() || null, subjectId: payload?.curriculum.subject_id || subjectId };
        if (options.length > 0) content.options = options;
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;
        try {
            setIsSavingId(`question:${draftKey}`);
            await postAdminJson("/api/admin/question-bank/upsert", { ...adminPayload, questionId: draft.questionId || null, curriculumSkillId: selectedSkill.id, questionSourceId: draft.questionSourceId || null, templateId: draft.templateId || null, legacyQuestionId: draft.legacyQuestionId || null, difficultyLevel: draft.difficultyLevel, stage: draft.stage || null, questionType: draft.questionType, qualityStatus: draft.qualityStatus, canonicalAnswer: draft.answer.trim(), explanation: draft.explanation.trim() || null, tags: draft.tagsText.split(",").map((item: string) => item.trim()).filter(Boolean), content });
            await loadConfig();
            setSelectedSkillId(selectedSkill.id);
            setMessage(draft.questionId ? normalizeDisplayText("Đã cập nhật câu hỏi.") : normalizeDisplayText("Đã tạo câu hỏi mới."));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : normalizeDisplayText("Không thể lưu câu hỏi."));
        } finally {
            setIsSavingId(null);
        }
    };

    const downloadWordTemplate = () => {
        downloadBlob(
            "mau-nhap-cau-hoi.docx",
            buildLibraryTemplateWordDocument({
                subjectId: (payload?.curriculum?.subject_id || subjectId) as any,
                skills: (payload?.skills || []).map((skill: any) => ({
                    skillId: skill.skill_code,
                    skillName: getSkillDisplayName(skill),
                    topicId: skill.topic_id,
                    topicName: skill.topicName,
                    questionTypes: Array.isArray(skill.question_types) ? skill.question_types : undefined,
                    levelMin: Number(skill.mapping?.level_min || 1),
                    levelMax: Number(skill.mapping?.level_max || 3),
                })),
            })
        );
        setMessage(normalizeDisplayText("Đã tải file mẫu Word cho toàn bộ môn đang chọn."));
    };

    const importWordFile = async (file: File) => {
        if (!selectedSkill || !payload?.skills?.length) return;
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSavingId(`word:${selectedSkill.id}`);
            setImportIssues([]);
            const parsed = await parseLibraryWordDocument(await file.arrayBuffer());
            const importedRows = parsed.questions || [];
            if (importedRows.length === 0) {
                setMessage(normalizeDisplayText("File Word không có câu hỏi hợp lệ."));
                return;
            }

            const skillByCode = new Map<string, any>((payload.skills || []).map((skill: any) => [skill.skill_code, skill]));
            const existingKeysBySkillId = new Map<string, Set<string>>(
                (payload.skills || []).map((skill: any) => [
                    skill.id,
                    new Set(
                        (skill.questionBank || []).map((question: any) => {
                            const text = typeof question.content?.text === "string" ? question.content.text.trim().toLowerCase() : "";
                            const answer = String(question.canonical_answer || "").trim().toLowerCase();
                            return `${text}::${answer}`;
                        })
                    ),
                ])
            );

            const validRows: { row: any; targetSkill: any; duplicateKey: string }[] = [];
            const issueLines: string[] = [];
            const warningLines: string[] = [];
            const seenKeysInFileBySkillCode = new Map<string, Set<string>>();

            for (let index = 0; index < importedRows.length; index += 1) {
                const row = importedRows[index];
                const skillCode = String(row.skillId || row.question?.skillId || "").trim();
                const targetSkill: any = skillByCode.get(skillCode);
                if (!targetSkill) {
                    issueLines.push(`${normalizeDisplayText('Dòng')} ${index + 1}: ${normalizeDisplayText('không tìm thấy skill')} "${skillCode || normalizeDisplayText("(rỗng)")}" ${normalizeDisplayText('trong môn đang chọn')}.`);
                    continue;
                }

                const existingKeys: Set<string> = existingKeysBySkillId.get(targetSkill.id) || new Set<string>();
                const seenKeysInFile = seenKeysInFileBySkillCode.get(targetSkill.skill_code) || new Set<string>();
                const validation = validateImportedWordRow({
                    row,
                    rowIndex: index + 1,
                    targetSkill,
                    currentSubjectId: payload?.curriculum?.subject_id || subjectId,
                    existingKeys,
                    seenKeysInFile,
                });

                if (validation.issues.length > 0) {
                    issueLines.push(...validation.issues);
                    continue;
                }

                if (validation.warnings.length > 0) {
                    warningLines.push(...validation.warnings);
                }

                validRows.push({ row, targetSkill, duplicateKey: validation.duplicateKey });
                seenKeysInFile.add(validation.duplicateKey);
                seenKeysInFileBySkillCode.set(targetSkill.skill_code, seenKeysInFile);
            }

            // Show preview instead of importing immediately
            setImportPreview({
                fileName: file.name,
                rows: importedRows,
                validRows,
                issueLines,
                warningLines,
            });
            setMessage(normalizeDisplayText(`Đã phân tích file "${file.name}": ${validRows.length} câu hợp lệ, ${issueLines.length} câu lỗi. Vui lòng xác nhận để import.`));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Không thể đọc file Word.");
        } finally {
            setIsSavingId(null);
        }
    };

    const confirmImportPreview = async () => {
        if (!importPreview || importPreview.validRows.length === 0) return;
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSavingId('word:confirm');
            let imported = 0;
            let errors = 0;
            const errorLines: string[] = [];
            const touchedSkillIds = new Set<string>();

            for (const { row, targetSkill, duplicateKey } of importPreview.validRows) {
                try {
                    await postAdminJson("/api/admin/question-bank/upsert", {
                        ...adminPayload,
                        curriculumSkillId: targetSkill.id,
                        questionSourceId: targetSkill.mapping?.question_source_id || null,
                        templateId: null,
                        legacyQuestionId: null,
                        difficultyLevel: row.level || 1,
                        stage: row.stage || null,
                        questionType: row.question.type || "mcq",
                        qualityStatus: row.qualityStatus || "draft",
                        canonicalAnswer: row.question.answer,
                        explanation: row.question.explanation || null,
                        tags: [],
                        content: {
                            ...pickExtra((row.question.content || {}) as unknown as Record<string, unknown>),
                            instruction: row.question.instruction || "Lam bai tap sau:",
                            text: row.question.content?.text || "",
                            options: row.question.content?.options || undefined,
                            hint: row.question.hint || null,
                            subjectId: row.question.subjectId || payload?.curriculum.subject_id || subjectId,
                        },
                    });
                    imported += 1;
                    touchedSkillIds.add(targetSkill.id);
                } catch (error) {
                    errors += 1;
                    errorLines.push(`${normalizeDisplayText('Skill')} ${targetSkill.skill_code}: ${error instanceof Error ? error.message : normalizeDisplayText("lỗi import")}`);
                }
            }

            await loadConfig();
            setImportIssues([...importPreview.issueLines, ...errorLines]);
            setImportPreview(null);
            setMessage(normalizeDisplayText(`Import xong: ${imported} câu mới, ${errors} câu lỗi, ${touchedSkillIds.size} skill được cập nhật.`));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Lỗi khi import.");
        } finally {
            setIsSavingId(null);
        }
    };
    const buildJsonImportRows = (rows: any[]) => rows.map((row) => ({
        questionId: typeof row.questionId === "string" ? row.questionId : undefined,
        curriculumSkillId: selectedSkill?.id || "",
        questionSourceId: typeof row.questionSourceId === "string" ? row.questionSourceId : selectedSkill?.mapping?.question_source_id || null,
        templateId: typeof row.templateId === "string" ? row.templateId : null,
        legacyQuestionId: typeof row.legacyQuestionId === "string" ? row.legacyQuestionId : null,
        difficultyLevel: typeof row.difficultyLevel === "number" ? row.difficultyLevel : 1,
        stage: typeof row.stage === "string" ? row.stage : null,
        questionType: typeof row.questionType === "string" ? row.questionType : "mcq",
        qualityStatus: typeof row.qualityStatus === "string" ? row.qualityStatus : "draft",
        content: row.content && typeof row.content === "object" ? row.content : {},
        canonicalAnswer: typeof row.canonicalAnswer === "string" ? row.canonicalAnswer : "",
        explanation: typeof row.explanation === "string" ? row.explanation : null,
        tags: Array.isArray(row.tags) ? row.tags : null,
    }));

    const importQuestions = async () => {
        if (!selectedSkill) return;
        const text = importDrafts[selectedSkill.id]?.trim();
        if (!text) return alert(normalizeDisplayText("Vui lòng nhập JSON import."));
        let rows: any[] = [];
        try {
            rows = JSON.parse(text);
        } catch {
            return alert(normalizeDisplayText("JSON import chưa hợp lệ."));
        }
        if (!Array.isArray(rows) || rows.length === 0) return alert(normalizeDisplayText("Danh sách import đang trống."));
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSavingId(`import-preview:${selectedSkill.id}`);
            const normalizedRows = buildJsonImportRows(rows);
            const response = await postAdminJson("/api/admin/question-bank/import", {
                ...adminPayload,
                dryRun: true,
                rows: normalizedRows,
            }) as any;
            setJsonImportPreview({
                skillId: selectedSkill.id,
                rows: normalizedRows,
                report: response.report,
            });
            setMessage(normalizeDisplayText(`Đã xem trước JSON import: ${response.report.readyCount} câu hợp lệ, ${response.report.errorCount} câu lỗi.`));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Không thể xem trước JSON import.");
        } finally {
            setIsSavingId(null);
        }
    };

    const confirmJsonImport = async () => {
        if (!selectedSkill || !jsonImportPreview || jsonImportPreview.skillId !== selectedSkill.id) return;
        const adminPayload = getAdminPayload();
        if (!adminPayload) return;

        try {
            setIsSavingId(`import:${selectedSkill.id}`);
            const response = await postAdminJson("/api/admin/question-bank/import", {
                ...adminPayload,
                dryRun: false,
                rows: jsonImportPreview.rows,
            }) as any;
            const errorLines = Array.isArray(response.report?.results)
                ? response.report.results
                    .filter((item: any) => item.status === "error")
                    .map((item: any) => `${normalizeDisplayText('Dòng')} ${Number(item.index) + 1}: ${item.message}`)
                : [];
            setImportIssues(errorLines);
            setJsonImportPreview(null);
            await loadConfig();
            setSelectedSkillId(selectedSkill.id);
            setMessage(normalizeDisplayText(`Import JSON xong: ${response.report.importedCount} câu thành công, ${response.report.errorCount} câu lỗi.`));
        } catch (error) {
            setMessage(error instanceof Error ? error.message : normalizeDisplayText("Không thể import câu hỏi JSON."));
        } finally {
            setIsSavingId(null);
        }
    };

    if (!isInitialized) return <div className="flex min-h-screen items-center justify-center bg-slate-50 font-bold text-slate-500">{normalizeDisplayText('Đang tải dữ liệu...')}</div>

    const newDraft = selectedSkill ? questionDrafts[`new:${selectedSkill.id}`] : null;
    const totalQuestions = payload?.skills?.reduce((sum: number, skill: any) => sum + (skill.questionBank?.length || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-[32px] bg-sky-600 text-white shadow-lg shadow-sky-200"><Database size={28} /></div><div><h1 className="text-3xl font-black text-slate-900">{normalizeDisplayText('Ngân hàng câu hỏi')}</h1><p className="font-medium text-slate-500">{normalizeDisplayText('Một nơi duy nhất để quản lý nguồn, template và câu hỏi.')}</p></div></div>
                    <div className="flex gap-3"><button onClick={() => loadConfig()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-[32px] bg-sky-600 px-4 py-3 font-bold text-white disabled:opacity-70"><RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />{isLoading ? normalizeDisplayText("Đang tải") : normalizeDisplayText("Làm mới")}</button><Link href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-600"><ArrowLeft size={18} />{normalizeDisplayText('Quay lại')}</Link></div>
                </div>
                {message ? <div className="rounded-[32px] border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-bold text-sky-700">{message}</div> : null}{importIssues.length > 0 ? <div className="rounded-[32px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><div className="font-black">{normalizeDisplayText('Các dòng cần xem lại')}</div><div className="mt-2 space-y-1">{importIssues.slice(0, 20).map((issue, index) => <div key={`${index}-${issue}`} className="font-medium">- {issue}</div>)}</div>{importIssues.length > 20 ? <div className="mt-2 font-bold">{normalizeDisplayText('Còn')} {importIssues.length - 20} {normalizeDisplayText('dòng nữa chưa hiện')}.</div> : null}</div> : null}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">{normalizeDisplayText('Môn học')}</div><div className="mt-2 text-3xl font-black text-slate-900">{payload?.curriculum.name || subjectLabel}</div><div className="mt-4 flex flex-wrap gap-2">{[{ value: "math", label: normalizeDisplayText("Toán") }, { value: "english", label: normalizeDisplayText("Anh") }, { value: "vietnamese", label: normalizeDisplayText("Việt") }, { value: "finance", label: normalizeDisplayText("Tài chính") }].map((option) => <button key={option.value} type="button" onClick={() => { setSubjectId(option.value as any); resetViewState(); }} className={`rounded-full px-3 py-2 text-xs font-bold transition-all ${subjectId === option.value ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"}`}>{option.label}</button>)}</div></div>
                    <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">{normalizeDisplayText('Lớp')}</div><div className="mt-2 text-3xl font-black text-slate-900">{normalizeDisplayText('Lớp')} {grade}</div><div className="mt-4 flex flex-wrap gap-2">{SUPPORTED_GRADES.map((gradeOption) => <button key={gradeOption} type="button" onClick={() => { setGrade(gradeOption); resetViewState(); }} className={`rounded-full px-3 py-2 text-xs font-bold transition-all ${grade === gradeOption ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{normalizeDisplayText('Lớp')} {gradeOption}</button>)}</div></div>
                    <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">{normalizeDisplayText('Số bài học')}</div><div className="mt-2 text-3xl font-black text-slate-900">{payload?.skills?.length || 0}</div></div>
                    <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="text-sm font-bold text-slate-400">{normalizeDisplayText('Câu hỏi DB')}</div><div className="mt-2 text-3xl font-black text-slate-900">{totalQuestions}</div></div>
                </div>
                {!payload ? <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">{normalizeDisplayText('Bấm "Làm mới" để làm việc với ngân hàng câu hỏi.')}</div> : <>
                    <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><label className="space-y-2"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Chọn bài học')}</div><select className="w-full rounded-[32px] border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-800" value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}>{(payload.skills || []).map((skill: any) => <option key={skill.id} value={skill.id}>{getSkillDisplayName(skill)}</option>)}</select></label><div className="rounded-[32px] bg-slate-50 px-4 py-3"><div className="text-sm font-bold text-slate-500">{normalizeDisplayText('Đang chọn')}</div><div className="mt-2 font-black text-slate-900">{selectedSkill ? `${getSkillDisplayName(selectedSkill)} (${selectedSkill.skill_code})` : normalizeDisplayText("Chưa chọn")}</div><div className="mt-1 text-sm text-slate-500">{selectedSkill ? `${selectedSkill.phaseCode || "phase"} - ${selectedSkill.topicName || normalizeDisplayText("Chủ đề")}` : ""}</div></div></div></div>
                    {selectedSkill && newDraft ? <div className="space-y-5">
                        <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black text-slate-900">{normalizeDisplayText('Nhập liệu')}</h2><p className="mt-1 text-sm font-medium text-slate-500">{normalizeDisplayText('Chỉ giữ các thao tác cần thiết: tải mẫu Word, nhập file Word và nhập trực tiếp.')}</p></div><div className="flex flex-col gap-3 md:flex-row"><button type="button" onClick={downloadWordTemplate} className="inline-flex items-center justify-center gap-2 rounded-[32px] bg-emerald-600 px-5 py-4 font-bold text-white"><Download size={18} />{normalizeDisplayText('Tải mẫu Word cả môn')}</button><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[32px] bg-amber-500 px-5 py-4 font-bold text-white"><Upload size={18} />{normalizeDisplayText('Nhập file Word (.docx)')}<input type="file" accept=".docx,.html,.htm" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { void importWordFile(file); } e.currentTarget.value = ""; }} /></label><button type="button" onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-[32px] bg-sky-600 px-5 py-4 font-bold text-white"><Save size={18} />{normalizeDisplayText('Nhập trực tiếp')}</button></div></div></div>

                        {/* Import Preview/Confirm Panel */}
                        {importPreview && (<div className="rounded-[32px] border-2 border-amber-300 bg-amber-50 p-6 shadow-xl">
                            <h2 className="text-xl font-black text-amber-900">{normalizeDisplayText('Xem trước import')}: {importPreview.fileName}</h2>
                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-emerald-600">{importPreview.validRows.length}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Câu hợp lệ')}</div></div>
                                <div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-red-600">{importPreview.issueLines.length}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Câu lỗi (bỏ qua)')}</div></div>
                                <div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-amber-600">{importPreview.warningLines.length}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Cảnh báo')}</div></div>
                            </div>
                            {importPreview.issueLines.length > 0 && (<div className="mt-4 max-h-40 overflow-y-auto rounded-[32px] bg-red-50 p-4 text-sm text-red-800">
                                <div className="font-black">{normalizeDisplayText('Lỗi (sẽ bỏ qua)')}:</div>
                                {importPreview.issueLines.slice(0, 10).map((issue, index) => <div key={index} className="mt-1">- {issue}</div>)}
                                {importPreview.issueLines.length > 10 && <div className="mt-1 font-bold">...{normalizeDisplayText('còn')} {importPreview.issueLines.length - 10} {normalizeDisplayText('lỗi nữa')}</div>}
                            </div>)}
                            {importPreview.warningLines.length > 0 && (<div className="mt-3 max-h-32 overflow-y-auto rounded-[32px] bg-amber-100 p-4 text-sm text-amber-900">
                                <div className="font-black">{normalizeDisplayText('Cảnh báo')}:</div>
                                {importPreview.warningLines.slice(0, 5).map((w, index) => <div key={index} className="mt-1">- {w}</div>)}
                            </div>)}
                            {importPreview.validRows.length > 0 && (<div className="mt-4 max-h-48 overflow-y-auto rounded-[32px] bg-white p-4 text-sm">
                                <div className="font-black text-slate-700">{normalizeDisplayText('Câu hỏi sẽ import')}:</div>
                                {importPreview.validRows.slice(0, 8).map(({ row, targetSkill }, index) => (
                                    <div key={index} className="mt-2 flex items-start gap-2 border-b border-slate-100 pb-2">
                                        <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-700">{targetSkill.skill_code}</span>
                                        <span className="text-slate-700">{String(row.question?.content?.text || '').slice(0, 80)}{String(row.question?.content?.text || '').length > 80 ? '...' : ''}</span>
                                    </div>
                                ))}
                                {importPreview.validRows.length > 8 && <div className="mt-2 font-bold text-slate-400">...{normalizeDisplayText('còn')} {importPreview.validRows.length - 8} {normalizeDisplayText('câu nữa')}</div>}
                            </div>)}
                            <div className="mt-5 flex justify-end gap-3">
                                <button type="button" onClick={() => setImportPreview(null)} className="rounded-[32px] border-2 border-slate-200 px-5 py-3 font-bold text-slate-600">{normalizeDisplayText('Hủy')}</button>
                                <button type="button" onClick={() => void confirmImportPreview()} disabled={isSavingId === 'word:confirm'} className="inline-flex items-center gap-2 rounded-[32px] bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} />{isSavingId === 'word:confirm' ? normalizeDisplayText('Đang import...') : `${normalizeDisplayText('Xác nhận import')} ${importPreview.validRows.length} ${normalizeDisplayText('câu')}`}</button>
                            </div>
                        </div>)}

                        <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black text-slate-900">{normalizeDisplayText('Nhập JSON có xem trước')}</h2><p className="mt-1 text-sm font-medium text-slate-500">{normalizeDisplayText('Dán danh sách JSON, bấm xem trước để validate trước khi ghi vào DB.')}</p></div><button type="button" onClick={() => void importQuestions()} disabled={isSavingId === `import-preview:${selectedSkill.id}`} className="inline-flex items-center gap-2 rounded-[32px] bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-70"><Upload size={18} />{isSavingId === `import-preview:${selectedSkill.id}` ? normalizeDisplayText("Đang xem trước...") : normalizeDisplayText("Xem trước JSON")}</button></div><textarea className="mt-4 min-h-48 w-full rounded-[32px] border-2 border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800" value={importDrafts[selectedSkill.id] || ""} onChange={(e) => setImportDrafts((prev) => ({ ...prev, [selectedSkill.id]: e.target.value }))} placeholder={IMPORT_PLACEHOLDER} /></div>

                        {jsonImportPreview && jsonImportPreview.skillId === selectedSkill.id ? (<div className="rounded-[32px] border-2 border-indigo-300 bg-indigo-50 p-6 shadow-xl"><h2 className="text-xl font-black text-indigo-900">{normalizeDisplayText('Xem trước JSON Import')}</h2><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4"><div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-slate-900">{jsonImportPreview.report.total || 0}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Tổng dòng')}</div></div><div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-emerald-600">{jsonImportPreview.report.readyCount || 0}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Hợp lệ')}</div></div><div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-rose-600">{jsonImportPreview.report.errorCount || 0}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Lỗi')}</div></div><div className="rounded-[32px] bg-white p-4 text-center"><div className="text-3xl font-black text-indigo-600">{Array.isArray(jsonImportPreview.report.results) ? jsonImportPreview.report.results.filter((item: any) => item.status === 'ready').length : 0}</div><div className="text-xs font-bold text-slate-500">{normalizeDisplayText('Sẵn sàng ghi')}</div></div></div>{Array.isArray(jsonImportPreview.report.results) && jsonImportPreview.report.results.some((item: any) => item.status === 'error') ? (<div className="mt-4 max-h-40 overflow-y-auto rounded-[32px] bg-rose-50 p-4 text-sm text-rose-800"><div className="font-black">{normalizeDisplayText('Dòng lỗi')}</div>{jsonImportPreview.report.results.filter((item: any) => item.status === 'error').slice(0, 10).map((item: any) => <div key={`json-error-${item.index}`} className="mt-1">- {normalizeDisplayText('Dòng')} {Number(item.index) + 1}: {item.message}</div>)}</div>) : null}{Array.isArray(jsonImportPreview.report.results) && jsonImportPreview.report.results.some((item: any) => item.status === 'ready') ? (<div className="mt-4 max-h-48 overflow-y-auto rounded-[32px] bg-white p-4 text-sm text-slate-700"><div className="font-black">{normalizeDisplayText('Câu hỏi sẽ được import')}</div>{jsonImportPreview.report.results.filter((item: any) => item.status === 'ready').slice(0, 8).map((item: any) => <div key={`json-ready-${item.index}`} className="mt-2 border-b border-slate-100 pb-2">- {normalizeDisplayText('Dòng')} {Number(item.index) + 1}: {item.text || normalizeDisplayText('(không có nội dung)')}</div>)}</div>) : null}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setJsonImportPreview(null)} className="rounded-[32px] border-2 border-slate-200 px-5 py-3 font-bold text-slate-600">{normalizeDisplayText('Hủy')}</button><button type="button" onClick={() => void confirmJsonImport()} disabled={isSavingId === `import:${selectedSkill.id}` || !(jsonImportPreview.report.readyCount > 0)} className="inline-flex items-center gap-2 rounded-[32px] bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} />{isSavingId === `import:${selectedSkill.id}` ? normalizeDisplayText('Đang import...') : `${normalizeDisplayText('Xác nhận import')} ${jsonImportPreview.report.readyCount || 0} ${normalizeDisplayText('câu')}`}</button></div></div>) : null}

                        <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-slate-100"><h2 className="text-xl font-black text-slate-900">{normalizeDisplayText('Câu hỏi đã nhập')}</h2><div className="mt-4 space-y-4">{selectedSkill.questionBank.length === 0 ? <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-400">{normalizeDisplayText('Bài học này chưa có câu hỏi trong DB.')}</div> : selectedSkill.questionBank.map((question: any) => { const draftKey = question.id; const draft = questionDrafts[draftKey]; if (!draft) return null; return <details key={question.id} className="rounded-[32px] border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-black text-slate-900">{draft.text || question.id}</summary><div className="mt-2 text-sm text-slate-500">{question.id} - {draft.questionType} - {draft.qualityStatus}</div><div className="mt-4"><QuestionEditor draft={draft} sources={sourceOptions} templates={selectedSkill.templates} onChange={(updater) => setQuestionDrafts((prev) => ({ ...prev, [draftKey]: updater(prev[draftKey]) }))} /><div className="mt-4 flex justify-end"><button type="button" onClick={() => saveQuestion(draftKey)} disabled={isSavingId === `question:${draftKey}`} className="inline-flex items-center gap-2 rounded-[32px] bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} />{isSavingId === `question:${draftKey}` ? normalizeDisplayText("Đang lưu") : normalizeDisplayText("Lưu câu hỏi")}</button></div></div></details>; })}</div></div>
                    </div> : null}
                </>}
                {isCreateModalOpen && selectedSkill && newDraft ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl"><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-900">{normalizeDisplayText('Nhập trực tiếp câu hỏi')}</h2><p className="mt-1 text-sm font-medium text-slate-500">{normalizeDisplayText('Nhập xong rồi bấm tạo câu hỏi để lưu vào ngân hàng của skill đang chọn.')}</p></div><button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-[32px] border-2 border-slate-200 px-4 py-3 font-bold text-slate-600">{normalizeDisplayText('Đóng')}</button></div><div className="mt-5"><QuestionEditor draft={newDraft} sources={sourceOptions} templates={selectedSkill.templates} onChange={(updater) => setQuestionDrafts((prev) => ({ ...prev, [`new:${selectedSkill.id}`]: updater(prev[`new:${selectedSkill.id}`]) }))} /></div><div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setIsCreateModalOpen(false)} className="rounded-[32px] border-2 border-slate-200 px-5 py-3 font-bold text-slate-600">{normalizeDisplayText('Đóng')}</button><button type="button" onClick={async () => { await saveQuestion(`new:${selectedSkill.id}`); setIsCreateModalOpen(false); }} disabled={isSavingId === `question:new:${selectedSkill.id}`} className="inline-flex items-center gap-2 rounded-[32px] bg-sky-600 px-5 py-3 font-bold text-white disabled:opacity-70"><Save size={18} />{isSavingId === `question:new:${selectedSkill.id}` ? normalizeDisplayText("Đang tạo") : normalizeDisplayText("Tạo câu hỏi")}</button></div></div></div> : null}
            </div>
        </div>
    );
}





















