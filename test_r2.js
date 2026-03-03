const { getR2Url } = require('./src/lib/images/imageUrl');
require('dotenv').config();

console.log('Testing getR2Url with Unsplash:');
const unsplash = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200';
console.log(`Input: ${unsplash}`);
console.log(`Output: ${getR2Url(unsplash)}`);

console.log('\nTesting getR2Url with relative path:');
const relative = 'avatars/test.webp';
console.log(`Input: ${relative}`);
console.log(`Output: ${getR2Url(relative)}`);
