import { Question } from '../types';
import { QuestionFactory } from '../factory';

export function generateNumberStructureComparison(skillId: string, level: number = 1): Question {
    // Clamp range to ≤1000 to comply with math-grade2-rules (A1 must stay within 1000)
    const safeLevel = Math.min(level, 10);
    const range = safeLevel * 100; // Level 1: 0-100, Level 2: 0-200, ..., Level 10: 0-1000
    const type = Math.random() > 0.5 ? 'structure' : 'comparison';

    if (type === 'comparison') {
        const a = Math.floor(Math.random() * range);
        let b = Math.floor(Math.random() * range);
        while (b === a) b = Math.floor(Math.random() * range);

        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'mcq',
            instruction: 'Điền dấu thích hợp vào chỗ trống:',
            text: `${a} ... ${b}`,
            options: ['>', '<', '='],
            answer: a > b ? '>' : a < b ? '<' : '=',
            explanation: `${a} ${a > b ? 'lớn hơn' : 'nhỏ hơn'} ${b}`
        });
    } else {
        // Structure (e.g. 123 = 100 + 20 + ?)
        const num = Math.floor(Math.random() * (range - 10)) + 10;
        const hundreds = Math.floor(num / 100) * 100;
        const tens = Math.floor((num % 100) / 10) * 10;
        const units = num % 10;

        // Randomly hide one part
        const hide = Math.random();
        let questionText = '';
        let answer = '';

        if (hundreds > 0) {
            if (hide < 0.33) {
                questionText = `... = ${hundreds} + ${tens} + ${units}`;
                answer = num.toString();
            } else if (hide < 0.66) {
                questionText = `${num} = ... + ${tens} + ${units}`;
                answer = hundreds.toString();
            } else {
                questionText = `${num} = ${hundreds} + ... + ${units}`;
                answer = tens.toString();
            }
        } else {
            if (hide < 0.5) {
                questionText = `${num} = ... + ${units}`;
                answer = tens.toString();
            } else {
                questionText = `${num} = ${tens} + ...`;
                answer = units.toString();
            }
        }

        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Điền số thích hợp vào chỗ trống:',
            text: questionText,
            answer: answer,
            hint: 'Phân tích số thành các hàng trăm, chục, đơn vị.',
            explanation: `${num} gồm ${hundreds > 0 ? hundreds + ' trăm, ' : ''}${tens / 10} chục và ${units} đơn vị.`
        });
    }
}

export function generateAdditionSubtraction(skillId: string, level: number = 1): Question {
    const isAddition = Math.random() > 0.5;
    const max = level === 1 ? 20 : level === 2 ? 100 : 1000;

    let a = Math.floor(Math.random() * max);
    let b = Math.floor(Math.random() * max);

    if (isAddition && a + b > 1000) {
        const safeMaxForB = Math.max(0, 1000 - a);
        b = safeMaxForB === 0 ? 0 : Math.floor(Math.random() * (safeMaxForB + 1));
    }

    if (!isAddition && a < b) {
        [a, b] = [b, a]; // Ensure a >= b for subtraction
    }

    const result = isAddition ? a + b : a - b;

    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Tính nhẩm:',
        text: `${a} ${isAddition ? '+' : '-'} ${b} = ?`,
        answer: result.toString(),
        explanation: `${a} ${isAddition ? '+' : '-'} ${b} = ${result}`
    });
}


export function generateMissingNumber(skillId: string, level: number = 1): Question {
    const maxStart = level <= 2 ? 50 : level <= 3 ? 200 : 500;
    const maxStep = level <= 2 ? 5 : level <= 3 ? 10 : level <= 4 ? 25 : 50;
    const step = Math.floor(Math.random() * maxStep) + (level <= 2 ? 1 : 2);
    const length = level <= 3 ? 5 : 6;
    const missingIndex = Math.floor(Math.random() * length);

    const isDecreasing = level >= 3 && Math.random() > 0.5;
    const minStartForDecrease = step * (length - 1);
    const start = isDecreasing
        ? Math.floor(Math.random() * Math.max(1, maxStart - minStartForDecrease + 1)) + minStartForDecrease
        : Math.floor(Math.random() * (maxStart + 1));
    const sequence: (number | string)[] = Array.from({ length }, (_, i) =>
        isDecreasing ? start - i * step : start + i * step
    );
    const answer = sequence[missingIndex];
    sequence[missingIndex] = '...';

    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Điền số còn thiếu vào dãy số:',
        text: sequence.join(', '),
        answer: answer.toString(),
        explanation: `Dãy số ${isDecreasing ? 'giảm' : 'tăng'} dần ${step} đơn vị.`
    });
}

