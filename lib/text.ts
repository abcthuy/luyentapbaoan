const MOJIBAKE_PATTERN = /[ÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßĂăĐđƠơƯưá»]/;
const UNICODE_ESCAPE_PATTERN = /\\u[0-9a-fA-F]{4}/;

function scoreVietnameseText(value: string): number {
    const matches = value.match(/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi);
    return matches ? matches.length : 0;
}

const NORMALIZATION_MAP: Record<string, string> = {
    // Wallet
    'Ví': 'Ví của bé',
    'Cửa hàng': 'Cửa hàng quà tặng',
    'Tiết kiệm': 'Heo đất tiết kiệm',
    'Lịch sử': 'Lịch sử giao dịch',
    'Tổng tài sản': 'Tổng tài sản của bé',
    'Điểm danh': 'Điểm danh nhận quà',
    'Đã nhận': 'Hôm nay đã nhận',
    'Mẹo nhỏ': 'Mẹo nhỏ cho bé',
    'Gửi càng lâu, lãi suất càng cao. Bé hãy học thật tốt để tích lũy thêm nhiều nhé! 🚀': 'Gửi càng lâu, lãi suất càng cao. Bé hãy học thật tốt để tích lũy thêm nhiều nhé! 🚀',
    'Ví:': 'Ví:',
    'Heo:': 'Heo:',
    'Tiết kiệm:': 'Tiết kiệm:',
    'sổ': 'sổ',
    'Điểm danh ngày': 'Điểm danh ngày',

    // Profiles
    'Ai đang học vậy?': 'Hôm nay ai học thế nhỉ?',
    'Chọn hồ sơ để bắt đầu nhé!': 'Chọn hồ sơ của mình để bắt đầu nhé!',
    'Thêm hồ sơ': 'Thêm hồ sơ mới',
    'Bảng vàng': 'Bảng vàng vinh danh',
    'Top 5 xuất sắc': 'Top 5 bạn nhỏ xuất sắc',
    'Tạo hồ sơ mới': 'Tạo hồ sơ học tập mới',
    'Mở khóa': 'Mở khóa hồ sơ',
    'Đang tải dữ liệu...': 'Đang tải dữ liệu...',
    'Thiết lập admin': 'Thiết lập admin',
    'Admin': 'Admin',
    'Phụ huynh': 'Phụ huynh',
    'Tập sự': 'Tập sự',
    'Bạn đang quản lý với vai trò admin.': 'Bạn đang quản lý với vai trò admin.',
    'Tên học sinh': 'Tên học sinh',
    'Tên của bé...': 'Tên của bé...',
    'Chọn avatar': 'Chọn avatar',
    'PIN hồ sơ (tùy chọn)': 'Mã PIN bảo vệ (tùy chọn)',
    'Nhập 4 số để bảo vệ hồ sơ...': 'Nhập 4 số để bảo vệ hồ sơ...',
    'Hủy': 'Hủy',
    'Tạo ngay': 'Tạo ngay',
    'Hồ sơ này được bảo vệ.': 'Hồ sơ này được bảo vệ.',
    'Nhập PIN hồ sơ': 'Nhập mã PIN',
    'Xóa hồ sơ này?': 'Xóa hồ sơ này?',
    'Bạn đang đăng nhập với vai trò admin. Hành động này không thể hoàn tác.': 'Hành động này không thể hoàn tác.',
    'Xóa vĩnh viễn': 'Xóa vĩnh viễn',
    'Tên này đã tồn tại, vui lòng chọn tên khác!': 'Tên này đã tồn tại, vui lòng chọn tên khác!',
    'PIN của hồ sơ phải có ít nhất 4 số!': 'Mã PIN phải có ít nhất 4 số!',
    'PIN của hồ sơ không đúng, thử lại nhé!': 'Mã PIN chưa đúng, bé thử lại nhé!',

    // Subjects
    'Toán học': 'Toán học kỳ thú',
    'Tiếng Việt': 'Tiếng Việt yêu thương',
    'Tiếng Anh': 'Tiếng Anh vui nhộn',
    'Tài chính': 'Tài chính thông minh',
    'Khám phá thế giới số học kỳ thú.': 'Khám phá thế giới số học kỳ thú.',
    'Rèn luyện ngôn ngữ và văn học.': 'Rèn luyện ngôn ngữ và văn học.',
    'Kết nối toàn cầu qua ngôn ngữ.': 'Kết nối toàn cầu qua ngôn ngữ.',
    'Học cách quản lý tiền và chi tiêu.': 'Học cách quản lý tiền và chi tiêu.',
    'Hôm nay': 'Hôm nay',
    'muốn khám phá điều gì?': 'muốn khám phá điều gì?',
    'Chưa đủ điều kiện!': 'Chưa đủ điều kiện!',
    'Vui lòng nhập mã PIN mới': 'Vui lòng nhập mã PIN mới',
    'Mã PIN phải có ít nhất 4 số': 'Mã PIN phải có ít nhất 4 số',
    'Mã PIN nhập lại không khớp': 'Mã PIN nhập lại không khớp',
    'Đổi mã PIN thành công!': 'Đổi mã PIN thành công!',
    'Bạn có chắc muốn xóa mã PIN không? Hồ sơ sẽ không còn được bảo vệ.': 'Bạn có chắc muốn xóa mã PIN không?',
    'Đã xóa mã PIN!': 'Đã xóa mã PIN!',
    'Tiến độ mở khóa': 'Tiến độ mở khóa',
    '🔥 Thành tích': '🔥 Thành tích của bé',
    'Điều chỉnh trải nghiệm học tập cho': 'Điều chỉnh trải nghiệm học tập cho',
    'Lớp học': 'Lớp học',
    'Chương trình học': 'Chương trình học',
    'Công khai': 'Công khai hồ sơ',
    'Hiện trên BXH': 'Hiện trên BXH',
    'Bảo mật (PIN)': 'Bảo mật (Mã PIN)',
    'Mã mới': 'Mã mới',
    'Xác nhận': 'Xác nhận',
    'Cập nhật PIN': 'Cập nhật PIN',
    'Xóa PIN hiện tại': 'Xóa PIN hiện tại',
    'Đóng cài đặt': 'Đóng cài đặt',
    'Chọn môn học': 'Chọn môn học yêu thích',
    'Tiến độ': 'Tiến độ hoàn thành',
    'Bắt đầu học': 'Bắt đầu học ngay',
    'Cài đặt cá nhân': 'Cài đặt của bé',
    'Học sinh lớp': 'Học sinh lớp',

    // Today / Session
    'Đấu Trường Trí Tuệ': 'Đấu trường trí tuệ',
    'Nhà Toán Học Nhí': 'Nhà toán học tài ba',
    'Nhà Văn Nhí': 'Nhà văn nhí tài năng',
    'Nhà Ngôn Ngữ Học': 'Nhà ngôn ngữ học nhí',
    'Nhà Đầu Tư Nhí': 'Nhà đầu tư thông thái',
    'Chế độ Thách đấu': 'Chế độ thách đấu',
    'Xuất sắc!': 'Xuất sắc quá đi!',
    'Rất giỏi!': 'Con làm rất giỏi!',
    'Tốt lắm!': 'Làm tốt lắm con ơi!',
    'Cố lên nào!': 'Cố gắng lên nào!',
    'Chơi lại': 'Thử sức lại nhé',
    'Trang chủ': 'Về trang chủ',
    'Hãy chọn mức độ phù hợp để bắt đầu hành trình chinh phục kiến thức ngay bây giờ!': 'Hãy chọn mức độ phù hợp để bắt đầu hành trình chinh phục kiến thức ngay bây giờ!',
    'Chính xác': 'Chính xác',
    'Điểm thưởng': 'Điểm thưởng',
    'Thời gian': 'Thời gian',
    'Học viên': 'Học viên',
    'Chuyên gia': 'Chuyên gia',
    'Giáo sư': 'Giáo sư',
    'Rèn luyện tư duy mỗi ngày': 'Rèn luyện tư duy mỗi ngày',
    'NGÀY': 'NGÀY',
    'câu': 'câu',
    'phút': 'phút',
    'Bé đã quá giỏi mức này!': 'Bé đã quá giỏi mức này!',
    'Cấp độ hiện tại': 'Cấp độ hiện tại',
    'Chính xác! Bạn rất giỏi.': 'Chính xác! Bạn rất giỏi.',
    'Chưa đúng rồi. Đáp án là:': 'Chưa đúng rồi. Đáp án là:',
    'Ôn lại câu con đã từng làm sai:': 'Ôn lại câu con đã từng làm sai:',
    'Con thử nhìn lại cách làm thật chậm nhé.': 'Con thử nhìn lại cách làm thật chậm nhé.',

    // Reusable Components
    'Đang đọc truyện... Bé lắng nghe nhé!': 'Đang đọc truyện... Bé lắng nghe nhé!',
    'Đã dừng. Bấm "Nghe tiếp" khi bé sẵn sàng!': 'Đã dừng. Bấm "Nghe tiếp" khi bé sẵn sàng!',
    'Đã nghe xong! Bé trả lời câu hỏi bên dưới nhé!': 'Đã nghe xong! Bé trả lời câu hỏi bên dưới nhé!',
    'Bấm nút bên dưới khi bé sẵn sàng nghe truyện!': 'Bấm nút bên dưới khi bé sẵn sàng nghe truyện!',
    'Sẵn sàng nghe': 'Sẵn sàng nghe',
    'Dừng lại': 'Dừng lại',
    'Nghe tiếp': 'Nghe tiếp',
    'Nghe lại từ đầu': 'Nghe lại từ đầu',
    'Nghe lại': 'Nghe lại',
    'Xem truyện': 'Xem truyện',
    'Ẩn truyện': 'Ẩn truyện',
    'Ẩn cài đặt': 'Ẩn cài đặt',
    'Giọng đọc và tốc độ': 'Giọng đọc và tốc độ',
    'Giọng đọc': 'Giọng đọc',
    'Tốc độ': 'Tốc độ',
    'Chậm': 'Chậm',
    'Thường': 'Thường',
    'Nhanh': 'Nhanh',
    'Chốt đáp án': 'Chốt đáp án',
    'Nộp bài': 'Nộp bài',
    'Hoàn thành': 'Hoàn thành',
    'Trả lời': 'Trả lời',
    'Đang chấm bài...': 'Đang chấm bài...',
    'Kéo thả để sắp xếp': 'Kéo thả để sắp xếp',
    'Ẩn gợi ý': 'Ẩn gợi ý',
    'Xem gợi ý dàn ý': 'Xem gợi ý dàn ý',
    'Đang ghi âm': 'Đang ghi âm',
    'Nhấn để bắt đầu nói': 'Nhấn để bắt đầu nói',
    'Bản ghi âm của bé': 'Bản ghi âm của bé',
    'Gửi Bài Chấm': 'Gửi Bài Chấm',
    'Không dùng mic? Nhập phần con muốn nói': 'Không dùng mic? Nhập phần con muốn nói',
    'Gửi Bài Bằng Chữ': 'Gửi Bài Bằng Chữ',
    'Ví của bé': 'Ví của bé',
};

export function normalizeDisplayText(value: string | undefined | null): string {
    if (!value) return '';
    
    // Check map first
    if (NORMALIZATION_MAP[value]) {
        return NORMALIZATION_MAP[value];
    }

    let normalized = value;

    if (UNICODE_ESCAPE_PATTERN.test(normalized)) {
        normalized = normalized.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
        if (!MOJIBAKE_PATTERN.test(normalized)) break;

        try {
            const bytes = Uint8Array.from(Array.from(normalized).map((char) => char.charCodeAt(0) & 0xff));
            const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
            if (scoreVietnameseText(decoded) < scoreVietnameseText(normalized)) break;
            if (decoded === normalized) break;
            normalized = decoded;
        } catch {
            break;
        }
    }

    return normalized;
}
