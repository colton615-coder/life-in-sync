
import fs from 'fs';
import { Buffer } from 'buffer';

// 1x1 pixel transparent PNG base64
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, 'base64');

if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', buffer);
fs.writeFileSync('public/pwa-512x512.png', buffer);

console.log('Placeholder icons created.');
