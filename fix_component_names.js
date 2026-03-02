const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function toPascalCase(str) {
    // Remove invalid chars and camel case
    // Split by non-alphanumeric
    return str.split(/[^a-zA-Z0-9]/).map(part => {
        if (!part) return '';
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern: export default function [Name]()
    // We want to capture Name.
    // Use [^\(\s]+ to match anything until space or (
    // And allow \s* before (
    content = content.replace(/export default function ([^\(\s]+)\s*\(/g, (match, name) => {
        // If name has invalid chars (non-alphanumeric or underscores/dollars allowed?)
        // JS identifiers: $, _, a-z, A-Z, 0-9.
        // If name contains anything else (like -, &, etc), fixes it.
        if (/[^a-zA-Z0-9_$]/.test(name)) {
            const newName = toPascalCase(name);
            return `export default function ${newName}(`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed component name in: ${path.basename(filePath)}`);
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
