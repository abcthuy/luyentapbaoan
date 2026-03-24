
import { Question } from '../types';

// Helper for random selection
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- DATA SOURCE ---

// === ĐỌC HIỂU (Expanded — 8 passages, level-tiered) ===
const READING_PASSAGES_L1 = [
    {
        text: "Mẹ ốm, bé chẳng đi đâu.\nViên bi người rủ, khế chua người mời.\nMẹ cười: 'Con ở nhà chơi'\nNhưng con vẫn thấy mẹ cười kém tươi.",
        questions: [
            { q: "Khi mẹ ốm, bé đã làm gì?", options: ["Ở nhà với mẹ", "Đi chơi bi", "Đi ăn khế chua"], a: "Ở nhà với mẹ" },
            { q: "Mẹ bảo bé đi đâu?", options: ["Đi chơi", "Đi học", "Đi ngủ"], a: "Đi chơi" },
            { q: "Bài thơ nói về tình cảm của ai?", options: ["Bé thương mẹ", "Mẹ thương bé", "Cả hai đều đúng"], a: "Cả hai đều đúng" }
        ]
    },
    {
        text: "Sáng sớm, biển thật là đẹp. Những con sóng trắng xóa xô vào bãi cát vàng. Ông mặt trời đỏ rực từ từ nhô lên khỏi mặt biển.",
        questions: [
            { q: "Bài văn tả cảnh gì?", options: ["Cảnh biển buổi sáng", "Cảnh núi rừng", "Cảnh thành phố"], a: "Cảnh biển buổi sáng" },
            { q: "Sóng biển có màu gì?", options: ["Trắng xóa", "Xanh biếc", "Đỏ rực"], a: "Trắng xóa" },
            { q: "Ông mặt trời được miêu tả như thế nào?", options: ["Đỏ rực", "Vàng óng", "Trắng tinh"], a: "Đỏ rực" }
        ]
    },
    {
        text: "Bé Lan rất thích đi học. Mỗi sáng, bé dậy sớm, đánh răng rửa mặt rồi ăn sáng. Mẹ đưa bé đến trường. Ở trường, bé được học nhiều điều mới.",
        questions: [
            { q: "Bé Lan thích làm gì?", options: ["Đi học", "Đi chơi", "Ngủ nướng"], a: "Đi học" },
            { q: "Ai đưa bé đến trường?", options: ["Mẹ", "Bố", "Ông"], a: "Mẹ" },
            { q: "Mỗi sáng bé làm gì đầu tiên?", options: ["Dậy sớm", "Ăn sáng", "Đi học"], a: "Dậy sớm" }
        ]
    },
    {
        text: "Nhà bà ngoại có một con mèo. Mèo có bộ lông trắng muốt. Mèo thích nằm sưởi nắng trước hiên nhà. Bé rất thích ôm mèo ngủ.",
        questions: [
            { q: "Con mèo có bộ lông màu gì?", options: ["Trắng muốt", "Đen tuyền", "Vàng mượt"], a: "Trắng muốt" },
            { q: "Mèo thích làm gì?", options: ["Nằm sưởi nắng", "Bắt chuột", "Nhảy múa"], a: "Nằm sưởi nắng" },
            { q: "Mèo ở đâu?", options: ["Nhà bà ngoại", "Nhà hàng xóm", "Cửa hàng"], a: "Nhà bà ngoại" }
        ]
    }
];

