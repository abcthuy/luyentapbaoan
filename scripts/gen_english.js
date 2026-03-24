const fs = require('fs');
const path = require('path');

function generateEnglishQuestions() {
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

    function pick(arr, exclude) {
        const filtered = arr.filter(x => x !== exclude);
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    function pickN(arr, n, exclude) {
        const filtered = arr.filter(x => x !== exclude);
        const result = [];
        const copy = [...filtered];
        for (let i = 0; i < Math.min(n, copy.length); i++) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }
        return result;
    }

    // ============================================================
    // VOCABULARY SKILLS
    // ============================================================

    // eng-colors: Colors (Màu sắc) - Grade 2, Sem 1
    const colors = [
        { en: 'Red', vi: 'Màu đỏ' },
        { en: 'Blue', vi: 'Màu xanh dương' },
        { en: 'Green', vi: 'Màu xanh lá' },
        { en: 'Yellow', vi: 'Màu vàng' },
        { en: 'Orange', vi: 'Màu cam' },
        { en: 'Purple', vi: 'Màu tím' },
        { en: 'Pink', vi: 'Màu hồng' },
        { en: 'White', vi: 'Màu trắng' },
        { en: 'Black', vi: 'Màu đen' },
        { en: 'Brown', vi: 'Màu nâu' }
    ];

    generateMCQ('stat-eng-col', 'eng-colors', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = colors[i % colors.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(colors.map(c => c.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(colors.map(c => c.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct color!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-animals: Animals (Động vật) - Grade 2, Sem 2
    const animals = [
        { en: 'Cat', vi: 'Con mèo' },
        { en: 'Dog', vi: 'Con chó' },
        { en: 'Elephant', vi: 'Con voi' },
        { en: 'Monkey', vi: 'Con khỉ' },
        { en: 'Tiger', vi: 'Con hổ' },
        { en: 'Lion', vi: 'Con sư tử' },
        { en: 'Bird', vi: 'Con chim' },
        { en: 'Fish', vi: 'Con cá' },
        { en: 'Rabbit', vi: 'Con thỏ' },
        { en: 'Duck', vi: 'Con vịt' }
    ];

    generateMCQ('stat-eng-ani', 'eng-animals', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = animals[i % animals.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(animals.map(a => a.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(animals.map(a => a.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-family: Family (Gia đình) - Grade 2, Sem 1
    const family = [
        { en: 'Mother', vi: 'Mẹ' },
        { en: 'Father', vi: 'Bố' },
        { en: 'Brother', vi: 'Anh/Em trai' },
        { en: 'Sister', vi: 'Chị/Em gái' },
        { en: 'Grandmother', vi: 'Bà' },
        { en: 'Grandfather', vi: 'Ông' },
        { en: 'Baby', vi: 'Em bé' },
        { en: 'Uncle', vi: 'Chú/Bác' },
        { en: 'Aunt', vi: 'Cô/Dì' },
        { en: 'Family', vi: 'Gia đình' }
    ];

    generateMCQ('stat-eng-fam', 'eng-family', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = family[i % family.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(family.map(f => f.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(family.map(f => f.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-school: School (Trường học) - Grade 2, Sem 1
    const school = [
        { en: 'School', vi: 'Trường học' },
        { en: 'Teacher', vi: 'Giáo viên' },
        { en: 'Student', vi: 'Học sinh' },
        { en: 'Book', vi: 'Quyển sách' },
        { en: 'Pen', vi: 'Cây bút' },
        { en: 'Pencil', vi: 'Bút chì' },
        { en: 'Ruler', vi: 'Cây thước' },
        { en: 'Eraser', vi: 'Cục tẩy' },
        { en: 'Bag', vi: 'Cái cặp' },
        { en: 'Desk', vi: 'Bàn học' }
    ];

    generateMCQ('stat-eng-sch', 'eng-school', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = school[i % school.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(school.map(s => s.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(school.map(s => s.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-clothes: Clothes (Quần áo) - Grade 3, Sem 1
    const clothes = [
        { en: 'Shirt', vi: 'Áo sơ mi' },
        { en: 'T-shirt', vi: 'Áo phông' },
        { en: 'Pants', vi: 'Quần dài' },
        { en: 'Shorts', vi: 'Quần đùi' },
        { en: 'Dress', vi: 'Váy đầm' },
        { en: 'Skirt', vi: 'Chân váy' },
        { en: 'Hat', vi: 'Cái mũ' },
        { en: 'Shoes', vi: 'Giày' },
        { en: 'Socks', vi: 'Tất/Vớ' },
        { en: 'Jacket', vi: 'Áo khoác' }
    ];

    generateMCQ('stat-eng-clo', 'eng-clothes', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = clothes[i % clothes.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(clothes.map(c => c.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(clothes.map(c => c.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-food: Food & Drink (Đồ ăn) - Grade 3, Sem 2
    const food = [
        { en: 'Rice', vi: 'Cơm' },
        { en: 'Bread', vi: 'Bánh mì' },
        { en: 'Chicken', vi: 'Thịt gà' },
        { en: 'Milk', vi: 'Sữa' },
        { en: 'Water', vi: 'Nước' },
        { en: 'Juice', vi: 'Nước ép' },
        { en: 'Apple', vi: 'Quả táo' },
        { en: 'Banana', vi: 'Quả chuối' },
        { en: 'Cake', vi: 'Bánh ngọt' },
        { en: 'Egg', vi: 'Quả trứng' }
    ];

    generateMCQ('stat-eng-food', 'eng-food', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = food[i % food.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(food.map(f => f.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(food.map(f => f.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-routine: Daily Routine (Hàng ngày) - Grade 3, Sem 2
    const routines = [
        { en: 'Wake up', vi: 'Thức dậy' },
        { en: 'Brush teeth', vi: 'Đánh răng' },
        { en: 'Have breakfast', vi: 'Ăn sáng' },
        { en: 'Go to school', vi: 'Đi học' },
        { en: 'Study', vi: 'Học bài' },
        { en: 'Have lunch', vi: 'Ăn trưa' },
        { en: 'Play', vi: 'Chơi' },
        { en: 'Have dinner', vi: 'Ăn tối' },
        { en: 'Take a bath', vi: 'Tắm' },
        { en: 'Go to bed', vi: 'Đi ngủ' }
    ];

    generateMCQ('stat-eng-rout', 'eng-routine', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = routines[i % routines.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(routines.map(r => r.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(routines.map(r => r.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // eng-house: My House (Nhà cửa) - Grade 3, Sem 2
    const houseItems = [
        { en: 'Bed', vi: 'Cái giường' },
        { en: 'Chair', vi: 'Cái ghế' },
        { en: 'Table', vi: 'Cái bàn' },
        { en: 'Sofa', vi: 'Ghế sô-pha' },
        { en: 'TV', vi: 'Ti-vi' },
        { en: 'Lamp', vi: 'Cái đèn' },
        { en: 'Door', vi: 'Cửa ra vào' },
        { en: 'Window', vi: 'Cửa sổ' },
        { en: 'Kitchen', vi: 'Nhà bếp' },
        { en: 'Bathroom', vi: 'Phòng tắm' }
    ];

    generateMCQ('stat-eng-house', 'eng-house', 1, 60, (id, skillId, level, i) => {
        const isEngToVi = Math.random() > 0.5;
        const target = houseItems[i % houseItems.length];
        let text, ans, options;
        if (isEngToVi) {
            text = `What is "${target.en}" in Vietnamese?`;
            ans = target.vi;
            const wrongs = pickN(houseItems.map(h => h.vi), 3, ans);
            options = shuffle([ans, ...wrongs]);
        } else {
            text = `How do you say "${target.vi}" in English?`;
            ans = target.en;
            const wrongs = pickN(houseItems.map(h => h.en), 3, ans);
            options = shuffle([ans, ...wrongs]);
        }
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct word!',
            content: { text, options },
            answer: ans, explanation: `"${target.en}" means "${target.vi}".`
        };
    });

    // ============================================================
    // PHONICS SKILLS
    // ============================================================

    // eng-phonics-a: Letter A
    const letterA = [
        { word: 'Apple', sound: '/æ/', hint: 'Quả táo bắt đầu bằng chữ A' },
        { word: 'Ant', sound: '/æ/', hint: 'Con kiến bắt đầu bằng chữ A' },
        { word: 'Arm', sound: '/ɑː/', hint: 'Cánh tay bắt đầu bằng chữ A' },
        { word: 'Animal', sound: '/æ/', hint: 'Động vật bắt đầu bằng chữ A' },
        { word: 'Art', sound: '/ɑː/', hint: 'Nghệ thuật bắt đầu bằng chữ A' }
    ];

    generateMCQ('stat-eng-pa', 'eng-phonics-a', 1, 40, (id, skillId, level, i) => {
        const types = ['starts', 'identify', 'pick'];
        const type = types[i % types.length];
        if (type === 'starts') {
            const target = letterA[i % letterA.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Which word starts with the letter A?',
                content: { text: `Which word starts with the letter "A"?`, options: shuffle([target.word, 'Ball', 'Cat', 'Dog']) },
                answer: target.word, explanation: `"${target.word}" starts with the letter A.`
            };
        } else if (type === 'identify') {
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Find the letter!',
                content: { text: `What is the first letter of "Apple"?`, options: shuffle(['A', 'B', 'C', 'D']) },
                answer: 'A', explanation: `"Apple" starts with the letter A.`
            };
        } else {
            const notA = ['Ball', 'Cat', 'Dog', 'Egg', 'Fish'];
            const target = letterA[i % letterA.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Pick the word with letter A!',
                content: { text: `Which of these words has the letter "A"?`, options: shuffle([target.word, notA[i % notA.length], notA[(i + 1) % notA.length], notA[(i + 2) % notA.length]]) },
                answer: target.word, explanation: `"${target.word}" contains the letter A.`
            };
        }
    });

    // eng-phonics-b: Letter B
    const letterB = [
        { word: 'Ball', hint: 'Quả bóng' },
        { word: 'Banana', hint: 'Quả chuối' },
        { word: 'Bear', hint: 'Con gấu' },
        { word: 'Book', hint: 'Quyển sách' },
        { word: 'Bird', hint: 'Con chim' }
    ];

    generateMCQ('stat-eng-pb', 'eng-phonics-b', 1, 40, (id, skillId, level, i) => {
        const types = ['starts', 'identify', 'pick'];
        const type = types[i % types.length];
        if (type === 'starts') {
            const target = letterB[i % letterB.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Which word starts with the letter B?',
                content: { text: `Which word starts with the letter "B"?`, options: shuffle([target.word, 'Apple', 'Cat', 'Dog']) },
                answer: target.word, explanation: `"${target.word}" starts with the letter B.`
            };
        } else if (type === 'identify') {
            const target = letterB[i % letterB.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Find the letter!',
                content: { text: `What is the first letter of "${target.word}"?`, options: shuffle(['A', 'B', 'C', 'D']) },
                answer: 'B', explanation: `"${target.word}" starts with the letter B.`
            };
        } else {
            const notB = ['Apple', 'Cat', 'Dog', 'Egg', 'Fish'];
            const target = letterB[i % letterB.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Pick the word with letter B!',
                content: { text: `Which of these words starts with "B"?`, options: shuffle([target.word, notB[i % notB.length], notB[(i + 1) % notB.length], notB[(i + 2) % notB.length]]) },
                answer: target.word, explanation: `"${target.word}" starts with the letter B.`
            };
        }
    });

    // eng-phonics-c: Letter C
    const letterC = [
        { word: 'Cat', hint: 'Con mèo' },
        { word: 'Car', hint: 'Ô tô' },
        { word: 'Cake', hint: 'Bánh ngọt' },
        { word: 'Cup', hint: 'Cái cốc' },
        { word: 'Cow', hint: 'Con bò' }
    ];

    generateMCQ('stat-eng-pc', 'eng-phonics-c', 1, 40, (id, skillId, level, i) => {
        const types = ['starts', 'identify', 'pick'];
        const type = types[i % types.length];
        if (type === 'starts') {
            const target = letterC[i % letterC.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Which word starts with the letter C?',
                content: { text: `Which word starts with the letter "C"?`, options: shuffle([target.word, 'Apple', 'Ball', 'Dog']) },
                answer: target.word, explanation: `"${target.word}" starts with the letter C.`
            };
        } else if (type === 'identify') {
            const target = letterC[i % letterC.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Find the letter!',
                content: { text: `What is the first letter of "${target.word}"?`, options: shuffle(['A', 'B', 'C', 'D']) },
                answer: 'C', explanation: `"${target.word}" starts with the letter C.`
            };
        } else {
            const notC = ['Apple', 'Ball', 'Dog', 'Egg', 'Fish'];
            const target = letterC[i % letterC.length];
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Pick the word with letter C!',
                content: { text: `Which of these words starts with "C"?`, options: shuffle([target.word, notC[i % notC.length], notC[(i + 1) % notC.length], notC[(i + 2) % notC.length]]) },
                answer: target.word, explanation: `"${target.word}" starts with the letter C.`
            };
        }
    });

    // eng-vowels: Short Vowels (aeiou) - Grade 3, Sem 1
    const vowelWords = [
        { word: 'Cat', vowel: 'a', sound: '/æ/' },
        { word: 'Bed', vowel: 'e', sound: '/ɛ/' },
        { word: 'Pig', vowel: 'i', sound: '/ɪ/' },
        { word: 'Dog', vowel: 'o', sound: '/ɒ/' },
        { word: 'Cup', vowel: 'u', sound: '/ʌ/' },
        { word: 'Hat', vowel: 'a', sound: '/æ/' },
        { word: 'Hen', vowel: 'e', sound: '/ɛ/' },
        { word: 'Fish', vowel: 'i', sound: '/ɪ/' },
        { word: 'Fox', vowel: 'o', sound: '/ɒ/' },
        { word: 'Bus', vowel: 'u', sound: '/ʌ/' }
    ];

    generateMCQ('stat-eng-vow', 'eng-vowels', 1, 50, (id, skillId, level, i) => {
        const target = vowelWords[i % vowelWords.length];
        const types = ['find', 'match'];
        const type = types[i % types.length];
        if (type === 'find') {
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Find the vowel sound!',
                content: { text: `What is the vowel sound in "${target.word}"?`, options: shuffle(['a', 'e', 'i', 'o', 'u']) },
                answer: target.vowel, explanation: `The vowel in "${target.word}" is "${target.vowel}" (${target.sound}).`
            };
        } else {
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Which word has this vowel?',
                content: { text: `Which word has the short "${target.vowel}" sound?`, options: shuffle([target.word, vowelWords[(i + 2) % vowelWords.length].word, vowelWords[(i + 4) % vowelWords.length].word, vowelWords[(i + 6) % vowelWords.length].word]) },
                answer: target.word, explanation: `"${target.word}" has the short "${target.vowel}" sound.`
            };
        }
    });

    // eng-blends: Consonant Blends (bl, cr...) - Grade 3, Sem 2
    const blends = [
        { blend: 'bl', word: 'Blue', others: ['Red', 'Green', 'Pink'] },
        { blend: 'br', word: 'Bread', others: ['Cake', 'Milk', 'Rice'] },
        { blend: 'cl', word: 'Clock', others: ['Door', 'Chair', 'Table'] },
        { blend: 'cr', word: 'Crab', others: ['Fish', 'Dog', 'Cat'] },
        { blend: 'fl', word: 'Flower', others: ['Tree', 'Grass', 'Rock'] },
        { blend: 'fr', word: 'Frog', others: ['Bird', 'Bear', 'Lion'] },
        { blend: 'gl', word: 'Glass', others: ['Cup', 'Plate', 'Bowl'] },
        { blend: 'gr', word: 'Grape', others: ['Apple', 'Banana', 'Orange'] },
        { blend: 'sl', word: 'Sleep', others: ['Wake', 'Walk', 'Jump'] },
        { blend: 'st', word: 'Star', others: ['Moon', 'Sun', 'Cloud'] }
    ];

    generateMCQ('stat-eng-blend', 'eng-blends', 1, 40, (id, skillId, level, i) => {
        const target = blends[i % blends.length];
        const types = ['identify', 'match'];
        const type = types[i % types.length];
        if (type === 'identify') {
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Find the consonant blend!',
                content: { text: `What consonant blend does "${target.word}" start with?`, options: shuffle([target.blend, blends[(i + 1) % blends.length].blend, blends[(i + 3) % blends.length].blend, blends[(i + 5) % blends.length].blend]) },
                answer: target.blend, explanation: `"${target.word}" starts with the blend "${target.blend}".`
            };
        } else {
            return {
                id, subjectId: 'english', skillId, type: 'mcq',
                instruction: 'Which word starts with this blend?',
                content: { text: `Which word starts with "${target.blend}"?`, options: shuffle([target.word, ...target.others.slice(0, 3)]) },
                answer: target.word, explanation: `"${target.word}" starts with the blend "${target.blend}".`
            };
        }
    });

    // ============================================================
    // GRAMMAR / SENTENCE SKILLS
    // ============================================================

    // eng-hello: Greetings (Chào hỏi) - Grade 2, Sem 1
    const greetings = [
        { q: 'When you meet someone in the morning, you say:', a: 'Good morning!', o: ['Good night!', 'Good morning!', 'Goodbye!', 'Good evening!'] },
        { q: 'When you leave, you say:', a: 'Goodbye!', o: ['Hello!', 'Good morning!', 'Goodbye!', 'Thank you!'] },
        { q: 'When you meet a friend, you say:', a: 'Hello!', o: ['Goodbye!', 'Good night!', 'Sorry!', 'Hello!'] },
        { q: 'Before going to sleep, you say:', a: 'Good night!', o: ['Good morning!', 'Good afternoon!', 'Good night!', 'Hello!'] },
        { q: 'In the afternoon, you greet someone by saying:', a: 'Good afternoon!', o: ['Good morning!', 'Good afternoon!', 'Good evening!', 'Good night!'] },
        { q: 'When someone gives you a gift, you say:', a: 'Thank you!', o: ['Sorry!', 'Hello!', 'Goodbye!', 'Thank you!'] },
        { q: '"Xin chào!" in English is:', a: 'Hello!', o: ['Goodbye!', 'Sorry!', 'Hello!', 'Thank you!'] },
        { q: '"Tạm biệt!" in English is:', a: 'Goodbye!', o: ['Hello!', 'Goodbye!', 'Good morning!', 'Sorry!'] },
        { q: '"Cảm ơn!" in English is:', a: 'Thank you!', o: ['Sorry!', 'Please!', 'Thank you!', 'Hello!'] },
        { q: '"Xin lỗi!" in English is:', a: 'Sorry!', o: ['Thank you!', 'Please!', 'Hello!', 'Sorry!'] }
    ];

    generateMCQ('stat-eng-hello', 'eng-hello', 1, 50, (id, skillId, level, i) => {
        const g = greetings[i % greetings.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Choose the correct greeting!',
            content: { text: g.q, options: shuffle(g.o) },
            answer: g.a, explanation: `The correct answer is "${g.a}".`
        };
    });

    // eng-qa-name: What's your name? - Grade 2, Sem 1
    const qaName = [
        { q: 'Someone asks "What is your name?". You answer:', a: 'My name is...', o: ['I am fine.', 'My name is...', 'I am 8.', 'Goodbye!'] },
        { q: '"What is your name?" in Vietnamese means:', a: 'Bạn tên gì?', o: ['Bạn bao nhiêu tuổi?', 'Bạn tên gì?', 'Bạn ở đâu?', 'Bạn khỏe không?'] },
        { q: 'How do you ask someone their name in English?', a: "What is your name?", o: ["What is your name?", "How are you?", "How old are you?", "Where are you from?"] },
        { q: '"How are you?" means:', a: 'Bạn khỏe không?', o: ['Bạn tên gì?', 'Bạn bao nhiêu tuổi?', 'Bạn khỏe không?', 'Bạn ở đâu?'] },
        { q: 'You respond to "How are you?" with:', a: 'I am fine, thank you.', o: ['My name is Tom.', 'I am 8 years old.', 'I am fine, thank you.', 'Goodbye!'] },
        { q: '"How old are you?" means:', a: 'Bạn bao nhiêu tuổi?', o: ['Bạn tên gì?', 'Bạn bao nhiêu tuổi?', 'Bạn khỏe không?', 'Bạn thích gì?'] },
        { q: 'You reply "I am 8 years old." to the question:', a: 'How old are you?', o: ["What is your name?", "How are you?", "How old are you?", "Where do you live?"] },
        { q: '"My name is Linh." is the answer to:', a: "What is your name?", o: ["How old are you?", "What is your name?", "How are you?", "Where are you from?"] },
        { q: '"I am fine, thank you." is the answer to:', a: "How are you?", o: ["How are you?", "How old are you?", "What is your name?", "Where do you live?"] },
        { q: 'Choose the correct self-introduction:', a: "My name is An. I am 8.", o: ["My name is An. I am 8.", "I am fine.", "Goodbye, An!", "Thank you!"] }
    ];

    generateMCQ('stat-eng-qaname', 'eng-qa-name', 1, 50, (id, skillId, level, i) => {
        const item = qaName[i % qaName.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Choose the correct answer!',
            content: { text: item.q, options: shuffle(item.o) },
            answer: item.a, explanation: `The correct answer is "${item.a}".`
        };
    });

    // eng-qa-this-that: What's this/that? - Grade 2, Sem 2
    const thisThat = [
        { q: 'Point at a pen and ask: "What is ___?"', a: 'this', o: ['this', 'that', 'these', 'those'] },
        { q: 'Point at something far away: "What is ___?"', a: 'that', o: ['this', 'that', 'these', 'those'] },
        { q: '"This is a book." means:', a: 'Đây là một quyển sách.', o: ['Đây là một quyển sách.', 'Kia là cái bàn.', 'Đây là cây bút.', 'Kia là cái ghế.'] },
        { q: '"That is a cat." means:', a: 'Kia là một con mèo.', o: ['Đây là con chó.', 'Kia là một con mèo.', 'Đây là con cá.', 'Kia là con chim.'] },
        { q: '"What is this?" — It is a pencil. "This" dùng khi:', a: 'Đồ vật ở gần', o: ['Đồ vật ở gần', 'Đồ vật ở xa', 'Nhiều đồ vật', 'Không biết'] },
        { q: '"What is that?" — "That" dùng khi:', a: 'Đồ vật ở xa', o: ['Đồ vật ở gần', 'Đồ vật ở xa', 'Nhiều đồ vật', 'Hỏi giá'] },
        { q: '___ is an apple. (gần)', a: 'This', o: ['This', 'That', 'These', 'Those'] },
        { q: '___ is a bird. (xa)', a: 'That', o: ['This', 'That', 'These', 'Those'] },
        { q: 'Complete: "___ is my bag." (chỉ cặp sách ở gần)', a: 'This', o: ['This', 'That', 'It', 'They'] },
        { q: 'Complete: "___ is a star." (chỉ ngôi sao ở xa)', a: 'That', o: ['This', 'That', 'It', 'They'] }
    ];

    generateMCQ('stat-eng-tt', 'eng-qa-this-that', 1, 50, (id, skillId, level, i) => {
        const item = thisThat[i % thisThat.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'This or That?',
            content: { text: item.q, options: shuffle(item.o) },
            answer: item.a, explanation: `The correct answer is "${item.a}".`
        };
    });

    // eng-grammar-present: Present Simple (Hiện tại đơn) - Grade 3, Sem 1
    const presentSimple = [
        { s: 'She ___ (like) ice cream.', a: 'likes', o: ['like', 'likes', 'liking', 'liked'] },
        { s: 'He ___ (go) to school every day.', a: 'goes', o: ['go', 'goes', 'going', 'went'] },
        { s: 'They ___ (play) football on Sunday.', a: 'play', o: ['play', 'plays', 'playing', 'played'] },
        { s: 'I ___ (have) a dog.', a: 'have', o: ['have', 'has', 'having', 'had'] },
        { s: 'She ___ (eat) rice every day.', a: 'eats', o: ['eat', 'eats', 'eating', 'ate'] },
        { s: 'We ___ (study) English at school.', a: 'study', o: ['study', 'studies', 'studying', 'studied'] },
        { s: 'He ___ (read) books every night.', a: 'reads', o: ['read', 'reads', 'reading', 'readed'] },
        { s: 'My cat ___ (sleep) all day.', a: 'sleeps', o: ['sleep', 'sleeps', 'sleeping', 'slept'] },
        { s: 'She ___ (watch) TV after dinner.', a: 'watches', o: ['watch', 'watches', 'watching', 'watched'] },
        { s: 'I ___ (drink) milk every morning.', a: 'drink', o: ['drink', 'drinks', 'drinking', 'drank'] }
    ];

    generateMCQ('stat-eng-pres', 'eng-grammar-present', 1, 50, (id, skillId, level, i) => {
        const item = presentSimple[i % presentSimple.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Choose the correct form!',
            content: { text: item.s, options: shuffle(item.o) },
            answer: item.a, explanation: `With he/she/it, add -s/-es. With I/you/we/they, keep the base form.`
        };
    });

    // eng-grammar-continuous: Acting Now (Hiện tại tiếp diễn) - Grade 3, Sem 2
    const continuousSentences = [
        { s: 'I am ___ (read) a book.', ans: 'reading', o: ['read', 'reads', 'reading', 'to read'] },
        { s: 'She is ___ (play) piano.', ans: 'playing', o: ['play', 'plays', 'playing', 'played'] },
        { s: 'They are ___ (run) in the park.', ans: 'running', o: ['run', 'runs', 'running', 'ran'] },
        { s: 'He is ___ (eat) an apple.', ans: 'eating', o: ['eat', 'eats', 'eating', 'ate'] },
        { s: 'We are ___ (swim) in the pool.', ans: 'swimming', o: ['swim', 'swims', 'swimming', 'swam'] },
        { s: 'She is ___ (cook) dinner.', ans: 'cooking', o: ['cook', 'cooks', 'cooking', 'cooked'] },
        { s: 'They are ___ (sing) a song.', ans: 'singing', o: ['sing', 'sings', 'singing', 'sang'] },
        { s: 'He is ___ (draw) a picture.', ans: 'drawing', o: ['draw', 'draws', 'drawing', 'drew'] }
    ];

    generateMCQ('stat-eng-cont', 'eng-grammar-continuous', 1, 50, (id, skillId, level, i) => {
        const item = continuousSentences[i % continuousSentences.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Choose the correct verb (-ing)!',
            content: { text: item.s, options: shuffle(item.o) },
            answer: item.ans, explanation: `When acting NOW (is/am/are), we add "-ing" to the verb.`
        };
    });

    // eng-prepositions: In/On/Under (Grade 3, Sem 2)
    const prepSentences = [
        { s: 'The apple is ___ the table. (Trên bàn)', ans: 'on', o: ['in', 'on', 'under', 'at'] },
        { s: 'The cat is ___ the box. (Trong hộp)', ans: 'in', o: ['in', 'on', 'under', 'next to'] },
        { s: 'The ball is ___ the chair. (Dưới ghế)', ans: 'under', o: ['in', 'on', 'under', 'behind'] },
        { s: 'The book is ___ the shelf. (Trên kệ)', ans: 'on', o: ['in', 'on', 'under', 'behind'] },
        { s: 'The fish is ___ the water. (Trong nước)', ans: 'in', o: ['in', 'on', 'under', 'at'] },
        { s: 'The dog is ___ the table. (Dưới bàn)', ans: 'under', o: ['in', 'on', 'under', 'next to'] },
        { s: 'The pen is ___ the desk. (Trên bàn)', ans: 'on', o: ['in', 'on', 'under', 'behind'] },
        { s: 'The bird is ___ the cage. (Trong lồng)', ans: 'in', o: ['in', 'on', 'under', 'at'] }
    ];

    generateMCQ('stat-eng-prep', 'eng-prepositions', 1, 50, (id, skillId, level, i) => {
        const item = prepSentences[i % prepSentences.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Where is it?',
            content: { text: item.s, options: shuffle(item.o) },
            answer: item.ans, explanation: `on = trên, in = trong, under = dưới.`
        };
    });

    // ============================================================
    // 4 SKILLS
    // ============================================================

    // eng2-read: Reading: Short Sentences - Grade 2
    const readingSentences = [
        { text: 'I have a cat. It is white. It likes milk.', q: 'What color is the cat?', a: 'White', o: ['Black', 'White', 'Brown', 'Yellow'] },
        { text: 'Tom has a ball. The ball is red. He plays in the park.', q: 'Where does Tom play?', a: 'In the park', o: ['At school', 'At home', 'In the park', 'In the pool'] },
        { text: 'My name is Linh. I am 7 years old. I go to school.', q: 'How old is Linh?', a: '7 years old', o: ['6 years old', '7 years old', '8 years old', '9 years old'] },
        { text: 'This is my bag. It is blue. It has books and a pencil.', q: 'What is in the bag?', a: 'Books and a pencil', o: ['Toys', 'Books and a pencil', 'Food', 'Clothes'] },
        { text: 'I like apples. They are sweet and red.', q: 'What do apples taste like?', a: 'Sweet', o: ['Sour', 'Sweet', 'Salty', 'Bitter'] },
        { text: 'My mother is a teacher. She teaches English.', q: 'What does mother teach?', a: 'English', o: ['Math', 'English', 'Music', 'Art'] },
        { text: 'There are five birds on the tree.', q: 'How many birds are there?', a: 'Five', o: ['Three', 'Four', 'Five', 'Six'] },
        { text: 'The sun is big and yellow. It is very hot.', q: 'What color is the sun?', a: 'Yellow', o: ['Red', 'Blue', 'Yellow', 'Green'] }
    ];

    generateMCQ('stat-eng2-read', 'eng2-read', 1, 50, (id, skillId, level, i) => {
        const item = readingSentences[i % readingSentences.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Read and answer!',
            content: { text: `Read: "${item.text}"\n\nQuestion: ${item.q}`, options: shuffle(item.o) },
            answer: item.a, explanation: `The answer is in the text.`
        };
    });

    // eng2-write: Writing: Simple Words - Grade 2
    const writeWords = [
        { q: 'Fill in: C_T (con mèo)', a: 'A', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: D_G (con chó)', a: 'O', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: B_RD (con chim)', a: 'I', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: F_SH (con cá)', a: 'I', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: S_N (mặt trời)', a: 'U', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: B__K (quyển sách)', a: 'OO', o: ['EE', 'OO', 'AA', 'II'] },
        { q: 'Fill in: H_T (cái mũ)', a: 'A', o: ['A', 'O', 'U', 'I'] },
        { q: 'Fill in: P_N (cây bút)', a: 'E', o: ['A', 'O', 'U', 'E'] },
        { q: 'Fill in: R_D (màu đỏ)', a: 'E', o: ['A', 'E', 'U', 'I'] },
        { q: 'Fill in: C_P (cái cốc)', a: 'U', o: ['A', 'O', 'U', 'I'] }
    ];

    generateMCQ('stat-eng2-write', 'eng2-write', 1, 50, (id, skillId, level, i) => {
        const item = writeWords[i % writeWords.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Fill in the missing letter!',
            content: { text: item.q, options: shuffle(item.o) },
            answer: item.a, explanation: `The correct letter is "${item.a}".`
        };
    });

    // eng3-read: Reading Comprehension - Grade 3
    const stories = [
        {
            t: "This is Tom. He is 9 years old. He likes playing football. He has a dog named Rex.",
            q: "What does Tom like doing?",
            a: "Playing football",
            o: ["Reading books", "Playing football", "Swimming", "Sleeping"]
        },
        {
            t: "Mary is in the classroom. She is reading a book. Her bag is on the desk.",
            q: "Where is Mary's bag?",
            a: "On the desk",
            o: ["In the desk", "On the desk", "Under the chair", "In her hand"]
        },
        {
            t: "My family has four people: my father, my mother, my sister and me. We live in a small house.",
            q: "How many people are in the family?",
            a: "Four",
            o: ["Three", "Four", "Five", "Six"]
        },
        {
            t: "It is a sunny day. The children are playing in the park. They are very happy.",
            q: "How is the weather?",
            a: "Sunny",
            o: ["Rainy", "Cloudy", "Sunny", "Windy"]
        },
        {
            t: "Lan has a cat. The cat is white. It likes to sleep on the sofa.",
            q: "Where does the cat like to sleep?",
            a: "On the sofa",
            o: ["On the bed", "On the sofa", "Under the table", "In the garden"]
        }
    ];

    generateMCQ('stat-eng-read3', 'eng3-read', 1, 40, (id, skillId, level, i) => {
        const story = stories[i % stories.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq', instruction: 'Read and answer!',
            content: { text: `Read the story:\n"${story.t}"\n\nQuestion: ${story.q}`, options: shuffle(story.o) },
            answer: story.a, explanation: `The answer is in the story.`
        };
    });

    // eng3-write: Writing: Paragraphs - Grade 3
    const writeParagraph = [
        { q: 'Choose the correct sentence:', a: 'I like dogs.', o: ['I like dogs.', 'I dogs like.', 'Dogs I like.', 'Like I dogs.'] },
        { q: 'Which is a correct sentence?', a: 'She is my friend.', o: ['She is my friend.', 'Is she my friend.', 'Friend my she is.', 'My she friend is.'] },
        { q: 'Put in order: "go / I / school / to"', a: 'I go to school.', o: ['I go to school.', 'Go I to school.', 'School I go to.', 'To school go I.'] },
        { q: 'Put in order: "is / cat / The / white"', a: 'The cat is white.', o: ['The cat is white.', 'Is the cat white.', 'Cat white the is.', 'White is cat the.'] },
        { q: 'Put in order: "likes / He / football"', a: 'He likes football.', o: ['He likes football.', 'Likes he football.', 'Football he likes.', 'Football likes he.'] },
        { q: 'Which sentence starts correctly?', a: 'My name is Lan.', o: ['my name is Lan.', 'My name is Lan.', 'my Name is lan.', 'MY NAME IS LAN.'] },
        { q: 'Put in order: "a / I / have / book"', a: 'I have a book.', o: ['I have a book.', 'Have I a book.', 'A book I have.', 'Book a have I.'] },
        { q: 'Put in order: "are / playing / They"', a: 'They are playing.', o: ['They are playing.', 'Are they playing.', 'Playing they are.', 'Playing are they.'] }
    ];

    generateMCQ('stat-eng3-write', 'eng3-write', 1, 50, (id, skillId, level, i) => {
        const item = writeParagraph[i % writeParagraph.length];
        return {
            id, subjectId: 'english', skillId, type: 'mcq',
            instruction: 'Writing practice!',
            content: { text: item.q, options: shuffle(item.o) },
            answer: item.a, explanation: `The correct sentence is "${item.a}".`
        };
    });

    // ============================================================
    // STORY QUEST 🎧📖 - Nghe hiểu qua câu chuyện thú vị
    // Thay thế Hùng Biện, gây hứng thú cho bé bằng các
    // câu chuyện phiêu lưu, bí ẩn, vui nhộn!
    // ============================================================

    // ========== LEVEL 1: Short & Easy (~20 words, 2 questions) ==========
    const storyQuestL1 = [
        {
            story: "I have a cat. My cat is white. It likes milk.",
            emoji: "🐱",
            questions: [
                { q: "What color is the cat?", a: "White", o: ["White", "Black", "Brown", "Gray"] },
                { q: "What does the cat like?", a: "Milk", o: ["Water", "Milk", "Juice", "Fish"] }
            ]
        },
        {
            story: "Tom has a red ball. He plays in the park. He is happy!",
            emoji: "⚽",
            questions: [
                { q: "What color is the ball?", a: "Red", o: ["Red", "Blue", "Green", "Yellow"] },
                { q: "Where does Tom play?", a: "In the park", o: ["At school", "In the park", "At home", "In the garden"] }
            ]
        },
        {
            story: "It is sunny today. I go to school. I see my friends.",
            emoji: "☀️",
            questions: [
                { q: "How is the weather?", a: "Sunny", o: ["Rainy", "Sunny", "Cloudy", "Windy"] },
                { q: "Where do I go?", a: "To school", o: ["To school", "To the park", "To the shop", "Home"] }
            ]
        },
        {
            story: "Mom makes a cake. The cake is big. It is very yummy!",
            emoji: "🎂",
            questions: [
                { q: "Who makes the cake?", a: "Mom", o: ["Dad", "Mom", "Sister", "Grandma"] },
                { q: "How is the cake?", a: "Big and yummy", o: ["Small", "Big and yummy", "Old", "Cold"] }
            ]
        },
        {
            story: "I have a dog. His name is Max. Max can run fast!",
            emoji: "🐕",
            questions: [
                { q: "What is the dog's name?", a: "Max", o: ["Rex", "Max", "Buddy", "Tom"] },
                { q: "What can Max do?", a: "Run fast", o: ["Fly", "Run fast", "Swim", "Sing"] }
            ]
        },
        {
            story: "I like apples. Apples are red. They are sweet!",
            emoji: "🍎",
            questions: [
                { q: "What do I like?", a: "Apples", o: ["Bananas", "Apples", "Oranges", "Grapes"] },
                { q: "What color are apples?", a: "Red", o: ["Red", "Green", "Blue", "Yellow"] }
            ]
        },
        {
            story: "The bird is in the tree. It sings a song. The song is beautiful.",
            emoji: "🐦",
            questions: [
                { q: "Where is the bird?", a: "In the tree", o: ["On the ground", "In the tree", "In the water", "On the house"] },
                { q: "What does the bird do?", a: "Sings a song", o: ["Flies away", "Sings a song", "Eats food", "Sleeps"] }
            ]
        },
        {
            story: "It is night time. The moon is bright. I go to bed.",
            emoji: "🌙",
            questions: [
                { q: "What time is it?", a: "Night time", o: ["Morning", "Night time", "Afternoon", "Noon"] },
                { q: "How is the moon?", a: "Bright", o: ["Dark", "Bright", "Small", "Red"] }
            ]
        }
    ];

    // ========== LEVEL 2: Medium (~35 words, 3 questions) ==========
    const storyQuestL2 = [
        {
            story: "Today is Sports Day at school! Ben runs in a race. He is very fast. His friend Amy jumps very high. At the end, everyone gets a medal. Ben wins first place!",
            emoji: "🏃",
            questions: [
                { q: "What day is it at school?", a: "Sports Day", o: ["Music Day", "Sports Day", "Art Day", "Reading Day"] },
                { q: "What does Amy do?", a: "Jumps very high", o: ["Runs fast", "Jumps very high", "Throws a ball", "Swims"] },
                { q: "What does everyone get?", a: "A medal", o: ["A toy", "A medal", "A cake", "A book"] }
            ]
        },
        {
            story: "Sara goes to the zoo with her family. She sees elephants, tigers, and monkeys. Her favorite animal is the penguin because it walks in a funny way. She eats ice cream.",
            emoji: "🐧",
            questions: [
                { q: "Where does Sara go?", a: "To the zoo", o: ["To school", "To the park", "To the zoo", "To the beach"] },
                { q: "What is her favorite animal?", a: "The penguin", o: ["The elephant", "The tiger", "The monkey", "The penguin"] },
                { q: "What does Sara eat?", a: "Ice cream", o: ["Cake", "Ice cream", "Candy", "Pizza"] }
            ]
        },
        {
            story: "It is raining outside. Tom cannot play in the garden. So he builds a big castle with toy blocks. He uses red, blue, and yellow blocks. His little sister helps him.",
            emoji: "🏰",
            questions: [
                { q: "Why can't Tom play outside?", a: "It is raining", o: ["It is dark", "It is raining", "He is sick", "He is tired"] },
                { q: "What does Tom build?", a: "A big castle", o: ["A car", "A robot", "A big castle", "A house"] },
                { q: "Who helps Tom?", a: "His little sister", o: ["His mother", "His friend", "His little sister", "His father"] }
            ]
        },
        {
            story: "In summer, An goes to the beach with his family. The water is blue and warm. He builds a sandcastle and finds seashells. His father cooks fish for lunch.",
            emoji: "🏖️",
            questions: [
                { q: "Where does An go in summer?", a: "To the beach", o: ["To the mountains", "To the beach", "To the city", "To school"] },
                { q: "What does An build?", a: "A sandcastle", o: ["A snowman", "A sandcastle", "A tent", "A tower"] },
                { q: "What does his father cook?", a: "Fish", o: ["Chicken", "Fish", "Rice", "Cake"] }
            ]
        },
        {
            story: "Miss Rose is the best teacher! Today, she teaches about animals. She shows pictures of lions, elephants, and dolphins. The students draw their favorite animals. Minh draws a blue whale.",
            emoji: "🏫",
            questions: [
                { q: "What does Miss Rose teach about?", a: "Animals", o: ["Numbers", "Colors", "Animals", "Food"] },
                { q: "What does she show?", a: "Pictures of animals", o: ["Videos", "Pictures of animals", "Toys", "Books"] },
                { q: "What does Minh draw?", a: "A blue whale", o: ["A lion", "An elephant", "A blue whale", "A dolphin"] }
            ]
        },
        {
            story: "Emma loves making sandwiches. First, she takes two pieces of bread. Then, she puts cheese and tomato on the bread. She adds lettuce. She cuts the sandwich in half. Yummy!",
            emoji: "🥪",
            questions: [
                { q: "What does Emma love making?", a: "Sandwiches", o: ["Cakes", "Sandwiches", "Soup", "Pizza"] },
                { q: "What does she put on the bread?", a: "Cheese and tomato", o: ["Cheese and tomato", "Butter", "Jam", "Egg"] },
                { q: "What does she do at the end?", a: "Cuts the sandwich in half", o: ["Eats it", "Cuts the sandwich in half", "Gives it away", "Puts it in a box"] }
            ]
        }
    ];

    // ========== LEVEL 3: Long & Complex (~50 words, 4 questions) ==========
    const storyQuestL3 = [
        {
            story: "Captain Jack is a brave pirate. He has a big ship and a parrot named Polly. Today, he finds a treasure map! The treasure is on a small island. He sails his ship for three days. Finally, he finds the treasure — it is a box of golden coins!",
            emoji: "🏴‍☠️",
            questions: [
                { q: "What is Captain Jack?", a: "A pirate", o: ["A teacher", "A pirate", "A doctor", "A farmer"] },
                { q: "What is the parrot's name?", a: "Polly", o: ["Jack", "Polly", "Rex", "Tom"] },
                { q: "How many days does he sail?", a: "Three days", o: ["One day", "Two days", "Three days", "Five days"] },
                { q: "What is in the treasure box?", a: "Golden coins", o: ["Diamonds", "Golden coins", "Silver rings", "Books"] }
            ]
        },
        {
            story: "Luna is a little astronaut. She flies to the Moon in a rocket! On the Moon, she sees big rocks and gray dust. She finds a sparkly crystal. 'Wow! This is beautiful!' she says. She brings it back to Earth to show her friends.",
            emoji: "🚀",
            questions: [
                { q: "Where does Luna fly to?", a: "The Moon", o: ["Mars", "The Moon", "The Sun", "Jupiter"] },
                { q: "What does she find?", a: "A sparkly crystal", o: ["A sparkly crystal", "A flower", "Water", "An alien"] },
                { q: "What color is the dust?", a: "Gray", o: ["Red", "Blue", "Gray", "White"] },
                { q: "What does Luna say?", a: "Wow! This is beautiful!", o: ["I am scared!", "Wow! This is beautiful!", "I want to go home!", "Help me!"] }
            ]
        },
        {
            story: "Detective Mia hears a noise in the kitchen at night. She takes her flashlight and goes downstairs. She sees muddy footprints on the floor! She follows them to the garden. There, she finds her puppy Max playing in the mud!",
            emoji: "🔍",
            questions: [
                { q: "Where does Mia hear a noise?", a: "In the kitchen", o: ["In the bedroom", "In the kitchen", "In the garden", "In the bathroom"] },
                { q: "What does she take?", a: "A flashlight", o: ["A phone", "A flashlight", "A book", "A ball"] },
                { q: "What does she find on the floor?", a: "Muddy footprints", o: ["Water", "Muddy footprints", "Food", "Toys"] },
                { q: "Who made the mess?", a: "Her puppy Max", o: ["A cat", "Her brother", "Her puppy Max", "A ghost"] }
            ]
        },
        {
            story: "In a magical forest, there lives a tiny fairy named Sparkle. She has silver wings and a golden wand. Every night, she flies around and sprinkles magic dust on the flowers. In the morning, the flowers bloom in beautiful colors — red, pink, purple, and gold!",
            emoji: "🧚",
            questions: [
                { q: "Where does Sparkle live?", a: "In a magical forest", o: ["In a castle", "In a magical forest", "On a mountain", "By the sea"] },
                { q: "What color are her wings?", a: "Silver", o: ["Gold", "Silver", "Blue", "White"] },
                { q: "What does she do every night?", a: "Sprinkles magic dust on flowers", o: ["Sleeps", "Sprinkles magic dust on flowers", "Reads books", "Sings songs"] },
                { q: "When do the flowers bloom?", a: "In the morning", o: ["At night", "In the afternoon", "In the morning", "At noon"] }
            ]
        },
        {
            story: "Tet is the most important holiday in Vietnam. People clean their houses, cook special food, and visit their families. Children wear new clothes and receive lucky money in red envelopes. Everyone says 'Chúc Mừng Năm Mới!' which means 'Happy New Year!'",
            emoji: "🧧",
            questions: [
                { q: "What is Tet?", a: "The most important holiday in Vietnam", o: ["A school day", "The most important holiday in Vietnam", "A sport event", "A birthday"] },
                { q: "What do children receive?", a: "Lucky money in red envelopes", o: ["Toys", "Lucky money in red envelopes", "Books", "Flowers"] },
                { q: "What does 'Chúc Mừng Năm Mới' mean?", a: "Happy New Year!", o: ["Good morning!", "Happy Birthday!", "Happy New Year!", "Goodbye!"] },
                { q: "What do people cook?", a: "Special food", o: ["Pizza", "Special food", "Ice cream", "Hamburgers"] }
            ]
        },
        {
            story: "A little robot named Beep Boop lives in a toy store. At night, when everyone goes home, he comes alive! He plays with the teddy bears, drives the toy cars, and reads the picture books. Before morning, he goes back to his shelf and pretends to sleep!",
            emoji: "🤖",
            questions: [
                { q: "Where does Beep Boop live?", a: "In a toy store", o: ["In a house", "In a school", "In a toy store", "In a factory"] },
                { q: "When does he come alive?", a: "At night", o: ["In the morning", "At noon", "At night", "In the afternoon"] },
                { q: "What does he play with?", a: "Teddy bears", o: ["Dolls", "Teddy bears", "Blocks", "Robots"] },
                { q: "What does he do before morning?", a: "Goes back to his shelf", o: ["Runs away", "Goes back to his shelf", "Hides under a table", "Plays more"] }
            ]
        }
    ];

    // Generate story quests at 3 levels
    function generateStoryLevel(stories, level) {
        let idx = 0;
        stories.forEach((story) => {
            story.questions.forEach((sq, qi) => {
                const id = `stat-eng-sq-${level}-${idx}`;
                const qType = qi % 3;

                if (qType === 1 && sq.a.split(' ').length <= 3) {
                    addQuestions('eng-story-quest', level, [{
                        id, subjectId: 'english', skillId: 'eng-story-quest', type: 'input',
                        instruction: `${story.emoji} 🎧 Listen and fill in the blank!`,
                        content: { text: `📖 Story:\n"${story.story}"\n\n✏️ ${sq.q}\n(Type your answer)` },
                        answer: sq.a, explanation: `The correct answer is "${sq.a}" — found in the story!`,
                        hint: `Listen to the story again for clues! ${story.emoji}`
                    }]);
                } else if (qType === 2) {
                    const isTrue = Math.random() > 0.5;
                    const trueStatement = sq.q.replace('?', '') + ' → ' + sq.a;
                    const wrongAnswer = sq.o.find(x => x !== sq.a) || sq.o[0];
                    const falseStatement = sq.q.replace('?', '') + ' → ' + wrongAnswer;
                    addQuestions('eng-story-quest', level, [{
                        id, subjectId: 'english', skillId: 'eng-story-quest', type: 'mcq',
                        instruction: `${story.emoji} 🎧 Listen! True or False?`,
                        content: {
                            text: `📖 Story:\n"${story.story}"\n\n🤔 Is this TRUE or FALSE?\n"${isTrue ? trueStatement : falseStatement}"`,
                            options: ['✅ TRUE', '❌ FALSE']
                        },
                        answer: isTrue ? '✅ TRUE' : '❌ FALSE',
                        explanation: isTrue ? `TRUE! "${sq.a}" is correct.` : `FALSE! The correct answer is "${sq.a}".`,
                        hint: `Listen carefully! ${story.emoji}`
                    }]);
                } else {
                    addQuestions('eng-story-quest', level, [{
                        id, subjectId: 'english', skillId: 'eng-story-quest', type: 'mcq',
                        instruction: `${story.emoji} 🎧 Listen to the story and answer!`,
                        content: { text: `📖 Story:\n"${story.story}"\n\n❓ ${sq.q}`, options: shuffle(sq.o) },
                        answer: sq.a, explanation: `The answer is "${sq.a}" — found in the story!`,
                        hint: `Listen to the story again! ${story.emoji}`
                    }]);
                }
                idx++;
            });
        });
    }

    generateStoryLevel(storyQuestL1, 1);
    generateStoryLevel(storyQuestL2, 2);
    generateStoryLevel(storyQuestL3, 3);

    return questions;
}

const db = generateEnglishQuestions();
let out = `import { Question } from '../types';

export const englishStaticQuestions: Record<string, Record<number, Question[]>> = ${JSON.stringify(db, null, 4)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'content', 'static', 'english.ts'), out);

// Print summary
const skillIds = Object.keys(db);
let totalQ = 0;
skillIds.forEach(sid => {
    Object.keys(db[sid]).forEach(lv => {
        totalQ += db[sid][lv].length;
    });
});
console.log(`English static bank generated successfully!`);
console.log(`Skills: ${skillIds.length} | Total questions: ${totalQ}`);
console.log(`Skill IDs: ${skillIds.join(', ')}`);
