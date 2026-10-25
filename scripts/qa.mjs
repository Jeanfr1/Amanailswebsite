// Browser QA on the production build: npm run build && npm run preview, then npm run qa
// (QA_BASE=<url> npm run qa checks a deployed copy).
import { launch, BASE, scrollToY } from './browser.mjs';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`); };
const browser = await launch();

async function open(viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width <= 900, hasTouch: viewport.width <= 900, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  const bad = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  return { ctx, page, errors, bad };
}
const sectionTop = (page, sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);

// ---------- desktop ----------
{
  const { ctx, page, errors, bad } = await open({ width: 1440, height: 900 });
  check('desktop: no console errors', errors.length === 0, errors.join(' | '));
  check('desktop: no failed requests', bad.length === 0, bad.join(' | '));
  check('desktop: lang=de', (await page.getAttribute('html', 'lang')) === 'de');
  check('desktop: one h1 with the board title', (await page.$$eval('h1', (h) => h.map((x) => x.textContent.replace(/\s+/g, ' ').trim()))).join() === 'Eine Linie. Dein Stil.');
  const order = await page.$$eval('main > section', (s) => s.map((x) => x.id).join(','));
  check('desktop: approved scene order', order === 'start,detail,arbeiten,leistungen,studio', order);
  const solid = await page.$$eval('main > section', (s) => s.filter((x) => { const c = getComputedStyle(x).backgroundColor; return c !== 'rgba(0, 0, 0, 0)' && !x.querySelector('.scene-media, .hero-cam'); }).map((x) => x.id));
  check('desktop: exactly one solid section (Für dich.)', solid.join() === 'leistungen', solid.join());
  check('desktop: services colour #BFA398', (await page.$eval('#leistungen', (x) => getComputedStyle(x).backgroundColor)) === 'rgb(191, 163, 152)');
  check('desktop: no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  check('desktop: title visible after intro', await page.$eval('.hero-title .line > span', (x) => getComputedStyle(x).transform === 'none' || getComputedStyle(x).transform === 'matrix(1, 0, 0, 1, 0, 0)'));
  const lineDrawn = await page.$eval('.hero-stroke--d path:nth-child(2)', (p) => parseFloat(getComputedStyle(p).strokeDashoffset));
  check('desktop: opening line drawn from the brush', lineDrawn < .01, String(lineDrawn));

  // the line starts at the bristle tip
  const tip = await page.evaluate(() => {
    const p = document.querySelector('.hero-stroke--d path:nth-child(2)');
    const pt = p.getPointAtLength(0); const m = p.getScreenCTM();
    return [pt.x * m.a + m.e, pt.y * m.d + m.f];
  });
  const plateTip = await page.evaluate(() => { const s = Math.max(innerWidth / 1672, innerHeight / 941); return [1188 * s - (1672 * s - innerWidth) / 2, 652 * s - (941 * s - innerHeight) / 2]; });
  check('desktop: line origin on the brush tip (±3px)', Math.hypot(tip[0] - plateTip[0], tip[1] - plateTip[1]) < 3, `${tip.map(Math.round)} vs ${plateTip.map(Math.round)}`);

  // nav anchor
  await page.click('.masthead-nav a[href="#leistungen"]');
  await page.waitForTimeout(1600);
  const t = await sectionTop(page, '#leistungen');
  check('desktop: nav → Leistungen lands at the section', Math.abs(t) < 4, String(t));
  check('desktop: compact bar shows after the opening scene', await page.$eval('.bar', (b) => b.classList.contains('is-on')));

  // service dialog
  await scrollToY(page, await page.evaluate(() => document.querySelector('#leistungen').getBoundingClientRect().top + scrollY - 40));
  await page.click('[data-service="pedicure"]');
  await page.waitForTimeout(500);
  check('desktop: service opens its dialog', (await page.$eval('#service', (d) => d.open && document.querySelector('#service-title').textContent)) === 'Pediküre');
  await page.click('#service [data-dialog="booking"]');
  await page.waitForTimeout(500);
  check('desktop: service → booking dialog', await page.$eval('#booking', (d) => d.open) && !(await page.$eval('#service', (d) => d.open)));
  const links = await page.$$eval('#booking a', (a) => a.map((x) => x.href));
  check('desktop: booking offers Instagram + phone', links.includes('https://www.instagram.com/amanails.d/') && links.includes('tel:+4917660032244'), links.join(' '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('desktop: Escape closes, focus returns to the service', !(await page.$eval('#booking', (d) => d.open)) && (await page.evaluate(() => document.activeElement?.dataset.service)) === 'pedicure');

  // studio CTA (real pointer at the scene's settled state)
  await scrollToY(page, await page.evaluate(() => document.querySelector('#studio').getBoundingClientRect().top + scrollY));
  await page.click('.studio .cta');
  await page.waitForTimeout(500);
  check('desktop: studio CTA opens booking', await page.$eval('#booking', (d) => d.open));
  await page.mouse.click(8, 8); // backdrop
  await page.waitForTimeout(400);
  check('desktop: backdrop click closes dialog', !(await page.$eval('#booking', (d) => d.open)));
  check('desktop: Anfahrt uses the owner\'s Maps link', (await page.$eval('.place', (a) => a.href)) === 'https://maps.app.goo.gl/dQKtftZLRgPTJKW1A');

  // full photo: the untouched original
  await scrollToY(page, await page.evaluate(() => document.querySelector('#arbeiten').getBoundingClientRect().top + scrollY));
  await page.click('[data-dialog="photo"]');
  await page.waitForFunction(() => document.querySelector('#photo img').complete && document.querySelector('#photo img').naturalWidth > 0);
  const src = await page.$eval('#photo img', (i) => i.currentSrc);
  const served = Buffer.from(await (await page.request.get(src)).body());
  const original = await readFile('originals/work-original.png');
  const h = (b) => createHash('sha256').update(b).digest('hex');
  check('desktop: full photo = original file bytes', h(served) === h(original));
  await page.keyboard.press('Escape');

  // pause button
  await page.click('.motion-toggle');
  await page.waitForTimeout(400);
  check('desktop: pause → motion-off, opening scene one screen tall', await page.evaluate(() => document.documentElement.classList.contains('motion-off') && Math.abs(document.querySelector('.hero').offsetHeight - innerHeight) < 2));
  await page.click('.motion-toggle');
  await page.waitForTimeout(300);
  check('desktop: resume → motion on', await page.evaluate(() => !document.documentElement.classList.contains('motion-off')));

  // visitor-facing text never carries production notes
  const text = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt],[aria-label],[title]')].map((e) => e.getAttribute('alt') || e.getAttribute('aria-label') || e.getAttribute('title')).join(' '));
  const leak = text.match(/\b(KI|generiert|Kampagne\w*|Inspiration\w*|Originalfoto|Mockup|bearbeitet|Bildhinweis\w*|konzept\w*|TODO|lorem)\b/gi);
  check('desktop: no production notes in copy or alt text', !leak, leak?.join(', '));
  await ctx.close();
}

// ---------- phone ----------
for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 740 }]) {
  const { ctx, page, errors, bad } = await open(vp);
  const tag = `phone ${vp.width}`;
  check(`${tag}: no errors / failed requests`, errors.length === 0 && bad.length === 0, [...errors, ...bad].join(' | '));
  check(`${tag}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  check(`${tag}: phone plate in use`, (await page.$eval('.hero-cam .plate', (i) => i.currentSrc)).includes('hero-m-'));
  const heavy = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /hero-v1|hero-fg-v1/.test(r.name)).map((r) => r.name));
  check(`${tag}: desktop plates not downloaded`, heavy.length === 0, heavy.join(' '));
  await page.tap('.masthead-menu');
  await page.waitForTimeout(300);
  check(`${tag}: menu opens`, await page.$eval('#menu', (m) => !m.hidden));
  await page.tap('#menu a[href="#studio"]');
  await page.waitForTimeout(1800);
  check(`${tag}: menu link closes menu and scrolls`, (await page.$eval('#menu', (m) => m.hidden)) && Math.abs(await sectionTop(page, '#studio')) < 4);
  const ctaBox = await page.$eval('.studio .cta .pill', (e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; });
  check(`${tag}: CTA touch target ≥ 44px`, ctaBox[1] >= 44, ctaBox.map(Math.round).join('x'));
  await scrollToY(page, await page.evaluate(() => document.querySelector('.studio .cta').getBoundingClientRect().top + scrollY - innerHeight / 2));
  await page.tap('.studio .cta');
  await page.waitForTimeout(500);
  check(`${tag}: studio CTA opens booking`, await page.$eval('#booking', (d) => d.open));
  await ctx.close();
}

// ---------- reduced motion ----------
{
  const { ctx, page } = await open({ width: 1280, height: 800 }, { reducedMotion: 'reduce' });
  check('reduced motion: motion-off, pause button disabled', await page.evaluate(() => document.documentElement.classList.contains('motion-off') && document.querySelector('.motion-toggle').disabled));
  check('reduced motion: lines fully drawn, copy visible', await page.evaluate(() => getComputedStyle(document.querySelector('.ribbon path:nth-child(2)')).strokeDashoffset === '0px' || getComputedStyle(document.querySelector('.ribbon path:nth-child(2)')).strokeDashoffset === '0'));
  await ctx.close();
}

// ---------- no JS ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const vis = await page.evaluate(() => ['.hero-title', '#detail-title', '#work-title', '#services-title', '#studio-title', '.footer'].map((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return getComputedStyle(e).opacity !== '0' && r.height > 0; }));
  check('no JS: every heading and the footer render', vis.every(Boolean), vis.join());
  check('no JS: sections keep their contours', (await page.$eval('#detail', (d) => getComputedStyle(d).clipPath)).includes('clip-detail'));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
