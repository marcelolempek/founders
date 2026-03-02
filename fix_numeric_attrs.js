const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix rows="3" -> rows={3}
    content = content.replace(/rows="(\d+)"/g, 'rows={$1}');

    // Fix cols="3" -> cols={3}
    content = content.replace(/cols="(\d+)"/g, 'cols={$1}');

    // Fix tabIndex="0" -> tabIndex={0}
    content = content.replace(/tabIndex="(\d+)"/g, 'tabIndex={$1}');

    // Fix maxLength="100" -> maxLength={100}
    content = content.replace(/maxLength="(\d+)"/g, 'maxLength={$1}');

    // Fix minLength="100" -> minLength={100}
    content = content.replace(/minLength="(\d+)"/g, 'minLength={$1}');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed numeric attrs in: ${path.basename(filePath)}`);
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
