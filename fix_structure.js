const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SCREENS_DIR = path.join(ROOT, 'src', 'components', 'screens');

function walkAndFlatten(dir, moduleRoot) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            walkAndFlatten(fullPath, moduleRoot);
            // Try to remove dir if empty
            try {
                if (fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                    console.log(`Removed empty dir: ${item}`);
                }
            } catch (e) { }
        } else if (item.endsWith('.tsx')) {
            // If we are deeper than moduleRoot, move it
            if (dir !== moduleRoot) {
                const destPath = path.join(moduleRoot, item);
                // Check collision
                if (fs.existsSync(destPath)) {
                    console.log(`Collision for ${item}, skipping or renaming...`);
                    // renaming logic if needed, but for now assuming unique names
                } else {
                    fs.renameSync(fullPath, destPath);
                    console.log(`Moved ${item} to ${path.basename(moduleRoot)}`);
                }
            }
        }
    });
}

// Iterate over modules in screens (e.g. auth, feed, verification)
const modules = fs.readdirSync(SCREENS_DIR);
modules.forEach(mod => {
    const modPath = path.join(SCREENS_DIR, mod);
    if (fs.statSync(modPath).isDirectory()) {
        walkAndFlatten(modPath, modPath);
    }
});
