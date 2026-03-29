
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SKILL_MAP, SkillId } from "@/lib/skills";
import { getStaticQuestion } from "@/lib/content/static";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null) as { skillId?: string; level?: number; subjectId?: string } | null;
        const skillId = body?.skillId?.trim();
        const subjectId = body?.subjectId?.trim();
        const level = Number(body?.level || 1);

        if (!skillId || !subjectId) {
            return NextResponse.json({ error: "Missing skillId or subjectId" }, { status: 400 });
        }

        // 1. Try to get a static question first (Hybrid approach)
        const staticQuestion = getStaticQuestion(skillId, level || 1);
        if (staticQuestion) {
            // Add a small delay to simulate processing but keep it fast
            return NextResponse.json(staticQuestion);
        }

        // Multi-key rotation logic
        const apiKeys = (process.env.GEMINI_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // Shuffle keys to distribute load
        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        let lastError: unknown = null;

        for (const selectedKey of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(selectedKey);

                // Get course and skill info for better prompting
                const { COURSES } = await import("@/lib/content/registry");
                const course = COURSES[subjectId as keyof typeof COURSES];

                // Find skill details
                let skill: { id: string; name: string; grade?: number; description?: string } | null = null;
                if (course && course.topics) {
                    for (const topic of course.topics) {
                        const found = topic.skills.find(s => s.id === skillId);
                        if (found) { skill = found; break; }
                    }
                }

                // Fallback to SKILL_MAP if not found in courses
                if (!skill) {
                    skill = (SKILL_MAP[skillId as SkillId] || { id: skillId, name: skillId, grade: 1 }) as unknown as { id: string; name: string; grade?: number; description?: string };
                    // Using 'as any' safely here just to match the structure if SKILL_MAP types are strict, 
                    // but fixing the variable type 'skill' above helps.
                }

                const model = genAI.getGenerativeModel({
                    model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",
                    generationConfig: { responseMimeType: "application/json" }
                });

                const isEnglish = subjectId === 'english' || skillId.startsWith('eng');

                const prompt = `
        Đóng vai trò: Giáo viên ${course?.name || (subjectId === 'math' ? 'Toán' : 'Tiếng Việt')} Lớp ${skill?.grade || "2-3"} cực kỳ tâm lý và sáng tạo.
        Nhiệm vụ: Tạo 1 câu hỏi bài tập cho học sinh tiểu học.
        
        YÊU CẦU BẮT BUỘC:
        1. Câu hỏi PHẢI thuộc môn: ${course?.name || (subjectId === 'math' ? 'Toán' : 'Tiếng Việt')}. Tuyệt đối không nhầm lẫn sang môn khác.
        2. Nếu môn Toán, ưu tiên số liệu thực tế; Nếu môn Tiếng Việt, câu văn phải trong sáng, cảm xúc.
        
        Thông tin chi tiết:
        - Môn: ${course?.name || (subjectId === 'math' ? 'Toán' : 'Tiếng Việt')}
        - Chủ đề: ${skill?.name}
        - Lớp: ${skill?.grade || 2}
        - Độ khó: Level ${level} (1=Cơ bản, 5=Trùm cuối/Nâng cao)
        
        CHIẾN LƯỢC DỰA TRÊN ĐỘ KHÓ (LEVEL):
        - Học sinh đang ở Level ${level}.
        - Nếu Level 4 hoặc 5 (BOSS FIGHT):
            + BẮT BUỘC lồng ghép cốt truyện (Gamification) thu hút trẻ em (ví dụ: Hành trình giải cứu công chúa, Khám phá vũ trụ, Tìm kho báu hải tặc...). Đề bài dài hơn, yêu cầu tư duy 2-3 bước.
            + Hạn chế trắc nghiệm (mcq), ưu tiên \`input\` (tự điền) hoặc \`drag-drop\` (sắp xếp).
        - Nếu Level 1-3: Câu hỏi ngắn gọn, trực diện, bám sát sách giáo khoa.

        GIỌNG ĐIỆU (THẤU CẢM & YÊU THƯƠNG):
        - \`instruction\`: Dùng lời kêu gọi ngọt ngào, khích lệ (VD: "Bé yêu ơi, cùng thử sức nào!", "Chiến binh nhí của thầy cô làm được mà!").
        - \`hint\`: CHỐNG CHỈ ĐỊNH chê bai. BẮT BUỘNG động viên khi bé làm sai (VD: "Ôi, bé tính nhầm một xíu thôi. Mình cùng xem lại bước này nhé <3", "Tuyệt vời vì con đã thử! Gợi ý nhỏ cho con nè...").

        Yêu cầu đầu ra (JSON Nguyên thủy, KHÔNG dùng markdown):
        {
            "content": {
                "text": "Nội dung câu hỏi (có cốt truyện nếu Level 4-5)",
                "audio": "Nội dung cần đọc (nếu có)",
                "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]
            },
            "type": "mcq" | "input" | "drag-drop" | "match" | "drawing" | "speaking",
            "answer": "Đáp án đúng",
            "instruction": "Lời dẫn (Giọng điệu khích lệ)",
            "hint": "Gợi ý khi làm sai (Giọng điệu thấu cảm, an ủi)",
            "explanation": "Giải thích chi tiết tại sao đúng",
            "imagePrompt": "Mô tả hình minh họa bằng Tiếng Anh (ví dụ: 'A cute astronaut cat exploring mars, cartoon style')"
        }
        
        Lưu ý chuyên môn:
        ${isEnglish ? `
        - MÔN TIẾNG ANH: TOÀN BỘ JSON (trừ instruction/hint có thể là tiếng Việt để bé hiểu) phải bằng Tiếng Anh. Dùng từ vựng Lớp ${skill?.grade || 2}.
        ` : `
        - MÔN TIẾNG VIỆT/TOÀN: Viết Tiếng Việt chuẩn mực. Kỹ năng Hùng biện/Đọc diễn cảm trả về \`type='speaking'\` và nội dung thật sâu sắc.
        `}
        - Môn Tài chính: Lồng ghép khái niệm (Tiết kiệm, Ngân sách, Nhu cầu vs Mong muốn) vào bài toán tiền tệ VND.
        `;

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                });

                const text = result.response.text();

                // Clean up markdown code blocks if present (common with LLMs)
                const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

                const question = JSON.parse(cleanedText);

                // Overwrite ID to ensure uniqueness and format
                question.id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                question.skillId = skillId; // Ensure skillId matches request

                return NextResponse.json(question);

            } catch (error: unknown) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`API Key rotation: One key failed, trying next... Error: ${errorMessage}`);
                // If it's not a quota error, we might still want to try next key just in case
                continue;
            }
        }

        // If the loop finishes, it means all keys failed
        throw lastError;

    } catch (error: unknown) {
        console.error("AI Gen Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            error: "Failed to generate",
            details: errorMessage,
            code: (error instanceof Error && 'status' in error) ? (error as { status: number }).status : 500
        }, { status: 500 });
    }
}