export function generateMultiplicationDivision(skillId: string, level: number = 1): Question {
    const isMult = Math.random() > 0.5;
    const tables = [2, 5];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const maxFactor = level <= 2 ? 10 : 12;
    const factor = Math.floor(Math.random() * maxFactor) + 1;

    if (isMult) {
        const result = table * factor;
        const options = [result, result + table, result - 1, result + 2].map(String).sort(() => Math.random() - 0.5);
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: level >= 4 ? 'input' : 'mcq',
            instruction: 'Tính:',
            text: `${table} × ${factor} = ?`,
            options: level < 4 ? options : undefined,
            answer: result.toString(),
            explanation: `${table} × ${factor} = ${result}`
        });
    } else {
        const dividend = table * factor;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tính:',
            text: `${dividend} : ${table} = ?`,
            answer: factor.toString(),
            explanation: `${dividend} : ${table} = ${factor}`
        });
    }
}

export function generateWordProblem(skillId: string, level: number = 1): Question {
    const problems = [
        { template: "Lan có {a} cái kẹo, mẹ cho thêm {b} cái. Hỏi Lan có tất cả bao nhiêu cái kẹo?", calc: (a: number, b: number) => a + b, unit: "cái kẹo" },
        { template: "Trên cây có {a} con chim, {b} con bay đi. Hỏi trên cây còn lại bao nhiêu con?", calc: (a: number, b: number) => a - b, unit: "con chim" },
        { template: "Lớp 2A có {a} học sinh nam và {b} học sinh nữ. Hỏi lớp 2A có tất cả bao nhiêu học sinh?", calc: (a: number, b: number) => a + b, unit: "học sinh" },
        ...(level >= 3 ? [
            { template: "Cửa hàng có {a} quyển vở, bán đi {b} quyển. Hỏi còn lại bao nhiêu quyển vở?", calc: (a: number, b: number) => a - b, unit: "quyển vở" }
        ] : [])
    ];
    const problem = problems[Math.floor(Math.random() * problems.length)];
    const maxA = level <= 1 ? 15 : level <= 2 ? 50 : level <= 3 ? 100 : 500;
    const maxB = level <= 1 ? 10 : level <= 2 ? 30 : level <= 3 ? 50 : 200;
    const a = Math.floor(Math.random() * maxA) + 5;
    const b = Math.floor(Math.random() * maxB) + 1;
    const valA = problem.template.includes("bay đi") || problem.template.includes("bán đi") ? a + b : a;
    const text = problem.template.replace("{a}", valA.toString()).replace("{b}", b.toString());
    const result = problem.calc(valA, b);
    const useInput = level >= 4;
    const wrongAns1 = Math.abs(valA - b);
    const wrongAns2 = result + 10;
    const wrongAns3 = result > 5 ? result - 2 : result + 5;
    const baseSet = new Set([result, wrongAns1, wrongAns2, wrongAns3]);
    while (baseSet.size < 4) {
        baseSet.add(result + Math.floor(Math.random() * 10) + 1);
    }
    const options = Array.from(baseSet).map(String).sort(() => Math.random() - 0.5);
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: useInput ? 'input' : 'mcq',
        instruction: 'Giải bài toán:',
        text,
        options: useInput ? undefined : options,
        answer: result.toString(),
        explanation: `Kết quả: ${result} ${problem.unit}`
    });
}

