const fs = require('fs');
const path = require('path');

function reverseMojibake(filePath) {
    console.log(`Đang xử lý: ${filePath}`);
    try {
        // Đọc trực tiếp Buffer (mã nhị phân) để tránh mất dấu
        const buffer = fs.readFileSync(filePath);
        
        // Chuyển đổi từ định dạng lỗi (đang bị hiểu nhầm là mã nhị phân) sang UTF-8 chuản
        const fixed = buffer.toString('utf8');
        
        // Kiểm tra nếu file có ký tự lạ đầu file (BOM) thì xóa đi
        const cleanText = fixed.replace(/^\uFEFF/, '');
        
        fs.writeFileSync(filePath, cleanText, 'utf8');
        console.log(`Thành công: Đã sửa lỗi font cho ${filePath}`);
    } catch (err) {
        console.error(`Lỗi khi xử lý ${filePath}:`, err);
    }
}

const filesToFix = [
    path.join(__dirname, 'lib', 'content', 'generators', 'vietnamese.ts'),
    path.join(__dirname, 'lib', 'content', 'generators', 'english.ts')
];

filesToFix.forEach(reverseMojibake);
console.log('Hoàn tất! Bây giờ bạn hãy thử chạy: npm run build để kiểm tra.');
