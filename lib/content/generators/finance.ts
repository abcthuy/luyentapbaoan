import { Question } from '../types';
import { QuestionFactory } from '../factory';

type McqSeed = {
    text: string;
    options: string[];
    answer: string;
    explanation?: string;
};

type InputSeed = {
    text: string;
    answer: string;
    explanation?: string;
    hint?: string;
};

function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function clampLevel(level: number) {
    return Math.max(1, Math.min(3, Math.round(level || 1)));
}

function getBalancedFinanceLevel(skillId: string, level: number) {
    const safeLevel = clampLevel(level);

    if (['C3', 'identify-money', 'compare-value', 'need-vs-want', 'saving-pig', 'job-value'].includes(skillId)) {
        return Math.min(safeLevel, 2);
    }

    if (['money-sum', 'fin2-shopping', 'shopping-math', 'saving-goal', 'fin2-saving'].includes(skillId)) {
        return Math.min(safeLevel, 2);
    }

    return safeLevel;
}

function formatMoney(value: number) {
    return `${value.toLocaleString('vi-VN')}đ`;
}

function uniqueOptions(options: string[]) {
    return Array.from(new Set(options));
}

function generateMoneyIdQuestion(level: number, skillId: string): Question {
    const pools: Record<number, McqSeed[]> = {
        1: [
            { text: 'Tờ tiền nào lớn hơn?', options: ['1.000đ', '2.000đ', '5.000đ', '10.000đ'], answer: '2.000đ', explanation: '2.000đ lớn hơn 1.000đ.' },
            { text: 'Tờ tiền nào nhỏ hơn?', options: ['5.000đ', '2.000đ', '10.000đ', '20.000đ'], answer: '2.000đ', explanation: '2.000đ nhỏ hơn 5.000đ.' },
            { text: 'Muốn mua món đồ 5.000đ, bé nên chọn tờ nào?', options: ['1.000đ', '2.000đ', '5.000đ', '10.000đ'], answer: '5.000đ', explanation: 'Chọn đúng mệnh giá 5.000đ.' },
        ],
        2: [
            { text: 'Tờ 10.000đ lớn hơn tờ nào?', options: ['20.000đ', '10.000đ', '5.000đ', '50.000đ'], answer: '5.000đ', explanation: '10.000đ lớn hơn 5.000đ.' },
            { text: 'Nếu có 2.000đ và 5.000đ, tờ nào có giá trị cao hơn?', options: ['2.000đ', '5.000đ', 'Bằng nhau', 'Không biết'], answer: '5.000đ', explanation: '5.000đ lớn hơn 2.000đ.' },
            { text: 'Tờ tiền nào đủ mua món đồ giá 10.000đ?', options: ['5.000đ', '2.000đ', '10.000đ', '1.000đ'], answer: '10.000đ', explanation: '10.000đ vừa đủ.' },
        ],
        3: [
            { text: 'Trong các tờ sau, tờ nào có giá trị lớn nhất?', options: ['5.000đ', '10.000đ', '20.000đ', '2.000đ'], answer: '20.000đ', explanation: '20.000đ là lớn nhất.' },
            { text: 'Bé có 10.000đ và 20.000đ. Tờ nào nên dùng trước để mua món 8.000đ?', options: ['10.000đ', '20.000đ', 'Cả hai', 'Không tờ nào'], answer: '10.000đ', explanation: 'Dùng tờ gần giá món hơn để dễ tính tiền thừa.' },
            { text: 'Món đồ giá 15.000đ. Cách nào hợp lý hơn?', options: ['1 tờ 20.000đ', '1 tờ 5.000đ', '1 tờ 2.000đ', '1 tờ 10.000đ'], answer: '1 tờ 20.000đ', explanation: '20.000đ đủ để thanh toán.' },
        ],
    };

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Chọn đáp án đúng:',
        text: item.text,
        options: uniqueOptions(item.options),
        answer: item.answer,
        explanation: item.explanation
    });
}

