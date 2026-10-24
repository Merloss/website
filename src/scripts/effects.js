import { PROFILE } from '../lib/site';

const LINES =['calc(50% - 512px)', 'calc(50% - 228px)', 'calc(50% + 228px)', 'calc(50% + 512px)'];
const KEYWORDS = /\b(SELECT|FROM|ORDER BY|DESC|LIMIT)\b/g;

const alphaMask = (px, w) => (x, y) => (x < 0 || x >= w ? 0 : px[((y | 0) * w + (x | 0)) * 4 + 3] / 255);

const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 1101px)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tz = { timeZone: PROFILE.timeZone };
const hour = +new Date().toLocaleString('en-US', { ...tz, hour: 'numeric', hour12: false }) % 24;
$('greet').textContent = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
const tick = () => { $('clock').textContent = new Date().toLocaleTimeString('en-US', { ...tz, hour: 'numeric', minute: '2-digit' }) + ` in ${PROFILE.location}`; };
tick();
setInterval(tick, 30000);

document.querySelector('.side-nav > a').addEventListener('click', (e) => {
  e.preventDefault();
  scrollTo({ top: 0 });
});

const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

document.querySelector('[data-copy]').addEventListener('click', async (e) => {
  const el = e.currentTarget;
  e.preventDefault();
  try { await navigator.clipboard.writeText(el.dataset.copy); } catch { location.href = el.href; return; }
  const c = $('copied');
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
});

const spawn = () => {
  const up = Math.random() < 0.5;
  const el = document.createElement('i');
  el.className = 'packet' + (up ? ' up' : '');
  el.style.left = LINES[(Math.random() * LINES.length) | 0];
  $('packets').append(el);
  const top = -140, bottom = innerHeight + 20;
  el.animate([
    { transform: `translateY(${up ? bottom : top}px)`, opacity: 0 },
    { opacity: 1, offset: 0.12 },
    { opacity: 1, offset: 0.85 },
    { transform: `translateY(${up ? top : bottom}px)`, opacity: 0 },
  ], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.55, 0, .25, 1)' }).onfinish = () => el.remove();
  setTimeout(spawn, 6000 + Math.random() * 9000);
};
if (desktop && !reduced) setTimeout(spawn, 2500 + Math.random() * 2000);

const word = $('accent');
const canvas = $('ascii');
const ctx = canvas.getContext('2d');
const PAD = 6, LINE = 2;
let streaks = [], wordMask = null, width = 0, height = 0, hovering = false, reveal = 0, mx = -999, my = -999, asciiRaf = 0;
const build = () => {
  word.style.opacity = '';
  const r = word.getBoundingClientRect();
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  word.append(probe);
  const baseline = probe.getBoundingClientRect().top - r.top + PAD;
  probe.remove();
  const w = Math.ceil(r.width + PAD * 2), h = Math.ceil(r.height + PAD * 2), dpr = devicePixelRatio || 1;
  width = w; height = h;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const o = off.getContext('2d');
  const cs = getComputedStyle(word);
  o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  o.fillStyle = '#fff';
  o.fillText(word.textContent, PAD, baseline);
  wordMask = alphaMask(o.getImageData(0, 0, w, h).data, w);
  streaks = [];
  for (let y = 1; y < h; y += LINE) {
    const speed = 0.08 + Math.random() * 0.2, gain = 0.45 + Math.random() * 0.55;
    for (let k = 0; k < w / 3; k++) streaks.push({ x: Math.random() * w, y, v: speed * (0.6 + Math.random() * 0.8), len: 1 + Math.random() * 4, g: gain, f: Math.random() * 6.28 });
  }
};
const draw = (now) => {
  reveal += ((hovering ? 1 : 0) - reveal) * 0.06;
  if (Math.abs(reveal - (hovering ? 1 : 0)) < 0.002) reveal = hovering ? 1 : 0;
  word.style.opacity = reveal ? String(1 - reveal * reveal * (3 - 2 * reveal)) : '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  for (const p of streaks) {
    const near = Math.abs(p.y - my) < 10 && Math.abs(p.x - mx) < 26;
    p.x += p.v * (near ? 3 : 1);
    if (p.x > width + 4) p.x = -4;
    const k = Math.min(1, Math.max(0, (reveal - (p.y / height) * 0.3) / 0.7));
    if (!k) continue;
    const m = wordMask(p.x, p.y);
    if (m < 0.15) continue;
    ctx.globalAlpha = k * m * p.g * (0.8 + 0.2 * Math.sin(now * 0.002 + p.f));
    ctx.fillRect(p.x, p.y, p.len * (0.5 + m) * (1 + (1 - k) ** 2 * 5), m > 0.5 ? 1.3 : 1);
  }
  ctx.globalAlpha = 1;
  asciiRaf = hovering || reveal ? requestAnimationFrame(draw) : 0;
};
const start = () => { if (!asciiRaf) asciiRaf = requestAnimationFrame(draw); };
document.fonts.ready.then(() => {
  if (reduced) return;
  build();
  const host = word.parentElement;
  host.addEventListener('mouseenter', () => { hovering = true; start(); });
  host.addEventListener('mouseleave', () => { hovering = false; mx = my = -999; start(); });
  host.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  window.addEventListener('resize', build);
});

