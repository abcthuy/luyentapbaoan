import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SKILL_MAP, SkillId } from "@/lib/skills";
import { getStaticQuestion } from "@/lib/content/static";
import { getApprovedQuestionBankQuestion } from "@/lib/server/question-runtime";
import { sanitizeQuestion, validateQuestion } from "@/lib/content/validation";
import { generateSpeakingQuestion } from "@/lib/content/generators/vietnamese";
import type { Question, SubjectId } from "@/lib/content/types";

const VIETNAMESE_SPEAKING_SKILLS = new Set([
    "tv2-doc-dien-cam",
    "tv2-noi-nghe",
    "tv2-thuyet-trinh",
    "tv3-hung-bien",
    "tv3-thao-luan",
]);

function buildVietnameseSpeakingFallback(skillId: string, level: number) {
    return sanitizeQuestion(generateSpeakingQuestion(skillId, level || 1));
}

function normalizeAiQuestion(params: {
    question: any;
    subjectId: SubjectId;
    skillId: string;
    level: number;
}) {
    const { question, subjectId, skillId, level } = params;
    const baseQuestion = question && typeof question === "object" ? question : {};
    const rawContent = baseQuestion.content && typeof baseQuestion.content === "object" ? baseQuestion.content : {};

    const normalized: Question = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        subjectId,
        skillId,
        type: typeof baseQuestion.type === "string" ? baseQuestion.type : "mcq",
        instruction: typeof baseQuestion.instruction === "string" ? baseQuestion.instruction : "Làm bài tập sau:",
        content: {
            text: typeof rawContent.text === "string" ? rawContent.text : "",
            audio: typeof rawContent.audio === "string" ? rawContent.audio : undefined,
            image: typeof rawContent.image === "string" ? rawContent.image : undefined,
            options: Array.isArray(rawContent.options) ? rawContent.options.map((item: unknown) => String(item || "")).filter(Boolean) : undefined,
            imagePrompt: typeof baseQuestion.imagePrompt === "string"
                ? baseQuestion.imagePrompt
                : typeof rawContent.imagePrompt === "string"
                    ? rawContent.imagePrompt
                    : undefined,
        },
        answer: typeof baseQuestion.answer === "string" ? baseQuestion.answer : "",
        hint: typeof baseQuestion.hint === "string" ? baseQuestion.hint : undefined,
        explanation: typeof baseQuestion.explanation === "string" ? baseQuestion.explanation : undefined,
    };

    if (VIETNAMESE_SPEAKING_SKILLS.has(skillId)) {
        const fallback = buildVietnameseSpeakingFallback(skillId, level);
        const isExpressiveReading = skillId.includes("doc-dien-cam");

        normalized.type = isExpressiveReading ? "reading" : "speaking";
        normalized.instruction = normalized.instruction.trim() || fallback.instruction;
        normalized.content.text = normalized.content.text.trim() || fallback.content.text;
        normalized.answer = normalized.answer.trim() || fallback.answer;
        normalized.hint = normalized.hint?.trim() || fallback.hint;
    }

    return sanitizeQuestion(normalized);
}

