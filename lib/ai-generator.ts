
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Course, Question, Skill } from "./content/types";

// This should be server-side or via API route in production to hide key
// For now, we assume it's used in API route context or with NEXT_PUBLIC (warning: exposed key)
// Better approach: This function runs on Server Action / API Route.

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export async function generateAIQuestion(course: Course, skill: Skill, level: number): Promise<Question> {
    const prompt = `
    Đóng vai trò: Giáo viên ${course.name} Lớp ${skill.grade} chuyên nghiệp.
    Nhiệm vụ: Tạo 1 câu hỏi bài tập cho học sinh.
    
    Thông tin bài tập:
    - Môn: ${course.name}
    - Chủ đề: ${skill.name}
    - Mô tả: ${skill.description || skill.name}
    - Lớp: ${skill.grade}
    - Học kỳ: ${skill.semester || 'Học kỳ 1 hoặc 2'}
    - Độ khó: Level ${level} (1=Khởi động, 5=Nâng cao/Thi HSG)
    
    Yêu cầu đầu ra (JSON):
    {
        "content": {
            "text": "Nội dung câu hỏi (ngắn gọn, dễ hiểu cho trẻ em)",
            "audio": "Nội dung cần đọc (nếu là bài nghe/chính tả)",
            "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]
        },
        "type": "mcq" | "input" | "drag-drop" | "match" | "drawing",
        // Cấu trúc dữ liệu cho các loại câu hỏi đặc biệt:
        // Nếu type="drag-drop": "items": [{"id": "1", "content": "10"}, {"id": "2", "content": "20"}] (Yêu cầu sắp xếp)
        // Nếu type="match": "pairs": [{"left": "2+2", "right": "4"}, {"left": "5-1", "right": "4"}]
        "answer": "Đáp án đúng (chuỗi string)",
        "instruction": "Lời dẫn (Ví dụ: Tính nhẩm, Điền từ...)",
        "hint": "Gợi ý khi làm sai (mang tính giáo dục)",
        "explanation": "Giải thích chi tiết tại sao đúng",
        "imagePrompt": "Mô tả ngắn gọn hình ảnh minh họa cho câu hỏi bằng tiếng Anh (ví dụ: '3 red apples on a table, cartoon style'). Để trống nếu không cần."
    }
    
    Lưu ý quan trọng:
    - Tiếng Việt:
        + Dùng từ ngữ chuẩn sách giáo khoa mới (Cánh Diều/Kết nối tri thức).
        + Ưu tiên dạng "drag-drop" cho bài sắp xếp câu/từ.
        + Ưu tiên dạng "match" cho bài nối từ đơn/từ ghép hoặc từ trái nghĩa.
        + Nếu kỹ năng là 'Đọc diễn cảm': Tạo 1 đoạn thơ hoặc văn ngắn (4-6 câu) giàu cảm xúc. Yêu cầu học sinh đọc to. (Type='speaking').
        + Nếu kỹ năng là 'Hùng biện': Đưa ra 1 chủ đề tranh luận vui (VD: "Nên nuôi chó hay mèo?"). (Type='speaking').
    - Tiếng Anh:
        + Phù hợp từ vựng lứa tuổi. Dùng "match" cho bài nối từ vựng - hình ảnh.
    - Tài chính (Finance):
        + Đưa ra các tình huống đi chợ, tiết kiệm, phân biệt nhu cầu (cần) và mong muốn (muốn).
        + Số liệu tính toán phải thực tế và phù hợp với mệnh giá tiền Việt Nam.
    - Toán: Số liệu hợp lý, không đánh đố sai logic. Ưu tiên "input" hoặc "drag-drop" (sắp xếp số).
    
    Lưu ý bổ sung cho Học kỳ:
    - Nếu là Học kỳ 2: Ưu tiên các kiến thức nâng cao hơn so với đầu năm, số liệu trong phạm vi lớn hơn (Math), hoặc các đoạn văn/thơ dài hơn (Vietnamese).
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson);

        return {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            subjectId: course.id,
            skillId: skill.id,
            ...data
        };
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}