const READING_PASSAGES_L2 = [
    {
        text: "Mùa thu, trời trong xanh. Từng đàn chim bay về phương nam. Lá vàng rơi nhẹ nhàng trên con đường nhỏ. Buổi chiều, ánh nắng vàng chiếu qua khe lá, đẹp như tranh vẽ.",
        questions: [
            { q: "Mùa thu trời như thế nào?", options: ["Trong xanh", "Mây đen", "Nóng bức"], a: "Trong xanh" },
            { q: "Chim bay về đâu?", options: ["Phương nam", "Phương bắc", "Phương đông"], a: "Phương nam" },
            { q: "Tác giả so sánh cảnh đẹp với gì?", options: ["Tranh vẽ", "Giấc mơ", "Câu chuyện"], a: "Tranh vẽ" },
            { q: "Lá có màu gì?", options: ["Vàng", "Xanh", "Đỏ"], a: "Vàng" }
        ]
    },
    {
        text: "Bác nông dân cần cù làm việc trên cánh đồng. Từ sáng sớm, bác đã ra đồng cấy lúa. Trời nắng nóng nhưng bác vẫn kiên trì. Nhờ sự chăm chỉ, mùa gặt lúa chín vàng cả cánh đồng.",
        questions: [
            { q: "Bác nông dân làm gì trên đồng?", options: ["Cấy lúa", "Hái quả", "Chăn trâu"], a: "Cấy lúa" },
            { q: "Tính cách của bác nông dân là gì?", options: ["Cần cù, kiên trì", "Lười biếng", "Vội vàng"], a: "Cần cù, kiên trì" },
            { q: "Kết quả công việc là gì?", options: ["Lúa chín vàng", "Lúa bị hỏng", "Không có gì"], a: "Lúa chín vàng" },
            { q: "Bác ra đồng lúc nào?", options: ["Sáng sớm", "Buổi trưa", "Buổi tối"], a: "Sáng sớm" }
        ]
    }
];

const READING_PASSAGES_L3 = [
    {
        text: "Ngày xưa, có một chàng tiều phu nghèo nhưng thật thà. Một hôm, chàng lỡ đánh rơi chiếc rìu xuống sông. Ông Bụt hiện lên và hỏi: 'Có phải rìu vàng này của con không?' Chàng đáp: 'Không, rìu của con bằng sắt thôi.' Ông Bụt khen chàng thật thà và tặng cả ba chiếc rìu.",
        questions: [
            { q: "Chàng tiều phu có tính cách gì?", options: ["Thật thà", "Gian dối", "Kiêu ngạo"], a: "Thật thà" },
            { q: "Chàng đánh rơi gì xuống sông?", options: ["Chiếc rìu", "Con dao", "Chiếc búa"], a: "Chiếc rìu" },
            { q: "Ông Bụt tặng chàng bao nhiêu rìu?", options: ["Ba chiếc", "Một chiếc", "Hai chiếc"], a: "Ba chiếc" },
            { q: "Bài học từ câu chuyện là gì?", options: ["Phải thật thà", "Phải giàu có", "Phải nhanh nhẹn"], a: "Phải thật thà" }
        ]
    },
    {
        text: "Việt Nam có nhiều lễ hội truyền thống. Tết Nguyên Đán là lễ hội lớn nhất trong năm. Mọi người dọn dẹp nhà cửa, nấu bánh chưng, trang trí hoa mai hoa đào. Trẻ em được mặc quần áo mới và nhận lì xì từ người lớn. Tết là dịp để gia đình sum họp.",
        questions: [
            { q: "Lễ hội lớn nhất trong năm là gì?", options: ["Tết Nguyên Đán", "Trung thu", "Giáng sinh"], a: "Tết Nguyên Đán" },
            { q: "Mọi người nấu gì ngày Tết?", options: ["Bánh chưng", "Bánh mì", "Phở"], a: "Bánh chưng" },
            { q: "Trẻ em nhận gì từ người lớn?", options: ["Lì xì", "Quà sinh nhật", "Kẹo"], a: "Lì xì" },
            { q: "Tết là dịp để làm gì?", options: ["Gia đình sum họp", "Đi du lịch xa", "Làm việc nhiều"], a: "Gia đình sum họp" }
        ]
    }
];

// === TỪ VỰNG (Expanded — 24 pairs, level-tiered) ===
const VOCAB_L1 = [
    { type: 'synonym', word: "siêng năng", options: ["chăm chỉ", "lười biếng", "thông minh"], a: "chăm chỉ" },
    { type: 'synonym', word: "xinh đẹp", options: ["tươi tắn", "xấu xí", "giỏi giang"], a: "tươi tắn" },
    { type: 'synonym', word: "bé nhỏ", options: ["nhỏ xíu", "to lớn", "cao cao"], a: "nhỏ xíu" },
    { type: 'synonym', word: "vui vẻ", options: ["hớn hở", "buồn bã", "tức giận"], a: "hớn hở" },
    { type: 'antonym', word: "nhanh", options: ["chậm", "vội", "mau"], a: "chậm" },
    { type: 'antonym', word: "đen", options: ["trắng", "tối", "sáng"], a: "trắng" },
    { type: 'antonym', word: "buồn", options: ["vui", "khóc", "sầu"], a: "vui" },
    { type: 'antonym', word: "to", options: ["nhỏ", "lớn", "cao"], a: "nhỏ" }
];

