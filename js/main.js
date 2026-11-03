import { STATS, MULE, INFA, PROJECTS, TIMELINE } from './data.js';
import { $, $$, icon, hydrateIcons, scramble, canvasLoop, REDUCED, FINE, rand, escapeHtml, accentRGB, resetAccent } from './util.js';
import { initNet } from './net.js';
import { initDiagram, setDiagramMode } from './diagram.js';
import { initAI } from './ai.js';
import { MOTIFS } from './motifs.js';
import { initIntro } from './intro.js';
import { initStory } from './story.js';
import { skillInfo } from './skills.js';
import { LANG, AUTO_LANG, OTHER_LANGS, t, translateDom } from './lang.js';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const anim = !!gsap && !REDUCED;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

translateDom();
hydrateIcons();

/* =====================================================================
   Pointer glow + magnetic buttons (desktop only)
   ===================================================================== */
function initPointer() {
  if (!FINE || REDUCED) return;
  const g = $('#glow');
  let x = innerWidth / 2, y = innerHeight / 2, gx = x, gy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  const loop = () => { gx += (x - gx) * 0.12; gy += (y - gy) * 0.12; g.style.transform = `translate(${gx}px, ${gy}px)`; requestAnimationFrame(loop); };
  loop();
}

function initMagnetic(root = document) {
  if (!FINE || REDUCED) return;
  $$('.magnetic', root).forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.2}px, ${(e.clientY - (r.top + r.height / 2)) * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 500);
    });
  });
}

/* =====================================================================
   Navigation: scrolled state, progress, active section
   ===================================================================== */
function initNav() {
  const nav = $('#nav'), bar = $('#progress');
  const sections = $$('[data-section]');
  const links = $$('[data-nav]');
  let current = '';
  const update = () => {
    nav.classList.toggle('scrolled', scrollY > 20);
    bar.style.width = `${(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`;
    const probe = innerHeight * 0.35;
    let active = 'top';
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= probe) active = s.dataset.section; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) active = 'contact';
    if (active !== current) {
      current = active;
      links.forEach((l) => l.classList.toggle('active', l.dataset.nav === active));
    }
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

/* =====================================================================
   Hero
   ===================================================================== */
function heroIn() {
  $$('.hero .scramble').forEach((el, i) => scramble(el, el.dataset.text, { duration: 0.8, delay: i * 0.12 }));
  if (anim) {
    gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.1 });
    gsap.from(['.pill', '.hero-role', '.hero-sub', '.hero-cta', '.hero-hint'], { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.2 });
    gsap.from('#net', { opacity: 0, scale: 1.1, duration: 1.6, ease: 'expo.out' });
  }
  const items = $$('#rotator span');
  let cur = 0;
  if (gsap) { gsap.set(items, { yPercent: 110 }); gsap.set(items[0], { yPercent: 0 }); }
  else items.forEach((s, i) => (s.style.visibility = i ? 'hidden' : 'visible'));
  if (anim) setInterval(() => {
    const next = (cur + 1) % items.length;
    gsap.to(items[cur], { yPercent: -110, duration: 0.45, ease: 'power3.in' });
    gsap.fromTo(items[next], { yPercent: 110 }, { yPercent: 0, duration: 0.65, ease: 'expo.out', delay: 0.38 });
    cur = next;
  }, 2400);
}

/* =====================================================================
   Ticker
   ===================================================================== */
function initTicker() {
  const items = [['mulesoft', 'MuleSoft Anypoint'], ['informatica', 'Informatica IDMC'], ['sap', 'SAP ECC · BW'], ['salesforce', 'Salesforce'], ['snowflake', 'Snowflake'], ['claude', 'Claude'], ['openai', 'Azure OpenAI'], ['splunk', 'Splunk'], ['nodedotjs', 'Node.js'], ['react', 'React'], ['typescript', 'TypeScript'], ['nextdotjs', 'Next.js'], ['kotlin', 'Kotlin'], ['supabase', 'Supabase'], ['postgresql', 'PostgreSQL'], ['threedotjs', 'three.js']];
  const one = items.map(([i, l]) => `<span class="tk">${icon(i)}${l}</span>`).join('');
  $('#ticker').innerHTML = one + one;
}

