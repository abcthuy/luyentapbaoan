import { Question } from '../types';
import { QuestionFactory } from '../factory';

// Helper for random selection
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- DATA SOURCE ---

// === ĐỌC HIỂU (Expanded - 8 passages, level-tiered) ===
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

const PUNCTUATION_L1 = [
    { text: "Điền dấu câu: 'Em đi học'", options: ["Em đi học.", "Em đi học?", "Em đi học!"], answer: "Em đi học.", explain: "Câu kể dùng dấu chấm." },
    { text: "Điền dấu câu: 'Bạn tên là gì'", options: ["Bạn tên là gì?", "Bạn tên là gì.", "Bạn tên là gì!"], answer: "Bạn tên là gì?", explain: "Câu hỏi dùng dấu chấm hỏi." },
    { text: "Điền dấu câu: 'Ôi đẹp quá'", options: ["Ôi, đẹp quá!", "Ôi đẹp quá.", "Ôi đẹp quá?"], answer: "Ôi, đẹp quá!", explain: "Câu cảm thán dùng dấu chấm than." },
    { text: "Dấu nào đúng cho cuối câu kể?", options: ["Dấu chấm (.)", "Dấu chấm hỏi (?)", "Dấu chấm than (!)"], answer: "Dấu chấm (.)", explain: "Câu kể kết thúc bằng dấu chấm." },
];

const PUNCTUATION_L2 = [
    { text: "Câu nào dùng đúng dấu phẩy?", options: ["Hôm nay, trời rất đẹp.", "Hôm, nay trời rất đẹp.", "Hôm nay trời, rất đẹp."], answer: "Hôm nay, trời rất đẹp.", explain: "Dấu phẩy ngăn cách trạng ngữ với nòng cốt câu." },
    { text: "Đặt dấu câu đúng: 'Mẹ ơi con đói quá'", options: ["Mẹ ơi, con đói quá!", "Mẹ ơi con đói quá.", "Mẹ, ơi con đói quá?"], answer: "Mẹ ơi, con đói quá!", explain: "Dấu phẩy sau lời gọi, dấu chấm than cho câu cảm thán." },
    { text: "Câu 'Con có khỏe không' cần dấu gì ở cuối?", options: ["Dấu chấm hỏi (?)", "Dấu chấm (.)", "Dấu chấm than (!)"], answer: "Dấu chấm hỏi (?)", explain: "Đây là câu hỏi." },
    { text: "Dấu phẩy dùng để làm gì?", options: ["Ngăn cách các bộ phận câu", "Kết thúc câu", "Đặt câu hỏi"], answer: "Ngăn cách các bộ phận câu", explain: "Dấu phẩy ngăn cách các thành phần trong câu." },
];

const PUNCTUATION_L3 = [
    { text: "Điền dấu câu: 'Lan hỏi Bình: Bạn đi đâu đấy'", options: ["Lan hỏi Bình: \"Bạn đi đâu đấy?\"", "Lan hỏi Bình: Bạn đi đâu đấy.", "Lan hỏi Bình, Bạn đi đâu đấy!"], answer: "Lan hỏi Bình: \"Bạn đi đâu đấy?\"", explain: "Dùng dấu hai chấm và ngoặc kép cho lời nói trực tiếp." },
    { text: "Câu nào dùng dấu hai chấm đúng?", options: ["Mẹ bảo: \"Con ăn cơm đi.\"", "Mẹ: bảo con ăn cơm đi.", "Mẹ bảo con: ăn cơm đi."], answer: "Mẹ bảo: \"Con ăn cơm đi.\"", explain: "Dấu hai chấm đặt trước lời nói trực tiếp." },
    { text: "Khi liệt kê nhiều thứ, bé dùng dấu gì để ngăn cách?", options: ["Dấu phẩy", "Dấu chấm", "Dấu hai chấm"], answer: "Dấu phẩy", explain: "Dấu phẩy ngăn cách các từ trong chuỗi liệt kê." },
    { text: "Đặt dấu câu đúng: 'Em tên là gì'", options: ["Em tên là gì?", "Em tên là gì.", "Em tên là gì!"], answer: "Em tên là gì?", explain: "Đây là câu hỏi nên dùng dấu chấm hỏi." },
];

const WRITING_L1 = [
    { text: "Điền từ còn thiếu: 'Uống nước nhớ ...'", answer: "nguồn", type: "input" as const },
    { text: "Điền từ còn thiếu: 'Ăn quả nhớ kẻ ... cây'", answer: "trồng", type: "input" as const },
    { text: "Điền từ: 'Có công mài sắt, có ngày nên ...'", answer: "kim", type: "input" as const },
    { text: "Điền từ: 'Tốt gỗ hơn tốt ...'", answer: "nước sơn", type: "input" as const },
];

const WRITING_L2 = [
    { text: "Câu 'Bé đang học bài.' thuộc kiểu câu gì?", options: ["Câu nêu hoạt động", "Câu giới thiệu", "Câu nêu đặc điểm"], answer: "Câu nêu hoạt động", type: "mcq" as const },
    { text: "Câu 'Mái tóc bà bạc phơ.' thuộc kiểu câu gì?", options: ["Câu nêu đặc điểm", "Câu nêu hoạt động", "Câu giới thiệu"], answer: "Câu nêu đặc điểm", type: "mcq" as const },
    { text: "Câu 'Đây là bạn Lan.' thuộc kiểu câu gì?", options: ["Câu giới thiệu", "Câu nêu hoạt động", "Câu nêu đặc điểm"], answer: "Câu giới thiệu", type: "mcq" as const },
    { text: "Từ nào là danh từ? 'Bé chạy nhanh trên sân trường.'", options: ["sân trường", "chạy", "nhanh"], answer: "sân trường", type: "mcq" as const },
    { text: "Từ nào là động từ? 'Các bạn đang hát rất hay.'", options: ["hát", "bạn", "hay"], answer: "hát", type: "mcq" as const },
];

const WRITING_L3 = [
    { text: "Từ nào là tính từ? 'Bông hoa đỏ thắm nở trong vườn.'", options: ["đỏ thắm", "bông hoa", "nở"], answer: "đỏ thắm", type: "mcq" as const },
    { text: "Điền quan hệ từ: 'Trời mưa ... em vẫn đi học.'", options: ["nhưng", "và", "vì"], answer: "nhưng", type: "mcq" as const },
    { text: "Tìm chủ ngữ trong câu: 'Con mèo đang ngủ trưa.'", answer: "Con mèo", type: "input" as const },
    { text: "Tìm vị ngữ trong câu: 'Bé Lan chạy rất nhanh.'", answer: "chạy rất nhanh", type: "input" as const },
    { text: "Câu 'Mẹ rất vui vì con ngoan.' có mấy vế?", options: ["2 vế", "1 vế", "3 vế"], answer: "2 vế", type: "mcq" as const },
    { text: "Trong câu 'Em yêu mẹ.', từ nào là chủ ngữ?", options: ["Em", "yêu", "mẹ"], answer: "Em", type: "mcq" as const },
];

