
import { Course } from '../types';

export const vietnameseCourse: Course = {
    id: 'vietnamese',
    name: 'Tiếng Việt',
    description: 'Khám phá vẻ đẹp Tiếng Việt qua Đọc, Viết và Cảm thụ văn học.',
    color: 'amber', // Warm, creative color
    topics: [
        {
            id: 'doc-hieu',
            name: 'Kỹ năng Đọc & Cảm thụ',
            skills: [
                { id: 'tv2-doc-hieu', name: 'Đọc hiểu văn bản ngắn (Lớp 2)', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-tho', name: 'Đọc thơ & Ca dao (Lớp 2)', tier: 1, grade: 2, semester: 1 },
                { id: 'tv3-doc-hieu', name: 'Đọc hiểu văn bản thông tin (Lớp 3)', tier: 1, grade: 3, semester: 2 },
                { id: 'tv3-nghi-luan', name: 'Đọc văn bản nghị luận đơn giản (Lớp 3)', tier: 2, grade: 3, semester: 2 },
                { id: 'tv2-doc-dien-cam', name: 'Đọc diễn cảm (Thơ/Văn)', tier: 1, grade: 2, semester: 1 },
            ]
        },
        {
            id: 'luyen-tu-cau',
            name: 'Luyện từ & Câu',
            skills: [
                { id: 'tv2-tu-ngu', name: 'Từ chỉ sự vật, hoạt động, đặc điểm', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-cau', name: 'Câu giới thiệu, Câu nêu hoạt động', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-dau-cau', name: 'Dấu chấm, phẩy, chấm hỏi', tier: 1, grade: 2, semester: 1 },
                { id: 'tv3-tu-tu', name: 'Biện pháp so sánh & nhân hóa', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-loai-cau', name: 'Câu kể, Câu hỏi, Câu cảm, Câu khiến', tier: 1, grade: 3, semester: 2 },
            ]
        },
        {
            id: 'chinh-ta-tap-lam-van',
            name: 'Chính tả & Tập làm văn',
            skills: [
                { id: 'tv2-chinh-ta', name: 'Phân biệt tr/ch, s/x, r/d/gi', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-ke-chuyen', name: 'Viết: Kể chuyện theo tranh', tier: 2, grade: 2, semester: 2 },
                { id: 'tv2-ta-nguoi', name: 'Viết: Tả người thân', tier: 2, grade: 2, semester: 2 },
                // Grade 3
                { id: 'tv3-viet-thu', name: 'Viết thư & Viết đơn', tier: 1, grade: 3, semester: 1 },
                { id: 'tv3-bao-cao', name: 'Viết báo cáo ngắn', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-sang-tao', name: 'Viết sáng tạo (Gợi tả)', tier: 2, grade: 3, semester: 2 },
            ]
        },
        {
            id: 'nghe-noi',
            name: 'Nghe & Nói',
            skills: [
                { id: 'tv2-noi-nghe', name: 'Kể lại việc đã làm', tier: 1, grade: 2, semester: 1 },

                { id: 'tv2-thuyet-trinh', name: 'Giới thiệu đồ vật/sách', tier: 2, grade: 2, semester: 2 },
                { id: 'tv3-thao-luan', name: 'Thảo luận & Phản biện', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-hung-bien', name: 'Hùng biện nhí (Tranh luận)', tier: 2, grade: 3, semester: 2 },
            ]
        }
    ]
};
