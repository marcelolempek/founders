const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix style={{ '-RadioDotSvg': ... }} to style={{ '--RadioDotSvg': ... }}
    // We look for quoted keys starting with single dash.
    // Negative lookahead for valid vendor prefixes?
    // standard prefixes: -webkit, -moz, -ms, -o.
    // regex: '-(?!webkit|moz|ms|o)[a-zA-Z0-9_-]+':

    content = content.replace(/'-(?!webkit|moz|ms|o)([a-zA-Z0-9_-]+)':/g, (match, body) => {
        return `'--${body}':`;
    });

    // Add 'as React.CSSProperties' if style contains '--' and doesn't already have cast.
    // Regex: look for style={{ ... }} that contains '--' inside.
    // And ensure no 'as React.CSSProperties' follows.
    // Note: styles might span multiple lines, so . matches newline? JS regex . doesn't match newline. Use [\s\S].

    content = content.replace(/style=\{\{([\s\S]*?--[\s\S]*?)\}\}(?! as React\.CSSProperties)/g, (match, body) => {
        return `style={{${body}}} as React.CSSProperties`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed CSS vars in: ${path.basename(filePath)}`);
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
