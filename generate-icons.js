import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, toCrc, crcBuf]);
}

function generatePng(width, height, getPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines: width * 4 + 1 filter byte per line
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function getEquipmentIconColor(x, y, w, h) {
  // Center coordinates normalized (-1 to 1)
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background: Rounded rectangle with dark slate-blue gradient
  const corner = 0.25;
  const inBox = Math.abs(nx) < 0.85 && Math.abs(ny) < 0.85;
  
  // Background gradient: #1e293b to #0f172a
  let r = 15 + Math.floor((1 - ny) * 10);
  let g = 23 + Math.floor((1 - ny) * 15);
  let b = 42 + Math.floor((1 - ny) * 20);
  let a = 255;

  // Draw monitor / laptop symbol in cyan/blue (#38bdf8 / #2563eb)
  // Screen body: -0.55 < nx < 0.55, -0.5 < ny < 0.25
  const onScreenFrame = Math.abs(nx) < 0.55 && ny > -0.5 && ny < 0.25;
  const onScreenInner = Math.abs(nx) < 0.47 && ny > -0.42 && ny < 0.17;
  
  // Screen base: -0.65 < nx < 0.65, 0.28 < ny < 0.38
  const onScreenBase = Math.abs(nx) < 0.65 && ny >= 0.25 && ny < 0.36;
  const onScreenNeck = Math.abs(nx) < 0.12 && ny >= 0.17 && ny < 0.28;

  // Wrench / tool or check mark inside screen:
  const isPulse = Math.abs(ny - (-0.12) - Math.sin(nx * 8) * 0.15) < 0.05 && Math.abs(nx) < 0.35;

  if (onScreenInner) {
    if (isPulse) {
      // Emerald green pulse line
      r = 52; g = 211; b = 153;
    } else {
      // Dark inner display
      r = 30; g = 41; b = 59;
    }
  } else if (onScreenFrame || onScreenBase || onScreenNeck) {
    // Blue / Indigo bezel
    r = 59; g = 130; b = 246;
  }

  return [r, g, b, a];
}

const pubDir = path.resolve('public');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), generatePng(192, 192, getEquipmentIconColor));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), generatePng(512, 512, getEquipmentIconColor));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generatePng(180, 180, getEquipmentIconColor));
console.log('PWA icons created successfully.');
