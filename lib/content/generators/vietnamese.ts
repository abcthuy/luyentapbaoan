
import { Question } from '../types';

// Helper for random selection
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- DATA SOURCE ---

// === Äá»ŒC HIá»‚U (Expanded â€” 8 passages, level-tiered) ===
const READING_PASSAGES_L1 = [
    {
        text: "Máº¹ á»‘m, bÃ© cháº³ng Ä‘i Ä‘Ã¢u.\nViÃªn bi ngÆ°á»i rá»§, kháº¿ chua ngÆ°á»i má»i.\nMáº¹ cÆ°á»i: 'Con á»Ÿ nhÃ  chÆ¡i'\nNhÆ°ng con váº«n tháº¥y máº¹ cÆ°á»i kÃ©m tÆ°Æ¡i.",
        questions: [
            { q: "Khi máº¹ á»‘m, bÃ© Ä‘Ã£ lÃ m gÃ¬?", options: ["á»ž nhÃ  vá»›i máº¹", "Äi chÆ¡i bi", "Äi Äƒn kháº¿ chua"], a: "á»ž nhÃ  vá»›i máº¹" },
            { q: "Máº¹ báº£o bÃ© Ä‘i Ä‘Ã¢u?", options: ["Äi chÆ¡i", "Äi há»c", "Äi ngá»§"], a: "Äi chÆ¡i" },
            { q: "BÃ i thÆ¡ nÃ³i vá» tÃ¬nh cáº£m cá»§a ai?", options: ["BÃ© thÆ°Æ¡ng máº¹", "Máº¹ thÆ°Æ¡ng bÃ©", "Cáº£ hai Ä‘á»u Ä‘Ãºng"], a: "Cáº£ hai Ä‘á»u Ä‘Ãºng" }
        ]
    },
    {
        text: "SÃ¡ng sá»›m, biá»ƒn tháº­t lÃ  Ä‘áº¹p. Nhá»¯ng con sÃ³ng tráº¯ng xÃ³a xÃ´ vÃ o bÃ£i cÃ¡t vÃ ng. Ã”ng máº·t trá»i Ä‘á» rá»±c tá»« tá»« nhÃ´ lÃªn khá»i máº·t biá»ƒn.",
        questions: [
            { q: "BÃ i vÄƒn táº£ cáº£nh gÃ¬?", options: ["Cáº£nh biá»ƒn buá»•i sÃ¡ng", "Cáº£nh nÃºi rá»«ng", "Cáº£nh thÃ nh phá»‘"], a: "Cáº£nh biá»ƒn buá»•i sÃ¡ng" },
            { q: "SÃ³ng biá»ƒn cÃ³ mÃ u gÃ¬?", options: ["Tráº¯ng xÃ³a", "Xanh biáº¿c", "Äá» rá»±c"], a: "Tráº¯ng xÃ³a" },
            { q: "Ã”ng máº·t trá»i Ä‘Æ°á»£c miÃªu táº£ nhÆ° tháº¿ nÃ o?", options: ["Äá» rá»±c", "VÃ ng Ã³ng", "Tráº¯ng tinh"], a: "Äá» rá»±c" }
        ]
    },
    {
        text: "BÃ© Lan ráº¥t thÃ­ch Ä‘i há»c. Má»—i sÃ¡ng, bÃ© dáº­y sá»›m, Ä‘Ã¡nh rÄƒng rá»­a máº·t rá»“i Äƒn sÃ¡ng. Máº¹ Ä‘Æ°a bÃ© Ä‘áº¿n trÆ°á»ng. á»ž trÆ°á»ng, bÃ© Ä‘Æ°á»£c há»c nhiá»u Ä‘iá»u má»›i.",
        questions: [
            { q: "BÃ© Lan thÃ­ch lÃ m gÃ¬?", options: ["Äi há»c", "Äi chÆ¡i", "Ngá»§ nÆ°á»›ng"], a: "Äi há»c" },
            { q: "Ai Ä‘Æ°a bÃ© Ä‘áº¿n trÆ°á»ng?", options: ["Máº¹", "Bá»‘", "Ã”ng"], a: "Máº¹" },
            { q: "Má»—i sÃ¡ng bÃ© lÃ m gÃ¬ Ä‘áº§u tiÃªn?", options: ["Dáº­y sá»›m", "Ä‚n sÃ¡ng", "Äi há»c"], a: "Dáº­y sá»›m" }
        ]
    },
    {
        text: "NhÃ  bÃ  ngoáº¡i cÃ³ má»™t con mÃ¨o. MÃ¨o cÃ³ bá»™ lÃ´ng tráº¯ng muá»‘t. MÃ¨o thÃ­ch náº±m sÆ°á»Ÿi náº¯ng trÆ°á»›c hiÃªn nhÃ . BÃ© ráº¥t thÃ­ch Ã´m mÃ¨o ngá»§.",
        questions: [
            { q: "Con mÃ¨o cÃ³ bá»™ lÃ´ng mÃ u gÃ¬?", options: ["Tráº¯ng muá»‘t", "Äen tuyá»n", "VÃ ng mÆ°á»£t"], a: "Tráº¯ng muá»‘t" },
            { q: "MÃ¨o thÃ­ch lÃ m gÃ¬?", options: ["Náº±m sÆ°á»Ÿi náº¯ng", "Báº¯t chuá»™t", "Nháº£y mÃºa"], a: "Náº±m sÆ°á»Ÿi náº¯ng" },
            { q: "MÃ¨o á»Ÿ Ä‘Ã¢u?", options: ["NhÃ  bÃ  ngoáº¡i", "NhÃ  hÃ ng xÃ³m", "Cá»­a hÃ ng"], a: "NhÃ  bÃ  ngoáº¡i" }
        ]
    }
];

const READING_PASSAGES_L2 = [
    {
        text: "MÃ¹a thu, trá»i trong xanh. Tá»«ng Ä‘Ã n chim bay vá» phÆ°Æ¡ng nam. LÃ¡ vÃ ng rÆ¡i nháº¹ nhÃ ng trÃªn con Ä‘Æ°á»ng nhá». Buá»•i chiá»u, Ã¡nh náº¯ng vÃ ng chiáº¿u qua khe lÃ¡, Ä‘áº¹p nhÆ° tranh váº½.",
        questions: [
            { q: "MÃ¹a thu trá»i nhÆ° tháº¿ nÃ o?", options: ["Trong xanh", "MÃ¢y Ä‘en", "NÃ³ng bá»©c"], a: "Trong xanh" },
            { q: "Chim bay vá» Ä‘Ã¢u?", options: ["PhÆ°Æ¡ng nam", "PhÆ°Æ¡ng báº¯c", "PhÆ°Æ¡ng Ä‘Ã´ng"], a: "PhÆ°Æ¡ng nam" },
            { q: "TÃ¡c giáº£ so sÃ¡nh cáº£nh Ä‘áº¹p vá»›i gÃ¬?", options: ["Tranh váº½", "Giáº¥c mÆ¡", "CÃ¢u chuyá»‡n"], a: "Tranh váº½" },
            { q: "LÃ¡ cÃ³ mÃ u gÃ¬?", options: ["VÃ ng", "Xanh", "Äá»"], a: "VÃ ng" }
        ]
    },
    {
        text: "BÃ¡c nÃ´ng dÃ¢n cáº§n cÃ¹ lÃ m viá»‡c trÃªn cÃ¡nh Ä‘á»“ng. Tá»« sÃ¡ng sá»›m, bÃ¡c Ä‘Ã£ ra Ä‘á»“ng cáº¥y lÃºa. Trá»i náº¯ng nÃ³ng nhÆ°ng bÃ¡c váº«n kiÃªn trÃ¬. Nhá» sá»± chÄƒm chá»‰, mÃ¹a gáº·t lÃºa chÃ­n vÃ ng cáº£ cÃ¡nh Ä‘á»“ng.",
        questions: [
            { q: "BÃ¡c nÃ´ng dÃ¢n lÃ m gÃ¬ trÃªn Ä‘á»“ng?", options: ["Cáº¥y lÃºa", "HÃ¡i quáº£", "ChÄƒn trÃ¢u"], a: "Cáº¥y lÃºa" },
            { q: "TÃ­nh cÃ¡ch cá»§a bÃ¡c nÃ´ng dÃ¢n lÃ  gÃ¬?", options: ["Cáº§n cÃ¹, kiÃªn trÃ¬", "LÆ°á»i biáº¿ng", "Vá»™i vÃ ng"], a: "Cáº§n cÃ¹, kiÃªn trÃ¬" },
            { q: "Káº¿t quáº£ cÃ´ng viá»‡c lÃ  gÃ¬?", options: ["LÃºa chÃ­n vÃ ng", "LÃºa bá»‹ há»ng", "KhÃ´ng cÃ³ gÃ¬"], a: "LÃºa chÃ­n vÃ ng" },
            { q: "BÃ¡c ra Ä‘á»“ng lÃºc nÃ o?", options: ["SÃ¡ng sá»›m", "Buá»•i trÆ°a", "Buá»•i tá»‘i"], a: "SÃ¡ng sá»›m" }
        ]
    }
];

const READING_PASSAGES_L3 = [
    {
        text: "NgÃ y xÆ°a, cÃ³ má»™t chÃ ng tiá»u phu nghÃ¨o nhÆ°ng tháº­t thÃ . Má»™t hÃ´m, chÃ ng lá»¡ Ä‘Ã¡nh rÆ¡i chiáº¿c rÃ¬u xuá»‘ng sÃ´ng. Ã”ng Bá»¥t hiá»‡n lÃªn vÃ  há»i: 'CÃ³ pháº£i rÃ¬u vÃ ng nÃ y cá»§a con khÃ´ng?' ChÃ ng Ä‘Ã¡p: 'KhÃ´ng, rÃ¬u cá»§a con báº±ng sáº¯t thÃ´i.' Ã”ng Bá»¥t khen chÃ ng tháº­t thÃ  vÃ  táº·ng cáº£ ba chiáº¿c rÃ¬u.",
        questions: [
            { q: "ChÃ ng tiá»u phu cÃ³ tÃ­nh cÃ¡ch gÃ¬?", options: ["Tháº­t thÃ ", "Gian dá»‘i", "KiÃªu ngáº¡o"], a: "Tháº­t thÃ " },
            { q: "ChÃ ng Ä‘Ã¡nh rÆ¡i gÃ¬ xuá»‘ng sÃ´ng?", options: ["Chiáº¿c rÃ¬u", "Con dao", "Chiáº¿c bÃºa"], a: "Chiáº¿c rÃ¬u" },
            { q: "Ã”ng Bá»¥t táº·ng chÃ ng bao nhiÃªu rÃ¬u?", options: ["Ba chiáº¿c", "Má»™t chiáº¿c", "Hai chiáº¿c"], a: "Ba chiáº¿c" },
            { q: "BÃ i há»c tá»« cÃ¢u chuyá»‡n lÃ  gÃ¬?", options: ["Pháº£i tháº­t thÃ ", "Pháº£i giÃ u cÃ³", "Pháº£i nhanh nháº¹n"], a: "Pháº£i tháº­t thÃ " }
        ]
    },
    {
        text: "Viá»‡t Nam cÃ³ nhiá»u lá»… há»™i truyá»n thá»‘ng. Táº¿t NguyÃªn ÄÃ¡n lÃ  lá»… há»™i lá»›n nháº¥t trong nÄƒm. Má»i ngÆ°á»i dá»n dáº¹p nhÃ  cá»­a, náº¥u bÃ¡nh chÆ°ng, trang trÃ­ hoa mai hoa Ä‘Ã o. Tráº» em Ä‘Æ°á»£c máº·c quáº§n Ã¡o má»›i vÃ  nháº­n lÃ¬ xÃ¬ tá»« ngÆ°á»i lá»›n. Táº¿t lÃ  dá»‹p Ä‘á»ƒ gia Ä‘Ã¬nh sum há»p.",
        questions: [
            { q: "Lá»… há»™i lá»›n nháº¥t trong nÄƒm lÃ  gÃ¬?", options: ["Táº¿t NguyÃªn ÄÃ¡n", "Trung thu", "GiÃ¡ng sinh"], a: "Táº¿t NguyÃªn ÄÃ¡n" },
            { q: "Má»i ngÆ°á»i náº¥u gÃ¬ ngÃ y Táº¿t?", options: ["BÃ¡nh chÆ°ng", "BÃ¡nh mÃ¬", "Phá»Ÿ"], a: "BÃ¡nh chÆ°ng" },
            { q: "Tráº» em nháº­n gÃ¬ tá»« ngÆ°á»i lá»›n?", options: ["LÃ¬ xÃ¬", "QuÃ  sinh nháº­t", "Káº¹o"], a: "LÃ¬ xÃ¬" },
            { q: "Táº¿t lÃ  dá»‹p Ä‘á»ƒ lÃ m gÃ¬?", options: ["Gia Ä‘Ã¬nh sum há»p", "Äi du lá»‹ch xa", "LÃ m viá»‡c nhiá»u"], a: "Gia Ä‘Ã¬nh sum há»p" }
        ]
    }
];

