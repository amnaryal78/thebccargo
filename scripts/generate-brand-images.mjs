/**
 * Generates valid PNG images (og-banner.png, icon-192.png, icon-512.png, icon-maskable.png)
 * Uses standard Node.js zlib without external heavy C++ dependencies.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

// CRC32 implementation for PNG chunks
function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function calculateCrc(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = calculateCrc(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function encodePng(width, height, getPixel) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace 0
  const ihdr = createChunk('IHDR', ihdrData);

  // Raw scanlines with filter byte 0
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = getPixel(x, y);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// 1. Generate og-banner.png (1200 x 630)
// Oxford Blue background (#0B2D63) with Gold border (#F2B632) and center badge
console.log('[ASSETS] Generating 1200x630 og-banner.png...');
const ogBanner = encodePng(1200, 630, (x, y) => {
  // Gold decorative border (12px inset, 8px stroke)
  const isBorder = (x >= 24 && x <= 1176 && (y === 24 || y === 606 || (y >= 24 && y <= 606 && (x === 24 || x === 1176))));
  if (isBorder) return [242, 183, 5, 255]; // #F2B632 Gold

  // Central Gold accent strip (y between 300 and 310)
  if (y >= 308 && y <= 312 && x >= 400 && x <= 800) {
    return [242, 183, 5, 255];
  }

  // Gradient Oxford Blue background: #0B2D63 to #00152D
  const grad = Math.min(1, Math.max(0, y / 630));
  const r = Math.round(0 * (1 - grad) + 0 * grad);
  const g = Math.round(33 * (1 - grad) + 21 * grad);
  const b = Math.round(71 * (1 - grad) + 45 * grad);
  return [r, g, b, 255];
});
fs.writeFileSync(path.join(PUBLIC_DIR, 'og-banner.png'), ogBanner);

// 2. Generate icon-192.png (192 x 192)
console.log('[ASSETS] Generating 192x192 icon-192.png...');
const icon192 = encodePng(192, 192, (x, y) => {
  // Distance from center for circular glyph
  const dx = x - 96;
  const dy = y - 96;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Outer circle background
  if (dist <= 84) {
    // Gold diamond in center
    const manhattan = Math.abs(dx) + Math.abs(dy);
    if (manhattan <= 36) {
      return [242, 183, 5, 255]; // Gold
    }
    return [0, 33, 71, 255]; // Oxford Blue
  }
  return [0, 0, 0, 0]; // Transparent
});
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-192.png'), icon192);

// 3. Generate icon-512.png (512 x 512)
console.log('[ASSETS] Generating 512x512 icon-512.png...');
const icon512 = encodePng(512, 512, (x, y) => {
  const dx = x - 256;
  const dy = y - 256;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= 230) {
    const manhattan = Math.abs(dx) + Math.abs(dy);
    if (manhattan <= 100) {
      return [242, 183, 5, 255]; // Gold
    }
    return [0, 33, 71, 255]; // Oxford Blue
  }
  return [0, 0, 0, 0];
});
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-512.png'), icon512);

// 4. Generate icon-maskable.png (512 x 512) - Solid background for Android maskable icon
console.log('[ASSETS] Generating 512x512 icon-maskable.png...');
const iconMaskable = encodePng(512, 512, (x, y) => {
  const dx = x - 256;
  const dy = y - 256;
  const manhattan = Math.abs(dx) + Math.abs(dy);

  if (manhattan <= 120) {
    return [242, 183, 5, 255]; // Gold
  }
  return [0, 33, 71, 255]; // Oxford Blue
});
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon-maskable.png'), iconMaskable);

console.log('[ASSETS] All brand and PWA icon PNGs successfully generated in public/!');