function getGeneratorFallback(subjectId: SubjectId, skillId: string, level: number) {
    if (subjectId === "vietnamese" && VIETNAMESE_SPEAKING_SKILLS.has(skillId)) {
        return buildVietnameseSpeakingFallback(skillId, level);
    }

    return null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null) as { skillId?: string; level?: number; subjectId?: string } | null;
        const skillId = body?.skillId?.trim();
        const subjectId = body?.subjectId?.trim() as SubjectId | undefined;
        const level = Number(body?.level || 1);

        if (!skillId || !subjectId) {
            return NextResponse.json({ error: "Missing skillId or subjectId" }, { status: 400 });
        }

        const dbQuestion = await getApprovedQuestionBankQuestion({
            subjectId,
            skillCode: skillId,
            difficultyLevel: level || 1,
        });

        if (dbQuestion) {
            return NextResponse.json(dbQuestion);
        }

        const staticQuestion = getStaticQuestion(skillId, level || 1);
        if (staticQuestion) {
            return NextResponse.json(staticQuestion);
        }

        const apiKeys = (process.env.GEMINI_API_KEY || "").split(",").map((k) => k.trim()).filter(Boolean);
        if (apiKeys.length === 0) {
            const fallback = getGeneratorFallback(subjectId, skillId, level);
            if (fallback) {
                return NextResponse.json(fallback);
            }
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        let lastError: unknown = null;

        for (const selectedKey of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(selectedKey);
                const { COURSES } = await import("@/lib/content/registry");
                const course = COURSES[subjectId as keyof typeof COURSES];

                let skill: { id: string; name: string; grade?: number; description?: string } | null = null;
                if (course && course.topics) {
                    for (const topic of course.topics) {
                        const found = topic.skills.find((s) => s.id === skillId);
                        if (found) {
                            skill = found;
                            break;
                        }
                    }
                }

                if (!skill) {
                    skill = (SKILL_MAP[skillId as SkillId] || { id: skillId, name: skillId, grade: 1 }) as unknown as { id: string; name: string; grade?: number; description?: string };
                }

                const model = genAI.getGenerativeModel({
                    model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",
                    generationConfig: { responseMimeType: "application/json" },
                });

                const isEnglish = subjectId === "english" || skillId.startsWith("eng");
                const isVietnameseSpeaking = VIETNAMESE_SPEAKING_SKILLS.has(skillId);
                const prompt = `
Đóng vai trò: Giáo viên ${course?.name || (subjectId === "math" ? "Toán" : subjectId === "english" ? "Tiếng Anh" : subjectId === "finance" ? "Tài chính" : "Tiếng Việt")} lớp ${skill?.grade || "2-3"} cực kỳ tâm lý và sáng tạo.
Nhiệm vụ: Tạo 1 câu hỏi bài tập cho học sinh tiểu học.

YÊU CẦU BẮT BUỘC:
1. Câu hỏi PHẢI thuộc môn: ${course?.name || (subjectId === "math" ? "Toán" : subjectId === "english" ? "Tiếng Anh" : subjectId === "finance" ? "Tài chính" : "Tiếng Việt")}. Tuyệt đối không nhầm lẫn sang môn khác.
2. Nếu môn Toán, ưu tiên số liệu thực tế; nếu môn Tiếng Việt, câu văn phải trong sáng, cảm xúc.
3. Nếu skill là đọc diễn cảm, trả về type='reading', content.text là đoạn thơ/văn để bé đọc, answer ngắn gọn như 'Đã đọc'.
4. Nếu skill là nói, thuyết trình, hùng biện, trả về type='speaking', content.text là chủ đề rõ ràng, hint là dàn ý ngắn giúp bé nói.

Thông tin chi tiết:
- Môn: ${course?.name || (subjectId === "math" ? "Toán" : subjectId === "english" ? "Tiếng Anh" : subjectId === "finance" ? "Tài chính" : "Tiếng Việt")}
- Chủ đề: ${skill?.name}
- Lớp: ${skill?.grade || 2}
- Độ khó: Level ${level} (1=Cơ bản, 5=Nâng cao)

Giọng điệu:
- instruction: ngọt ngào, khích lệ.
- hint: động viên, không chê bai.

Yêu cầu đầu ra (JSON thuần):
{
  "content": {
    "text": "Nội dung câu hỏi hoặc đoạn cần đọc",
    "audio": "Nội dung cần đọc nếu có",
    "options": ["Đáp án A", "Đáp án B"]
  },
  "type": "mcq" | "input" | "drag-drop" | "match" | "drawing" | "speaking" | "reading",
  "answer": "Đáp án đúng",
  "instruction": "Lời dẫn",
  "hint": "Gợi ý",
  "explanation": "Giải thích",
  "imagePrompt": "English image prompt"
}

Lưu ý chuyên môn:
${isEnglish ? "- Môn Tiếng Anh: nội dung chính bằng tiếng Anh, từ vựng đúng lớp học." : "- Môn Tiếng Việt/Toán: viết tiếng Việt chuẩn mực, tự nhiên."}
${isVietnameseSpeaking ? "- Skill này là dạng nói/đọc, tuyệt đối không trả MCQ rỗng hoặc thiếu content.text." : ""}
`;

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                });

                const rawText = result.response.text();
                const cleanedText = rawText.replace(/```json\n?|\n?```/g, "").trim();
                const parsed = JSON.parse(cleanedText);
                const normalizedQuestion = normalizeAiQuestion({
                    question: parsed,
                    subjectId,
                    skillId,
                    level,
                });
                const issues = validateQuestion(normalizedQuestion, skillId).filter((issue) => issue.severity === "error");

                if (issues.length > 0) {
                    throw new Error(`AI returned invalid question: ${issues.map((issue) => issue.message).join(" | ")}`);
                }

                return NextResponse.json(normalizedQuestion);
            } catch (error: unknown) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`API Key rotation: One key failed, trying next... Error: ${errorMessage}`);
                continue;
            }
        }

        const fallback = getGeneratorFallback(subjectId, skillId, level);
        if (fallback) {
            return NextResponse.json(fallback);
        }

        throw lastError;
    } catch (error: unknown) {
        console.error("AI Gen Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            error: "Failed to generate",
            details: errorMessage,
            code: (error instanceof Error && "status" in error) ? (error as { status: number }).status : 500,
        }, { status: 500 });
    }
}