const VOCAB_L2 = [
    { type: 'synonym', word: "dũng cảm", options: ["gan dạ", "nhút nhát", "hiền lành"], a: "gan dạ" },
    { type: 'synonym', word: "thông minh", options: ["sáng dạ", "ngu dốt", "chậm chạp"], a: "sáng dạ" },
    { type: 'synonym', word: "yên lặng", options: ["im lìm", "ồn ào", "vang vọng"], a: "im lìm" },
    { type: 'synonym', word: "giúp đỡ", options: ["hỗ trợ", "phá phách", "lơ là"], a: "hỗ trợ" },
    { type: 'antonym', word: "giàu", options: ["nghèo", "sang", "đẹp"], a: "nghèo" },
    { type: 'antonym', word: "đúng", options: ["sai", "phải", "hay"], a: "sai" },
    { type: 'antonym', word: "khỏe", options: ["yếu", "mạnh", "nhanh"], a: "yếu" },
    { type: 'antonym', word: "nóng", options: ["lạnh", "ấm", "mát"], a: "lạnh" }
];

const VOCAB_L3 = [
    { type: 'synonym', word: "kiên trì", options: ["bền bỉ", "bỏ cuộc", "vội vàng"], a: "bền bỉ" },
    { type: 'synonym', word: "hào phóng", options: ["rộng rãi", "keo kiệt", "nghiêm túc"], a: "rộng rãi" },
    { type: 'synonym', word: "uy nghi", options: ["oai phong", "nhỏ bé", "hiền hòa"], a: "oai phong" },
    { type: 'synonym', word: "tinh khiết", options: ["trong sạch", "bẩn thỉu", "xám xịt"], a: "trong sạch" },
    { type: 'antonym', word: "cẩn thận", options: ["bất cẩn", "tỉ mỉ", "cần mẫn"], a: "bất cẩn" },
    { type: 'antonym', word: "khiêm tốn", options: ["kiêu ngạo", "giản dị", "lịch sự"], a: "kiêu ngạo" },
    { type: 'antonym', word: "tiết kiệm", options: ["lãng phí", "chắt chiu", "dành dụm"], a: "lãng phí" },
    { type: 'antonym', word: "đoàn kết", options: ["chia rẽ", "gắn bó", "hợp tác"], a: "chia rẽ" }
];

// === VIẾT / NGỮ PHÁP (Expanded — 15 prompts, level-tiered) ===
const WRITING_L1 = [
    { text: "Điền từ còn thiếu: 'Uống nước nhớ ...'", answer: "nguồn", type: "input" },
    { text: "Điền từ còn thiếu: 'Ăn quả nhớ kẻ ... cây'", answer: "trồng", type: "input" },
    { text: "Điền từ: 'Có công mài sắt, có ngày nên ...'", answer: "kim", type: "input" },
    { text: "Điền từ: 'Tốt gỗ hơn tốt ...'", answer: "nước sơn", type: "input" }
];

const WRITING_L2 = [
    { text: "Câu 'Bé đang học bài.' thuộc kiểu câu gì?", options: ["Câu nêu hoạt động", "Câu giới thiệu", "Câu nêu đặc điểm"], a: "Câu nêu hoạt động", type: "mcq" },
    { text: "Câu 'Mái tóc bà bạc phơ.' thuộc kiểu câu gì?", options: ["Câu nêu đặc điểm", "Câu nêu hoạt động", "Câu giới thiệu"], a: "Câu nêu đặc điểm", type: "mcq" },
    { text: "Câu 'Đây là bạn Lan.' thuộc kiểu câu gì?", options: ["Câu giới thiệu", "Câu nêu hoạt động", "Câu nêu đặc điểm"], a: "Câu giới thiệu", type: "mcq" },
    { text: "Từ nào là danh từ? 'Bé chạy nhanh trên sân trường.'", options: ["sân trường", "chạy", "nhanh"], a: "sân trường", type: "mcq" },
    { text: "Từ nào là động từ? 'Các bạn đang hát rất hay.'", options: ["hát", "bạn", "hay"], a: "hát", type: "mcq" }
];

