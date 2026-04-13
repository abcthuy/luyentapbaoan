const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'lib', 'content');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function cleanFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.json')) return;

    console.log(`Processing: ${filePath}`);
    const buffer = fs.readFileSync(filePath);

    // Check for UTF-8 BOM (0xEF 0xBB 0xBF)
    let startOffset = 0;
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        console.log(`  -> Found BOM! Removing...`);
        startOffset = 3;
    }

    // Convert to string and find first valid word character or import
    let content = buffer.slice(startOffset).toString('utf8');
    
    // Sometimes there are invisible characters like \ufeff even without a byte-level BOM, 
    // or other control characters.
    const originalLength = content.length;
    
    // Strip leading whitespace and non-printable characters
    // \uFEFF is the zero-width non-breaking space (BOM)
    content = content.replace(/^[\uFEFF\u200B\u0000-\u001F\u007F-\u009F]+/, '');
    
    // Ensure it starts with 'import', '/', or a letter
    // If it starts with some other weird junk, keep stripping
    content = content.replace(/^[^\w\/'"@]+/, '');

    if (content.length !== originalLength || startOffset > 0) {
        console.log(`  -> Cleaned ${originalLength - content.length + startOffset} bytes/chars from start.`);
        fs.writeFileSync(filePath, content, 'utf8');
    } else {
        console.log(`  -> Clean.`);
    }
}

console.log('--- Encoding Cleanup Start ---');
walkDir(targetDir, cleanFile);
console.log('--- Encoding Cleanup Done ---');
