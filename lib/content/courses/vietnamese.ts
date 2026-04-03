import { Course } from '../types';

export const vietnameseCourse: Course = {
    id: 'vietnamese',
    name: 'Tiếng Việt',
    description: 'Khám phá vẻ đẹp Tiếng Việt qua Đọc, Viết và cảm thụ văn học.',
    color: 'amber',
    topics: [
        {
            id: 'doc-hieu',
            name: 'Kỹ năng Đọc & Cảm thụ',
            skills: [
                { id: 'tv2-doc-hieu', name: 'Đọc hiểu văn bản ngắn (Lớp 2)', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-tho', name: 'Đọc thơ & ca dao (Lớp 2)', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-doc-dien-cam', name: 'Đọc diễn cảm (Thơ/Văn)', tier: 1, grade: 2, semester: 1 },
                { id: 'tv3-doc-hieu', name: 'Đọc hiểu văn bản thông tin (Lớp 3)', tier: 1, grade: 3, semester: 2 },
                { id: 'tv3-nghi-luan', name: 'Đọc văn bản nghị luận đơn giản (Lớp 3)', tier: 2, grade: 3, semester: 2 },
                { id: 'tv4-doc-hieu', name: 'Đọc hiểu truyện, kí, văn bản thông tin (Lớp 4)', tier: 1, grade: 4, semester: 1 },
                { id: 'tv4-cam-thu', name: 'Cảm thụ hình ảnh, chi tiết đẹp (Lớp 4)', tier: 2, grade: 4, semester: 2 },
                { id: 'tv5-doc-hieu', name: 'Đọc hiểu văn bản nhiều đoạn (Lớp 5)', tier: 1, grade: 5, semester: 1 },
                { id: 'tv5-nghi-luan', name: 'Nhận biết ý kiến, lí lẽ đơn giản (Lớp 5)', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'luyen-tu-cau',
            name: 'Luyện từ & Câu',
            skills: [
                { id: 'tv2-tu-ngu', name: 'Từ chỉ sự vật, hoạt động, đặc điểm', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-cau', name: 'Câu giới thiệu, câu nêu hoạt động', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-dau-cau', name: 'Dấu chấm, phẩy, chấm hỏi', tier: 1, grade: 2, semester: 1 },
                { id: 'tv3-tu-tu', name: 'Biện pháp so sánh & nhân hóa', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-loai-cau', name: 'Câu kể, câu hỏi, câu cảm, câu khiến', tier: 1, grade: 3, semester: 2 },
                { id: 'tv4-tu-loai', name: 'Danh từ, động từ, tính từ cơ bản', tier: 1, grade: 4, semester: 1 },
                { id: 'tv4-lien-ket-cau', name: 'Liên kết câu, liên kết đoạn', tier: 2, grade: 4, semester: 2 },
                { id: 'tv5-tu-dong-nghia', name: 'Từ đồng nghĩa, trái nghĩa, nhiều nghĩa', tier: 1, grade: 5, semester: 1 },
                { id: 'tv5-lien-ket-van-ban', name: 'Liên kết văn bản & thay thế từ ngữ', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'chinh-ta-tap-lam-van',
            name: 'Chính tả & Tập làm văn',
            skills: [
                { id: 'tv2-chinh-ta', name: 'Phân biệt tr/ch, s/x, r/d/gi', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-ke-chuyen', name: 'Viết: Kể chuyện theo tranh', tier: 2, grade: 2, semester: 2 },
                { id: 'tv2-ta-nguoi', name: 'Viết: Tả người thân', tier: 2, grade: 2, semester: 2 },
                { id: 'tv3-viet-thu', name: 'Viết thư & viết đơn', tier: 1, grade: 3, semester: 1 },
                { id: 'tv3-bao-cao', name: 'Viết báo cáo ngắn', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-sang-tao', name: 'Viết sáng tạo (gợi tả)', tier: 2, grade: 3, semester: 2 },
                { id: 'tv4-chinh-ta', name: 'Chính tả đoạn văn, tên riêng, dấu câu', tier: 1, grade: 4, semester: 1 },
                { id: 'tv4-mieu-ta', name: 'Viết miêu tả đồ vật, cây cối, con vật', tier: 2, grade: 4, semester: 2 },
                { id: 'tv5-tap-lam-van', name: 'Viết tả cảnh, tả người, kể chuyện sáng tạo', tier: 1, grade: 5, semester: 1 },
                { id: 'tv5-van-nghi-luan', name: 'Viết đoạn nêu ý kiến đơn giản', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'nghe-noi',
            name: 'Nghe & Nói',
            skills: [
                { id: 'tv2-noi-nghe', name: 'Kể lại việc đã làm', tier: 1, grade: 2, semester: 1 },
                { id: 'tv2-thuyet-trinh', name: 'Giới thiệu đồ vật/sách', tier: 2, grade: 2, semester: 2 },
                { id: 'tv3-thao-luan', name: 'Thảo luận & phản biện', tier: 2, grade: 3, semester: 2 },
                { id: 'tv3-hung-bien', name: 'Hùng biện nhí', tier: 2, grade: 3, semester: 2 },
                { id: 'tv4-noi-nghe', name: 'Kể lại câu chuyện, trao đổi ý kiến', tier: 1, grade: 4, semester: 1 },
                { id: 'tv4-thuyet-trinh', name: 'Thuyết trình ngắn theo chủ đề học tập', tier: 2, grade: 4, semester: 2 },
                { id: 'tv5-noi-nghe', name: 'Trình bày ý kiến rõ ràng, có lí lẽ', tier: 1, grade: 5, semester: 1 },
                { id: 'tv5-thao-luan', name: 'Thảo luận nhóm & phản hồi lịch sự', tier: 2, grade: 5, semester: 2 },
            ]
        }
    ]
};