const WRITING_L3 = [
    { text: "Câu nào dùng đúng dấu phẩy?", options: ["Hôm nay, trời rất đẹp.", "Hôm, nay trời rất đẹp.", "Hôm nay trời, rất đẹp."], a: "Hôm nay, trời rất đẹp.", type: "mcq" },
    { text: "Từ nào là tính từ? 'Bông hoa đỏ thắm nở trong vườn.'", options: ["đỏ thắm", "bông hoa", "nở"], a: "đỏ thắm", type: "mcq" },
    { text: "Đặt dấu câu đúng: 'Em tên là gì'", options: ["Em tên là gì?", "Em tên là gì.", "Em tên là gì!"], a: "Em tên là gì?", type: "mcq" },
    { text: "Điền quan hệ từ: 'Trời mưa ... em vẫn đi học.'", options: ["nhưng", "và", "vì"], a: "nhưng", type: "mcq" },
    { text: "Tìm chủ ngữ trong câu: 'Con mèo đang ngủ trưa.'", answer: "Con mèo", type: "input" },
    { text: "Tìm vị ngữ trong câu: 'Bé Lan chạy rất nhanh.'", answer: "chạy rất nhanh", type: "input" }
];

// --- ĐỌC DIỄN CẢM DATA (Thơ & Văn cho Lớp 2-3) ---
const EXPRESSIVE_READING_PASSAGES = [
    // === THƠ ===
    {
        title: "Mẹ ốm", author: "Trần Đăng Khoa", type: "thơ" as const,
        text: "Mọi hôm mẹ thích vui cười\nMà sao hôm nay mẹ ngồi im re\nLá trầu khô giữa cơi trề\nTruyện Kiều gấp lại trên bề bàn con.",
        instruction: "📖 Đọc diễn cảm bài thơ \"Mẹ ốm\""
    },
    {
        title: "Quạt cho bà ngủ", author: "Thạch Quỳ", type: "thơ" as const,
        text: "Ơi chích chòe ơi\nChim đừng hót nữa\nBà em ốm rồi\nLặng cho bà ngủ.\n\nHoa cam hoa khế\nNgoài vườn rụng nhiều\nBướm bay lặng lẽ\nVàng trong nắng chiều.",
        instruction: "📖 Đọc diễn cảm bài thơ \"Quạt cho bà ngủ\""
    },
    {
        title: "Tháp Mười đẹp nhất bông sen", author: "Ca dao", type: "thơ" as const,
        text: "Tháp Mười đẹp nhất bông sen\nViệt Nam đẹp nhất có tên Bác Hồ.",
        instruction: "📖 Đọc diễn cảm câu ca dao"
    },
    {
        title: "Bạn đến chơi nhà", author: "Nguyễn Khuyến", type: "thơ" as const,
        text: "Đã bấy lâu nay bác tới nhà\nTrẻ thời đi vắng, chợ thời xa\nAo sâu nước cả, khôn chài cá\nVườn rộng rào thưa, khó đuổi gà.",
        instruction: "📖 Đọc diễn cảm đoạn thơ \"Bạn đến chơi nhà\""
    },
    {
        title: "Cảnh khuya", author: "Hồ Chí Minh", type: "thơ" as const,
        text: "Tiếng suối trong như tiếng hát xa\nTrăng lồng cổ thụ bóng lồng hoa\nCảnh khuya như vẽ người chưa ngủ\nChưa ngủ vì lo nỗi nước nhà.",
        instruction: "📖 Đọc diễn cảm bài thơ \"Cảnh khuya\""
    },
    {
        title: "Lượm", author: "Tố Hữu", type: "thơ" as const,
        text: "Chú bé loắt choắt\nCái xắc xinh xinh\nCái chân thoăn thoắt\nCái đầu nghênh nghênh\n\nCa-lô đội lệch\nMồm huýt sáo vang\nNhư con chim chích\nNhảy trên đường vàng.",
        instruction: "📖 Đọc diễn cảm đoạn thơ \"Lượm\""
    },
    {
        title: "Con cò", author: "Ca dao", type: "thơ" as const,
        text: "Con cò mà đi ăn đêm\nĐậu phải cành mềm lộn cổ xuống ao\nÔng ơi ông vớt tôi nao\nTôi có lòng nào ông hãy xáo măng.",
        instruction: "📖 Đọc diễn cảm bài ca dao"
    },
    {
        title: "Hạt gạo làng ta", author: "Trần Đăng Khoa", type: "thơ" as const,
        text: "Hạt gạo làng ta\nCó vị phù sa\nCủa sông Kinh Thầy\nCó hương sen thơm\nTrong hồ nước đầy\nCó lời mẹ hát\nNgọt bùi đắng cay.",
        instruction: "📖 Đọc diễn cảm bài thơ \"Hạt gạo làng ta\""
    },
    // === VĂN XUÔI ===
    {
        title: "Trường em", author: "Bài tập đọc", type: "văn" as const,
        text: "Sáng nay, trường em thật đẹp. Sân trường sạch sẽ, lá cờ đỏ tung bay trong gió. Các bạn nhỏ chạy nhảy vui vẻ dưới hàng cây xanh mát. Tiếng trống trường vang lên, em vội bước vào lớp.",
        instruction: "📖 Đọc diễn cảm đoạn văn"
    },
    {
        title: "Mùa xuân đến", author: "Bài tập đọc", type: "văn" as const,
        text: "Mùa xuân đến, cây cối đua nhau nở hoa. Hoa mai vàng rực rỡ, hoa đào hồng phấn. Chim chóc hót líu lo trên cành. Không khí thật trong lành. Em yêu mùa xuân biết bao!",
        instruction: "📖 Đọc diễn cảm đoạn văn"
    },
    {
        title: "Bà em", author: "Bài tập đọc", type: "văn" as const,
        text: "Bà em năm nay đã già. Tóc bà bạc trắng. Bà hay kể chuyện cổ tích cho em nghe. Giọng bà ấm áp, nhẹ nhàng. Em rất yêu bà.",
        instruction: "📖 Đọc diễn cảm đoạn văn"
    },
    {
        title: "Cánh đồng quê", author: "Bài tập đọc", type: "văn" as const,
        text: "Buổi sớm, cánh đồng lúa chín vàng óng. Gió thổi nhẹ, từng đợt sóng lúa chạy dài tít tắp. Mấy chú cò trắng thong thả bay lượn trên cánh đồng. Xa xa, những nóc nhà tranh nhỏ xíu nằm lấp ló sau lũy tre xanh.",
        instruction: "📖 Đọc diễn cảm đoạn văn"
    },
];