const EXPRESSIVE_READING_PASSAGES = [
    {
        title: "Mẹ ốm", author: "Trần Đăng Khoa", type: "thơ" as const,
        text: "Mọi hôm mẹ thích vui cười\nMà sao hôm nay mẹ ngồi im re\nLá trầu khô giữa cơi trề\nTruyện Kiều gấp lại trên bề bàn con.",
        instruction: 'Đọc diễn cảm bài thơ Mẹ ốm'
    },
    {
        title: "Quạt cho bà ngủ", author: "Thạch Quỳ", type: "thơ" as const,
        text: "Ơi chích chòe ơi\nChim đừng hót nữa\nBà em ốm rồi\nLặng cho bà ngủ.\n\nHoa cam hoa khế\nNgoài vườn rụng nhiều\nBướm bay lặng lẽ\nVàng trong nắng chiều.",
        instruction: 'Đọc diễn cảm bài thơ Quạt cho bà ngủ'
    },
    {
        title: "Tháp Mười đẹp nhất bông sen", author: "Ca dao", type: "thơ" as const,
        text: "Tháp Mười đẹp nhất bông sen\nViệt Nam đẹp nhất có tên Bác Hồ.",
        instruction: 'Đọc diễn cảm câu ca dao'
    },
    {
        title: "Bạn đến chơi nhà", author: "Nguyễn Khuyến", type: "thơ" as const,
        text: "Đã bấy lâu nay bác tới nhà\nTrẻ thời đi vắng, chợ thời xa\nAo sâu nước cả, khôn chài cá\nVườn rộng rào thưa, khó đuổi gà.",
        instruction: 'Đọc diễn cảm đoạn thơ Bạn đến chơi nhà'
    },
    {
        title: "Cảnh khuya", author: "Hồ Chí Minh", type: "thơ" as const,
        text: "Tiếng suối trong như tiếng hát xa\nTrăng lồng cổ thụ bóng lồng hoa\nCảnh khuya như vẽ người chưa ngủ\nChưa ngủ vì lo nỗi nước nhà.",
        instruction: 'Đọc diễn cảm bài thơ Cảnh khuya'
    },
    {
        title: "Lượm", author: "Tố Hữu", type: "thơ" as const,
        text: "Chú bé loắt choắt\nCái xắc xinh xinh\nCái chân thoăn thoắt\nCái đầu nghênh nghênh\n\nCa-lô đội lệch\nMồm huýt sáo vang\nNhư con chim chích\nNhảy trên đường vàng.",
        instruction: 'Đọc diễn cảm đoạn thơ Lượm'
    },
    {
        title: "Con cò", author: "Ca dao", type: "thơ" as const,
        text: "Con cò mà đi ăn đêm\nĐậu phải cành mềm lộn cổ xuống ao\nÔng ơi ông vớt tôi nao\nTôi có lòng nào ông hãy xáo măng.",
        instruction: 'Đọc diễn cảm bài ca dao'
    },
    {
        title: "Hạt gạo làng ta", author: "Trần Đăng Khoa", type: "thơ" as const,
        text: "Hạt gạo làng ta\nCó vị phù sa\nCủa sông Kinh Thầy\nCó hương sen thơm\nTrong hồ nước đầy\nCó lời mẹ hát\nNgọt bùi đắng cay.",
        instruction: 'Đọc diễn cảm bài thơ Hạt gạo làng ta'
    },
    {
        title: "Trường em", author: "Bài tập đọc", type: "văn" as const,
        text: "Sáng nay, trường em thật đẹp. Sân trường sạch sẽ, lá cờ đỏ tung bay trong gió. Các bạn nhỏ chạy nhảy vui vẻ dưới hàng cây xanh mát. Tiếng trống trường vang lên, em vội bước vào lớp.",
        instruction: "Đọc diễn cảm đoạn văn"
    },
    {
        title: "Mùa xuân đến", author: "Bài tập đọc", type: "văn" as const,
        text: "Mùa xuân đến, cây cối đua nhau nở hoa. Hoa mai vàng rực rỡ, hoa đào hồng phấn. Chim chóc hót líu lo trên cành. Không khí thật trong lành. Em yêu mùa xuân biết bao!",
        instruction: "Đọc diễn cảm đoạn văn"
    },
    {
        title: "Bà em", author: "Bài tập đọc", type: "văn" as const,
        text: "Bà em năm nay đã già. Tóc bà bạc trắng. Bà hay kể chuyện cổ tích cho em nghe. Giọng bà ấm áp, nhẹ nhàng. Em rất yêu bà.",
        instruction: "Đọc diễn cảm đoạn văn"
    },
    {
        title: "Cánh đồng quê", author: "Bài tập đọc", type: "văn" as const,
        text: "Buổi sớm, cánh đồng lúa chín vàng óng. Gió thổi nhẹ, từng đợt sóng lúa chạy dài tít tắp. Mấy chú cò trắng thong thả bay lượn trên cánh đồng. Xa xa, những nóc nhà tranh nhỏ xíu nằm lấp ló sau lũy tre xanh.",
        instruction: "Đọc diễn cảm đoạn văn"
    },
];

