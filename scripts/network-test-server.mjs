import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();

const port = Number(process.env.PORT || 4174);
const host = process.env.HOST || '127.0.0.1';
const imageDelayMs = Number(process.env.IMAGE_DELAY_MS || 180);
const imageKbps = Number(process.env.IMAGE_KBPS || 1600);
const imageKBps = Math.max(1, imageKbps / 8);
const chunkSize = Math.max(1024, Math.floor(imageKBps * 1024));

app.set('etag', false);

const mimeTypes = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

function sendSlowFile(req, res, filePath) {
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.sendStatus(404);
      return;
    }

    noStore(res);
    res.setHeader('Content-Type', mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('X-Network-Test', `delay=${imageDelayMs}ms; kbps=${imageKbps}; approx-kBps=${Math.round(imageKBps)}`);

    const stream = fs.createReadStream(filePath, {highWaterMark: chunkSize});
    stream.pause();
    stream.on('data', chunk => {
      stream.pause();
      res.write(chunk, () => {
        setTimeout(() => stream.resume(), 1000);
      });
    });
    stream.on('end', () => res.end());
    stream.on('error', () => {
      if (!res.headersSent) res.sendStatus(500);
      else res.end();
    });
    req.on('close', () => stream.destroy());
    setTimeout(() => stream.resume(), imageDelayMs);
  });
}

app.use((req, res, next) => {
  noStore(res);
  next();
});

app.get('/pic/*', (req, res) => {
  const relativePath = decodeURIComponent(req.path.replace(/^\/+/, ''));
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(path.join(root, 'pic') + path.sep)) {
    res.sendStatus(403);
    return;
  }

  sendSlowFile(req, res, filePath);
});

app.get('/', (req, res) => {
  const htmlPath = path.join(root, 'index.html');
  fs.readFile(htmlPath, 'utf8', (error, html) => {
    if (error) {
      res.sendStatus(500);
      return;
    }

    res.type('html').send(html.replace(
      '<head>',
      `<head>
<meta name="network-test" content="no-store; image-delay=${imageDelayMs}ms; image-kbps=${imageKbps}; image-kBps=${Math.round(imageKBps)}">
<script>
  window.caches?.keys?.().then(keys => keys.forEach(key => window.caches.delete(key))).catch(() => {});
  sessionStorage.clear();
</script>`
    ));
  });
});

app.use(express.static(root, {
  etag: false,
  lastModified: false,
  setHeaders: noStore,
}));

app.listen(port, host, () => {
  console.log(`Network test link: http://${host}:${port}/`);
  console.log(`Images: ${imageDelayMs}ms delay, about ${imageKbps} kbps (${Math.round(imageKBps)} KB/s), no-store cache headers.`);
});
