export type EvaluatorPersona = 'tutor-1' | 'tutor-2';

export interface LocalEvaluationResult {
    isCorrect: boolean;
    explain: string;
    microLesson: string;
    quality: string;
}

// ─── Bỏ dấu tiếng Việt để so sánh mờ (fuzzy) ───
function removeDiacritics(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// ─── Chuẩn hoá chuỗi trước khi so sánh ───
function normalize(str: string): string {
    return str.toLowerCase()
        .replace(/[.,!?;:()"""'''\-–—…]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ─── Tính khoảng cách Levenshtein giữa 2 từ ───
function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// ─── So khớp 2 từ (chính xác + mờ + bỏ dấu) ───
function wordMatch(spoken: string, expected: string): number {
    if (spoken === expected) return 1.0;
    // So sánh bỏ dấu
    const a = removeDiacritics(spoken);
    const b = removeDiacritics(expected);
    if (a === b) return 0.85; // Đọc đúng âm nhưng sai dấu → vẫn tính phần lớn

    // Levenshtein fuzzy: cho phép sai 1-2 ký tự
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 0;
    const dist = levenshtein(a, b);
    const similarity = 1 - dist / maxLen;
    if (similarity >= 0.75) return similarity * 0.8; // Gần giống → tính 1 phần
    return 0;
}

// ─── Thuật toán Accuracy (so sánh theo thứ tự, cho phép mờ) ───
function calculateAccuracy(spoken: string, expected: string): { accuracy: number; matchedCount: number; totalExpected: number; missedWords: string[] } {
    const s1 = normalize(spoken);
    const s2 = normalize(expected);
    if (!s1 || !s2) return { accuracy: 0, matchedCount: 0, totalExpected: 0, missedWords: [] };

    const wordsSpoken = s1.split(' ');
    const wordsExpected = s2.split(' ');
    const totalExpected = wordsExpected.length;

    if (totalExpected === 0) return { accuracy: 100, matchedCount: 0, totalExpected: 0, missedWords: [] };

    // Greedy ordered matching: duyệt qua từng từ của bài gốc, 
    // tìm từ khớp tốt nhất trong phần transcript chưa dùng
    let score = 0;
    let spokenIdx = 0;
    const missedWords: string[] = [];

    for (let i = 0; i < wordsExpected.length; i++) {
        const expWord = wordsExpected[i];
        let bestScore = 0;
        let bestIdx = -1;

        // Tìm trong khoảng window phía trước (cho phép bé đọc lệch nhịp ±3 từ)
        const searchStart = Math.max(0, spokenIdx - 2);
        const searchEnd = Math.min(wordsSpoken.length - 1, spokenIdx + 4);

        for (let j = searchStart; j <= searchEnd; j++) {
            const matchScore = wordMatch(wordsSpoken[j], expWord);
            if (matchScore > bestScore) {
                bestScore = matchScore;
                bestIdx = j;
            }
        }

        if (bestScore >= 0.5) {
            score += bestScore;
            spokenIdx = bestIdx + 1;
        } else {
            missedWords.push(expWord);
        }
    }

    const accuracy = Math.min(100, Math.round((score / totalExpected) * 100));
    return { accuracy, matchedCount: Math.round(score), totalExpected, missedWords };
}

// ─── Đánh giá tốc độ đọc theo chuẩn tiểu học VN ───
function evaluateSpeed(wpm: number): { label: string; advice: string } {
    if (wpm < 40) return { label: 'Chậm', advice: 'đọc hơi chậm so với chuẩn' };
    if (wpm < 70) return { label: 'Vừa phải', advice: 'tốc độ vừa phải, đang ổn' };
    if (wpm < 120) return { label: 'Tốt', advice: 'tốc độ đọc rất chuẩn' };
    return { label: 'Nhanh', advice: 'đọc khá nhanh, nên chậm lại một chút để rõ ràng hơn' };
}

// ═══════════════════════════════════════════════════════════
//   ĐÁNH GIÁ CHÍNH
// ═══════════════════════════════════════════════════════════

export function evaluateReadingLocally(
    persona: EvaluatorPersona,
    transcript: string,
    expectedText: string,
    durationSeconds: number
): LocalEvaluationResult {
    // ─── Trường hợp không có transcript ───
    if (!transcript || !transcript.trim() || durationSeconds < 1) {
        return persona === 'tutor-1'
            ? {
                isCorrect: false,
                quality: 'Chưa đánh giá được',
                explain: 'Gia sư 1 chưa nhận được nội dung bài đọc. Con hãy đọc to và rõ ràng hơn nhé.',
                microLesson: 'Mẹo: Giữ micro gần miệng khoảng 15-20cm và đọc với giọng bình thường.'
            }
            : {
                isCorrect: false,
                quality: 'Chưa đánh giá được',
                explain: 'Gia sư 2 chưa nghe rõ giọng của con. Không sao đâu, con thử lại nhé!',
                microLesson: 'Con kiểm tra xem micro đã bật chưa, rồi đọc to hơn một chút xíu là được!'
            };
    }

    // ─── Tính toán các chỉ số ───
    const { accuracy, matchedCount, totalExpected, missedWords } = calculateAccuracy(transcript, expectedText);
    const wordsSpoken = normalize(transcript).split(' ').length;
    const wpm = durationSeconds > 0 ? Math.round((wordsSpoken / durationSeconds) * 60) : 0;
    const speed = evaluateSpeed(wpm);

    // Ngưỡng đạt: 30% (Web Speech API tiếng Việt với trẻ em khá hạn chế)
    // Nhưng cũng cộng điểm "cố gắng" nếu bé đọc đủ lượng từ
    const effortBonus = wordsSpoken >= totalExpected * 0.5 ? 10 : 0;
    const adjustedAccuracy = Math.min(100, accuracy + effortBonus);
    const isCorrect = adjustedAccuracy >= 30;

    // Xếp hạng
    let quality: string;
    let stars: number;
    if (adjustedAccuracy >= 85) { quality = '⭐ Xuất sắc'; stars = 5; }
    else if (adjustedAccuracy >= 70) { quality = '🌟 Giỏi'; stars = 4; }
    else if (adjustedAccuracy >= 50) { quality = '👍 Khá'; stars = 3; }
    else if (adjustedAccuracy >= 30) { quality = '💪 Đạt'; stars = 2; }
    else { quality = '📖 Cần luyện thêm'; stars = 1; }

    // Top 3 từ bị sót (để nhận xét cụ thể)
    const topMissed = missedWords.slice(0, 3);
    const missedNote = topMissed.length > 0
        ? `Một số từ con chưa đọc rõ: "${topMissed.join('", "')}".`
        : '';

    // ═══════════════════════════════════════════════
    //   GIA SƯ 1 — Chuyên môn, phân tích chi tiết
    //   Phong cách: Nghiêm túc nhưng công bằng, 
    //   luôn khen trước rồi mới góp ý
    // ═══════════════════════════════════════════════
    if (persona === 'tutor-1') {
        let explain = '';
        let microLesson = '';

        if (adjustedAccuracy >= 85) {
            explain = `Rất tốt! Con đọc chính xác ${accuracy}% bài (${matchedCount}/${totalExpected} từ). Tốc độ ${wpm} từ/phút — ${speed.advice}. Phát âm rõ ràng và lưu loát.`;
            microLesson = 'Con đã thể hiện rất tốt. Để hoàn thiện hơn, hãy chú ý ngắt nghỉ đúng dấu phẩy và dấu chấm.';
        } else if (adjustedAccuracy >= 70) {
            explain = `Khá tốt! Độ chính xác ${accuracy}% (${matchedCount}/${totalExpected} từ). Tốc độ ${wpm} từ/phút — ${speed.advice}. ${missedNote}`;
            microLesson = 'Con đọc tốt rồi. Hãy đọc lại những từ chưa rõ và chú ý nhấn giọng ở những từ quan trọng nhé.';
        } else if (adjustedAccuracy >= 50) {
            explain = `Con đang tiến bộ! Đọc được ${accuracy}% bài (${matchedCount}/${totalExpected} từ). Tốc độ ${wpm} từ/phút — ${speed.advice}. ${missedNote}`;
            microLesson = 'Gợi ý: Con đọc chậm hơn một chút, nhìn kỹ từng chữ trước khi đọc to. Như vậy sẽ chính xác hơn nhiều.';
        } else if (adjustedAccuracy >= 30) {
            explain = `Con cố gắng rồi! Hiện đạt ${accuracy}% bài (${matchedCount}/${totalExpected} từ). Tốc độ ${wpm} từ/phút. ${missedNote}`;
            microLesson = 'Không sao, luyện tập nhiều sẽ giỏi hơn. Con thử đọc thầm 1 lần trước, rồi đọc to lần 2 nhé.';
        } else {
            explain = `Con mới đọc được ${accuracy}% bài. Gia sư 1 thấy con cần luyện thêm bài này. ${missedNote}`;
            microLesson = 'Bước 1: Đọc thầm cả bài. Bước 2: Đánh dấu từ khó. Bước 3: Đọc to từng câu ngắn. Con sẽ tiến bộ nhanh thôi!';
        }

        return { isCorrect, quality, explain, microLesson };
    }

    // ═══════════════════════════════════════════════
    //   GIA SƯ 2 — Ấm áp, động viên, tình cảm
    //   Phong cách: Như một người mẹ/cha dạy con,
    //   luôn khen ngợi sự cố gắng trước tiên
    // ═══════════════════════════════════════════════
    let explain = '';
    let microLesson = '';

    if (adjustedAccuracy >= 85) {
        explain = `Tuyệt vời quá con ơi! 🎉 Con đọc đúng đến ${accuracy}% bài rồi — giỏi lắm luôn! Giọng con nghe rất truyền cảm, Gia sư 2 rất tự hào về con!`;
        microLesson = `Con giữ phong độ này nhé! Nếu muốn hay hơn nữa, con thử thêm cảm xúc vào giọng đọc — vui thì đọc nhanh hơn, buồn thì chậm lại.`;
    } else if (adjustedAccuracy >= 70) {
        explain = `Giỏi lắm con! 🌟 Con đọc được ${accuracy}% bài, gần hoàn hảo rồi! Tốc độ ${wpm} từ/phút nghe rất tự nhiên.`;
        microLesson = topMissed.length > 0
            ? `Mấy từ "${topMissed.join('", "')}" con đọc lại cho Gia sư nghe lần nữa nha, chắc chắn lần sau con sẽ nhớ!`
            : `Con cứ đọc thêm vài lần nữa là hoàn hảo luôn!`;
    } else if (adjustedAccuracy >= 50) {
        explain = `Con đọc tốt rồi đó! 👏 Được ${accuracy}% bài — con đang tiến bộ rõ rệt. Gia sư 2 thấy con rất chăm chỉ!`;
        microLesson = topMissed.length > 0
            ? `Con ơi, mấy từ "${topMissed.join('", "')}" hơi khó phải không? Con đọc chậm lại ở đoạn đó là sẽ đúng thôi.`
            : `Con thử đọc lại bài một lần nữa thật chậm, Gia sư 2 tin lần sau con sẽ đạt trên 70%!`;
    } else if (adjustedAccuracy >= 30) {
        explain = `Con dũng cảm lắm khi đọc bài này! 💪 Được ${accuracy}% — con đang bắt đầu tốt rồi đó.`;
        microLesson = 'Bí quyết của Gia sư 2: Con đọc thầm bài 2 lần trước, rồi đọc to lần 3. Mỗi lần đọc con sẽ nhớ thêm được nhiều từ hơn!';
    } else {
        explain = `Gia sư 2 thấy con đã rất cố gắng! 💖 Bài này hơi khó, đúng không? Không sao đâu con.`;
        microLesson = 'Con ơi, Gia sư 2 gợi ý nhé: Con nhờ ba mẹ đọc mẫu 1 lần, rồi con đọc theo. Làm 2-3 lần là con sẽ thuộc luôn á!';
    }

    return { isCorrect, quality, explain, microLesson };
}
