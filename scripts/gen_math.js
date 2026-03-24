const fs = require('fs');
const path = require('path');

function generateMathQuestions() {
    let questions = {};

    function addQuestions(skillId, level, arr) {
        if (!questions[skillId]) questions[skillId] = {};
        if (!questions[skillId][level]) questions[skillId][level] = [];
        questions[skillId][level].push(...arr);
    }

    // Helper to generate multiple MCQ variations
    function generateMCQ(idPrefix, skill, level, count, generatorFn) {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push(generatorFn(`${idPrefix}-${level}-${i}`, skill, level));
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

    // A4: Nhân chia bảng 2 & 5 (và mở rộng)
    generateMCQ('stat-m-a4', 'A4', 1, 40, (id, skillId, level) => {
        const isMul = Math.random() > 0.5;
        const base = Math.random() > 0.5 ? 2 : 5;
        const mult = Math.floor(Math.random() * 9) + 2; // 2 to 10
        if (isMul) {
            const ans = base * mult;
            const options = shuffle([`${ans}`, `${ans + base}`, `${ans - base}`, `${ans + 1}`]);
            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Tính nhẩm nhanh nào!',
                content: { text: `${base} x ${mult} = ?`, options },
                answer: `${ans}`, explanation: `${base} nhân ${mult} bằng ${ans}.`
            };
        } else {
            const prod = base * mult;
            const options = shuffle([`${mult}`, `${mult + 1}`, `${Math.max(1, mult - 1)}`, `${mult + 2}`]);
            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Làm phép chia nhé!',
                content: { text: `${prod} : ${base} = ?`, options },
                answer: `${mult}`, explanation: `${prod} chia ${base} bằng ${mult}.`
            };
        }
    });

    // A4: Level 2 (Tìm x, phép tính kết hợp)
    generateMCQ('stat-m-a4-lvl2', 'A4', 2, 40, (id, skillId, level) => {
        const base = Math.random() > 0.5 ? 2 : 5;
        const mult = Math.floor(Math.random() * 8) + 2;
        const prod = base * mult;
        const add = Math.floor(Math.random() * 20) + 5;
        const ans = prod + add;

        let strOpts = [`${ans}`, `${ans + 10}`, `${Math.max(0, ans - 5)}`, `${ans + 2}`];
        // Deduplicate
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 50)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Thực hiện phép tính kết hợp!',
            content: { text: `${base} x ${mult} + ${add} = ?`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${ans}`, explanation: `Ta thực hiện phép nhân trước: ${base} x ${mult} = ${prod}. Sau đó cộng thêm ${add} được ${ans}.`
        };
    });

    // B2: Lời văn 2 bước (Grade 2, Semester 2)
    const wordProblemTemplates2Steps = [
        (a, b, c) => ({
            text: `Một cửa hàng có ${a}kg gạo. Buổi sáng bán được ${b}kg, buổi chiều bán được ${c}kg. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`,
            ans: a - b - c, options: [a - b - c, a - b, a - c, a - b - c + 10],
            exp: `Số gạo đã bán: ${b} + ${c} = ${b + c}kg. Số gạo còn lại: ${a} - ${b + c} = ${a - b - c}kg.`
        }),
        (a, b, c) => ({
            text: `Bạn Lan có ${a} viên kẹo, bạn Hoa có nhiều hơn Lan ${b} viên kẹo. Hỏi cả hai bạn có tất cả bao nhiêu viên kẹo?`,
            ans: a + (a + b), options: [a + a + b, a + b, a * 2 + b + 5, a * 2],
            exp: `Số kẹo của Hoa là: ${a} + ${b} = ${a + b} viên. Cả hai bạn có: ${a} + ${a + b} = ${a + a + b} viên.`
        }),
        (a, b, c) => ({
            text: `Mẹ mua ${a} quả trứng. Bữa trưa mẹ dùng ${b} quả, bữa tối mẹ dùng ${c} quả. Hỏi mẹ còn lại bao nhiêu quả trứng?`,
            ans: a - b - c, options: [a - b - c, a - b, a - c, a - b - c + 2],
            exp: `Số trứng mẹ đã dùng là: ${b} + ${c} = ${b + c} quả. Số trứng còn lại là: ${a} - ${b + c} = ${a - b - c} quả.`
        })
    ];

    generateMCQ('stat-m-b2', 'B2', 3, 50, (id, skillId, level) => {
        const tmplIndex = Math.floor(Math.random() * wordProblemTemplates2Steps.length);
        const tmpl = wordProblemTemplates2Steps[tmplIndex];
        let a, b, c;
        if (tmplIndex === 0) { a = Math.floor(Math.random() * 40) + 50; b = Math.floor(Math.random() * 20) + 10; c = Math.floor(Math.random() * 20) + 10; }
        else if (tmplIndex === 1) { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * 10) + 5; c = 2; }
        else { a = Math.floor(Math.random() * 10) + 20; b = Math.floor(Math.random() * 5) + 3; c = Math.floor(Math.random() * 5) + 3; }

        const { text, ans, options, exp } = tmpl(a, b, c);

        let strOpts = options.map(String);
        strOpts[Math.floor(Math.random() * 4)] = String(ans); // Ensure answer is present
        let uniqOpts = Array.from(new Set(strOpts));
        while (uniqOpts.length < 4) uniqOpts.push(String(Math.floor(Math.random() * 50)));

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Đọc kỹ đề toán đố!',
            content: { text, options: shuffle(uniqOpts.slice(0, 4)) },
            answer: String(ans), explanation: exp
        };
    });

    // m3-so-10k: Các số đến 10.000 / 100.000 (Lớp 3)
    // Level 1: Nhận biết, Đọc số
    generateMCQ('stat-m-m3-so', 'm3-so-10k', 1, 30, (id, skillId, level) => {
        const num = Math.floor(Math.random() * 9000) + 1000;
        const add = Math.floor(Math.random() * 500) + 100;
        const ans = num + add;

        let strOpts = [`${ans}`, `${num - add}`, `${ans + 100}`, `${ans - 10}`];
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 10000)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Làm quen với số lớn!',
            content: { text: `Thực hiện phép tính: ${num} + ${add} = ?`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${ans}`, explanation: `${num} cộng ${add} bằng ${ans}.`
        };
    });

    // m3-bang-nhan: Bảng 3,4,6,7,8,9
    const tables = [3, 4, 6, 7, 8, 9];
    generateMCQ('stat-m-m3-mul', 'm3-bang-nhan', 2, 60, (id, skillId, level) => {
        const base = tables[Math.floor(Math.random() * tables.length)];
        const mult = Math.floor(Math.random() * 9) + 2;
        const isMul = Math.random() > 0.5;
        if (isMul) {
            const ans = base * mult;
            const options = shuffle([`${ans}`, `${ans + base}`, `${ans - base}`, `${ans + 1}`]);
            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: `Nhân siêu tốc bảng ${base}:`,
                content: { text: `${base} x ${mult} = ?`, options },
                answer: `${ans}`, explanation: `${base} nhân ${mult} bằng ${ans}.`
            };
        } else {
            const prod = base * mult;
            const options = shuffle([`${mult}`, `${mult + 1}`, `${Math.max(1, mult - 1)}`, `${mult + 2}`]);
            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: `Chia cực nhanh bảng ${base}:`,
                content: { text: `${prod} : ${base} = ?`, options },
                answer: `${mult}`, explanation: `${prod} chia ${base} bằng ${mult}.`
            };
        }
    });

    // m3-chu-vi: Chu vi vuông/chữ nhật
    generateMCQ('stat-m-m3-cv', 'm3-chu-vi', 3, 40, (id, skillId, level) => {
        const isRec = Math.random() > 0.5;
        if (isRec) {
            const l = Math.floor(Math.random() * 10) + 5;
            const w = Math.floor(Math.random() * 4) + 2;
            const ans = (l + w) * 2;
            let strOpts = [`${ans}`, `${l * w}`, `${l + w}`, `${ans + 2}`];
            strOpts = Array.from(new Set(strOpts));
            while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 40)}`);

            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Tính chu vi hình chữ nhật!',
                content: { text: `Một hình chữ nhật có chiều dài ${l}cm, chiều rộng ${w}cm. Chu vi của hình đó là bao nhiêu cm?`, options: shuffle(strOpts.slice(0, 4)) },
                answer: `${ans}`, explanation: `Chu vi hình chữ nhật = (chiều dài + chiều rộng) x 2 = (${l} + ${w}) x 2 = ${ans}cm.`
            };
        } else {
            const a = Math.floor(Math.random() * 10) + 3;
            const ans = a * 4;
            let strOpts = [`${ans}`, `${ans + 4}`, `${a * a}`, `${a * 2}`];
            strOpts = Array.from(new Set(strOpts));
            while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 40)}`);

            return {
                id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Tính chu vi hình vuông!',
                content: { text: `Một hình vuông có cạnh dài ${a}cm. Chu vi của hình đó là bao nhiêu cm?`, options: shuffle(strOpts.slice(0, 4)) },
                answer: `${ans}`, explanation: `Chu vi hình vuông = cạnh x 4 = ${a} x 4 = ${ans}cm.`
            };
        }
    });

    // m3-phan-so: Lớp 3 (1/2, 1/3, 1/4)
    generateMCQ('stat-m-m3-ps', 'm3-phan-so', 4, 30, (id, skillId, level) => {
        const fracs = [2, 3, 4, 5, 6];
        const f = fracs[Math.floor(Math.random() * fracs.length)];
        const mult = Math.floor(Math.random() * 8) + 2;
        const total = f * mult;

        let strOpts = [`${mult}`, `${mult * 2}`, `${total}`, `${mult + 1}`];
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 40)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Làm quen với phân số!',
            content: { text: `Một hộp có ${total} viên bi. 1/${f} số bi trong hộp là bao nhiêu viên?`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${mult}`, explanation: `Muốn tìm 1/${f} của ${total}, ta lấy ${total} chia cho ${f}. Kết quả: ${total} : ${f} = ${mult} viên bi.`
        };
    });

    // D2: Biểu đồ tranh
    generateMCQ('stat-m-d2', 'D2', 3, 20, (id, skillId, level) => {
        const fruit = Math.floor(Math.random() * 5) + 2;
        const mul = Math.floor(Math.random() * 4) + 2; // 2,3,4,5
        const ans = fruit * mul;

        let strOpts = [`${ans}`, `${ans + mul}`, `${fruit}`, `${ans * 2}`];
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 40)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Đọc biểu đồ tranh!',
            content: { text: `Trong biểu đồ tranh, mỗi biểu tượng 🍎 ứng với ${mul} quả táo. Nếu Nam vẽ ${fruit} biểu tượng 🍎 thì Nam có thực tế bao nhiêu quả táo?`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${ans}`, explanation: `Mỗi biểu tượng là ${mul} quả, ${fruit} biểu tượng là ${fruit} x ${mul} = ${ans} quả.`
        };
    });

    // Lớp 4 Advanced: Nhân số có nhiều chữ số (m3-nhan-chia-lon) Level 4-5
    generateMCQ('stat-m-m3-mul-adv', 'm3-nhan-chia-lon', 4, 30, (id, skillId, level) => {
        const a = Math.floor(Math.random() * 90) + 10;
        const b = Math.floor(Math.random() * 8) + 2;
        const ans = a * b;

        let strOpts = [`${ans}`, `${ans + 10}`, `${ans - b}`, `${ans + b}`];
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 900)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Thử thách nhân số lớn!',
            content: { text: `${a} x ${b} = ?`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${ans}`, explanation: `${a} nhân ${b} bằng ${ans}.`
        };
    });

    // Level 5 Logic Puzzle (E1 Quy luật nâng cao)
    generateMCQ('stat-m-e1-adv', 'E1', 5, 20, (id, skillId, level) => {
        const a = Math.floor(Math.random() * 5) + 1;
        const diff1 = Math.floor(Math.random() * 3) + 2;
        const diff2 = diff1 + 2;
        const diff3 = diff2 + 2;
        const sequence = [a, a + diff1, a + diff1 + diff2, a + diff1 + diff2 + diff3];
        const ans = sequence[3];
        sequence.pop();

        let strOpts = [`${ans}`, `${ans + 1}`, `${ans - 2}`, `${ans + diff2}`];
        strOpts = Array.from(new Set(strOpts));
        while (strOpts.length < 4) strOpts.push(`${Math.floor(Math.random() * 50)}`);

        return {
            id, subjectId: 'math', skillId, type: 'mcq', instruction: 'Thử thách logic thiên tài!',
            content: { text: `Tìm số tiếp theo của dãy: ${sequence.join(', ')}, ...`, options: shuffle(strOpts.slice(0, 4)) },
            answer: `${ans}`, explanation: `Khoảng cách giữa các số tăng dần: +${diff1}, +${diff2}, +${diff3}. Vậy số tiếp theo là ${sequence[2]} + ${diff3} = ${ans}.`
        };
    });

    return questions;
}

const db = generateMathQuestions();
let out = `import { Question } from '../types';

export const mathStaticQuestions: Record<string, Record<number, Question[]>> = ${JSON.stringify(db, null, 4)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'content', 'static', 'math.ts'), out);
console.log('Math static bank generated successfully!');