// === Tá»ª Vá»°NG (Expanded â€” 24 pairs, level-tiered) ===
const VOCAB_L1 = [
    { type: 'synonym', word: "siÃªng nÄƒng", options: ["chÄƒm chá»‰", "lÆ°á»i biáº¿ng", "thÃ´ng minh"], a: "chÄƒm chá»‰" },
    { type: 'synonym', word: "xinh Ä‘áº¹p", options: ["tÆ°Æ¡i táº¯n", "xáº¥u xÃ­", "giá»i giang"], a: "tÆ°Æ¡i táº¯n" },
    { type: 'synonym', word: "bÃ© nhá»", options: ["nhá» xÃ­u", "to lá»›n", "cao cao"], a: "nhá» xÃ­u" },
    { type: 'synonym', word: "vui váº»", options: ["há»›n há»Ÿ", "buá»“n bÃ£", "tá»©c giáº­n"], a: "há»›n há»Ÿ" },
    { type: 'antonym', word: "nhanh", options: ["cháº­m", "vá»™i", "mau"], a: "cháº­m" },
    { type: 'antonym', word: "Ä‘en", options: ["tráº¯ng", "tá»‘i", "sÃ¡ng"], a: "tráº¯ng" },
    { type: 'antonym', word: "buá»“n", options: ["vui", "khÃ³c", "sáº§u"], a: "vui" },
    { type: 'antonym', word: "to", options: ["nhá»", "lá»›n", "cao"], a: "nhá»" }
];

const VOCAB_L2 = [
    { type: 'synonym', word: "dÅ©ng cáº£m", options: ["gan dáº¡", "nhÃºt nhÃ¡t", "hiá»n lÃ nh"], a: "gan dáº¡" },
    { type: 'synonym', word: "thÃ´ng minh", options: ["sÃ¡ng dáº¡", "ngu dá»‘t", "cháº­m cháº¡p"], a: "sÃ¡ng dáº¡" },
    { type: 'synonym', word: "yÃªn láº·ng", options: ["im lÃ¬m", "á»“n Ã o", "vang vá»ng"], a: "im lÃ¬m" },
    { type: 'synonym', word: "giÃºp Ä‘á»¡", options: ["há»— trá»£", "phÃ¡ phÃ¡ch", "lÆ¡ lÃ "], a: "há»— trá»£" },
    { type: 'antonym', word: "giÃ u", options: ["nghÃ¨o", "sang", "Ä‘áº¹p"], a: "nghÃ¨o" },
    { type: 'antonym', word: "Ä‘Ãºng", options: ["sai", "pháº£i", "hay"], a: "sai" },
    { type: 'antonym', word: "khá»e", options: ["yáº¿u", "máº¡nh", "nhanh"], a: "yáº¿u" },
    { type: 'antonym', word: "nÃ³ng", options: ["láº¡nh", "áº¥m", "mÃ¡t"], a: "láº¡nh" }
];

const VOCAB_L3 = [
    { type: 'synonym', word: "kiÃªn trÃ¬", options: ["bá»n bá»‰", "bá» cuá»™c", "vá»™i vÃ ng"], a: "bá»n bá»‰" },
    { type: 'synonym', word: "hÃ o phÃ³ng", options: ["rá»™ng rÃ£i", "keo kiá»‡t", "nghiÃªm tÃºc"], a: "rá»™ng rÃ£i" },
    { type: 'synonym', word: "uy nghi", options: ["oai phong", "nhá» bÃ©", "hiá»n hÃ²a"], a: "oai phong" },
    { type: 'synonym', word: "tinh khiáº¿t", options: ["trong sáº¡ch", "báº©n thá»‰u", "xÃ¡m xá»‹t"], a: "trong sáº¡ch" },
    { type: 'antonym', word: "cáº©n tháº­n", options: ["báº¥t cáº©n", "tá»‰ má»‰", "cáº§n máº«n"], a: "báº¥t cáº©n" },
    { type: 'antonym', word: "khiÃªm tá»‘n", options: ["kiÃªu ngáº¡o", "giáº£n dá»‹", "lá»‹ch sá»±"], a: "kiÃªu ngáº¡o" },
    { type: 'antonym', word: "tiáº¿t kiá»‡m", options: ["lÃ£ng phÃ­", "cháº¯t chiu", "dÃ nh dá»¥m"], a: "lÃ£ng phÃ­" },
    { type: 'antonym', word: "Ä‘oÃ n káº¿t", options: ["chia ráº½", "gáº¯n bÃ³", "há»£p tÃ¡c"], a: "chia ráº½" }
];

// === Dáº¤U CÃ‚U (cho tv2-dau-cau) ===
const PUNCTUATION_L1 = [
    { text: "Äiá»n dáº¥u cÃ¢u: 'Em Ä‘i há»c'", options: ["Em Ä‘i há»c.", "Em Ä‘i há»c?", "Em Ä‘i há»c!"], answer: "Em Ä‘i há»c.", explain: "CÃ¢u ká»ƒ dÃ¹ng dáº¥u cháº¥m." },
    { text: "Äiá»n dáº¥u cÃ¢u: 'Báº¡n tÃªn lÃ  gÃ¬'", options: ["Báº¡n tÃªn lÃ  gÃ¬?", "Báº¡n tÃªn lÃ  gÃ¬.", "Báº¡n tÃªn lÃ  gÃ¬!"], answer: "Báº¡n tÃªn lÃ  gÃ¬?", explain: "CÃ¢u há»i dÃ¹ng dáº¥u cháº¥m há»i." },
    { text: "Äiá»n dáº¥u cÃ¢u: 'Ã”i Ä‘áº¹p quÃ¡'", options: ["Ã”i, Ä‘áº¹p quÃ¡!", "Ã”i Ä‘áº¹p quÃ¡.", "Ã”i Ä‘áº¹p quÃ¡?"], answer: "Ã”i, Ä‘áº¹p quÃ¡!", explain: "CÃ¢u cáº£m thÃ¡n dÃ¹ng dáº¥u cháº¥m than." },
    { text: "Dáº¥u nÃ o Ä‘Ãºng cho cuá»‘i cÃ¢u ká»ƒ?", options: ["Dáº¥u cháº¥m (.)", "Dáº¥u cháº¥m há»i (?)", "Dáº¥u cháº¥m than (!)"], answer: "Dáº¥u cháº¥m (.)", explain: "CÃ¢u ká»ƒ káº¿t thÃºc báº±ng dáº¥u cháº¥m." },
];

const PUNCTUATION_L2 = [
    { text: "CÃ¢u nÃ o dÃ¹ng Ä‘Ãºng dáº¥u pháº©y?", options: ["HÃ´m nay, trá»i ráº¥t Ä‘áº¹p.", "HÃ´m, nay trá»i ráº¥t Ä‘áº¹p.", "HÃ´m nay trá»i, ráº¥t Ä‘áº¹p."], answer: "HÃ´m nay, trá»i ráº¥t Ä‘áº¹p.", explain: "Dáº¥u pháº©y ngÄƒn cÃ¡ch tráº¡ng ngá»¯ vá»›i nÃ²ng cá»‘t cÃ¢u." },
    { text: "Äáº·t dáº¥u cÃ¢u Ä‘Ãºng: 'Máº¹ Æ¡i con Ä‘Ã³i quÃ¡'", options: ["Máº¹ Æ¡i, con Ä‘Ã³i quÃ¡!", "Máº¹ Æ¡i con Ä‘Ã³i quÃ¡.", "Máº¹, Æ¡i con Ä‘Ã³i quÃ¡?"], answer: "Máº¹ Æ¡i, con Ä‘Ã³i quÃ¡!", explain: "Dáº¥u pháº©y sau lá»i gá»i, dáº¥u cháº¥m than cho cÃ¢u cáº£m thÃ¡n." },
    { text: "CÃ¢u 'Con cÃ³ khá»e khÃ´ng' cáº§n dáº¥u gÃ¬ á»Ÿ cuá»‘i?", options: ["Dáº¥u cháº¥m há»i (?)", "Dáº¥u cháº¥m (.)", "Dáº¥u cháº¥m than (!)"], answer: "Dáº¥u cháº¥m há»i (?)", explain: "ÄÃ¢y lÃ  cÃ¢u há»i." },
    { text: "Dáº¥u pháº©y dÃ¹ng Ä‘á»ƒ lÃ m gÃ¬?", options: ["NgÄƒn cÃ¡ch cÃ¡c bá»™ pháº­n cÃ¢u", "Káº¿t thÃºc cÃ¢u", "Äáº·t cÃ¢u há»i"], answer: "NgÄƒn cÃ¡ch cÃ¡c bá»™ pháº­n cÃ¢u", explain: "Dáº¥u pháº©y ngÄƒn cÃ¡ch cÃ¡c thÃ nh pháº§n trong cÃ¢u." },
];

const PUNCTUATION_L3 = [
    { text: "Điền dấu câu: 'Lan hỏi Bạn đi đâu đấy'", options: ["Lan hỏi: \"Bạn đi đâu đấy?\"", "Lan hỏi: Bạn đi đâu đấy.", "Lan hỏi, Bạn đi đâu đấy!"], answer: "Lan hỏi: \"Bạn đi đâu đấy?\"", explain: "Dùng dấu hai chấm và ngoặc kép cho lời nói trực tiếp." },
    { text: "Câu nào dùng dấu hai chấm đúng?", options: ["Mẹ bảo: \"Con ăn cơm đi.\"", "Mẹ: bảo con ăn cơm đi.", "Mẹ bảo con: ăn cơm đi."], answer: "Mẹ bảo: \"Con ăn cơm đi.\"", explain: "Dấu hai chấm đặt trước lời nói trực tiếp." },
    { text: "Khi liá»‡t kÃª nhiá»u thá»©, bÃ© dÃ¹ng dáº¥u gÃ¬ Ä‘á»ƒ ngÄƒn cÃ¡ch?", options: ["Dáº¥u pháº©y", "Dáº¥u cháº¥m", "Dáº¥u hai cháº¥m"], answer: "Dáº¥u pháº©y", explain: "Dáº¥u pháº©y ngÄƒn cÃ¡ch cÃ¡c tá»« trong chuá»—i liá»‡t kÃª." },
    { text: "Äáº·t dáº¥u cÃ¢u Ä‘Ãºng: 'Em tÃªn lÃ  gÃ¬'", options: ["Em tÃªn lÃ  gÃ¬?", "Em tÃªn lÃ  gÃ¬.", "Em tÃªn lÃ  gÃ¬!"], answer: "Em tÃªn lÃ  gÃ¬?", explain: "ÄÃ¢y lÃ  cÃ¢u há»i nÃªn dÃ¹ng dáº¥u cháº¥m há»i." },
];

