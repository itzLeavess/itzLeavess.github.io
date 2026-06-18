import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = new URL('..', import.meta.url).pathname;
const picDir = path.join(rootDir, 'pic');
const publicPicDir = path.join(rootDir, 'public', 'pic');
const files = await readdir(picDir);
const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'));
const gifFiles = files.filter((file) => file.toLowerCase().endsWith('.gif'));

let originalBytes = 0;
let webpBytes = 0;

await mkdir(publicPicDir, { recursive: true });

for (const file of pngFiles) {
  const input = path.join(picDir, file);
  const output = path.join(publicPicDir, file.replace(/\.png$/i, '.webp'));

  await sharp(input)
    .webp({ quality: 82, effort: 6 })
    .toFile(output);

  const [original, optimized] = await Promise.all([stat(input), stat(output)]);
  originalBytes += original.size;
  webpBytes += optimized.size;

  const saved = ((1 - optimized.size / original.size) * 100).toFixed(1);
  console.log(`${file} -> public/pic/${path.basename(output)} (${saved}% smaller)`);
}

for (const file of gifFiles) {
  await copyFile(path.join(picDir, file), path.join(publicPicDir, file));
  console.log(`${file} -> public/pic/${file}`);
}

const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const savedTotal = ((1 - webpBytes / originalBytes) * 100).toFixed(1);
console.log(`\nPNG total: ${formatMB(originalBytes)}`);
console.log(`WebP total: ${formatMB(webpBytes)}`);
console.log(`Saved: ${savedTotal}%`);
