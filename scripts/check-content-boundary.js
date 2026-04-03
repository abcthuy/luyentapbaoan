const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const ALLOWED_STATIC_WRITERS = new Set([
    path.normalize('scripts/gen_math.js'),
    path.normalize('scripts/gen_english.js'),
    path.normalize('scripts/gen_vietnamese.js'),
    path.normalize('scripts/gen_finance.js'),
    path.normalize('scripts/check-content-boundary.js'),
]);

const ALLOWED_CUSTOM_LIBRARY_REFERENCES = new Set([
    path.normalize('lib/mastery.ts'),
    path.normalize('lib/storage-merge.ts'),
    path.normalize('lib/content/library.ts'),
    path.normalize('lib/content/registry.ts'),
    path.normalize('lib/content/static/index.ts'),
    path.normalize('components/progress-provider.tsx'),
    path.normalize('scripts/check-content-boundary.js'),
]);

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
            continue;
        }
        files.push(fullPath);
    }
    return files;
}

function normalizeWorkspacePath(filePath) {
    return path.normalize(path.relative(ROOT, filePath));
}

function main() {
    const files = walk(ROOT).filter((file) => /\.(ts|tsx|js)$/.test(file));
    const violations = [];

    files.forEach((file) => {
        const rel = normalizeWorkspacePath(file);
        const content = fs.readFileSync(file, 'utf8');

        if (content.includes("lib', 'content', 'static'") || content.includes('lib/content/static')) {
            const writesStatic = /writeFileSync\s*\(/.test(content) || /Set-Content\b/.test(content);
            if (writesStatic && !ALLOWED_STATIC_WRITERS.has(rel)) {
                violations.push(`[static-write] ${rel} dang ghi vao static question bank ngoai luong legacy duoc phep.`);
            }
        }

        if (content.includes('customContentLibrary') && !ALLOWED_CUSTOM_LIBRARY_REFERENCES.has(rel)) {
            violations.push(`[custom-library] ${rel} van con tham chieu customContentLibrary ngoai nhom legacy tuong thich.`);
        }
    });

    if (violations.length > 0) {
        console.error('Content boundary check failed:');
        violations.forEach((item) => console.error(`- ${item}`));
        process.exit(1);
    }

    console.log('Content boundary checks passed.');
}

main();
