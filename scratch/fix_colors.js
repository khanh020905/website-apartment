const fs = require('fs');
const path = require('path');

const replacements = [
    [/bg-amber-400\s+text-slate-900/g, 'bg-brand-primary text-white'],
    [/bg-amber-400\s+hover:bg-amber-500\s+text-slate-900/g, 'bg-brand-primary hover:bg-brand-dark text-white'],
    [/text-slate-900\s+bg-amber-400\s+hover:bg-amber-500/g, 'text-white bg-brand-primary hover:bg-brand-dark'],
    [/bg-amber-400/g, 'bg-brand-primary'],
    [/hover:bg-amber-500/g, 'hover:bg-brand-dark'],
    [/text-amber-500/g, 'text-brand-primary'],
    [/text-amber-600/g, 'text-brand-dark'],
    [/text-amber-700/g, 'text-brand-ink'],
    [/bg-amber-50/g, 'bg-brand-bg'],
    [/border-amber-400/g, 'border-brand-primary'],
    [/shadow-amber-200\/50/g, 'shadow-brand-primary/20'],
    [/shadow-amber-400\/20/g, 'shadow-brand-primary/20'],
    [/focus:border-amber-400/g, 'focus:border-brand-primary'],
    [/bg-\[#fcd34d\]/g, 'bg-brand-primary'],
    [/bg-brand-primary\s+text-slate-900/g, 'bg-brand-primary text-white'],
    [/text-slate-900\s+bg-brand-primary/g, 'text-white bg-brand-primary']
];

function processFile(filePath) {
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
            if (processFile(fullPath)) count++;
        }
    }
    return count;
}

const baseDir = path.join(__dirname, '..', 'client', 'src');
const total = walkDir(baseDir);
console.log(`Total files updated: ${total}`);
