const fs = require('fs');
const path = require('path');

function reverseMojibake(filePath) {
    console.log(`Processing: ${filePath}`);
    try {
        const text = fs.readFileSync(filePath, 'utf8');
        // This reverses double-encoded UTF-8 (UTF-8 interpreted as Latin1 and saved as UTF-8)
        const fixed = Buffer.from(text, 'binary').toString('utf8');
        
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`Success: Fixed encoding for ${filePath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
}

// Add the corrupted files here
const filesToFix = [
    path.join(__dirname, 'lib', 'content', 'generators', 'vietnamese.ts'),
    path.join(__dirname, 'lib', 'content', 'generators', 'english.ts')
];

filesToFix.forEach(reverseMojibake);
console.log('Done!');
