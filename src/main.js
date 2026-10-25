// Amanails · model 2 "Gesto". One rosé line leaves the brush in the opening
// scene and runs through every scene below. No library: one rAF loop that
// only runs while the page is scrolling or settling.
import './style.css';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (x) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const range = (p, a, b) => ease((p - a) / (b - a));
const outCubic = (x) => 1 - Math.pow(1 - clamp(x), 3);

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const phoneMQ = matchMedia('(max-width: 900px)');
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let userPaused = params.has('static');
let paused = false;

// ---------- curves ----------
// Catmull-Rom through points -> cubic Bézier path string
function smoothPath(pts) {
  const f = (n) => Math.round(n * 10) / 10;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

// Opening line in plate pixels: starts at the bristle tip on the nail, dips
// under "Stil", climbs through the title and leaves on the left (board path).
const HERO_LINE = {
  d: [[1188, 652], [1153, 713], [1034, 763], [876, 769], [737, 773], [658, 723], [630, 654], [602, 575], [614, 476], [646, 396], [670, 337], [618, 297], [519, 301], [380, 309], [202, 297], [20, 240], [-160, 190]],
  m: [[724, 878], [651, 955], [535, 980], [419, 955], [336, 880], [302, 781], [316, 681], [352, 598], [385, 498], [352, 399], [286, 332], [169, 307], [36, 290], [-160, 270]],
};
for (const [key, pts] of Object.entries(HERO_LINE)) {
  const d = smoothPath(pts);
  $$(`.hero-stroke--${key} path`).forEach((p) => p.setAttribute('d', d));
}

// Page ribbon. Desktop: board px, each point read against the section it
// falls in (board box tops below). Phone: [section, x share, y share].
const BOARD_TOPS = { detail: 405, work: 845, services: 1300, studio: 1610 };
const RIBBON_D = [[-40, 488], [60, 490], [170, 498], [270, 515], [350, 548], [405, 600], [440, 668], [468, 740], [497, 808], [530, 868], [575, 905], [650, 928], [730, 945], [800, 958], [850, 1100], [810, 1255], [700, 1272], [580, 1288], [450, 1296], [330, 1292], [200, 1284], [128, 1291], [118, 1306], [200, 1318], [330, 1319], [450, 1333], [560, 1337], [680, 1322], [760, 1310], [810, 1302], [860, 1450], [810, 1600], [760, 1614], [680, 1650], [590, 1700], [525, 1752], [476, 1800], [440, 1850], [380, 1895], [300, 1935], [200, 1968], [100, 1990], [0, 2005], [-60, 2012]];
const RIBBON_M = [
  ['detail', -.1, .085], ['detail', .2, .095], ['detail', .55, .11], ['detail', .9, .17], ['detail', 1.02, .33], ['detail', .93, .56], ['detail', .74, .76], ['detail', .78, .93],
  ['work', .9, .06], ['work', 1.12, .14], ['work', 1.14, .6], ['work', 1.1, .975], ['services', .8, .02], ['services', .5, .03], ['services', .22, .02], ['services', .1, .045], ['services', .2, .065], ['services', .5, .05], ['services', .8, .045], ['services', 1.12, .04],
  ['services', 1.14, .6], ['studio', 1.1, .02], ['studio', .85, .07], ['studio', .55, .16], ['studio', .3, .3], ['studio', .08, .44], ['studio', -.12, .5],
];

// ---------- elements ----------
const main = $('main');
const hero = $('.hero');
const cams = $$('[data-cam]');
const heroTitle = $('.hero-title');
const heroNote = $('.hero-note');
const bar = $('.bar');
const ribbon = $('.ribbon');
const ribbonPaths = $$('path', ribbon);
const scenes = ['detail', 'arbeiten', 'leistungen', 'studio'].map((id) => {
  const el = document.getElementById(id);
  return { id, el, media: $$('.scene-media', el), edge: $('.edge path', el), top: 0, h: 0 };
});
const S = Object.fromEntries(scenes.map((s) => [s.id, s]));
const detailLines = $$('.detail .line > span');
const detailCaps = $('.detail .caps');
const detailBits = $$('.detail .num, .detail .rule');
const workLines = $$('.work .line > span');
const workBits = $$('.work .num, .work .rule, .work-links');
const deinWord = $('.dein');
const deinLetters = $$('.dein > span');
const mark = $('.services-mark');
const servicesTitle = $('.display--xl');
const serviceItems = $$('.service-list li');
const servicesBits = $$('.services .num, .services .rule');
const studioCopy = $('.studio-copy');
const studioLines = $$('.studio .line > span');
const studioBits = $$('.studio-num, .studio-rule');

// split "Für dich." into letters (the heading keeps its accessible name)
servicesTitle.setAttribute('aria-label', servicesTitle.textContent);
servicesTitle.innerHTML = [...servicesTitle.textContent].map((c) => (c === ' ' ? ' ' : `<span class="ch" aria-hidden="true">${c}</span>`)).join('');
const titleChars = $$('.ch', servicesTitle);

// ---------- geometry ----------
let G = null;
function pageTop(el) { return el.getBoundingClientRect().top + scrollY; }

function measure() {
  const phone = phoneMQ.matches;
  const mainTop = pageTop(main);
  const vw = main.clientWidth;
  const vh = innerHeight;
  const u = Math.min(vw, 1600) / 760;
  const x0 = (vw - 760 * u) / 2;
  for (const s of scenes) { s.top = pageTop(s.el) - mainTop; s.h = s.el.offsetHeight; }
  G = { phone, mainTop, vw, vh, u, x0, pin: Math.max(1, hero.offsetHeight - vh), heroTop: pageTop(hero), height: main.offsetHeight };

  // edges follow the clip contour of their own section
  for (const s of scenes) {
    const clip = document.getElementById(`clip-${s.el.dataset.clip || ({ detail: 'detail', arbeiten: 'work', leistungen: 'services', studio: 'studio' })[s.id]}${phone ? '-m' : ''}`);
    const d = $('path', clip).getAttribute('d').replace(/V1H0Z$/, '');
    s.edge.setAttribute('d', d);
    s.edge.closest('svg').setAttribute('viewBox', '0 0 1 1');
  }

  // ribbon in main's coordinates
  const pts = phone
    ? RIBBON_M.map(([id, fx, fy]) => { const s = S[{ detail: 'detail', work: 'arbeiten', services: 'leistungen', studio: 'studio' }[id]]; return [fx * vw, s.top + fy * s.h]; })
    : RIBBON_D.map(([bx, by]) => {
      const key = by >= BOARD_TOPS.studio ? 'studio' : by >= BOARD_TOPS.services ? 'services' : by >= BOARD_TOPS.work ? 'work' : 'detail';
      const s = S[{ detail: 'detail', work: 'arbeiten', services: 'leistungen', studio: 'studio' }[key]];
      return [x0 + bx * u, s.top + (by - BOARD_TOPS[key]) * u];
    });
  ribbon.setAttribute('viewBox', `0 0 ${vw} ${G.height}`);
  ribbon.style.height = `${G.height}px`;
  const d = smoothPath(pts);
  ribbonPaths.forEach((p) => p.setAttribute('d', d));
  // lookup: how far along the path the line has reached a given depth
  const path = ribbonPaths[1];
  const total = path.getTotalLength();
  const N = 600;
  const reach = new Float32Array(N + 1);
  let maxY = -Infinity;
  for (let i = 0; i <= N; i++) { maxY = Math.max(maxY, path.getPointAtLength((total * i) / N).y); reach[i] = maxY; }
  G.reach = reach;
  G.first = pts[0][1];
  render(true);
}

function ribbonDraw(depth) {
  const r = G.reach;
  if (depth <= r[0]) return 0;
  let lo = 0, hi = r.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (r[mid] <= depth) lo = mid; else hi = mid - 1; }
  return lo / (r.length - 1);
}

