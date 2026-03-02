/**
 * Script to replace getCurrentUser() with useUser() hook
 * This will help reduce redundant auth requests from 14 to 1
 */

const fs = require('fs');
const path = require('path');

// Files to update (most critical hooks used in feed)
const filesToUpdate = [
    'src/lib/hooks/useFeed.ts',
    'src/lib/hooks/useBookmarks.ts',
    'src/lib/hooks/usePosts.ts',
    'src/lib/hooks/useComments.ts',
];

const rootDir = process.cwd();

filesToUpdate.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if file uses getCurrentUser
    if (!content.includes('getCurrentUser')) {
        console.log(`⏭️  Skipping ${filePath} - no getCurrentUser found`);
        return;
    }

    console.log(`🔧 Processing ${filePath}...`);

    // Add useUser import if not present
    if (!content.includes("from '@/context/UserContext'")) {
        // Find the last import statement
        const lastImportMatch = content.match(/import .+ from .+;/g);
        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            content = content.replace(
                lastImport,
                lastImport + "\nimport { useUser } from '@/context/UserContext';"
            );
        }
    }

    // Note: This is a simple replacement guide
    // Manual review still needed for each file
    console.log(`✅ Added useUser import to ${filePath}`);
    console.log(`⚠️  Manual review needed to replace getCurrentUser() calls with useUser()`);

    // Write back
    fs.writeFileSync(fullPath, content, 'utf8');
});

console.log('\n📝 Summary:');
console.log('- Imports added where needed');
console.log('- Manual replacement still required for each getCurrentUser() call');
console.log('- Pattern: const { user } = useUser(); instead of await getCurrentUser()');
