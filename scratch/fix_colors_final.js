const fs = require('fs');
const path = require('path');

const replacements = [
    [/focus:ring-amber-400\/10/g, 'focus:ring-brand-primary/10'],
    [/focus:ring-amber-500\/20/g, 'focus:ring-brand-primary/10'],
    [/text-amber-900/g, 'text-brand-ink'],
    [/bg-yellow-50/g, 'bg-brand-bg'],
    [/border-yellow-200/g, 'border-brand-primary/20'],
    [/text-yellow-500/g, 'text-brand-primary'],
    [/bg-yellow-100/g, 'bg-brand-bg'],
    [/text-yellow-700/g, 'text-brand-ink'],
    [/border-amber-500/g, 'border-brand-primary'],
    [/bg-amber-50/g, 'bg-brand-bg'],
    [/border-amber-200/g, 'border-brand-primary/20'],
    [/text-brand-primary border-amber-500/g, 'text-brand-primary border-brand-primary'],
    [/from-amber-400\s+to-yellow-400/g, 'from-brand-primary to-brand-dark'],
    [/shadow-amber-500\/25/g, 'shadow-brand-primary/20']
];

function processFile(filePath) {
    if (filePath.includes('LoginPage.tsx') || filePath.includes('RegisterPage.tsx') || filePath.includes('index.css')) {
        // Skip for now or handle carefully
        if (!filePath.includes('index.css')) return; 
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
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

const baseDir = path.join(__dirname, '..', 'client', 'src');
walkDir(baseDir);
console.log('Final polish replacement complete.');
