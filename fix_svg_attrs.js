const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, 'src', 'components');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix viewBox
    content = content.replace(/viewbox="/g, 'viewBox="');

    // Fix stroke-width -> strokeWidth
    content = content.replace(/stroke-width="/g, 'strokeWidth="');
    content = content.replace(/strokewidth="/g, 'strokeWidth="');

    // Fix stroke-linecap -> strokeLinecap
    content = content.replace(/stroke-linecap="/g, 'strokeLinecap="');
    content = content.replace(/strokelinecap="/g, 'strokeLinecap="');

    // Fix stroke-linejoin -> strokeLinejoin
    content = content.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
    content = content.replace(/strokelinejoin="/g, 'strokeLinejoin="');

    // Fix fill-rule -> fillRule (likely mostly fixed but just in case)
    content = content.replace(/fill-rule="/g, 'fillRule="');
    content = content.replace(/fillrule="/g, 'fillRule="');

    // Fix clip-rule -> clipRule
    content = content.replace(/clip-rule="/g, 'clipRule="');
    content = content.replace(/cliprule="/g, 'clipRule="');

    // Fix clip-path -> clipPath
    content = content.replace(/clip-path="/g, 'clipPath="');
    content = content.replace(/clippath="/g, 'clipPath="');

    // Fix xmlns:xlink -> camel case? No, React keeps xmlns:xlink structure but colon is tricky.
    // React supports xmlnsXlink? No, stick to xmlnsXlink if needed, but usually xmlns:xlink works in React 16+?
    // Actually React 16+ passes through custom attributes.
    // But xmlns attributes are supported.

    // FIX SVG TAGS
    // clippath -> clipPath
    content = content.replace(/<clippath/g, '<clipPath');
    content = content.replace(/<\/clippath>/g, '</clipPath>');

    // lineargradient -> linearGradient
    content = content.replace(/<lineargradient/g, '<linearGradient');
    content = content.replace(/<\/lineargradient>/g, '</linearGradient>');

    // radialgradient -> radialGradient
    content = content.replace(/<radialgradient/g, '<radialGradient');
    content = content.replace(/<\/radialgradient>/g, '</radialGradient>');

    // mask -> mask (lowercase is fine)
    // pattern -> pattern (lowercase is fine)

    // foreignobject -> foreignObject
    content = content.replace(/<foreignobject/g, '<foreignObject');
    content = content.replace(/<\/foreignobject>/g, '</foreignObject>');

    // textpath -> textPath
    content = content.replace(/<textpath/g, '<textPath');
    content = content.replace(/<\/textpath>/g, '</textPath>');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed SVG attrs in: ${path.basename(filePath)}`);
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