// === VIáº¾T / NGá»® PHÃP (Expanded â€” level-tiered) ===
const WRITING_L1 = [
    { text: "Äiá»n tá»« cÃ²n thiáº¿u: 'Uá»‘ng nÆ°á»›c nhá»› ...'", answer: "nguá»“n", type: "input" as const },
    { text: "Äiá»n tá»« cÃ²n thiáº¿u: 'Ä‚n quáº£ nhá»› káº» ... cÃ¢y'", answer: "trá»“ng", type: "input" as const },
    { text: "Äiá»n tá»«: 'CÃ³ cÃ´ng mÃ i sáº¯t, cÃ³ ngÃ y nÃªn ...'", answer: "kim", type: "input" as const },
    { text: "Äiá»n tá»«: 'Tá»‘t gá»— hÆ¡n tá»‘t ...'", answer: "nÆ°á»›c sÆ¡n", type: "input" as const },
];

const WRITING_L2 = [
    { text: "CÃ¢u 'BÃ© Ä‘ang há»c bÃ i.' thuá»™c kiá»ƒu cÃ¢u gÃ¬?", options: ["CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", "CÃ¢u giá»›i thiá»‡u", "CÃ¢u nÃªu Ä‘áº·c Ä‘iá»ƒm"], answer: "CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", type: "mcq" as const },
    { text: "CÃ¢u 'MÃ¡i tÃ³c bÃ  báº¡c phÆ¡.' thuá»™c kiá»ƒu cÃ¢u gÃ¬?", options: ["CÃ¢u nÃªu Ä‘áº·c Ä‘iá»ƒm", "CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", "CÃ¢u giá»›i thiá»‡u"], answer: "CÃ¢u nÃªu Ä‘áº·c Ä‘iá»ƒm", type: "mcq" as const },
    { text: "CÃ¢u 'ÄÃ¢y lÃ  báº¡n Lan.' thuá»™c kiá»ƒu cÃ¢u gÃ¬?", options: ["CÃ¢u giá»›i thiá»‡u", "CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", "CÃ¢u nÃªu Ä‘áº·c Ä‘iá»ƒm"], answer: "CÃ¢u giá»›i thiá»‡u", type: "mcq" as const },
    { text: "Tá»« nÃ o lÃ  danh tá»«? 'BÃ© cháº¡y nhanh trÃªn sÃ¢n trÆ°á»ng.'", options: ["sÃ¢n trÆ°á»ng", "cháº¡y", "nhanh"], answer: "sÃ¢n trÆ°á»ng", type: "mcq" as const },
    { text: "Tá»« nÃ o lÃ  Ä‘á»™ng tá»«? 'CÃ¡c báº¡n Ä‘ang hÃ¡t ráº¥t hay.'", options: ["hÃ¡t", "báº¡n", "hay"], answer: "hÃ¡t", type: "mcq" as const },
];

const WRITING_L3 = [
    { text: "Tá»« nÃ o lÃ  tÃ­nh tá»«? 'BÃ´ng hoa Ä‘á» tháº¯m ná»Ÿ trong vÆ°á»n.'", options: ["Ä‘á» tháº¯m", "bÃ´ng hoa", "ná»Ÿ"], answer: "Ä‘á» tháº¯m", type: "mcq" as const },
    { text: "Äiá»n quan há»‡ tá»«: 'Trá»i mÆ°a ... em váº«n Ä‘i há»c.'", options: ["nhÆ°ng", "vÃ ", "vÃ¬"], answer: "nhÆ°ng", type: "mcq" as const },
    { text: "TÃ¬m chá»§ ngá»¯ trong cÃ¢u: 'Con mÃ¨o Ä‘ang ngá»§ trÆ°a.'", answer: "Con mÃ¨o", type: "input" as const },
    { text: "TÃ¬m vá»‹ ngá»¯ trong cÃ¢u: 'BÃ© Lan cháº¡y ráº¥t nhanh.'", answer: "cháº¡y ráº¥t nhanh", type: "input" as const },
    { text: "CÃ¢u 'Máº¹ ráº¥t vui vÃ¬ con ngoan.' cÃ³ máº¥y váº¿?", options: ["2 váº¿", "1 váº¿", "3 váº¿"], answer: "2 váº¿", type: "mcq" as const },
    { text: "Trong cÃ¢u 'Em yÃªu máº¹.', tá»« nÃ o lÃ  chá»§ ngá»¯?", options: ["Em", "yÃªu", "máº¹"], answer: "Em", type: "mcq" as const },
];

// --- Äá»ŒC DIá»„N Cáº¢M DATA (ThÆ¡ & VÄƒn cho Lá»›p 2-3) ---
const EXPRESSIVE_READING_PASSAGES = [
    // === THÆ  ===
    {
        title: "Máº¹ á»‘m", author: "Tráº§n ÄÄƒng Khoa", type: "thÆ¡" as const,
        text: "Má»i hÃ´m máº¹ thÃ­ch vui cÆ°á»i\nMÃ  sao hÃ´m nay máº¹ ngá»“i im re\nLÃ¡ tráº§u khÃ´ giá»¯a cÆ¡i trá»\nTruyá»‡n Kiá»u gáº¥p láº¡i trÃªn bá» bÃ n con.",
        instruction: 'Doc dien cam bai tho Me om'
    },
    {
        title: "Quáº¡t cho bÃ  ngá»§", author: "Tháº¡ch Quá»³", type: "thÆ¡" as const,
        text: "Æ i chÃ­ch chÃ²e Æ¡i\nChim Ä‘á»«ng hÃ³t ná»¯a\nBÃ  em á»‘m rá»“i\nLáº·ng cho bÃ  ngá»§.\n\nHoa cam hoa kháº¿\nNgoÃ i vÆ°á»n rá»¥ng nhiá»u\nBÆ°á»›m bay láº·ng láº½\nVÃ ng trong náº¯ng chiá»u.",
        instruction: 'Doc dien cam bai tho Quat cho ba ngu'
    },
    {
        title: "ThÃ¡p MÆ°á»i Ä‘áº¹p nháº¥t bÃ´ng sen", author: "Ca dao", type: "thÆ¡" as const,
        text: "ThÃ¡p MÆ°á»i Ä‘áº¹p nháº¥t bÃ´ng sen\nViá»‡t Nam Ä‘áº¹p nháº¥t cÃ³ tÃªn BÃ¡c Há»“.",
        instruction: 'Doc dien cam cau ca dao'
    },
    {
        title: "Báº¡n Ä‘áº¿n chÆ¡i nhÃ ", author: "Nguyá»…n Khuyáº¿n", type: "thÆ¡" as const,
        text: "ÄÃ£ báº¥y lÃ¢u nay bÃ¡c tá»›i nhÃ \nTráº» thá»i Ä‘i váº¯ng, chá»£ thá»i xa\nAo sÃ¢u nÆ°á»›c cáº£, khÃ´n chÃ i cÃ¡\nVÆ°á»n rá»™ng rÃ o thÆ°a, khÃ³ Ä‘uá»•i gÃ .",
        instruction: 'Doc dien cam doan tho Ban den choi nha'
    },
    {
        title: "Cáº£nh khuya", author: "Há»“ ChÃ­ Minh", type: "thÆ¡" as const,
        text: "Tiáº¿ng suá»‘i trong nhÆ° tiáº¿ng hÃ¡t xa\nTrÄƒng lá»“ng cá»• thá»¥ bÃ³ng lá»“ng hoa\nCáº£nh khuya nhÆ° váº½ ngÆ°á»i chÆ°a ngá»§\nChÆ°a ngá»§ vÃ¬ lo ná»—i nÆ°á»›c nhÃ .",
        instruction: 'Doc dien cam bai tho Canh khuya'
    },
    {
        title: "LÆ°á»£m", author: "Tá»‘ Há»¯u", type: "thÆ¡" as const,
        text: "ChÃº bÃ© loáº¯t choáº¯t\nCÃ¡i xáº¯c xinh xinh\nCÃ¡i chÃ¢n thoÄƒn thoáº¯t\nCÃ¡i Ä‘áº§u nghÃªnh nghÃªnh\n\nCa-lÃ´ Ä‘á»™i lá»‡ch\nMá»“m huÃ½t sÃ¡o vang\nNhÆ° con chim chÃ­ch\nNháº£y trÃªn Ä‘Æ°á»ng vÃ ng.",
        instruction: 'Doc dien cam doan tho Luom'
    },
    {
        title: "Con cÃ²", author: "Ca dao", type: "thÆ¡" as const,
        text: "Con cÃ² mÃ  Ä‘i Äƒn Ä‘Ãªm\nÄáº­u pháº£i cÃ nh má»m lá»™n cá»• xuá»‘ng ao\nÃ”ng Æ¡i Ã´ng vá»›t tÃ´i nao\nTÃ´i cÃ³ lÃ²ng nÃ o Ã´ng hÃ£y xÃ¡o mÄƒng.",
        instruction: 'Doc dien cam bai ca dao'
    },
    {
        title: "Háº¡t gáº¡o lÃ ng ta", author: "Tráº§n ÄÄƒng Khoa", type: "thÆ¡" as const,
        text: "Háº¡t gáº¡o lÃ ng ta\nCÃ³ vá»‹ phÃ¹ sa\nCá»§a sÃ´ng Kinh Tháº§y\nCÃ³ hÆ°Æ¡ng sen thÆ¡m\nTrong há»“ nÆ°á»›c Ä‘áº§y\nCÃ³ lá»i máº¹ hÃ¡t\nNgá»t bÃ¹i Ä‘áº¯ng cay.",
        instruction: 'Doc dien cam bai tho Hat gao lang ta'
    },
    // === VÄ‚N XUÃ”I ===
    {
        title: "TrÆ°á»ng em", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "SÃ¡ng nay, trÆ°á»ng em tháº­t Ä‘áº¹p. SÃ¢n trÆ°á»ng sáº¡ch sáº½, lÃ¡ cá» Ä‘á» tung bay trong giÃ³. CÃ¡c báº¡n nhá» cháº¡y nháº£y vui váº» dÆ°á»›i hÃ ng cÃ¢y xanh mÃ¡t. Tiáº¿ng trá»‘ng trÆ°á»ng vang lÃªn, em vá»™i bÆ°á»›c vÃ o lá»›p.",
        instruction: "ðŸ“– Äá»c diá»…n cáº£m Ä‘oáº¡n vÄƒn"
    },
    {
        title: "MÃ¹a xuÃ¢n Ä‘áº¿n", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "MÃ¹a xuÃ¢n Ä‘áº¿n, cÃ¢y cá»‘i Ä‘ua nhau ná»Ÿ hoa. Hoa mai vÃ ng rá»±c rá»¡, hoa Ä‘Ã o há»“ng pháº¥n. Chim chÃ³c hÃ³t lÃ­u lo trÃªn cÃ nh. KhÃ´ng khÃ­ tháº­t trong lÃ nh. Em yÃªu mÃ¹a xuÃ¢n biáº¿t bao!",
        instruction: "ðŸ“– Äá»c diá»…n cáº£m Ä‘oáº¡n vÄƒn"
    },
    {
        title: "BÃ  em", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "BÃ  em nÄƒm nay Ä‘Ã£ giÃ . TÃ³c bÃ  báº¡c tráº¯ng. BÃ  hay ká»ƒ chuyá»‡n cá»• tÃ­ch cho em nghe. Giá»ng bÃ  áº¥m Ã¡p, nháº¹ nhÃ ng. Em ráº¥t yÃªu bÃ .",
        instruction: "ðŸ“– Äá»c diá»…n cáº£m Ä‘oáº¡n vÄƒn"
    },
    {
        title: "CÃ¡nh Ä‘á»“ng quÃª", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "Buá»•i sá»›m, cÃ¡nh Ä‘á»“ng lÃºa chÃ­n vÃ ng Ã³ng. GiÃ³ thá»•i nháº¹, tá»«ng Ä‘á»£t sÃ³ng lÃºa cháº¡y dÃ i tÃ­t táº¯p. Máº¥y chÃº cÃ² tráº¯ng thong tháº£ bay lÆ°á»£n trÃªn cÃ¡nh Ä‘á»“ng. Xa xa, nhá»¯ng nÃ³c nhÃ  tranh nhá» xÃ­u náº±m láº¥p lÃ³ sau lÅ©y tre xanh.",
        instruction: "ðŸ“– Äá»c diá»…n cáº£m Ä‘oáº¡n vÄƒn"
    },
];