// === B2: Lời văn 2 bước ===
export function generateWordProblem2Steps(skillId: string, level: number = 1): Question {
    const templates = [
        { text: (a: number, b: number, c: number) => `Lan có ${a} viên bi xanh và ${b} viên bi đỏ. Lan cho bạn ${c} viên. Hỏi Lan còn bao nhiêu viên bi?`, calc: (a: number, b: number, c: number) => a + b - c, explain: (a: number, b: number, c: number) => `Bước 1: ${a} + ${b} = ${a + b}. Bước 2: ${a + b} - ${c} = ${a + b - c}.` },
        { text: (a: number, b: number, c: number) => `Trong vườn có ${a} cây cam và ${b} cây bưởi. Bố trồng thêm ${c} cây cam. Hỏi trong vườn có tất cả bao nhiêu cây?`, calc: (a: number, b: number, c: number) => a + b + c, explain: (a: number, b: number, c: number) => `Bước 1: ${a} + ${c} = ${a + c}. Bước 2: ${a + c} + ${b} = ${a + b + c}.` },
        { text: (a: number, b: number, c: number) => `Một cửa hàng có ${a} quyển vở. Buổi sáng bán ${b} quyển, buổi chiều bán ${c} quyển. Hỏi còn lại bao nhiêu quyển vở?`, calc: (a: number, b: number, c: number) => a - b - c, explain: (a: number, b: number, c: number) => `Bước 1: ${a} - ${b} = ${a - b}. Bước 2: ${a - b} - ${c} = ${a - b - c}.` },
        ...(level >= 4 ? [{ text: (a: number, b: number, c: number) => `Mỗi túi có ${b} quả cam. Có ${c} túi. Mẹ thêm ${a} quả nữa. Hỏi có tất cả bao nhiêu quả cam?`, calc: (a: number, b: number, c: number) => b * c + a, explain: (a: number, b: number, c: number) => `Bước 1: ${b} × ${c} = ${b * c}. Bước 2: ${b * c} + ${a} = ${b * c + a}.` }] : [])
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const maxA = level <= 2 ? 30 : level <= 3 ? 100 : 500;
    const maxB = level <= 2 ? 10 : level <= 3 ? 30 : 50;
    const maxC = level <= 2 ? 5 : level <= 3 ? 15 : 30;
    let a = Math.floor(Math.random() * maxA) + 20;
    const b = Math.floor(Math.random() * maxB) + 3;
    const c = Math.floor(Math.random() * maxC) + 1;
    if (t.calc(0, b, c) < 0 && a <= b + c) {
        a = b + c + Math.floor(Math.random() * 20) + 1;
    }
    const result = t.calc(a, b, c);
    const useInput = level >= 3;
    const w1 = a + b + c;
    const w2 = Math.abs(a - b) + c;
    const w3 = result + 10;
    const set2 = new Set([result, w1, w2, w3]);
    while(set2.size < 4) set2.add(result + Math.floor(Math.random() * 10) + 1);
    const options = Array.from(set2).map(String).sort(() => Math.random() - 0.5);
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: useInput ? 'input' : 'mcq',
        instruction: 'Giải bài toán có lời văn:',
        text: t.text(a, b, c),
        options: useInput ? undefined : options,
        answer: result.toString(),
        explanation: t.explain(a, b, c)
    });
}

// === m3-so-10k: Các số đến 10.000 & 100.000 ===
export function generateLargeNumbers(skillId: string, level: number = 1): Question {
    const max = level <= 2 ? 10000 : 100000;
    const a = Math.floor(Math.random() * max) + 100;
    let b = Math.floor(Math.random() * max) + 100;
    while (b === a) b = Math.floor(Math.random() * max) + 100;
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'mcq',
        instruction: 'So sánh hai số:',
        text: `${a.toLocaleString('vi-VN')} ... ${b.toLocaleString('vi-VN')}`,
        options: ['>', '<', '='],
        answer: a > b ? '>' : a < b ? '<' : '=',
        explanation: `${a.toLocaleString('vi-VN')} ${a > b ? 'lớn hơn' : 'nhỏ hơn'} ${b.toLocaleString('vi-VN')}`
    });
}

// === m3-cong-tru-100k: Cộng/Trừ phạm vi 100.000 ===
export function generateAddSub100k(skillId: string, level: number = 1): Question {
    const isAdd = Math.random() > 0.5;
    const max = level === 1 ? 10000 : level === 2 ? 50000 : 100000;
    let a = Math.floor(Math.random() * max) + 100;
    let b = Math.floor(Math.random() * (max / 2)) + 50;
    if (!isAdd && a < b) [a, b] = [b, a];
    const result = isAdd ? a + b : a - b;
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Tính:',
        text: `${a.toLocaleString('vi-VN')} ${isAdd ? '+' : '-'} ${b.toLocaleString('vi-VN')} = ?`,
        answer: result.toString(),
        explanation: `${a.toLocaleString('vi-VN')} ${isAdd ? '+' : '-'} ${b.toLocaleString('vi-VN')} = ${result.toLocaleString('vi-VN')}`,
        hint: isAdd ? 'Cộng từ hàng đơn vị lên, nhớ nhớ.' : 'Trừ từ hàng đơn vị, mượn nếu cần.'
    });
}

// === m3-nhan-chia-lon: Nhân/Chia số nhiều chữ số ===
export function generateMultDivLarge(skillId: string, level: number = 1): Question {
    const isMult = Math.random() > 0.5;
    const maxA = level <= 2 ? 90 : level <= 3 ? 900 : 9000;
    const minA = level <= 2 ? 10 : level <= 3 ? 100 : 1000;
    const maxB = level <= 3 ? 9 : 12;
    const a = Math.floor(Math.random() * (maxA - minA)) + minA;
    const b = Math.floor(Math.random() * (maxB - 1)) + 2;
    if (isMult) {
        const result = a * b;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tính:',
            text: `${a} × ${b} = ?`,
            answer: result.toString(),
            explanation: `${a} × ${b} = ${result}`
        });
    } else {
        const dividend = a * b;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tính:',
            text: `${dividend} : ${b} = ?`,
            answer: a.toString(),
            explanation: `${dividend} : ${b} = ${a}`
        });
    }
}

