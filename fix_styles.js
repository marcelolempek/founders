const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components', 'screens');

// Helper to convert css prop to camelCase
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function parseStyleString(styleStr) {
    if (!styleStr) return '';
    styleStr = styleStr.trim();
    // Split by semicolon, but be careful of semicolons inside url() ? 
    // Usually url("data:...") might have semicolons.
    // But for this project, styles are simple inline styles or background images.
    // Let's split by ; for simplicity as background url usually doesn't contain ; unless data uri.

    const rules = styleStr.split(';');
    const objParts = [];

    rules.forEach(rule => {
        if (!rule.trim()) return;
        const colonIdx = rule.indexOf(':');
        if (colonIdx === -1) return;

        const prop = rule.slice(0, colonIdx).trim();
        const val = rule.slice(colonIdx + 1).trim();

        const key = toCamelCase(prop);

        // Escape single quotes in value if we use single quotes wrapper
        const escapedVal = val.replace(/'/g, "\\'");
        objParts.push(`${key}: '${escapedVal}'`);
    });

    return `{ ${objParts.join(', ')} }`;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern for style='...'. 
    // Note: The previous view showed: style='background-image: url("...");' 
    // We regex for style='...' AND style="...". 
    // Non-greedy match until quote.

    // Replace single quoted styles
    content = content.replace(/style='([^']*)'/g, (match, styleBody) => {
        const objStr = parseStyleString(styleBody);
        return `style={${objStr}}`;
    });

    // Replace double quoted styles (if any, but avoid matching style={{...}} which starts with style={)
    // Actually style="..." matches normal HTML string styles.
    content = content.replace(/style="([^"]*)"/g, (match, styleBody) => {
        const objStr = parseStyleString(styleBody);
        return `style={${objStr}}`;
    });

    // Also, check for class="...". The initial conversion should have fixed it, but let's double check.
    content = content.replace(/ class="/g, ' className="');
    content = content.replace(/ class='/g, " className='");

    // Fix for: <div ...> (unclosed inputs? void tags are self closing in TSX usually, verify?)
    // The initial script supposedly handled <input />.

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed styles in: ${path.basename(filePath)}`);
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

// Also layout components?
walk(path.join(ROOT, 'src', 'components', 'layout'));
walk(COMPONENTS_DIR);