const POEM_PASSAGES_L1 = [
    {
        text: "Bé quét nhà giúp mẹ\nSân sạch bóng nắng vàng\nMẹ nhìn em mỉm cười\nKhen em ngoan, chăm chỉ.",
        questions: [
            { q: "Bạn nhỏ đã làm gì?", options: ["Quét nhà giúp mẹ", "Đi chơi cùng bạn", "Tưới cây ngoài sân"], a: "Quét nhà giúp mẹ" },
            { q: "Mẹ đã làm gì khi nhìn thấy em?", options: ["Mỉm cười khen em", "Bảo em đi ngủ", "Đưa em đến trường"], a: "Mỉm cười khen em" },
            { q: "Bài thơ khen bạn nhỏ điều gì?", options: ["Ngoan và chăm chỉ", "Chạy nhanh", "Hát hay"], a: "Ngoan và chăm chỉ" }
        ]
    },
    {
        text: "Mưa rơi tí tách ngoài hiên\nCây cau gật gù trong mưa\nSân nhà mát dịu ban trưa\nEm ngồi ngắm giọt nước đưa nhẹ nhàng.",
        questions: [
            { q: "Mưa rơi ở đâu?", options: ["Ngoài hiên", "Trong lớp học", "Trên cánh đồng"], a: "Ngoài hiên" },
            { q: "Cây cau được tả như thế nào?", options: ["Gật gù trong mưa", "Khô héo", "Đổ xuống đất"], a: "Gật gù trong mưa" },
            { q: "Em nhỏ đang làm gì?", options: ["Ngồi ngắm mưa", "Đuổi bắt bướm", "Đọc sách trong lớp"], a: "Ngồi ngắm mưa" }
        ]
    },
    {
        text: "Sáng sân trường nắng nhẹ\nCờ đỏ bay trên cao\nBạn bè em ríu rít\nCùng nhau đến lớp nào.",
        questions: [
            { q: "Nắng ở sân trường như thế nào?", options: ["Nắng nhẹ", "Nắng gắt", "Mưa to"], a: "Nắng nhẹ" },
            { q: "Cờ gì bay trên cao?", options: ["Cờ đỏ", "Cờ xanh", "Cờ vàng"], a: "Cờ đỏ" },
            { q: "Các bạn nhỏ đang làm gì?", options: ["Cùng nhau đến lớp", "Đi chợ", "Ra đồng"], a: "Cùng nhau đến lớp" }
        ]
    },
    {
        text: "Bà kể em nghe chuyện\nGiọng bà ấm dịu dàng\nNgoài thềm hoa nở rộ\nTỏa hương thơm nhẹ nhàng.",
        questions: [
            { q: "Ai kể chuyện cho em nghe?", options: ["Bà", "Mẹ", "Cô giáo"], a: "Bà" },
            { q: "Giọng bà như thế nào?", options: ["Ấm và dịu dàng", "To và gắt", "Nhỏ và buồn"], a: "Ấm và dịu dàng" },
            { q: "Ngoài thềm có gì?", options: ["Hoa nở rộ", "Mưa rất to", "Nhiều lá khô"], a: "Hoa nở rộ" }
        ]
    }
];

const EXTRA_EXPRESSIVE_READING_PASSAGES = [
    {
        title: "Tiếng mưa", author: "Bài tập đọc", type: "thơ" as const,
        text: "Mưa rơi tí tách ngoài hiên\nHàng cau nghiêng ngó, con thuyền ngủ say\nẾch con gọi bạn đêm nay\nGió đưa hương lúa thoảng bay dịu dàng.",
        instruction: 'Đọc diễn cảm bài thơ Tiếng mưa'
    },
    {
        title: "Buổi sáng quê em", author: "Bài tập đọc", type: "văn" as const,
        text: "Trời vừa hửng sáng, cả xóm nhỏ đã rộn ràng tiếng gà gáy. Khói bếp bay lên từ những mái nhà thân quen. Con đường làng còn đẫm sương sớm, mát lành. Em hít một hơi thật sâu và thấy yêu quê mình biết bao.",
        instruction: 'Đọc diễn cảm đoạn văn Buổi sáng quê em'
    },
    {
        title: "Cô giáo em", author: "Bài tập đọc", type: "văn" as const,
        text: "Cô giáo em có giọng nói dịu dàng và nụ cười rất ấm áp. Mỗi khi giảng bài, cô nhìn chúng em trìu mến. Khi em viết chưa đẹp, cô nhẹ nhàng cầm tay hướng dẫn. Em luôn kính yêu cô giáo của mình.",
        instruction: 'Đọc diễn cảm đoạn văn Cô giáo em'
    },
    {
        title: "Trăng sân nhà", author: "Bài tập đọc", type: "thơ" as const,
        text: "Trăng tròn như chiếc đĩa xinh\nTreo cao trên ngọn tre xanh đầu làng\nSân nhà rải bạc mênh mang\nEm ngồi kể chuyện chị Hằng cùng mây.",
        instruction: 'Đọc diễn cảm bài thơ Trăng sân nhà'
    },
    {
        title: "Dòng sông nhỏ", author: "Bài tập đọc", type: "văn" as const,
        text: "Con sông nhỏ uốn quanh làng em như một dải lụa mềm. Nước sông trong veo, soi bóng tre xanh hai bên bờ. Buổi chiều, lũ trẻ chúng em thường ra ngắm thuyền trôi chầm chậm. Dòng sông đã trở thành người bạn thân thiết của quê em.",
        instruction: 'Đọc diễn cảm đoạn văn Dòng sông nhỏ'
    },
    {
        title: "Hoa phượng", author: "Bài tập đọc", type: "thơ" as const,
        text: "Phượng hồng thắp lửa sân trường\nVe ngân rộn rã gọi mùa hè sang\nTừng cánh mỏng nhẹ nhàng rơi\nGợi bao thương nhớ bạn thời học sinh.",
        instruction: 'Đọc diễn cảm bài thơ Hoa phượng'
    },
    {
        title: "Bé và chú chó nhỏ", author: "Bài tập đọc", type: "văn" as const,
        text: "Nhà em có một chú chó nhỏ rất khôn. Mỗi chiều đi học về, em vừa bước tới cổng là chú đã chạy ra vẫy đuôi mừng rỡ. Em thường vuốt ve bộ lông mềm mượt của chú. Chú chó nhỏ làm cho ngôi nhà thêm ấm áp và vui vẻ.",
        instruction: 'Đọc diễn cảm đoạn văn Bé và chú chó nhỏ'
    },
];