function generateMoneyCompareQuestion(level: number, skillId: string): Question {
    const pools: Record<number, McqSeed[]> = {
        1: [
            { text: 'Bé An có 2.000đ, bé Bình có 5.000đ. Ai có nhiều tiền hơn?', options: ['Bé An', 'Bé Bình', 'Bằng nhau', 'Không biết'], answer: 'Bé Bình', explanation: '5.000đ lớn hơn 2.000đ.' },
            { text: '5.000đ so với 1.000đ thì thế nào?', options: ['Nhỏ hơn', 'Lớn hơn', 'Bằng nhau', 'Không so sánh được'], answer: 'Lớn hơn', explanation: '5.000đ lớn hơn 1.000đ.' },
            { text: 'Bé có 10.000đ và em có 2.000đ. Ai có ít tiền hơn?', options: ['Bé', 'Em', 'Bằng nhau', 'Không biết'], answer: 'Em', explanation: '2.000đ ít hơn 10.000đ.' },
        ],
        2: [
            { text: 'Bé Mai có 5.000đ + 5.000đ. Bé Lan có 10.000đ. Ai có nhiều hơn?', options: ['Mai', 'Lan', 'Bằng nhau', 'Không biết'], answer: 'Bằng nhau', explanation: 'Cả hai đều có 10.000đ.' },
            { text: '8.000đ so với 10.000đ thì thế nào?', options: ['Lớn hơn', 'Nhỏ hơn', 'Bằng nhau', 'Không biết'], answer: 'Nhỏ hơn', explanation: '8.000đ nhỏ hơn 10.000đ.' },
            { text: 'Bé Nam có 20.000đ, mua món 5.000đ. Tiền còn lại so với 10.000đ là?', options: ['Lớn hơn', 'Nhỏ hơn', 'Bằng nhau', 'Không biết'], answer: 'Lớn hơn', explanation: 'Nam còn 15.000đ.' },
        ],
        3: [
            { text: 'An có 10.000đ + 5.000đ, Bình có 20.000đ. Ai có nhiều tiền hơn?', options: ['An', 'Bình', 'Bằng nhau', 'Không biết'], answer: 'Bình', explanation: '20.000đ lớn hơn 15.000đ.' },
            { text: 'Lan có 50.000đ, mua món 20.000đ. Số tiền còn lại so với 25.000đ là?', options: ['Lớn hơn', 'Nhỏ hơn', 'Bằng nhau', 'Không biết'], answer: 'Lớn hơn', explanation: 'Lan còn 30.000đ.' },
            { text: 'Tờ 20.000đ và hai tờ 10.000đ thì sao?', options: ['Tờ 20.000đ lớn hơn', 'Hai tờ 10.000đ lớn hơn', 'Bằng nhau', 'Không so sánh được'], answer: 'Bằng nhau', explanation: 'Cả hai đều là 20.000đ.' },
        ],
    };

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'So sánh giá trị tiền:',
        text: item.text,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation
    });
}

function generateMoneySumQuestion(level: number, skillId: string): Question {
    const pools: Record<number, InputSeed[]> = {
        1: [
            { text: 'Bé có 2.000đ và 5.000đ. Tổng cộng là bao nhiêu?', answer: '7000', explanation: '2.000 + 5.000 = 7.000.' },
            { text: 'Bé có 1.000đ và 1.000đ. Tổng cộng là bao nhiêu?', answer: '2000', explanation: '1.000 + 1.000 = 2.000.' },
            { text: 'Bé có 5.000đ và 5.000đ. Tổng cộng là bao nhiêu?', answer: '10000', explanation: '5.000 + 5.000 = 10.000.' },
        ],
        2: [
            { text: 'Bé có 10.000đ, 5.000đ và 2.000đ. Tổng cộng là bao nhiêu?', answer: '17000', explanation: '10.000 + 5.000 + 2.000 = 17.000.' },
            { text: 'Bé có 20.000đ và 10.000đ. Tổng cộng là bao nhiêu?', answer: '30000', explanation: '20.000 + 10.000 = 30.000.' },
            { text: 'Bé có 5.000đ, 5.000đ và 10.000đ. Tổng cộng là bao nhiêu?', answer: '20000', explanation: '5.000 + 5.000 + 10.000 = 20.000.' },
        ],
        3: [
            { text: 'Bé có 20.000đ, 10.000đ và 5.000đ. Tổng cộng là bao nhiêu?', answer: '35000', explanation: '20.000 + 10.000 + 5.000 = 35.000.' },
            { text: 'Bé có 50.000đ, 10.000đ và 10.000đ. Tổng cộng là bao nhiêu?', answer: '70000', explanation: '50.000 + 10.000 + 10.000 = 70.000.' },
            { text: 'Bé có 20.000đ, 20.000đ và 10.000đ. Tổng cộng là bao nhiêu?', answer: '50000', explanation: '20.000 + 20.000 + 10.000 = 50.000.' },
        ],
    };

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'input',
        instruction: 'Nhập số tiền đúng:',
        text: item.text,
        answer: item.answer,
        hint: 'Chỉ nhập số, ví dụ: 7000',
        explanation: item.explanation
    });
}

