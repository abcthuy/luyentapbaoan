
import { Course } from '../types';

export const englishCourse: Course = {
    id: 'english',
    name: 'Tiếng Anh',
    description: 'Luyện 4 kỹ năng Nghe - Nói - Đọc - Viết.',
    color: 'emerald', // Green theme
    topics: [
        {
            id: 'vocab-1',
            name: 'Từ vựng (Vocabulary)',
            skills: [
                { id: 'eng-colors', name: 'Colors (Màu sắc)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-animals', name: 'Animals (Động vật)', tier: 1, grade: 2, semester: 2 },
                { id: 'eng-family', name: 'Family (Gia đình)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-school', name: 'School (Trường học)', tier: 1, grade: 2, semester: 1 },
                // Grade 3
                { id: 'eng-clothes', name: 'Clothes (Quần áo)', tier: 1, grade: 3, semester: 1 },
                { id: 'eng-food', name: 'Food & Drink (Đồ ăn)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng-routine', name: 'Daily Routine (Hàng ngày)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng-house', name: 'My House (Nhà cửa)', tier: 1, grade: 3, semester: 2 },
            ]
        },
        {
            id: 'phonics',
            name: 'Ngữ âm (Phonics)',
            skills: [
                { id: 'eng-phonics-a', name: 'Letter A', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-phonics-b', name: 'Letter B', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-phonics-c', name: 'Letter C', tier: 1, grade: 2, semester: 1 },
                // Grade 3 - Vowels and Blends
                { id: 'eng-vowels', name: 'Short Vowels (aeiou)', tier: 1, grade: 3, semester: 1 },
                { id: 'eng-blends', name: 'Consonant Blends (bl, cr...)', tier: 2, grade: 3, semester: 2 },
            ]
        },
        {
            id: 'grammar',
            name: 'Mẫu câu (Sentences)',
            skills: [
                { id: 'eng-hello', name: 'Greetings (Chào hỏi)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-qa-name', name: "What's your name?", tier: 1, grade: 2, semester: 1 },
                { id: 'eng-qa-this-that', name: "What's this/that?", tier: 2, grade: 2, semester: 2 },
                // Grade 3
                { id: 'eng-grammar-present', name: 'Present Simple (Hiện tại đơn)', tier: 2, grade: 3, semester: 1 },
                { id: 'eng-grammar-continuous', name: 'Acting Now (Đang làm gì)', tier: 2, grade: 3, semester: 2 },
                { id: 'eng-prepositions', name: 'Prepositions (In/On/Under)', tier: 1, grade: 3, semester: 2 },
            ]
        },
        {
            id: 'skills',
            name: 'Kỹ năng (4 Skills)',
            skills: [
                // Grade 2
                { id: 'eng2-list', name: 'Listening: Colors & Numbers', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-speak', name: 'Speaking: Introduce Yourself', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-read', name: 'Reading: Short Sentences', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-write', name: 'Writing: Simple Words', tier: 1, grade: 2, semester: 1 },
                // Grade 3
                { id: 'eng3-list', name: 'Listening: Short Stories', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-speak', name: 'Speaking: Daily Routine', tier: 2, grade: 3, semester: 2 },
                { id: 'eng-story-quest', name: 'Story Quest 🎧📖 (Nghe hiểu)', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-read', name: 'Reading: Comprehension', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-write', name: 'Writing: Paragraphs', tier: 2, grade: 3, semester: 2 },
            ]
        }
    ]
};
