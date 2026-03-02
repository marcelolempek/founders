const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components', 'screens');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We assume standard structure:
    // return (
    //    ...
    // );
    // }

    // Replace "return (" with "return (<>"
    // Match strict pattern to avoid false positives
    // regex: return \(\s*(\r\n|\n)

    // Check if we need to wrap.
    // We can just wrap unconditionally. <><div.../></> is valid.

    if (content.includes('return (') && content.includes(');')) {
        // Replace first main return
        // This is a bit brittle if there are multiple returns, but these are simple converted components.
        // We'll replace the first "return (" found.

        content = content.replace(/return \(\s*/, 'return (\n<>\n');

        // Replace the LAST ");" before end of file?
        // Finds ");" followed by "}" at end of file.
        // regex: \);\s*\}\s*$
        // multiline?

        const lastParenIndex = content.lastIndexOf(');');
        if (lastParenIndex !== -1) {
            content = content.slice(0, lastParenIndex) + '</>\n);' + content.slice(lastParenIndex + 2);
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Wrapped roots inside: ${path.basename(filePath)}`);
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