// === m3-bang-nhan: Bảng nhân/chia 3, 4, 6, 7, 8, 9 ===
export function generateMultTable(skillId: string, level: number = 1): Question {
    const allTables = [[3, 4], [3, 4, 6], [3, 4, 6, 7, 8], [3, 4, 6, 7, 8, 9], [2, 3, 4, 5, 6, 7, 8, 9]];
    const tables = allTables[Math.min(level - 1, 4)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const maxFactor = level <= 2 ? 10 : 12;
    const factor = Math.floor(Math.random() * maxFactor) + 1;
    const isMult = Math.random() > 0.4;
    if (isMult) {
        const result = table * factor;
        const options = [result, result + table, result - 1, result + 2].map(String).sort(() => Math.random() - 0.5);
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: level >= 4 ? 'input' : 'mcq',
            instruction: 'Tính nhẩm:',
            text: `${table} × ${factor} = ?`,
            options: level < 4 ? options : undefined,
            answer: result.toString(),
            explanation: `${table} × ${factor} = ${result}`
        });
    } else {
        const dividend = table * factor;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tính nhẩm:',
            text: `${dividend} : ${table} = ?`,
            answer: factor.toString(),
            explanation: `${dividend} : ${table} = ${factor}`
        });
    }
}

// === C1: Độ dài & đường gấp khúc ===
export function generateLength(skillId: string, level: number = 1): Question {
    const segments = level <= 2 ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 3) + 3;
    const maxLen = level <= 1 ? 20 : level <= 2 ? 50 : level <= 3 ? 100 : 500;
    const lengths = Array.from({ length: segments }, () => Math.floor(Math.random() * maxLen) + 3);
    const total = lengths.reduce((s, v) => s + v, 0);
    const unit = level >= 4 ? 'm' : 'cm';
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: `Tính tổng độ dài đường gấp khúc gồm ${segments} đoạn:`,
        text: lengths.join(` ${unit}, `) + ` ${unit}`,
        answer: total.toString(),
        explanation: `${lengths.join(' + ')} = ${total} ${unit}`,
        hint: 'Cộng lần lượt các đoạn thẳng with nhau.'
    });
}

// === C2: Thời gian (giờ/phút) ===
export function generateTime(skillId: string, level: number = 1): Question {
    const type = Math.random();
    if (type < 0.5) {
        const h = Math.floor(Math.random() * 12) + 1;
        const minutes = level <= 2 ? [0, 15, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        const m = minutes[Math.floor(Math.random() * minutes.length)];
        const correct = `${h} giờ ${m > 0 ? m + ' phút' : 'đúng'}`;
        const opts = [correct,
            `${h + 1} giờ ${m > 0 ? m + ' phút' : 'đúng'}`,
            `${h} giờ ${(m + 15) % 60} phút`,
            `${h === 12 ? 1 : h + 1} giờ đúng`
        ].sort(() => Math.random() - 0.5);
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'mcq',
            instruction: `Kim ngắn chỉ số ${h}, kim dài chỉ số ${m / 5}. Đồng hồ chỉ mấy giờ?`,
            text: `Kim ngắn: ${h}, Kim dài: ${m / 5}`,
            options: opts,
            answer: correct,
            explanation: `Kim ngắn chỉ ${h}, kim dài chỉ ${m / 5} → ${correct}.`
        });
    } else {
        const start = Math.floor(Math.random() * 5) + 7; // 7-11 giờ sáng
        const dur = level <= 2 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 1;
        const durMin = level >= 3 ? Math.floor(Math.random() * 4) * 15 : 0;
        // Helper: format giờ với buổi sáng/chiều cho trẻ dễ hiểu
        const formatTime = (h: number, m: number = 0): string => {
            const period = h < 12 ? 'sáng' : h < 18 ? 'chiều' : 'tối';
            const displayH = h > 12 ? h - 12 : h;
            if (m > 0) return `${displayH} giờ ${m} phút ${period}`;
            return `${displayH} giờ ${period}`;
        };
        if (durMin > 0) {
            const totalMin = dur * 60 + durMin;
            const endH = start + Math.floor(totalMin / 60);
            const endM = totalMin % 60;
            const displayH = endH > 12 ? endH - 12 : endH;
            return QuestionFactory.create({
                subjectId: 'math',
                skillId,
                type: 'input',
                instruction: `Bé đi học lúc ${start} giờ sáng, học ${dur} giờ ${durMin} phút. Hỏi tan học lúc mấy giờ? (trả lời số giờ)`,
                text: `${start} giờ sáng + ${dur} giờ ${durMin} phút = ?`,
                answer: displayH.toString(),
                explanation: `${start}:00 + ${dur}h${durMin}m = ${formatTime(endH, endM)}`
            });
        }
        const endHour = start + dur;
        const displayHour = endHour > 12 ? endHour - 12 : endHour;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: `Bé đi học lúc ${start} giờ sáng, sau ${dur} giờ thì tan học. Hỏi bé tan học lúc mấy giờ?`,
            text: `${start} giờ sáng + ${dur} giờ = ? giờ`,
            answer: displayHour.toString(),
            explanation: `${start} giờ sáng + ${dur} giờ = ${formatTime(endHour)}`
        });
    }
}