const POEM_PASSAGES_L1 = [
    {
        text: "BÃ© quÃ©t nhÃ  giÃºp máº¹\nSÃ¢n sáº¡ch bÃ³ng náº¯ng vÃ ng\nMáº¹ nhÃ¬n em má»‰m cÆ°á»i\nKhen em ngoan, chÄƒm chá»‰.",
        questions: [
            { q: "Báº¡n nhá» Ä‘Ã£ lÃ m gÃ¬?", options: ["QuÃ©t nhÃ  giÃºp máº¹", "Äi chÆ¡i cÃ¹ng báº¡n", "TÆ°á»›i cÃ¢y ngoÃ i sÃ¢n"], a: "QuÃ©t nhÃ  giÃºp máº¹" },
            { q: "Máº¹ Ä‘Ã£ lÃ m gÃ¬ khi nhÃ¬n tháº¥y em?", options: ["Má»‰m cÆ°á»i khen em", "Báº£o em Ä‘i ngá»§", "ÄÆ°a em Ä‘áº¿n trÆ°á»ng"], a: "Má»‰m cÆ°á»i khen em" },
            { q: "BÃ i thÆ¡ khen báº¡n nhá» Ä‘iá»u gÃ¬?", options: ["Ngoan vÃ  chÄƒm chá»‰", "Cháº¡y nhanh", "HÃ¡t hay"], a: "Ngoan vÃ  chÄƒm chá»‰" }
        ]
    },
    {
        text: "MÆ°a rÆ¡i tÃ­ tÃ¡ch ngoÃ i hiÃªn\nCÃ¢y cau gáº­t gÃ¹ trong mÆ°a\nSÃ¢n nhÃ  mÃ¡t dá»‹u ban trÆ°a\nEm ngá»“i ngáº¯m giá»t nÆ°á»›c Ä‘Æ°a nháº¹ nhÃ ng.",
        questions: [
            { q: "MÆ°a rÆ¡i á»Ÿ Ä‘Ã¢u?", options: ["NgoÃ i hiÃªn", "Trong lá»›p há»c", "TrÃªn cÃ¡nh Ä‘á»“ng"], a: "NgoÃ i hiÃªn" },
            { q: "CÃ¢y cau Ä‘Æ°á»£c táº£ nhÆ° tháº¿ nÃ o?", options: ["Gáº­t gÃ¹ trong mÆ°a", "KhÃ´ hÃ©o", "Äá»• xuá»‘ng Ä‘áº¥t"], a: "Gáº­t gÃ¹ trong mÆ°a" },
            { q: "Em nhá» Ä‘ang lÃ m gÃ¬?", options: ["Ngá»“i ngáº¯m mÆ°a", "Äuá»•i báº¯t bÆ°á»›m", "Äá»c sÃ¡ch trong lá»›p"], a: "Ngá»“i ngáº¯m mÆ°a" }
        ]
    },
    {
        text: "SÃ¡ng sÃ¢n trÆ°á»ng náº¯ng nháº¹\nCá» Ä‘á» bay trÃªn cao\nBáº¡n bÃ¨ em rÃ­u rÃ­t\nCÃ¹ng nhau Ä‘áº¿n lá»›p nÃ o.",
        questions: [
            { q: "Náº¯ng á»Ÿ sÃ¢n trÆ°á»ng nhÆ° tháº¿ nÃ o?", options: ["Náº¯ng nháº¹", "Náº¯ng gáº¯t", "MÆ°a to"], a: "Náº¯ng nháº¹" },
            { q: "Cá» gÃ¬ bay trÃªn cao?", options: ["Cá» Ä‘á»", "Cá» xanh", "Cá» vÃ ng"], a: "Cá» Ä‘á»" },
            { q: "CÃ¡c báº¡n nhá» Ä‘ang lÃ m gÃ¬?", options: ["CÃ¹ng nhau Ä‘áº¿n lá»›p", "Äi chá»£", "Ra Ä‘á»“ng"], a: "CÃ¹ng nhau Ä‘áº¿n lá»›p" }
        ]
    },
    {
        text: "BÃ  ká»ƒ em nghe chuyá»‡n\nGiá»ng bÃ  áº¥m dá»‹u dÃ ng\nNgoÃ i thá»m hoa ná»Ÿ rá»™\nTá»a hÆ°Æ¡ng thÆ¡m nháº¹ nhÃ ng.",
        questions: [
            { q: "Ai ká»ƒ chuyá»‡n cho em nghe?", options: ["BÃ ", "Máº¹", "CÃ´ giÃ¡o"], a: "BÃ " },
            { q: "Giá»ng bÃ  nhÆ° tháº¿ nÃ o?", options: ["áº¤m vÃ  dá»‹u dÃ ng", "To vÃ  gáº¯t", "Nhá» vÃ  buá»“n"], a: "áº¤m vÃ  dá»‹u dÃ ng" },
            { q: "NgoÃ i thá»m cÃ³ gÃ¬?", options: ["Hoa ná»Ÿ rá»™", "MÆ°a ráº¥t to", "Nhiá»u lÃ¡ khÃ´"], a: "Hoa ná»Ÿ rá»™" }
        ]
    }
];

const EXTRA_EXPRESSIVE_READING_PASSAGES = [
    {
        title: "Tiáº¿ng mÆ°a", author: "BÃ i táº­p Ä‘á»c", type: "thÆ¡" as const,
        text: "MÆ°a rÆ¡i tÃ­ tÃ¡ch ngoÃ i hiÃªn\nHÃ ng cau nghiÃªng ngÃ³, con thuyá»n ngá»§ say\náº¾ch con gá»i báº¡n Ä‘Ãªm nay\nGiÃ³ Ä‘Æ°a hÆ°Æ¡ng lÃºa thoáº£ng bay dá»‹u dÃ ng.",
        instruction: 'Doc dien cam bai tho Tieng mua'
    },
    {
        title: "Buá»•i sÃ¡ng quÃª em", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "Trá»i vá»«a há»­ng sÃ¡ng, cáº£ xÃ³m nhá» Ä‘Ã£ rá»™n rÃ ng tiáº¿ng gÃ  gÃ¡y. KhÃ³i báº¿p bay lÃªn tá»« nhá»¯ng mÃ¡i nhÃ  thÃ¢n quen. Con Ä‘Æ°á»ng lÃ ng cÃ²n Ä‘áº«m sÆ°Æ¡ng sá»›m, mÃ¡t lÃ nh. Em hÃ­t má»™t hÆ¡i tháº­t sÃ¢u vÃ  tháº¥y yÃªu quÃª mÃ¬nh biáº¿t bao.",
        instruction: 'Doc dien cam doan van Buoi sang que em'
    },
    {
        title: "CÃ´ giÃ¡o em", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "CÃ´ giÃ¡o em cÃ³ giá»ng nÃ³i dá»‹u dÃ ng vÃ  ná»¥ cÆ°á»i ráº¥t áº¥m Ã¡p. Má»—i khi giáº£ng bÃ i, cÃ´ nhÃ¬n chÃºng em trÃ¬u máº¿n. Khi em viáº¿t chÆ°a Ä‘áº¹p, cÃ´ nháº¹ nhÃ ng cáº§m tay hÆ°á»›ng dáº«n. Em luÃ´n kÃ­nh yÃªu cÃ´ giÃ¡o cá»§a mÃ¬nh.",
        instruction: 'Doc dien cam doan van Co giao em'
    },
    {
        title: "TrÄƒng sÃ¢n nhÃ ", author: "BÃ i táº­p Ä‘á»c", type: "thÆ¡" as const,
        text: "TrÄƒng trÃ²n nhÆ° chiáº¿c Ä‘Ä©a xinh\nTreo cao trÃªn ngá»n tre xanh Ä‘áº§u lÃ ng\nSÃ¢n nhÃ  ráº£i báº¡c mÃªnh mang\nEm ngá»“i ká»ƒ chuyá»‡n chá»‹ Háº±ng cÃ¹ng mÃ¢y.",
        instruction: 'Doc dien cam bai tho Trang san nha'
    },
    {
        title: "DÃ²ng sÃ´ng nhá»", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "Con sÃ´ng nhá» uá»‘n quanh lÃ ng em nhÆ° má»™t dáº£i lá»¥a má»m. NÆ°á»›c sÃ´ng trong veo, soi bÃ³ng tre xanh hai bÃªn bá». Buá»•i chiá»u, lÅ© tráº» chÃºng em thÆ°á»ng ra ngáº¯m thuyá»n trÃ´i cháº§m cháº­m. DÃ²ng sÃ´ng Ä‘Ã£ trá»Ÿ thÃ nh ngÆ°á»i báº¡n thÃ¢n thiáº¿t cá»§a quÃª em.",
        instruction: 'Doc dien cam doan van Dong song nho'
    },
    {
        title: "Hoa phÆ°á»£ng", author: "BÃ i táº­p Ä‘á»c", type: "thÆ¡" as const,
        text: "PhÆ°á»£ng há»“ng tháº¯p lá»­a sÃ¢n trÆ°á»ng\nVe ngÃ¢n rá»™n rÃ£ gá»i mÃ¹a hÃ¨ sang\nTá»«ng cÃ¡nh má»ng nháº¹ nhÃ ng rÆ¡i\nGá»£i bao thÆ°Æ¡ng nhá»› báº¡n thá»i há»c sinh.",
        instruction: 'Doc dien cam bai tho Hoa phuong'
    },
    {
        title: "BÃ© vÃ  chÃº chÃ³ nhá»", author: "BÃ i táº­p Ä‘á»c", type: "vÄƒn" as const,
        text: "NhÃ  em cÃ³ má»™t chÃº chÃ³ nhá» ráº¥t khÃ´n. Má»—i chiá»u Ä‘i há»c vá», em vá»«a bÆ°á»›c tá»›i cá»•ng lÃ  chÃº Ä‘Ã£ cháº¡y ra váº«y Ä‘uÃ´i má»«ng rá»¡. Em thÆ°á»ng vuá»‘t ve bá»™ lÃ´ng má»m mÆ°á»£t cá»§a chÃº. ChÃº chÃ³ nhá» lÃ m cho ngÃ´i nhÃ  thÃªm áº¥m Ã¡p vÃ  vui váº».",
        instruction: 'Doc dien cam doan van Be va chu cho nho'
    },
];

