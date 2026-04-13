�
import { Question } from '../types';

// Helper for random selection
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- DATA SOURCE ---

// === Đ�RC HI�U (Expanded � 8 passages, level-tiered) ===
const READING_PASSAGES_L1 = [
    {
        text: "Mẹ �m, bé chẳng �i �âu.\nViên bi người rủ, khế chua người mời.\nMẹ cười: 'Con �x nhà chơi'\nNhưng con vẫn thấy mẹ cười kém tươi.",
        questions: [
            { q: "Khi mẹ �m, bé �ã làm gì?", options: ["�~ nhà v�:i mẹ", "Đi chơi bi", "Đi Ēn khế chua"], a: "�~ nhà v�:i mẹ" },
            { q: "Mẹ bảo bé �i �âu?", options: ["Đi chơi", "Đi học", "Đi ngủ"], a: "Đi chơi" },
            { q: "Bài thơ nói về tình cảm của ai?", options: ["Bé thương mẹ", "Mẹ thương bé", "Cả hai �ều �úng"], a: "Cả hai �ều �úng" }
        ]
    },
    {
        text: "Sáng s�:m, biỒn thật là �ẹp. Những con sóng trắng xóa xô vào bãi cát vàng. �ng mặt trời �ỏ rực từ từ nhô lên khỏi mặt biỒn.",
        questions: [
            { q: "Bài vĒn tả cảnh gì?", options: ["Cảnh biỒn bu�"i sáng", "Cảnh núi rừng", "Cảnh thành ph�"], a: "Cảnh biỒn bu�"i sáng" },
            { q: "Sóng biỒn có màu gì?", options: ["Trắng xóa", "Xanh biếc", "Đỏ rực"], a: "Trắng xóa" },
            { q: "�ng mặt trời �ược miêu tả như thế nào?", options: ["Đỏ rực", "Vàng óng", "Trắng tinh"], a: "Đỏ rực" }
        ]
    },
    {
        text: "Bé Lan rất thích �i học. M�i sáng, bé dậy s�:m, �ánh rĒng rửa mặt r�i Ēn sáng. Mẹ �ưa bé �ến trường. �~ trường, bé �ược học nhiều �iều m�:i.",
        questions: [
            { q: "Bé Lan thích làm gì?", options: ["Đi học", "Đi chơi", "Ngủ nư�:ng"], a: "Đi học" },
            { q: "Ai �ưa bé �ến trường?", options: ["Mẹ", "B�", "�ng"], a: "Mẹ" },
            { q: "M�i sáng bé làm gì �ầu tiên?", options: ["Dậy s�:m", "�n sáng", "Đi học"], a: "Dậy s�:m" }
        ]
    },
    {
        text: "Nhà bà ngoại có m�"t con mèo. Mèo có b�" lông trắng mu�t. Mèo thích nằm sư�xi nắng trư�:c hiên nhà. Bé rất thích ôm mèo ngủ.",
        questions: [
            { q: "Con mèo có b�" lông màu gì?", options: ["Trắng mu�t", "Đen tuyền", "Vàng mượt"], a: "Trắng mu�t" },
            { q: "Mèo thích làm gì?", options: ["Nằm sư�xi nắng", "Bắt chu�"t", "Nhảy múa"], a: "Nằm sư�xi nắng" },
            { q: "Mèo �x �âu?", options: ["Nhà bà ngoại", "Nhà hàng xóm", "Cửa hàng"], a: "Nhà bà ngoại" }
        ]
    }
];

const READING_PASSAGES_L2 = [
    {
        text: "Mùa thu, trời trong xanh. Từng �àn chim bay về phương nam. Lá vàng rơi nhẹ nhàng trên con �ường nhỏ. Bu�"i chiều, ánh nắng vàng chiếu qua khe lá, �ẹp như tranh vẽ.",
        questions: [
            { q: "Mùa thu trời như thế nào?", options: ["Trong xanh", "Mây �en", "Nóng bức"], a: "Trong xanh" },
            { q: "Chim bay về �âu?", options: ["Phương nam", "Phương bắc", "Phương �ông"], a: "Phương nam" },
            { q: "Tác giả so sánh cảnh �ẹp v�:i gì?", options: ["Tranh vẽ", "Giấc mơ", "Câu chuy�!n"], a: "Tranh vẽ" },
            { q: "Lá có màu gì?", options: ["Vàng", "Xanh", "Đỏ"], a: "Vàng" }
        ]
    },
    {
        text: "Bác nông dân cần cù làm vi�!c trên cánh ��ng. Từ sáng s�:m, bác �ã ra ��ng cấy lúa. Trời nắng nóng nhưng bác vẫn kiên trì. Nhờ sự chĒm ch�0, mùa gặt lúa chín vàng cả cánh ��ng.",
        questions: [
            { q: "Bác nông dân làm gì trên ��ng?", options: ["Cấy lúa", "Hái quả", "ChĒn trâu"], a: "Cấy lúa" },
            { q: "Tính cách của bác nông dân là gì?", options: ["Cần cù, kiên trì", "Lười biếng", "V�"i vàng"], a: "Cần cù, kiên trì" },
            { q: "Kết quả công vi�!c là gì?", options: ["Lúa chín vàng", "Lúa b�9 hỏng", "Không có gì"], a: "Lúa chín vàng" },
            { q: "Bác ra ��ng lúc nào?", options: ["Sáng s�:m", "Bu�"i trưa", "Bu�"i t�i"], a: "Sáng s�:m" }
        ]
    }
];

const READING_PASSAGES_L3 = [
    {
        text: "Ngày xưa, có m�"t chàng tiều phu nghèo nhưng thật thà. M�"t hôm, chàng lỡ �ánh rơi chiếc rìu xu�ng sông. �ng Bụt hi�!n lên và hỏi: 'Có phải rìu vàng này của con không?' Chàng �áp: 'Không, rìu của con bằng sắt thôi.' �ng Bụt khen chàng thật thà và tặng cả ba chiếc rìu.",
        questions: [
            { q: "Chàng tiều phu có tính cách gì?", options: ["Thật thà", "Gian d�i", "Kiêu ngạo"], a: "Thật thà" },
            { q: "Chàng �ánh rơi gì xu�ng sông?", options: ["Chiếc rìu", "Con dao", "Chiếc búa"], a: "Chiếc rìu" },
            { q: "�ng Bụt tặng chàng bao nhiêu rìu?", options: ["Ba chiếc", "M�"t chiếc", "Hai chiếc"], a: "Ba chiếc" },
            { q: "Bài học từ câu chuy�!n là gì?", options: ["Phải thật thà", "Phải giàu có", "Phải nhanh nhẹn"], a: "Phải thật thà" }
        ]
    },
    {
        text: "Vi�!t Nam có nhiều l�& h�"i truyền th�ng. Tết Nguyên Đán là l�& h�"i l�:n nhất trong nĒm. Mọi người dọn dẹp nhà cửa, nấu bánh chưng, trang trí hoa mai hoa �ào. Trẻ em �ược mặc quần áo m�:i và nhận lì xì từ người l�:n. Tết là d�9p �Ồ gia �ình sum họp.",
        questions: [
            { q: "L�& h�"i l�:n nhất trong nĒm là gì?", options: ["Tết Nguyên Đán", "Trung thu", "Giáng sinh"], a: "Tết Nguyên Đán" },
            { q: "Mọi người nấu gì ngày Tết?", options: ["Bánh chưng", "Bánh mì", "Ph�x"], a: "Bánh chưng" },
            { q: "Trẻ em nhận gì từ người l�:n?", options: ["Lì xì", "Quà sinh nhật", "Kẹo"], a: "Lì xì" },
            { q: "Tết là d�9p �Ồ làm gì?", options: ["Gia �ình sum họp", "Đi du l�9ch xa", "Làm vi�!c nhiều"], a: "Gia �ình sum họp" }
        ]
    }
];

// === TỪ VỰNG (Expanded � 24 pairs, level-tiered) ===
const VOCAB_L1 = [
    { type: 'synonym', word: "siêng nĒng", options: ["chĒm ch�0", "lười biếng", "thông minh"], a: "chĒm ch�0" },
    { type: 'synonym', word: "xinh �ẹp", options: ["tươi tắn", "xấu xí", "giỏi giang"], a: "tươi tắn" },
    { type: 'synonym', word: "bé nhỏ", options: ["nhỏ xíu", "to l�:n", "cao cao"], a: "nhỏ xíu" },
    { type: 'synonym', word: "vui vẻ", options: ["h�:n h�x", "bu�n bã", "tức giận"], a: "h�:n h�x" },
    { type: 'antonym', word: "nhanh", options: ["chậm", "v�"i", "mau"], a: "chậm" },
    { type: 'antonym', word: "�en", options: ["trắng", "t�i", "sáng"], a: "trắng" },
    { type: 'antonym', word: "bu�n", options: ["vui", "khóc", "sầu"], a: "vui" },
    { type: 'antonym', word: "to", options: ["nhỏ", "l�:n", "cao"], a: "nhỏ" }
];

const VOCAB_L2 = [
    { type: 'synonym', word: "dũng cảm", options: ["gan dạ", "nhút nhát", "hiền lành"], a: "gan dạ" },
    { type: 'synonym', word: "thông minh", options: ["sáng dạ", "ngu d�t", "chậm chạp"], a: "sáng dạ" },
    { type: 'synonym', word: "yên lặng", options: ["im lìm", "�n ào", "vang vọng"], a: "im lìm" },
    { type: 'synonym', word: "giúp �ỡ", options: ["h� trợ", "phá phách", "lơ là"], a: "h� trợ" },
    { type: 'antonym', word: "giàu", options: ["nghèo", "sang", "�ẹp"], a: "nghèo" },
    { type: 'antonym', word: "�úng", options: ["sai", "phải", "hay"], a: "sai" },
    { type: 'antonym', word: "khỏe", options: ["yếu", "mạnh", "nhanh"], a: "yếu" },
    { type: 'antonym', word: "nóng", options: ["lạnh", "ấm", "mát"], a: "lạnh" }
];

const VOCAB_L3 = [
    { type: 'synonym', word: "kiên trì", options: ["bền b�0", "bỏ cu�"c", "v�"i vàng"], a: "bền b�0" },
    { type: 'synonym', word: "hào phóng", options: ["r�"ng rãi", "keo ki�!t", "nghiêm túc"], a: "r�"ng rãi" },
    { type: 'synonym', word: "uy nghi", options: ["oai phong", "nhỏ bé", "hiền hòa"], a: "oai phong" },
    { type: 'synonym', word: "tinh khiết", options: ["trong sạch", "bẩn th�0u", "xám x�9t"], a: "trong sạch" },
    { type: 'antonym', word: "cẩn thận", options: ["bất cẩn", "t�0 m�0", "cần mẫn"], a: "bất cẩn" },
    { type: 'antonym', word: "khiêm t�n", options: ["kiêu ngạo", "giản d�9", "l�9ch sự"], a: "kiêu ngạo" },
    { type: 'antonym', word: "tiết ki�!m", options: ["lãng phí", "chắt chiu", "dành dụm"], a: "lãng phí" },
    { type: 'antonym', word: "�oàn kết", options: ["chia rẽ", "gắn bó", "hợp tác"], a: "chia rẽ" }
];

// === DẤU C�U (cho tv2-dau-cau) ===
const PUNCTUATION_L1 = [
    { text: "Điền dấu câu: 'Em �i học'", options: ["Em �i học.", "Em �i học?", "Em �i học!"], answer: "Em �i học.", explain: "Câu kỒ dùng dấu chấm." },
    { text: "Điền dấu câu: 'Bạn tên là gì'", options: ["Bạn tên là gì?", "Bạn tên là gì.", "Bạn tên là gì!"], answer: "Bạn tên là gì?", explain: "Câu hỏi dùng dấu chấm hỏi." },
    { text: "Điền dấu câu: '�i �ẹp quá'", options: ["�i, �ẹp quá!", "�i �ẹp quá.", "�i �ẹp quá?"], answer: "�i, �ẹp quá!", explain: "Câu cảm thán dùng dấu chấm than." },
    { text: "Dấu nào �úng cho cu�i câu kỒ?", options: ["Dấu chấm (.)", "Dấu chấm hỏi (?)", "Dấu chấm than (!)"], answer: "Dấu chấm (.)", explain: "Câu kỒ kết thúc bằng dấu chấm." },
];

const PUNCTUATION_L2 = [
    { text: "Câu nào dùng �úng dấu phẩy?", options: ["Hôm nay, trời rất �ẹp.", "Hôm, nay trời rất �ẹp.", "Hôm nay trời, rất �ẹp."], answer: "Hôm nay, trời rất �ẹp.", explain: "Dấu phẩy ngĒn cách trạng ngữ v�:i nòng c�t câu." },
    { text: "Đặt dấu câu �úng: 'Mẹ ơi con �ói quá'", options: ["Mẹ ơi, con �ói quá!", "Mẹ ơi con �ói quá.", "Mẹ, ơi con �ói quá?"], answer: "Mẹ ơi, con �ói quá!", explain: "Dấu phẩy sau lời gọi, dấu chấm than cho câu cảm thán." },
    { text: "Câu 'Con có khỏe không' cần dấu gì �x cu�i?", options: ["Dấu chấm hỏi (?)", "Dấu chấm (.)", "Dấu chấm than (!)"], answer: "Dấu chấm hỏi (?)", explain: "Đây là câu hỏi." },
    { text: "Dấu phẩy dùng �Ồ làm gì?", options: ["NgĒn cách các b�" phận câu", "Kết thúc câu", "Đặt câu hỏi"], answer: "NgĒn cách các b�" phận câu", explain: "Dấu phẩy ngĒn cách các thành phần trong câu." },
];

const PUNCTUATION_L3 = [
    { text: "i�n d�u c�u: 'Lan h�i B�n i �u �y'", options: ["Lan h�i: \"B�n i �u �y?\"", "Lan h�i: B�n i �u �y.", "Lan h�i, B�n i �u �y!"], answer: "Lan h�i: \"B�n i �u �y?\"", explain: "D�ng d�u hai ch�m v� ngo�c k�p cho l�i n�i tr�c ti�p." },
    { text: "C�u n�o d�ng d�u hai ch�m �ng?", options: ["M� b�o: \"Con n c�m i.\"", "M�: b�o con n c�m i.", "M� b�o con: n c�m i."], answer: "M� b�o: \"Con n c�m i.\"", explain: "D�u hai ch�m �t tr��c l�i n�i tr�c ti�p." },
    { text: "Khi li�!t kê nhiều thứ, bé dùng dấu gì �Ồ ngĒn cách?", options: ["Dấu phẩy", "Dấu chấm", "Dấu hai chấm"], answer: "Dấu phẩy", explain: "Dấu phẩy ngĒn cách các từ trong chu�i li�!t kê." },
    { text: "Đặt dấu câu �úng: 'Em tên là gì'", options: ["Em tên là gì?", "Em tên là gì.", "Em tên là gì!"], answer: "Em tên là gì?", explain: "Đây là câu hỏi nên dùng dấu chấm hỏi." },
];

// === VIẾT / NGỮ PHÁP (Expanded � level-tiered) ===
const WRITING_L1 = [
    { text: "Điền từ còn thiếu: 'U�ng nư�:c nh�: ...'", answer: "ngu�n", type: "input" as const },
    { text: "Điền từ còn thiếu: '�n quả nh�: kẻ ... cây'", answer: "tr�ng", type: "input" as const },
    { text: "Điền từ: 'Có công mài sắt, có ngày nên ...'", answer: "kim", type: "input" as const },
    { text: "Điền từ: 'T�t g� hơn t�t ...'", answer: "nư�:c sơn", type: "input" as const },
];

const WRITING_L2 = [
    { text: "Câu 'Bé �ang học bài.' thu�"c kiỒu câu gì?", options: ["Câu nêu hoạt ��"ng", "Câu gi�:i thi�!u", "Câu nêu �ặc �iỒm"], answer: "Câu nêu hoạt ��"ng", type: "mcq" as const },
    { text: "Câu 'Mái tóc bà bạc phơ.' thu�"c kiỒu câu gì?", options: ["Câu nêu �ặc �iỒm", "Câu nêu hoạt ��"ng", "Câu gi�:i thi�!u"], answer: "Câu nêu �ặc �iỒm", type: "mcq" as const },
    { text: "Câu 'Đây là bạn Lan.' thu�"c kiỒu câu gì?", options: ["Câu gi�:i thi�!u", "Câu nêu hoạt ��"ng", "Câu nêu �ặc �iỒm"], answer: "Câu gi�:i thi�!u", type: "mcq" as const },
    { text: "Từ nào là danh từ? 'Bé chạy nhanh trên sân trường.'", options: ["sân trường", "chạy", "nhanh"], answer: "sân trường", type: "mcq" as const },
    { text: "Từ nào là ��"ng từ? 'Các bạn �ang hát rất hay.'", options: ["hát", "bạn", "hay"], answer: "hát", type: "mcq" as const },
];

const WRITING_L3 = [
    { text: "Từ nào là tính từ? 'Bông hoa �ỏ thắm n�x trong vườn.'", options: ["�ỏ thắm", "bông hoa", "n�x"], answer: "�ỏ thắm", type: "mcq" as const },
    { text: "Điền quan h�! từ: 'Trời mưa ... em vẫn �i học.'", options: ["nhưng", "và", "vì"], answer: "nhưng", type: "mcq" as const },
    { text: "Tìm chủ ngữ trong câu: 'Con mèo �ang ngủ trưa.'", answer: "Con mèo", type: "input" as const },
    { text: "Tìm v�9 ngữ trong câu: 'Bé Lan chạy rất nhanh.'", answer: "chạy rất nhanh", type: "input" as const },
    { text: "Câu 'Mẹ rất vui vì con ngoan.' có mấy vế?", options: ["2 vế", "1 vế", "3 vế"], answer: "2 vế", type: "mcq" as const },
    { text: "Trong câu 'Em yêu mẹ.', từ nào là chủ ngữ?", options: ["Em", "yêu", "mẹ"], answer: "Em", type: "mcq" as const },
];

// --- Đ�RC DI�N CẢM DATA (Thơ & VĒn cho L�:p 2-3) ---
const EXPRESSIVE_READING_PASSAGES = [
    // === THƠ ===
    {
        title: "Mẹ �m", author: "Trần ĐĒng Khoa", type: "thơ" as const,
        text: "Mọi hôm mẹ thích vui cười\nMà sao hôm nay mẹ ng�i im re\nLá trầu khô giữa cơi trề\nTruy�!n Kiều gấp lại trên bề bàn con.",
        instruction: 'Doc dien cam bai tho Me om'
    },
    {
        title: "Quạt cho bà ngủ", author: "Thạch Quỳ", type: "thơ" as const,
        text: "Ơi chích chòe ơi\nChim �ừng hót nữa\nBà em �m r�i\nLặng cho bà ngủ.\n\nHoa cam hoa khế\nNgoài vườn rụng nhiều\nBư�:m bay lặng lẽ\nVàng trong nắng chiều.",
        instruction: 'Doc dien cam bai tho Quat cho ba ngu'
    },
    {
        title: "Tháp Mười �ẹp nhất bông sen", author: "Ca dao", type: "thơ" as const,
        text: "Tháp Mười �ẹp nhất bông sen\nVi�!t Nam �ẹp nhất có tên Bác H�.",
        instruction: 'Doc dien cam cau ca dao'
    },
    {
        title: "Bạn �ến chơi nhà", author: "Nguy�&n Khuyến", type: "thơ" as const,
        text: "Đã bấy lâu nay bác t�:i nhà\nTrẻ thời �i vắng, chợ thời xa\nAo sâu nư�:c cả, khôn chài cá\nVườn r�"ng rào thưa, khó �u�"i gà.",
        instruction: 'Doc dien cam doan tho Ban den choi nha'
    },
    {
        title: "Cảnh khuya", author: "H� Chí Minh", type: "thơ" as const,
        text: "Tiếng su�i trong như tiếng hát xa\nTrĒng l�ng c�" thụ bóng l�ng hoa\nCảnh khuya như vẽ người chưa ngủ\nChưa ngủ vì lo n�i nư�:c nhà.",
        instruction: 'Doc dien cam bai tho Canh khuya'
    },
    {
        title: "Lượm", author: "T� Hữu", type: "thơ" as const,
        text: "Chú bé loắt choắt\nCái xắc xinh xinh\nCái chân thoĒn thoắt\nCái �ầu nghênh nghênh\n\nCa-lô ��"i l�!ch\nM�m huýt sáo vang\nNhư con chim chích\nNhảy trên �ường vàng.",
        instruction: 'Doc dien cam doan tho Luom'
    },
    {
        title: "Con cò", author: "Ca dao", type: "thơ" as const,
        text: "Con cò mà �i Ēn �êm\nĐậu phải cành mềm l�"n c�" xu�ng ao\n�ng ơi ông v�:t tôi nao\nTôi có lòng nào ông hãy xáo mĒng.",
        instruction: 'Doc dien cam bai ca dao'
    },
    {
        title: "Hạt gạo làng ta", author: "Trần ĐĒng Khoa", type: "thơ" as const,
        text: "Hạt gạo làng ta\nCó v�9 phù sa\nCủa sông Kinh Thầy\nCó hương sen thơm\nTrong h� nư�:c �ầy\nCó lời mẹ hát\nNgọt bùi �ắng cay.",
        instruction: 'Doc dien cam bai tho Hat gao lang ta'
    },
    // === V�N XU�I ===
    {
        title: "Trường em", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Sáng nay, trường em thật �ẹp. Sân trường sạch sẽ, lá cờ �ỏ tung bay trong gió. Các bạn nhỏ chạy nhảy vui vẻ dư�:i hàng cây xanh mát. Tiếng tr�ng trường vang lên, em v�"i bư�:c vào l�:p.",
        instruction: "�x Đọc di�&n cảm �oạn vĒn"
    },
    {
        title: "Mùa xuân �ến", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Mùa xuân �ến, cây c�i �ua nhau n�x hoa. Hoa mai vàng rực rỡ, hoa �ào h�ng phấn. Chim chóc hót líu lo trên cành. Không khí thật trong lành. Em yêu mùa xuân biết bao!",
        instruction: "�x Đọc di�&n cảm �oạn vĒn"
    },
    {
        title: "Bà em", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Bà em nĒm nay �ã già. Tóc bà bạc trắng. Bà hay kỒ chuy�!n c�" tích cho em nghe. Giọng bà ấm áp, nhẹ nhàng. Em rất yêu bà.",
        instruction: "�x Đọc di�&n cảm �oạn vĒn"
    },
    {
        title: "Cánh ��ng quê", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Bu�"i s�:m, cánh ��ng lúa chín vàng óng. Gió th�"i nhẹ, từng �ợt sóng lúa chạy dài tít tắp. Mấy chú cò trắng thong thả bay lượn trên cánh ��ng. Xa xa, những nóc nhà tranh nhỏ xíu nằm lấp ló sau lũy tre xanh.",
        instruction: "�x Đọc di�&n cảm �oạn vĒn"
    },
];

const POEM_PASSAGES_L1 = [
    {
        text: "Bé quét nhà giúp mẹ\nSân sạch bóng nắng vàng\nMẹ nhìn em m�0m cười\nKhen em ngoan, chĒm ch�0.",
        questions: [
            { q: "Bạn nhỏ �ã làm gì?", options: ["Quét nhà giúp mẹ", "Đi chơi cùng bạn", "Tư�:i cây ngoài sân"], a: "Quét nhà giúp mẹ" },
            { q: "Mẹ �ã làm gì khi nhìn thấy em?", options: ["M�0m cười khen em", "Bảo em �i ngủ", "Đưa em �ến trường"], a: "M�0m cười khen em" },
            { q: "Bài thơ khen bạn nhỏ �iều gì?", options: ["Ngoan và chĒm ch�0", "Chạy nhanh", "Hát hay"], a: "Ngoan và chĒm ch�0" }
        ]
    },
    {
        text: "Mưa rơi tí tách ngoài hiên\nCây cau gật gù trong mưa\nSân nhà mát d�9u ban trưa\nEm ng�i ngắm giọt nư�:c �ưa nhẹ nhàng.",
        questions: [
            { q: "Mưa rơi �x �âu?", options: ["Ngoài hiên", "Trong l�:p học", "Trên cánh ��ng"], a: "Ngoài hiên" },
            { q: "Cây cau �ược tả như thế nào?", options: ["Gật gù trong mưa", "Khô héo", "Đ�" xu�ng �ất"], a: "Gật gù trong mưa" },
            { q: "Em nhỏ �ang làm gì?", options: ["Ng�i ngắm mưa", "Đu�"i bắt bư�:m", "Đọc sách trong l�:p"], a: "Ng�i ngắm mưa" }
        ]
    },
    {
        text: "Sáng sân trường nắng nhẹ\nCờ �ỏ bay trên cao\nBạn bè em ríu rít\nCùng nhau �ến l�:p nào.",
        questions: [
            { q: "Nắng �x sân trường như thế nào?", options: ["Nắng nhẹ", "Nắng gắt", "Mưa to"], a: "Nắng nhẹ" },
            { q: "Cờ gì bay trên cao?", options: ["Cờ �ỏ", "Cờ xanh", "Cờ vàng"], a: "Cờ �ỏ" },
            { q: "Các bạn nhỏ �ang làm gì?", options: ["Cùng nhau �ến l�:p", "Đi chợ", "Ra ��ng"], a: "Cùng nhau �ến l�:p" }
        ]
    },
    {
        text: "Bà kỒ em nghe chuy�!n\nGiọng bà ấm d�9u dàng\nNgoài thềm hoa n�x r�"\nTỏa hương thơm nhẹ nhàng.",
        questions: [
            { q: "Ai kỒ chuy�!n cho em nghe?", options: ["Bà", "Mẹ", "Cô giáo"], a: "Bà" },
            { q: "Giọng bà như thế nào?", options: ["Ấm và d�9u dàng", "To và gắt", "Nhỏ và bu�n"], a: "Ấm và d�9u dàng" },
            { q: "Ngoài thềm có gì?", options: ["Hoa n�x r�"", "Mưa rất to", "Nhiều lá khô"], a: "Hoa n�x r�"" }
        ]
    }
];

const EXTRA_EXPRESSIVE_READING_PASSAGES = [
    {
        title: "Tiếng mưa", author: "Bài tập �ọc", type: "thơ" as const,
        text: "Mưa rơi tí tách ngoài hiên\nHàng cau nghiêng ngó, con thuyền ngủ say\nẾch con gọi bạn �êm nay\nGió �ưa hương lúa thoảng bay d�9u dàng.",
        instruction: 'Doc dien cam bai tho Tieng mua'
    },
    {
        title: "Bu�"i sáng quê em", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Trời vừa hửng sáng, cả xóm nhỏ �ã r�"n ràng tiếng gà gáy. Khói bếp bay lên từ những mái nhà thân quen. Con �ường làng còn �ẫm sương s�:m, mát lành. Em hít m�"t hơi thật sâu và thấy yêu quê mình biết bao.",
        instruction: 'Doc dien cam doan van Buoi sang que em'
    },
    {
        title: "Cô giáo em", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Cô giáo em có giọng nói d�9u dàng và nụ cười rất ấm áp. M�i khi giảng bài, cô nhìn chúng em trìu mến. Khi em viết chưa �ẹp, cô nhẹ nhàng cầm tay hư�:ng dẫn. Em luôn kính yêu cô giáo của mình.",
        instruction: 'Doc dien cam doan van Co giao em'
    },
    {
        title: "TrĒng sân nhà", author: "Bài tập �ọc", type: "thơ" as const,
        text: "TrĒng tròn như chiếc �ĩa xinh\nTreo cao trên ngọn tre xanh �ầu làng\nSân nhà rải bạc mênh mang\nEm ng�i kỒ chuy�!n ch�9 Hằng cùng mây.",
        instruction: 'Doc dien cam bai tho Trang san nha'
    },
    {
        title: "Dòng sông nhỏ", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Con sông nhỏ u�n quanh làng em như m�"t dải lụa mềm. Nư�:c sông trong veo, soi bóng tre xanh hai bên bờ. Bu�"i chiều, lũ trẻ chúng em thường ra ngắm thuyền trôi chầm chậm. Dòng sông �ã tr�x thành người bạn thân thiết của quê em.",
        instruction: 'Doc dien cam doan van Dong song nho'
    },
    {
        title: "Hoa phượng", author: "Bài tập �ọc", type: "thơ" as const,
        text: "Phượng h�ng thắp lửa sân trường\nVe ngân r�"n rã gọi mùa hè sang\nTừng cánh mỏng nhẹ nhàng rơi\nGợi bao thương nh�: bạn thời học sinh.",
        instruction: 'Doc dien cam bai tho Hoa phuong'
    },
    {
        title: "Bé và chú chó nhỏ", author: "Bài tập �ọc", type: "vĒn" as const,
        text: "Nhà em có m�"t chú chó nhỏ rất khôn. M�i chiều �i học về, em vừa bư�:c t�:i c�"ng là chú �ã chạy ra vẫy �uôi mừng rỡ. Em thường vu�t ve b�" lông mềm mượt của chú. Chú chó nhỏ làm cho ngôi nhà thêm ấm áp và vui vẻ.",
        instruction: 'Doc dien cam doan van Be va chu cho nho'
    },
];

// --- GENERATORS ---

export const generateReadingQuestion = (skillId: string, level: number = 1): Question => {
    const grade2PoemPool = [
        {
            text: "Bé quét nhà giúp mẹ\nSân sạch bóng nắng vàng\nMẹ nhìn em m�0m cười\nKhen em ngoan, chĒm ch�0.",
            questions: [
                { q: "Bạn nhỏ �ã làm gì?", options: ["Quét nhà giúp mẹ", "Đi chơi cùng bạn", "Tư�:i cây ngoài sân"], a: "Quét nhà giúp mẹ" },
                { q: "Mẹ �ã làm gì khi nhìn thấy em?", options: ["M�0m cười khen em", "Bảo em �i ngủ", "Đưa em �ến trường"], a: "M�0m cười khen em" },
                { q: "Bài thơ khen bạn nhỏ �iều gì?", options: ["Ngoan và chĒm ch�0", "Chạy nhanh", "Hát hay"], a: "Ngoan và chĒm ch�0" }
            ]
        },
        {
            text: "Sáng sân trường nắng nhẹ\nCờ �ỏ bay trên cao\nBạn bè em ríu rít\nCùng nhau �ến l�:p nào.",
            questions: [
                { q: "Nắng �x sân trường như thế nào?", options: ["Nắng nhẹ", "Nắng gắt", "Mưa to"], a: "Nắng nhẹ" },
                { q: "Cờ gì bay trên cao?", options: ["Cờ �ỏ", "Cờ xanh", "Cờ vàng"], a: "Cờ �ỏ" },
                { q: "Các bạn nhỏ �ang làm gì?", options: ["Cùng nhau �ến l�:p", "Đi chợ", "Ra ��ng"], a: "Cùng nhau �ến l�:p" }
            ]
        },
        {
            text: "Bà kỒ em nghe chuy�!n\nGiọng bà ấm d�9u dàng\nNgoài thềm hoa n�x r�"\nTỏa hương thơm nhẹ nhàng.",
            questions: [
                { q: "Ai kỒ chuy�!n cho em nghe?", options: ["Bà", "Mẹ", "Cô giáo"], a: "Bà" },
                { q: "Giọng bà như thế nào?", options: ["Ấm và d�9u dàng", "To và gắt", "Nhỏ và bu�n"], a: "Ấm và d�9u dàng" },
                { q: "Ngoài thềm có gì?", options: ["Hoa n�x r�"", "Mưa rất to", "Nhiều lá khô"], a: "Hoa n�x r�"" }
            ]
        }
    ];

    const grade2ReadingPool = [
        ...READING_PASSAGES_L1,
        {
            text: "Giờ ra chơi, sân trường rất vui. Các bạn nhảy dây, �á cầu, �ọc sách dư�:i g�c cây. Tiếng cười nói r�"n ràng khắp sân. Em thích nhất là �ược chơi cùng các bạn.",
            questions: [
                { q: "Các bạn làm gì trong giờ ra chơi?", options: ["Nhảy dây, �á cầu, �ọc sách", "Ng�i ngủ", "Đi chợ"], a: "Nhảy dây, �á cầu, �ọc sách" },
                { q: "Không khí sân trường như thế nào?", options: ["R�"n ràng", "Yên lặng", "Bu�n bã"], a: "R�"n ràng" },
                { q: "Bạn nhỏ thích �iều gì nhất?", options: ["Chơi cùng các bạn", "�~ nhà m�"t mình", "Đi học mu�"n"], a: "Chơi cùng các bạn" }
            ]
        },
        {
            text: "Bu�"i sáng, b� �ưa em �ến trường. Trên �ường �i, em thấy hàng cây xanh mát và những bông hoa n�x �ẹp bên lề �ường. Em chào cô giáo r�i vào l�:p học. Em cảm thấy rất vui.",
            questions: [
                { q: "Ai �ưa em �ến trường?", options: ["B�", "Mẹ", "�ng"], a: "B�" },
                { q: "Em thấy gì trên �ường �i?", options: ["Hàng cây và bông hoa", "Dòng sông l�:n", "Cánh ��ng lúa"], a: "Hàng cây và bông hoa" },
                { q: "Em cảm thấy thế nào khi �ến l�:p?", options: ["Rất vui", "Rất bu�n", "Rất m�!t"], a: "Rất vui" }
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

    return {
        id: `vn-read-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction: 'Đọc �oạn vĒn và trả lời câu hỏi:',
        content: {
            text: `${passage.text}\n\n� ${qData.q}`,
            options: qData.options
        },
        answer: qData.a,
        hint: 'Bé hãy �ọc kỹ lại �oạn vĒn nhé!'
    };
};

export const generateVocabQuestion = (skillId: string, level: number = 1): Question => {
    if (skillId === 'tv2-tu-ngu') {
        const item = getRandom([
            { text: "Từ nào ch�0 sự vật?", options: ["cái bàn", "chạy", "xinh"], answer: "cái bàn" },
            { text: "Từ nào ch�0 hoạt ��"ng?", options: ["�ọc sách", "cây bàng", "�ỏ thắm"], answer: "�ọc sách" },
            { text: "Từ nào ch�0 �ặc �iỒm?", options: ["nhanh nhẹn", "bé Lan", "hát"], answer: "nhanh nhẹn" },
            { text: "Nhóm từ nào g�m toàn từ ch�0 sự vật?", options: ["bút, v�x, bảng", "�ọc, viết, hát", "cao, �ẹp, ngoan"], answer: "bút, v�x, bảng" },
            { text: "Nhóm từ nào g�m toàn từ ch�0 hoạt ��"ng?", options: ["chạy, nhảy, múa", "hoa, lá, cỏ", "xanh, �ỏ, tím"], answer: "chạy, nhảy, múa" },
            { text: "Nhóm từ nào g�m toàn từ ch�0 �ặc �iỒm?", options: ["ngoan, chĒm, �ẹp", "bàn, ghế, tủ", "Ēn, ngủ, học"], answer: "ngoan, chĒm, �ẹp" },
            { text: "Trong câu 'Bé Lan quét nhà rất sạch', từ nào ch�0 hoạt ��"ng?", options: ["quét", "nhà", "sạch"], answer: "quét" },
            { text: "Trong câu 'Con mèo trắng nằm ngủ', từ nào ch�0 �ặc �iỒm?", options: ["trắng", "mèo", "ngủ"], answer: "trắng" }
        ]);

        return {
            id: `vn-wordclass-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Chọn �áp án �úng:',
            content: {
                text: item.text,
                options: item.options
            },
            answer: item.answer
        };
    }

    if (skillId === 'tv2-cau') {
        const item = getRandom([
            { text: "Câu nào là câu gi�:i thi�!u?", options: ["Đây là bạn Minh.", "Bạn Minh �ang �ọc sách.", "Bạn Minh rất chĒm ch�0."], answer: "Đây là bạn Minh." },
            { text: "Câu nào là câu nêu hoạt ��"ng?", options: ["Bé �ang tư�:i cây.", "Đây là cây bư�xi.", "Cây bư�xi rất cao."], answer: "Bé �ang tư�:i cây." },
            { text: "Câu 'Đây là l�:p em.' thu�"c kiỒu câu gì?", options: ["Câu gi�:i thi�!u", "Câu nêu hoạt ��"ng", "Câu nêu �ặc �iỒm"], answer: "Câu gi�:i thi�!u" },
            { text: "Câu 'Lan �ang viết bài.' thu�"c kiỒu câu gì?", options: ["Câu nêu hoạt ��"ng", "Câu gi�:i thi�!u", "Câu hỏi"], answer: "Câu nêu hoạt ��"ng" },
            { text: "Chọn câu gi�:i thi�!u �úng.", options: ["Đây là chiếc cặp của em.", "Chiếc cặp rất �ẹp.", "Em �eo cặp �ến trường."], answer: "Đây là chiếc cặp của em." },
            { text: "Chọn câu nêu hoạt ��"ng �úng.", options: ["Các bạn �ang xếp hàng.", "Đây là sân trường.", "Sân trường rất r�"ng."], answer: "Các bạn �ang xếp hàng." },
            { text: "Câu nào dùng �Ồ gi�:i thi�!u m�"t người bạn?", options: ["Đây là bạn Hoa l�:p em.", "Bạn Hoa hát rất hay.", "Bạn Hoa �ang nhảy dây."], answer: "Đây là bạn Hoa l�:p em." },
            { text: "Câu nào dùng �Ồ nói về hoạt ��"ng của chim?", options: ["Chim �ang hót trên cành.", "Đây là chú chim sẻ.", "Chú chim rất nhỏ."], answer: "Chim �ang hót trên cành." }
        ]);

        return {
            id: `vn-sentence-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Nhận biết kiỒu câu:',
            content: {
                text: item.text,
                options: item.options
            },
            answer: item.answer
        };
    }

    const pool = level <= 1 ? VOCAB_L1 :
        level <= 2 ? [...VOCAB_L1, ...VOCAB_L2] :
            [...VOCAB_L1, ...VOCAB_L2, ...VOCAB_L3];
    const item = getRandom(pool);

    const instruction = item.type === 'synonym'
        ? "Tìm từ C�"NG nghĩa v�:i từ sau:"
        : "Tìm từ TRÁI nghĩa v�:i từ sau:";

    return {
        id: `vn-vocab-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
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

export const generatePunctuationQuestion = (skillId: string, level: number = 1): Question => {
    const extraGrade2Punctuation = [
        { text: "Điền dấu câu: 'Em chào cô giáo'", options: ["Em chào cô giáo.", "Em chào cô giáo?", "Em chào cô giáo!"], answer: "Em chào cô giáo.", explain: "Đây là câu kỒ nên dùng dấu chấm." },
        { text: "Điền dấu câu: 'Bạn �i �âu �ấy'", options: ["Bạn �i �âu �ấy?", "Bạn �i �âu �ấy.", "Bạn �i �âu �ấy!"], answer: "Bạn �i �âu �ấy?", explain: "Đây là câu hỏi nên dùng dấu chấm hỏi." },
        { text: "Điền dấu câu: '�i bông hoa �ẹp quá'", options: ["�i, bông hoa �ẹp quá!", "�i bông hoa �ẹp quá.", "�i bông hoa �ẹp quá?"], answer: "�i, bông hoa �ẹp quá!", explain: "Câu cảm thán nên dùng dấu chấm than." },
        { text: "Cu�i câu hỏi thường dùng dấu gì?", options: ["Dấu chấm hỏi (?)", "Dấu chấm (.)", "Dấu phẩy (,)"], answer: "Dấu chấm hỏi (?)", explain: "Câu hỏi kết thúc bằng dấu chấm hỏi." }
    ];

    const pool = level <= 1 ? [...PUNCTUATION_L1, ...extraGrade2Punctuation] :
        level <= 2 ? [...PUNCTUATION_L1, ...PUNCTUATION_L2] :
            [...PUNCTUATION_L1, ...PUNCTUATION_L2, ...PUNCTUATION_L3];
    const item = getRandom(pool);

    return {
        id: `vn-punct-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'mcq',
        instruction: 'Bài tập dấu câu:',
        content: {
            text: item.text,
            options: item.options
        },
        answer: item.answer,
        explanation: item.explain
    };
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

    return {
        id: `vn-write-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese',
        skillId,
        type: item.type,
        instruction: 'Bài tập Tiếng Vi�!t:',
        content: {
            text: item.text,
            options: 'options' in item ? item.options : undefined
        },
        answer: item.answer
    };
};

// --- Skill-specific writing sub-generators ---

function generateSpellingQuestion(level: number): Question {
    const pools: Record<number, { text: string; options: string[]; answer: string; explain: string }[]> = {
        1: [
            { text: "Chọn từ viết �úng chính tả:", options: ["trường học", "chường học"], answer: "trường học", explain: "tr- là �úng: trường học." },
            { text: "Chọn từ viết �úng:", options: ["con sông", "con xông"], answer: "con sông", explain: "s- là �úng: con sông." },
            { text: "Chọn từ viết �úng:", options: ["ra �i", "da �i"], answer: "ra �i", explain: "r- là �úng: ra �i." },
            { text: "Điền tr hay ch: '...ời nắng �ẹp'", options: ["Trời", "Chrời"], answer: "Trời", explain: "Trời nắng �ẹp � dùng tr." },
        ],
        2: [
            { text: "Chọn từ �úng chính tả:", options: ["sáng sủa", "xáng xủa"], answer: "sáng sủa", explain: "s- là �úng: sáng sủa." },
            { text: "Điền s hay x: '...inh �ẹp'", options: ["xinh", "sinh"], answer: "xinh", explain: "Xinh �ẹp � dùng x." },
            { text: "Chọn từ �úng:", options: ["giúp �ỡ", "dúp �ỡ"], answer: "giúp �ỡ", explain: "gi- là �úng: giúp �ỡ." },
            { text: "Điền r hay d: '...ư�:i trời mưa'", options: ["Dư�:i", "Rư�:i"], answer: "Dư�:i", explain: "Dư�:i trời mưa � dùng d." },
        ],
        3: [
            { text: "Chọn từ �úng:", options: ["tranh giành", "chanh giành"], answer: "tranh giành", explain: "tr- là �úng: tranh giành." },
            { text: "Điền s hay x: '�... nghĩ' (ngh�0 ngơi)", options: ["suy nghĩ", "xuy nghĩ"], answer: "suy nghĩ", explain: "s- là �úng: suy nghĩ." },
            { text: "Chọn từ �úng:", options: ["giải thích", "dải thích"], answer: "giải thích", explain: "gi- là �úng: giải thích." },
            { text: "Điền tr hay ch: '...Ēm sóc em bé'", options: ["ChĒm", "TrĒm"], answer: "ChĒm", explain: "ch- là �úng: chĒm sóc." },
        ],
    };
    pools[1].push(
        { text: "Chọn từ viết �úng:", options: ["chĒm ch�0", "trĒm ch�0"], answer: "chĒm ch�0", explain: "Từ �úng là 'chĒm ch�0'." },
        { text: "Chọn từ viết �úng:", options: ["cái ch�"i", "cái tr�"i"], answer: "cái ch�"i", explain: "Từ �úng là 'cái ch�"i'." },
        { text: "Điền s hay x: '...ân trường'", options: ["Sân", "Xân"], answer: "Sân", explain: "Từ �úng là 'sân trường'." },
        { text: "Chọn từ viết �úng:", options: ["r�" rá", "d�" dá"], answer: "r�" rá", explain: "Từ �úng là 'r�" rá'." },
    );
    pools[2].push(
        { text: "Chọn từ �úng:", options: ["chia sẻ", "tria sẻ"], answer: "chia sẻ", explain: "Từ �úng là 'chia sẻ'." },
        { text: "Chọn từ �úng:", options: ["xếp hàng", "sếp hàng"], answer: "xếp hàng", explain: "Từ �úng là 'xếp hàng'." },
        { text: "Chọn từ �úng:", options: ["gia �ình", "da �ình"], answer: "gia �ình", explain: "Từ �úng là 'gia �ình'." },
        { text: "Điền tr hay ch: '...ú mèo nhỏ'", options: ["Chú", "Trú"], answer: "Chú", explain: "Từ �úng là 'chú mèo nhỏ'." },
    );
    const safeLevel = Math.min(Math.max(level, 1), 3);
    const item = getRandom(pools[safeLevel]);
    return {
        id: `vn-spell-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv2-chinh-ta', type: 'mcq',
        instruction: 'Bài tập chính tả � Phân bi�!t phụ âm:',
        content: { text: item.text, options: item.options },
        answer: item.answer, explanation: item.explain
    };
}

function generateCreativeWritingQuestion(skillId: string, level: number): Question {
    const prompts: Record<string, { text: string; hint: string }[]> = {
        'tv2-ke-chuyen': [
            { text: "KỒ lại vi�!c em chuẩn b�9 �i học vào bu�"i sáng theo trình tự.", hint: "Gợi ý: Thức dậy �  v�! sinh cá nhân �  Ēn sáng �  �ến trường." },
            { text: "Nhìn tranh và kỒ lại m�"t bu�"i em cùng gia �ình �i thĒm ông bà.", hint: "Gợi ý: Em �i v�:i ai �  mang theo gì �  gặp ông bà ra sao �  cảm xúc của em." },
            { text: "KỒ lại m�"t vi�!c t�t em �ã làm �x l�:p hoặc �x nhà.", hint: "Gợi ý: Vi�!c �ó di�&n ra khi nào �  em �ã làm gì �  mọi người cảm thấy thế nào." },
        ],
        'tv2-ta-nguoi': [
            { text: "Tả người thân mà bé yêu quý nhất (mẹ, b�, ông, bà).", hint: "Gợi ý: Hình dáng �  Tính cách �  Vi�!c thường làm �  Tình cảm của bé." },
            { text: "Tả cô giáo (hoặc thầy giáo) của bé.", hint: "Gợi ý: Ngoại hình �  Giọng nói �  Cách dạy �  Bé thích �iều gì?" },
            { text: "Tả bạn thân nhất của bé �x l�:p.", hint: "Gợi ý: Tên bạn �  Ngoại hình �  Hay chơi gì cùng �  Kỷ ni�!m �áng nh�:." },
        ],
        'tv3-sang-tao': [
            { text: "Vi�t o�n vn ng�n t� s�n tr��ng gi� ra ch�i.", hint: "G�i �: C�nh v�t -> �m thanh -> ho�t �ng c�a c�c b�n -> c�m x�c c�a em." },
            { text: "Vi�t 5 �n 7 c�u t� m�t � v�t em th��ng d�ng � h�c t�p.", hint: "G�i �: T�n � v�t -> h�nh d�ng, m�u s�c -> c�ng d�ng -> v� sao em th�ch." },
            { text: "Vi�t ti�p c�u chuy�n: 'Gi� ra ch�i h�m �y, s�n tr��ng b�ng r�n l�n v� m�t ch� chim nh�...'", hint: "G�i �: Ch� chim xu�t hi�n th� n�o -> c�c b�n l�m g� -> c�u chuy�n k�t th�c ra sao." },
        ],
        'tv4-mieu-ta': [
            { text: "Vi�t o�n vn t� c�y b�ng m�t trong s�n tr��ng.", hint: "G�i �: T�n c�y -> th�n, l�, b�ng m�t -> �ch l�i -> t�nh c�m c�a em." },
            { text: "T� m�t con v�t quen thu�c m� em y�u th�ch.", hint: "G�i �: Con v�t g� -> h�nh d�ng -> ho�t �ng n�i b�t -> v� sao em y�u th�ch." },
            { text: "T� m�t � d�ng h�c t�p g�n b� v�i em.", hint: "G�i �: H�nh d�ng, m�u s�c -> c�ng d�ng -> c�ch em gi� g�n." },
        ],
        'tv5-tap-lam-van': [
            { text: "T� c�nh bu�i s�ng tr�n ��ng em �n tr��ng.", hint: "G�i �: Th�i gian -> c�nh v�t -> con ng��i -> c�m x�c c�a em." },
            { text: "K� l�i m�t vi�c t�t em � l�m khi�n ng��i kh�c vui.", hint: "G�i �: S� vi�c x�y ra khi n�o -> em � l�m g� -> k�t qu� ra sao -> b�i h�c em r�t ra." },
            { text: "T� m�t ng��i b�n th�n c�a em.", hint: "G�i �: Ngo�i h�nh -> t�nh c�ch -> k� ni�m �ng nh� -> t�nh c�m c�a em." },
        ],
        'tv5-van-nghi-luan': [
            { text: "Vi�t o�n vn n�u � ki�n: V� sao h�c sinh c�n t� gi�c h�c b�i?", hint: "G�i �: N�u � ki�n -> 2 l� do -> k�t l�i b�ng i�u em mu�n th�c hi�n." },
            { text: "Vi�t o�n vn n�u � ki�n: V� sao c�n gi� g�n v� sinh tr��ng l�p?", hint: "G�i �: N�u � ki�n -> l�i �ch -> vi�c h�c sinh n�n l�m." },
            { text: "Vi�t o�n vn n�u � ki�n: �c s�ch m�i ng�y c� �ch g�?", hint: "G�i �: N�u � ki�n -> l�i �ch 1, l�i �ch 2 -> l�i khuy�n." },
        ],
    };
    const pool = prompts[skillId] || prompts['tv2-ke-chuyen'];
    const item = getRandom(pool);
    return {
        id: `vn-creative-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId, type: 'speaking',
        instruction: skillId === 'tv2-ta-nguoi' ? 'Bài tập tả người:' : skillId === 'tv3-sang-tao' ? 'Viết sáng tạo:' : 'KỒ chuy�!n:',
        content: { text: item.text },
        answer: 'Bài viết tự do', hint: item.hint
    };
}

function generateLetterWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viết m�"t bức thư ngắn gửi bạn thân, kỒ về kỳ ngh�0 hè của bé.", hint: "Gợi ý: Phần �ầu thư (gửi ai) �  N�"i dung (�i �âu, chơi gì) �  Kết thư (chúc bạn)." },
        { text: "Viết thư cho ông/bà �x quê, hỏi thĒm sức khỏe.", hint: "Gợi ý: Kính gửi... �  Hỏi thĒm �  KỒ chuy�!n học �  Hứa về thĒm." },
        { text: "Viết �ơn xin phép ngh�0 học 1 ngày vì b�9 �m.", hint: "Gợi ý: Kính gửi cô giáo �  Em tên... l�:p... �  Lý do �  Kính mong cô cho phép." },
    ];
    const item = getRandom(prompts);
    return {
        id: `vn-letter-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv3-viet-thu', type: 'speaking',
        instruction: 'Viết thư & Viết �ơn:',
        content: { text: item.text },
        answer: 'Bài viết tự do', hint: item.hint
    };
}

function generateReportWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viết báo cáo ngắn về bu�"i sinh hoạt l�:p tuần này.", hint: "Gợi ý: Ngày... l�:p... họp �  N�"i dung chính �  Quyết ��9nh/ kế hoạch." },
        { text: "Viết báo cáo về hoạt ��"ng tr�ng cây xanh của l�:p.", hint: "Gợi ý: Thời gian �  Đ�9a �iỒm �  Ai tham gia �  Kết quả �  Cảm nghĩ." },
        { text: "Viết báo cáo kết quả học tập của bé trong tháng.", hint: "Gợi ý: Tên bé �  Môn nào giỏi �  Môn nào cần c� gắng �  Kế hoạch tháng sau." },
    ];
    const item = getRandom(prompts);
    return {
        id: `vn-report-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv3-bao-cao', type: 'speaking',
        instruction: 'Viết báo cáo ngắn:',
        content: { text: item.text },
        answer: 'Bài viết tự do', hint: item.hint
    };
}

// === SPEAKING TOPICS (level-tiered) ===
const SPEAKING_TOPICS_L1 = [
    {
        topic: "KỒ về m�"t người mà con yêu thương nhất.",
        hint: "Dàn ý:\n1. M�x bài: Gi�:i thi�!u người �ó là ai.\n2. Thân bài: 2 lý do tại sao con yêu thương họ.\n3. Kết bài: Tình cảm của con."
    },
    {
        topic: "KỒ về m�"t kỷ ni�!m �áng nh�: nhất của con trong d�9p Tết.",
        hint: "Dàn ý:\n1. M�x bài: Gi�:i thi�!u �ó là Tết nĒm nào.\n2. Thân bài: 2 vi�!c làm con nh�: nhất.\n3. Kết bài: Cảm xúc khi nh�: lại."
    },
    {
        topic: "KỒ về con vật mà con yêu thích nhất.",
        hint: "Dàn ý:\n1. M�x bài: Con vật �ó là gì.\n2. Thân bài: Miêu tả hình dáng, tính cách.\n3. Kết bài: Tại sao con thích."
    }
];

const SPEAKING_TOPICS_L2 = [
    {
        topic: "Nếu có m�"t phép thuật, con mu�n làm gì �Ồ giúp �ỡ mọi người?",
        hint: "Dàn ý:\n1. M�x bài: Phép thuật con mu�n có.\n2. Thân bài: 2 vi�!c t�t con sẽ làm.\n3. Kết bài: Cảm nhận khi làm vi�!c t�t."
    },
    {
        topic: "Theo con, tại sao chúng ta cần phải bảo v�! môi trường?",
        hint: "Dàn ý:\n1. M�x bài: Tầm quan trọng của môi trường.\n2. Thân bài: 2 lý do cần bảo v�!.\n3. Kết bài: Lời khuyên mọi người."
    },
    {
        topic: "Gi�:i thi�!u về m�"t cu�n sách hoặc câu chuy�!n mà con thích nhất.",
        hint: "Dàn ý:\n1. M�x bài: Tên sách.\n2. Thân bài: N�"i dung và bài học.\n3. Kết bài: Khuyên bạn �ọc thử."
    }
];

const SPEAKING_TOPICS_L3 = [
    {
        topic: "Con nghĩ mình sẽ làm nghề gì khi l�:n lên? Vì sao?",
        hint: "Dàn ý:\n1. M�x bài: Nghề mơ ư�:c.\n2. Thân bài: Lý do chọn nghề, cần làm gì �Ồ �ạt �ược.\n3. Kết bài: Quyết tâm."
    },
    {
        topic: "Theo con, học nhóm và học m�"t mình, cách nào t�t hơn?",
        hint: "Dàn ý:\n1. M�x bài: Nêu vấn �ề.\n2. Thân bài: Ưu/nhược �iỒm m�i cách.\n3. Kết bài: Ý kiến cá nhân."
    }
];

const EXTRA_SPEAKING_TOPICS_L1 = [
    {
        topic: "KỒ về m�"t bu�"i �i chơi cùng gia �ình mà con nh�: nhất.",
        hint: "Dàn ý:\n1. M�x bài: Con �i �âu, �i v�:i ai.\n2. Thân bài: Những vi�!c vui con �ã làm.\n3. Kết bài: Điều con thích nhất trong chuyến �i."
    },
    {
        topic: "Gi�:i thi�!u về góc học tập của con.",
        hint: "Dàn ý:\n1. M�x bài: Góc học tập �x �âu.\n2. Thân bài: Có những �� vật gì, con dùng thế nào.\n3. Kết bài: Vì sao con yêu góc học tập �ó."
    },
    {
        topic: "KỒ về m�"t người bạn t�t của con.",
        hint: "Dàn ý:\n1. M�x bài: Bạn tên gì, học cùng l�:p nào.\n2. Thân bài: Bạn có �iỒm gì �áng quý, hai bạn thường làm gì cùng nhau.\n3. Kết bài: Con quý bạn ra sao."
    },
    {
        topic: "Con thích mùa nào nhất trong nĒm? Hãy nói lý do.",
        hint: "Dàn ý:\n1. M�x bài: Con thích mùa nào.\n2. Thân bài: Thời tiết, cảnh vật và hoạt ��"ng con yêu thích trong mùa �ó.\n3. Kết bài: Cảm xúc của con."
    },
];

const EXTRA_SPEAKING_TOPICS_L2 = [
    {
        topic: "Theo con, vì sao chúng ta cần chĒm ch�0 �ọc sách?",
        hint: "Dàn ý:\n1. M�x bài: Nêu ý kiến của con.\n2. Thân bài: Ít nhất 2 lợi ích của vi�!c �ọc sách.\n3. Kết bài: Lời khuyên dành cho các bạn."
    },
    {
        topic: "Nếu �ược làm l�:p trư�xng m�"t ngày, con sẽ làm gì?",
        hint: "Dàn ý:\n1. M�x bài: Con sẽ nhận nhi�!m vụ gì.\n2. Thân bài: 2-3 vi�!c con mu�n làm cho l�:p t�t hơn.\n3. Kết bài: Điều con mong mu�n nhất."
    },
    {
        topic: "Con nghĩ học sinh có nên tự dọn góc học tập của mình không? Vì sao?",
        hint: "Dàn ý:\n1. M�x bài: Trả lời có hay không.\n2. Thân bài: 2 lý do bảo v�! ý kiến.\n3. Kết bài: Thói quen t�t con mu�n giữ."
    },
    {
        topic: "Gi�:i thi�!u m�"t vi�!c t�t mà con từng làm �Ồ giúp người khác.",
        hint: "Dàn ý:\n1. M�x bài: Vi�!c t�t �ó là gì.\n2. Thân bài: Con �ã làm thế nào, người �ược giúp cảm thấy ra sao.\n3. Kết bài: Bài học con nhận �ược."
    },
    {
        topic: "Theo con, vì sao chúng ta cần giữ gìn sách v�x và �� dùng học tập?",
        hint: "Dàn ý:\n1. M�x bài: Nêu ý kiến của con.\n2. Thân bài: 2 lí do nên giữ gìn sách v�x, �� dùng.\n3. Kết bài: Vi�!c con sẽ làm hằng ngày."
    },
];

const EXTRA_SPEAKING_TOPICS_L3 = [
    {
        topic: "Theo con, học �úng giờ và làm bài �ầy �ủ có lợi gì cho học sinh?",
        hint: "Dàn ý:\n1. M�x bài: Nêu ý kiến của con.\n2. Thân bài: 2 lợi ích của vi�!c học �úng giờ, làm bài �ầy �ủ.\n3. Kết bài: Điều con mu�n rèn luy�!n."
    },
    {
        topic: "Con ��ng ý hay không v�:i ý kiến: 'Giữ lời hứa là �iều rất quan trọng'?",
        hint: "Dàn ý:\n1. M�x bài: Nêu ý kiến ��ng ý hay không.\n2. Thân bài: 2 lí do hoặc ví dụ gần gũi.\n3. Kết bài: Bài học con rút ra."
    },
    {
        topic: "Theo con, học sinh nên làm gì �Ồ l�:p học luôn sạch �ẹp?",
        hint: "Dàn ý:\n1. M�x bài: Nêu vấn �ề.\n2. Thân bài: KỒ 2 hoặc 3 vi�!c học sinh nên làm.\n3. Kết bài: Lời nhắn của con v�:i các bạn."
    },
    {
        topic: "Nếu �ược góp ý cho l�:p mình tiến b�" hơn, con sẽ �ề xuất �iều gì?",
        hint: "Dàn ý:\n1. M�x bài: Điều con mu�n góp ý.\n2. Thân bài: Vì sao cần làm như vậy và lợi ích mang lại.\n3. Kết bài: Mong mu�n của con."
    },
];

const SPEAKING_PROMPTS_BY_SKILL: Record<string, { instruction: string; prompts: { topic: string; hint: string }[] }> = {
    'tv2-noi-nghe': {
        instruction: 'B� h�y k� l�i r� r�ng, � � v� n�i dung sau:',
        prompts: [
            { topic: "K� l�i m�t vi�c em � l�m sau gi� h�c.", hint: "D�n �:\n1. Em l�m vi�c � khi n�o.\n2. Em � l�m nh�ng g�.\n3. Em th�y vi�c � c� �ch ra sao." },
            { topic: "K� l�i bu�i s�ng em chu�n b� i h�c.", hint: "D�n �:\n1. Em th�c d�y l�c n�o.\n2. Em l�m nh�ng vi�c g� tr��c khi �n tr��ng.\n3. T�m tr�ng c�a em khi i h�c." },
            { topic: "K� l�i m�t l�n em gi�p � ng��i th�n.", hint: "D�n �:\n1. Em � gi�p ai.\n2. Em gi�p vi�c g�.\n3. M�i ng��i c�m th�y th� n�o." },
        ],
    },
    'tv2-thuyet-trinh': {
        instruction: 'B� h�y gi�i thi�u ng�n g�n, r� r�ng v� n�i dung sau:',
        prompts: [
            { topic: "Gi�i thi�u m�t quy�n s�ch ho�c b�i �c em th�ch trong l�p.", hint: "D�n �:\n1. T�n s�ch ho�c b�i �c l� g�.\n2. N�i dung ch�nh n�i v� i�u g�.\n3. V� sao em th�ch." },
            { topic: "Gi�i thi�u chi�c c�p ho�c h�p b�t c�a em.", hint: "D�n �:\n1. � v�t � t�n l� g�.\n2. H�nh d�ng, m�u s�c ra sao.\n3. C�ng d�ng v� c�ch em gi� g�n." },
            { topic: "Gi�i thi�u g�c h�c t�p c�a em.", hint: "D�n �:\n1. G�c h�c t�p � �u.\n2. C� nh�ng � d�ng g�.\n3. V� sao em th�ch g�c h�c t�p �." },
        ],
    },
    'tv3-thao-luan': {
        instruction: 'B� h�y n�u � ki�n v� gi�i th�ch ng�n g�n v� n�i dung sau:',
        prompts: [
            { topic: "Theo em, h�c sinh c� n�n x�p h�ng v� gi� tr�t t� khi ra v�o l�p kh�ng?", hint: "D�n �:\n1. Tr� l�i c� hay kh�ng.\n2. N�u 2 l� do.\n3. i�u em s� th�c hi�n." },
            { topic: "Theo em, v� sao ch�ng ta c�n gi� v� sinh l�p h�c?", hint: "D�n �:\n1. N�u � ki�n.\n2. K� 2 vi�c n�n l�m � gi� v� sinh.\n3. L�i nh�n v�i c�c b�n." },
            { topic: "Theo em, �c s�ch m�i ng�y c� �ch g�?", hint: "D�n �:\n1. N�u � ki�n.\n2. K� 2 l�i �ch c�a vi�c �c s�ch.\n3. Th�i quen em mu�n duy tr�." },
        ],
    },
    'tv3-hung-bien': {
        instruction: 'B� h�y tr�nh b�y � ki�n ng�n g�n, r� r�ng v� n�i dung sau:',
        prompts: [
            { topic: "Theo em, h�c sinh c� n�n t� gi�c l�m b�i t�p � nh� kh�ng? V� sao?", hint: "D�n �:\n1. N�u � ki�n �ng � hay kh�ng.\n2. Tr�nh b�y 2 l� do g�n gii.\n3. i�u em s� c� g�ng th�c hi�n." },
            { topic: "Theo em, gi� l�i h�a v�i b�n b� v� ng��i th�n c� quan tr�ng kh�ng?", hint: "D�n �:\n1. N�u � ki�n c�a em.\n2. �a ra 2 l� do ho�c v� d� �n gi�n.\n3. B�i h�c em r�t ra." },
            { topic: "Theo em, h�c sinh n�n l�m g� � tr��ng l�p s�ch �p h�n?", hint: "D�n �:\n1. N�u v�n �.\n2. Tr�nh b�y 2 ho�c 3 vi�c n�n l�m.\n3. L�i k�u g�i c�c b�n c�ng th�c hi�n." },
        ],
    },
};

export const generateSpeakingQuestion = (skillId: string, level: number = 1): Question => {

    // Đọc di�&n cảm: chọn ngẫu nhiên �oạn thơ/vĒn
    if (skillId.includes('doc-dien-cam')) {
        const readingPool = [...EXPRESSIVE_READING_PASSAGES, ...EXTRA_EXPRESSIVE_READING_PASSAGES];
        const passage = getRandom(readingPool);
        return {
            id: `vn-ddc-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'reading',
            instruction: passage.instruction,
            content: {
                text: passage.text,
            },
            answer: "� �c"
        };
    }

    const skillPromptConfig = SPEAKING_PROMPTS_BY_SKILL[skillId];
    if (skillPromptConfig) {
        const selectedPrompt = getRandom(skillPromptConfig.prompts);
        return {
            id: `vn-speak-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'speaking',
            instruction: skillPromptConfig.instruction,
            content: {
                text: selectedPrompt.topic
            },
            hint: selectedPrompt.hint,
            answer: "� n�i"
        };
    }

    // Hùng bi�!n / Nói: �ề tài theo level
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

    return {
        id: `vn-speak-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese',
        skillId,
        type: 'speaking',
        instruction: 'B� h�y suy ngh) d�n � v� h�ng bi�n v� ch� � sau:',
        content: {
            text: selectedTopic.topic
        },
        hint: selectedTopic.hint,
        answer: "� n�i"
    };
}