const WORD = 'eof';
const gothic = getComputedStyle(document.body).getPropertyValue('--font-gothic');
const wm = $('wordmark');
const wctx = wm.getContext('2d');
const ROW = 4;
let parts = [], mask = null, mw = 0, mh = 0, wmRaf = 0, wx = -999, wy = -999;
const buildWordmark = () => {
  const r = wm.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  mw = Math.round(r.width); mh = Math.round(r.height);
  wm.width = mw * dpr; wm.height = mh * dpr;
  wctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const off = document.createElement('canvas');
  off.width = mw; off.height = mh;
  const o = off.getContext('2d');
  let size = 100;
  o.font = `${size}px ${gothic}`;
  let m = o.measureText(WORD);
  size *= Math.min((mw * 0.86) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight), (mh * 0.46) / m.actualBoundingBoxAscent);
  o.font = `${size}px ${gothic}`;
  m = o.measureText(WORD);
  const xh = o.measureText('x').actualBoundingBoxAscent;
  o.filter = 'blur(.6px)';
  o.fillStyle = '#fff';
  o.fillText(WORD, mw / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, mh / 2 + xh * 0.18);
  mask = alphaMask(o.getImageData(0, 0, mw, mh).data, mw);

  parts = [];
  for (let y = 1; y < mh / 2; y += ROW) {
    const row = 0.35 + Math.random() * 0.9, gain = 0.35 + Math.random() * 0.65;
    for (let k = 0; k < mw / 9; k++) {
      parts.push({ x: Math.random() * mw, y, v: row * (0.05 + Math.random() * 0.12), len: 2 + Math.random() * 10, f: Math.random() * 6.28, g: gain });
    }
  }
};
const drawWordmark = (now) => {
  wctx.clearRect(0, 0, mw, mh);
  wctx.fillStyle = '#fff';
  for (const p of parts) {
    const near = Math.abs(p.y - wy) < 30 && Math.abs(p.x - wx) < 90;
    p.x += p.v * (near ? 3 : 1);
    if (p.x > mw + 10) p.x = -10;
    const m = mask(p.x, p.y);
    wctx.globalAlpha = 0.01 + m * p.g * (0.13 + 0.04 * Math.sin(now * 0.0012 + p.f));
    wctx.fillRect(p.x, p.y, p.len * (0.5 + m), m > 0.5 ? 1.6 : 1);
  }
  wctx.globalAlpha = 1;
  wmRaf = requestAnimationFrame(drawWordmark);
};
document.fonts.load(`80px ${gothic}`, WORD).then(() => {
  buildWordmark();
  if (reduced) { drawWordmark(0); cancelAnimationFrame(wmRaf); return; }
  const wmIO = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(wmRaf);
    if (e.isIntersecting) wmRaf = requestAnimationFrame(drawWordmark);
  });
  wmIO.observe(wm);
  wm.addEventListener('mousemove', (e) => { const r = wm.getBoundingClientRect(); wx = e.clientX - r.left; wy = e.clientY - r.top; });
  wm.addEventListener('mouseleave', () => { wx = wy = -999; });
  window.addEventListener('resize', buildWordmark);
});

const heads = [...document.querySelectorAll('[data-sql]')];
heads.forEach((h) => { h.dataset.label = h.textContent; });
let version = 0;
const type = async (h, text, v) => {
  h.textContent = '';
  for (let i = 1; i <= text.length; i++) {
    if (v !== version) return false;
    h.textContent = text.slice(0, i);
    await wait(14);
  }
  return v === version;
};
$('sql').addEventListener('click', (e) => {
  const isOn = $('page').classList.toggle('sql');
  e.currentTarget.setAttribute('aria-pressed', isOn);
  const v = ++version;
  heads.forEach(async (h, i) => {
    await wait(i * 60);
    if (!isOn) { await type(h, h.dataset.label, v); return; }
    if (!(await type(h, h.dataset.sql, v))) return;
    const ms = (0.2 + Math.random() * 1.4).toFixed(1);
    h.innerHTML = h.dataset.sql.replace(KEYWORDS, '<span class="kw">$1</span>') +
      `<span class="sql-meta">${h.dataset.rows} rows · ${ms}ms</span>`;
  });
});
