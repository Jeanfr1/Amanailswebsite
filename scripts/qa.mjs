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
  // photos at the board's scale (rendered px per photo px vs board px per photo px, ±5%;
  // u = board px at the density of a 1024 px board), and no zoom on top
  const scales = await page.evaluate(() => {
    const u = Math.min(document.querySelector('main').clientWidth, 1600) / 1024;
    return Object.fromEntries([['hero', '.hero-cam:not(.hero-cam--fg) picture', 1, 1238], ['macro', '.frame--detail img', 2552, .5], ['work', '.frame--work img', 1344, 575 / 1344], ['studio', '.frame--studio img', 766, 452 / 766]]
      .map(([k, sel, nat, want]) => [k, +(document.querySelector(sel).getBoundingClientRect().width / nat / u / want).toFixed(2)]));
  });
  check('desktop: photos at the board scale (±5%)', Object.values(scales).every((r) => r > .95 && r < 1.05), JSON.stringify(scales));
  let maxScale = 1;
  for (const yy of [0, 300, 600, 1200, 1800, 2400, 3000]) {
    await page.evaluate((v) => scrollTo({ top: v, behavior: 'instant' }), yy);
    await page.waitForTimeout(250);
    maxScale = Math.max(maxScale, await page.evaluate(() => Math.max(...[...document.querySelectorAll('.scene-media, [data-cam], .frame')].map((el) => new DOMMatrix(getComputedStyle(el).transform).a))));
  }
  check('desktop: no zoom on photos while scrolling (scale ≤ 1.0)', maxScale <= 1.001, String(maxScale));
  check('desktop: no vector line left on the page', (await page.$$('.stroke, .ribbon, .edge')).length === 0);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(300);

  // the opening film: plays once, silent, and rests on its last frame with the title behind the finger
  await page.waitForFunction(() => document.documentElement.classList.contains('film-done'), null, { timeout: 12000 }).catch(() => {});
  const film = await page.evaluate(() => { const v = document.querySelector('.hero-film video'); return { done: document.documentElement.classList.contains('film-done'), t: v.currentTime, muted: v.muted, loop: v.loop, src: v.currentSrc.split('/').pop(), shown: getComputedStyle(v.parentElement).display !== 'none' }; });
  check('desktop: opening film plays to its last frame (muted, once)', film.done && film.t > 4.9 && film.muted && !film.loop && film.shown && film.src.startsWith('hero-v2-2048'), JSON.stringify(film));
  check('desktop: finger cut-out stays over the film', await page.evaluate(() => getComputedStyle(document.querySelector('.hero-cam--fg .plate')).opacity === '1'));

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

  // every entrance has finished once its scene was on screen
  for (const sel of ['#detail', '#arbeiten', '#leistungen', '#studio']) { await scrollToY(page, await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel), { settle: 400 }); }
  await page.waitForTimeout(1800);
  const pending = await page.evaluate(() => [...document.querySelectorAll('[data-reveal], [data-satin]')].filter((el) => !el.classList.contains('in')).map((el) => el.className || el.tagName));
  check('desktop: all entrances (and satin ribbons) completed after a pass', pending.length === 0, pending.join(', '));
  check('desktop: satin ribbons loaded', await page.evaluate(() => [...document.querySelectorAll('.satin img')].every((i) => i.complete && i.naturalWidth > 0)));

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
  const heavy = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /\/(hero|hero-fg|hero-start|macro)-v2-|\/film\/hero-v2/.test(r.name)).map((r) => r.name));
  check(`${tag}: desktop plates and film not downloaded`, heavy.length === 0, heavy.join(' '));
  check(`${tag}: phone film in use`, (await page.$eval('.hero-film video', (v) => v.currentSrc)).includes('/film/hero-m-v2-720'));
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
  check('reduced motion: every entrance shown at once', await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1')));
  check('reduced motion: no film, the still end frame shows', await page.evaluate(() => !document.documentElement.classList.contains('film') && getComputedStyle(document.querySelector('.hero-film')).display === 'none' && getComputedStyle(document.querySelector('.hero-cam .plate')).opacity === '1'));
  check('reduced motion: film never requested', await page.evaluate(() => !performance.getEntriesByType('resource').some((r) => r.name.includes('/film/'))));
  await ctx.close();
}

// ---------- scale: no "super zoom" (the board drawn at the density of a 1024 px board) ----------
for (const vp of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  await page.goto(BASE + '?static&nosmooth', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const vh = innerHeight, top = (s) => document.querySelector(s).getBoundingClientRect().top + scrollY;
    const step = (a, b) => (top(b) - top(a)) / vh;
    const fs = (s) => Math.max(...[...document.querySelectorAll(s)].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    const small = [...document.querySelectorAll('.num, .caps, .masthead-nav a, .work-links, .place, .footer')].map((e) => parseFloat(getComputedStyle(e).fontSize));
    return { next: top('#detail') / vh, detail: step('#detail', '#arbeiten'), work: step('#arbeiten', '#leistungen'), services: step('#leistungen', '#studio'), studio: document.querySelector('#studio').offsetHeight / vh, titles: fs('.detail-copy .display, .work-copy .display, .display--m') / innerWidth, hero: fs('.hero-title') / innerWidth, smallMin: Math.min(...small) };
  });
  const tag = `scale ${vp.width}`;
  check(`${tag}: next scene starts on the first screen (<= 0.8 vh)`, m.next <= .8, `${m.next.toFixed(2)} vh`);
  check(`${tag}: scenes 02-04 under 0.8 vh each`, Math.max(m.detail, m.work, m.services) <= .8, [m.detail, m.work, m.services].map((v) => v.toFixed(2)).join('/'));
  check(`${tag}: studio + footer under 0.95 vh`, m.studio <= .95, m.studio.toFixed(2));
  check(`${tag}: section titles <= 7.5% of the width, opening title <= 9.5%`, m.titles <= .075 && m.hero <= .095, `${(m.titles * 100).toFixed(1)}% / ${(m.hero * 100).toFixed(1)}%`);
  check(`${tag}: no text under 11 px`, m.smallMin >= 11, `${m.smallMin}px`);
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