// ---------- render ----------
let y = scrollY, target = scrollY, raf = 0;
const progressIn = (s, yy, start = 1, end = .45) => clamp(((G.vh * start) - (s.top + G.mainTop - yy)) / (G.vh * (start - end))); // 0 when top at start*vh, 1 at end*vh
const through = (s, yy) => clamp((yy + G.vh - (s.top + G.mainTop)) / (G.vh + s.h)); // 0 entering, 1 leaving
const visible = (s, yy) => s.top + G.mainTop - yy < G.vh + 60 && s.top + G.mainTop + s.h - yy > -60;
const set = (el, prop, v) => { if (el.__last?.[prop] !== v) { (el.__last ||= {})[prop] = v; el.style[prop] = v; } };

function render(force) {
  if (!G) return;
  const yy = y;
  const barOn = target > G.heroTop + G.pin + G.vh * .35;
  if (barOn !== bar.classList.contains('is-on')) {
    bar.classList.toggle('is-on', barOn);
    bar.inert = !barOn;
    bar.setAttribute('aria-hidden', String(!barOn));
  }
  if (paused) return;

  // 01 opening scene
  const p = clamp((yy - G.heroTop) / G.pin);
  if (p < 1 || force) {
    const z = outCubic(p);
    const t = `translate3d(${mix(0, G.phone ? -4 : -14, z)}px, ${mix(0, -10, z)}px, 0) scale(${mix(1, G.phone ? 1.07 : 1.11, z)})`;
    cams.forEach((c) => set(c, 'transform', t));
    set(heroTitle, 'transform', `translate3d(0, ${mix(0, -G.vh * .07, z)}px, 0)`);
    set(heroNote, 'opacity', String(1 - range(p, .02, .4)));
  }

  // ribbon head sits at 82% of the viewport
  const depth = yy + G.vh * .82 - G.mainTop;
  const off = String(1 - ribbonDraw(depth));
  ribbonPaths.forEach((path) => set(path, 'strokeDashoffset', off));

  // 02 detail: lens settles, lines rise, caps tighten
  const D = S.detail;
  if (visible(D, yy) || force) {
    const e = progressIn(D, yy, 1, .3), t = through(D, yy);
    set(D.media[0], 'transform', `translate3d(0, ${mix(3.4, -3.4, t)}%, 0) scale(${mix(1.2, 1.08, outCubic(e))})`);
    set(D.edge, 'strokeDashoffset', String(1 - range(e, 0, .8)));
    detailBits.forEach((el, i) => set(el, 'opacity', String(range(e, .25 + i * .05, .55 + i * .05))));
    detailLines.forEach((el, i) => set(el, 'transform', `translate3d(0, ${(1 - range(e, .35 + i * .12, .78 + i * .12)) * 105}%, 0)`));
    const c = range(e, .6, 1);
    set(detailCaps, 'opacity', String(c));
    set(detailCaps, 'letterSpacing', `${mix(.75, .33, outCubic(c))}em`);
  }

  // 03 work: DEIN. rises letter by letter behind the hands, then drifts
  const W = S.arbeiten;
  if (visible(W, yy) || force) {
    const e = progressIn(W, yy, 1, .15), t = through(W, yy);
    const m = `translate3d(0, ${mix(2, -2, t)}%, 0) scale(1.045)`;
    W.media.forEach((el) => set(el, 'transform', m));
    set(W.edge, 'strokeDashoffset', String(1 - range(e, 0, .7)));
    workBits.forEach((el, i) => set(el, 'opacity', String(range(e, .2 + i * .06, .5 + i * .06))));
    workLines.forEach((el, i) => set(el, 'transform', `translate3d(0, ${(1 - range(e, .25 + i * .1, .62 + i * .1)) * 105}%, 0)`));
    deinLetters.forEach((el, i) => {
      const k = range(e, .38 + i * .09, .78 + i * .09);
      set(el, 'transform', `translate3d(0, ${(1 - outCubic(k)) * 62}%, 0)`);
      set(el, 'opacity', String(clamp(k * 1.6)));
    });
    set(deinWord, 'transform', `translate3d(${mix(1.2, -1.2, t)}%, 0, 0)`);
  }

  // 04 services: the brand circle opens like an iris, letters and lines set in
  const V = S.leistungen;
  if (visible(V, yy) || force) {
    const e = progressIn(V, yy, 1, .25), t = through(V, yy);
    const r = mix(4, 78, outCubic(range(e, .05, .85)));
    set(mark, 'clipPath', `circle(${r.toFixed(2)}% at 54% 51%)`);
    set(mark, 'transform', `rotate(${mix(3, -3, t).toFixed(2)}deg)`);
    set(V.edge, 'strokeDashoffset', String(1 - range(e, 0, .7)));
    servicesBits.forEach((el, i) => set(el, 'opacity', String(range(e, .2 + i * .05, .5 + i * .05))));
    titleChars.forEach((el, i) => {
      const k = range(e, .3 + i * .045, .62 + i * .045);
      set(el, 'transform', `translate3d(0, ${(1 - outCubic(k)) * 34}%, 0)`);
      set(el, 'opacity', String(k));
    });
    serviceItems.forEach((el, i) => {
      const k = range(e, .5 + i * .07, .78 + i * .07);
      set(el, 'opacity', String(clamp(k * 1.4)));
      el.style.setProperty('--draw', k.toFixed(3));
      el.style.setProperty('--sep', k.toFixed(3));
    });
  }

  // 05 studio: the photo eases back, the copy slides in from the right
  const T = S.studio;
  if (visible(T, yy) || force) {
    const e = progressIn(T, yy, 1, .2), t = through(T, yy);
    set(T.media[0], 'transform', `translate3d(0, ${mix(2, -2, t)}%, 0) scale(${mix(1.14, 1.05, outCubic(e))})`);
    set(T.edge, 'strokeDashoffset', String(1 - range(e, 0, .7)));
    studioBits.forEach((el, i) => set(el, 'opacity', String(range(e, .15 + i * .05, .45 + i * .05))));
    const c = range(e, .3, .85);
    set(studioCopy, 'opacity', String(c));
    set(studioCopy, 'transform', `translate3d(${(1 - outCubic(c)) * (G.phone ? 0 : 6) * G.u}px, ${(1 - outCubic(c)) * (G.phone ? 24 : 0)}px, 0)`);
    studioLines.forEach((el, i) => set(el, 'transform', `translate3d(0, ${(1 - range(e, .32 + i * .1, .72 + i * .1)) * 105}%, 0)`));
  }
}

