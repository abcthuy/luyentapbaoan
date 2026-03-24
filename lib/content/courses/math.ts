
import { Course } from '../types';

export const mathCourse: Course = {
    id: 'math',
    name: 'Toán Học',
    description: 'Chinh phục các con số, hình học và tư duy logic.',
    color: 'blue',
    topics: [
        {
            id: 'so-hoc',
            name: 'Số học & Phép tính',
            skills: [
                { id: 'A1', name: 'Cấu tạo số & so sánh (≤1000)', tier: 1, grade: 2, semester: 1 },
                { id: 'A2', name: 'Cộng–trừ (≤1000)', tier: 1, grade: 2, semester: 1 },
                { id: 'A3', name: 'Điền số còn thiếu (□)', tier: 1, grade: 2, semester: 1 },
                { id: 'A4', name: 'Nhân–chia bảng 2 & 5', tier: 1, grade: 2, semester: 2 },
                { id: 'B1', name: 'Lời văn 1 bước', tier: 2, grade: 2, semester: 1 },
                { id: 'B2', name: 'Lời văn 2 bước', tier: 2, grade: 2, semester: 2 },
                // Grade 3
                { id: 'm3-so-10k', name: 'Các số đến 10.000 & 100.000', tier: 1, grade: 3, semester: 1 },
                { id: 'm3-cong-tru-100k', name: 'Cộng/Trừ phạm vi 100.000', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-nhan-chia-lon', name: 'Nhân/Chia số nhiều chữ số', tier: 2, grade: 3, semester: 2 },
                { id: 'm3-bang-nhan', name: 'Bảng nhân/chia 3, 4, 6, 7, 8, 9', tier: 1, grade: 3, semester: 1 },
            ]
        },
        {
            id: 'hinh-hoc',
            name: 'Hình học & Đo lường',
            skills: [
                { id: 'C1', name: 'Độ dài & đường gấp khúc', tier: 1, grade: 2, semester: 1 },
                { id: 'C2', name: 'Thời gian (giờ/phút)', tier: 2, grade: 2, semester: 2 },
                { id: 'D1', name: 'Hình học (đếm đoạn/nhận biết)', tier: 1, grade: 2, semester: 1 },
                // Grade 3
                { id: 'm3-chu-vi', name: 'Chu vi & Diện tích', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-goc', name: 'Góc vuông & Không vuông', tier: 1, grade: 3, semester: 1 },
                { id: 'm3-don-vi', name: 'Đơn vị đo lường (mm, ml, g)', tier: 1, grade: 3, semester: 2 },
            ]
        },

        {
            id: 'tu-duy',
            name: 'Tư duy & Logic',
            skills: [
                { id: 'D2', name: 'Biểu đồ tranh/bảng', tier: 2, grade: 2, semester: 2 },
                { id: 'E1', name: 'Quy luật dãy số', tier: 2, grade: 2, semester: 2 },
                { id: 'E2', name: 'Bảng ô số (hàng–cột)', tier: 2, grade: 2, semester: 2 },
                { id: 'E3', name: 'Tháp số', tier: 2, grade: 2, semester: 2 },
                // Grade 3
                { id: 'm3-thong-ke', name: 'Làm quen với Thống kê', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-phan-so', name: 'Phân số đơn giản (1/2, 1/3...)', tier: 2, grade: 3, semester: 2 },
                { id: 'm3-xac-suat', name: 'Khả năng xảy ra sự kiện', tier: 2, grade: 3, semester: 2 },
            ]
        }
    ]
};
