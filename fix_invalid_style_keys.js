const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components', 'screens');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern to find style={{ ... }} blocks
    // This is simple regex, might fail on nested braces but sufficient for the simple string styles we generated.
    content = content.replace(/style=\{\{([^\}]*)\}\}/g, (match, styleBody) => {
        // styleBody looks like: " backgroundImage: '...', -RadioDotSvg: '...' "
        // We want to quote keys that have dashes or are otherwise invalid identifiers.
        // We'll replace key: with 'key':

        // Split by comma to handle multiple properties
        // But value might contain comma (e.g. rgba(...,...,...))
        // So we can't just split by comma.

        // Instead, match "key:" pattern.
        // Key is anything before a colon that isn't inside quotes.
        // Since our values are single-quoted strings (from previous script), 
        // we can look for: <start or comma or space> <key> <colon>

        return 'style={{' + styleBody.replace(/([,\s]+|^)([-a-zA-Z0-9_]+):/g, (m, prefix, key) => {
            if (key.includes('-') || key.startsWith('--')) {
                return `${prefix}'${key}':`;
            }
            return m; // keep as is if valid identifier
        }) + '}}';
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed invalid keys in: ${path.basename(filePath)}`);
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
