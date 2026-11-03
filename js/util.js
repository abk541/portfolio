import { ICONS } from '../assets/icons.js';

export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);

export function icon(name, title = '') {
  const d = ICONS[name];
  if (!d) return '';
  return `<svg viewBox="0 0 24 24" role="img" aria-label="${title || name}"><path d="${d}"/></svg>`;
}

export function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach((el) => { if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon); });
}

export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Read current accent as [r,g,b]. */
let ACC = null;
export function accentRGB() {
  return ACC || (ACC = cssVar('--accent-rgb').split(',').map((v) => parseInt(v, 10)));
}
export function resetAccent() { ACC = null; }

/**
 * Canvas loop that sizes itself to its element, honours DPR, and only animates
 * while on screen and the tab is visible.
 */
export const IS_PHONE = window.innerWidth < 760 || /Android|iPhone|iPad/i.test(navigator.userAgent);
export function canvasLoop(canvas, draw, { dpr = Math.min(window.devicePixelRatio || 1, IS_PHONE ? 1.5 : 2), onResize, always = false, fps = 60 } = {}) {
  const minGap = 1000 / fps - 2;
  let lastDraw = 0;
  const ctx = canvas.getContext('2d');
  const state = { w: 0, h: 0, t: 0, visible: always, ctx, canvas, dpr, running: true };
  let raf = 0;
  let last = performance.now();

  const resize = () => {
    // layout size (ignores CSS transforms, so scaled parents still draw in their own units)
    state.w = Math.max(1, canvas.clientWidth);
    state.h = Math.max(1, canvas.clientHeight);
    canvas.width = Math.round(state.w * dpr);
    canvas.height = Math.round(state.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize && onResize(state);
  };

  const frame = (now) => {
    raf = 0;
    if (!state.visible || !state.running || document.hidden) return;
    // nothing behind the landing page needs to animate
    if (!always && document.body.classList.contains('intro-open')) { raf = 0; setTimeout(kick, 250); return; }
    if (!always) {
      if (state.chap === undefined) state.chap = canvas.closest('[data-chap]') || null;
      if (state.chap && state.chap.__live === false) { raf = 0; setTimeout(kick, 200); return; }
    }
    if (now - lastDraw < minGap) { raf = requestAnimationFrame(frame); return; }
    lastDraw = now;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    state.t += dt;
    draw(state, dt);
    if (!REDUCED) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  new ResizeObserver(() => { resize(); if (REDUCED) draw(state, 0); }).observe(canvas);
  if (!always) {
    new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) kick(); }, { rootMargin: '100px' }).observe(canvas);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  resize();
  kick();
  state.kick = kick;
  return state;
}

/** Decode / scramble text effect. */
const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ΔΣλ';
export function scramble(el, text = el.dataset.text || el.textContent, { duration = 1.1, delay = 0 } = {}) {
  if (REDUCED) { el.textContent = text; return Promise.resolve(); }
  return new Promise((resolve) => {
    const len = text.length;
    const queue = [...text].map((ch, i) => ({ ch, start: Math.floor(Math.random() * 18) + i * 1.2, end: Math.floor(Math.random() * 18) + 22 + i * 1.6 }));
    let frame = 0;
    const totalFrames = Math.max(...queue.map((q) => q.end));
    const speed = totalFrames / (duration * 60);
    const tick = () => {
      let out = '';
      let done = 0;
      for (let i = 0; i < len; i++) {
        const q = queue[i];
        if (frame >= q.end) { done++; out += q.ch === ' ' ? ' ' : escapeHtml(q.ch); }
        else if (frame >= q.start && q.ch !== ' ') out += `<span class="glyph">${escapeHtml(GLYPHS[(Math.random() * GLYPHS.length) | 0])}</span>`;
        else out += q.ch === ' ' ? ' ' : '<span style="opacity:0">' + escapeHtml(q.ch) + '</span>';
      }
      el.innerHTML = out;
      if (done === len) { el.textContent = text; resolve(); return; }
      frame += speed;
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), delay * 1000);
  });
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Point on a cubic bezier. */
export function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
