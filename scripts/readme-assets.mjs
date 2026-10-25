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

// ---------- GIF: the opening line, then the hand-off into the detail ----------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '?nosmooth', { waitUntil: 'networkidle' });
  await loadAll(page);
  await page.waitForTimeout(3000);
  // replay the intro from its first state
  await page.evaluate(() => {
    const r = document.documentElement;
    const paths = [...document.querySelectorAll('.hero-stroke path')];
    paths.forEach((p) => { p.style.transition = 'none'; });
    r.classList.remove('is-ready');
    document.body.offsetHeight;
    paths.forEach((p) => { p.style.transition = ''; });
  });
  await page.waitForTimeout(200);
  let n = 0;
  const frame = async () => page.screenshot({ path: `${OUT}/frames/f_${String(n++).padStart(4, '0')}.png` });
  await frame(); await frame();
  await page.evaluate(() => document.documentElement.classList.add('is-ready'));
  const t0 = Date.now();
  while (Date.now() - t0 < 3300) { await frame(); await page.waitForTimeout(60); }
  for (let i = 0; i < 6; i++) await frame(); // hold
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
  await page.waitForTimeout(3000);
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
  await page.waitForTimeout(3000);
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
    .plate{position:absolute;right:0;top:0;width:1100px;height:560px;object-fit:cover;object-position:62% 60%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 38%)}
    .mark{position:absolute;left:96px;top:70px;width:110px}
    h1{position:absolute;left:96px;top:208px;margin:0;font:400 104px/0.9 B;letter-spacing:-.06em}
    h1 span{display:block;margin-left:44px}
    p{position:absolute;left:100px;top:440px;margin:0;font-size:15px;letter-spacing:.42em;text-transform:uppercase;color:rgba(245,240,234,.82)}
    svg{position:absolute;inset:0}
  </style></head><body>
    <img class="plate" src="img/hero-v1-1672.webp"><img class="mark" src="img/logo-symbol-v1-320.webp">
    <h1>Eine Linie.<span>Dein Stil.</span></h1>
    <p>Amanails · Hamburg · Maniküre · Pediküre · Nageldesign</p>
    <svg viewBox="0 0 1600 560"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#b9806c"/><stop offset=".45" stop-color="#f0c8b4"/><stop offset="1" stop-color="#d49a86"/></linearGradient></defs>
    <path d="M-20 200 C 150 182 330 196 440 206 S 610 196 612 246 S 548 352 578 398 S 780 436 950 426 S 1190 402 1282 394" fill="none" stroke="rgba(66,28,16,.45)" stroke-width="7" stroke-linecap="round"/>
    <path d="M-20 200 C 150 182 330 196 440 206 S 610 196 612 246 S 548 352 578 398 S 780 436 950 426 S 1190 402 1282 394" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/></svg>
  </body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/banner.png` });
  await page.close();
}
await browser.close();
console.log('captures in', path.resolve(OUT));
