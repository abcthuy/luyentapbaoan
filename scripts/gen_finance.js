const fs = require('fs');
const path = require('path');

function generateFinanceQuestions() {
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

    // ============================================================
    // C3: Nhận biết tiền VND — 3 levels
    // ============================================================
    const vndNotesL1 = [
        { val: 1000, color: 'màu tím/nâu', hint: 'Tờ tiền nhỏ nhất, màu tím/nâu' },
        { val: 2000, color: 'màu nâu xám', hint: 'Tờ tiền giấy màu nâu xám' },
        { val: 5000, color: 'màu xanh lơ', hint: 'Tờ tiền có màu xanh ngọc' },
    ];
    const vndNotesL2 = [
        ...vndNotesL1,
        { val: 10000, color: 'màu vàng nâu (Polyme)', hint: 'Tờ Polyme nhỏ nhất màu vàng' },
        { val: 20000, color: 'màu xanh biển (Polyme)', hint: 'Tờ Polyme có hình Chùa Cầu' },
        { val: 50000, color: 'màu hồng (Polyme)', hint: 'Tờ Polyme màu hồng phấn' }
    ];
    const vndNotesL3 = [
        ...vndNotesL2,
        { val: 100000, color: 'màu xanh lá (Polyme)', hint: 'Tờ có mệnh giá lớn nhất phổ biến' },
        { val: 200000, color: 'màu đỏ cam (Polyme)', hint: 'Tờ 200k rất hiếm dùng' },
        { val: 500000, color: 'màu xanh dương đậm (Polyme)', hint: 'Tờ tiền có mệnh giá lớn nhất' }
    ];

    [1, 2, 3].forEach(level => {
        const notes = level === 1 ? vndNotesL1 : level === 2 ? vndNotesL2 : vndNotesL3;
        generateMCQ('stat-fin-c3', 'C3', level, level === 1 ? 30 : 20, (id, skillId, lv, i) => {
            const note = notes[i % notes.length];
            const isAskColor = Math.random() > 0.5;
            let text, ans, options;
            if (isAskColor) {
                text = `Tờ tiền mệnh giá ${note.val.toLocaleString('vi-VN')} đồng thường có đặc điểm gì?`;
                ans = note.color;
                options = [ans, notes[(i + 1) % notes.length].color, notes[(i + 2) % notes.length].color, notes[(i + 3) % notes.length].color];
            } else {
                text = `Tờ tiền ${note.color} có mệnh giá là bao nhiêu?`;
                ans = `${note.val.toLocaleString('vi-VN')} đồng`;
                options = [ans, `${notes[(i + 1) % notes.length].val.toLocaleString('vi-VN')} đồng`, `${notes[(i + 2) % notes.length].val.toLocaleString('vi-VN')} đồng`, `${notes[(i + 3) % notes.length].val.toLocaleString('vi-VN')} đồng`];
            }
            return {
                id, subjectId: 'finance', skillId, type: 'mcq', instruction: 'Nhận biết tiền Việt Nam!',
                content: { text, options: shuffle(options) }, answer: ans, explanation: note.hint
            };
        });
    });

    // ============================================================
    // identify-money: Nhận biết tờ tiền cơ bản — 2 levels
    // ============================================================
    [1, 2].forEach(level => {
        const notes = level === 1 ? vndNotesL1 : vndNotesL2;
        generateMCQ('stat-fin-id', 'identify-money', level, 25, (id, skillId, lv, i) => {
            const note = notes[i % notes.length];
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '💵 Đây là tờ tiền bao nhiêu?',
                content: {
                    text: `Tờ tiền ${note.color}, bé đoán xem đây là tờ bao nhiêu đồng?`,
                    options: shuffle(notes.map(n => `${n.val.toLocaleString('vi-VN')} đồng`).slice(0, 4))
                },
                answer: `${note.val.toLocaleString('vi-VN')} đồng`,
                explanation: `Tờ ${note.color} có mệnh giá ${note.val.toLocaleString('vi-VN')} đồng.`
            };
        });
    });

    // ============================================================
    // compare-value: So sánh giá trị — 3 levels
    // ============================================================
    [1, 2, 3].forEach(level => {
        const vals = level === 1 ? [1000, 2000, 5000] : level === 2 ? [1000, 2000, 5000, 10000, 20000] : [5000, 10000, 20000, 50000, 100000];
        generateMCQ('stat-fin-comp', 'compare-value', level, 30, (id, skillId, lv, i) => {
            const v1 = vals[Math.floor(Math.random() * vals.length)];
            let v2 = vals[Math.floor(Math.random() * vals.length)];
            while (v2 === v1) v2 = vals[Math.floor(Math.random() * vals.length)];

            const isBigger = Math.random() > 0.5;
            const text = isBigger
                ? `Giữa ${v1.toLocaleString('vi-VN')}đ và ${v2.toLocaleString('vi-VN')}đ, tờ nào LỚN hơn?`
                : `Giữa ${v1.toLocaleString('vi-VN')}đ và ${v2.toLocaleString('vi-VN')}đ, tờ nào NHỎ hơn?`;
            const ans = isBigger
                ? `${Math.max(v1, v2).toLocaleString('vi-VN')}đ`
                : `${Math.min(v1, v2).toLocaleString('vi-VN')}đ`;
            const options = [`${v1.toLocaleString('vi-VN')}đ`, `${v2.toLocaleString('vi-VN')}đ`, 'Bằng nhau', 'Không biết'];

            return {
                id, subjectId: 'finance', skillId, type: 'mcq', instruction: 'So sánh giá trị tiền!',
                content: { text, options }, answer: ans,
                explanation: `${Math.max(v1, v2).toLocaleString('vi-VN')}đ lớn hơn ${Math.min(v1, v2).toLocaleString('vi-VN')}đ.`
            };
        });
    });

    // ============================================================
    // money-sum: Cộng tiền đơn giản — 3 levels
    // ============================================================
    [1, 2, 3].forEach(level => {
        const maxNotes = level === 1 ? [1000, 2000, 5000] : level === 2 ? [1000, 2000, 5000, 10000] : [5000, 10000, 20000, 50000];
        const numNotes = level === 1 ? 2 : level === 2 ? 3 : 4;
        generateMCQ('stat-fin-sum', 'money-sum', level, 30, (id, skillId, lv, i) => {
            const picked = Array.from({ length: numNotes }, () => maxNotes[Math.floor(Math.random() * maxNotes.length)]);
            const total = picked.reduce((s, v) => s + v, 0);
            const text = `Bé có ${picked.map(v => v.toLocaleString('vi-VN') + 'đ').join(' + ')}. Tổng cộng bé có bao nhiêu tiền?`;
            const ans = `${total.toLocaleString('vi-VN')}đ`;
            const options = shuffle([ans, `${(total + 1000).toLocaleString('vi-VN')}đ`, `${(total - 1000 > 0 ? total - 1000 : total + 2000).toLocaleString('vi-VN')}đ`, `${(total + 5000).toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: level >= 3 ? 'input' : 'mcq',
                instruction: '💰 Tính tổng tiền!',
                content: { text, ...(level < 3 ? { options } : {}) },
                answer: level >= 3 ? total.toString() : ans,
                explanation: `${picked.map(v => v.toLocaleString('vi-VN')).join(' + ')} = ${total.toLocaleString('vi-VN')}đ`
            };
        });
    });

    // ============================================================
    // need-vs-want: Cần hay Muốn? — 3 levels
    // ============================================================
    const needsL1 = ['Mua gạo ăn', 'Mua nước uống', 'Mua đồng phục đi học', 'Mua sách giáo khoa', 'Mua thuốc khi ốm'];
    const wantsL1 = ['Mua đồ chơi siêu nhân', 'Mua kem sô-cô-la', 'Chơi game ngoài hàng', 'Mua gói bim bim'];
    const needsL2 = [...needsL1, 'Trả tiền điện nước', 'Mua dụng cụ học tập', 'Mua khẩu trang khi dịch bệnh'];
    const wantsL2 = [...wantsL1, 'Mua giày phát sáng', 'Đổi cặp sách mới dù cặp cũ còn tốt', 'Mua sticker trang trí'];
    const needsL3 = [...needsL2, 'Đóng tiền bảo hiểm y tế', 'Mua thức ăn cho em nhỏ', 'Sửa xe đạp đi học'];
    const wantsL3 = [...wantsL2, 'Mua điện thoại mới nhất', 'Đi xem phim rạp', 'Mua balo hàng hiệu'];

    [1, 2, 3].forEach(level => {
        const needs = level === 1 ? needsL1 : level === 2 ? needsL2 : needsL3;
        const wants = level === 1 ? wantsL1 : level === 2 ? wantsL2 : wantsL3;
        generateMCQ('stat-fin-nw', 'need-vs-want', level, 30, (id, skillId, lv, i) => {
            const isNeedTarget = Math.random() > 0.5;
            const ans = isNeedTarget ? needs[Math.floor(Math.random() * needs.length)] : wants[Math.floor(Math.random() * wants.length)];
            const pool = isNeedTarget ? wants : needs;
            let options = shuffle([ans, pool[Math.floor(Math.random() * pool.length)], pool[Math.floor(Math.random() * pool.length)], pool[Math.floor(Math.random() * pool.length)]]);
            let uniqOpts = Array.from(new Set(options));
            while (uniqOpts.length < 4) uniqOpts.push('Bỏ tiền vào heo đất');
            const text = isNeedTarget
                ? 'Việc nào là "CẦN" thực sự không thể bỏ qua?'
                : 'Việc nào chỉ là "MUỐN" chứ không bắt buộc?';
            return {
                id, subjectId: 'finance', skillId, type: 'mcq', instruction: '🤔 Cần hay Muốn?',
                content: { text, options: shuffle(uniqOpts.slice(0, 4)) }, answer: ans,
                explanation: isNeedTarget ? 'Nhu cầu là thứ thiết yếu để sống và học tập.' : 'Mong muốn là thứ thêm niềm vui, có thể tiết kiệm mua sau.'
            };
        });
    });

    // ============================================================
    // fin2-shopping: Đi chợ tính tiền 2 món — 3 levels
    // ============================================================
    const items = [
        { name: 'bút chì', price: 3000 }, { name: 'quyển vở', price: 5000 }, { name: 'cục tẩy', price: 2000 },
        { name: 'hộp sữa', price: 7000 }, { name: 'gói bánh', price: 10000 }, { name: 'chai nước', price: 5000 },
        { name: 'cây thước', price: 4000 }, { name: 'quả cam', price: 8000 }, { name: 'hộp bút màu', price: 15000 },
        { name: 'túi kẹo', price: 12000 }, { name: 'chiếc bánh mì', price: 10000 }, { name: 'ly trà sữa', price: 25000 }
    ];

    [1, 2, 3].forEach(level => {
        const pool = level === 1 ? items.slice(0, 6) : level === 2 ? items.slice(0, 9) : items;
        const numItems = level === 1 ? 2 : level === 2 ? 2 : 3;
        generateMCQ('stat-fin-shop', 'fin2-shopping', level, 30, (id, skillId, lv, i) => {
            const picked = [];
            while (picked.length < numItems) {
                const item = pool[Math.floor(Math.random() * pool.length)];
                if (!picked.find(p => p.name === item.name)) picked.push(item);
            }
            const total = picked.reduce((s, it) => s + it.price, 0);
            const desc = picked.map(it => `${it.name} (${it.price.toLocaleString('vi-VN')}đ)`).join(', ');
            const ans = `${total.toLocaleString('vi-VN')}đ`;
            if (level >= 3) {
                return {
                    id, subjectId: 'finance', skillId, type: 'input',
                    instruction: '🛒 Tính tổng tiền phải trả!',
                    content: { text: `Bé mua: ${desc}. Tổng tiền = ?` },
                    answer: total.toString(),
                    explanation: `${picked.map(it => it.price.toLocaleString('vi-VN')).join(' + ')} = ${total.toLocaleString('vi-VN')}đ`
                };
            }
            const options = shuffle([ans, `${(total + 2000).toLocaleString('vi-VN')}đ`, `${(total - 1000 > 0 ? total - 1000 : total + 3000).toLocaleString('vi-VN')}đ`, `${(total + 5000).toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '🛒 Tính tổng tiền phải trả!',
                content: { text: `Bé mua: ${desc}. Tổng tiền = ?`, options },
                answer: ans, explanation: `${picked.map(it => it.price.toLocaleString('vi-VN')).join(' + ')} = ${total.toLocaleString('vi-VN')}đ`
            };
        });
    });

    // ============================================================
    // fin3-calc: Tính tiền nhiều bước (tiền thừa) — 3 levels
    // ============================================================
    [1, 2, 3].forEach(level => {
        const pool = level === 1 ? items.slice(0, 4) : level === 2 ? items.slice(0, 8) : items;
        const payAmounts = level === 1 ? [10000, 20000] : level === 2 ? [20000, 50000] : [50000, 100000];
        generateMCQ('stat-fin-calc', 'fin3-calc', level, 25, (id, skillId, lv, i) => {
            const item = pool[Math.floor(Math.random() * pool.length)];
            const pay = payAmounts[Math.floor(Math.random() * payAmounts.length)];
            const change = pay - item.price;
            if (change <= 0) {
                // If pay is less than item, just ask total
                return {
                    id, subjectId: 'finance', skillId, type: 'mcq',
                    instruction: '💳 Bé có đủ tiền không?',
                    content: {
                        text: `${item.name} giá ${item.price.toLocaleString('vi-VN')}đ. Bé có ${pay.toLocaleString('vi-VN')}đ. Bé có đủ tiền mua không?`,
                        options: ['Đủ tiền', 'Không đủ tiền']
                    },
                    answer: 'Không đủ tiền',
                    explanation: `${pay.toLocaleString('vi-VN')}đ < ${item.price.toLocaleString('vi-VN')}đ nên không đủ tiền.`
                };
            }
            const ans = `${change.toLocaleString('vi-VN')}đ`;
            if (level >= 3) {
                return {
                    id, subjectId: 'finance', skillId, type: 'input',
                    instruction: '💰 Tính tiền thừa!',
                    content: { text: `Bé mua ${item.name} giá ${item.price.toLocaleString('vi-VN')}đ. Bé đưa ${pay.toLocaleString('vi-VN')}đ. Tiền thừa = ?` },
                    answer: change.toString(),
                    explanation: `${pay.toLocaleString('vi-VN')} - ${item.price.toLocaleString('vi-VN')} = ${change.toLocaleString('vi-VN')}đ`
                };
            }
            const options = shuffle([ans, `${(change + 1000).toLocaleString('vi-VN')}đ`, `${(change - 1000 > 0 ? change - 1000 : change + 3000).toLocaleString('vi-VN')}đ`, `${(change + 5000).toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '💰 Tính tiền thừa!',
                content: { text: `Bé mua ${item.name} giá ${item.price.toLocaleString('vi-VN')}đ. Bé đưa ${pay.toLocaleString('vi-VN')}đ. Tiền thừa = ?`, options },
                answer: ans,
                explanation: `${pay.toLocaleString('vi-VN')} - ${item.price.toLocaleString('vi-VN')} = ${change.toLocaleString('vi-VN')}đ`
            };
        });
    });

    // ============================================================
    // saving-goal: Đạt mục tiêu tiết kiệm — 2 levels
    // ============================================================
    [1, 2].forEach(level => {
        const goalRange = level === 1 ? [10000, 20000, 30000] : [50000, 80000, 100000];
        const savedRange = level === 1 ? [5000, 10000, 15000] : [20000, 30000, 50000];
        generateMCQ('stat-fin-goal', 'saving-goal', level, 25, (id, skillId, lv, i) => {
            const goal = goalRange[Math.floor(Math.random() * goalRange.length)];
            const saved = savedRange[Math.floor(Math.random() * savedRange.length)];
            const need = goal - saved;
            if (need <= 0) {
                return {
                    id, subjectId: 'finance', skillId, type: 'mcq',
                    instruction: '🐷 Bé đã đủ tiền chưa?',
                    content: {
                        text: `Mục tiêu: ${goal.toLocaleString('vi-VN')}đ. Heo đất có: ${saved.toLocaleString('vi-VN')}đ. Bé đã đủ chưa?`,
                        options: ['Đã đủ! 🎉', 'Chưa đủ, cần tiết kiệm thêm']
                    },
                    answer: 'Đã đủ! 🎉',
                    explanation: `${saved.toLocaleString('vi-VN')}đ >= ${goal.toLocaleString('vi-VN')}đ. Đã đủ!`
                };
            }
            const ans = `${need.toLocaleString('vi-VN')}đ`;
            const options = shuffle([ans, `${(need + 5000).toLocaleString('vi-VN')}đ`, `${(need - 5000 > 0 ? need - 5000 : need + 10000).toLocaleString('vi-VN')}đ`, `${goal.toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '🐷 Cần tiết kiệm thêm bao nhiêu?',
                content: { text: `Bé muốn mua món đồ giá ${goal.toLocaleString('vi-VN')}đ. Heo đất có ${saved.toLocaleString('vi-VN')}đ. Cần thêm bao nhiêu?`, options },
                answer: ans,
                explanation: `${goal.toLocaleString('vi-VN')} - ${saved.toLocaleString('vi-VN')} = ${need.toLocaleString('vi-VN')}đ`
            };
        });
    });

    // ============================================================
    // saving-pig: Nuôi heo đất cơ bản — 2 levels
    // ============================================================
    const savingTips = [
        { q: 'Bé nên làm gì khi được lì xì Tết?', a: 'Bỏ heo đất tiết kiệm', wrong: ['Mua đồ chơi hết', 'Cho bạn hết', 'Vứt đi'] },
        { q: 'Mỗi ngày bé tiết kiệm 2.000đ. Sau 7 ngày bé có bao nhiêu?', a: '14.000đ', wrong: ['7.000đ', '10.000đ', '20.000đ'] },
        { q: 'Vì sao nên tiết kiệm tiền?', a: 'Để mua được thứ mình muốn sau này', wrong: ['Để khoe với bạn', 'Vì bắt buộc', 'Để cho người lạ'] },
        { q: 'Bé tiết kiệm 5.000đ mỗi tuần. Sau 4 tuần bé có bao nhiêu?', a: '20.000đ', wrong: ['10.000đ', '15.000đ', '25.000đ'] },
        { q: 'Bé có 10.000đ, muốn mua đồ chơi 15.000đ. Bé nên làm gì?', a: 'Tiết kiệm thêm 5.000đ', wrong: ['Mượn tiền bạn', 'Khóc đòi mẹ', 'Bỏ cuộc'] }
    ];

    [1, 2].forEach(level => {
        const pool = level === 1 ? savingTips.slice(0, 3) : savingTips;
        generateMCQ('stat-fin-pig', 'saving-pig', level, 20, (id, skillId, lv, i) => {
            const tip = pool[i % pool.length];
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '🐷 Tiết kiệm thông minh!',
                content: { text: tip.q, options: shuffle([tip.a, ...tip.wrong]) },
                answer: tip.a, explanation: `Đáp án đúng: "${tip.a}".`
            };
        });
    });

    // ============================================================
    // job-value: Nghề nghiệp & Thu nhập — 2 levels
    // ============================================================
    const jobsL1 = [
        { job: 'Bác sĩ', desc: 'Khám chữa bệnh cho mọi người', wrong: ['Dạy học', 'Nấu ăn', 'Lái xe'] },
        { job: 'Giáo viên', desc: 'Dạy học cho các em nhỏ', wrong: ['Khám bệnh', 'Xây nhà', 'Bán hàng'] },
        { job: 'Nông dân', desc: 'Trồng lúa, nuôi gà, làm ruộng', wrong: ['Lái máy bay', 'Viết sách', 'Sửa máy tính'] },
        { job: 'Cảnh sát', desc: 'Bảo vệ trật tự, giúp đỡ mọi người', wrong: ['Nấu ăn', 'Trồng cây', 'Bán hàng'] }
    ];
    const jobsL2 = [
        ...jobsL1,
        { job: 'Kỹ sư phần mềm', desc: 'Viết chương trình máy tính', wrong: ['Sửa ống nước', 'Dạy học', 'Lái xe'] },
        { job: 'Phi công', desc: 'Lái máy bay chở khách', wrong: ['Lái tàu hỏa', 'Khám bệnh', 'Bán hàng'] },
        { job: 'Đầu bếp', desc: 'Nấu các món ăn ngon', wrong: ['Dạy học', 'Xây nhà', 'Trồng lúa'] }
    ];

    [1, 2].forEach(level => {
        const jobs = level === 1 ? jobsL1 : jobsL2;
        generateMCQ('stat-fin-job', 'job-value', level, 25, (id, skillId, lv, i) => {
            const job = jobs[i % jobs.length];
            const isAskJob = Math.random() > 0.5;
            if (isAskJob) {
                return {
                    id, subjectId: 'finance', skillId, type: 'mcq',
                    instruction: '👷 Nghề nghiệp & Công việc!',
                    content: { text: `Ai là người "${job.desc}"?`, options: shuffle([job.job, ...job.wrong]) },
                    answer: job.job, explanation: `${job.job} là người ${job.desc.toLowerCase()}.`
                };
            }
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '👷 Nghề nghiệp & Công việc!',
                content: { text: `${job.job} có công việc chính là gì?`, options: shuffle([job.desc, ...job.wrong]) },
                answer: job.desc, explanation: `${job.job}: ${job.desc}.`
            };
        });
    });

    // ============================================================
    // shopping-math: Đi chợ thông minh nâng cao — 2 levels
    // ============================================================
    [2, 3].forEach(level => {
        generateMCQ('stat-fin-smartshop', 'shopping-math', level, 25, (id, skillId, lv, i) => {
            const budget = level === 2 ? [20000, 30000, 50000] : [50000, 100000];
            const b = budget[Math.floor(Math.random() * budget.length)];
            const it1 = items[Math.floor(Math.random() * items.length)];
            let it2 = items[Math.floor(Math.random() * items.length)];
            while (it2.name === it1.name) it2 = items[Math.floor(Math.random() * items.length)];
            const total = it1.price + it2.price;
            const canBuy = total <= b;
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '🧮 Đi chợ thông minh!',
                content: {
                    text: `Bé có ${b.toLocaleString('vi-VN')}đ. Muốn mua ${it1.name} (${it1.price.toLocaleString('vi-VN')}đ) và ${it2.name} (${it2.price.toLocaleString('vi-VN')}đ). Bé có đủ tiền không?`,
                    options: canBuy
                        ? [`Đủ! Còn thừa ${(b - total).toLocaleString('vi-VN')}đ`, 'Không đủ tiền', `Đủ! Còn thừa ${(b - total + 5000).toLocaleString('vi-VN')}đ`, 'Vừa đủ']
                        : ['Không đủ tiền', `Đủ! Còn thừa ${Math.abs(b - total).toLocaleString('vi-VN')}đ`, 'Vừa đủ', `Thiếu ${Math.abs(b - total).toLocaleString('vi-VN')}đ`]
                },
                answer: canBuy ? `Đủ! Còn thừa ${(b - total).toLocaleString('vi-VN')}đ` : 'Không đủ tiền',
                explanation: `Tổng: ${it1.price.toLocaleString('vi-VN')} + ${it2.price.toLocaleString('vi-VN')} = ${total.toLocaleString('vi-VN')}đ. Ngân sách: ${b.toLocaleString('vi-VN')}đ.`
            };
        });
    });

    // ============================================================
    // fin2-saving: Heo đất tập tiết kiệm — 2 levels
    // ============================================================
    [1, 2].forEach(level => {
        const weekly = level === 1 ? [2000, 3000, 5000] : [5000, 10000, 15000];
        generateMCQ('stat-fin-save2', 'fin2-saving', level, 25, (id, skillId, lv, i) => {
            const w = weekly[Math.floor(Math.random() * weekly.length)];
            const weeks = level === 1 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 4) + 3;
            const total = w * weeks;
            const ans = `${total.toLocaleString('vi-VN')}đ`;
            const options = shuffle([ans, `${(total + w).toLocaleString('vi-VN')}đ`, `${(total - w > 0 ? total - w : total + 2 * w).toLocaleString('vi-VN')}đ`, `${(w).toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: 'mcq',
                instruction: '🐷 Tính tiền tiết kiệm!',
                content: { text: `Mỗi tuần bé bỏ heo đất ${w.toLocaleString('vi-VN')}đ. Sau ${weeks} tuần, bé có bao nhiêu?`, options },
                answer: ans, explanation: `${w.toLocaleString('vi-VN')} × ${weeks} = ${total.toLocaleString('vi-VN')}đ`
            };
        });
    });

    // ============================================================
    // fin3-budget: Quản lý ngân sách tuần — 2 levels
    // ============================================================
    [2, 3].forEach(level => {
        const allowance = level === 2 ? [30000, 50000] : [70000, 100000];
        generateMCQ('stat-fin-budget', 'fin3-budget', level, 20, (id, skillId, lv, i) => {
            const a = allowance[Math.floor(Math.random() * allowance.length)];
            const spent1 = Math.floor(Math.random() * 3 + 1) * 5000;
            const spent2 = Math.floor(Math.random() * 2 + 1) * 5000;
            const totalSpent = spent1 + spent2;
            const remain = a - totalSpent;
            if (remain <= 0) {
                return {
                    id, subjectId: 'finance', skillId, type: 'mcq',
                    instruction: '📊 Quản lý ngân sách!',
                    content: {
                        text: `Bé có ${a.toLocaleString('vi-VN')}đ/tuần. Đã chi: ăn vặt ${spent1.toLocaleString('vi-VN')}đ, đồ chơi ${spent2.toLocaleString('vi-VN')}đ. Bé còn tiền không?`,
                        options: ['Hết tiền rồi!', `Còn ${(a).toLocaleString('vi-VN')}đ`, 'Còn nhiều', 'Không biết']
                    },
                    answer: 'Hết tiền rồi!',
                    explanation: `${spent1.toLocaleString('vi-VN')} + ${spent2.toLocaleString('vi-VN')} = ${totalSpent.toLocaleString('vi-VN')}đ >= ${a.toLocaleString('vi-VN')}đ.`
                };
            }
            const ans = `${remain.toLocaleString('vi-VN')}đ`;
            const options = shuffle([ans, `${(remain + 5000).toLocaleString('vi-VN')}đ`, `${totalSpent.toLocaleString('vi-VN')}đ`, `${a.toLocaleString('vi-VN')}đ`]);
            return {
                id, subjectId: 'finance', skillId, type: level >= 3 ? 'input' : 'mcq',
                instruction: '📊 Quản lý ngân sách!',
                content: {
                    text: `Bé có ${a.toLocaleString('vi-VN')}đ/tuần. Đã chi: ăn vặt ${spent1.toLocaleString('vi-VN')}đ, đồ chơi ${spent2.toLocaleString('vi-VN')}đ. Còn lại bao nhiêu?`,
                    ...(level < 3 ? { options } : {})
                },
                answer: level >= 3 ? remain.toString() : ans,
                explanation: `${a.toLocaleString('vi-VN')} - ${spent1.toLocaleString('vi-VN')} - ${spent2.toLocaleString('vi-VN')} = ${remain.toLocaleString('vi-VN')}đ`
            };
        });
    });

    return questions;
}

const db = generateFinanceQuestions();
let out = `import { Question } from '../types';

export const financeStaticQuestions: Record<string, Record<number, Question[]>> = ${JSON.stringify(db, null, 4)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'content', 'static', 'finance.ts'), out);

// Print summary
const skillIds = Object.keys(db);
let totalQ = 0;
skillIds.forEach(sid => {
    Object.keys(db[sid]).forEach(lv => {
        totalQ += db[sid][lv].length;
    });
});
console.log('Finance static bank generated successfully!');
console.log(`Skills: ${skillIds.length} | Total questions: ${totalQ}`);
console.log(`Skill IDs: ${skillIds.join(', ')}`);