function generateNeedWantQuestion(level: number, skillId: string): Question {
    const pools: Record<number, McqSeed[]> = {
        1: [
            { text: 'Món nào là cần thiết hơn?', options: ['Gạo', 'Đồ chơi robot', 'Kem', 'Truyện tranh'], answer: 'Gạo', explanation: 'Gạo là nhu cầu thiết yếu.' },
            { text: 'Món nào chỉ là muốn?', options: ['Nước uống', 'Sách giáo khoa', 'Bim bim', 'Thuốc'], answer: 'Bim bim', explanation: 'Bim bim là món muốn, không phải nhu cầu thiết yếu.' },
            { text: 'Khi đi học, món nào cần hơn?', options: ['Bút chì', 'Kẹo', 'Bóng bay', 'Đồ chơi'], answer: 'Bút chì', explanation: 'Bút chì cần cho việc học.' },
        ],
        2: [
            { text: 'Nếu tiền ít, bé nên mua gì trước?', options: ['Sữa', 'Đồ chơi', 'Sticker', 'Kem'], answer: 'Sữa', explanation: 'Sữa cần thiết hơn.' },
            { text: 'Món nào có thể để dành mua sau?', options: ['Thuốc khi ốm', 'Áo mưa', 'Gói snack', 'Nước uống'], answer: 'Gói snack', explanation: 'Snack là món muốn.' },
            { text: 'Bé muốn tiết kiệm hơn. Bé nên bỏ món nào?', options: ['Vở học', 'Bánh ngọt thêm', 'Nước lọc', 'Bút'], answer: 'Bánh ngọt thêm', explanation: 'Đó là món muốn, có thể bỏ bớt.' },
        ],
        3: [
            { text: 'Bé có 20.000đ. Nên chọn cách nào hợp lý hơn?', options: ['Mua sách và bút', 'Mua 2 món đồ chơi', 'Mua snack và game', 'Mua sticker và kẹo'], answer: 'Mua sách và bút', explanation: 'Ưu tiên món cần cho học tập.' },
            { text: 'Muốn đạt mục tiêu tiết kiệm, bé nên làm gì?', options: ['Mua ngay đồ chơi mới', 'Bỏ heo đất mỗi tuần', 'Mua snack mỗi ngày', 'Tiêu hết tiền mừng tuổi'], answer: 'Bỏ heo đất mỗi tuần', explanation: 'Tiết kiệm đều đặn giúp đạt mục tiêu.' },
            { text: 'Khi lập kế hoạch chi tiêu, bé nên ưu tiên gì trước?', options: ['Nhu cầu cần thiết', 'Đồ chơi mới', 'Kẹo bánh', 'Game online'], answer: 'Nhu cầu cần thiết', explanation: 'Luôn ưu tiên món cần trước.' },
        ],
    };

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Chọn đáp án hợp lý:',
        text: item.text,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation
    });
}