export const generateReadingQuestion = (skillId: string, level: number = 1): Question => {
    const grade2PoemPool = [
        {
            text: "Bé quét nhà giúp mẹ\nSân sạch bóng nắng vàng\nMẹ nhìn em mỉm cười\nKhen em ngoan, chăm chỉ.",
            questions: [
                { q: "Bạn nhỏ đã làm gì?", options: ["Quét nhà giúp mẹ", "Đi chơi cùng bạn", "Tưới cây ngoài sân"], a: "Quét nhà giúp mẹ" },
                { q: "Mẹ đã làm gì khi nhìn thấy em?", options: ["Mỉm cười khen em", "Bảo em đi ngủ", "Đưa em đến trường"], a: "Mỉm cười khen em" },
                { q: "Bài thơ khen bạn nhỏ điều gì?", options: ["Ngoan và chăm chỉ", "Chạy nhanh", "Hát hay"], a: "Ngoan và chăm chỉ" }
            ]
        },
        {
            text: "Sáng sân trường nắng nhẹ\nCờ đỏ bay trên cao\nBạn bè em ríu rít\nCùng nhau đến lớp nào.",
            questions: [
                { q: "Nắng ở sân trường như thế nào?", options: ["Nắng nhẹ", "Nắng gắt", "Mưa to"], a: "Nắng nhẹ" },
                { q: "Cờ gì bay trên cao?", options: ["Cờ đỏ", "Cờ xanh", "Cờ vàng"], a: "Cờ đỏ" },
                { q: "Các bạn nhỏ đang làm gì?", options: ["Cùng nhau đến lớp", "Đi chợ", "Ra đồng"], a: "Cùng nhau đến lớp" }
            ]
        },
        {
            text: "Bà kể em nghe chuyện\nGiọng bà ấm dịu dàng\nNgoài thềm hoa nở rộ\nTỏa hương thơm nhẹ nhàng.",
            questions: [
                { q: "Ai kể chuyện cho em nghe?", options: ["Bà", "Mẹ", "Cô giáo"], a: "Bà" },
                { q: "Giọng bà như thế nào?", options: ["Ấm và dịu dàng", "To và gắt", "Nhỏ và buồn"], a: "Ấm và dịu dàng" },
                { q: "Ngoài thềm có gì?", options: ["Hoa nở rộ", "Mưa rất to", "Nhiều lá khô"], a: "Hoa nở rộ" }
            ]
        }
    ];

    const grade2ReadingPool = [
        ...READING_PASSAGES_L1,
        {
            text: "Giờ ra chơi, sân trường rất vui. Các bạn nhảy dây, đá cầu, đọc sách dưới gốc cây. Tiếng cười nói rộn ràng khắp sân. Em thích nhất là được chơi cùng các bạn.",
            questions: [
                { q: "Các bạn làm gì trong giờ ra chơi?", options: ["Nhảy dây, đá cầu, đọc sách", "Ngồi ngủ", "Đi chợ"], a: "Nhảy dây, đá cầu, đọc sách" },
                { q: "Không khí sân trường như thế nào?", options: ["Rộn ràng", "Yên lặng", "Buồn bã"], a: "Rộn ràng" },
                { q: "Bạn nhỏ thích điều gì nhất?", options: ["Chơi cùng các bạn", "Ở nhà một mình", "Đi học muộn"], a: "Chơi cùng các bạn" }
            ]
        },
        {
            text: "Buổi sáng, bố đưa em đến trường. Trên đường đi, em thấy hàng cây xanh mát và những bông hoa nở đẹp bên lề đường. Em chào cô giáo rồi vào lớp học. Em cảm thấy rất vui.",
            questions: [
                { q: "Ai đưa em đến trường?", options: ["Bố", "Mẹ", "Ông"], a: "Bố" },
                { q: "Em thấy gì trên đường đi?", options: ["Hàng cây và bông hoa", "Dòng sông lớn", "Cánh đồng lúa"], a: "Hàng cây và bông hoa" },
                { q: "Em cảm thấy thế nào khi đến lớp?", options: ["Rất vui", "Rất buồn", "Rất mệt"], a: "Rất vui" }
            ]
        }
    ];

    const pool = skillId === 'tv2-tho'
        ? grade2PoemPool
        : level <= 1
            ? grade2ReadingPool
            : level <= 2
                ? [...grade2ReadingPool, ...READING_PASSAGES_L2]
                : [...grade2ReadingPool, ...READING_PASSAGES_L2, ...READING_PASSAGES_L3];
    const passage = getRandom(pool);
    const qData = getRandom(passage.questions);

    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction: 'Đọc đoạn văn và trả lời câu hỏi:',
        text: `${passage.text}\n\nCâu hỏi: ${qData.q}`,
        options: qData.options,
        answer: qData.a,
        hint: 'Bé hãy đọc kỹ lại đoạn văn nhé!'
    });
};

export const generateVocabQuestion = (skillId: string, level: number = 1): Question => {
    if (skillId === 'tv2-tu-ngu') {
        const item = getRandom([
            { text: "Từ nào chỉ sự vật?", options: ["cái bàn", "chạy", "xinh"], answer: "cái bàn" },
            { text: "Từ nào chỉ hoạt động?", options: ["đọc sách", "cây bàng", "đỏ thắm"], answer: "đọc sách" },
            { text: "Từ nào chỉ đặc điểm?", options: ["nhanh nhẹn", "bé Lan", "hát"], answer: "nhanh nhẹn" },
            { text: "Nhóm từ nào gồm toàn từ chỉ sự vật?", options: ["bút, vở, bảng", "đọc, viết, hát", "cao, đẹp, ngoan"], answer: "bút, vở, bảng" },
            { text: "Nhóm từ nào gồm toàn từ chỉ hoạt động?", options: ["chạy, nhảy, múa", "hoa, lá, cỏ", "xanh, đỏ, tím"], answer: "chạy, nhảy, múa" },
            { text: "Nhóm từ nào gồm toàn từ chỉ đặc điểm?", options: ["ngoan, chăm, đẹp", "bàn, ghế, tủ", "ăn, ngủ, học"], answer: "ngoan, chăm, đẹp" },
            { text: "Trong câu 'Bé Lan quét nhà rất sạch', từ nào chỉ hoạt động?", options: ["quét", "nhà", "sạch"], answer: "quét" },
            { text: "Trong câu 'Con mèo trắng nằm ngủ', từ nào chỉ đặc điểm?", options: ["trắng", "mèo", "ngủ"], answer: "trắng" }
        ]);

        return QuestionFactory.create({
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Chọn đáp án đúng:',
            text: item.text,
            options: item.options,
            answer: item.answer
        });
    }

    if (skillId === 'tv2-cau') {
        const item = getRandom([
            { text: "Câu nào là câu giới thiệu?", options: ["Đây là bạn Minh.", "Bạn Minh đang đọc sách.", "Bạn Minh rất chăm chỉ."], answer: "Đây là bạn Minh." },
            { text: "Câu nào là câu nêu hoạt động?", options: ["Bé đang tưới cây.", "Đây là cây bưởi.", "Cây bưởi rất cao."], answer: "Bé đang tưới cây." },
            { text: "Câu 'Đây là lớp em.' thuộc kiểu câu gì?", options: ["Câu giới thiệu", "Câu nêu hoạt động", "Câu nêu đặc điểm"], answer: "Câu giới thiệu" },
            { text: "Câu 'Lan đang viết bài.' thuộc kiểu câu gì?", options: ["Câu nêu hoạt động", "Câu giới thiệu", "Câu hỏi"], answer: "Câu nêu hoạt động" },
            { text: "Chọn câu giới thiệu đúng.", options: ["Đây là chiếc cặp của em.", "Chiếc cặp rất đẹp.", "Em đeo cặp đến trường."], answer: "Đây là chiếc cặp của em." },
            { text: "Chọn câu nêu hoạt động đúng.", options: ["Các bạn đang xếp hàng.", "Đây là sân trường.", "Sân trường rất rộng."], answer: "Các bạn đang xếp hàng." },
            { text: "Câu nào dùng để giới thiệu một người bạn?", options: ["Đây là bạn Hoa lớp em.", "Bạn Hoa hát rất hay.", "Bạn Hoa đang nhảy dây."], answer: "Đây là bạn Hoa lớp em." },
            { text: "Câu nào dùng để nói về hoạt động của chim?", options: ["Chim đang hót trên cành.", "Đây là chú chim sẻ.", "Chú chim rất nhỏ."], answer: "Chim đang hót trên cành." }
        ]);

        return QuestionFactory.create({
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Nhận biết kiểu câu:',
            text: item.text,
            options: item.options,
            answer: item.answer
        });
    }

    const pool = level <= 1 ? VOCAB_L1 :
        level <= 2 ? [...VOCAB_L1, ...VOCAB_L2] :
            [...VOCAB_L1, ...VOCAB_L2, ...VOCAB_L3];
    const item = getRandom(pool);

    const instruction = item.type === 'synonym'
        ? "Tìm từ CÙNG nghĩa với từ sau:"
        : "Tìm từ TRÁI nghĩa với từ sau:";

    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction,
        text: item.word,
        options: item.options,
        answer: item.a
    });
};

