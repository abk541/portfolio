import { STATS, MULE, INFA, PROJECTS, TIMELINE } from './data.js';
import { $, $$, icon, hydrateIcons, scramble, canvasLoop, REDUCED, FINE, rand, escapeHtml, accentRGB, resetAccent } from './util.js';
import { initNet } from './net.js';
import { initDiagram, setDiagramMode } from './diagram.js';
import { initAI } from './ai.js';
import { MOTIFS } from './motifs.js';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);
const anim = !!gsap && !REDUCED;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

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
  const TAG = { mule: 'MuleSoft', infa: 'Informatica', ai: 'AI · Lead' };
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
    });
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
    });
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
  const D = mode === 'mule' ? MULE : INFA;
  $('#stage-title').textContent = D.title;
  $('#stage-lede').textContent = D.lede;
  $('#highlights').innerHTML = D.highlights.map((h) => `<div class="hl"><b>${escapeHtml(h.k)}</b><p>${escapeHtml(h.t)}</p></div>`).join('')
    + (mode === 'infa' ? D.cards.map((c) => `<div class="hl"><b class="t">${escapeHtml(c.name)}</b><p>${escapeHtml(c.text)}</p></div>`).join('') : '');
  $('#skills').innerHTML = Object.entries(D.skills).map(([k, v]) => `<div class="sk-row"><h5>${escapeHtml(k)}</h5><div class="sk-tags">${v.map((s) => `<span class="sk">${escapeHtml(s)}</span>`).join('')}</div></div>`).join('');
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
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    $$('.pane').forEach((p) => {
      const show = p.dataset.pane === t.dataset.tab;
      p.hidden = !show;
      if (show && anim) gsap.from(p.children, { y: 16, opacity: 0, duration: 0.45, stagger: 0.03, ease: 'power3.out' });
    });
    ST && ST.refresh();
  }));
  // compact platform tabs once they stick
  const plats = $('.platforms');
  const onScroll = () => {
    const top = parseFloat(getComputedStyle(plats).top) || 0;
    const r = plats.getBoundingClientRect();
    plats.classList.toggle('stuck', r.top <= top + 1 && $('#stage').getBoundingClientRect().top < top + r.height + 10);
  };
  addEventListener('scroll', onScroll, { passive: true });
  const saved = store.get('mode');
  setMode(saved === 'infa' ? 'infa' : 'mule');
}

/* =====================================================================
   Projects
   ===================================================================== */
const CAT_LABEL = { all: 'All', ai: 'AI & agents', mule: 'MuleSoft', infa: 'Informatica', web: 'Web & full-stack', mobile: 'Mobile', data: 'Data', archive: 'Early days' };
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
        <div class="card-foot"><div class="card-tags">${p.stack.slice(0, 3).map((s) => `<span>${escapeHtml(s)}</span>`).join('')}</div><span class="card-more">Details</span></div>
      </div>
    </article>`).join('');

  $$('.card', grid).forEach((card) => {
    const p = PROJECTS[+card.dataset.i];
    let energy = 0, target = 0;
    canvasLoop(card.querySelector('canvas'), ({ ctx, w, h, t }, dt) => {
      energy += (target - energy) * Math.min(1, dt * 4);
      MOTIFS[p.motif](ctx, w, h, t, accentRGB(), energy);
    });
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
    ? `<a class="btn primary sm magnetic" href="${p.link}" target="_blank" rel="noopener"><span>${p.link.includes('github.com') ? 'View the code' : 'Open the live site'} ↗</span></a>`
    : '<p style="font-size:13px;color:var(--muted);margin:0">Private repository · demo on request</p>';
  $('#modal-body').innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap">${cats}</div>
    <h3 id="modal-title">${escapeHtml(p.title)}</h3>
    <p class="sub">${escapeHtml(p.kicker)} · ${escapeHtml(p.year)}</p>
    <p>${escapeHtml(p.summary)}</p>
    <ul>${p.points.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    <div class="card-tags" style="margin-bottom:20px">${p.stack.map((s) => `<span>${escapeHtml(s)}</span>`).join('')}</div>
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
  });
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
initAI();
initProjects();
initJourney();
initContact();
initMagnetic();
initNet($('#net'));
heroIn();
$('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
