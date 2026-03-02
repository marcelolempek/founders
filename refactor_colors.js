const fs = require('fs');
const path = require('path');

const directory = './src';

const replacements = [
    { from: /text-white/g, to: 'text-slate-900' },
    { from: /bg-\[#0f172a\]/g, to: 'bg-slate-50' },
    { from: /bg-\[#1e293b\]/g, to: 'bg-white' },
    { from: /bg-\[#334155\]/g, to: 'bg-slate-100' },
    { from: /border-\[#334155\]/g, to: 'border-slate-200' },
    { from: /text-gray-300/g, to: 'text-slate-600' },
    { from: /text-background-dark/g, to: 'text-white' },
    { from: /bg-background-dark/g, to: 'bg-white' },
    { from: /border-background-dark/g, to: 'border-white' },
    { from: /border-dark/g, to: 'slate-200' },
    { from: /bg-surface-dark/g, to: 'bg-white' },
    { from: /text-[#0f172a]/g, to: 'text-white' },
    { from: /border-\[#0f172a\]/g, to: 'border-white' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
            let originalData = fs.readFileSync(fullPath, 'utf8');
            let data = originalData;

            for (const { from, to } of replacements) {
                data = data.replace(from, to);
            }

            if (data !== originalData) {
                fs.writeFileSync(fullPath, data, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(directory);
console.log('Done!');
