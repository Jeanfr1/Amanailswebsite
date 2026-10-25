// First screen at several viewport sizes: node scripts/first-screen.mjs
import { launch, BASE } from './browser.mjs';
import { mkdir } from 'node:fs/promises';
const sizes = (process.argv[2] || '1920x1080,1366x768,1280x720,1024x768,768x1024,360x780,430x932').split(',');
await mkdir('qa/first', { recursive: true });
const browser = await launch();
for (const s of sizes) {
  const [width, height] = s.split('x').map(Number);
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width <= 900, hasTouch: width <= 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  await page.screenshot({ path: `qa/first/${s}.png` });
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(s, 'overflow', ov);
  await page.close();
}
await browser.close();
