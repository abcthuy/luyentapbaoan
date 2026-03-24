
import { Course } from '../types';

export const financeCourse: Course = {
    id: 'finance',
    name: 'Tài chính Thông minh',
    description: 'Bé học về Tiền và Cách Quản lý chi tiêu',
    topics: [
        {
            id: 'money-basis',
            name: 'Làm quen với Tiền',
            skills: [
                { id: 'C3', name: 'Nhận biết tiền Việt Nam', tier: 1, grade: 2, instructions: 'Phân biệt mệnh giá, so sánh giá trị.' },
                { id: 'identify-money', name: 'Nhận biết tờ tiền (Cơ bản)', tier: 1, grade: 2 },
                { id: 'compare-value', name: 'So sánh giá trị', tier: 1, grade: 2 },
                { id: 'money-sum', name: 'Cộng tiền đơn giản', tier: 2, grade: 2 },
            ]
        },
        {
            id: 'smart-spending',
            name: 'Chi tiêu Thông minh',
            skills: [
                { id: 'fin2-shopping', name: 'Đi chợ: Tính tiền 2 món', tier: 2, grade: 2, instructions: 'Cộng trừ tiền đơn giản.' },
                { id: 'fin3-calc', name: 'Đi chợ: Tính tiền nhiều bước', tier: 2, grade: 3, instructions: 'Tính tổng nhiều món, tiền thừa.' },
                { id: 'shopping-math', name: 'Đi chợ thông minh (Nâng cao)', tier: 2, grade: 2 },
                { id: 'need-vs-want', name: 'Cần hay Muốn?', tier: 1, grade: 2 },
                { id: 'saving-goal', name: 'Đạt mục tiêu tiết kiệm', tier: 2, grade: 2 },
            ]
        },
        {
            id: 'earning',
            name: 'Kiếm tiền & Tiết kiệm',
            skills: [
                { id: 'fin2-saving', name: 'Heo đất: Tập tiết kiệm', tier: 2, grade: 2, instructions: 'Phân biệt Cần vs Muốn.' },
                { id: 'fin3-budget', name: 'Quản lý ngân sách tuần', tier: 3, grade: 3, instructions: 'Lập kế hoạch thu chi đơn giản.' },
                { id: 'job-value', name: 'Nghề nghiệp & Thu nhập', tier: 1, grade: 2 },
                { id: 'saving-pig', name: 'Nuôi heo đất (Cơ bản)', tier: 1, grade: 2 },
            ]
        }
    ]
};
