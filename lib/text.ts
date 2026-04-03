const MOJIBAKE_PATTERN = /[ÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßĂăĐđƠơƯưá»]/;
const UNICODE_ESCAPE_PATTERN = /\\u[0-9a-fA-F]{4}/;

function scoreVietnameseText(value: string): number {
    const matches = value.match(/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/gi);
    return matches ? matches.length : 0;
}

export function normalizeDisplayText(value: string | undefined | null): string {
    if (!value) return '';
    let normalized = value;

    if (UNICODE_ESCAPE_PATTERN.test(normalized)) {
        normalized = normalized.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );
    }

    if (!MOJIBAKE_PATTERN.test(normalized)) return normalized;

    try {
        const bytes = Uint8Array.from(Array.from(normalized).map((char) => char.charCodeAt(0) & 0xff));
        const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        return scoreVietnameseText(decoded) >= scoreVietnameseText(normalized) ? decoded : normalized;
    } catch {
        return normalized;
    }
}
