import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

type EvaluateBody = {
    prompt?: string;
    studentAnswer?: string;
    correctAnswer?: string;
    skillId?: string;
    audioData?: string;
    mimeType?: string;
};

function getApiKeys() {
    return (process.env.GEMINI_API_KEY || '')
        .split(',')
        .map((key) => key.trim())
        .filter(Boolean);
}

function buildSummaryPrompt(prompt: string, studentAnswer: string) {
    return [
        'Bạn là gia sư lớp 2-3.',
        `Nhiệm vụ: ${prompt}`,
        `Câu trả lời của học sinh: ${studentAnswer}`,
        'Trả về JSON duy nhất: {"explain":"...","microLesson":"..."}',
        'Câu chữ thật ngắn, tích cực, dễ hiểu.',
    ].join('\n');
}

function buildAudioInstruction(skillId: string, prompt: string) {
    const lines = [
        'Bạn là gia sư lớp 2-3.',
        `Bài gốc: "${prompt}"`,
        'Nghe file ghi âm và chấm thật nhanh.',
        'Trả về JSON duy nhất: {"isCorrect":boolean,"explain":string,"microLesson":string,"quality":"Xuất sắc"|"Giỏi"|"Khá"|"Trung bình"|"Yếu"}.',
        'explain và microLesson phải ngắn, thân thiện, bằng tiếng Việt.',
    ];

    if (skillId.includes('dien-cam')) {
        lines.push('Ưu tiên: đọc đủ bài, ngắt nghỉ đúng, có cảm xúc.');
        lines.push('Nếu học sinh đọc thiếu rõ rệt hoặc bỏ nhiều dòng thì isCorrect=false.');
    } else if (skillId.includes('hung-bien')) {
        lines.push('Ưu tiên: đúng chủ đề, có 2-3 ý rõ, nói trôi chảy.');
        lines.push('Nếu quá ngắn, lạc đề hoặc chỉ nói 1-2 câu rời rạc thì isCorrect=false.');
    } else if (skillId.startsWith('eng')) {
        lines.push('Đây là bài nói/đọc tiếng Anh.');
        lines.push('Ưu tiên: đọc đủ bài, phát âm rõ, ngắt nghỉ tự nhiên.');
        lines.push('Nếu thiếu nhiều hoặc sai quá mức khiến khó hiểu thì isCorrect=false.');
    } else {
        lines.push('Ưu tiên: đủ ý, đúng nội dung, rõ ràng.');
    }

    return lines.join('\n');
}

function buildDetailedAudioInstruction(skillId: string, prompt: string) {
    const lines = [
        'Bạn là gia sư lớp 2-3.',
        `Bài gốc: "${prompt}"`,
        'Nghe kỹ file ghi âm và chấm theo tiêu chí rõ ràng.',
        'Trả về JSON duy nhất: {"isCorrect":boolean,"explain":string,"microLesson":string,"quality":"Xuất sắc"|"Giỏi"|"Khá"|"Trung bình"|"Yếu"}.',
        'explain và microLesson ngắn, dễ hiểu, bằng tiếng Việt.',
    ];

    if (skillId.includes('dien-cam')) {
        lines.push('Chấm theo 3 tiêu chí: đọc đủ bài, ngắt nghỉ đúng dấu câu/nhịp, có cảm xúc.');
        lines.push('Nếu thiếu nhiều dòng hoặc đọc cụt rõ rệt thì isCorrect=false.');
    } else if (skillId.includes('hung-bien')) {
        lines.push('Chấm theo 3 tiêu chí: đúng chủ đề, có mở-thân-kết hoặc ít nhất 2-3 ý rõ, nói tự tin tương đối.');
        lines.push('Nếu quá ngắn, lạc đề hoặc nói rời rạc thì isCorrect=false.');
    } else {
        lines.push('Đây là bài nói hoặc đọc tiếng Anh.');
        lines.push('Chấm theo 3 tiêu chí: đọc đủ bài, phát âm khá rõ, ngắt nghỉ tự nhiên.');
        lines.push('Nếu thiếu nhiều hoặc sai quá mức khiến khó hiểu thì isCorrect=false.');
    }

    return lines.join('\n');
}

function shouldUseDetailedAudioPrompt(skillId: string) {
    return skillId.includes('dien-cam')
        || skillId.includes('hung-bien')
        || skillId === 'eng2-speak'
        || skillId === 'eng3-speak';
}