// === D1: Hình học (đếm đoạn/nhận biết) ===
export function generateGeometry(skillId: string, level: number = 1): Question {
    const shapes = [
        { name: 'Hình tam giác', sides: 3 },
        { name: 'Hình vuông', sides: 4 },
        { name: 'Hình chữ nhật', sides: 4 },
        ...(level >= 2 ? [{ name: 'Hình ngũ giác', sides: 5 }, { name: 'Hình lục giác', sides: 6 }] : []),
        ...(level >= 4 ? [{ name: 'Hình thoi', sides: 4 }, { name: 'Hình thang', sides: 4 }] : [])
    ];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    if (level >= 3 && (shape.name === 'Hình vuông' || shape.name === 'Hình chữ nhật')) {
        const a = Math.floor(Math.random() * 10) + 2;
        const b = shape.name === 'Hình vuông' ? a : Math.floor(Math.random() * 8) + 2;
        const perimeter = shape.name === 'Hình vuông' ? a * 4 : (a + b) * 2;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: `Tính chu vi ${shape.name}:`,
            text: shape.name === 'Hình vuông' ? `Cạnh ${a} cm. Chu vi = ?` : `Dài ${a} cm, rộng ${b} cm. Chu vi = ?`,
            answer: perimeter.toString(),
            explanation: shape.name === 'Hình vuông' ? `${a} × 4 = ${perimeter} cm` : `(${a} + ${b}) × 2 = ${perimeter} cm`
        });
    }
    const opts = [shape.sides, shape.sides + 1, shape.sides - 1, shape.sides + 2].map(String).sort(() => Math.random() - 0.5);
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'mcq',
        instruction: `${shape.name} có bao nhiêu cạnh?`,
        text: `Số cạnh của ${shape.name}?`,
        options: opts,
        answer: shape.sides.toString(),
        explanation: `${shape.name} có ${shape.sides} cạnh.`
    });
}

// === m3-chu-vi: Chu vi & Diện tích ===
export function generatePerimeterArea(skillId: string, level: number = 1): Question {
    const isPerimeter = Math.random() > 0.5;
    const maxSide = level <= 1 ? 10 : level <= 2 ? 20 : level <= 3 ? 50 : 100;
    if (Math.random() > 0.5) {
        const a = Math.floor(Math.random() * maxSide) + 2;
        if (isPerimeter) {
            const result = a * 4;
            return QuestionFactory.create({
                subjectId: 'math',
                skillId,
                type: 'input',
                instruction: 'Tính chu vi hình vuông:',
                text: `Hình vuông có cạnh ${a} cm. Chu vi = ? cm`,
                answer: result.toString(),
                explanation: `Chu vi = ${a} × 4 = ${result} cm`,
                hint: 'Chu vi hình vuông = cạnh × 4'
            });
        } else {
            const result = a * a;
            return QuestionFactory.create({
                subjectId: 'math',
                skillId,
                type: 'input',
                instruction: 'Tính diện tích hình vuông:',
                text: `Hình vuông có cạnh ${a} cm. Diện tích = ? cm²`,
                answer: result.toString(),
                explanation: `Diện tích = ${a} × ${a} = ${result} cm²`,
                hint: 'Diện tích hình vuông = cạnh × cạnh'
            });
        }
    } else {
        const a = Math.floor(Math.random() * maxSide) + 3;
        const b = Math.floor(Math.random() * (maxSide / 2)) + 2;
        if (isPerimeter) {
            const result = (a + b) * 2;
            return QuestionFactory.create({
                subjectId: 'math',
                skillId,
                type: 'input',
                instruction: 'Tính chu vi hình chữ nhật:',
                text: `Chiều dài ${a} cm, chiều rộng ${b} cm. Chu vi = ? cm`,
                answer: result.toString(),
                explanation: `Chu vi = (${a} + ${b}) × 2 = ${result} cm`,
                hint: 'Chu vi HCN = (dài + rộng) × 2'
            });
        } else {
            const result = a * b;
            return QuestionFactory.create({
                subjectId: 'math',
                skillId,
                type: 'input',
                instruction: 'Tính diện tích hình chữ nhật:',
                text: `Chiều dài ${a} cm, chiều rộng ${b} cm. Diện tích = ? cm²`,
                answer: result.toString(),
                explanation: `Diện tích = ${a} × ${b} = ${result} cm²`,
                hint: 'Diện tích HCN = dài × rộng'
            });
        }
    }
}

