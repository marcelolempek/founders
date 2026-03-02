const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern: style={{ ... }} as React.CSSProperties
    // We want: style={ { ... } as React.CSSProperties }

    // Regex: style=\{\{([\s\S]*?)\}\} as React\.CSSProperties
    // Capture inner content (properties).

    content = content.replace(/style=\{\{([\s\S]*?)\}\} as React\.CSSProperties/g, (match, body) => {
        return `style={{ ${body} } as React.CSSProperties}`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed broken style syntax in: ${path.basename(filePath)}`);
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

walk(COMPONENTS_DIR);
