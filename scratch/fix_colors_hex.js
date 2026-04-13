const fs = require('fs');
const path = require('path');

const replacements = [
    [/#f59e0b/gi, '#0f9b9b'],
    [/bg-\[#FFC015\]/g, 'bg-brand-primary'],
    [/#FFC015/gi, '#0f9b9b']
];

function processFile(filePath) {
    // Skip external logos (Google)
    if (filePath.includes('LoginPage.tsx') || filePath.includes('RegisterPage.tsx')) {
        // Only replace non-google parts if needed, but for now just skip to be safe
        // Actually, let's just avoid replacing #FBBC05 (which is google yellow)
        // #f59e0b is NOT google yellow.
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            processFile(fullPath);
        }
    }
}

const baseDir = path.join(__dirname, '..', 'client', 'src');
walkDir(baseDir);
console.log('Mass replacement complete.');