function generateShoppingQuestion(level: number, skillId: string): Question {
    let pools: Record<number, McqSeed[]>;

    if (skillId === 'fin2-shopping') {
        pools = {
            1: [
                { text: 'Bé mua bút 5.000đ và thước 5.000đ. Tổng tiền là bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '10.000đ', explanation: '5.000 + 5.000 = 10.000.' },
                { text: 'Bé có 20.000đ, mua sữa 10.000đ. Bé còn bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '10.000đ', explanation: '20.000 - 10.000 = 10.000.' },
                { text: 'Bé mua vở 8.000đ và bút 2.000đ. Tổng tiền là bao nhiêu?', options: ['10.000đ', '8.000đ', '6.000đ', '12.000đ'], answer: '10.000đ', explanation: '8.000 + 2.000 = 10.000.' },
            ],
            2: [
                { text: 'Bé có 30.000đ, mua vở 10.000đ và bút màu 15.000đ. Bé còn bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '5.000đ', explanation: '30.000 - 10.000 - 15.000 = 5.000.' },
                { text: 'Bé mua 3 món: bánh 5.000đ, sữa 10.000đ, bút 5.000đ. Tổng tiền là bao nhiêu?', options: ['15.000đ', '20.000đ', '25.000đ', '30.000đ'], answer: '20.000đ', explanation: '5.000 + 10.000 + 5.000 = 20.000.' },
                { text: 'Bé có 50.000đ, mua đồ hết 35.000đ. Bé còn bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '50.000 - 35.000 = 15.000.' },
            ],
            3: [
                { text: 'Bé có 40.000đ. Bé mua sách 15.000đ và bút màu 10.000đ. Bé còn bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '40.000 - 15.000 - 10.000 = 15.000.' },
                { text: 'Bé mua sữa 12.000đ và bánh 8.000đ. Tổng cộng là bao nhiêu?', options: ['18.000đ', '20.000đ', '22.000đ', '24.000đ'], answer: '20.000đ', explanation: '12.000 + 8.000 = 20.000.' },
                { text: 'Bé có 50.000đ, mua vở 20.000đ và bút 10.000đ. Bé còn lại bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '20.000đ', explanation: '50.000 - 20.000 - 10.000 = 20.000.' },
            ],
        };
    } else if (skillId === 'shopping-math') {
        pools = {
            1: [
                { text: 'Bé có 20.000đ. Chọn cặp món nào mua vừa đủ?', options: ['Bút 5.000đ + vở 10.000đ', 'Sữa 10.000đ + bánh 10.000đ', 'Thước 3.000đ + bút 5.000đ', 'Kẹo 2.000đ + bánh 5.000đ'], answer: 'Sữa 10.000đ + bánh 10.000đ', explanation: '10.000 + 10.000 = 20.000.' },
                { text: 'Món nào rẻ hơn?', options: ['Bút 8.000đ', 'Vở 12.000đ', 'Bằng nhau', 'Không biết'], answer: 'Bút 8.000đ', explanation: '8.000đ ít hơn 12.000đ.' },
                { text: 'Bé có 25.000đ. Cặp món nào có tổng tiền ít nhất?', options: ['Sách 20.000đ', 'Bút 5.000đ + thước 5.000đ', 'Đồ chơi 25.000đ', 'Sticker 15.000đ + kẹo 10.000đ'], answer: 'Bút 5.000đ + thước 5.000đ', explanation: '5.000đ + 5.000đ = 10.000đ, là tổng nhỏ nhất.' },
            ],
            2: [
                { text: 'Bé có 30.000đ. Mua bút 8.000đ và vở 12.000đ thì còn bao nhiêu?', options: ['8.000đ', '10.000đ', '12.000đ', '15.000đ'], answer: '10.000đ', explanation: '30.000 - 8.000 - 12.000 = 10.000.' },
                { text: 'Combo nào rẻ hơn?', options: ['Sữa 10.000đ + bánh 8.000đ', 'Vở 12.000đ + bút màu 10.000đ', 'Bằng nhau', 'Không biết'], answer: 'Sữa 10.000đ + bánh 8.000đ', explanation: '18.000đ rẻ hơn 22.000đ.' },
                { text: 'Bé có 35.000đ. Nhóm món nào mua xong vẫn còn 5.000đ?', options: ['Sách 20.000đ + bút 10.000đ', 'Đồ chơi 35.000đ', 'Sticker 18.000đ + bánh 15.000đ', 'Kem 20.000đ + game 20.000đ'], answer: 'Sách 20.000đ + bút 10.000đ', explanation: '20.000đ + 10.000đ = 30.000đ, còn 5.000đ.' },
            ],
            3: [
                { text: 'Bé có 50.000đ. Combo nào có tổng tiền gần 50.000đ nhất mà không vượt quá?', options: ['Sách 22.000đ + vở 12.000đ + bút 8.000đ', 'Bánh 15.000đ + nước 12.000đ + kẹo 10.000đ', 'Đồ chơi 35.000đ + snack 20.000đ', 'Sticker 10.000đ + game 45.000đ'], answer: 'Sách 22.000đ + vở 12.000đ + bút 8.000đ', explanation: '22.000đ + 12.000đ + 8.000đ = 42.000đ, không vượt 50.000đ và gần nhất trong các lựa chọn đúng.' },
                { text: 'Bé có 60.000đ. Mua sách 25.000đ, bút màu 15.000đ và thước 5.000đ. Còn bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '60.000 - 25.000 - 15.000 - 5.000 = 15.000.' },
                { text: 'Món nào là món muốn, có thể bỏ ra trước để giảm tiền mua?', options: ['Vở học 10.000đ', 'Bút chì 5.000đ', 'Sticker 12.000đ', 'Thước 3.000đ'], answer: 'Sticker 12.000đ', explanation: 'Sticker là món muốn, không phải món cần.' },
            ],
        };
    } else {
        pools = {
            1: [
                { text: 'Bé có 50.000đ. Bé mua sách 20.000đ, bút 5.000đ và nước 10.000đ. Còn lại bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '50.000 - 20.000 - 5.000 - 10.000 = 15.000.' },
                { text: 'Mẹ đưa 100.000đ. Bé mua 3 món hết 65.000đ. Tiền thừa là bao nhiêu?', options: ['25.000đ', '30.000đ', '35.000đ', '40.000đ'], answer: '35.000đ', explanation: '100.000 - 65.000 = 35.000.' },
                { text: 'Bé muốn mua bút 8.000đ, vở 12.000đ và thước 5.000đ. Tổng cộng là bao nhiêu?', options: ['20.000đ', '25.000đ', '30.000đ', '35.000đ'], answer: '25.000đ', explanation: '8.000 + 12.000 + 5.000 = 25.000.' },
            ],
            2: [
                { text: 'Bé có 80.000đ. Bé mua sách 25.000đ, hộp bút 20.000đ và nước 10.000đ. Còn lại bao nhiêu?', options: ['20.000đ', '25.000đ', '30.000đ', '35.000đ'], answer: '25.000đ', explanation: '80.000 - 25.000 - 20.000 - 10.000 = 25.000.' },
                { text: 'Bé có 100.000đ. Mua 4 món hết 70.000đ. Tiền thừa là bao nhiêu?', options: ['20.000đ', '25.000đ', '30.000đ', '35.000đ'], answer: '30.000đ', explanation: '100.000 - 70.000 = 30.000.' },
                { text: 'Bé mua 3 món giá 12.000đ, 18.000đ và 15.000đ. Tổng cộng là bao nhiêu?', options: ['35.000đ', '40.000đ', '45.000đ', '50.000đ'], answer: '45.000đ', explanation: '12.000 + 18.000 + 15.000 = 45.000.' },
            ],
            3: [
                { text: 'Bé có 120.000đ. Bé mua sách 35.000đ, bút màu 25.000đ, thước 10.000đ và nước 15.000đ. Còn lại bao nhiêu?', options: ['25.000đ', '30.000đ', '35.000đ', '40.000đ'], answer: '35.000đ', explanation: '120.000 - 35.000 - 25.000 - 10.000 - 15.000 = 35.000.' },
                { text: 'Bé có 90.000đ. Mua vở 15.000đ, sách 30.000đ và bút 10.000đ. Bé còn bao nhiêu?', options: ['25.000đ', '30.000đ', '35.000đ', '40.000đ'], answer: '35.000đ', explanation: '90.000 - 15.000 - 30.000 - 10.000 = 35.000.' },
                { text: 'Bé có 100.000đ. Combo nào vẫn còn tiền nhiều nhất?', options: ['Sách 25.000đ + bút 15.000đ', 'Đồ chơi 60.000đ + snack 20.000đ', 'Vở 12.000đ + sticker 18.000đ', 'Bánh 15.000đ + nước 12.000đ + game 30.000đ'], answer: 'Vở 12.000đ + sticker 18.000đ', explanation: 'Chi 30.000đ nên còn lại nhiều nhất.' },
            ],
        };
    }

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Tính tiền khi mua sắm:',
        text: item.text,
        options: uniqueOptions(item.options),
        answer: item.answer,
        explanation: item.explanation
    });
}

function generateSavingQuestion(level: number, skillId: string): Question {
    let pools: Record<number, McqSeed[]>;

    if (skillId === 'saving-pig') {
        pools = {
            1: [
                { text: 'Muốn nuôi heo đất tốt, bé nên làm gì?', options: ['Bỏ tiền vào đều đặn', 'Đập heo ngay', 'Mua kẹo mỗi ngày', 'Tiêu hết tiền'], answer: 'Bỏ tiền vào đều đặn', explanation: 'Tiết kiệm đều giúp heo đất lớn lên.' },
                { text: 'Bé có 5.000đ. Cách nào tốt hơn cho heo đất?', options: ['Bỏ vào heo đất', 'Mua snack ngay', 'Mua game', 'Cho hết bạn'], answer: 'Bỏ vào heo đất', explanation: 'Bỏ vào heo đất là cách tiết kiệm.' },
                { text: 'Heo đất giúp bé điều gì?', options: ['Giữ tiền tiết kiệm', 'Làm mất tiền', 'Tiêu tiền nhanh hơn', 'Không có ích'], answer: 'Giữ tiền tiết kiệm', explanation: 'Heo đất giúp giữ tiền an toàn.' },
            ],
            2: [
                { text: 'Bé bỏ 2.000đ mỗi ngày vào heo đất. Sau 5 ngày bé có bao nhiêu?', options: ['6.000đ', '8.000đ', '10.000đ', '12.000đ'], answer: '10.000đ', explanation: '2.000 × 5 = 10.000.' },
                { text: 'Bé có 15.000đ trong heo đất và bỏ thêm 5.000đ. Bé có bao nhiêu?', options: ['15.000đ', '20.000đ', '25.000đ', '30.000đ'], answer: '20.000đ', explanation: '15.000 + 5.000 = 20.000.' },
                { text: 'Khi muốn heo đất đầy nhanh hơn, bé nên làm gì?', options: ['Bỏ tiền tiết kiệm hằng tuần', 'Mua snack hằng ngày', 'Mua đồ chơi mới', 'Tiêu hết tiền mừng tuổi'], answer: 'Bỏ tiền tiết kiệm hằng tuần', explanation: 'Thói quen đều đặn giúp tiết kiệm tốt hơn.' },
            ],
            3: [
                { text: 'Bé có 20.000đ trong heo đất và bỏ thêm 10.000đ mỗi tuần. Sau 2 tuần bé có bao nhiêu?', options: ['30.000đ', '35.000đ', '40.000đ', '45.000đ'], answer: '40.000đ', explanation: '20.000 + 10.000 + 10.000 = 40.000.' },
                { text: 'Bé muốn mua bút 35.000đ. Heo đất đang có 25.000đ. Bé còn thiếu bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '10.000đ', explanation: '35.000 - 25.000 = 10.000.' },
                { text: 'Cách nào giúp heo đất tăng đều nhất?', options: ['Bỏ tiền đúng ngày mỗi tuần', 'Chỉ bỏ khi nhớ', 'Hay rút ra mua đồ chơi', 'Đập heo thường xuyên'], answer: 'Bỏ tiền đúng ngày mỗi tuần', explanation: 'Đều đặn là cách tốt nhất.' },
            ],
        };
    } else if (skillId === 'saving-goal') {
        pools = {
            1: [
                { text: 'Bé muốn mua hộp bút 30.000đ. Mỗi tuần bé để dành 10.000đ. Sau 3 tuần bé có đủ chưa?', options: ['Đủ rồi', 'Chưa đủ', 'Thiếu 10.000đ', 'Thiếu 20.000đ'], answer: 'Đủ rồi', explanation: '10.000 × 3 = 30.000.' },
                { text: 'Để mua sách 25.000đ, bé đã có 15.000đ. Bé cần thêm bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '10.000đ', explanation: '25.000 - 15.000 = 10.000.' },
                { text: 'Bé tiết kiệm 5.000đ mỗi ngày. Sau 4 ngày bé có bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '20.000đ', explanation: '5.000 × 4 = 20.000.' },
            ],
            2: [
                { text: 'Bé có mục tiêu mua sách 40.000đ và đã có 25.000đ. Bé cần thêm bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '40.000 - 25.000 = 15.000.' },
                { text: 'Mỗi tuần bé để dành 12.000đ. Sau 3 tuần bé có bao nhiêu?', options: ['24.000đ', '30.000đ', '36.000đ', '42.000đ'], answer: '36.000đ', explanation: '12.000 × 3 = 36.000.' },
                { text: 'Bé muốn mua cặp 50.000đ. Bé đã có 35.000đ. Nếu mỗi tuần để dành 5.000đ, sau 3 tuần bé đủ chưa?', options: ['Đủ rồi', 'Chưa đủ', 'Thiếu 5.000đ', 'Thiếu 10.000đ'], answer: 'Đủ rồi', explanation: '35.000 + 5.000 × 3 = 50.000.' },
            ],
            3: [
                { text: 'Bé có mục tiêu mua ba lô 50.000đ. Bé đã tiết kiệm được 20.000đ trong tháng đầu và 15.000đ trong tháng sau. Bé còn thiếu bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '15.000đ', explanation: '20.000 + 15.000 = 35.000, còn thiếu 15.000.' },
                { text: 'Mỗi tuần bé để dành 10.000đ. Sau 5 tuần bé có bao nhiêu tiền tiết kiệm?', options: ['30.000đ', '40.000đ', '50.000đ', '60.000đ'], answer: '50.000đ', explanation: '10.000 × 5 = 50.000.' },
                { text: 'Bé muốn mua xe đồ chơi 50.000đ. Bé có 20.000đ và để dành thêm 10.000đ mỗi tuần. Sau 3 tuần bé có đủ chưa?', options: ['Đủ rồi', 'Chưa đủ', 'Thiếu 5.000đ', 'Thiếu 10.000đ'], answer: 'Đủ rồi', explanation: '20.000 + 10.000 × 3 = 50.000.' },
            ],
        };
    } else {
        pools = {
            1: [
                { text: 'Muốn tiết kiệm tiền, bé nên làm gì?', options: ['Bỏ heo đất', 'Mua kẹo mỗi ngày', 'Chơi game có phí', 'Mua đồ chơi mới'], answer: 'Bỏ heo đất', explanation: 'Bỏ heo đất là cách tiết kiệm quen thuộc.' },
                { text: 'Khi có tiền mừng tuổi, bé nên làm gì để dành cho sau này?', options: ['Tiêu hết ngay', 'Bỏ heo đất', 'Mua snack', 'Mua game'], answer: 'Bỏ heo đất', explanation: 'Tiết kiệm giúp dùng cho mục tiêu sau này.' },
                { text: 'Muốn mua món đồ lớn hơn sau này, bé nên làm gì?', options: ['Tiết kiệm dần', 'Tiêu ngay hôm nay', 'Mượn bạn liên tục', 'Không cần tính'], answer: 'Tiết kiệm dần', explanation: 'Tiết kiệm dần giúp đạt mục tiêu.' },
            ],
            2: [
                { text: 'Bé có 20.000đ, muốn để dành một nửa. Bé nên bỏ vào heo đất bao nhiêu?', options: ['5.000đ', '10.000đ', '15.000đ', '20.000đ'], answer: '10.000đ', explanation: 'Một nửa của 20.000đ là 10.000đ.' },
                { text: 'Cách nào giúp bé giữ tiền tốt hơn?', options: ['Bỏ riêng tiền tiết kiệm', 'Tiêu dần mỗi ngày', 'Mua đồ theo thích', 'Không ghi nhớ gì'], answer: 'Bỏ riêng tiền tiết kiệm', explanation: 'Tách riêng tiền tiết kiệm giúp không tiêu nhầm.' },
                { text: 'Bé muốn tiết kiệm cho mục tiêu học tập. Món nào nên bớt mua?', options: ['Bút chì', 'Vở học', 'Snack', 'Thước'], answer: 'Snack', explanation: 'Snack là món muốn, có thể giảm bớt.' },
            ],
            3: [
                { text: 'Cách nào giúp bé tiết kiệm tốt hơn?', options: ['Mua snack mỗi ngày', 'Ghi lại tiền đã chi', 'Tiêu hết tiền được cho', 'Mua đồ theo thích'], answer: 'Ghi lại tiền đã chi', explanation: 'Theo dõi chi tiêu giúp tiết kiệm tốt hơn.' },
                { text: 'Nếu bé có 40.000đ và muốn tiết kiệm một nửa, bé nên giữ lại bao nhiêu?', options: ['10.000đ', '15.000đ', '20.000đ', '25.000đ'], answer: '20.000đ', explanation: 'Một nửa của 40.000đ là 20.000đ.' },
                { text: 'Muốn đạt mục tiêu tiết kiệm nhanh hơn, bé nên làm gì trước?', options: ['Giảm món muốn', 'Mua thêm đồ chơi', 'Mua quà ngay', 'Tiêu hết tiền được cho'], answer: 'Giảm món muốn', explanation: 'Giảm các món muốn giúp tiết kiệm nhanh hơn.' },
            ],
        };
    }

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Chọn đáp án đúng:',
        text: item.text,
        options: uniqueOptions(item.options),
        answer: item.answer,
        explanation: item.explanation
    });
}
function generateBudgetQuestion(level: number, skillId: string): Question {
    const budgets = level === 1
        ? [
              { total: 30000, spent: [10000, 5000] },
              { total: 40000, spent: [10000, 10000] },
              { total: 20000, spent: [5000, 5000] },
          ]
        : level === 2
          ? [
                { total: 50000, spent: [10000, 15000] },
                { total: 50000, spent: [10000, 20000] },
                { total: 40000, spent: [5000, 10000, 5000] },
            ]
          : [
                { total: 50000, spent: [10000, 15000, 15000] },
                { total: 50000, spent: [15000, 10000, 10000] },
                { total: 50000, spent: [20000, 10000, 10000] },
            ];

    const item = pickRandom(budgets);
    const spentSum = item.spent.reduce((sum, value) => sum + value, 0);
    const left = item.total - spentSum;
    const options = [left, left + 5000, Math.max(0, left - 5000), item.total].map(formatMoney);
    const uniqueOptions = Array.from(new Set(options));
    let attempts = 0;
    while (uniqueOptions.length < 4 && attempts < 10) {
        const newVal = formatMoney(left + (attempts + 1) * 10000);
        if (!uniqueOptions.includes(newVal)) uniqueOptions.push(newVal);
        attempts++;
    }

    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Tính phần tiền còn lại:',
        text: `Bé có ${formatMoney(item.total)}. Bé đã chi ${item.spent.map(formatMoney).join(', ')}. Bé còn lại bao nhiêu?`,
        options: uniqueOptions.slice(0, 4),
        answer: formatMoney(left),
        explanation: `${formatMoney(item.total)} - ${item.spent.map(formatMoney).join(' - ')} = ${formatMoney(left)}.`
    });
}

function generateJobValueQuestion(level: number, skillId: string): Question {
    const pools: Record<number, McqSeed[]> = {
        1: [
            { text: 'Ai là người thường dạy học cho học sinh?', options: ['Bác sĩ', 'Giáo viên', 'Đầu bếp', 'Phi công'], answer: 'Giáo viên', explanation: 'Giáo viên dạy học cho học sinh.' },
            { text: 'Ai là người giúp chữa bệnh cho mọi người?', options: ['Bác sĩ', 'Nông dân', 'Thợ xây', 'Tài xế'], answer: 'Bác sĩ', explanation: 'Bác sĩ giúp chữa bệnh.' },
            { text: 'Ai là người trồng rau và lúa?', options: ['Nông dân', 'Nhạc sĩ', 'Họa sĩ', 'Nhân viên bán hàng'], answer: 'Nông dân', explanation: 'Nông dân làm việc ngoài đồng ruộng.' },
        ],
        2: [
            { text: 'Vì sao mọi người cần đi làm?', options: ['Để kiếm tiền nuôi gia đình', 'Để chơi suốt ngày', 'Để tiêu hết tiền', 'Để không cần tiết kiệm'], answer: 'Để kiếm tiền nuôi gia đình', explanation: 'Lao động giúp kiếm thu nhập cho cuộc sống.' },
            { text: 'Nghề nào thường làm trong bệnh viện?', options: ['Y tá', 'Thợ mộc', 'Lái xe', 'Đầu bếp'], answer: 'Y tá', explanation: 'Y tá chăm sóc bệnh nhân ở bệnh viện.' },
            { text: 'Tiền lương là gì?', options: ['Tiền nhận được khi đi làm', 'Tiền mừng tuổi', 'Tiền thưởng chơi game', 'Tiền bạn cho'], answer: 'Tiền nhận được khi đi làm', explanation: 'Tiền lương là thu nhập từ công việc.' },
        ],
        3: [
            { text: 'Tại sao học giỏi giúp bé kiếm tiền tốt hơn sau này?', options: ['Có nhiều nghề hay để chọn', 'Vì bé sẽ được thưởng tiền', 'Vì giáo viên sẽ cho tiền', 'Học không liên quan đến tiền'], answer: 'Có nhiều nghề hay để chọn', explanation: 'Học tốt mở ra nhiều cơ hội nghề nghiệp.' },
            { text: 'Để trở thành bác sĩ, bé cần làm gì?', options: ['Học tập chăm chỉ nhiều năm', 'Chỉ cần muốn là được', 'Mua bộ đồ bác sĩ', 'Xem phim về bác sĩ'], answer: 'Học tập chăm chỉ nhiều năm', explanation: 'Nghề bác sĩ đòi hỏi nhiều năm học tập và rèn luyện.' },
            { text: 'Công việc nào giúp ích cộng đồng nhiều nhất?', options: ['Tất cả đều quan trọng', 'Chỉ bác sĩ', 'Chỉ giáo viên', 'Chỉ công an'], answer: 'Tất cả đều quan trọng', explanation: 'Mỗi nghề đều đóng góp cho xã hội theo cách riêng.' },
        ],
    };

    const item = pickRandom(pools[level]);
    return QuestionFactory.create({
        subjectId: 'finance',
        skillId,
        type: 'mcq',
        instruction: 'Hiểu về công việc và thu nhập:',
        text: item.text,
        options: uniqueOptions(item.options),
        answer: item.answer,
        explanation: item.explanation
    });
}

export function generateFinanceQuestion(skillId: string, level: number = 1): Question {
    const safeLevel = getBalancedFinanceLevel(skillId, level);

    if (skillId === 'C3' || skillId === 'identify-money') {
        return generateMoneyIdQuestion(safeLevel, skillId);
    }

    if (skillId === 'compare-value') {
        return generateMoneyCompareQuestion(safeLevel, skillId);
    }

    if (skillId === 'money-sum') {
        return generateMoneySumQuestion(safeLevel, skillId);
    }

    if (skillId === 'fin2-shopping' || skillId === 'fin3-calc' || skillId === 'shopping-math') {
        return generateShoppingQuestion(safeLevel, skillId);
    }

    if (skillId === 'need-vs-want') {
        return generateNeedWantQuestion(safeLevel, skillId);
    }

    if (skillId === 'saving-goal' || skillId === 'fin2-saving' || skillId === 'saving-pig') {
        return generateSavingQuestion(safeLevel, skillId);
    }

    if (skillId === 'fin3-budget') {
        return generateBudgetQuestion(safeLevel, skillId);
    }

    if (skillId === 'job-value') {
        return generateJobValueQuestion(safeLevel, skillId);
    }

    return generateNeedWantQuestion(safeLevel, skillId);
}