function tick() {
  raf = 0;
  target = scrollY;
  y = params.has('nosmooth') ? target : mix(y, target, .2);
  if (Math.abs(target - y) < .4) y = target;
  render();
  if (y !== target) schedule();
}
function schedule() { if (!raf) raf = requestAnimationFrame(tick); }

// ---------- motion on/off ----------
const motionBtn = $('.motion-toggle');
function applyMotion() {
  paused = reduceMQ.matches || userPaused;
  root.classList.toggle('motion-off', paused);
  motionBtn.setAttribute('aria-pressed', String(paused));
  motionBtn.disabled = reduceMQ.matches;
  motionBtn.textContent = reduceMQ.matches ? 'Bewegung reduziert (Systemeinstellung)' : paused ? 'Bewegung fortsetzen' : 'Bewegung pausieren';
  if (paused) {
    $$('[style]', main).forEach((el) => { el.removeAttribute('style'); el.__last = null; });
    ribbonPaths.forEach((path) => { path.style.strokeDashoffset = '0'; });
  }
  y = target = scrollY;
  requestAnimationFrame(measure);
}
motionBtn.addEventListener('click', () => { userPaused = !userPaused; applyMotion(); });
reduceMQ.addEventListener('change', applyMotion);

// ---------- menu ----------
const menu = $('#menu');
const toggles = $$('.menu-toggle');
let menuFrom = null;
function setMenu(open, from) {
  menu.hidden = !open;
  document.body.classList.toggle('locked', open);
  toggles.forEach((t) => t.setAttribute('aria-expanded', String(open)));
  if (open) { menuFrom = from; $('a', menu).focus(); }
  else if (from !== false) menuFrom?.focus({ preventScroll: true });
}
toggles.forEach((t) => t.addEventListener('click', () => setMenu(true, t)));
$('.menu-close').addEventListener('click', () => setMenu(false));
$$('a, .pill', menu).forEach((el) => el.addEventListener('click', () => setMenu(false, false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
phoneMQ.addEventListener('change', () => { if (!phoneMQ.matches) setMenu(false); });

// ---------- dialogs ----------
// TODO(amanails): service texts come from the kit; owner to confirm the wording
const SERVICES = {
  manicure: ['Maniküre', 'Besprich deine gewünschte Form, Länge und Farbe direkt mit Amanails. Gemeinsam finden wir den Look, der zu deiner Idee passt.'],
  pedicure: ['Pediküre', 'Ein Moment für gepflegte Füße. Frag bei Amanails nach den Möglichkeiten und einem passenden Termin.'],
  design: ['Nageldesign', 'Dezent, mit Glitzer oder mit einer ganz eigenen Idee: Zeig uns, welchen Look du dir wünschst.'],
};
let returnTo = null;
function openDialog(id, trigger) {
  const dlg = document.getElementById(id);
  if (!dlg) return;
  const lazy = $('img[data-src]', dlg);
  if (lazy) { lazy.src = lazy.dataset.src; lazy.removeAttribute('data-src'); }
  const current = $('dialog[open]');
  if (!current || !current.contains(trigger)) returnTo = trigger || document.activeElement;
  current?.close();
  dlg.showModal();
  document.body.classList.add('locked');
  $('.sheet-close', dlg)?.focus();
}
$$('[data-dialog]').forEach((el) => el.addEventListener('click', () => openDialog(el.dataset.dialog, el)));
$$('[data-service]').forEach((el) => el.addEventListener('click', () => {
  const [title, text] = SERVICES[el.dataset.service];
  $('#service-title').textContent = title;
  $('#service-text').textContent = text;
  openDialog('service', el);
}));
$$('dialog').forEach((dlg) => {
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => {
    if ($('dialog[open]')) return;
    if (menu.hidden) document.body.classList.remove('locked');
    if (returnTo?.isConnected) returnTo.focus({ preventScroll: true });
  });
});

// ---------- boot ----------
addEventListener('scroll', schedule, { passive: true });
let resizeT = 0;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(measure, 120); }, { passive: true });
new ResizeObserver(() => { clearTimeout(resizeT); resizeT = setTimeout(measure, 120); }).observe(main);
phoneMQ.addEventListener('change', measure);

const ready = () => { if (!root.classList.contains('is-ready')) { root.classList.add('is-ready'); measure(); } };
document.fonts?.ready.then(() => requestAnimationFrame(ready));
setTimeout(ready, 1800); // never keep the title waiting on a slow font
addEventListener('load', measure, { once: true });
applyMotion();
