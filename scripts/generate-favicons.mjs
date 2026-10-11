import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const APP_DIR = path.join(ROOT_DIR, "app");

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// 1. Vector SVG Favicon matching Remotasks.si brand identity (black rounded square with white sparkle)
const SVG_FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="16" fill="#000000"/>
  <!-- Primary Sparkle Star -->
  <path d="M30 13 C30 25.5 37.5 33 50 33 C37.5 33 30 40.5 30 53 C30 40.5 22.5 33 10 33 C22.5 33 30 25.5 30 13 Z" fill="#FFFFFF"/>
  <!-- Secondary Companion Star -->
  <path d="M49 13 C49 16.5 51.5 19 55 19 C51.5 19 49 21.5 49 25 C49 21.5 46.5 19 43 19 C46.5 19 49 16.5 49 13 Z" fill="#FFFFFF"/>
  <!-- Micro Accent Sparkle Dot -->
  <circle cx="16" cy="47" r="1.75" fill="#FFFFFF"/>
</svg>
`;

fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), SVG_FAVICON, "utf8");
fs.writeFileSync(path.join(APP_DIR, "icon.svg"), SVG_FAVICON, "utf8");

// CRC32 table for PNG chunk writing
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}
const crcTable = createCRC32Table();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Procedural rasterizer for the Remotasks.si emblem
 * Renders anti-aliased RGBA buffer at any resolution
 */
function renderEmblem(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cornerRadius = size * 0.25;
  const padding = size * 0.02;
  const effectiveSize = size - padding * 2;

  // Star parameters
  const c1x = size * 0.47;
  const c1y = size * 0.52;
  const r1x = size * 0.32;
  const r1y = size * 0.32;

  const c2x = size * 0.76;
  const c2y = size * 0.30;
  const r2x = size * 0.11;
  const r2y = size * 0.11;

  const dotX = size * 0.26;
  const dotY = size * 0.74;
  const dotR = size * 0.035;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const idx = (y * size + x) * 4;

      // Rounded rectangle distance test
      const qx = Math.abs(px - size / 2) - (size / 2 - padding - cornerRadius);
      const qy = Math.abs(py - size / 2) - (size / 2 - padding - cornerRadius);
      const dx = Math.max(qx, 0);
      const dy = Math.max(qy, 0);
      const distFromCorner = Math.sqrt(dx * dx + dy * dy);
      const distInside = Math.min(Math.max(qx, qy), 0);
      const dist = distFromCorner + distInside;

      const rectAlpha = Math.min(Math.max(cornerRadius - dist + 0.5, 0), 1);

      if (rectAlpha <= 0) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Check if inside sparkle star 1 (hypocycloid / astroid formula)
      const u1 = Math.abs(px - c1x) / r1x;
      const v1 = Math.abs(py - c1y) / r1y;
      let star1Alpha = 0;
      if (u1 <= 1 && v1 <= 1) {
        const val1 = Math.sqrt(u1) + Math.sqrt(v1);
        if (val1 < 1.0) {
          star1Alpha = Math.min(Math.max((1.0 - val1) * (r1x / 2), 0), 1);
        }
      }

      // Check if inside secondary star 2
      const u2 = Math.abs(px - c2x) / r2x;
      const v2 = Math.abs(py - c2y) / r2y;
      let star2Alpha = 0;
      if (u2 <= 1 && v2 <= 1) {
        const val2 = Math.sqrt(u2) + Math.sqrt(v2);
        if (val2 < 1.0) {
          star2Alpha = Math.min(Math.max((1.0 - val2) * (r2x / 1.5), 0), 1);
        }
      }

      // Check dot
      const dDot = Math.hypot(px - dotX, py - dotY);
      const dotAlpha = Math.min(Math.max(dotR - dDot + 0.5, 0), 1);

      const sparkleAlpha = Math.max(star1Alpha, star2Alpha, dotAlpha);

      // Blend sparkle (white) over black background
      const whiteRatio = sparkleAlpha;
      const r = Math.round(255 * whiteRatio);
      const g = Math.round(255 * whiteRatio);
      const b = Math.round(255 * whiteRatio);
      const a = Math.round(rectAlpha * 255);

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return buf;
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    scanlines[rowOffset] = 0; // Filter byte: 0
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk("IDAT", compressedData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Creates multi-resolution ICO file with embedded PNG streams
 */
function createICO(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // count of images

  let currentOffset = 6 + count * 16;
  const directoryEntries = [];
  const imageBuffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry[0] = img.size >= 256 ? 0 : img.size; // width
    entry[1] = img.size >= 256 ? 0 : img.size; // height
    entry[2] = 0; // color palette count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.png.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // image offset

    directoryEntries.push(entry);
    imageBuffers.push(img.png);
    currentOffset += img.png.length;
  }

  return Buffer.concat([header, ...directoryEntries, ...imageBuffers]);
}

// Generate resolutions
console.log("🎨 Generating Remotasks.si favicons...");

const p16 = encodePNG(16, 16, renderEmblem(16));
const p32 = encodePNG(32, 32, renderEmblem(32));
const p48 = encodePNG(48, 48, renderEmblem(48));
const p180 = encodePNG(180, 180, renderEmblem(180));
const p192 = encodePNG(192, 192, renderEmblem(192));
const p512 = encodePNG(512, 512, renderEmblem(512));

// Write PNG files
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-16x16.png"), p16);
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32x32.png"), p32);
fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-48x48.png"), p48);
fs.writeFileSync(path.join(PUBLIC_DIR, "apple-touch-icon.png"), p180);
fs.writeFileSync(path.join(APP_DIR, "apple-icon.png"), p180);
fs.writeFileSync(path.join(PUBLIC_DIR, "android-chrome-192x192.png"), p192);
fs.writeFileSync(path.join(PUBLIC_DIR, "android-chrome-512x512.png"), p512);

// Write ICO files
const icoBuffer = createICO([
  { size: 16, png: p16 },
  { size: 32, png: p32 },
  { size: 48, png: p48 },
]);

fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), icoBuffer);
fs.writeFileSync(path.join(APP_DIR, "favicon.ico"), icoBuffer);

// Write site.webmanifest
const manifest = {
  name: "Remotasks.si — Verified AI Gig Platform",
  short_name: "Remotasks.si",
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icon.svg",
      sizes: "any",
      type: "image/svg+xml",
    },
  ],
  theme_color: "#000000",
  background_color: "#fafafa",
  display: "standalone",
};

fs.writeFileSync(
  path.join(PUBLIC_DIR, "site.webmanifest"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log("✅ All favicons, apple touch icons, ICO bundles, and web manifests generated successfully!");