/* =====================================================================
   Stats
   ===================================================================== */
function initStats() {
  const grid = $('#stats-grid');
  const COL = { mule: '#00a0df', infa: '#ff5a1f', ai: '#a78bfa' };
  const TAG = { mule: 'MuleSoft', infa: 'Informatica', ai: t('AI · Lead') };
  grid.innerHTML = STATS.map((s) => `<div class="stat" style="--c:${COL[s.mode]}"><span class="stat-tag">${TAG[s.mode]}</span><div class="stat-n"><span class="num">0</span><sup>${s.suffix}</sup></div><div class="stat-l">${escapeHtml(s.label)}</div><canvas></canvas></div>`).join('');
  $$('.stat', grid).forEach((el, i) => {
    const s = STATS[i];
    const col = s.mode === 'mule' ? '0,160,223' : s.mode === 'infa' ? '255,90,31' : '167,139,250';
    const seed = Math.random() * 10;
    canvasLoop(el.querySelector('canvas'), ({ ctx, w, h, t }) => {
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h * 0.6 - (Math.sin(x * 0.03 + t * 2 + seed) * 0.5 + Math.sin(x * 0.011 - t + seed) * 0.5) * h * 0.3;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(${col},0.9)`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(${col},0.22)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.fill();
    }, { fps: 24 });
  });
  const run = () => $$('.stat .num', grid).forEach((n, i) => {
    const target = STATS[i].n;
    if (!anim) { n.textContent = target; return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.6, ease: 'power3.out', delay: i * 0.04, onUpdate: () => (n.textContent = Math.round(o.v)) });
  });
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.25 });
  io.observe(grid);
  if (anim && ST) gsap.from('.stat', { y: 40, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 88%' } });
}

/* =====================================================================
   Section titles: word-by-word rise
   ===================================================================== */
function initReveals() {
  $$('.reveal-title').forEach((h) => {
    h.innerHTML = h.textContent.split(' ').map((w) => `<span class="w"><span>${escapeHtml(w)}</span></span>`).join(' ');
    if (!anim || !ST) return;
    gsap.from(h.querySelectorAll('.w > span'), { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 90%' } });
  });
  if (!anim || !ST) return;
  $$('.head .lede, .head .eyebrow').forEach((el) => gsap.from(el, { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } }));
  gsap.from('.pr', { y: 30, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.principles', start: 'top 90%' } });
  gsap.from('.platform', { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.platforms', start: 'top 90%' } });
}

/* =====================================================================
   Expertise: platform tabs, stage, sub tabs
   ===================================================================== */
let currentMode = null;

function initPlatformFx() {
  $$('.platform').forEach((btn) => {
    const isMule = btn.classList.contains('mule');
    const col = isMule ? '0,160,223' : '255,77,0';
    const parts = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), v: rand(0.05, 0.2), r: rand(0.6, 1.8) }));
    canvasLoop(btn.querySelector('canvas'), ({ ctx, w, h, t }, dt) => {
      ctx.clearRect(0, 0, w, h);
      const on = btn.getAttribute('aria-selected') === 'true' ? 1 : 0.3;
      if (isMule) {
        parts.forEach((p, i) => {
          p.x += p.v * dt * (1 + on * 2);
          if (p.x > 1.1) p.x = -0.1;
          const y = h * (0.25 + (i % 3) * 0.25);
          ctx.strokeStyle = `rgba(${col},${0.15 + on * 0.45})`; ctx.lineWidth = p.r;
          ctx.beginPath(); ctx.moveTo(p.x * w - 26, y); ctx.lineTo(p.x * w, y); ctx.stroke();
        });
      } else {
        const cx = w * 0.82, cy = h * 0.5;
        parts.forEach((p, i) => {
          const a = i * 2.39996 + t * p.v * 2;
          const rr = (0.1 + ((p.y + t * p.v * 0.25) % 1) * 0.5) * Math.max(w, h) * 0.5;
          ctx.fillStyle = i % 7 === 0 ? `rgba(250,204,21,${0.3 + on * 0.6})` : `rgba(${col},${0.15 + on * 0.55})`;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.6, p.r, 0, Math.PI * 2); ctx.fill();
        });
      }
    }, { fps: 30 });
  });
}

function wave(mode, x, y) {
  if (!anim) return Promise.resolve();
  const w = $('#wave');
  w.style.background = mode === 'mule' ? 'radial-gradient(circle, rgba(0,160,223,.55), rgba(0,160,223,.15))' : 'radial-gradient(circle, rgba(255,77,0,.55), rgba(255,77,0,.15))';
  const R = Math.hypot(innerWidth, innerHeight);
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: resolve })
      .set(w, { opacity: 1, clipPath: `circle(0px at ${x}px ${y}px)` })
      .to(w, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 0.5, ease: 'power2.in' })
      .add(resolve)
      .to(w, { opacity: 0, duration: 0.45, ease: 'power2.out' });
  });
}

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  document.documentElement.dataset.mode = mode;
  resetAccent();
  store.set('mode', mode);
  $$('.platform').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  $$('#mode-float button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  requestAnimationFrame(() => { const b = $(`#mode-float button[data-mode="${mode}"]`), th = $('.mf-thumb'); th.style.width = `${b.offsetWidth}px`; th.style.transform = `translateX(${b.offsetLeft}px)`; });
  const D = mode === 'mule' ? MULE : INFA;
  $('#stage-title').textContent = D.title;
  $('#stage-lede').textContent = D.lede;
  $('#stage-plain').textContent = D.plain;
  $('#highlights').innerHTML = D.highlights.map((h) => `<div class="hl"><b>${escapeHtml(h.k)}</b><p>${escapeHtml(h.t)}</p></div>`).join('')
    + (mode === 'infa' ? D.cards.map((c) => `<div class="hl"><b class="t">${escapeHtml(c.name)}</b><p>${escapeHtml(c.text)}</p></div>`).join('') : '');
  $('#skills').innerHTML = Object.entries(D.skills).map(([k, v]) => `<div class="sk-row"><h5>${escapeHtml(t(k))}</h5><div class="sk-tags">${v.map((s) => `<button type="button" class="sk" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}</div></div>`).join('');
  setDiagramMode(mode);
  initMagnetic($('#stage'));
  if (anim) gsap.from('.stage-head > *', { y: 16, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
  setTimeout(() => ST && ST.refresh(), 100);
}

function initExpertise() {
  initPlatformFx();
  initDiagram();
  $$('.platform').forEach((b) => b.addEventListener('click', async (e) => {
    if (b.dataset.mode === currentMode) return;
    await wave(b.dataset.mode, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    setMode(b.dataset.mode);
  }));
  // sub tabs
  const tabs = $$('.subtabs button');
  let tabIdx = 0;
  tabs.forEach((t, ti) => t.addEventListener('click', () => {
    if (ti === tabIdx) return;
    const dir = ti > tabIdx ? 1 : -1;
    tabIdx = ti;
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    $$('.pane').forEach((p) => {
      const show = p.dataset.pane === t.dataset.tab;
      p.hidden = !show;
      if (show && anim) {
        gsap.fromTo(p, { x: 60 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out', clearProps: 'transform' });
        gsap.from(p.querySelectorAll('.hl, .sk-row'), { y: 20, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out', delay: 0.05 });
      }
    });
    ST && ST.refresh();
  }));
  // floating switcher: visible while inside Expertise once the big tabs have scrolled away.
  // It is position:fixed, so showing/hiding never changes the page layout (no jitter loop).
  const mf = $('#mode-float'), plats = $('.platforms'), sec = $('#expertise');
  $$('button', mf).forEach((b) => b.addEventListener('click', async (e) => {
    if (b.dataset.mode === currentMode) return;
    await wave(b.dataset.mode, e.clientX, e.clientY);
    setMode(b.dataset.mode);
  }));
  const onScroll = () => {
    const p = plats.getBoundingClientRect(), s = sec.getBoundingClientRect();
    mf.classList.toggle('show', p.bottom < 60 && s.bottom > innerHeight * 0.5);
  };
  addEventListener('scroll', onScroll, { passive: true });
  const saved = store.get('mode');
  setMode(saved === 'infa' ? 'infa' : 'mule');
}

/* =====================================================================
   Projects
   ===================================================================== */
const CAT_LABEL = Object.fromEntries(Object.entries({ all: 'All', ai: 'AI & agents', mule: 'MuleSoft', infa: 'Informatica', web: 'Web & full-stack', mobile: 'Mobile', data: 'Data', archive: 'Early days' }).map(([k, v]) => [k, t(v)]));
const CAT_COLOR = { ai: '#a78bfa', mule: '#00a0df', infa: '#ff5a1f', web: '#34d399', mobile: '#fbbf24', data: '#22d3ee', archive: '#f472b6' };

function initProjects() {
  const grid = $('#grid'), filters = $('#filters');
  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  filters.innerHTML = Object.keys(CAT_LABEL).filter((k) => counts[k]).map((k) => `<button role="tab" data-f="${k}" aria-selected="${k === 'all'}" type="button">${CAT_LABEL[k]}<sup>${counts[k]}</sup></button>`).join('');

  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="card${p.featured ? ' featured' : ''}" data-i="${i}" data-cats="${p.cats.join(' ')}" tabindex="0" role="button" aria-label="${escapeHtml(p.title)}: details">
      <div class="card-visual"><canvas></canvas><div class="card-glare"></div>
        <span class="card-year">${escapeHtml(p.year)}</span>
        <div class="card-icons">${p.icons.map((n) => `<span>${icon(n)}</span>`).join('')}</div>
      </div>
      <div class="card-body">
        <span class="card-kicker">${escapeHtml(p.kicker)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.summary)}</p>
        <div class="card-foot"><div class="card-tags">${p.stack.slice(0, 3).map((s) => `<span>${escapeHtml(s)}</span>`).join('')}</div><span class="card-more">${t('Details')}</span></div>
      </div>
    </article>`).join('');

  $$('.card', grid).forEach((card) => {
    const p = PROJECTS[+card.dataset.i];
    let energy = 0, target = 0;
    canvasLoop(card.querySelector('canvas'), ({ ctx, w, h, t }, dt) => {
      energy += (target - energy) * Math.min(1, dt * 4);
      MOTIFS[p.motif](ctx, w, h, t, accentRGB(), energy);
    }, { fps: 30 });
    if (FINE && !REDUCED) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * 7}deg) rotateX(${(0.5 - py) * 6}deg)`;
        card.style.setProperty('--gx', `${px * 100}%`); card.style.setProperty('--gy', `${py * 100}%`);
      });
      card.addEventListener('pointerenter', () => { target = 1; card.style.transition = 'transform .15s, border-color .4s, box-shadow .4s'; });
      card.addEventListener('pointerleave', () => { target = 0; card.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), border-color .4s, box-shadow .4s'; card.style.transform = ''; });
    }
    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); } });
  });

  filters.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const f = b.dataset.f;
    const cards = $$('.card', grid);
    const show = cards.filter((c) => f === 'all' || c.dataset.cats.split(' ').includes(f));
    cards.forEach((c) => c.classList.toggle('hide', !show.includes(c)));
    if (anim) gsap.fromTo(show, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.035, ease: 'power3.out', clearProps: 'transform,opacity' });
    ST && ST.refresh();
  });

  if (anim && ST) ST.batch('.card', { start: 'top 94%', once: true, onEnter: (els) => gsap.from(els, { y: 50, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'expo.out', clearProps: 'transform,opacity' }) });
}

let modalLoop = null, modalMotif = null, lastFocus = null;
function openModal(p) {
  const m = $('#modal');
  lastFocus = document.activeElement;
  const cats = p.cats.map((c) => `<span class="chip-cat" style="color:${CAT_COLOR[c]}">${CAT_LABEL[c]}</span>`).join(' ');
  const link = p.link
    ? `<a class="btn primary sm magnetic" href="${p.link}" target="_blank" rel="noopener"><span>${p.link.includes('github.com') ? t('View the code') : t('Open the live site')} ↗</span></a>`
    : `<p style="font-size:13px;color:var(--muted);margin:0">${t('Private repository · demo on request')}</p>`;
  $('#modal-body').innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap">${cats}</div>
    <h3 id="modal-title">${escapeHtml(p.title)}</h3>
    <p class="sub">${escapeHtml(p.kicker)} · ${escapeHtml(p.year)}</p>
    <p>${escapeHtml(p.summary)}</p>
    <ul>${p.points.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    <div class="card-tags" style="margin-bottom:20px">${p.stack.map((s) => `<span class="${skillInfo(s) ? 'sk-mini tagbtn' : ''}" data-skill="${escapeHtml(s)}">${escapeHtml(s)}</span>`).join('')}</div>
    ${link}`;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  modalMotif = p.motif;
  if (!modalLoop) modalLoop = canvasLoop($('#modal-fx'), ({ ctx, w, h, t }) => MOTIFS[modalMotif](ctx, w, h, t, accentRGB(), 0.6), { always: true });
  else { modalLoop.running = true; modalLoop.kick(); }
  initMagnetic(m);
  if (anim) {
    const small = innerWidth <= 760;
    gsap.fromTo('.modal-card', small ? { yPercent: 100 } : { y: 40, opacity: 0, scale: 0.96 }, small ? { yPercent: 0, duration: 0.45, ease: 'expo.out' } : { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' });
    gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }
  $('.modal-card').scrollTop = 0;
  $('.modal-close').focus({ preventScroll: true });
}
function closeModal() {
  const m = $('#modal');
  if (m.hidden) return;
  const done = () => { m.hidden = true; document.body.style.overflow = ''; if (modalLoop) modalLoop.running = false; lastFocus && lastFocus.focus({ preventScroll: true }); };
  if (anim) {
    const small = innerWidth <= 760;
    gsap.to('.modal-card', small ? { yPercent: 100, duration: 0.3, ease: 'power2.in', onComplete: done } : { y: 30, opacity: 0, scale: 0.97, duration: 0.25, ease: 'power2.in', onComplete: done });
    gsap.to('.modal-backdrop', { opacity: 0, duration: 0.25 });
  } else done();
}

/* =====================================================================
   Journey
   ===================================================================== */
function initJourney() {
  const list = $('#tl-list');
  list.innerHTML = TIMELINE.map((t) => `<li class="tl-item"><div class="tl-y">${escapeHtml(t.y)}</div><div class="tl-t">${escapeHtml(t.t)}</div><div class="tl-s">${escapeHtml(t.s)}</div></li>`).join('');
  const tl = $('#tl'), fill = $('#tl-fill');
  const items = $$('.tl-item', list);
  const update = () => {
    const r = tl.getBoundingClientRect();
    const k = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
    fill.style.height = `${k * 100}%`;
    const reach = k * list.offsetHeight;
    items.forEach((it) => it.classList.toggle('on', it.offsetTop + 20 < reach));
  };
  addEventListener('scroll', update, { passive: true });
  update();
  if (anim && ST) gsap.from(items, { y: 24, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: list, start: 'top 88%' } });
}

/* =====================================================================
   Contact: light fibres converging on the pointer
   ===================================================================== */
function initContact() {
  const cv = $('#contact-fx');
  const host = $('#contact');
  const m = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };
  host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; });
  const NF = innerWidth < 700 ? 36 : 60;
  const fibres = Array.from({ length: NF }, (_, i) => ({ a: (i / NF) * Math.PI * 2, s: rand(0.2, 1), o: Math.random() }));
  canvasLoop(cv, ({ ctx, w, h, t }, dt) => {
    m.x += (m.tx - m.x) * Math.min(1, dt * 3); m.y += (m.ty - m.y) * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, w, h);
    const cx = m.x * w, cy = m.y * h, R = Math.hypot(w, h);
    const [r, g, b] = accentRGB();
    fibres.forEach((f, i) => {
      const sx = w / 2 + Math.cos(f.a) * R * 0.7, sy = h / 2 + Math.sin(f.a) * R * 0.7;
      const mx = (sx + cx) / 2 + Math.sin(t * 0.6 + i) * 60, my = (sy + cy) / 2 + Math.cos(t * 0.5 + i) * 60;
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.04 + f.s * 0.07})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, cx, cy); ctx.stroke();
      const k = (t * f.s * 0.35 + f.o) % 1, u = 1 - k;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + k * 0.7})`;
      ctx.beginPath(); ctx.arc(u * u * sx + 2 * u * k * mx + k * k * cx, u * u * sy + 2 * u * k * my + k * k * cy, 1.2 + k * 1.5, 0, Math.PI * 2); ctx.fill();
    });
  }, { fps: 40 });
  const title = $('.contact-title .scramble');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); scramble(title, title.dataset.text, { duration: 0.9 }); } }, { threshold: 0.5 });
  io.observe(title);
  if (anim && ST) gsap.from('.cl', { y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.contact-links', start: 'top 94%' } });
}

/* =====================================================================
   Go
   ===================================================================== */
initPointer();
initNav();
initTicker();
initStats();
initReveals();
initExpertise();
initStory();
initAI();
initProjects();
initJourney();
initContact();
initMagnetic();
initNet($('#net'));
initSkillPop();
initMotion();
const intro = initIntro({ onEnter: (phase) => { if (phase === 'start') setTimeout(heroIn, 550); } });
initLang();
let restoreY = null;
try { restoreY = sessionStorage.getItem('restoreY'); sessionStorage.removeItem('restoreY'); } catch { /* ignore */ }
if (restoreY !== null) {
  intro.skip();
  heroIn();
  requestAnimationFrame(() => { scrollTo({ top: +restoreY, behavior: 'instant' }); ST && ST.refresh(); });
  if (anim) gsap.from('#top', { opacity: 0, duration: 0.6, ease: 'power2.out' });
} else intro.show();
$('#brand').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'instant' }); intro.show(); });
$('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* =====================================================================
   Skill popover: what it is + where I used it
   ===================================================================== */
function initSkillPop() {
  const pop = $('#pop');
  let cur = null;
  const close = () => {
    if (pop.hidden) return;
    cur && cur.classList.remove('on'); cur = null;
    document.body.classList.remove('pop-open');
    if (anim) gsap.to(pop, { opacity: 0, scale: 0.94, duration: 0.16, ease: 'power2.in', onComplete: () => (pop.hidden = true) });
    else pop.hidden = true;
  };
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-skill]');
    if (e.target.closest('.pop-x')) { close(); return; }
    if (!chip) { if (!e.target.closest('#pop')) close(); return; }
    const info = skillInfo(chip.dataset.skill);
    if (!info) return;
    if (cur === chip) { close(); return; }
    cur && cur.classList.remove('on');
    cur = chip; chip.classList.add('on');
    $('#pop-t').textContent = chip.dataset.skill;
    $('#pop-what').textContent = info[0];
    $('#pop-where').textContent = info[1];
    pop.hidden = false;
    document.body.classList.add('pop-open');
    openY = scrollY;
    if (innerWidth > 700) {
      const r = chip.getBoundingClientRect();
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), innerWidth - pw - 12);
      let top = r.bottom + 10;
      if (top + ph > innerHeight - 12) top = r.top - ph - 10;
      pop.style.left = `${left}px`; pop.style.top = `${top}px`;
    }
    if (anim) gsap.fromTo(pop, { opacity: 0, scale: 0.9, y: innerWidth > 700 ? -6 : 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2)' });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  let openY = 0;
  addEventListener('scroll', () => { if (!pop.hidden && innerWidth > 700 && Math.abs(scrollY - openY) > 120) close(); }, { passive: true });
}

/* =====================================================================
   Extra motion: hero parallax, panel reveals, ticker velocity
   ===================================================================== */
function initMotion() {
  if (!anim || !ST) return;
  gsap.to('.hero-content', { yPercent: -18, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('#net', { scale: 1.25, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('.diagram-wrap, .ai-grid > .panel, .merge-lab').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(8% 6% 8% 6% round 28px)', opacity: 0.2 }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' }, clearProps: 'clipPath' });
  });
  gsap.from('.tk', { opacity: 0, y: 10, stagger: 0.02, duration: 0.4, scrollTrigger: { trigger: '.ticker', start: 'top 95%' } });
}

/* =====================================================================
   Language switcher: EN / FR hand-written, others via automatic translation
   ===================================================================== */
function initLang() {
  const current = AUTO_LANG || LANG;
  const label = (AUTO_LANG || LANG).split('-')[0].toUpperCase();
  const menuHtml = `
    <button class="lang-opt${!AUTO_LANG && LANG === 'en' ? ' on' : ''}" data-lang="en" type="button" translate="no"><b>EN</b>English</button>
    <button class="lang-opt${!AUTO_LANG && LANG === 'fr' ? ' on' : ''}" data-lang="fr" type="button" translate="no"><b>FR</b>Français</button>
    <span class="lang-sep">${t('Other languages (automatic)')}</span>
    <div class="lang-grid">${OTHER_LANGS.map(([c, n]) => `<button class="lang-opt sm${AUTO_LANG === c ? ' on' : ''}" data-auto="${c}" type="button" translate="no">${n}</button>`).join('')}</div>`;
  $$('.lang').forEach((wrap) => {
    wrap.innerHTML = `<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${t('Language')}" translate="no">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg><span>${label}</span></button>
      <div class="lang-menu" role="menu" hidden>${menuHtml}</div>`;
    const btn = $('.lang-btn', wrap), menu = $('.lang-menu', wrap);
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      $$('.lang-menu').forEach((m) => (m.hidden = true));
      menu.hidden = !open; btn.setAttribute('aria-expanded', String(open));
      if (open && anim) gsap.fromTo(menu, { opacity: 0, y: -8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' });
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
    menu.addEventListener('click', (e) => {
      const o = e.target.closest('.lang-opt'); if (!o) return;
      if (o.dataset.lang) switchLang({ lang: o.dataset.lang, auto: '' }, e);
      else switchLang({ lang: 'en', auto: o.dataset.auto }, e);
    });
  });
  if (AUTO_LANG) loadAutoTranslate(AUTO_LANG);
  void current;
}

function setTransCookie(val) {
  const host = location.hostname;
  const exp = val ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  [`; path=/`, `; path=/; domain=${host}`, `; path=/; domain=.${host}`].forEach((sfx) => { document.cookie = `googtrans=${val}${exp}${sfx}`; });
}

async function switchLang({ lang, auto }, e) {
  if (lang === LANG && auto === AUTO_LANG) return;
  try {
    localStorage.setItem('lang', lang);
    if (auto) localStorage.setItem('autoLang', auto); else localStorage.removeItem('autoLang');
    sessionStorage.setItem('restoreY', String(document.getElementById('intro').hidden ? scrollY : 0));
  } catch { /* storage blocked: still reload */ }
  setTransCookie(auto ? `/en/${auto}` : '');
  if (!document.getElementById('intro').hidden) { try { sessionStorage.removeItem('restoreY'); } catch { /* */ } }
  await wave(currentMode || 'mule', e ? e.clientX : innerWidth / 2, e ? e.clientY : innerHeight / 2);
  location.reload();
}

function loadAutoTranslate(code) {
  setTransCookie(`/en/${code}`);
  const holder = document.createElement('div');
  holder.id = 'gt-el'; holder.style.display = 'none';
  document.body.appendChild(holder);
  window.googleTranslateElementInit = () => {
    try { new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt-el'); } catch { /* ignore */ }
  };
  const sc = document.createElement('script');
  sc.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  sc.async = true;
  document.body.appendChild(sc);
  if (code === 'ar') document.documentElement.classList.add('auto-rtl');
}

// "Technically: …" links from the plain-language story open the right platform
document.addEventListener('goto-platform', async (e) => {
  $('#expertise').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  if (e.detail !== currentMode) { await wave(e.detail, innerWidth / 2, innerHeight / 2); setMode(e.detail); }
});
