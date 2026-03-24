import { ContentLibrarySkillEntry, QuestionBank } from './library';
import { Course, Question, QuestionType, Skill, SubjectId } from './types';

type LibraryExportPayload = {
    version: number;
    exportedAt: string;
    courses: Course[];
    questionBank: QuestionBank;
    summary: {
        totalCourses: number;
        totalSkills: number;
        totalQuestions: number;
        customSkillCount: number;
    };
};

export type ImportedSkillRow = {
    subjectId: SubjectId;
    topicId: string;
    topicName: string;
    skill: Skill;
};

export type ImportedQuestionRow = {
    skillId: string;
    level: number;
    question: Question;
};

export type ImportedLibraryWord = {
    skills: ImportedSkillRow[];
    questions: ImportedQuestionRow[];
};

const WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function normalizeHeader(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function encodeCell(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }
    return String(value);
}

function createTextRun(text: string, bold = false) {
    const safeText = escapeXml(text || ' ');
    return `<w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${safeText}</w:t></w:r>`;
}

function createParagraph(text: string, bold = false) {
    const lines = String(text || '').split(/\r?\n/);
    const runs = lines
        .map((line, index) => {
            const pieces = [createTextRun(line || ' ', bold)];
            if (index < lines.length - 1) {
                pieces.push('<w:r><w:br/></w:r>');
            }
            return pieces.join('');
        })
        .join('');
    return `<w:p>${runs}</w:p>`;
}

function createTableCell(text: string, bold = false) {
    return `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>${createParagraph(text, bold)}</w:tc>`;
}

function createTable(headers: string[], rows: string[][]) {
    const headerRow = `<w:tr>${headers.map((header) => createTableCell(header, true)).join('')}</w:tr>`;
    const bodyRows = rows
        .map((row) => `<w:tr>${row.map((cell) => createTableCell(cell)).join('')}</w:tr>`)
        .join('');
    return `<w:tbl>
<w:tblPr>
<w:tblBorders>
<w:top w:val="single" w:sz="8" w:space="0" w:color="D1D5DB"/>
<w:left w:val="single" w:sz="8" w:space="0" w:color="D1D5DB"/>
<w:bottom w:val="single" w:sz="8" w:space="0" w:color="D1D5DB"/>
<w:right w:val="single" w:sz="8" w:space="0" w:color="D1D5DB"/>
<w:insideH w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
<w:insideV w:val="single" w:sz="6" w:space="0" w:color="D1D5DB"/>
</w:tblBorders>
</w:tblPr>
${headerRow}
${bodyRows}
</w:tbl>`;
}

function createDocumentXml(title: string, introLines: string[], skillRows: string[][], questionRows: string[][]) {
    const introXml = introLines.map((line, index) => createParagraph(line, index === 0)).join('');
    const skillsTable = createTable(
        ['Subject ID', 'Topic ID', 'Topic Name', 'Skill ID', 'Skill Name', 'Description', 'Tier', 'Grade', 'Semester', 'Instructions'],
        skillRows
    );
    const questionsTable = createTable(
        ['Skill ID', 'Level', 'Type', 'Instruction', 'Text', 'Answer', 'Options', 'Hint', 'Explanation', 'Extra JSON'],
        questionRows
    );

    return `${XML_DECLARATION}
<w:document xmlns:w="${WORD_NS}">
<w:body>
${createParagraph(title, true)}
${introXml}
${createParagraph('Bảng skill', true)}
${skillsTable}
${createParagraph('Bảng câu hỏi', true)}
${questionsTable}
<w:sectPr>
<w:pgSz w:w="12240" w:h="15840"/>
<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
</w:sectPr>
</w:body>
</w:document>`;
}