// === m3-goc: Góc vuông & Không vuông ===
export function generateAngle(skillId: string, level: number = 1): Question {
    const items = [
        { name: 'góc của hình vuông', isRight: true },
        { name: 'góc ở mép bàn học', isRight: true },
        { name: 'góc ở mép quyển sách', isRight: true },
        { name: 'góc tạo bởi kim đồng hồ lúc 3 giờ', isRight: true },
        { name: 'góc tạo bởi kim đồng hồ lúc 2 giờ', isRight: false },
        { name: 'góc nhọn', isRight: false },
        { name: 'góc ở đầu cây bút chì', isRight: false },
        ...(level >= 2 ? [
            { name: 'góc ở đỉnh tam giác đều', isRight: false },
            { name: 'góc của hình chữ nhật', isRight: true },
            { name: 'góc tạo bởi kim đồng hồ lúc 6 giờ', isRight: false }
        ] : []),
        ...(level >= 4 ? [
            { name: 'góc tù', isRight: false },
            { name: 'góc bẹt', isRight: false }
        ] : [])
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    const options = level >= 4 ? ['Góc vuông', 'Góc nhọn', 'Góc tù', 'Góc bẹt'] : ['Góc vuông', 'Góc không vuông'];
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'mcq',
        instruction: `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} là góc gì?`,
        text: `Xác định: ${item.name}`,
        options,
        answer: item.isRight ? 'Góc vuông' : (level >= 4 ? (item.name.includes('tù') ? 'Góc tù' : item.name.includes('bẹt') ? 'Góc bẹt' : 'Góc nhọn') : 'Góc không vuông'),
        explanation: item.isRight ? `${item.name} tạo thành góc vuông (90°).` : `${item.name} không phải góc vuông.`
    });
}

// === m3-don-vi: Đơn vị đo lường ===
export function generateUnit(skillId: string, level: number = 1): Question {
    const basic = [
        { q: '1 m = ? cm', a: '100', e: '1 mét = 100 xăng-ti-mét' },
        { q: '1 km = ? m', a: '1000', e: '1 ki-lô-mét = 1000 mét' },
        { q: '1 kg = ? g', a: '1000', e: '1 ki-lô-gam = 1000 gam' },
        { q: '100 cm = ? m', a: '1', e: '100 cm = 1 m' },
        { q: '2 m = ? cm', a: '200', e: '2 × 100 = 200 cm' }
    ];
    const medium = [
        { q: '1 lít = ? ml', a: '1000', e: '1 lít = 1000 mi-li-lít' },
        { q: '3 kg = ? g', a: '3000', e: '3 × 1000 = 3000 g' },
        { q: '5000 g = ? kg', a: '5', e: '5000 : 1000 = 5 kg' },
        { q: '4 km = ? m', a: '4000', e: '4 × 1000 = 4000 m' }
    ];
    const hard = [
        { q: '2500 m = ? km ? m', a: '2', e: '2500 m = 2 km 500 m' },
        { q: '1 tấn = ? kg', a: '1000', e: '1 tấn = 1000 kg' },
        { q: '3200 g = ? kg ? g', a: '3', e: '3200 g = 3 kg 200 g' }
    ];
    const pool = level <= 2 ? basic : level <= 3 ? [...basic, ...medium] : [...basic, ...medium, ...hard];
    const c = pool[Math.floor(Math.random() * pool.length)];
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Đổi đơn vị:',
        text: c.q,
        answer: c.a,
        explanation: c.e,
        hint: 'Nhớ: 1 m = 100 cm, 1 km = 1000 m, 1 kg = 1000 g'
    });
}

// === D2: Biểu đồ tranh/bảng ===
export function generateChart(skillId: string, level: number = 1): Question {
    const fruits = level <= 2 ? ['Cam', 'Táo', 'Xoài', 'Chuối'] : ['Cam', 'Táo', 'Xoài', 'Chuối', 'Dưa hấu', 'Nho'];
    const maxCount = level <= 1 ? 10 : level <= 2 ? 20 : level <= 3 ? 50 : 100;
    const counts = fruits.map(() => Math.floor(Math.random() * maxCount) + 2);
    const askIndex = Math.floor(Math.random() * fruits.length);
    const tableRows = fruits.map((f, i) => `${f}: ${counts[i]} quả`).join('. ');
    const type = Math.random();
    if (type < 0.33) {
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Nhìn bảng sau, trả lời câu hỏi:',
            text: `${tableRows}.\nHỏi: Có bao nhiêu quả ${fruits[askIndex]}?`,
            answer: counts[askIndex].toString(),
            explanation: `Theo bảng, có ${counts[askIndex]} quả ${fruits[askIndex]}.`
        });
    } else if (type < 0.66) {
        const total = counts.reduce((s, v) => s + v, 0);
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Nhìn bảng sau, tính tổng:',
            text: `${tableRows}.\nHỏi: Tổng cộng có bao nhiêu quả?`,
            answer: total.toString(),
            explanation: `Tổng = ${counts.join(' + ')} = ${total} quả`
        });
    } else {
        const max = Math.max(...counts);
        const maxFruit = fruits[counts.indexOf(max)];
        const opts = [...fruits].sort(() => Math.random() - 0.5);
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'mcq',
            instruction: 'Loại quả nào nhiều nhất?',
            text: tableRows,
            options: opts,
            answer: maxFruit,
            explanation: `${maxFruit} nhiều nhất with ${max} quả.`
        });
    }
}