export const generatePunctuationQuestion = (skillId: string, level: number = 1): Question => {
    const extraGrade2Punctuation = [
        { text: "Điền dấu câu: 'Em chào cô giáo'", options: ["Em chào cô giáo.", "Em chào cô giáo?", "Em chào cô giáo!"], answer: "Em chào cô giáo.", explain: "Đây là câu kể nên dùng dấu chấm." },
        { text: "Điền dấu câu: 'Bạn đi đâu đấy'", options: ["Bạn đi đâu đấy?", "Bạn đi đâu đấy.", "Bạn đi đâu đấy!"], answer: "Bạn đi đâu đấy?", explain: "Đây là câu hỏi nên dùng dấu chấm hỏi." },
        { text: "Điền dấu câu: 'Ôi bông hoa đẹp quá'", options: ["Ôi, bông hoa đẹp quá!", "Ôi bông hoa đẹp quá.", "Ôi bông hoa đẹp quá?"], answer: "Ôi, bông hoa đẹp quá!", explain: "Câu cảm thán nên dùng dấu chấm than." },
        { text: "Cuối câu hỏi thường dùng dấu gì?", options: ["Dấu chấm hỏi (?)", "Dấu chấm (.)", "Dấu phẩy (,)"], answer: "Dấu chấm hỏi (?)", explain: "Câu hỏi kết thúc bằng dấu chấm hỏi." }
    ];

    const pool = level <= 1 ? [...PUNCTUATION_L1, ...extraGrade2Punctuation] :
        level <= 2 ? [...PUNCTUATION_L1, ...PUNCTUATION_L2] :
            [...PUNCTUATION_L1, ...PUNCTUATION_L2, ...PUNCTUATION_L3];
    const item = getRandom(pool);

    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction: 'Bài tập dấu câu:',
        text: item.text,
        options: item.options,
        answer: item.answer,
        explanation: item.explain
    });
};

export const generateWritingQuestion = (skillId: string, level: number = 1): Question => {
    // Skill-specific pools
    if (skillId === 'tv2-chinh-ta' || skillId === 'tv4-chinh-ta') {
        return generateSpellingQuestion(level);
    }
    if (skillId === 'tv2-ke-chuyen' || skillId === 'tv2-ta-nguoi' || skillId === 'tv3-sang-tao' || skillId === 'tv4-mieu-ta' || skillId === 'tv5-tap-lam-van' || skillId === 'tv5-van-nghi-luan') {
        return generateCreativeWritingQuestion(skillId, level);
    }
    if (skillId === 'tv3-viet-thu') {
        return generateLetterWritingQuestion(level);
    }
    if (skillId === 'tv3-bao-cao') {
        return generateReportWritingQuestion(level);
    }

    // Fallback: Grammar/general pool
    const pool = level <= 1 ? WRITING_L1 :
        level <= 2 ? [...WRITING_L1, ...WRITING_L2] :
            [...WRITING_L1, ...WRITING_L2, ...WRITING_L3];
    const item = getRandom(pool);

    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: item.type,
        instruction: 'Bài tập Tiếng Việt:',
        text: item.text,
        options: 'options' in item ? item.options : undefined,
        answer: item.answer
    });
};

// --- Skill-specific writing sub-generators ---

