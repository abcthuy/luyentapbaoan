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
                { id: 'A2', name: 'Cộng-trừ (≤1000)', tier: 1, grade: 2, semester: 1 },
                { id: 'A3', name: 'Điền số còn thiếu', tier: 1, grade: 2, semester: 1 },
                { id: 'A4', name: 'Nhân-chia bảng 2 & 5', tier: 1, grade: 2, semester: 2 },
                { id: 'B1', name: 'Lời văn 1 bước', tier: 2, grade: 2, semester: 1 },
                { id: 'B2', name: 'Lời văn 2 bước', tier: 2, grade: 2, semester: 2 },
                { id: 'm3-so-10k', name: 'Các số đến 10.000 & 100.000', tier: 1, grade: 3, semester: 1 },
                { id: 'm3-cong-tru-100k', name: 'Cộng-trừ phạm vi 100.000', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-nhan-chia-lon', name: 'Nhân-chia số nhiều chữ số', tier: 2, grade: 3, semester: 2 },
                { id: 'm3-bang-nhan', name: 'Bảng nhân-chia 3, 4, 6, 7, 8, 9', tier: 1, grade: 3, semester: 1 },
                { id: 'm4-so-lon', name: 'Số lớn đến hàng triệu', tier: 1, grade: 4, semester: 1 },
                { id: 'm4-cong-tru-nhan-chia', name: 'Bốn phép tính với số tự nhiên', tier: 2, grade: 4, semester: 1 },
                { id: 'm5-so-thap-phan', name: 'Số thập phân cơ bản', tier: 1, grade: 5, semester: 1 },
                { id: 'm5-ti-so-phan-tram', name: 'Tỉ số phần trăm & tỉ lệ', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'hinh-hoc',
            name: 'Hình học & Đo lường',
            skills: [
                { id: 'C1', name: 'Độ dài & đường gấp khúc', tier: 1, grade: 2, semester: 1 },
                { id: 'C2', name: 'Thời gian (giờ/phút)', tier: 2, grade: 2, semester: 2 },
                { id: 'D1', name: 'Hình học (đếm đoạn/nhận biết)', tier: 1, grade: 2, semester: 1 },
                { id: 'm3-chu-vi', name: 'Chu vi & Diện tích', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-goc', name: 'Góc vuông & Không vuông', tier: 1, grade: 3, semester: 1 },
                { id: 'm3-don-vi', name: 'Đơn vị đo lường (mm, ml, g)', tier: 1, grade: 3, semester: 2 },
                { id: 'm4-goc-do-thoi-gian', name: 'Góc, độ, giây & thế kỷ', tier: 1, grade: 4, semester: 1 },
                { id: 'm4-dien-tich-hinh', name: 'Diện tích hình chữ nhật, hình vuông', tier: 2, grade: 4, semester: 2 },
                { id: 'm5-the-tich', name: 'Thể tích hình hộp chữ nhật, hình lập phương', tier: 2, grade: 5, semester: 2 },
                { id: 'm5-don-vi-do', name: 'Đổi đơn vị đo độ dài, diện tích, thể tích', tier: 2, grade: 5, semester: 1 },
            ]
        },
        {
            id: 'tu-duy',
            name: 'Tư duy & Logic',
            skills: [
                { id: 'D2', name: 'Biểu đồ tranh/bảng', tier: 2, grade: 2, semester: 2 },
                { id: 'E1', name: 'Quy luật dãy số', tier: 2, grade: 2, semester: 2 },
                { id: 'E2', name: 'Bảng ô số (hàng-cột)', tier: 2, grade: 2, semester: 2 },
                { id: 'E3', name: 'Tháp số', tier: 2, grade: 2, semester: 2 },
                { id: 'm3-thong-ke', name: 'Làm quen với Thống kê', tier: 1, grade: 3, semester: 2 },
                { id: 'm3-phan-so', name: 'Phân số đơn giản', tier: 2, grade: 3, semester: 2 },
                { id: 'm3-xac-suat', name: 'Khả năng xảy ra sự kiện', tier: 2, grade: 3, semester: 2 },
                { id: 'm4-phan-so', name: 'Phân số & so sánh phân số', tier: 1, grade: 4, semester: 2 },
                { id: 'm4-trung-binh-cong', name: 'Trung bình cộng & dãy số', tier: 2, grade: 4, semester: 2 },
                { id: 'm5-bieu-do', name: 'Đọc biểu đồ, bảng số liệu', tier: 1, grade: 5, semester: 1 },
                { id: 'm5-bai-toan-thuc-te', name: 'Bài toán thực tế nhiều bước', tier: 2, grade: 5, semester: 2 },
            ]
        }
    ]
};