function buildTextInstruction(prompt: string, studentAnswer: string, correctAnswer: string, skillId: string) {
    const context = skillId.startsWith('tv')
        ? 'Ngữ cảnh: Tiếng Việt, chú ý dùng từ, câu, cảm xúc.'
        : skillId.startsWith('eng')
            ? 'Ngữ cảnh: English, focus on vocabulary, grammar, fluency.'
            : skillId.startsWith('fin') || ['C3', 'identify-money', 'compare-value', 'money-sum', 'shopping-math', 'need-vs-want', 'saving-goal', 'job-value', 'saving-pig'].includes(skillId)
                ? 'Ngữ cảnh: Tài chính, chú ý tính thực tế và phân biệt cần/muốn.'
                : 'Ngữ cảnh: Toán hoặc bài học kỹ năng, ưu tiên đúng - sai rõ ràng.';

    return [
        'Bạn là gia sư lớp 2-3.',
        `Câu hỏi/đề bài: "${prompt}"`,
        `Học sinh trả lời: "${studentAnswer}"`,
        `Đáp án tham khảo: "${correctAnswer}"`,
        context,
        'Trả về JSON duy nhất: {"isCorrect":boolean,"explain":string,"microLesson":string,"quality":"Xuất sắc"|"Giỏi"|"Khá"|"Trung bình"|"Yếu"}.',
        'explain và microLesson phải ngắn.',
    ].join('\n');
}

function fallbackResponse() {
    return {
        isCorrect: false,
        quality: 'Yếu',
        errorTag: 'khac',
        explain: 'Hệ thống chấm đang phản hồi chậm hoặc gặp lỗi nhỏ.',
        microLesson: 'Con thử lại một lần nữa nhé, hoặc gửi bài bằng chữ để được chấm nhanh hơn.',
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null) as EvaluateBody | null;

        const prompt = body?.prompt || '';
        const studentAnswer = body?.studentAnswer || '';
        const correctAnswer = body?.correctAnswer || '';
        const skillId = body?.skillId || '';
        const audioData = body?.audioData;
        const mimeType = body?.mimeType;

        if (!skillId || !prompt) {
            return NextResponse.json({ error: 'Missing skillId or prompt' }, { status: 400 });
        }

        const apiKeys = getApiKeys();
        if (apiKeys.length === 0) {
            return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
        }

        const shuffledKeys = [...apiKeys].sort(() => Math.random() - 0.5);
        let lastError: unknown = null;

        for (const selectedKey of shuffledKeys) {
            try {
                const genAI = new GoogleGenerativeAI(selectedKey);
                const useDetailedAudioPrompt = Boolean(audioData) && shouldUseDetailedAudioPrompt(skillId);
                const model = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: useDetailedAudioPrompt ? 220 : 160,
                        responseMimeType: 'application/json',
                    },
                });

                const isSummary = skillId === 'SESSION_SUMMARY';
                let parts: (string | { text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

                if (isSummary) {
                    parts = [buildSummaryPrompt(prompt, studentAnswer)];
                } else if (audioData) {
                    parts = [
                        { text: useDetailedAudioPrompt ? buildDetailedAudioInstruction(skillId, prompt) : buildAudioInstruction(skillId, prompt) },
                        {
                            inlineData: {
                                mimeType: mimeType || 'audio/webm',
                                data: audioData,
                            },
                        },
                    ];
                } else {
                    parts = [buildTextInstruction(prompt, studentAnswer, correctAnswer, skillId)];
                }

                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Gemini API timeout')), 20000)
                );
                
                const result = await Promise.race([
                    model.generateContent(parts),
                    timeoutPromise
                ]) as any;
                
                const responseText = result.response.text();

                // Robust JSON extraction
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error('LLM output does not contain JSON:', responseText);
                    throw new Error('Failed to parse Gemini response: No JSON found');
                }

                let data;
                try {
                    data = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('JSON parse failed for:', jsonMatch[0]);
                    throw new Error('Failed to parse Gemini response: Invalid JSON');
                }

                // Ensure schema consistency
                if (typeof data.isCorrect !== 'boolean') {
                    data.isCorrect = String(data.isCorrect).toLowerCase().includes('true') 
                        || String(data.quality).toLowerCase().includes('xuất sắc')
                        || String(data.quality).toLowerCase().includes('giỏi');
                }

                if (!data.quality) {
                    data.quality = data.isCorrect ? 'Giỏi' : 'Yếu';
                }

                if (!data.explain) {
                    data.explain = data.isCorrect ? 'Chính xác! Giỏi lắm!' : 'Chưa đúng rồi, bé thử lại nhé!';
                }

                return NextResponse.json(data);
            } catch (error: unknown) {
                lastError = error;
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`API Key rotation (evaluate): one key failed, trying next. Error: ${errorMessage}`);
            }
        }

        throw lastError;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(fallbackResponse());
    }
}