// === E1: Quy luật dãy số ===
export function generateSequence(skillId: string, level: number = 1): Question {
    const maxStart = level <= 2 ? 20 : level <= 3 ? 100 : 500;
    const maxStep = level <= 2 ? 5 : level <= 3 ? 10 : 25;
    const step = Math.floor(Math.random() * maxStep) + 2;
    const len = level <= 2 ? 6 : 7;
    const isDecreasing = level >= 3 && Math.random() > 0.5;
    const minStartForDecrease = step * (len - 1) + 1;
    const start = isDecreasing
        ? Math.floor(Math.random() * Math.max(1, maxStart - minStartForDecrease + 1)) + minStartForDecrease
        : Math.floor(Math.random() * maxStart) + 1;
    const seq = Array.from({ length: len }, (_, i) => isDecreasing ? start - i * step : start + i * step);
    const hideIdx = Math.floor(Math.random() * (len - 2)) + 2;
    const answer = seq[hideIdx];
    const display = seq.map((v, i) => i === hideIdx ? '?' : v.toString()).join(', ');
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Tìm số còn thiếu trong dãy:',
        text: display,
        answer: answer.toString(),
        explanation: `Dãy ${isDecreasing ? 'giảm' : 'tăng'} dần ${step} đơn vị.`,
        hint: `Mỗi số cách nhau ${step} đơn vị.`
    });
}

export function generateNumberGrid(skillId: string, level: number = 1): Question {
    const maxVal = level <= 2 ? 5 : level <= 3 ? 10 : 20;
    const a = Math.floor(Math.random() * maxVal) + 1;
    const b = Math.floor(Math.random() * maxVal) + 1;
    const ops = level <= 2 ? ['+', '×'] : ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const result = op === '+' ? a + b : op === '-' ? Math.abs(a - b) : a * b;
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Trong bảng cộng/nhân, tìm kết quả:',
        text: `${a} ${op} ${b} = ?`,
        answer: result.toString(),
        explanation: `${a} ${op} ${b} = ${result}`
    });
}

export function generateNumberTower(skillId: string, level: number = 1): Question {
    const maxBase = level <= 2 ? 10 : level <= 3 ? 50 : 100;
    if (level >= 3) {
        const b1 = Math.floor(Math.random() * maxBase) + 1;
        const b2 = Math.floor(Math.random() * maxBase) + 1;
        const b3 = Math.floor(Math.random() * maxBase) + 1;
        const mid1 = b1 + b2;
        const mid2 = b2 + b3;
        const top = mid1 + mid2;
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tháp số 3 tầng: ô trên = tổng 2 ô dưới. Tìm ô trên cùng:',
            text: `Tầng dưới cùng: ${b1}, ${b2}, ${b3}\nTầng giữa: ${mid1}, ${mid2}\nTầng trên: ?`,
            answer: top.toString(),
            explanation: `${mid1} + ${mid2} = ${top}`
        });
    }
    const base1 = Math.floor(Math.random() * maxBase) + 1;
    const base2 = Math.floor(Math.random() * maxBase) + 1;
    const sum = base1 + base2;
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'input',
        instruction: 'Trong tháp số, ô phía trên bằng tổng 2 ô phía dưới. Tìm ô trên cùng:',
        text: `Tầng dưới: ${base1} và ${base2}.\nTầng trên: ?`,
        answer: sum.toString(),
        explanation: `${base1} + ${base2} = ${sum}`,
        hint: 'Cộng hai số ở tầng dưới để ra số ở tầng trên.'
    });
}

