// Natural-speed wheel scroll; saves a frame every ~180 ms to qa/wheel/<label>-NN.png
import { launch, BASE } from './browser.mjs';
import { mkdir } from 'node:fs/promises';
const [size = '1440x900', label = 'w', from = '0', to = '3400'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
await mkdir('qa/wheel', { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(3400);
await page.evaluate((y) => scrollTo(0, y), +from);
await page.waitForTimeout(600);
let n = 0, last = 0;
const t0 = Date.now();
while ((await page.evaluate(() => scrollY)) < +to - 5) {
  await page.mouse.wheel(0, 60);           // ~ a trackpad flick: 60px every 16ms ≈ 1000px/s
  await page.waitForTimeout(16);
  if (Date.now() - last > 180) { last = Date.now(); await page.screenshot({ path: `qa/wheel/${label}-${String(n++).padStart(2, '0')}.png` }); }
  if (Date.now() - t0 > 60000) break;
}
console.log(label, 'frames', n);
await browser.close();
