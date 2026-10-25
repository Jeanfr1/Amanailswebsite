// Contact sheet of scroll positions: node scripts/shots.mjs 1440x900 [label] [query]
// Writes qa/shots/<label>-<i>.png at the hero, each scene and the footer.
import { launch, BASE, scrollToY } from './browser.mjs';
import { mkdir } from 'node:fs/promises';

const [size = '1440x900', label = size, query = ''] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const phone = width <= 900;
await mkdir('qa/shots', { recursive: true });
const browser = await launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone });
page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(BASE + query, { waitUntil: 'networkidle' });
await page.waitForTimeout(3600);
const stops = await page.evaluate(() => {
  const top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
  const hero = document.querySelector('.hero');
  const pin = hero.offsetHeight - innerHeight;
  return [0, Math.round(pin * .5), pin, top('#detail') - 40, top('#arbeiten') - innerHeight * .15, top('#arbeiten') + 40, top('#leistungen') - innerHeight * .2, top('#leistungen') - 20, top('#studio') - innerHeight * .2, top('#studio'), document.documentElement.scrollHeight - innerHeight];
});
for (const [i, y] of stops.entries()) {
  await scrollToY(page, Math.max(0, Math.round(y)));
  await page.screenshot({ path: `qa/shots/${label}-${String(i).padStart(2, '0')}.png` });
}
const overflow = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
console.log(label, 'stops', stops.map(Math.round).join(','), 'scrollWidth/innerWidth', overflow.join('/'));
await browser.close();