function buildContentTypesXml() {
    return `${XML_DECLARATION}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}

function buildRootRelationshipsXml() {
    return `${XML_DECLARATION}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function findSkillContext(courses: Course[], skillId: string) {
    for (const course of courses) {
        for (const topic of course.topics) {
            const skill = topic.skills.find((item) => item.id === skillId);
            if (skill) {
                return { subjectId: course.id, topicId: topic.id, topicName: topic.name, skill };
            }
        }
    }
    return null;
}

function flattenQuestions(payload: LibraryExportPayload) {
    return Object.entries(payload.questionBank).flatMap(([skillId, levelMap]) =>
        Object.entries(levelMap).flatMap(([levelKey, questions]) => {
            const context = findSkillContext(payload.courses, skillId);
            return questions.map((question) => ({
                subjectId: context?.subjectId || question.subjectId,
                topicId: context?.topicId || '',
                topicName: context?.topicName || '',
                skillName: context?.skill.name || skillId,
                level: Number(levelKey),
                question,
            }));
        })
    );
}

function makeCrcTable() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
        let value = i;
        for (let bit = 0; bit < 8; bit += 1) {
            value = (value & 1) !== 0 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        }
        table[i] = value >>> 0;
    }
    return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(data: Uint8Array) {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function setUint16(view: DataView, offset: number, value: number) {
    view.setUint16(offset, value, true);
}

function setUint32(view: DataView, offset: number, value: number) {
    view.setUint32(offset, value, true);
}

function getDosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = (((year - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0x0f) << 5) | (date.getDate() & 0x1f);
    return { dosDate, dosTime };
}

function buildStoredZip(entries: Array<{ path: string; content: string }>) {
    const files = entries.map((entry) => ({
        name: entry.path,
        nameBytes: encoder.encode(entry.path),
        data: encoder.encode(entry.content),
    }));
    const { dosDate, dosTime } = getDosDateTime();

    const localParts: Uint8Array[] = [];
    const centralParts: Uint8Array[] = [];
    let offset = 0;

    files.forEach((file) => {
        const localHeader = new Uint8Array(30 + file.nameBytes.length);
        const localView = new DataView(localHeader.buffer);
        const fileCrc = crc32(file.data);

        setUint32(localView, 0, 0x04034b50);
        setUint16(localView, 4, 20);
        setUint16(localView, 6, 0);
        setUint16(localView, 8, 0);
        setUint16(localView, 10, dosTime);
        setUint16(localView, 12, dosDate);
        setUint32(localView, 14, fileCrc);
        setUint32(localView, 18, file.data.length);
        setUint32(localView, 22, file.data.length);
        setUint16(localView, 26, file.nameBytes.length);
        setUint16(localView, 28, 0);
        localHeader.set(file.nameBytes, 30);

        const centralHeader = new Uint8Array(46 + file.nameBytes.length);
        const centralView = new DataView(centralHeader.buffer);
        setUint32(centralView, 0, 0x02014b50);
        setUint16(centralView, 4, 20);
        setUint16(centralView, 6, 20);
        setUint16(centralView, 8, 0);
        setUint16(centralView, 10, 0);
        setUint16(centralView, 12, dosTime);
        setUint16(centralView, 14, dosDate);
        setUint32(centralView, 16, fileCrc);
        setUint32(centralView, 20, file.data.length);
        setUint32(centralView, 24, file.data.length);
        setUint16(centralView, 28, file.nameBytes.length);
        setUint16(centralView, 30, 0);
        setUint16(centralView, 32, 0);
        setUint16(centralView, 34, 0);
        setUint16(centralView, 36, 0);
        setUint32(centralView, 38, 0);
        setUint32(centralView, 42, offset);
        centralHeader.set(file.nameBytes, 46);

        localParts.push(localHeader, file.data);
        centralParts.push(centralHeader);
        offset += localHeader.length + file.data.length;
    });

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    setUint32(endView, 0, 0x06054b50);
    setUint16(endView, 4, 0);
    setUint16(endView, 6, 0);
    setUint16(endView, 8, files.length);
    setUint16(endView, 10, files.length);
    setUint32(endView, 12, centralSize);
    setUint32(endView, 16, offset);
    setUint16(endView, 20, 0);

    const totalLength = offset + centralSize + endRecord.length;
    const output = new Uint8Array(totalLength);
    let cursor = 0;
    [...localParts, ...centralParts, endRecord].forEach((part) => {
        output.set(part, cursor);
        cursor += part.length;
    });
    return output;
}

async function inflateRaw(data: Uint8Array) {
    if (typeof DecompressionStream === 'undefined') {
        throw new Error('Trình duyệt này chưa hỗ trợ đọc file .docx nén.');
    }
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    const stream = new Blob([arrayBuffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
    const minOffset = Math.max(0, bytes.length - 65557);
    for (let i = bytes.length - 22; i >= minOffset; i -= 1) {
        if (
            bytes[i] === 0x50 &&
            bytes[i + 1] === 0x4b &&
            bytes[i + 2] === 0x05 &&
            bytes[i + 3] === 0x06
        ) {
            return i;
        }
    }
    return -1;
}

async function readZipEntries(rawContent: ArrayBuffer) {
    const bytes = new Uint8Array(rawContent);
    const eocdOffset = findEndOfCentralDirectory(bytes);
    if (eocdOffset < 0) {
        throw new Error('Không tìm thấy cấu trúc ZIP trong file .docx.');
    }

    const eocdView = new DataView(bytes.buffer, bytes.byteOffset + eocdOffset);
    const totalEntries = eocdView.getUint16(10, true);
    const centralOffset = eocdView.getUint32(16, true);

    const files = new Map<string, string>();
    let cursor = centralOffset;

    for (let index = 0; index < totalEntries; index += 1) {
        const centralView = new DataView(bytes.buffer, bytes.byteOffset + cursor);
        if (centralView.getUint32(0, true) !== 0x02014b50) {
            break;
        }

        const compressionMethod = centralView.getUint16(10, true);
        const compressedSize = centralView.getUint32(20, true);
        const fileNameLength = centralView.getUint16(28, true);
        const extraLength = centralView.getUint16(30, true);
        const commentLength = centralView.getUint16(32, true);
        const localHeaderOffset = centralView.getUint32(42, true);

        const fileNameStart = cursor + 46;
        const fileName = decoder.decode(bytes.slice(fileNameStart, fileNameStart + fileNameLength));

        const localView = new DataView(bytes.buffer, bytes.byteOffset + localHeaderOffset);
        if (localView.getUint32(0, true) !== 0x04034b50) {
            throw new Error('File .docx không hợp lệ.');
        }

        const localNameLength = localView.getUint16(26, true);
        const localExtraLength = localView.getUint16(28, true);
        const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
        const compressedData = bytes.slice(dataStart, dataStart + compressedSize);

        let fileData = compressedData;
        if (compressionMethod === 8) {
            fileData = await inflateRaw(compressedData);
        } else if (compressionMethod !== 0) {
            throw new Error('File .docx dùng kiểu nén chưa được hỗ trợ.');
        }

        files.set(fileName, decoder.decode(fileData));
        cursor += 46 + fileNameLength + extraLength + commentLength;
    }

    return files;
}

function getChildElementsByName(element: Element, localName: string) {
    return Array.from(element.children).filter((child) => child.localName === localName);
}

function getDescendantElementsByName(element: Element, localName: string) {
    return Array.from(element.getElementsByTagNameNS(WORD_NS, localName));
}

function extractParagraphText(paragraph: Element) {
    return getDescendantElementsByName(paragraph, 't')
        .map((node) => node.textContent || '')
        .join('');
}

function extractCellText(cell: Element) {
    const paragraphs = getChildElementsByName(cell, 'p');
    if (paragraphs.length === 0) {
        return (cell.textContent || '').trim();
    }
    return paragraphs
        .map((paragraph) => extractParagraphText(paragraph))
        .join('\n')
        .replace(/\u00a0/g, ' ')
        .trim();
}

function extractTablesFromDocumentXml(documentXml: string) {
    const parser = new DOMParser();
    const document = parser.parseFromString(documentXml, 'application/xml');
    return Array.from(document.getElementsByTagNameNS(WORD_NS, 'tbl')).map((table) =>
        getChildElementsByName(table, 'tr').map((row) =>
            getChildElementsByName(row, 'tc').map((cell) => extractCellText(cell))
        )
    );
}

function parseSubjectId(value: string): SubjectId | null {
    if (value === 'math' || value === 'english' || value === 'vietnamese' || value === 'finance') {
        return value;
    }
    return null;
}

function parseQuestionType(value: string): QuestionType {
    const clean = value.trim() as QuestionType;
    const supportedTypes: QuestionType[] = ['mcq', 'input', 'speaking', 'listening', 'reading', 'drag-drop', 'match', 'drawing'];
    return supportedTypes.includes(clean) ? clean : 'input';
}

function parseRowsToLibrary(skillsRows: string[][], questionsRows: string[][]): ImportedLibraryWord {
    const skills: ImportedSkillRow[] = [];
    const questions: ImportedQuestionRow[] = [];

    skillsRows.slice(1).forEach((row) => {
        const subjectId = parseSubjectId(row[0] || '');
        const topicId = (row[1] || '').trim();
        const topicName = (row[2] || '').trim();
        const skillId = (row[3] || '').trim();
        const skillName = (row[4] || '').trim();

        if (!subjectId || !topicId || !topicName || !skillId || !skillName) {
            return;
        }

        skills.push({
            subjectId,
            topicId,
            topicName,
            skill: {
                id: skillId,
                name: skillName,
                description: (row[5] || '').trim() || undefined,
                tier: Number(row[6]) === 2 ? 2 : Number(row[6]) === 3 ? 3 : 1,
                grade: Number(row[7]) === 3 ? 3 : 2,
                semester: Number(row[8]) === 2 ? 2 : 1,
                instructions: (row[9] || '').trim() || undefined,
            },
        });
    });

    questionsRows.slice(1).forEach((row, index) => {
        const skillId = (row[0] || '').trim();
        const level = Math.max(1, Number(row[1]) || 1);
        const type = parseQuestionType(row[2] || '');
        const instruction = (row[3] || '').trim();
        const text = (row[4] || '').trim();
        const answer = (row[5] || '').trim();
        const optionsCell = (row[6] || '').trim();
        const hint = (row[7] || '').trim();
        const explanation = (row[8] || '').trim();
        const extraJsonCell = (row[9] || '').trim();

        if (!skillId || !text || !answer) {
            return;
        }

        let extraContent: Record<string, unknown> = {};
        if (extraJsonCell) {
            try {
                extraContent = JSON.parse(extraJsonCell) as Record<string, unknown>;
            } catch {
                extraContent = {};
            }
        }

        const options = optionsCell
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean);

        questions.push({
            skillId,
            level,
            question: {
                id: `imported-${skillId}-${level}-${index + 1}-${Date.now()}`,
                subjectId: 'math',
                skillId,
                type,
                instruction: instruction || 'Làm bài tập sau:',
                content: {
                    text,
                    ...(options.length > 0 ? { options } : {}),
                    ...extraContent,
                },
                answer,
                hint: hint || undefined,
                explanation: explanation || undefined,
            },
        });
    });

    return { skills, questions };
}

function parseHtmlLibraryDocument(rawContent: string) {
    const parser = new DOMParser();
    const document = parser.parseFromString(rawContent.replace(/^\uFEFF/, ''), 'text/html');
    const tables = Array.from(document.querySelectorAll('table')).map((table) =>
        Array.from(table.rows).map((row) => Array.from(row.cells).map((cell) => cell.textContent?.replace(/\u00a0/g, ' ').trim() || ''))
    );

    const skillsRows = tables.find((rows) => {
        const headers = rows[0]?.map((cell) => normalizeHeader(cell)) || [];
        return ['subject id', 'topic id', 'skill id', 'skill name'].every((header) => headers.some((value) => value.includes(header)));
    }) || [];

    const questionsRows = tables.find((rows) => {
        const headers = rows[0]?.map((cell) => normalizeHeader(cell)) || [];
        return ['skill id', 'level', 'type', 'text', 'answer'].every((header) => headers.some((value) => value.includes(header)));
    }) || [];

    return parseRowsToLibrary(skillsRows, questionsRows);
}

function buildDocxBlob(title: string, introLines: string[], skillRows: string[][], questionRows: string[][]) {
    const entries = [
        { path: '[Content_Types].xml', content: buildContentTypesXml() },
        { path: '_rels/.rels', content: buildRootRelationshipsXml() },
        { path: 'word/document.xml', content: createDocumentXml(title, introLines, skillRows, questionRows) },
    ];
    const zipBytes = buildStoredZip(entries);
    return new Blob([zipBytes], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
}

export function buildLibraryWordDocument(payload: LibraryExportPayload) {
    const skillRows = payload.courses.flatMap((course) =>
        course.topics.flatMap((topic) =>
            topic.skills.map((skill) => [
                encodeCell(course.id),
                encodeCell(topic.id),
                encodeCell(topic.name),
                encodeCell(skill.id),
                encodeCell(skill.name),
                encodeCell(skill.description),
                encodeCell(skill.tier),
                encodeCell(skill.grade),
                encodeCell(skill.semester),
                encodeCell(skill.instructions),
            ])
        )
    );

    const questionRows = flattenQuestions(payload).map(({ level, question }) => {
        const { text: _text, options: _options, ...extraContent } = question.content;

        return [
            encodeCell(question.skillId),
            encodeCell(level),
            encodeCell(question.type),
            encodeCell(question.instruction),
            encodeCell(question.content.text),
            encodeCell(question.answer),
            encodeCell(question.content.options?.join(' | ')),
            encodeCell(question.hint),
            encodeCell(question.explanation),
            encodeCell(Object.keys(extraContent).length > 0 ? JSON.stringify(extraContent, null, 2) : ''),
        ];
    });

    return buildDocxBlob(
        'Thư viện nội dung Math Mastery',
        [
            'Đây là bản xuất toàn bộ thư viện nội dung.',
            `Ngày xuất: ${payload.exportedAt} | Tổng môn: ${payload.summary.totalCourses} | Tổng skill: ${payload.summary.totalSkills} | Tổng câu hỏi: ${payload.summary.totalQuestions}`,
            'File này dùng để xem, đối soát và lưu trữ. Để nhập thêm nội dung mới, hãy dùng file mẫu .docx của hệ thống.',
        ],
        skillRows,
        questionRows
    );
}

export function buildLibraryTemplateWordDocument() {
    return buildDocxBlob(
        'Mẫu nhập thư viện Math Mastery',
        [
            'Hướng dẫn dùng file mẫu .docx',
            '1. Nhập thêm dòng mới trong bảng skill nếu bạn muốn tạo skill custom.',
            '2. Nhập bảng câu hỏi để thêm câu hỏi vào skill đã có hoặc skill custom vừa tạo.',
            '3. Nếu câu hỏi là mcq hoặc listening, cột Options viết theo dạng: Lựa chọn 1 | Lựa chọn 2 | Lựa chọn 3.',
            '4. Cột Extra JSON chỉ dùng khi cần thêm trường nâng cao như image, audio, pairs, items, targets.',
            '5. Sau khi sửa trong Word, hãy giữ định dạng .docx rồi tải lên lại tại trang admin.',
        ],
        [[
            'english',
            'custom-speaking',
            'Bổ sung giao tiếp',
            'eng2-greet-custom',
            'Hỏi đáp chào hỏi',
            'Skill custom cho bé luyện câu chào hỏi cơ bản',
            '1',
            '2',
            '1',
            'Tập trung vào mẫu câu ngắn, dễ hiểu.',
        ]],
        [[
            'eng2-greet-custom',
            '1',
            'mcq',
            'Chọn câu trả lời đúng.',
            'Teacher says: "Good morning!" What should you say?',
            'Good morning!',
            'Good morning! | Goodbye! | Thank you!',
            'Nhớ chọn câu chào phù hợp.',
            'Good morning! là câu chào phù hợp vào buổi sáng.',
            '',
        ]]
    );
}

export async function parseLibraryWordDocument(rawContent: ArrayBuffer | string): Promise<ImportedLibraryWord> {
    if (typeof rawContent === 'string') {
        return parseHtmlLibraryDocument(rawContent);
    }

    const bytes = new Uint8Array(rawContent);
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return parseHtmlLibraryDocument(decoder.decode(bytes));
    }

    const files = await readZipEntries(rawContent);
    const documentXml = files.get('word/document.xml');
    if (!documentXml) {
        throw new Error('Không tìm thấy nội dung Word trong file .docx.');
    }

    const tables = extractTablesFromDocumentXml(documentXml);
    if (tables.length < 2) {
        return { skills: [], questions: [] };
    }

    return parseRowsToLibrary(tables[0] || [], tables[1] || []);
}

export function buildSkillSummary(entry: ContentLibrarySkillEntry) {
    const questionCount = Object.values(entry.questions).reduce((sum, questions) => sum + questions.length, 0);
    return {
        questionCount,
        levels: Object.keys(entry.questions)
            .map(Number)
            .sort((a, b) => a - b),
    };
}
