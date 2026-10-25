// README captures from the production build (npm run build && npm run preview):
// GIF frames, desktop sections, phone screens and the banner, all in qa/readme/.
// Then: python3 scripts/readme-composite.py
import { launch, BASE, scrollToY } from './browser.mjs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const OUT = 'qa/readme';
await rm(OUT, { recursive: true, force: true });
await mkdir(`${OUT}/frames`, { recursive: true });
const browser = await launch();
const raf2 = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const loadAll = (page) => page.evaluate(async () => {
  for (const img of document.images) img.loading = 'eager';
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
});
const top = (page, sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);

const filmDone = (page) => page.waitForFunction(() => document.documentElement.classList.contains('film-done'), null, { timeout: 20000 });

// ---------- GIF: the brush film, then the hand-off into the detail ----------
// The film is stepped by seeking (0.1 s per frame) and the title's rise is scrubbed
// through its CSS transitions, so the GIF runs at the film's real pace whatever
// the headless browser's frame rate.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?nosmooth', { waitUntil: 'networkidle' });
  await loadAll(page);
  await filmDone(page);
  const duration = await page.evaluate(async () => {
    const r = document.documentElement, v = document.querySelector('.hero-film video');
    r.classList.remove('film-done');
    r.classList.add('film-wait');
    v.pause();
    v.currentTime = 0;
    await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
    await new Promise((res) => setTimeout(res, 400)); // line 2 keeps its 0.16 s delay on the way back under the mask
    return v.duration;
  });
  let n = 0;
  const frame = async () => page.screenshot({ path: `${OUT}/frames/f_${String(n++).padStart(4, '0')}.png` });
  const at = (t) => page.evaluate(async (t) => {
    const r = document.documentElement, v = document.querySelector('.hero-film video');
    const lines = [...document.querySelectorAll('.hero-title .line > span')];
    if (t >= 1.1 && r.classList.contains('film-wait')) { r.classList.remove('film-wait'); getComputedStyle(lines[0]).transform; }
    for (const a of document.getAnimations()) if (lines.includes(a.effect?.target)) { a.pause(); a.currentTime = Math.max(0, (t - 1.1) * 1000); }
    v.currentTime = t;
    await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  }, t);
  for (let t = 0; t < duration - .05; t += .1) { await at(+t.toFixed(2)); await frame(); }
  await at(duration - .02);
  for (let i = 0; i < 8; i++) await frame(); // hold on the last frame
  const end = Math.round(await top(page, '#detail') + 40);
  const steps = 34;
  for (let i = 1; i <= steps; i++) {
    const y = Math.round(end * (1 - Math.cos((i / steps) * Math.PI)) / 2);
    await page.evaluate((v) => scrollTo({ top: v, behavior: 'instant' }), y);
    await page.waitForTimeout(350); await raf2(page);
    await frame();
  }
  for (let i = 0; i < 6; i++) await frame();
  console.log('gif frames', n);
  await page.close();
}

// ---------- desktop sections ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?nosmooth', { waitUntil: 'networkidle' });
  await loadAll(page);
  await filmDone(page);
  await page.screenshot({ path: `${OUT}/desk-0-hero.png` });
  const shots = [['detail', '#detail', 60], ['work', '#arbeiten', 0], ['services', '#leistungen', -40], ['studio', '#studio', 40]];
  for (const [name, sel, off] of shots) {
    await scrollToY(page, Math.round(await top(page, sel) + off), { settle: 1200 });
    await page.screenshot({ path: `${OUT}/desk-${name}.png` });
  }
  await page.close();
}

// ---------- phone ----------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(BASE + '?nosmooth', { waitUntil: 'networkidle' });
  await loadAll(page);
  await filmDone(page);
  await page.screenshot({ path: `${OUT}/phone-0-hero.png` });
  const shots = [['1-detail', '#detail', 70], ['2-work', '#arbeiten', 60], ['3-services', '#leistungen', 40], ['4-studio', '#studio', 380]];
  for (const [name, sel, off] of shots) {
    await scrollToY(page, Math.round(await top(page, sel) + off), { settle: 1200 });
    await page.screenshot({ path: `${OUT}/phone-${name}.png` });
  }
  await page.close();
}

// ---------- banner (the site's own fonts and plate) ----------
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 560 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.setContent(`<!doctype html><html><head><base href="${BASE}"><style>
    @font-face{font-family:B;src:url(fonts/bodoni-moda-400.woff2)} @font-face{font-family:M;src:url(fonts/manrope-500.woff2)}
    body{margin:0;width:1600px;height:560px;background:#1d100b;color:#f5f0ea;overflow:hidden;position:relative;font-family:M}
    .plate{position:absolute;right:0;top:0;width:1180px;height:560px;object-fit:cover;object-position:58% 40%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 34%)}
    .mark{position:absolute;left:96px;top:70px;width:110px}
    h1{position:absolute;left:96px;top:208px;margin:0;font:400 104px/0.9 B;letter-spacing:-.06em;text-shadow:0 2px 24px rgba(20,8,4,.5)}
    h1 span{display:block;margin-left:44px}
    p{position:absolute;left:100px;top:440px;margin:0;font-size:15px;letter-spacing:.42em;text-transform:uppercase;color:rgba(245,240,234,.82)}
  </style></head><body>
    <img class="plate" src="img/hero-v2-2160.webp"><img class="mark" src="img/logo-symbol-v2-320.webp">
    <h1>Eine Linie.<span>Dein Stil.</span></h1>
    <p>Amanails · Hamburg · Maniküre · Pediküre · Nageldesign</p>
  </body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/banner.png` });
  await page.close();
}
await browser.close();
console.log('captures in', path.resolve(OUT));
