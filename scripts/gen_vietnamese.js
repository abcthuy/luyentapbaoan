const fs = require('fs');
const path = require('path');

function generateVietnameseQuestions() {
    let questions = {};

    function addQuestions(skillId, level, arr) {
        if (!questions[skillId]) questions[skillId] = {};
        if (!questions[skillId][level]) questions[skillId][level] = [];
        questions[skillId][level].push(...arr);
    }

    function generateMCQ(idPrefix, skill, level, count, generatorFn) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(generatorFn(`${idPrefix}-${level}-${i}`, skill, level, i));
        }
        addQuestions(skill, level, arr);
    }

    function shuffle(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    // tv2-tu-ngu: Từ chỉ sự vật, hoạt động, đặc điểm (Lớp 2 HK1/HK2)
    const verbs = ['chạy', 'nhảy', 'hát', 'đọc', 'viết', 'bơi', 'múa', 'cười', 'noi', 'đi', 'bay'];
    const nouns = ['con mèo', 'quyển sách', 'ngôi nhà', 'chiếc xe', 'đám mây', 'ông mặt trời', 'bông hoa', 'cây bút'];
    const adjs = ['đẹp', 'xanh', 'cao', 'hiền lành', 'rực rỡ', 'chăm chỉ', 'nhanh nhẹn', 'thơm ngát'];

    generateMCQ('stat-vn-tu-ngu', 'tv2-tu-ngu', 1, 60, (id, skillId, level, i) => {
        const typeTarget = Math.floor(Math.random() * 3); // 0: verb, 1: noun, 2: adj
        let text, ans, options;

        if (typeTarget === 0) {
            ans = verbs[Math.floor(Math.random() * verbs.length)];
            options = shuffle([ans, nouns[0], nouns[1], adjs[0]]);
            text = 'Trong các từ sau, từ nào là từ chỉ HOẠT ĐỘNG?';
        } else if (typeTarget === 1) {
            ans = nouns[Math.floor(Math.random() * nouns.length)];
            options = shuffle([ans, verbs[0], verbs[1], adjs[1]]);
            text = 'Trong các từ sau, từ nào là từ chỉ SỰ VẬT?';
        } else {
            ans = adjs[Math.floor(Math.random() * adjs.length)];
            options = shuffle([ans, nouns[2], verbs[2], verbs[3]]);
            text = 'Trong các từ sau, từ nào là từ chỉ ĐẶC ĐIỂM?';
        }

        let uniqOpts = Array.from(new Set(options));
        while (uniqOpts.length < 4) uniqOpts.push(['mưa', 'nắng', 'gió', 'khóc', 'buồn'][Math.floor(Math.random() * 5)]);

        return {
            id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Phân loại từ ngữ nhé!',
            content: { text, options: shuffle(uniqOpts.slice(0, 4)) },
            answer: ans, explanation: `Từ "${ans}" thuộc loại từ mà câu hỏi yêu cầu.`
        };
    });

    // tv2-cau: Câu kiểu Ai làm gì? Ai thế nào?
    const actionSentences = ['Mẹ đang nấu cơm.', 'Em học bài.', 'Chim hót líu lo.', 'Gió thổi mạnh.'];
    const descSentences = ['Trời rất trong xanh.', 'Bông hoa này đẹp quá.', 'Mẹ em rất hiền.', 'Lớp em sạch sẽ.'];

    generateMCQ('stat-vn-cau', 'tv2-cau', 2, 50, (id, skillId, level, i) => {
        const isAction = Math.random() > 0.5;
        let s, ans, options;

        if (isAction) {
            s = actionSentences[Math.floor(Math.random() * actionSentences.length)];
            ans = 'Câu nêu hoạt động (Ai làm gì?)';
            options = [ans, 'Câu nêu đặc điểm (Ai thế nào?)', 'Câu giới thiệu (Ai là gì?)', 'Câu cầu khiến'];
        } else {
            s = descSentences[Math.floor(Math.random() * descSentences.length)];
            ans = 'Câu nêu đặc điểm (Ai thế nào?)';
            options = [ans, 'Câu nêu hoạt động (Ai làm gì?)', 'Câu giới thiệu (Ai là gì?)', 'Câu hỏi'];
        }

        return {
            id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Xác định kiểu câu!',
            content: { text: `Câu "${s}" thuộc kiểu câu nào?`, options: shuffle(options) },
            answer: ans, explanation: `Câu này thuộc kiểu ${ans}.`
        };
    });

    // tv3-tu-tu: So sánh & Nhân hóa (Lớp 3 HK2)
    const similes = [
        { s: 'Trẻ em như búp trên cành.', exp: 'Trẻ em được so sánh với búp trên cành.' },
        { s: 'Mắt thỏ hồng như viên ngọc ruby.', exp: 'Mắt thỏ được so sánh với ngọc ruby.' },
        { s: 'Lá cọ xòe tròn như cái ô.', exp: 'Lá cọ được so sánh với cái ô.' }
    ];
    const personifications = [
        { s: 'Chú gà trống gọi mọi người thức dậy.', exp: 'Gà trống có hành động "gọi" như con người.' },
        { s: 'Chị mây khóc sụt sùi.', exp: 'Mây có hành động "khóc" và được gọi là "Chị".' },
        { s: 'Ông mặt trời đạp xe qua đỉnh núi.', exp: 'Mặt trời được gọi là "Ông" và biết "đạp xe".' }
    ];

    generateMCQ('stat-vn-tu-tu', 'tv3-tu-tu', 3, 50, (id, skillId, level, i) => {
        const isSimile = Math.random() > 0.5;
        let item, ans, options;

        if (isSimile) {
            item = similes[Math.floor(Math.random() * similes.length)];
            ans = 'So sánh';
            options = [ans, 'Nhân hóa', 'Không có biện pháp nào', 'Cả So sánh và Nhân hóa'];
        } else {
            item = personifications[Math.floor(Math.random() * personifications.length)];
            ans = 'Nhân hóa';
            options = [ans, 'So sánh', 'Lời kêu gọi', 'Không có biện pháp nào'];
        }

        return {
            id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Biện pháp tu từ:',
            content: { text: `Câu văn sau sử dụng biện pháp nghệ thuật gì?\n"${item.s}"`, options: shuffle(options) },
            answer: ans, explanation: item.exp
        };
    });

    // tv3-doc-hieu: Đọc hiểu văn bản ngắn (Lớp 3)
    const shortTexts = [
        {
            t: "Sáng sớm, sương mù lãng đãng bao phủ quanh sườn đồi. Đàn chim én chao lượn trên bầu trời xanh thẳm báo hiệu mùa xuân đã về. Dưới thung lũng, muôn hoa đang đua nở.",
            q: "Đàn chim én báo hiệu điều gì?",
            a: "Mùa xuân đã về",
            o: ["Trời sắp mưa", "Mùa hè đến", "Mùa xuân đã về", "Mùa đông lạnh giá"]
        },
        {
            t: "Cậu bé Tích Chu ngày xưa rất ham chơi. Mất bà, cậu mới hối hận và đi tìm thuốc suối tiên để cứu bà. Trải qua bao gian nan, cuối cùng Tích Chu cũng mang được nước suối về.",
            q: "Tích Chu đi tìm gì để cứu bà?",
            a: "Nước suối tiên",
            o: ["Lá cây rừng", "Nước suối tiên", "Bác thợ săn", "Quả sồi"]
        }
    ];

    generateMCQ('stat-vn-doc-hieu', 'tv3-doc-hieu', 3, 40, (id, skillId, level, i) => {
        const item = shortTexts[i % shortTexts.length];
        return {
            id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Đọc đoạn văn và trả lời câu hỏi:',
            content: { text: `Đọc đoạn văn:\n"${item.t}"\n\nCâu hỏi: ${item.q}`, options: shuffle(item.o) },
            answer: item.a, explanation: `Thông tin có ngay trong đoạn văn: "${item.a}".`
        };
    });

    // tv2-chinh-ta: Phân biệt tr/ch, s/x, r/d/gi
    generateMCQ('stat-vn-chinh-ta', 'tv2-chinh-ta', 2, 60, (id, skillId, level, i) => {
        const pairs = [
            { c: 'Trong trẻo', w: 'Chong trẻo' },
            { c: 'Cây tre', w: 'Cây che' },
            { c: 'Buổi chiều', w: 'Buổi triều' },
            { c: 'Xanh xao', w: 'Sanh sao' },
            { c: 'Sạch sẽ', w: 'Xạch xẽ' },
            { c: 'Rực rỡ', w: 'Dực dỡ' },
            { c: 'Giúp đỡ', w: 'Rúp đỡ' },
        ];
        const pair = pairs[i % pairs.length];
        const wantCorrect = Math.random() > 0.5;

        if (wantCorrect) {
            const options = shuffle([pair.c, pair.w, pair.c.replace('e', 'a'), pair.w.replace('o', 'a')]);
            return {
                id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Tìm từ viết đúng chính tả!',
                content: { text: 'Từ nào dưới đây viết ĐÚNG chính tả?', options: shuffle(options) },
                answer: pair.c, explanation: `Từ '${pair.c}' viết đúng chính tả.`
            };
        } else {
            const options = shuffle([pair.w, pair.c, 'Mây bay', 'Gió thổi']);
            return {
                id, subjectId: 'vietnamese', skillId, type: 'mcq', instruction: 'Tìm từ viết SAI chính tả!',
                content: { text: 'Từ nào dưới đây viết SAI chính tả?', options: shuffle(options) },
                answer: pair.w, explanation: `Từ viết sai là '${pair.w}', phải viết đúng là '${pair.c}'.`
            };
        }
    });

    return questions;
}

const db = generateVietnameseQuestions();
let out = `import { Question } from '../types';

export const vietnameseStaticQuestions: Record<string, Record<number, Question[]>> = ${JSON.stringify(db, null, 4)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'content', 'static', 'vietnamese.ts'), out);
console.log('Vietnamese static bank generated successfully!');
