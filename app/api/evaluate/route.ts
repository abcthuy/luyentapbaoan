import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as {
            prompt?: string;
            studentAnswer?: string;
            correctAnswer?: string;
            skillId?: string;
            audioData?: string;
            mimeType?: string;
        } | null;

        const prompt = body?.prompt || '';
        const studentAnswer = body?.studentAnswer || '';
        const correctAnswer = body?.correctAnswer || '';
        const skillId = body?.skillId || '';
        const audioData = body?.audioData;
        const mimeType = body?.mimeType;

        if (!skillId || !prompt) {
            return NextResponse.json({ error: "Missing skillId or prompt" }, { status: 400 });
        }

        // Multi-key rotation logic
        const apiKeys = (process.env.GEMINI_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);
        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        let lastError: unknown = null;

        for (const selectedKey of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(selectedKey);
                const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash' });

                // --- NEW: Inject Rubrics ---
                // const { getRubric } = require('@/lib/content/rubrics'); // Removed unused require
                // ... (rest of logic)
                let rubricContext = '';
                const isFinance = skillId.startsWith('fin') || ['C3', 'identify-money', 'compare-value', 'money-sum', 'shopping-math', 'need-vs-want', 'saving-goal', 'job-value', 'saving-pig'].includes(skillId);

                if (skillId.startsWith('tv')) {
                    rubricContext = 'Dựa trên thang đánh giá Tiếng Việt (Khá/Giỏi/Xuất sắc): Chú ý cách dùng từ, câu, cảm xúc.';
                } else if (isFinance) {
                    rubricContext = 'Dựa trên thang đánh giá Tài chính: Chú ý khả năng tính toán thực tế, phân biệt Cần/Muốn.';
                } else if (skillId.startsWith('eng')) {
                    rubricContext = 'Evaluate English proficiency (Vocabulary, Grammar, Fluency).';
                }

                const isSummary = skillId === 'SESSION_SUMMARY';
                let systemPrompt = '';
                // Define specific type for parts
                let parts: (string | { text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

                if (isSummary) {
                    systemPrompt = `Bạn là gia sư Lớp 2-3. Viết phản hồi ngắn cho: ${prompt}. HS trả lời: ${studentAnswer}. Trả về JSON: { "explain": "khen ngợi/động viên", "microLesson": "lời khuyên" }.`;
                    parts = [systemPrompt];
                } else {
                    // Base prompt — TỐI ƯU TỐC ĐỘ: prompt cực ngắn
                    let instruction = `Gia sư Lớp 2-3. Phản hồi SIÊU NGẮN 1-2 câu. JSON: {"isCorrect":bool,"explain":string,"microLesson":string,"quality":"Xuất sắc"|"Giỏi"|"Khá"|"Trung bình"|"Yếu"}.`;

                    if (audioData) {
                        // Audio Analysis Mode
                        instruction += `
NGHE GHI ÂM của học sinh, SO SÁNH với bài gốc: "${prompt}".
QUAN TRỌNG: Kiểm tra học sinh đọc ĐẦY ĐỦ hay chỉ đọc 1 phần.
- Nếu chỉ đọc dưới 70% bài → isCorrect=false, quality="Yếu" hoặc "Trung bình", explain="Con mới đọc được một phần bài thôi, hãy đọc hết nhé!"
- Nếu đọc đủ nhưng sai nhiều → isCorrect=false, quality="Trung bình"
- Nếu đọc đủ và rõ → isCorrect=true, chấm quality theo chất lượng
microLesson=1 mẹo cải thiện ngắn gọn. Phản hồi tiếng Việt thân thiện.`;

                        // --- SKILL SPECIFIC PROMPTS ---
                        if (skillId.includes('dien-cam')) {
                            // Advanced evaluation algorithm for Expressive Reading (Đọc Diễn Cảm)
                            instruction += `
[BỘ TIÊU CHÍ CHẤM ĐỌC DIỄN CẢM CHI TIẾT]:
1. ĐỌC ĐỦ & TO RÕ: Bé PHẢI đọc từ đầu đến cuối bài mới được thông qua (nếu thiếu, cho rớt ngay isCorrect=false). Không đọc lí nhí.
2. NGẮT NGHỈ ĐÚNG CHUẨN: Phân tích kỹ xem bé có ngắt hơi (nhẹ) ở dấu phẩy (,), ngắt dài ở dấu chấm/hỏi/than (./?/\!), và nghỉ khi xuống dòng/hết khổ thơ không. Tuyệt đối không đọc lèo một hơi dính chữ.
3. DIỄN CẢM & CẢM XÚC: Phải thể hiện được cảm xúc bài thơ/văn. Có nhấn giọng ở các từ láy, từ gợi tả không? Nhịp điệu có phù hợp không (hay đều đều rề rề như máy)?

[CÔNG THỨC CHẤM]:
- "Xuất sắc": Hoàn hảo, to rõ, ngắt nghỉ từng nhịp chuẩn xác (dấu phẩy, chấm, xuống dòng), đầy cảm xúc.
- "Giỏi": To rõ, ngắt nghỉ hầu hết các dấu câu đúng, đọc liền mạch.
- "Khá": Đọc đủ, nhưng ngắt/nghỉ dấu câu đôi chỗ còn sai (đọc lướt qua dấu phẩy hoặc ngắt sai nhịp thơ), thiếu chút cảm xúc.
- "Trung bình": Đọc như đọc vẹt đều đều, có ngắt nghỉ nhưng vấp từ 3 chỗ trở lên, mắc lỗi phát âm.
- "Yếu": KHÔNG hoàn thành trọn bài, hoặc sai chi chít. (isCorrect = false).

* microLesson: Phân tích lỗi cụ thể, ví dụ: "Con đọc hơi dính chữ chỗ dấu phẩy..." hoặc khen ngợi chỗ đọc hay nhất.`;
                        } else if (skillId.includes('hung-bien')) {
                            // Advanced evaluation algorithm for Eloquence/Speaking (Hùng Biện)
                            instruction += `
[BỘ TIÊU CHÍ CHẤM HÙNG BIỆN CHI TIẾT]:
1. CẤU TRÚC BÀI NÓI (Trọng số cao): Phải có đủ 3 phần dàn ý cơ bản.
   - Mở bài: Giới thiệu được chủ đề mình định nói.
   - Thân bài: Đưa ra được ít nhất 2 ý/lý do để làm rõ chủ đề.
   - Kết bài: Tóm tắt lại hoặc đưa ra cảm nghĩ/lời khuyên.
2. TỪ VỰNG & TỪ NỐI: Có sử dụng các từ nối để bài nói mạch lạc không? (VD: "Đầu tiên", "Tiếp theo", "Bên cạnh đó", "Vì vậy", "Tóm lại").
3. SỰ TỰ TIN & TRÔI CHẢY: Giọng nói to, rõ ràng, dõng dạc. Không ngập ngừng (ờ, à) quá 3 lần.
4. THỜI LƯỢNG & NỘI DUNG: Bài nói quá ngắn (chỉ 1-2 câu cộc lốc) sẽ bị đánh trượt (isCorrect=false). Nội dung phải đi sát với chủ đề yêu cầu.

[CÔNG THỨC CHẤM]:
- "Xuất sắc": Đủ 3 phần Mở-Thân-Kết, dùng từ nối mượt mà, lập luận sắc bén, giọng tự tin dõng dạc, không vấp váp.
- "Giỏi": Trình bày rõ ràng chủ đề, có lý do bảo vệ ý kiến, tuy nhiên cấu trúc chưa thật sự chặt chẽ hoặc còn thiếu ít từ nối.
- "Khá": Nói đúng chủ đề nhưng mang tính kể lể hoặc đọc thuộc lòng hơn là diễn thuyết, có vấp váp nhẹ (ờ, à).
- "Trung bình": Lập luận lủng củng, không rõ ý, hoặc ngập ngừng vấp váp rất nhiều lần.
- "Yếu": Lạc đề, hoặc quá ngắn (dưới 3 câu), hoặc ngập ngừng không phát triển được ý. (isCorrect=false).

* microLesson: Phân tích lỗi cụ thể, ví dụ: "Con nói phần mở đầu rât tốt, nhưng ở thân bài con nên thêm từ 'Bên cạnh đó' để nối hai lý do với nhau nhé."`;
                        } else if (skillId.includes('eng-speak')) {
                            // Advanced evaluation algorithm for English Reading Aloud
                            instruction += `
[BỘ TIÊU CHÍ CHẤM ENGLISH READING ALOUD]:
1. ĐỌC ĐỦ & TO RÕ: Bé PHẢI đọc từ đầu đến cuối đoạn văn Tiếng Anh mới được thông qua (nếu thiếu, cho rớt ngay isCorrect=false). Không đọc lí nhí.
2. PHÁT ÂM (PRONUNCIATION): Chú ý phát âm đúng các âm cuối (ending sounds như /s/, /t/, /d/) và trọng âm từ.
3. NGỮ ĐIỆU (INTONATION) & NGẮT NGHỈ: Có ngắt nghỉ đúng dấu phẩy, dấu chấm không? Lên giọng cuối câu hỏi, xuống giọng cuối câu kể. Đọc có tự nhiên không hay như đánh vần từng chữ?

[CÔNG THỨC CHẤM]:
- "Xuất sắc": Phát âm cực chuẩn, có ngữ điệu tự nhiên như người bản xứ, ngắt nghỉ đúng chỗ, đọc trôi chảy.
- "Giỏi": To rõ, đúng hầu hết các từ, đọc liền mạch nhưng ngữ điệu chưa thật sự tự nhiên.
- "Khá": Đọc đủ, nhưng phát âm sai vài từ khó, quên âm cuối, đọc còn hơi rời rạc.
- "Trung bình": Đọc như đánh vần từng chữ, sai phát âm nhiều từ cơ bản, vấp nhiều.
- "Yếu": KHÔNG hoàn thành trọn đoạn văn, hoặc sai quá nhiều không hiểu được. (isCorrect = false).

* microLesson: Phân tích lỗi cụ thể, ví dụ: "Con nhớ xì (phát âm âm /s/) cuối từ 'apples' nhé" hoặc khen ngợi chỗ đọc hay (Phản hồi bằng Tiếng Việt thân thiện).`;
                        }

                        parts = [
                            { text: instruction },
                            {
                                inlineData: {
                                    mimeType: mimeType || 'audio/webm',
                                    data: audioData
                                }
                            }
                        ];
                    } else {
                        // Text/Math Analysis Mode
                        instruction += `
                        Kiểm tra câu trả lời: "${studentAnswer}" cho câu hỏi/đề bài: "${prompt}".
                        Đáp án tham khảo: ${correctAnswer}.
                        Context: ${rubricContext}
                        
                        - "explain": Đúng -> khen theo mức độ. Sai -> chỉ lỗi sai.
                        - "microLesson": 1 câu hướng dẫn mẹo hoặc cách làm hay hơn.
                        - "quality": Đánh giá chất lượng trả lời (Xuất sắc/Giỏi/Khá/Trung bình/Yếu).
                        Tuyệt đối không viết dài dòng.`;

                        parts = [instruction];
                    }
                }

                const result = await model.generateContent(parts);
                const responseText = result.response.text();

                // Robust JSON parsing
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    // Ensure quality field exists if missing
                    if (!data.quality) {
                        data.quality = data.isCorrect ? "Giỏi" : "Yếu";
                    }
                    return NextResponse.json(data);
                }

                throw new Error('Failed to parse Gemini response');

            } catch (error: unknown) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`API Key rotation (evaluate): One key failed, trying next... Error: ${errorMessage}`);
                continue;
            }
        }

        throw lastError;

    } catch (error) {
        console.error('Gemini API Error:', error);
        // Fallback
        return NextResponse.json({
            isCorrect: false,
            quality: 'Yếu',
            errorTag: 'khac',
            explain: 'Có vẻ như đã có lỗi nhỏ khi xử lý.',
            microLesson: 'Hãy thử kiểm tra lại các bước tính toán của mình một lần nữa nhé!'
        });
    }
}
