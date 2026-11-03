// "The deck": every chapter is a card that slides up over the previous one, which recedes.
// Projects scroll sideways, driven by the vertical scroll. A chapter rail replaces the top links on desktop.
import { $, $$, REDUCED } from './util.js';
import { t } from './lang.js';

const CHAPTERS = [
  { id: 'top', label: 'Home' },
  { id: 'story', label: 'Overview' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'ai', label: 'AI' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

let chapters = [], marks = [], hScroll = null, current = '', railLinks = [];
const isDesk = () => innerWidth >= 1000;

export function chapterTop(id) {
  const m = marks.find((x) => x.dataset.for === id);
  return m ? m.getBoundingClientRect().top + scrollY : 0;
}

export function goToChapter(id, smooth = true) {
  const y = id === 'top' ? 0 : chapterTop(id);
  scrollTo({ top: Math.max(0, y), behavior: smooth && !REDUCED ? 'smooth' : 'auto' });
}

export function refreshDeck() { chapters.forEach((c) => { c._p = undefined; }); layout(); }

export function initDeck() {
  chapters = $$('[data-chap]');
  // invisible markers in normal flow: their position never changes when chapters stick
  marks = chapters.map((c, i) => {
    const m = document.createElement('div');
    m.className = 'chap-mark';
    m.dataset.for = c.dataset.chap;
    c.parentNode.insertBefore(m, c);
    c.style.zIndex = String(2 + i);
    c.__live = true;
    const dim = document.createElement('div');
    dim.className = 'chap-dim';
    c.appendChild(dim);
    c.__dim = dim;
    // big chapter number in each header
    const head = c.querySelector('.head');
    if (head && i > 0) head.dataset.num = String(i).padStart(2, '0');
    return m;
  });

  // rail (desktop)
  const rail = $('#rail');
  rail.innerHTML = CHAPTERS.slice(1).map((c, i) => `<a href="#${c.id}" data-rail="${c.id}"><span class="rn">${String(i + 1).padStart(2, '0')}</span><span class="rl">${t(c.label)}</span><i class="rp"><i></i></i></a>`).join('');
  railLinks = $$('[data-rail]');
  railLinks.forEach((a) => { a.__bar = a.querySelector('.rp i'); });

  // every in-page link goes through the deck (markers, not the sticky sections)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.id === 'brand') return;
    const id = a.getAttribute('href').slice(1);
    if (!CHAPTERS.some((c) => c.id === id)) return;
    e.preventDefault();
    goToChapter(id);
  });

  initHorizontalProjects();
  layout();
  addEventListener('resize', layout);
  const ro = new ResizeObserver(() => layout());
  chapters.forEach((c) => ro.observe(c));

  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  onScroll();
  addEventListener('load', refreshDeck);
  document.fonts && document.fonts.ready.then(refreshDeck);
}

/** A chapter sticks once its bottom reaches the bottom of the screen, so the next one can slide over it. */
function layout() {
  if (hScroll) hScroll.size();
  chapters.forEach((c) => {
    const top = Math.min(0, innerHeight - c.offsetHeight);
    c.style.top = `${top}px`;
  });
  onScroll();
}

function onScroll() {
  const H = innerHeight;
  // ---- read phase (no writes in between, so no forced layouts)
  const nextTops = chapters.map((c, i) => (chapters[i + 1] ? chapters[i + 1].getBoundingClientRect().top : Infinity));
  const rects = chapters.map((c) => c.getBoundingClientRect());
  const markTops = marks.map((m) => m.getBoundingClientRect().top);
  const docH = document.documentElement.scrollHeight;
  // ---- write phase
  // a chapter completely hidden under a later full-screen card is taken out of rendering entirely
  let coverFrom = Infinity;
  for (let j = chapters.length - 1; j >= 0; j--) if (rects[j].top <= 0.5 && rects[j].bottom >= H - 0.5) { coverFrom = j; break; }
  chapters.forEach((c, i) => {
    const hide = i < coverFrom && coverFrom !== Infinity;
    if (c.__hidden !== hide) { c.__hidden = hide; c.style.visibility = hide ? 'hidden' : ''; }
    const p = nextTops[i] === Infinity ? 0 : Math.max(0, Math.min(1, 1 - nextTops[i] / H));
    const k = Math.round(p * 50) / 50;
    // "live" = actually visible: animations inside covered chapters pause (see canvasLoop)
    c.__live = !hide && k < 0.97 && rects[i].bottom > 0 && rects[i].top < H;
    if (c._p === k) return;
    c._p = k;
    if (c.__dim) { c.__dim.style.opacity = (k * 0.6).toFixed(2); c.__dim.style.visibility = k ? 'visible' : 'hidden'; }
  });
  let active = 'top';
  markTops.forEach((tp, i) => { if (tp <= H * 0.4) active = marks[i].dataset.for; });
  if (H + scrollY >= docH - 4) active = 'contact';
  if (active !== current) {
    current = active;
    railLinks.forEach((a) => a.classList.toggle('on', a.dataset.rail === active));
    $$('[data-nav]').forEach((l) => l.classList.toggle('active', l.dataset.nav === active));
    document.documentElement.dataset.chapter = active;
  }
  railLinks.forEach((a, k) => {
    const i = k + 1;
    const start = markTops[i];
    const end = markTops[i + 1] !== undefined ? markTops[i + 1] : docH - scrollY;
    const p = Math.max(0, Math.min(1, (H * 0.4 - start) / Math.max(1, end - start)));
    const v = p.toFixed(2);
    if (a._v !== v) { a._v = v; a.__bar.style.transform = `scaleY(${v})`; }
  });
  if (hScroll) hScroll.update();
}

/* ---------- Projects: vertical scroll → horizontal gallery (desktop), swipe carousel (phones) ---------- */
function initHorizontalProjects() {
  const sec = $('#projects'), pin = sec.querySelector('.h-pin'), wrap = sec.querySelector('.track-wrap'), track = $('#grid'), fill = $('#track-fill'), hint = sec.querySelector('.track-hint');
  let shift = 0, mode = '';
  const size = () => {
    const desk = isDesk() && innerHeight >= 620 && !REDUCED;
    mode = desk ? 'pinned' : 'swipe';
    sec.classList.toggle('h-pinned', desk);
    sec.classList.toggle('h-swipe', !desk);
    hint.textContent = t(desk ? 'Scroll to browse' : 'Swipe to browse');
    if (desk) {
      track.style.transform = '';
      shift = Math.max(0, track.scrollWidth - wrap.clientWidth);
      sec.style.height = `${pin.offsetHeight + shift}px`;
    } else {
      sec.style.height = '';
      track.style.transform = '';
      shift = 0;
    }
  };
  const update = () => {
    if (mode === 'pinned') {
      const r = sec.getBoundingClientRect();
      const span = Math.max(1, sec.offsetHeight - pin.offsetHeight);
      const p = Math.max(0, Math.min(1, -r.top / span));
      track.style.transform = `translate3d(${(-p * shift).toFixed(1)}px,0,0)`;
      fill.style.transform = `scaleX(${p.toFixed(3)})`;
    } else {
      const max = Math.max(1, wrap.scrollWidth - wrap.clientWidth);
      fill.style.transform = `scaleX(${(wrap.scrollLeft / max).toFixed(3)})`;
    }
  };
  wrap.addEventListener('scroll', () => { if (mode === 'swipe') update(); }, { passive: true });
  hScroll = { size, update, refresh: () => { size(); layout(); } };
  document.addEventListener('projects-filtered', () => { size(); layout(); });
}