// === m3-thong-ke: Làm quen with Thống kê ===
export function generateStatistics(skillId: string, level: number = 1): Question {
    const count = level <= 2 ? 5 : level <= 3 ? 7 : 10;
    const maxVal = level <= 2 ? 10 : level <= 3 ? 50 : 100;
    const data = Array.from({ length: count }, () => Math.floor(Math.random() * maxVal) + 1);
    const sum = data.reduce((s, v) => s + v, 0);
    const max = Math.max(...data);
    const min = Math.min(...data);
    const type = Math.random();
    if (type < 0.33) {
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tính tổng các số:',
            text: `Cho dãy số: ${data.join(', ')}. Tổng = ?`,
            answer: sum.toString(),
            explanation: `${data.join(' + ')} = ${sum}`
        });
    } else if (type < 0.66) {
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tìm số lớn nhất:',
            text: `Cho dãy số: ${data.join(', ')}. Số lớn nhất = ?`,
            answer: max.toString(),
            explanation: `Số lớn nhất là ${max}.`
        });
    } else {
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'input',
            instruction: 'Tìm số nhỏ nhất:',
            text: `Cho dãy số: ${data.join(', ')}. Số nhỏ nhất = ?`,
            answer: min.toString(),
            explanation: `Số nhỏ nhất là ${min}.`
        });
    }
}

export function generateFraction(skillId: string, level: number = 1): Question {
    const denoms = level <= 2 ? [2, 3, 4] : level <= 3 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 8, 10];
    const d = denoms[Math.floor(Math.random() * denoms.length)];
    const n = Math.floor(Math.random() * (d - 1)) + 1;
    const remain = d - n;
    if (level >= 3 && Math.random() > 0.5) {
        const d2 = denoms[Math.floor(Math.random() * denoms.length)];
        const n2 = Math.floor(Math.random() * (d2 - 1)) + 1;
        // Cross-multiplication for exact integer comparison (avoids floating-point errors)
        const cross1 = n * d2;
        const cross2 = n2 * d;
        const cmp = cross1 > cross2 ? '>' : cross1 < cross2 ? '<' : '=';
        return QuestionFactory.create({
            subjectId: 'math',
            skillId,
            type: 'mcq',
            instruction: 'So sánh hai phân số:',
            text: `${n}/${d} ... ${n2}/${d2}`,
            options: ['>', '<', '='],
            answer: cmp,
            explanation: `${n}/${d} = ${(n / d).toFixed(2)}, ${n2}/${d2} = ${(n2 / d2).toFixed(2)}`
        });
    }
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'mcq',
        instruction: `Một cái bánh chia đều thành ${d} phần. Lấy ra ${n} phần. Phần lấy ra được viết là phân số nào?`,
        text: `${n} phần trong ${d} phần bằng nhau`,
        options: [`${n}/${d}`, `${d}/${n}`, `${remain}/${d}`, `1/${d}`].sort(() => Math.random() - 0.5),
        answer: `${n}/${d}`,
        explanation: `Lấy ${n} phần trong ${d} phần → ${n}/${d}.`,
        hint: 'Tử số là phần đã lấy, mẫu số là tổng số phần.'
    });
}

export function generateProbability(skillId: string, level: number = 1): Question {
    const events = [
        { text: 'Tung đồng xu, mặt ngửa xuất hiện', answer: 'Có thể xảy ra', e: 'Đồng xu có thể ngửa hoặc sấp.' },
        { text: 'Mặt trời mọc ở phía Đông', answer: 'Chắc chắn xảy ra', e: 'Quy luật tự nhiên.' },
        { text: 'Con mèo biết bay', answer: 'Không thể xảy ra', e: 'Mèo không có cánh.' },
        { text: 'Ngày mai trời mưa', answer: 'Có thể xảy ra', e: 'Thời tiết không chắc chắn.' },
        { text: 'Nước chảy từ trên cao xuống thấp', answer: 'Chắc chắn xảy ra', e: 'Quy luật trọng lực.' },
        { text: 'Tháng 2 có 32 ngày', answer: 'Không thể xảy ra', e: 'Tháng 2 chỉ có 28-29 ngày.' },
        ...(level >= 2 ? [
            { text: 'Tổ trưởng lớp hôm nay nghỉ học', answer: 'Có thể xảy ra', e: 'Bất cứ ai cũng có thể nghỉ.' },
            { text: 'Một tuần có 8 ngày', answer: 'Không thể xảy ra', e: 'Một tuần luôn có 7 ngày.' },
            { text: 'Năm nay em sẽ cao hơn', answer: 'Chắc chắn xảy ra', e: 'Trẻ em luôn lớn lên.' }
        ] : [])
    ];
    const ev = events[Math.floor(Math.random() * events.length)];
    return QuestionFactory.create({
        subjectId: 'math',
        skillId,
        type: 'mcq',
        instruction: 'Sự kiện sau thuộc loại nào?',
        text: ev.text,
        options: ['Chắc chắn xảy ra', 'Có thể xảy ra', 'Không thể xảy ra'],
        answer: ev.answer,
        explanation: ev.e
    });
}
