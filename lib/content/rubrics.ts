


export type RubricLevel = {
    level: string; // Khá, Giỏi, Rất giỏi, Xuất sắc
    criteria: string;
    check: string; // Quick check / verification method
};

export type SkillRubric = {
    category: string; // e.g., "Reading", "Speaking", "Financial Math"
    levels: RubricLevel[];
};

export const GRADE_RUBRICS: Record<string, Record<string, SkillRubric[]>> = {
    '2': {
        'vietnamese': [
            {
                category: 'Đọc thành tiếng',
                levels: [
                    { level: 'Khá', criteria: 'Đọc đúng đa số, ngắt nghỉ đúng.', check: 'Đọc 120-150 chữ, sai ≤ 6 lỗi.' },
                    { level: 'Giỏi', criteria: 'Đọc trôi chảy, nhấn giọng từ khóa.', check: 'Sai ≤ 3-4 lỗi/đoạn.' },
                    { level: 'Rất giỏi', criteria: 'Đọc diễn cảm nhẹ, biết tự sửa.', check: 'Đọc liền mạch, không đứt câu.' },
                    { level: 'Xuất sắc', criteria: 'Đọc diễn cảm phân vai, thay đổi tốc độ.', check: 'Đóng vai 2 nhân vật giọng khác nhau.' }
                ]
            },
            {
                category: 'Đọc hiểu',
                levels: [
                    { level: 'Khá', criteria: 'Trả lời Ai/Ở đâu/Khi nào.', check: 'Nêu nhân vật chính + 1 việc.' },
                    { level: 'Giỏi', criteria: 'Trả lời Vì sao đơn giản, có dẫn chứng.', check: 'Chỉ ra 1 câu chứng minh trong bài.' },
                    { level: 'Rất giỏi', criteria: 'Nêu ý chính, hiểu cảm xúc nhân vật.', check: 'Nói "nhân vật cảm thấy... vì...".' },
                    { level: 'Xuất sắc', criteria: 'Rút ra bài học, liên hệ thực tế.', check: 'Nêu bài học rút ra.' }
                ]
            },
            {
                category: 'Viết & Chính tả',
                levels: [
                    { level: 'Khá', criteria: 'Viết đúng phần lớn, đoạn 3-5 câu.', check: 'Chính tả 50-70 chữ, sai ≤ 6 lỗi.' },
                    { level: 'Giỏi', criteria: 'Ít lỗi, dùng dấu câu đúng, đoạn 5-7 câu.', check: 'Đoạn văn có kết nối (và/nhưng/vì).' },
                    { level: 'Rất giỏi', criteria: 'Dùng từ gợi tả, tránh lặp từ.', check: 'Có 3 từ miêu tả (màu/tiếng/cảm xúc).' },
                    { level: 'Xuất sắc', criteria: 'Có hình ảnh so sánh/nhân hóa, tự sửa hay hơn.', check: 'Viết 2 cách diễn đạt cho 1 câu.' }
                ]
            }
        ],
        'english': [
            {
                category: 'Listening',
                levels: [
                    { level: 'Khá', criteria: 'Hiểu mệnh lệnh lớp học, từ vựng quen thuộc.', check: 'Nghe hiểu colors, numbers.' },
                    { level: 'Giỏi', criteria: 'Hiểu câu ngắn 1 thông tin.', check: 'Hiểu "I like...", "This is...".' },
                    { level: 'Rất giỏi', criteria: 'Hiểu đoạn 2-3 câu, bắt từ khóa.', check: 'Chọn đúng tranh theo mô tả.' },
                    { level: 'Xuất sắc', criteria: 'Nghe và nhắc lại cụm 4-6 từ chuẩn.', check: 'Shadowing tốt.' }
                ]
            },
            {
                category: 'Speaking',
                levels: [
                    { level: 'Khá', criteria: 'Nói theo mẫu câu (My name is...).', check: 'Giới thiệu bản thân cơ bản.' },
                    { level: 'Giỏi', criteria: 'Hỏi đáp theo cặp (Do you like...?).', check: 'Hội thoại ngắn.' },
                    { level: 'Rất giỏi', criteria: 'Nói 4-5 câu về chủ đề (Family/School).', check: 'Thuyết trình ngắn.' },
                    { level: 'Xuất sắc', criteria: 'Nói liền mạch 6-8 câu, dùng nối từ.', check: 'Kể chuyện ngắn trôi chảy.' }
                ]
            }
        ],
        'math': [
            {
                category: 'Tài chính: Tiền & Giá trị',
                levels: [
                    { level: 'Khá', criteria: 'Nhận biết mệnh giá, so sánh đắt/rẻ.', check: 'Phân biệt các tờ tiền.' },
                    { level: 'Giỏi', criteria: 'Cộng trừ tiền 1-2 bước (mua 2 món).', check: 'Tính tổng tiền đi chợ.' },
                    { level: 'Rất giỏi', criteria: 'Tính tiền thừa khi mua 2-3 món.', check: 'Bài toán thối lại tiền.' },
                    { level: 'Xuất sắc', criteria: 'Ước lượng đủ/thiếu.', check: 'Cho 50k, mua 12k+18k, còn bao nhiêu?' }
                ]
            },
            {
                category: 'Tài chính: Tiết kiệm',
                levels: [
                    { level: 'Khá', criteria: 'Phân biệt Cần vs Muốn.', check: 'Lấy ví dụ vật dụng cần thiết.' },
                    { level: 'Giỏi', criteria: 'Có mục tiêu tiết kiệm nhỏ.', check: 'Lên kế hoạch mua món đồ nhỏ.' },
                    { level: 'Rất giỏi', criteria: 'Thực hiện để dành hàng tuần.', check: 'Theo dõi heo đất.' },
                    { level: 'Xuất sắc', criteria: 'Theo dõi thu-chi, tự điều chỉnh.', check: 'Lập ngân sách đơn giản.' }
                ]
            }
        ]
    },
    '3': {
        'vietnamese': [
            {
                category: 'Đọc hiểu',
                levels: [
                    { level: 'Khá', criteria: 'Trả lời đúng câu hỏi trực tiếp.', check: 'Nêu ý chính đoạn.' },
                    { level: 'Giỏi', criteria: 'Trả lời Vì sao + dẫn chứng.', check: 'Giải thích nguyên nhân.' },
                    { level: 'Rất giỏi', criteria: 'Suy luận nguyên nhân - kết quả.', check: 'Hiểu cảm xúc ẩn.' },
                    { level: 'Xuất sắc', criteria: 'So sánh, rút thông điệp.', check: 'Liên hệ bản thân sâu sắc.' }
                ]
            },
            {
                category: 'Viết',
                levels: [
                    { level: 'Khá', criteria: 'Viết đoạn 5-7 câu, ít lỗi.', check: 'Chính tả ≤ 6 lỗi.' },
                    { level: 'Giỏi', criteria: 'Câu đa dạng, đoạn 7-9 câu mạch lạc.', check: 'Có câu chủ đề.' },
                    { level: 'Rất giỏi', criteria: 'Lập dàn ý trước khi viết, từ gợi tả.', check: 'Dàn ý 3 phần.' },
                    { level: 'Xuất sắc', criteria: 'Giàu hình ảnh, tự chỉnh sửa.', check: 'Viết cùng đề theo 2 cách.' }
                ]
            }
        ],
        'math': [
            {
                category: 'Tài chính: Tính toán',
                levels: [
                    { level: 'Khá', criteria: 'Cộng trừ tiền 2 bước.', check: 'Mua 2-3 món đơn giản.' },
                    { level: 'Giỏi', criteria: 'Tính toán 3-4 món, nhóm số nhanh.', check: 'Tính nhẩm nhanh tiền đi chợ.' },
                    { level: 'Rất giỏi', criteria: 'Bài toán còn lại/thiếu, kiểm tra kết quả.', check: 'Dự toán chi tiêu.' },
                    { level: 'Xuất sắc', criteria: 'Giải thích 2 cách tính khác nhau.', check: 'Tối ưu hóa cách tính.' }
                ]
            },
            {
                category: 'Tài chính: Ngân sách',
                levels: [
                    { level: 'Khá', criteria: 'Có mục tiêu tuần.', check: 'Mỗi tuần để dành X đồng.' },
                    { level: 'Giỏi', criteria: 'Ghi chép thu chi tuần.', check: 'Sổ tay chi tiêu.' },
                    { level: 'Rất giỏi', criteria: 'Ưu tiên chi tiêu, đặt giới hạn.', check: 'Phân bổ ngân sách.' },
                    { level: 'Xuất sắc', criteria: 'Điều chỉnh kế hoạch khi lỡ chi quá.', check: 'Xử lý tình huống thâm hụt.' }
                ]
            }
        ]
    }
};

export function getRubric(grade: number | string, subjectId: string, category?: string) {
    const gradeRubrics = GRADE_RUBRICS[grade.toString()];
    if (!gradeRubrics) return null;

    const subjectRubrics = gradeRubrics[subjectId];
    if (!subjectRubrics) return null;

    if (category) {
        return subjectRubrics.find(r => r.category.includes(category) || category.includes(r.category));
    }
    return subjectRubrics;
}
