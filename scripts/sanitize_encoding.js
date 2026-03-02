const fs = require('fs');

const filePath = 'c:\\Users\\User\\Desktop\\empreendedoresFarol - code6mm\\src\\components\\screens\\post\\CreatePost.tsx';

try {
    const buffer = fs.readFileSync(filePath);
    // Try to convert to string using utf8, ignoring errors or using a fallback
    const content = buffer.toString('utf8');

    // Check if there are "replacement characters" (U+FFFD) which indicate bad encoding
    if (content.includes('\uFFFD')) {
        console.log('Found invalid UTF-8 sequences. Attempting to clean...');
        // Filter out non-printable/bad characters if necessary, but usually rewriting is enough if the buffer was mostly fine
        fs.writeFileSync(filePath, content.replace(/\uFFFD/g, ''), 'utf8');
        console.log('File cleaned and rewritten.');
    } else {
        // If it still fails, it might be a double encoding or something else.
        // Let's force a rewrite with standard utf8
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('File rewritten to ensure clean UTF-8.');
    }
} catch (err) {
    console.error('Error in sanitization:', err);
}