// --- GENERATORS ---

export const generateReadingQuestion = (skillId: string, level: number = 1): Question => {
    const pool = level <= 1 ? READING_PASSAGES_L1 :
        level <= 2 ? [...READING_PASSAGES_L1, ...READING_PASSAGES_L2] :
            [...READING_PASSAGES_L1, ...READING_PASSAGES_L2, ...READING_PASSAGES_L3];
    const passage = getRandom(pool);
    const qData = getRandom(passage.questions);

    return {
        id: `vn-read-${Date.now()}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction: 'Đọc đoạn văn và trả lời câu hỏi:',
        content: {
            text: `${passage.text}\n\n❓ ${qData.q}`,
            options: qData.options
        },
        answer: qData.a,
        hint: 'Bé hãy đọc kỹ lại đoạn văn nhé!'
    };
};

export const generateVocabQuestion = (skillId: string, level: number = 1): Question => {
    const pool = level <= 1 ? VOCAB_L1 :
        level <= 2 ? [...VOCAB_L1, ...VOCAB_L2] :
            [...VOCAB_L1, ...VOCAB_L2, ...VOCAB_L3];
    const item = getRandom(pool);

    const instruction = item.type === 'synonym'
        ? "Tìm từ CÙNG nghĩa với từ sau:"
        : "Tìm từ TRÁI nghĩa với từ sau:";

    return {
        id: `vn-vocab-${Date.now()}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction,
        content: {
            text: item.word,
            options: item.options
        },
        answer: item.a
    };
};

export const generateWritingQuestion = (skillId: string, level: number = 1): Question => {
    const pool = level <= 1 ? WRITING_L1 :
        level <= 2 ? [...WRITING_L1, ...WRITING_L2] :
            [...WRITING_L1, ...WRITING_L2, ...WRITING_L3];
    const item = getRandom(pool);

    return {
        id: `vn-write-${Date.now()}`,
        subjectId: 'vietnamese',
        skillId,
        type: item.type as "input" | "mcq",
        instruction: 'Bài tập Tiếng Việt:',
        content: {
            text: item.text,
            options: 'options' in item ? item.options : undefined
        },
        answer: ('answer' in item ? item.answer : 'a' in item ? item.a : "") as string
    };
};

