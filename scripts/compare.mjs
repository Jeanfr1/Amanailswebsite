// Page vs approved board at the board's proportions (1440 wide, hero = 440u).
// Writes qa/compare.png: board | page | 50% blend, plus a mean-difference score.
import { launch, BASE } from './browser.mjs';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const W = 1440;
const u = W / 760;
const H = Math.round(440 * u);
await mkdir('qa', { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(BASE + '?static', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  for (const img of document.images) img.loading = 'eager';
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
});
// walk the page once so every image is decoded before the full-page capture
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let yy = 0; yy < total; yy += H / 2) { await page.evaluate((v) => scrollTo(0, v), yy); await page.waitForTimeout(120); }
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(1500);
const shot = await page.screenshot({ fullPage: true });
await browser.close();

const boardH = Math.round(2070 * u);
const board = await sharp('docs/modelo-2-aprovado.png').resize(W, boardH).removeAlpha().toBuffer();
const pageImg = await sharp(shot).extract({ left: 0, top: 0, width: W, height: boardH }).removeAlpha().toBuffer();
const blend = await sharp(board).composite([{ input: await sharp(pageImg).ensureAlpha(.5).toBuffer(), blend: 'over' }]).toBuffer();
const a = await sharp(board).raw().toBuffer();
const b = await sharp(pageImg).raw().toBuffer();
let sum = 0;
for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
console.log('mean abs diff (0-255):', (sum / a.length).toFixed(1));
const gap = 24;
await sharp({ create: { width: W * 3 + gap * 2, height: boardH, channels: 3, background: '#ffffff' } })
  .composite([{ input: board, left: 0, top: 0 }, { input: pageImg, left: W + gap, top: 0 }, { input: blend, left: 2 * (W + gap), top: 0 }])
  .png().toBuffer()
  .then((buf) => sharp(buf).resize({ width: 1800 }).toFile('qa/compare.png'));
await sharp(await sharp(board).composite([{ input: pageImg, left: 0, top: 0, blend: 'difference' }]).png().toBuffer()).resize({ width: 760 }).toFile('qa/compare-diff.png');
console.log('qa/compare.png written');