// --- GENERATORS ---

export const generateReadingQuestion = (skillId: string, level: number = 1): Question => {
    const grade2PoemPool = [
        {
            text: "BÃ© quÃ©t nhÃ  giÃºp máº¹\nSÃ¢n sáº¡ch bÃ³ng náº¯ng vÃ ng\nMáº¹ nhÃ¬n em má»‰m cÆ°á»i\nKhen em ngoan, chÄƒm chá»‰.",
            questions: [
                { q: "Báº¡n nhá» Ä‘Ã£ lÃ m gÃ¬?", options: ["QuÃ©t nhÃ  giÃºp máº¹", "Äi chÆ¡i cÃ¹ng báº¡n", "TÆ°á»›i cÃ¢y ngoÃ i sÃ¢n"], a: "QuÃ©t nhÃ  giÃºp máº¹" },
                { q: "Máº¹ Ä‘Ã£ lÃ m gÃ¬ khi nhÃ¬n tháº¥y em?", options: ["Má»‰m cÆ°á»i khen em", "Báº£o em Ä‘i ngá»§", "ÄÆ°a em Ä‘áº¿n trÆ°á»ng"], a: "Má»‰m cÆ°á»i khen em" },
                { q: "BÃ i thÆ¡ khen báº¡n nhá» Ä‘iá»u gÃ¬?", options: ["Ngoan vÃ  chÄƒm chá»‰", "Cháº¡y nhanh", "HÃ¡t hay"], a: "Ngoan vÃ  chÄƒm chá»‰" }
            ]
        },
        {
            text: "SÃ¡ng sÃ¢n trÆ°á»ng náº¯ng nháº¹\nCá» Ä‘á» bay trÃªn cao\nBáº¡n bÃ¨ em rÃ­u rÃ­t\nCÃ¹ng nhau Ä‘áº¿n lá»›p nÃ o.",
            questions: [
                { q: "Náº¯ng á»Ÿ sÃ¢n trÆ°á»ng nhÆ° tháº¿ nÃ o?", options: ["Náº¯ng nháº¹", "Náº¯ng gáº¯t", "MÆ°a to"], a: "Náº¯ng nháº¹" },
                { q: "Cá» gÃ¬ bay trÃªn cao?", options: ["Cá» Ä‘á»", "Cá» xanh", "Cá» vÃ ng"], a: "Cá» Ä‘á»" },
                { q: "CÃ¡c báº¡n nhá» Ä‘ang lÃ m gÃ¬?", options: ["CÃ¹ng nhau Ä‘áº¿n lá»›p", "Äi chá»£", "Ra Ä‘á»“ng"], a: "CÃ¹ng nhau Ä‘áº¿n lá»›p" }
            ]
        },
        {
            text: "BÃ  ká»ƒ em nghe chuyá»‡n\nGiá»ng bÃ  áº¥m dá»‹u dÃ ng\nNgoÃ i thá»m hoa ná»Ÿ rá»™\nTá»a hÆ°Æ¡ng thÆ¡m nháº¹ nhÃ ng.",
            questions: [
                { q: "Ai ká»ƒ chuyá»‡n cho em nghe?", options: ["BÃ ", "Máº¹", "CÃ´ giÃ¡o"], a: "BÃ " },
                { q: "Giá»ng bÃ  nhÆ° tháº¿ nÃ o?", options: ["áº¤m vÃ  dá»‹u dÃ ng", "To vÃ  gáº¯t", "Nhá» vÃ  buá»“n"], a: "áº¤m vÃ  dá»‹u dÃ ng" },
                { q: "NgoÃ i thá»m cÃ³ gÃ¬?", options: ["Hoa ná»Ÿ rá»™", "MÆ°a ráº¥t to", "Nhiá»u lÃ¡ khÃ´"], a: "Hoa ná»Ÿ rá»™" }
            ]
        }
    ];

    const grade2ReadingPool = [
        ...READING_PASSAGES_L1,
        {
            text: "Giá» ra chÆ¡i, sÃ¢n trÆ°á»ng ráº¥t vui. CÃ¡c báº¡n nháº£y dÃ¢y, Ä‘Ã¡ cáº§u, Ä‘á»c sÃ¡ch dÆ°á»›i gá»‘c cÃ¢y. Tiáº¿ng cÆ°á»i nÃ³i rá»™n rÃ ng kháº¯p sÃ¢n. Em thÃ­ch nháº¥t lÃ  Ä‘Æ°á»£c chÆ¡i cÃ¹ng cÃ¡c báº¡n.",
            questions: [
                { q: "CÃ¡c báº¡n lÃ m gÃ¬ trong giá» ra chÆ¡i?", options: ["Nháº£y dÃ¢y, Ä‘Ã¡ cáº§u, Ä‘á»c sÃ¡ch", "Ngá»“i ngá»§", "Äi chá»£"], a: "Nháº£y dÃ¢y, Ä‘Ã¡ cáº§u, Ä‘á»c sÃ¡ch" },
                { q: "KhÃ´ng khÃ­ sÃ¢n trÆ°á»ng nhÆ° tháº¿ nÃ o?", options: ["Rá»™n rÃ ng", "YÃªn láº·ng", "Buá»“n bÃ£"], a: "Rá»™n rÃ ng" },
                { q: "Báº¡n nhá» thÃ­ch Ä‘iá»u gÃ¬ nháº¥t?", options: ["ChÆ¡i cÃ¹ng cÃ¡c báº¡n", "á»ž nhÃ  má»™t mÃ¬nh", "Äi há»c muá»™n"], a: "ChÆ¡i cÃ¹ng cÃ¡c báº¡n" }
            ]
        },
        {
            text: "Buá»•i sÃ¡ng, bá»‘ Ä‘Æ°a em Ä‘áº¿n trÆ°á»ng. TrÃªn Ä‘Æ°á»ng Ä‘i, em tháº¥y hÃ ng cÃ¢y xanh mÃ¡t vÃ  nhá»¯ng bÃ´ng hoa ná»Ÿ Ä‘áº¹p bÃªn lá» Ä‘Æ°á»ng. Em chÃ o cÃ´ giÃ¡o rá»“i vÃ o lá»›p há»c. Em cáº£m tháº¥y ráº¥t vui.",
            questions: [
                { q: "Ai Ä‘Æ°a em Ä‘áº¿n trÆ°á»ng?", options: ["Bá»‘", "Máº¹", "Ã”ng"], a: "Bá»‘" },
                { q: "Em tháº¥y gÃ¬ trÃªn Ä‘Æ°á»ng Ä‘i?", options: ["HÃ ng cÃ¢y vÃ  bÃ´ng hoa", "DÃ²ng sÃ´ng lá»›n", "CÃ¡nh Ä‘á»“ng lÃºa"], a: "HÃ ng cÃ¢y vÃ  bÃ´ng hoa" },
                { q: "Em cáº£m tháº¥y tháº¿ nÃ o khi Ä‘áº¿n lá»›p?", options: ["Ráº¥t vui", "Ráº¥t buá»“n", "Ráº¥t má»‡t"], a: "Ráº¥t vui" }
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
        instruction: 'Äá»c Ä‘oáº¡n vÄƒn vÃ  tráº£ lá»i cÃ¢u há»i:',
        content: {
            text: `${passage.text}\n\nâ“ ${qData.q}`,
            options: qData.options
        },
        answer: qData.a,
        hint: 'BÃ© hÃ£y Ä‘á»c ká»¹ láº¡i Ä‘oáº¡n vÄƒn nhÃ©!'
    };
};

export const generateVocabQuestion = (skillId: string, level: number = 1): Question => {
    if (skillId === 'tv2-tu-ngu') {
        const item = getRandom([
            { text: "Tá»« nÃ o chá»‰ sá»± váº­t?", options: ["cÃ¡i bÃ n", "cháº¡y", "xinh"], answer: "cÃ¡i bÃ n" },
            { text: "Tá»« nÃ o chá»‰ hoáº¡t Ä‘á»™ng?", options: ["Ä‘á»c sÃ¡ch", "cÃ¢y bÃ ng", "Ä‘á» tháº¯m"], answer: "Ä‘á»c sÃ¡ch" },
            { text: "Tá»« nÃ o chá»‰ Ä‘áº·c Ä‘iá»ƒm?", options: ["nhanh nháº¹n", "bÃ© Lan", "hÃ¡t"], answer: "nhanh nháº¹n" },
            { text: "NhÃ³m tá»« nÃ o gá»“m toÃ n tá»« chá»‰ sá»± váº­t?", options: ["bÃºt, vá»Ÿ, báº£ng", "Ä‘á»c, viáº¿t, hÃ¡t", "cao, Ä‘áº¹p, ngoan"], answer: "bÃºt, vá»Ÿ, báº£ng" },
            { text: "NhÃ³m tá»« nÃ o gá»“m toÃ n tá»« chá»‰ hoáº¡t Ä‘á»™ng?", options: ["cháº¡y, nháº£y, mÃºa", "hoa, lÃ¡, cá»", "xanh, Ä‘á», tÃ­m"], answer: "cháº¡y, nháº£y, mÃºa" },
            { text: "NhÃ³m tá»« nÃ o gá»“m toÃ n tá»« chá»‰ Ä‘áº·c Ä‘iá»ƒm?", options: ["ngoan, chÄƒm, Ä‘áº¹p", "bÃ n, gháº¿, tá»§", "Äƒn, ngá»§, há»c"], answer: "ngoan, chÄƒm, Ä‘áº¹p" },
            { text: "Trong cÃ¢u 'BÃ© Lan quÃ©t nhÃ  ráº¥t sáº¡ch', tá»« nÃ o chá»‰ hoáº¡t Ä‘á»™ng?", options: ["quÃ©t", "nhÃ ", "sáº¡ch"], answer: "quÃ©t" },
            { text: "Trong cÃ¢u 'Con mÃ¨o tráº¯ng náº±m ngá»§', tá»« nÃ o chá»‰ Ä‘áº·c Ä‘iá»ƒm?", options: ["tráº¯ng", "mÃ¨o", "ngá»§"], answer: "tráº¯ng" }
        ]);

        return {
            id: `vn-wordclass-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Chá»n Ä‘Ã¡p Ã¡n Ä‘Ãºng:',
            content: {
                text: item.text,
                options: item.options
            },
            answer: item.answer
        };
    }

    if (skillId === 'tv2-cau') {
        const item = getRandom([
            { text: "CÃ¢u nÃ o lÃ  cÃ¢u giá»›i thiá»‡u?", options: ["ÄÃ¢y lÃ  báº¡n Minh.", "Báº¡n Minh Ä‘ang Ä‘á»c sÃ¡ch.", "Báº¡n Minh ráº¥t chÄƒm chá»‰."], answer: "ÄÃ¢y lÃ  báº¡n Minh." },
            { text: "CÃ¢u nÃ o lÃ  cÃ¢u nÃªu hoáº¡t Ä‘á»™ng?", options: ["BÃ© Ä‘ang tÆ°á»›i cÃ¢y.", "ÄÃ¢y lÃ  cÃ¢y bÆ°á»Ÿi.", "CÃ¢y bÆ°á»Ÿi ráº¥t cao."], answer: "BÃ© Ä‘ang tÆ°á»›i cÃ¢y." },
            { text: "CÃ¢u 'ÄÃ¢y lÃ  lá»›p em.' thuá»™c kiá»ƒu cÃ¢u gÃ¬?", options: ["CÃ¢u giá»›i thiá»‡u", "CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", "CÃ¢u nÃªu Ä‘áº·c Ä‘iá»ƒm"], answer: "CÃ¢u giá»›i thiá»‡u" },
            { text: "CÃ¢u 'Lan Ä‘ang viáº¿t bÃ i.' thuá»™c kiá»ƒu cÃ¢u gÃ¬?", options: ["CÃ¢u nÃªu hoáº¡t Ä‘á»™ng", "CÃ¢u giá»›i thiá»‡u", "CÃ¢u há»i"], answer: "CÃ¢u nÃªu hoáº¡t Ä‘á»™ng" },
            { text: "Chá»n cÃ¢u giá»›i thiá»‡u Ä‘Ãºng.", options: ["ÄÃ¢y lÃ  chiáº¿c cáº·p cá»§a em.", "Chiáº¿c cáº·p ráº¥t Ä‘áº¹p.", "Em Ä‘eo cáº·p Ä‘áº¿n trÆ°á»ng."], answer: "ÄÃ¢y lÃ  chiáº¿c cáº·p cá»§a em." },
            { text: "Chá»n cÃ¢u nÃªu hoáº¡t Ä‘á»™ng Ä‘Ãºng.", options: ["CÃ¡c báº¡n Ä‘ang xáº¿p hÃ ng.", "ÄÃ¢y lÃ  sÃ¢n trÆ°á»ng.", "SÃ¢n trÆ°á»ng ráº¥t rá»™ng."], answer: "CÃ¡c báº¡n Ä‘ang xáº¿p hÃ ng." },
            { text: "CÃ¢u nÃ o dÃ¹ng Ä‘á»ƒ giá»›i thiá»‡u má»™t ngÆ°á»i báº¡n?", options: ["ÄÃ¢y lÃ  báº¡n Hoa lá»›p em.", "Báº¡n Hoa hÃ¡t ráº¥t hay.", "Báº¡n Hoa Ä‘ang nháº£y dÃ¢y."], answer: "ÄÃ¢y lÃ  báº¡n Hoa lá»›p em." },
            { text: "CÃ¢u nÃ o dÃ¹ng Ä‘á»ƒ nÃ³i vá» hoáº¡t Ä‘á»™ng cá»§a chim?", options: ["Chim Ä‘ang hÃ³t trÃªn cÃ nh.", "ÄÃ¢y lÃ  chÃº chim sáº».", "ChÃº chim ráº¥t nhá»."], answer: "Chim Ä‘ang hÃ³t trÃªn cÃ nh." }
        ]);

        return {
            id: `vn-sentence-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
            subjectId: 'vietnamese',
            skillId,
            type: 'mcq',
            instruction: 'Nháº­n biáº¿t kiá»ƒu cÃ¢u:',
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
        ? "TÃ¬m tá»« CÃ™NG nghÄ©a vá»›i tá»« sau:"
        : "TÃ¬m tá»« TRÃI nghÄ©a vá»›i tá»« sau:";

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
        { text: "Äiá»n dáº¥u cÃ¢u: 'Em chÃ o cÃ´ giÃ¡o'", options: ["Em chÃ o cÃ´ giÃ¡o.", "Em chÃ o cÃ´ giÃ¡o?", "Em chÃ o cÃ´ giÃ¡o!"], answer: "Em chÃ o cÃ´ giÃ¡o.", explain: "ÄÃ¢y lÃ  cÃ¢u ká»ƒ nÃªn dÃ¹ng dáº¥u cháº¥m." },
        { text: "Äiá»n dáº¥u cÃ¢u: 'Báº¡n Ä‘i Ä‘Ã¢u Ä‘áº¥y'", options: ["Báº¡n Ä‘i Ä‘Ã¢u Ä‘áº¥y?", "Báº¡n Ä‘i Ä‘Ã¢u Ä‘áº¥y.", "Báº¡n Ä‘i Ä‘Ã¢u Ä‘áº¥y!"], answer: "Báº¡n Ä‘i Ä‘Ã¢u Ä‘áº¥y?", explain: "ÄÃ¢y lÃ  cÃ¢u há»i nÃªn dÃ¹ng dáº¥u cháº¥m há»i." },
        { text: "Äiá»n dáº¥u cÃ¢u: 'Ã”i bÃ´ng hoa Ä‘áº¹p quÃ¡'", options: ["Ã”i, bÃ´ng hoa Ä‘áº¹p quÃ¡!", "Ã”i bÃ´ng hoa Ä‘áº¹p quÃ¡.", "Ã”i bÃ´ng hoa Ä‘áº¹p quÃ¡?"], answer: "Ã”i, bÃ´ng hoa Ä‘áº¹p quÃ¡!", explain: "CÃ¢u cáº£m thÃ¡n nÃªn dÃ¹ng dáº¥u cháº¥m than." },
        { text: "Cuá»‘i cÃ¢u há»i thÆ°á»ng dÃ¹ng dáº¥u gÃ¬?", options: ["Dáº¥u cháº¥m há»i (?)", "Dáº¥u cháº¥m (.)", "Dáº¥u pháº©y (,)"], answer: "Dáº¥u cháº¥m há»i (?)", explain: "CÃ¢u há»i káº¿t thÃºc báº±ng dáº¥u cháº¥m há»i." }
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
        instruction: 'BÃ i táº­p dáº¥u cÃ¢u:',
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
        instruction: 'BÃ i táº­p Tiáº¿ng Viá»‡t:',
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
            { text: "Chá»n tá»« viáº¿t Ä‘Ãºng chÃ­nh táº£:", options: ["trÆ°á»ng há»c", "chÆ°á»ng há»c"], answer: "trÆ°á»ng há»c", explain: "tr- lÃ  Ä‘Ãºng: trÆ°á»ng há»c." },
            { text: "Chá»n tá»« viáº¿t Ä‘Ãºng:", options: ["con sÃ´ng", "con xÃ´ng"], answer: "con sÃ´ng", explain: "s- lÃ  Ä‘Ãºng: con sÃ´ng." },
            { text: "Chá»n tá»« viáº¿t Ä‘Ãºng:", options: ["ra Ä‘i", "da Ä‘i"], answer: "ra Ä‘i", explain: "r- lÃ  Ä‘Ãºng: ra Ä‘i." },
            { text: "Äiá»n tr hay ch: '...á»i náº¯ng Ä‘áº¹p'", options: ["Trá»i", "Chrá»i"], answer: "Trá»i", explain: "Trá»i náº¯ng Ä‘áº¹p â€” dÃ¹ng tr." },
        ],
        2: [
            { text: "Chá»n tá»« Ä‘Ãºng chÃ­nh táº£:", options: ["sÃ¡ng sá»§a", "xÃ¡ng xá»§a"], answer: "sÃ¡ng sá»§a", explain: "s- lÃ  Ä‘Ãºng: sÃ¡ng sá»§a." },
            { text: "Äiá»n s hay x: '...inh Ä‘áº¹p'", options: ["xinh", "sinh"], answer: "xinh", explain: "Xinh Ä‘áº¹p â€” dÃ¹ng x." },
            { text: "Chá»n tá»« Ä‘Ãºng:", options: ["giÃºp Ä‘á»¡", "dÃºp Ä‘á»¡"], answer: "giÃºp Ä‘á»¡", explain: "gi- lÃ  Ä‘Ãºng: giÃºp Ä‘á»¡." },
            { text: "Äiá»n r hay d: '...Æ°á»›i trá»i mÆ°a'", options: ["DÆ°á»›i", "RÆ°á»›i"], answer: "DÆ°á»›i", explain: "DÆ°á»›i trá»i mÆ°a â€” dÃ¹ng d." },
        ],
        3: [
            { text: "Chá»n tá»« Ä‘Ãºng:", options: ["tranh giÃ nh", "chanh giÃ nh"], answer: "tranh giÃ nh", explain: "tr- lÃ  Ä‘Ãºng: tranh giÃ nh." },
            { text: "Äiá»n s hay x: 'Ä‘... nghÄ©' (nghá»‰ ngÆ¡i)", options: ["suy nghÄ©", "xuy nghÄ©"], answer: "suy nghÄ©", explain: "s- lÃ  Ä‘Ãºng: suy nghÄ©." },
            { text: "Chá»n tá»« Ä‘Ãºng:", options: ["giáº£i thÃ­ch", "dáº£i thÃ­ch"], answer: "giáº£i thÃ­ch", explain: "gi- lÃ  Ä‘Ãºng: giáº£i thÃ­ch." },
            { text: "Äiá»n tr hay ch: '...Äƒm sÃ³c em bÃ©'", options: ["ChÄƒm", "TrÄƒm"], answer: "ChÄƒm", explain: "ch- lÃ  Ä‘Ãºng: chÄƒm sÃ³c." },
        ],
    };
    pools[1].push(
        { text: "Chá»n tá»« viáº¿t Ä‘Ãºng:", options: ["chÄƒm chá»‰", "trÄƒm chá»‰"], answer: "chÄƒm chá»‰", explain: "Tá»« Ä‘Ãºng lÃ  'chÄƒm chá»‰'." },
        { text: "Chá»n tá»« viáº¿t Ä‘Ãºng:", options: ["cÃ¡i chá»•i", "cÃ¡i trá»•i"], answer: "cÃ¡i chá»•i", explain: "Tá»« Ä‘Ãºng lÃ  'cÃ¡i chá»•i'." },
        { text: "Äiá»n s hay x: '...Ã¢n trÆ°á»ng'", options: ["SÃ¢n", "XÃ¢n"], answer: "SÃ¢n", explain: "Tá»« Ä‘Ãºng lÃ  'sÃ¢n trÆ°á»ng'." },
        { text: "Chá»n tá»« viáº¿t Ä‘Ãºng:", options: ["rá»• rÃ¡", "dá»• dÃ¡"], answer: "rá»• rÃ¡", explain: "Tá»« Ä‘Ãºng lÃ  'rá»• rÃ¡'." },
    );
    pools[2].push(
        { text: "Chá»n tá»« Ä‘Ãºng:", options: ["chia sáº»", "tria sáº»"], answer: "chia sáº»", explain: "Tá»« Ä‘Ãºng lÃ  'chia sáº»'." },
        { text: "Chá»n tá»« Ä‘Ãºng:", options: ["xáº¿p hÃ ng", "sáº¿p hÃ ng"], answer: "xáº¿p hÃ ng", explain: "Tá»« Ä‘Ãºng lÃ  'xáº¿p hÃ ng'." },
        { text: "Chá»n tá»« Ä‘Ãºng:", options: ["gia Ä‘Ã¬nh", "da Ä‘Ã¬nh"], answer: "gia Ä‘Ã¬nh", explain: "Tá»« Ä‘Ãºng lÃ  'gia Ä‘Ã¬nh'." },
        { text: "Äiá»n tr hay ch: '...Ãº mÃ¨o nhá»'", options: ["ChÃº", "TrÃº"], answer: "ChÃº", explain: "Tá»« Ä‘Ãºng lÃ  'chÃº mÃ¨o nhá»'." },
    );
    const safeLevel = Math.min(Math.max(level, 1), 3);
    const item = getRandom(pools[safeLevel]);
    return {
        id: `vn-spell-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv2-chinh-ta', type: 'mcq',
        instruction: 'BÃ i táº­p chÃ­nh táº£ â€” PhÃ¢n biá»‡t phá»¥ Ã¢m:',
        content: { text: item.text, options: item.options },
        answer: item.answer, explanation: item.explain
    };
}

function generateCreativeWritingQuestion(skillId: string, level: number): Question {
    const prompts: Record<string, { text: string; hint: string }[]> = {
        'tv2-ke-chuyen': [
            { text: "Ká»ƒ láº¡i viá»‡c em chuáº©n bá»‹ Ä‘i há»c vÃ o buá»•i sÃ¡ng theo trÃ¬nh tá»±.", hint: "Gá»£i Ã½: Thá»©c dáº­y â†’ vá»‡ sinh cÃ¡ nhÃ¢n â†’ Äƒn sÃ¡ng â†’ Ä‘áº¿n trÆ°á»ng." },
            { text: "NhÃ¬n tranh vÃ  ká»ƒ láº¡i má»™t buá»•i em cÃ¹ng gia Ä‘Ã¬nh Ä‘i thÄƒm Ã´ng bÃ .", hint: "Gá»£i Ã½: Em Ä‘i vá»›i ai â†’ mang theo gÃ¬ â†’ gáº·p Ã´ng bÃ  ra sao â†’ cáº£m xÃºc cá»§a em." },
            { text: "Ká»ƒ láº¡i má»™t viá»‡c tá»‘t em Ä‘Ã£ lÃ m á»Ÿ lá»›p hoáº·c á»Ÿ nhÃ .", hint: "Gá»£i Ã½: Viá»‡c Ä‘Ã³ diá»…n ra khi nÃ o â†’ em Ä‘Ã£ lÃ m gÃ¬ â†’ má»i ngÆ°á»i cáº£m tháº¥y tháº¿ nÃ o." },
        ],
        'tv2-ta-nguoi': [
            { text: "Táº£ ngÆ°á»i thÃ¢n mÃ  bÃ© yÃªu quÃ½ nháº¥t (máº¹, bá»‘, Ã´ng, bÃ ).", hint: "Gá»£i Ã½: HÃ¬nh dÃ¡ng â†’ TÃ­nh cÃ¡ch â†’ Viá»‡c thÆ°á»ng lÃ m â†’ TÃ¬nh cáº£m cá»§a bÃ©." },
            { text: "Táº£ cÃ´ giÃ¡o (hoáº·c tháº§y giÃ¡o) cá»§a bÃ©.", hint: "Gá»£i Ã½: Ngoáº¡i hÃ¬nh â†’ Giá»ng nÃ³i â†’ CÃ¡ch dáº¡y â†’ BÃ© thÃ­ch Ä‘iá»u gÃ¬?" },
            { text: "Táº£ báº¡n thÃ¢n nháº¥t cá»§a bÃ© á»Ÿ lá»›p.", hint: "Gá»£i Ã½: TÃªn báº¡n â†’ Ngoáº¡i hÃ¬nh â†’ Hay chÆ¡i gÃ¬ cÃ¹ng â†’ Ká»· niá»‡m Ä‘Ã¡ng nhá»›." },
        ],
        'tv3-sang-tao': [
            { text: "Viết đoạn văn ngắn tả sân trường giờ ra chơi.", hint: "Gợi ý: Cảnh vật -> âm thanh -> hoạt động của các bạn -> cảm xúc của em." },
            { text: "Viết 5 đến 7 câu tả một đồ vật em thường dùng để học tập.", hint: "Gợi ý: Tên đồ vật -> hình dáng, màu sắc -> công dụng -> vì sao em thích." },
            { text: "Viết tiếp câu chuyện: 'Giờ ra chơi hôm ấy, sân trường bỗng rộn lên vì một chú chim nhỏ...'", hint: "Gợi ý: Chú chim xuất hiện thế nào -> các bạn làm gì -> câu chuyện kết thúc ra sao." },
        ],
        'tv4-mieu-ta': [
            { text: "Viết đoạn văn tả cây bóng mát trong sân trường.", hint: "Gợi ý: Tên cây -> thân, lá, bóng mát -> ích lợi -> tình cảm của em." },
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
    return {
        id: `vn-creative-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId, type: 'speaking',
        instruction: skillId === 'tv2-ta-nguoi' ? 'BÃ i táº­p táº£ ngÆ°á»i:' : skillId === 'tv3-sang-tao' ? 'Viáº¿t sÃ¡ng táº¡o:' : 'Ká»ƒ chuyá»‡n:',
        content: { text: item.text },
        answer: 'BÃ i viáº¿t tá»± do', hint: item.hint
    };
}

function generateLetterWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viáº¿t má»™t bá»©c thÆ° ngáº¯n gá»­i báº¡n thÃ¢n, ká»ƒ vá» ká»³ nghá»‰ hÃ¨ cá»§a bÃ©.", hint: "Gá»£i Ã½: Pháº§n Ä‘áº§u thÆ° (gá»­i ai) â†’ Ná»™i dung (Ä‘i Ä‘Ã¢u, chÆ¡i gÃ¬) â†’ Káº¿t thÆ° (chÃºc báº¡n)." },
        { text: "Viáº¿t thÆ° cho Ã´ng/bÃ  á»Ÿ quÃª, há»i thÄƒm sá»©c khá»e.", hint: "Gá»£i Ã½: KÃ­nh gá»­i... â†’ Há»i thÄƒm â†’ Ká»ƒ chuyá»‡n há»c â†’ Há»©a vá» thÄƒm." },
        { text: "Viáº¿t Ä‘Æ¡n xin phÃ©p nghá»‰ há»c 1 ngÃ y vÃ¬ bá»‹ á»‘m.", hint: "Gá»£i Ã½: KÃ­nh gá»­i cÃ´ giÃ¡o â†’ Em tÃªn... lá»›p... â†’ LÃ½ do â†’ KÃ­nh mong cÃ´ cho phÃ©p." },
    ];
    const item = getRandom(prompts);
    return {
        id: `vn-letter-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv3-viet-thu', type: 'speaking',
        instruction: 'Viáº¿t thÆ° & Viáº¿t Ä‘Æ¡n:',
        content: { text: item.text },
        answer: 'BÃ i viáº¿t tá»± do', hint: item.hint
    };
}

function generateReportWritingQuestion(level: number): Question {
    const prompts = [
        { text: "Viáº¿t bÃ¡o cÃ¡o ngáº¯n vá» buá»•i sinh hoáº¡t lá»›p tuáº§n nÃ y.", hint: "Gá»£i Ã½: NgÃ y... lá»›p... há»p â†’ Ná»™i dung chÃ­nh â†’ Quyáº¿t Ä‘á»‹nh/ káº¿ hoáº¡ch." },
        { text: "Viáº¿t bÃ¡o cÃ¡o vá» hoáº¡t Ä‘á»™ng trá»“ng cÃ¢y xanh cá»§a lá»›p.", hint: "Gá»£i Ã½: Thá»i gian â†’ Äá»‹a Ä‘iá»ƒm â†’ Ai tham gia â†’ Káº¿t quáº£ â†’ Cáº£m nghÄ©." },
        { text: "Viáº¿t bÃ¡o cÃ¡o káº¿t quáº£ há»c táº­p cá»§a bÃ© trong thÃ¡ng.", hint: "Gá»£i Ã½: TÃªn bÃ© â†’ MÃ´n nÃ o giá»i â†’ MÃ´n nÃ o cáº§n cá»‘ gáº¯ng â†’ Káº¿ hoáº¡ch thÃ¡ng sau." },
    ];
    const item = getRandom(prompts);
    return {
        id: `vn-report-${Date.now() + '-' + Math.random().toString(36).substring(2, 6)}`,
        subjectId: 'vietnamese', skillId: 'tv3-bao-cao', type: 'speaking',
        instruction: 'Viáº¿t bÃ¡o cÃ¡o ngáº¯n:',
        content: { text: item.text },
        answer: 'BÃ i viáº¿t tá»± do', hint: item.hint
    };
}

// === SPEAKING TOPICS (level-tiered) ===
const SPEAKING_TOPICS_L1 = [
    {
        topic: "Ká»ƒ vá» má»™t ngÆ°á»i mÃ  con yÃªu thÆ°Æ¡ng nháº¥t.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Giá»›i thiá»‡u ngÆ°á»i Ä‘Ã³ lÃ  ai.\n2. ThÃ¢n bÃ i: 2 lÃ½ do táº¡i sao con yÃªu thÆ°Æ¡ng há».\n3. Káº¿t bÃ i: TÃ¬nh cáº£m cá»§a con."
    },
    {
        topic: "Ká»ƒ vá» má»™t ká»· niá»‡m Ä‘Ã¡ng nhá»› nháº¥t cá»§a con trong dá»‹p Táº¿t.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Giá»›i thiá»‡u Ä‘Ã³ lÃ  Táº¿t nÄƒm nÃ o.\n2. ThÃ¢n bÃ i: 2 viá»‡c lÃ m con nhá»› nháº¥t.\n3. Káº¿t bÃ i: Cáº£m xÃºc khi nhá»› láº¡i."
    },
    {
        topic: "Ká»ƒ vá» con váº­t mÃ  con yÃªu thÃ­ch nháº¥t.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Con váº­t Ä‘Ã³ lÃ  gÃ¬.\n2. ThÃ¢n bÃ i: MiÃªu táº£ hÃ¬nh dÃ¡ng, tÃ­nh cÃ¡ch.\n3. Káº¿t bÃ i: Táº¡i sao con thÃ­ch."
    }
];

const SPEAKING_TOPICS_L2 = [
    {
        topic: "Náº¿u cÃ³ má»™t phÃ©p thuáº­t, con muá»‘n lÃ m gÃ¬ Ä‘á»ƒ giÃºp Ä‘á»¡ má»i ngÆ°á»i?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: PhÃ©p thuáº­t con muá»‘n cÃ³.\n2. ThÃ¢n bÃ i: 2 viá»‡c tá»‘t con sáº½ lÃ m.\n3. Káº¿t bÃ i: Cáº£m nháº­n khi lÃ m viá»‡c tá»‘t."
    },
    {
        topic: "Theo con, táº¡i sao chÃºng ta cáº§n pháº£i báº£o vá»‡ mÃ´i trÆ°á»ng?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Táº§m quan trá»ng cá»§a mÃ´i trÆ°á»ng.\n2. ThÃ¢n bÃ i: 2 lÃ½ do cáº§n báº£o vá»‡.\n3. Káº¿t bÃ i: Lá»i khuyÃªn má»i ngÆ°á»i."
    },
    {
        topic: "Giá»›i thiá»‡u vá» má»™t cuá»‘n sÃ¡ch hoáº·c cÃ¢u chuyá»‡n mÃ  con thÃ­ch nháº¥t.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: TÃªn sÃ¡ch.\n2. ThÃ¢n bÃ i: Ná»™i dung vÃ  bÃ i há»c.\n3. Káº¿t bÃ i: KhuyÃªn báº¡n Ä‘á»c thá»­."
    }
];

const SPEAKING_TOPICS_L3 = [
    {
        topic: "Con nghÄ© mÃ¬nh sáº½ lÃ m nghá» gÃ¬ khi lá»›n lÃªn? VÃ¬ sao?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Nghá» mÆ¡ Æ°á»›c.\n2. ThÃ¢n bÃ i: LÃ½ do chá»n nghá», cáº§n lÃ m gÃ¬ Ä‘á»ƒ Ä‘áº¡t Ä‘Æ°á»£c.\n3. Káº¿t bÃ i: Quyáº¿t tÃ¢m."
    },
    {
        topic: "Theo con, há»c nhÃ³m vÃ  há»c má»™t mÃ¬nh, cÃ¡ch nÃ o tá»‘t hÆ¡n?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu váº¥n Ä‘á».\n2. ThÃ¢n bÃ i: Æ¯u/nhÆ°á»£c Ä‘iá»ƒm má»—i cÃ¡ch.\n3. Káº¿t bÃ i: Ã kiáº¿n cÃ¡ nhÃ¢n."
    }
];

const EXTRA_SPEAKING_TOPICS_L1 = [
    {
        topic: "Ká»ƒ vá» má»™t buá»•i Ä‘i chÆ¡i cÃ¹ng gia Ä‘Ã¬nh mÃ  con nhá»› nháº¥t.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Con Ä‘i Ä‘Ã¢u, Ä‘i vá»›i ai.\n2. ThÃ¢n bÃ i: Nhá»¯ng viá»‡c vui con Ä‘Ã£ lÃ m.\n3. Káº¿t bÃ i: Äiá»u con thÃ­ch nháº¥t trong chuyáº¿n Ä‘i."
    },
    {
        topic: "Giá»›i thiá»‡u vá» gÃ³c há»c táº­p cá»§a con.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: GÃ³c há»c táº­p á»Ÿ Ä‘Ã¢u.\n2. ThÃ¢n bÃ i: CÃ³ nhá»¯ng Ä‘á»“ váº­t gÃ¬, con dÃ¹ng tháº¿ nÃ o.\n3. Káº¿t bÃ i: VÃ¬ sao con yÃªu gÃ³c há»c táº­p Ä‘Ã³."
    },
    {
        topic: "Ká»ƒ vá» má»™t ngÆ°á»i báº¡n tá»‘t cá»§a con.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Báº¡n tÃªn gÃ¬, há»c cÃ¹ng lá»›p nÃ o.\n2. ThÃ¢n bÃ i: Báº¡n cÃ³ Ä‘iá»ƒm gÃ¬ Ä‘Ã¡ng quÃ½, hai báº¡n thÆ°á»ng lÃ m gÃ¬ cÃ¹ng nhau.\n3. Káº¿t bÃ i: Con quÃ½ báº¡n ra sao."
    },
    {
        topic: "Con thÃ­ch mÃ¹a nÃ o nháº¥t trong nÄƒm? HÃ£y nÃ³i lÃ½ do.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Con thÃ­ch mÃ¹a nÃ o.\n2. ThÃ¢n bÃ i: Thá»i tiáº¿t, cáº£nh váº­t vÃ  hoáº¡t Ä‘á»™ng con yÃªu thÃ­ch trong mÃ¹a Ä‘Ã³.\n3. Káº¿t bÃ i: Cáº£m xÃºc cá»§a con."
    },
];

const EXTRA_SPEAKING_TOPICS_L2 = [
    {
        topic: "Theo con, vÃ¬ sao chÃºng ta cáº§n chÄƒm chá»‰ Ä‘á»c sÃ¡ch?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu Ã½ kiáº¿n cá»§a con.\n2. ThÃ¢n bÃ i: Ãt nháº¥t 2 lá»£i Ã­ch cá»§a viá»‡c Ä‘á»c sÃ¡ch.\n3. Káº¿t bÃ i: Lá»i khuyÃªn dÃ nh cho cÃ¡c báº¡n."
    },
    {
        topic: "Náº¿u Ä‘Æ°á»£c lÃ m lá»›p trÆ°á»Ÿng má»™t ngÃ y, con sáº½ lÃ m gÃ¬?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Con sáº½ nháº­n nhiá»‡m vá»¥ gÃ¬.\n2. ThÃ¢n bÃ i: 2-3 viá»‡c con muá»‘n lÃ m cho lá»›p tá»‘t hÆ¡n.\n3. Káº¿t bÃ i: Äiá»u con mong muá»‘n nháº¥t."
    },
    {
        topic: "Con nghÄ© há»c sinh cÃ³ nÃªn tá»± dá»n gÃ³c há»c táº­p cá»§a mÃ¬nh khÃ´ng? VÃ¬ sao?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Tráº£ lá»i cÃ³ hay khÃ´ng.\n2. ThÃ¢n bÃ i: 2 lÃ½ do báº£o vá»‡ Ã½ kiáº¿n.\n3. Káº¿t bÃ i: ThÃ³i quen tá»‘t con muá»‘n giá»¯."
    },
    {
        topic: "Giá»›i thiá»‡u má»™t viá»‡c tá»‘t mÃ  con tá»«ng lÃ m Ä‘á»ƒ giÃºp ngÆ°á»i khÃ¡c.",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Viá»‡c tá»‘t Ä‘Ã³ lÃ  gÃ¬.\n2. ThÃ¢n bÃ i: Con Ä‘Ã£ lÃ m tháº¿ nÃ o, ngÆ°á»i Ä‘Æ°á»£c giÃºp cáº£m tháº¥y ra sao.\n3. Káº¿t bÃ i: BÃ i há»c con nháº­n Ä‘Æ°á»£c."
    },
    {
        topic: "Theo con, vÃ¬ sao chÃºng ta cáº§n giá»¯ gÃ¬n sÃ¡ch vá»Ÿ vÃ  Ä‘á»“ dÃ¹ng há»c táº­p?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu Ã½ kiáº¿n cá»§a con.\n2. ThÃ¢n bÃ i: 2 lÃ­ do nÃªn giá»¯ gÃ¬n sÃ¡ch vá»Ÿ, Ä‘á»“ dÃ¹ng.\n3. Káº¿t bÃ i: Viá»‡c con sáº½ lÃ m háº±ng ngÃ y."
    },
];

const EXTRA_SPEAKING_TOPICS_L3 = [
    {
        topic: "Theo con, há»c Ä‘Ãºng giá» vÃ  lÃ m bÃ i Ä‘áº§y Ä‘á»§ cÃ³ lá»£i gÃ¬ cho há»c sinh?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu Ã½ kiáº¿n cá»§a con.\n2. ThÃ¢n bÃ i: 2 lá»£i Ã­ch cá»§a viá»‡c há»c Ä‘Ãºng giá», lÃ m bÃ i Ä‘áº§y Ä‘á»§.\n3. Káº¿t bÃ i: Äiá»u con muá»‘n rÃ¨n luyá»‡n."
    },
    {
        topic: "Con Ä‘á»“ng Ã½ hay khÃ´ng vá»›i Ã½ kiáº¿n: 'Giá»¯ lá»i há»©a lÃ  Ä‘iá»u ráº¥t quan trá»ng'?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu Ã½ kiáº¿n Ä‘á»“ng Ã½ hay khÃ´ng.\n2. ThÃ¢n bÃ i: 2 lÃ­ do hoáº·c vÃ­ dá»¥ gáº§n gÅ©i.\n3. Káº¿t bÃ i: BÃ i há»c con rÃºt ra."
    },
    {
        topic: "Theo con, há»c sinh nÃªn lÃ m gÃ¬ Ä‘á»ƒ lá»›p há»c luÃ´n sáº¡ch Ä‘áº¹p?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: NÃªu váº¥n Ä‘á».\n2. ThÃ¢n bÃ i: Ká»ƒ 2 hoáº·c 3 viá»‡c há»c sinh nÃªn lÃ m.\n3. Káº¿t bÃ i: Lá»i nháº¯n cá»§a con vá»›i cÃ¡c báº¡n."
    },
    {
        topic: "Náº¿u Ä‘Æ°á»£c gÃ³p Ã½ cho lá»›p mÃ¬nh tiáº¿n bá»™ hÆ¡n, con sáº½ Ä‘á» xuáº¥t Ä‘iá»u gÃ¬?",
        hint: "DÃ n Ã½:\n1. Má»Ÿ bÃ i: Äiá»u con muá»‘n gÃ³p Ã½.\n2. ThÃ¢n bÃ i: VÃ¬ sao cáº§n lÃ m nhÆ° váº­y vÃ  lá»£i Ã­ch mang láº¡i.\n3. Káº¿t bÃ i: Mong muá»‘n cá»§a con."
    },
];

const SPEAKING_PROMPTS_BY_SKILL: Record<string, { instruction: string; prompts: { topic: string; hint: string }[] }> = {
    'tv2-noi-nghe': {
        instruction: 'Bé hãy kể lại rõ ràng, đủ ý về nội dung sau:',
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
            { topic: "Theo em, học sinh có nên xếp hàng và giữ trật tự khi ra vào lớp không?", hint: "Dàn ý:\n1. Trả lời có hay không.\n2. Nêu 2 lí do.\n3. Điều em sẽ thực hiện." },
            { topic: "Theo em, vì sao chúng ta cần giữ vệ sinh lớp học?", hint: "Dàn ý:\n1. Nêu ý kiến.\n2. Kể 2 việc nên làm để giữ vệ sinh.\n3. Lời nhắn với các bạn." },
            { topic: "Theo em, đọc sách mỗi ngày có ích gì?", hint: "Dàn ý:\n1. Nêu ý kiến.\n2. Kể 2 lợi ích của việc đọc sách.\n3. Thói quen em muốn duy trì." },
        ],
    },
    'tv3-hung-bien': {
        instruction: 'Bé hãy trình bày ý kiến ngắn gọn, rõ ràng về nội dung sau:',
        prompts: [
            { topic: "Theo em, học sinh có nên tự giác làm bài tập ở nhà không? Vì sao?", hint: "Dàn ý:\n1. Nêu ý kiến đồng ý hay không.\n2. Trình bày 2 lí do gần gũi.\n3. Điều em sẽ cố gắng thực hiện." },
            { topic: "Theo em, giữ lời hứa với bạn bè và người thân có quan trọng không?", hint: "Dàn ý:\n1. Nêu ý kiến của em.\n2. Đưa ra 2 lí do hoặc ví dụ đơn giản.\n3. Bài học em rút ra." },
            { topic: "Theo em, học sinh nên làm gì để trường lớp sạch đẹp hơn?", hint: "Dàn ý:\n1. Nêu vấn đề.\n2. Trình bày 2 hoặc 3 việc nên làm.\n3. Lời kêu gọi các bạn cùng thực hiện." },
        ],
    },
};

export const generateSpeakingQuestion = (skillId: string, level: number = 1): Question => {

    // Äá»c diá»…n cáº£m: chá»n ngáº«u nhiÃªn Ä‘oáº¡n thÆ¡/vÄƒn
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
            answer: "Đã đọc"
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
            answer: "Đã nói"
        };
    }

    // HÃ¹ng biá»‡n / NÃ³i: Ä‘á» tÃ i theo level
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
        instruction: 'Bé hãy suy nghĩ dàn ý và hùng biện về chủ đề sau:',
        content: {
            text: selectedTopic.topic
        },
        hint: selectedTopic.hint,
        answer: "Đã nói"
    };
}


