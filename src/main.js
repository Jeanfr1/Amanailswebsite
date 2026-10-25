// Amanails · model 2 "Gesto". Calm motion: copy enters once when it comes
// into view; scroll only drives the opening pin and a small parallax.
// No library: one rAF loop that runs only while the page scrolls or settles.
import './style.css';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, p) => a + (b - a) * p;
const ease = (x) => { const p = clamp(x); return p * p * (3 - 2 * p); };
const range = (p, a, b) => ease((p - a) / (b - a));

const root = document.documentElement;
const params = new URLSearchParams(location.search);
const phoneMQ = matchMedia('(max-width: 900px)');
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let userPaused = params.has('static');
let paused = false;

const main = $('main');
const hero = $('.hero');
const heroTitle = $('.hero-title');
const heroNote = $('.hero-note');
const bar = $('.bar');
const mark = $('.services-mark');
const deinWord = $('.dein');
const scenes = ['detail', 'arbeiten', 'studio'].map((id) => {
  const el = document.getElementById(id);
  return { el, media: $$('.scene-media', el), satin: $('.satin', el), top: 0, h: 0 };
});
const services = { el: $('#leistungen'), satin: $('#leistungen .satin'), top: 0, h: 0 };

// ---------- entrances: once, on time, when the element comes into view ----------
const revealed = [...$$('[data-reveal]'), ...$$('[data-satin]'), mark];
let io = null;
function armReveals() {
  io?.disconnect();
  if (paused || !('IntersectionObserver' in window)) { root.classList.remove('rv'); revealed.forEach((el) => el.classList.add('in')); return; }
  root.classList.add('rv');
  io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .2, rootMargin: '0px 0px -8% 0px' });
  revealed.forEach((el) => { if (!el.classList.contains('in')) io.observe(el); });
}

// ---------- geometry ----------
let G = null;
const pageTop = (el) => el.getBoundingClientRect().top + scrollY;
function measure() {
  const vh = innerHeight;
  for (const s of [...scenes, services]) { s.top = pageTop(s.el); s.h = s.el.offsetHeight; }
  G = { vh, phone: phoneMQ.matches, heroTop: pageTop(hero), pin: Math.max(1, hero.offsetHeight - vh) };
  render(true);
}

// ---------- scroll-linked: the opening pin and a small parallax ----------
let y = scrollY, target = scrollY, raf = 0;
const set = (el, prop, v) => { if (el.__last?.[prop] !== v) { (el.__last ||= {})[prop] = v; el.style[prop] = v; } };
const through = (s, yy) => clamp((yy + G.vh - s.top) / (G.vh + s.h));
const visible = (s, yy) => s.top - yy < G.vh + 80 && s.top + s.h - yy > -80;

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

  // 01: the scene stays; the title drifts up a little while the satin covers it
  const p = clamp((yy - G.heroTop) / G.pin);
  if (p < 1 || force) {
    set(heroTitle, 'transform', `translate3d(0, ${(-G.vh * .05 * ease(p)).toFixed(1)}px, 0)`);
    set(heroNote, 'opacity', String(1 - range(p, .02, .4)));
  }
  // 02 / 03 / 05: photos move 1.5% against the scroll, never scale; the satin drifts sideways
  for (const s of scenes) {
    if (!visible(s, yy) && !force) continue;
    const p = through(s, yy);
    const t = `translate3d(0, ${mix(1.5, -1.5, p).toFixed(2)}%, 0)`;
    s.media.forEach((el) => set(el, 'transform', t));
    if (s.satin) set(s.satin, 'transform', `translate3d(${mix(-1.5, 1.5, p).toFixed(2)}%, 0, 0)`);
  }
  const W = scenes[1];
  if (visible(W, yy) || force) set(deinWord, 'transform', `translate3d(${mix(.6, -.6, through(W, yy)).toFixed(2)}%, 0, 0)`);
  // 04: the brand mark turns slowly with the page
  if (visible(services, yy) || force) {
    const p = through(services, yy);
    set(mark, 'transform', `rotate(${mix(2.5, -2.5, p).toFixed(2)}deg)`);
    set(services.satin, 'transform', `translate3d(${mix(1.5, -1.5, p).toFixed(2)}%, 0, 0)`);
  }
}

function tick() {
  raf = 0;
  target = scrollY;
  y = params.has('nosmooth') ? target : mix(y, target, .18);
  if (Math.abs(target - y) < .4) y = target;
  render();
  if (y !== target) schedule();
}
function schedule() { if (!raf) raf = requestAnimationFrame(tick); }

// ---------- the opening film: the brush releases the satin ribbon, once, silent ----------
// html.film is set in <head> (motion allowed, no ?static, no data saver). The film's first frame
// is the poster; its last frame is the still underneath, so a film that cannot play just leaves
// the still. The title rises once the ribbon is in the air.
const film = $('.hero-film video');
function stopFilm() {
  film.pause();
  root.classList.remove('film', 'film-wait');
}
function startFilm() {
  if (!root.classList.contains('film')) return;
  const [name, w] = phoneMQ.matches ? ['hero-m', 720] : ['hero', 2048];
  film.poster = `/img/${name}-start-v2-${w}.webp`;
  for (const [ext, type] of [['webm', 'video/webm; codecs="vp9"'], ['mp4', 'video/mp4']]) {
    const s = document.createElement('source');
    s.src = `/film/${name}-v2-${w}.${ext}`;
    s.type = type;
    film.append(s);
  }
  root.classList.add('film-wait');
  const title = () => root.classList.remove('film-wait');
  const fail = () => { if (film.currentTime < .1) stopFilm(); else title(); };
  const guard = setTimeout(() => { if (film.paused) fail(); }, 3500);
  film.lastElementChild.addEventListener('error', fail);
  film.addEventListener('timeupdate', function rise() {
    if (film.currentTime < 1.1) return;
    title();
    film.removeEventListener('timeupdate', rise);
  });
  film.addEventListener('ended', () => { clearTimeout(guard); root.classList.add('film-done'); title(); }, { once: true });
  film.preload = 'auto';
  film.load();
  film.play()?.catch(fail);
}

// ---------- motion on/off ----------
const motionBtn = $('.motion-toggle');
function applyMotion() {
  paused = reduceMQ.matches || userPaused;
  if (paused) stopFilm();
  root.classList.toggle('motion-off', paused);
  motionBtn.setAttribute('aria-pressed', String(paused));
  motionBtn.disabled = reduceMQ.matches;
  motionBtn.textContent = reduceMQ.matches ? 'Bewegung reduziert (Systemeinstellung)' : paused ? 'Bewegung fortsetzen' : 'Bewegung pausieren';
  if (paused) $$('[style]', main).forEach((el) => { el.removeAttribute('style'); el.__last = null; });
  armReveals();
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
startFilm();
