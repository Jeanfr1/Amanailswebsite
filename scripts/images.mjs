// Builds every web image from the kit (originals/), the cut-outs in assets-src/
// (npm run prepare-images) and the v2 plates and ribbons made from the Higgsfield
// deliveries (npm run prepare-higgsfield). Output: public/img/, names carry -v<V>-
// so a changed image always gets a new URL.
// The two client photos are also copied byte-for-byte to public/originals/
// for the full-photo dialog.
import sharp from 'sharp';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const V = 2;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/img');
const SRC = path.join(ROOT, 'assets-src');
await mkdir(OUT, { recursive: true });
await mkdir(path.join(ROOT, 'public/originals'), { recursive: true });

const jobs = [
  // name, source, widths, alpha
  ['hero', 'assets-src/hero-wide-end.png', [1440, 2160, 2880]],
  ['hero-fg', 'assets-src/hero-fg-v2.png', [1100, 1672, 2400], true],
  ['hero-m', 'assets-src/hero-m-end.png', [640, 960, 1280]],
  ['hero-m-fg', 'assets-src/hero-m-fg-v2.png', [640, 960, 1280], true],
  ['macro', 'assets-src/macro-wide.png', [1280, 1920, 2552]],
  ['macro-m', 'assets-src/macro-m.png', [560, 840, 1122]],
  ['satin-wave', 'assets-src/satin-wave.png', [1400, 2400], true],
  ['satin-wave-2', 'assets-src/satin-wave-2.png', [1400, 2400], true],
  ['satin-diagonal', 'assets-src/satin-diagonal.png', [1200, 2000], true],
  ['work', 'originals/work-original.png', [640, 960, 1344]],
  ['work-fg', 'assets-src/work-fg.png', [640, 960, 1344], true],
  ['studio', 'originals/studio-original.png', [560, 766]],
];

const manifest = {};
for (const [name, src, widths, alpha] of jobs) {
  const file = path.join(ROOT, src);
  if (!existsSync(file)) throw new Error(`missing ${src} (run npm run prepare-images first)`);
  const meta = await sharp(file).metadata();
  manifest[name] = { width: meta.width, height: meta.height, widths };
  for (const w of widths) {
    let img = sharp(file).resize({ width: w, withoutEnlargement: true });
    if (!alpha) img = img.removeAlpha();
    await img.clone().avif({ quality: alpha ? 58 : 52, effort: 6 }).toFile(path.join(OUT, `${name}-v${V}-${w}.avif`));
    await img.clone().webp({ quality: alpha ? 82 : 78, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${name}-v${V}-${w}.webp`));
  }
}

// logo: small symbol for the header, line-art for the blush section, icons
const symbol = path.join(SRC, 'logo-symbol.png');
const line = path.join(SRC, 'logo-line.png');
for (const w of [160, 320]) {
  await sharp(symbol).resize({ width: w }).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(OUT, `logo-symbol-v${V}-${w}.webp`));
}
await sharp(symbol).resize({ width: 320 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `logo-symbol-v${V}-320.png`));
for (const w of [700, 1100]) {
  await sharp(line).resize({ width: w }).webp({ quality: 90, alphaQuality: 95 }).toFile(path.join(OUT, `logo-line-v${V}-${w}.webp`));
}
const logo = path.join(ROOT, 'originals/Amanails-logo-transparent.png');
await sharp(logo).resize({ width: 400 }).webp({ quality: 90 }).toFile(path.join(OUT, `logo-v${V}-400.webp`));
await sharp(symbol).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(ROOT, 'public/favicon-32.png'));
await sharp(symbol).resize(180, 180, { fit: 'contain', background: '#4b2d18' }).flatten({ background: '#4b2d18' }).png().toFile(path.join(ROOT, 'public/apple-touch-icon.png'));

// Open Graph card: hero plate, darkened left, logo symbol. Title stays live text on the page.
const og = await sharp(path.join(ROOT, 'assets-src/hero-wide-end.png'))
  .resize(1200, 630, { fit: 'cover', position: 'right' })
  .composite([
    { input: Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1a0d08" stop-opacity=".82"/><stop offset=".62" stop-color="#1a0d08" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`) },
    { input: await sharp(symbol).resize({ width: 150 }).toBuffer(), left: 72, top: 64 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toBuffer();
await writeFile(path.join(ROOT, `public/og-v${V}.jpg`), og);

// originals, untouched bytes
for (const f of ['work-original.png', 'studio-original.png']) {
  await copyFile(path.join(ROOT, 'originals', f), path.join(ROOT, 'public/originals', f));
}
await writeFile(path.join(ROOT, 'src/images.json'), JSON.stringify({ v: V, ...manifest }, null, 1));
console.log('images written to public/img (v' + V + ')');