// === SPEAKING TOPICS (level-tiered) ===
const SPEAKING_TOPICS_L1 = [
    {
        topic: "Kể về một người mà con yêu thương nhất.",
        hint: "Dàn ý:\n1. Mở bài: Giới thiệu người đó là ai.\n2. Thân bài: 2 lý do tại sao con yêu thương họ.\n3. Kết bài: Tình cảm của con."
    },
    {
        topic: "Kể về một kỷ niệm đáng nhớ nhất của con trong dịp Tết.",
        hint: "Dàn ý:\n1. Mở bài: Giới thiệu đó là Tết năm nào.\n2. Thân bài: 2 việc làm con nhớ nhất.\n3. Kết bài: Cảm xúc khi nhớ lại."
    },
    {
        topic: "Kể về con vật mà con yêu thích nhất.",
        hint: "Dàn ý:\n1. Mở bài: Con vật đó là gì.\n2. Thân bài: Miêu tả hình dáng, tính cách.\n3. Kết bài: Tại sao con thích."
    }
];

const SPEAKING_TOPICS_L2 = [
    {
        topic: "Nếu có một phép thuật, con muốn làm gì để giúp đỡ mọi người?",
        hint: "Dàn ý:\n1. Mở bài: Phép thuật con muốn có.\n2. Thân bài: 2 việc tốt con sẽ làm.\n3. Kết bài: Cảm nhận khi làm việc tốt."
    },
    {
        topic: "Theo con, tại sao chúng ta cần phải bảo vệ môi trường?",
        hint: "Dàn ý:\n1. Mở bài: Tầm quan trọng của môi trường.\n2. Thân bài: 2 lý do cần bảo vệ.\n3. Kết bài: Lời khuyên mọi người."
    },
    {
        topic: "Giới thiệu về một cuốn sách hoặc câu chuyện mà con thích nhất.",
        hint: "Dàn ý:\n1. Mở bài: Tên sách.\n2. Thân bài: Nội dung và bài học.\n3. Kết bài: Khuyên bạn đọc thử."
    }
];

const SPEAKING_TOPICS_L3 = [
    {
        topic: "Con nghĩ mình sẽ làm nghề gì khi lớn lên? Vì sao?",
        hint: "Dàn ý:\n1. Mở bài: Nghề mơ ước.\n2. Thân bài: Lý do chọn nghề, cần làm gì để đạt được.\n3. Kết bài: Quyết tâm."
    },
    {
        topic: "Theo con, học nhóm và học một mình, cách nào tốt hơn?",
        hint: "Dàn ý:\n1. Mở bài: Nêu vấn đề.\n2. Thân bài: Ưu/nhược điểm mỗi cách.\n3. Kết bài: Ý kiến cá nhân."
    }
];

export const generateSpeakingQuestion = (skillId: string, level: number = 1): Question => {

    // Đọc diễn cảm: chọn ngẫu nhiên đoạn thơ/văn
    if (skillId.includes('doc-dien-cam')) {
        const passage = getRandom(EXPRESSIVE_READING_PASSAGES);
        return {
            id: `vn-ddc-${Date.now()}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'reading',
            instruction: passage.instruction,
            content: {
                text: passage.text,
            },
            answer: "Đã đọc"
        };
    }

    // Hùng biện / Nói: đề tài theo level
    const pool = level <= 1 ? SPEAKING_TOPICS_L1 :
        level <= 2 ? [...SPEAKING_TOPICS_L1, ...SPEAKING_TOPICS_L2] :
            [...SPEAKING_TOPICS_L1, ...SPEAKING_TOPICS_L2, ...SPEAKING_TOPICS_L3];
    const selectedTopic = getRandom(pool);

    return {
        id: `vn-speak-${Date.now()}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'speaking',
        instruction: '🎙️ Bé hãy suy nghĩ dàn ý và hùng biện về chủ đề sau:',
        content: {
            text: selectedTopic.topic
        },
        hint: selectedTopic.hint,
        answer: "Đã nói"
    };
}
