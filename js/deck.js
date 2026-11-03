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

let chapters = [], marks = [], hScroll = null, current = '';
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
    // big chapter number in each header
    const head = c.querySelector('.head');
    if (head && i > 0) head.dataset.num = String(i).padStart(2, '0');
    return m;
  });

  // rail (desktop)
  const rail = $('#rail');
  rail.innerHTML = CHAPTERS.slice(1).map((c, i) => `<a href="#${c.id}" data-rail="${c.id}"><span class="rn">${String(i + 1).padStart(2, '0')}</span><span class="rl">${t(c.label)}</span><i class="rp"><i></i></i></a>`).join('');

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
  // recede the chapter that is being covered
  chapters.forEach((c, i) => {
    const next = chapters[i + 1];
    let p = 0;
    if (next) {
      const r = next.getBoundingClientRect().top;
      p = Math.max(0, Math.min(1, 1 - r / H));
    }
    const k = Math.round(p * 100) / 100;
    if (c._p === k) return;
    c._p = k;
    c.style.setProperty('--cover', (k * 0.6).toFixed(3));
  });
  // active chapter + per-chapter progress in the rail
  let active = 'top';
  marks.forEach((m) => { if (m.getBoundingClientRect().top <= H * 0.4) active = m.dataset.for; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = 'contact';
  if (active !== current) {
    current = active;
    $$('[data-rail]').forEach((a) => a.classList.toggle('on', a.dataset.rail === active));
    $$('[data-nav]').forEach((l) => l.classList.toggle('active', l.dataset.nav === active || (active === 'top' && l.dataset.nav === 'story' && false)));
    document.documentElement.dataset.chapter = active;
  }
  $$('[data-rail]').forEach((a) => {
    const i = marks.findIndex((m) => m.dataset.for === a.dataset.rail);
    const start = marks[i].getBoundingClientRect().top;
    const end = marks[i + 1] ? marks[i + 1].getBoundingClientRect().top : document.documentElement.scrollHeight - scrollY;
    const p = Math.max(0, Math.min(1, (H * 0.4 - start) / Math.max(1, end - start)));
    a.style.setProperty('--p', p.toFixed(3));
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
