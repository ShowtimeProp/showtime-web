import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('app', 'icon-source.png');

async function ensureDirs() {
  await fs.mkdir('app', { recursive: true });
  await fs.mkdir('public', { recursive: true });
}

async function makePng(src, out, size) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 0, bottom: 0, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
}

async function makeFaviconIco(src, out) {
  // Generate multiple sizes and combine into .ico
  const sizes = [16, 32, 48, 64];
  const bufs = await Promise.all(
    sizes.map(async (s) => await sharp(src).resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer())
  );
  await sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .png()
    .toBuffer();
  await sharp(bufs[0])
    .joinChannel(bufs[1])
    .toBuffer();
  // sharp doesn't write multi-size .ico directly; instead, write 64x64 .ico which is fine for modern browsers
  await sharp(src).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toFile(out);
}

async function run() {
  await ensureDirs();
  try {
    await fs.access(SRC);
  } catch {
    console.error(`Source not found: ${SRC}. Please place your logo as app/icon-source.png`);
    process.exit(1);
  }

  // Core
  await makePng(SRC, path.resolve('app', 'icon.png'), 512);
  await makePng(SRC, path.resolve('app', 'apple-icon.png'), 180);

  // Favicon
  await makeFaviconIco(SRC, path.resolve('app', 'favicon.ico'));

  // PWA icons
  await makePng(SRC, path.resolve('public', 'icon-192.png'), 192);
  await makePng(SRC, path.resolve('public', 'icon-512.png'), 512);

  // Maskable (with extra padding to avoid cropping)
  await sharp(SRC)
    .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 16, bottom: 16, left: 16, right: 16, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve('public', 'maskable-192.png'));

  await sharp(SRC)
    .resize(450, 450, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 31, bottom: 31, left: 31, right: 31, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.resolve('public', 'maskable-512.png'));

  console.log('Icons generated:');
  console.log('- app/icon.png');
  console.log('- app/apple-icon.png');
  console.log('- app/favicon.ico');
  console.log('- public/icon-192.png');
  console.log('- public/icon-512.png');
  console.log('- public/maskable-192.png');
  console.log('- public/maskable-512.png');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