function generateSpellingQuestion(level: number): Question {
    const pools: Record<number, { text: string; options: string[]; answer: string; explain: string }[]> = {
        1: [
            { text: "Chọn từ viết đúng chính tả:", options: ["trường học", "chường học"], answer: "trường học", explain: "tr- là đúng: trường học." },
            { text: "Chọn từ viết đúng:", options: ["con sông", "con xông"], answer: "con sông", explain: "s- là đúng: con sông." },
            { text: "Chọn từ viết đúng:", options: ["ra đi", "da đi"], answer: "ra đi", explain: "r- là đúng: ra đi." },
            { text: "Điền tr hay ch: '...ời nắng đẹp'", options: ["Trời", "Chrời"], answer: "Trời", explain: "Trời nắng đẹp dùng tr." },
        ],
        2: [
            { text: "Chọn từ đúng chính tả:", options: ["sáng sủa", "xáng xủa"], answer: "sáng sủa", explain: "s- là đúng: sáng sủa." },
            { text: "Điền s hay x: '...inh đẹp'", options: ["xinh", "sinh"], answer: "xinh", explain: "Xinh đẹp dùng x." },
            { text: "Chọn từ đúng:", options: ["giúp đỡ", "dúp đỡ"], answer: "giúp đỡ", explain: "gi- là đúng: giúp đỡ." },
            { text: "Điền r hay d: '...ưới trời mưa'", options: ["Dưới", "Rưới"], answer: "Dưới", explain: "Dưới trời mưa dùng d." },
        ],
        3: [
            { text: "Chọn từ đúng:", options: ["tranh giành", "chanh giành"], answer: "tranh giành", explain: "tr- là đúng: tranh giành." },
            { text: "Điền s hay x: '...uy nghĩ' (nghỉ ngơi)", options: ["suy nghĩ", "xuy nghĩ"], answer: "suy nghĩ", explain: "s- là đúng: suy nghĩ." },
            { text: "Chọn từ đúng:", options: ["giải thích", "dải thích"], answer: "giải thích", explain: "gi- là đúng: giải thích." },
            { text: "Điền tr hay ch: '...ăm sóc em bé'", options: ["Chăm", "Trăm"], answer: "Chăm", explain: "ch- là đúng: chăm sóc." },
        ],
    };
    pools[1].push(
        { text: "Chọn từ viết đúng:", options: ["chăm chỉ", "trăm chỉ"], answer: "chăm chỉ", explain: "Từ đúng là 'chăm chỉ'." },
        { text: "Chọn từ viết đúng:", options: ["cái chổi", "cái trổi"], answer: "cái chổi", explain: "Từ đúng là 'cái chổi'." },
        { text: "Điền s hay x: '...ân trường'", options: ["Sân", "Xân"], answer: "Sân", explain: "Từ đúng là 'sân trường'." },
        { text: "Chọn từ viết đúng:", options: ["rổ rá", "dổ dá"], answer: "rổ rá", explain: "Từ đúng là 'rổ rá'." },
    );
    pools[2].push(
        { text: "Chọn từ đúng:", options: ["chia sẻ", "tria sẻ"], answer: "chia sẻ", explain: "Từ đúng là 'chia sẻ'." },
        { text: "Chọn từ đúng:", options: ["xếp hàng", "sếp hàng"], answer: "xếp hàng", explain: "Từ đúng là 'xếp hàng'." },
        { text: "Chọn từ đúng:", options: ["gia đình", "da đình"], answer: "gia đình", explain: "Từ đúng là 'gia đình'." },
        { text: "Điền tr hay ch: '...ú mèo nhỏ'", options: ["Chú", "Trú"], answer: "Chú", explain: "Từ đúng là 'chú mèo nhỏ'." },
    );
    const safeLevel = Math.min(Math.max(level, 1), 3);
    const item = getRandom(pools[safeLevel]);
    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId: 'tv2-chinh-ta',
        type: 'mcq',
        instruction: 'Bài tập chính tả - Phân biệt phụ âm:',
        text: item.text,
        options: item.options,
        answer: item.answer,
        explanation: item.explain
    });
}

function generateCreativeWritingQuestion(skillId: string, level: number): Question {
    const prompts: Record<string, { text: string; hint: string }[]> = {
        'tv2-ke-chuyen': [
            { text: "Kể lại việc em chuẩn bị đi học vào buổi sáng theo trình tự.", hint: "Gợi ý: Thức dậy -> vệ sinh cá nhân -> ăn sáng -> đến trường." },
            { text: "Nhìn tranh và kể lại một buổi em cùng gia đình đi thăm ông bà.", hint: "Gợi ý: Em đi với ai -> mang theo gì -> gặp ông bà ra sao -> cảm xúc của em." },
            { text: "Kể lại một việc tốt em đã làm ở lớp hoặc ở nhà.", hint: "Gợi ý: Việc đó diễn ra khi nào -> em đã làm gì -> mọi người cảm thấy thế nào." },
        ],
        'tv2-ta-nguoi': [
            { text: "Tả người thân mà bé yêu quý nhất (mẹ, bố, ông, bà).", hint: "Gợi ý: Hình dáng -> Tính cách -> Việc thường làm -> Tình cảm của bé." },
            { text: "Tả cô giáo (hoặc thầy giáo) của bé.", hint: "Gợi ý: Ngoại hình -> Giọng nói -> Cách dạy -> Bé thích điều gì?" },
            { text: "Tả bạn thân nhất của bé ở lớp.", hint: "Gợi ý: Tên bạn -> Ngoại hình -> Hay chơi gì cùng -> Kỷ niệm đáng nhớ." },
        ],
        'tv3-sang-tao': [
            { text: "Viết đoạn văn ngắn tả sân trường giờ ra chơi.", hint: "Gợi ý: Cảnh vật -> âm thanh -> hoạt động của các bạn -> cảm xúc của em." },
            { text: "Viết 5 đến 7 câu tả một đồ vật em thường dùng để học tập.", hint: "Gợi ý: Tên đồ vật -> hình dáng, màu sắc -> công dụng -> vì sao em thích." },
            { text: "Viết tiếp câu chuyện: 'Giờ ra chơi hôm ấy, sân trường bỗng rộn lên vì một chú chim nhỏ...'", hint: "Gợi ý: Chú chim xuất hiện thế nào -> các bạn làm gì -> câu chuyện kết thúc ra sao." },
        ],
        'tv4-mieu-ta': [
            { text: "Viết đoạn văn tả cây bàng mát trong sân trường.", hint: "Gợi ý: Tên cây -> thân, lá, bóng mát -> ích lợi -> tình cảm của em." },
            { text: "Tả một con vật quen thuộc mà em yêu thích.", hint: "Gợi ý: Con vật gì -> hình dáng -> hoạt động nổi bật -> vì sao em yêu thích." },
            { text: "Tả một đồ dùng học tập gắn bó với em.", hint: "Gợi ý: Hình dáng, màu sắc -> công dụng -> cách em giữ gìn." },
        ],
        'tv5-tap-lam-van': [
            { text: "Tả cảnh buổi sáng trên đường em đến trường.", hint: "Gợi ý: Thời gian -> cảnh vật -> con người -> cảm xúc của em." },
            { text: "Kể lại một việc tốt em đã làm khiến người khác vui.", hint: "Gợi ý: Sự việc xảy ra khi nào -> em đã làm gì -> kết quả ra sao -> bài học em rút ra." },
            { text: "Tả một người bạn thân của em.", hint: "Gợi ý: Ngoại hình -> tính cách -> kỷ niệm đáng nhớ -> tình cảm của em." },
        ],
        'tv5-van-nghi-luan': [
            { text: "Viết đoạn văn nêu ý kiến: Vì sao học sinh cần tự giác học bài?", hint: "Gợi ý: Nêu ý kiến -> 2 lý do -> kết lại bằng điều em muốn thực hiện." },
            { text: "Viết đoạn văn nêu ý kiến: Vì sao cần giữ gìn vệ sinh trường lớp?", hint: "Gợi ý: Nêu ý kiến -> lợi ích -> việc học sinh nên làm." },
            { text: "Viết đoạn văn nêu ý kiến: Đọc sách mỗi ngày có ích gì?", hint: "Gợi ý: Nêu ý kiến -> lợi ích 1, lợi ích 2 -> lời khuyên." },
        ],
    };
    const pool = prompts[skillId] || prompts['tv2-ke-chuyen'];
    const item = getRandom(pool);
    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: 'speaking',
        instruction: skillId === 'tv2-ta-nguoi' ? 'Bài tập tả người:' : skillId === 'tv3-sang-tao' ? 'Viết sáng tạo:' : 'Kể chuyện:',
        text: item.text,
        answer: 'Bài viết tự do',
        hint: item.hint
    });
}

function generateLetterWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viết một bức thư ngắn gửi bạn thân, kể về kỳ nghỉ hè của bé.", hint: "Gợi ý: Phần đầu thư (gửi ai) -> Nội dung (đi đâu, chơi gì) -> Kết thư (chúc bạn)." },
        { text: "Viết thư cho ông/bà ở quê, hỏi thăm sức khỏe.", hint: "Gợi ý: Kính gửi... -> Hỏi thăm -> Kể chuyện học -> Hứa về thăm." },
        { text: "Viết đơn xin phép nghỉ học 1 ngày vì bị ốm.", hint: "Gợi ý: Kính gửi cô giáo -> Em tên... lớp... -> Lý do -> Kính mong cô cho phép." },
    ];
    const item = getRandom(prompts);
    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId: 'tv3-viet-thu',
        type: 'speaking',
        instruction: 'Viết thư & Viết đơn:',
        text: item.text,
        answer: 'Bài viết tự do',
        hint: item.hint
    });
}

function generateReportWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viết báo cáo ngắn về buổi sinh hoạt lớp tuần này.", hint: "Gợi ý: Ngày... lớp... họp -> Nội dung chính -> Quyết định/ kế hoạch." },
        { text: "Viết báo cáo về hoạt động trồng cây xanh của lớp.", hint: "Gợi ý: Thời gian -> Địa điểm -> Ai tham gia -> Kết quả -> Cảm nghĩ." },
        { text: "Viết báo cáo kết quả học tập của bé trong tháng.", hint: "Gợi ý: Tên bé -> Môn nào giỏi -> Môn nào cần cố gắng -> Kế hoạch tháng sau." },
    ];
    const item = getRandom(prompts);
    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId: 'tv3-bao-cao',
        type: 'speaking',
        instruction: 'Viết báo cáo ngắn:',
        text: item.text,
        answer: 'Bài viết tự do',
        hint: item.hint
    });
}

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

const EXTRA_SPEAKING_TOPICS_L1 = [
    {
        topic: "Kể về một buổi đi chơi cùng gia đình mà con nhớ nhất.",
        hint: "Dàn ý:\n1. Mở bài: Con đi đâu, đi với ai.\n2. Thân bài: Những việc vui con đã làm.\n3. Kết bài: Điều con thích nhất trong chuyến đi."
    },
    {
        topic: "Giới thiệu về góc học tập của con.",
        hint: "Dàn ý:\n1. Mở bài: Góc học tập ở đâu.\n2. Thân bài: Có những đồ vật gì, con dùng thế nào.\n3. Kết bài: Vì sao con yêu góc học tập đó."
    },
    {
        topic: "Kể về một người bạn tốt của con.",
        hint: "Dàn ý:\n1. Mở bài: Bạn tên gì, học cùng lớp nào.\n2. Thân bài: Bạn có điểm gì đáng quý, hai bạn thường làm gì cùng nhau.\n3. Kết bài: Con quý bạn ra sao."
    },
    {
        topic: "Con thích mùa nào nhất trong năm? Hãy nói lý do.",
        hint: "Dàn ý:\n1. Mở bài: Con thích mùa nào.\n2. Thân bài: Thời tiết, cảnh vật và hoạt động con yêu thích trong mùa đó.\n3. Kết bài: Cảm xúc của con."
    },
];

const EXTRA_SPEAKING_TOPICS_L2 = [
    {
        topic: "Theo con, vì sao chúng ta cần chăm chỉ đọc sách?",
        hint: "Dàn ý:\n1. Mở bài: Nêu ý kiến của con.\n2. Thân bài: Ít nhất 2 lợi ích của việc đọc sách.\n3. Kết bài: Lời khuyên dành cho các bạn."
    },
    {
        topic: "Nếu được làm lớp trưởng một ngày, con sẽ làm gì?",
        hint: "Dàn ý:\n1. Mở bài: Con sẽ nhận nhiệm vụ gì.\n2. Thân bài: 2-3 việc con muốn làm cho lớp tốt hơn.\n3. Kết bài: Điều con mong muốn nhất."
    },
    {
        topic: "Con nghĩ học sinh có nên tự dọn góc học tập của mình không? Vì sao?",
        hint: "Dàn ý:\n1. Mở bài: Trả lời có hay không.\n2. Thân bài: 2 lý do bảo vệ ý kiến.\n3. Kết bài: Thói quen tốt con muốn giữ."
    },
    {
        topic: "Giới thiệu một việc tốt mà con từng làm để giúp người khác.",
        hint: "Dàn ý:\n1. Mở bài: Việc tốt đó là gì.\n2. Thân bài: Con đã làm thế nào, người được giúp cảm thấy ra sao.\n3. Kết bài: Bài học con nhận được."
    },
    {
        topic: "Theo con, vì sao chúng ta cần giữ gìn sách vở và đồ dùng học tập?",
        hint: "Dàn ý:\n1. Mở bài: Nêu ý kiến của con.\n2. Thân bài: 2 lí do nên giữ gìn sách vở, đồ dùng.\n3. Kết bài: Việc con sẽ làm hằng ngày."
    },
];

const EXTRA_SPEAKING_TOPICS_L3 = [
    {
        topic: "Theo con, học đúng giờ và làm bài đầy đủ có lợi gì cho học sinh?",
        hint: "Dàn ý:\n1. Mở bài: Nêu ý kiến của con.\n2. Thân bài: 2 lợi ích của việc học đúng giờ, làm bài đầy đủ.\n3. Kết bài: Điều con muốn rèn luyện."
    },
    {
        topic: "Con đồng ý hay không với ý kiến: 'Giữ lời hứa là điều rất quan trọng'?",
        hint: "Dàn ý:\n1. Mở bài: Nêu ý kiến đồng ý hay không.\n2. Thân bài: 2 lí do hoặc ví dụ gần gũi.\n3. Kết bài: Bài học con rút ra."
    },
    {
        topic: "Theo con, học sinh nên làm gì để lớp học luôn sạch đẹp?",
        hint: "Dàn ý:\n1. Mở bài: Nêu vấn đề.\n2. Thân bài: Kể 2 hoặc 3 việc học sinh nên làm.\n3. Kết bài: Lời nhắn của con với các bạn."
    },
    {
        topic: "Nếu được góp ý cho lớp mình tiến bộ hơn, con sẽ đề xuất điều gì?",
        hint: "Dàn ý:\n1. Mở bài: Điều con muốn góp ý.\n2. Thân bài: Vì sao cần làm như vậy và lợi ích mang lại.\n3. Kết bài: Mong muốn của con."
    },
];

