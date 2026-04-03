import { Course } from '../types';

export const englishCourse: Course = {
    id: 'english',
    name: 'Tiếng Anh',
    description: 'Luyện 4 kỹ năng Nghe - Nói - Đọc - Viết.',
    color: 'emerald',
    topics: [
        {
            id: 'vocab-1',
            name: 'Từ vựng (Vocabulary)',
            skills: [
                { id: 'eng-colors', name: 'Colors (Màu sắc)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-animals', name: 'Animals (Động vật)', tier: 1, grade: 2, semester: 2 },
                { id: 'eng-family', name: 'Family (Gia đình)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-school', name: 'School (Trường học)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-clothes', name: 'Clothes (Quần áo)', tier: 1, grade: 3, semester: 1 },
                { id: 'eng-food', name: 'Food & Drink (Đồ ăn)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng-routine', name: 'Daily Routine (Hàng ngày)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng-house', name: 'My House (Nhà cửa)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng4-weather', name: 'Weather & Seasons', tier: 1, grade: 4, semester: 1 },
                { id: 'eng4-hobbies', name: 'Hobbies & Free Time', tier: 1, grade: 4, semester: 2 },
                { id: 'eng5-travel', name: 'Travel & Places', tier: 1, grade: 5, semester: 1 },
                { id: 'eng5-health', name: 'Health & Healthy Habits', tier: 1, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'phonics',
            name: 'Ngữ âm (Phonics)',
            skills: [
                { id: 'eng-phonics-a', name: 'Letter A', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-phonics-b', name: 'Letter B', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-phonics-c', name: 'Letter C', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-vowels', name: 'Short Vowels (aeiou)', tier: 1, grade: 3, semester: 1 },
                { id: 'eng-blends', name: 'Consonant Blends (bl, cr...)', tier: 2, grade: 3, semester: 2 },
                { id: 'eng4-phonics', name: 'Long Vowels & Silent e', tier: 1, grade: 4, semester: 1 },
                { id: 'eng4-stress', name: 'Word Stress Basics', tier: 2, grade: 4, semester: 2 },
                { id: 'eng5-phonics', name: 'Digraphs & Common Endings', tier: 1, grade: 5, semester: 1 },
                { id: 'eng5-pronunciation', name: 'Pronunciation in Short Sentences', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'grammar',
            name: 'Mẫu câu (Sentences)',
            skills: [
                { id: 'eng-hello', name: 'Greetings (Chào hỏi)', tier: 1, grade: 2, semester: 1 },
                { id: 'eng-qa-name', name: "What's your name?", tier: 1, grade: 2, semester: 1 },
                { id: 'eng-qa-this-that', name: "What's this/that?", tier: 2, grade: 2, semester: 2 },
                { id: 'eng-grammar-present', name: 'Present Simple (Hiện tại đơn)', tier: 2, grade: 3, semester: 1 },
                { id: 'eng-grammar-continuous', name: 'Acting Now (Đang làm gì)', tier: 2, grade: 3, semester: 2 },
                { id: 'eng-prepositions', name: 'Prepositions (In/On/Under)', tier: 1, grade: 3, semester: 2 },
                { id: 'eng4-grammar', name: 'Can/Can\'t, There is/are', tier: 1, grade: 4, semester: 1 },
                { id: 'eng4-questions', name: 'Wh- Questions in Daily Life', tier: 2, grade: 4, semester: 2 },
                { id: 'eng5-grammar', name: 'Past Simple & Future Plans', tier: 1, grade: 5, semester: 1 },
                { id: 'eng5-connectors', name: 'Because, So, Then in Sentences', tier: 2, grade: 5, semester: 2 },
            ]
        },
        {
            id: 'skills',
            name: 'Kỹ năng (4 Skills)',
            skills: [
                { id: 'eng2-list', name: 'Listening: Colors & Numbers', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-speak', name: 'Speaking: Introduce Yourself', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-read', name: 'Reading: Short Sentences', tier: 1, grade: 2, semester: 1 },
                { id: 'eng2-write', name: 'Writing: Simple Words', tier: 1, grade: 2, semester: 1 },
                { id: 'eng3-list', name: 'Listening: Short Stories', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-speak', name: 'Speaking: Daily Routine', tier: 2, grade: 3, semester: 2 },
                { id: 'eng-story-quest', name: 'Story Quest (Nghe hiểu)', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-read', name: 'Reading: Comprehension', tier: 2, grade: 3, semester: 2 },
                { id: 'eng3-write', name: 'Writing: Paragraphs', tier: 2, grade: 3, semester: 2 },
                { id: 'eng4-list', name: 'Listening: Daily Situations', tier: 1, grade: 4, semester: 1 },
                { id: 'eng4-speak', name: 'Speaking: My Hobby/My Day', tier: 1, grade: 4, semester: 2 },
                { id: 'eng4-read', name: 'Reading: Short Passages', tier: 1, grade: 4, semester: 2 },
                { id: 'eng4-write', name: 'Writing: Guided Sentences', tier: 2, grade: 4, semester: 2 },
                { id: 'eng5-list', name: 'Listening: School & Travel Topics', tier: 1, grade: 5, semester: 1 },
                { id: 'eng5-speak', name: 'Speaking: Describe and Explain', tier: 1, grade: 5, semester: 2 },
                { id: 'eng5-read', name: 'Reading: Multi-sentence Texts', tier: 1, grade: 5, semester: 2 },
                { id: 'eng5-write', name: 'Writing: Short Paragraphs', tier: 2, grade: 5, semester: 2 },
            ]
        }
    ]
};
