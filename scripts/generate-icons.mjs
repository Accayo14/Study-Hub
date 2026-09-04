// Generates the StudyHub PNG app icons from the same geometry as public/icon.svg.
// Run with: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = [0x2b, 0x2b, 0x2b];
const CREAM = [0xfa, 0xf8, 0xf5];
const ACCENT = [0xe0, 0x7a, 0x5f];

// Mark geometry in fractions of the canvas, mirrored in public/icon.svg.
const CORNER = 0.22;
const BARS = [
  { x: 0.24, y: 0.285, w: 0.52, h: 0.09, fill: CREAM },
  { x: 0.24, y: 0.455, w: 0.44, h: 0.09, fill: CREAM },
  { x: 0.24, y: 0.625, w: 0.32, h: 0.09, fill: ACCENT },
];

const inRoundRect = (px, py, x, y, w, h, r) => {
  if (px < x || py < y || px > x + w || py > y + h) return false;
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
};

// Colour of a single sample point, or null where the icon is transparent.
function sample(px, py, size) {
  if (!inRoundRect(px, py, 0, 0, size, size, CORNER * size)) return null;
  for (const b of BARS) {
    const w = b.w * size;
    const h = b.h * size;
    if (inRoundRect(px, py, b.x * size, b.y * size, w, h, h / 2)) return b.fill;
  }
  return INK;
}

function render(size, ss = 4) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const c = sample(x + (sx + 0.5) / ss, y + (sy + 0.5) / ss, size);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a += 255; }
        }
      }
      const hits = a / 255;
      const i = (y * size + x) * 4;
      if (hits) {
        px[i] = Math.round(r / hits);
        px[i + 1] = Math.round(g / hits);
        px[i + 2] = Math.round(b / hits);
        px[i + 3] = Math.round(a / (ss * ss));
      }
    }
  }
  return px;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size) {
  const pixels = render(size);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA

  // Each scanline is prefixed with filter type 0 (None).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  writeFileSync(join(OUT, name), png(size));
  console.log(`wrote public/${name} (${size}x${size})`);
}