const SPEAKING_PROMPTS_BY_SKILL: Record<string, { instruction: string; prompts: { topic: string; hint: string }[] }> = {
    'tv2-noi-nghe': {
        instruction: 'Bé hãy kể lại rõ ràng, đầy đủ về nội dung sau:',
        prompts: [
            { topic: "Kể lại một việc em đã làm sau giờ học.", hint: "Dàn ý:\n1. Em làm việc đó khi nào.\n2. Em đã làm những gì.\n3. Em thấy việc đó có ích ra sao." },
            { topic: "Kể lại buổi sáng em chuẩn bị đi học.", hint: "Dàn ý:\n1. Em thức dậy lúc nào.\n2. Em làm những việc gì trước khi đến trường.\n3. Tâm trạng của em khi đi học." },
            { topic: "Kể lại một lần em giúp đỡ người thân.", hint: "Dàn ý:\n1. Em đã giúp ai.\n2. Em giúp việc gì.\n3. Mọi người cảm thấy thế nào." },
        ],
    },
    'tv2-thuyet-trinh': {
        instruction: 'Bé hãy giới thiệu ngắn gọn, rõ ràng về nội dung sau:',
        prompts: [
            { topic: "Giới thiệu một quyển sách hoặc bài đọc em thích trong lớp.", hint: "Dàn ý:\n1. Tên sách hoặc bài đọc là gì.\n2. Nội dung chính nói về điều gì.\n3. Vì sao em thích." },
            { topic: "Giới thiệu chiếc cặp hoặc hộp bút của em.", hint: "Dàn ý:\n1. Đồ vật đó tên là gì.\n2. Hình dáng, màu sắc ra sao.\n3. Công dụng và cách em giữ gìn." },
            { topic: "Giới thiệu góc học tập của em.", hint: "Dàn ý:\n1. Góc học tập ở đâu.\n2. Có những đồ dùng gì.\n3. Vì sao em thích góc học tập đó." },
        ],
    },
    'tv3-thao-luan': {
        instruction: 'Bé hãy nêu ý kiến và giải thích ngắn gọn về nội dung sau:',
        prompts: [
            { topic: "Theo em, học sinh có nên xếp hàng và giữ trật tự khi ra vào lớp không?", hint: "Dàn ý:\n1. Trả lời có hay không.\n2. Nêu 2 lý do.\n3. Điều em sẽ thực hiện." },
            { topic: "Theo em, vì sao chúng ta cần giữ vệ sinh lớp học?", hint: "Dàn ý:\n1. Nêu ý kiến.\n2. Kể 2 việc nên làm để giữ vệ sinh.\n3. Lời nhắn với các bạn." },
            { topic: "Theo em, đọc sách mỗi ngày có ích gì?", hint: "Dàn ý:\n1. Nêu ý kiến.\n2. Kể 2 lợi ích của việc đọc sách.\n3. Thói quen em muốn duy trì." },
        ],
    },
    'tv3-hung-bien': {
        instruction: 'Bé hãy trình bày ý kiến ngắn gọn, rõ ràng về nội dung sau:',
        prompts: [
            { topic: "Theo em, học sinh có nên tự giác làm bài tập ở nhà không? Vì sao?", hint: "Dàn ý:\n1. Nêu ý kiến đồng ý hay không.\n2. Trình bày 2 lý do gần gũi.\n3. Điều em sẽ cố gắng thực hiện." },
            { topic: "Theo em, giữ lời hứa với bạn bè và người thân có quan trọng không?", hint: "Dàn ý:\n1. Nêu ý kiến của em.\n2. Đưa ra 2 lý do hoặc ví dụ đơn giản.\n3. Bài học em rút ra." },
            { topic: "Theo em, học sinh nên làm gì để trường lớp sạch đẹp hơn?", hint: "Dàn ý:\n1. Nêu vấn đề.\n2. Trình bày 2 hoặc 3 việc nên làm.\n3. Lời kêu gọi các bạn cùng thực hiện." },
        ],
    },
};

export const generateSpeakingQuestion = (skillId: string, level: number = 1): Question => {

    // Đọc diễn cảm: chọn ngẫu nhiên đoạn thơ/văn
    if (skillId.includes('doc-dien-cam')) {
        const readingPool = [...EXPRESSIVE_READING_PASSAGES, ...EXTRA_EXPRESSIVE_READING_PASSAGES];
        const passage = getRandom(readingPool);
        return QuestionFactory.create({
            subjectId: 'vietnamese',
            skillId,
            type: 'reading',
            instruction: passage.instruction,
            text: passage.text,
            answer: "Đã đọc"
        });
    }

    const skillPromptConfig = SPEAKING_PROMPTS_BY_SKILL[skillId];

    if (skillPromptConfig) {
        const selectedPrompt = getRandom(skillPromptConfig.prompts);
        return QuestionFactory.create({
            subjectId: 'vietnamese',
            skillId,
            type: 'speaking',
            instruction: skillPromptConfig.instruction,
            text: selectedPrompt.topic,
            hint: selectedPrompt.hint,
            answer: "Đã nói"
        });
    }

    // Hùng biện / Nói: đề tài theo level
    const pool = level <= 1
        ? [...SPEAKING_TOPICS_L1, ...EXTRA_SPEAKING_TOPICS_L1]
        : level <= 2
            ? [...SPEAKING_TOPICS_L1, ...EXTRA_SPEAKING_TOPICS_L1, ...SPEAKING_TOPICS_L2, ...EXTRA_SPEAKING_TOPICS_L2]
            : [
                ...SPEAKING_TOPICS_L1,
                ...EXTRA_SPEAKING_TOPICS_L1,
                ...SPEAKING_TOPICS_L2,
                ...EXTRA_SPEAKING_TOPICS_L2,
                ...SPEAKING_TOPICS_L3,
                ...EXTRA_SPEAKING_TOPICS_L3
            ];
    const selectedTopic = getRandom(pool);

    return QuestionFactory.create({
        subjectId: 'vietnamese',
        skillId,
        type: 'speaking',
        instruction: 'Bé hãy suy nghĩ dàn ý và hùng biện về chủ đề sau:',
        text: selectedTopic.topic,
        hint: selectedTopic.hint,
        answer: "Đã nói"
    });
}
