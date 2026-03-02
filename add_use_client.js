const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
        content = "'use client';\n" + content;
        fs.writeFileSync(filePath, content);
        console.log(`Added 'use client' to: ${path.basename(filePath)}`);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            walk(fp);
        } else if (f.endsWith('.tsx')) {
            processFile(fp);
        }
    });
}

// Apply to all components (screens and layouts)
walk(COMPONENTS_DIR);
