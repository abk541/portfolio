import { STATS, MULE, INFA, PROJECTS, TIMELINE } from './data.js';
import { $, $$, icon, hydrateIcons, scramble, canvasLoop, REDUCED, FINE, rand, escapeHtml, accentRGB, resetAccent, sleep } from './util.js';
import { initNet, metrics } from './net.js';
import { initDiagram, setDiagramMode } from './diagram.js';
import { initSeq } from './seq.js';
import { MOTIFS } from './motifs.js';

const gsap = window.gsap;
const ST = window.ScrollTrigger;
if (gsap && ST) gsap.registerPlugin(ST);

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

hydrateIcons();

/* =====================================================================
   Boot
   ===================================================================== */
const BOOT_LINES = [
  ['dim', '> resolving abdelkader.portfolio …'],
  ['', '> POST /oauth2/token  grant_type=client_credentials'],
  ['ok', '  200 · access_token issued (scope: portfolio.read)'],
  ['', '> anypoint: connecting to CloudHub 2.0 …'],
  ['ok', '  120 APIs · RUNNING'],
  ['', '> idmc: secure agent handshake …'],
  ['ok', '  Business 360 · 3 domains · golden records ready'],
  ['', '> mcp: tools/list'],
  ['ac', '  30 servers · tools discovered'],
  ['ok', '> all systems nominal. opening the gateway.'],
];

async function boot() {
  const boot = $('#boot');
  if (REDUCED || store.get('booted') === '1' && location.hash) { boot.remove(); return; }
  document.body.classList.add('booting');
  const log = $('#boot-log'), fill = $('#boot-fill'), pct = $('#boot-pct');
  const total = 2300;
  const t0 = performance.now();
  let li = 0;
  await new Promise((resolve) => {
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / total);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      fill.style.width = `${e * 100}%`;
      pct.textContent = String(Math.round(e * 100)).padStart(3, '0');
      while (li < BOOT_LINES.length && li / BOOT_LINES.length <= k) {
        const [cls, txt] = BOOT_LINES[li++];
        const d = document.createElement('div');
        d.className = cls; d.textContent = txt;
        log.appendChild(d);
      }
      if (k < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
  store.set('booted', '1');
  await sleep(180);
  if (gsap) {
    await gsap.to(boot, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' });
  }
  boot.remove();
  document.body.classList.remove('booting');
}

/* =====================================================================
   Cursor + magnetic
   ===================================================================== */
function initCursor() {
  if (!FINE) return;
  const cur = $('#cursor'), dot = $('.c-dot'), ring = $('.c-ring'), label = $('#cursor-label');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  const loop = () => {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    label.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], .card, .dn.domain, .core-dom, .filters button, .stage-switch button');
    if (t) { cur.classList.add('big'); label.textContent = t.dataset.cursor || (t.classList.contains('card') ? 'open' : 'trace'); }
    else if (e.target.closest('a, button, input')) { cur.classList.add('big'); label.textContent = ''; }
    else cur.classList.remove('big');
  });
}

function initMagnetic(root = document) {
  if (!FINE) return;
  $$('.magnetic', root).forEach((el) => {
    if (el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 600);
    });
  });
}

/* =====================================================================
   Hero
   ===================================================================== */
function heroIn() {
  $$('.hero .scramble').forEach((el, i) => scramble(el, el.dataset.text, { duration: 1.3, delay: i * 0.2 }));
  if (gsap && !REDUCED) {
    gsap.from('.hero-title .line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.12 });
    gsap.from(['.eyebrow', '.hero-role', '.hero-sub', '.hero-cta', '.hero-hint'], { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
    gsap.from('.hs-row', { x: 40, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.8, ease: 'power3.out' });
    gsap.from('#net', { opacity: 0, scale: 1.15, duration: 2, ease: 'expo.out' });
  }
  // rotator
  const items = $$('#rotator span');
  let cur = 0;
  if (gsap) { gsap.set(items, { yPercent: 110 }); gsap.set(items[0], { yPercent: 0 }); }
  else items[0].style.transform = 'none';
  if (!REDUCED && gsap) setInterval(() => {
    const next = (cur + 1) % items.length;
    gsap.to(items[cur], { yPercent: -110, duration: 0.45, ease: 'power3.in' });
    gsap.fromTo(items[next], { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', delay: 0.4 });
    cur = next;
  }, 2200);
  // hero side log rows refresh
  const rows = $$('.hs-row');
  const FEED = [
    ['GET', '/api/v1/coworkers', '200 · 41ms'], ['EVT', 'b360.project.updated', '→ mule'], ['MCP', 'tools/call search_projects', 'ok'],
    ['CDI', 'm_ingress_sap_ecc', `${(Math.random() * 20000 | 0).toLocaleString('fr-FR')} rows`], ['GW', 'x-api-key policy', 'pass'],
    ['POST', '/invoices (EN 16931)', '202'], ['SFTP', 'losinger/inbound/*.csv', 'routed'], ['B360', 'match & merge job #17', 'merged 214'],
    ['IDoc', 'ORDERS05 → SAP', 'ack'], ['DLQ', 'expenses.retry', 'drained'], ['LLM', 'tool_use ×2', 'parallel'],
  ];
  if (!REDUCED) setInterval(() => {
    const r = rows[(Math.random() * rows.length) | 0];
    const f = FEED[(Math.random() * FEED.length) | 0];
    r.innerHTML = `<span>${f[0]}</span> ${escapeHtml(f[1])} <em>${escapeHtml(f[2])}</em>`;
    if (gsap) gsap.fromTo(r, { opacity: 0.2, x: 10 }, { opacity: 1, x: 0, duration: 0.4 });
  }, 900);
}

/* =====================================================================
   Ticker
   ===================================================================== */
function initTicker() {
  const items = [['mulesoft', 'MuleSoft Anypoint'], ['informatica', 'Informatica IDMC'], ['sap', 'SAP ECC · BW'], ['salesforce', 'Salesforce'], ['snowflake', 'Snowflake'], ['claude', 'Claude'], ['openai', 'Azure OpenAI'], ['splunk', 'Splunk'], ['nodedotjs', 'Node.js'], ['react', 'React'], ['typescript', 'TypeScript'], ['nextdotjs', 'Next.js'], ['kotlin', 'Kotlin'], ['supabase', 'Supabase'], ['postgresql', 'PostgreSQL'], ['threedotjs', 'three.js']];
  const one = items.map(([i, l]) => `<span class="tk">${icon(i)}${l}<span class="sep">◆</span></span>`).join('');
  $('#ticker').innerHTML = one + one;
}

/* =====================================================================
   Stats
   ===================================================================== */
function initStats() {
  const grid = $('#stats-grid');
  grid.innerHTML = STATS.map((s, i) => `<div class="stat" data-i="${i}"><span class="stat-tag ${s.mode}">${s.mode === 'mule' ? 'mulesoft' : s.mode === 'infa' ? 'informatica' : 'ai · lead'}</span><div class="stat-n"><span class="num">0</span><sup>${s.suffix}</sup></div><div class="stat-l">${escapeHtml(s.label)}</div><canvas></canvas></div>`).join('');
  $$('.stat', grid).forEach((el, i) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); });
    const s = STATS[i];
    const col = s.mode === 'mule' ? [0, 160, 223] : s.mode === 'infa' ? [255, 77, 0] : [167, 139, 250];
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
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(${col},0.25)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.fill();
    });
  });
  const run = () => $$('.stat .num', grid).forEach((n, i) => {
    const target = STATS[i].n;
    if (!gsap || REDUCED) { n.textContent = target; return; }
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: 2, ease: 'power3.out', delay: i * 0.06, onUpdate: () => (n.textContent = Math.round(o.v)) });
  });
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.3 });
  io.observe(grid);
  if (gsap && ST && !REDUCED) gsap.from('.stat', { y: 60, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: grid, start: 'top 85%' } });
}

/* =====================================================================
   Section titles: split chars & animate
   ===================================================================== */
function initTitles() {
  $$('.reveal-title').forEach((h) => {
    const words = h.textContent.split(' ');
    h.innerHTML = words.map((w) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="ch">${escapeHtml(c)}</span>`).join('')}</span>`).join(' ');
    if (!gsap || !ST || REDUCED) return;
    gsap.from(h.querySelectorAll('.ch'), {
      yPercent: 120, rotateX: -90, opacity: 0, transformOrigin: '50% 100%',
      duration: 0.9, ease: 'expo.out', stagger: 0.018,
      scrollTrigger: { trigger: h, start: 'top 88%' },
    });
  });
  if (gsap && ST && !REDUCED) {
    $$('.section-head .lede, .section-head .kicker').forEach((el) => gsap.from(el, { y: 24, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
    gsap.from('.pr', { y: 50, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.principles', start: 'top 88%' } });
    gsap.from('.choice', { y: 80, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '#chooser', start: 'top 85%' } });
  }
}

/* =====================================================================
   Runtime: chooser, portal, stage
   ===================================================================== */
let currentMode = null;

function initChoiceFx() {
  $$('.choice').forEach((btn) => {
    const isMule = btn.classList.contains('mule');
    const col = isMule ? [0, 160, 223] : [255, 77, 0];
    let hover = 0, target = 0;
    btn.addEventListener('pointerenter', () => (target = 1));
    btn.addEventListener('pointerleave', () => (target = 0));
    const parts = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), v: rand(0.05, 0.2), r: rand(0.6, 1.8) }));
    canvasLoop(btn.querySelector('canvas'), ({ ctx, w, h, t }, dt) => {
      hover += (target - hover) * Math.min(1, dt * 4);
      ctx.clearRect(0, 0, w, h);
      if (isMule) {
        // API-led layers: three horizontal bands with packets shooting through
        for (let L = 0; L < 3; L++) {
          const y = h * (0.28 + L * 0.2);
          ctx.strokeStyle = `rgba(${col},${0.08 + hover * 0.12})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        parts.forEach((p, i) => {
          const L = i % 3;
          p.x += p.v * dt * (1 + hover * 4);
          if (p.x > 1.1) p.x = -0.1;
          const y = h * (0.28 + L * 0.2) + Math.sin(p.x * 12 + i) * 3;
          const x = p.x * w;
          ctx.strokeStyle = `rgba(${col},${0.2 + hover * 0.6})`; ctx.lineWidth = p.r;
          ctx.beginPath(); ctx.moveTo(x - 30 * (1 + hover), y); ctx.lineTo(x, y); ctx.stroke();
        });
        // vertical connectors
        for (let k = 0; k < 6; k++) {
          const x = w * (0.15 + k * 0.14);
          const ph = (t * 0.8 + k * 0.3) % 1;
          ctx.fillStyle = `rgba(255,255,255,${0.15 + hover * 0.5})`;
          ctx.beginPath(); ctx.arc(x, h * 0.28 + ph * h * 0.4, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        // particles gathering into a golden core
        const cx = w * 0.72, cy = h * 0.42;
        parts.forEach((p, i) => {
          const a = i * 2.39996 + t * p.v * 2;
          const rr = (0.12 + ((p.y + t * p.v * 0.2) % 1) * 0.5) * Math.min(w, h) * (1 - hover * 0.55);
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.8;
          ctx.fillStyle = i % 7 === 0 ? `rgba(250,204,21,${0.4 + hover * 0.6})` : `rgba(${col},${0.2 + hover * 0.6})`;
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
        });
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 + hover * 40);
        g.addColorStop(0, `rgba(250,204,21,${0.15 + hover * 0.35})`); g.addColorStop(1, 'rgba(250,204,21,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }
    });
  });
}

async function portal(mode, x, y) {
  const p = $('#portal');
  const isMule = mode === 'mule';
  p.style.background = isMule ? 'radial-gradient(circle at 50% 45%, #18b5f0, #0074a8 70%)' : 'radial-gradient(circle at 50% 45%, #ff6a2b, #c23200 70%)';
  p.innerHTML = `<div style="display:grid;place-items:center;gap:22px"><div class="portal-logo">${icon(isMule ? 'mulesoft' : 'informatica')}</div></div><div class="portal-text">${isMule ? 'deploying to cloudhub 2.0 · api-led' : 'secure agent connected · business 360'}</div>`;
  const svg = p.querySelector('svg'); svg.style.cssText = 'width:min(34vw,200px);height:min(34vw,200px);fill:#fff;filter:drop-shadow(0 20px 60px rgba(0,0,0,.35))';
  if (!gsap || REDUCED) { setMode(mode); return; }
  const at = `${x}px ${y}px`;
  gsap.set(p, { clipPath: `circle(0px at ${at})` });
  await gsap.to(p, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${at})`, duration: 0.85, ease: 'expo.in' });
  gsap.fromTo(svg, { scale: 0.4, rotate: -90, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' });
  gsap.fromTo(p.querySelector('.portal-text'), { opacity: 0, letterSpacing: '1em' }, { opacity: 1, letterSpacing: '.3em', duration: 0.6 });
  setMode(mode);
  await sleep(650);
  $('#stage').scrollIntoView({ behavior: 'instant', block: 'start' });
  scrollBy(0, -90);
  await gsap.to(p, { clipPath: `circle(0px at 50% 50%)`, duration: 0.8, ease: 'expo.out' });
}

function setMode(mode) {
  currentMode = mode;
  document.documentElement.dataset.mode = mode;
  resetAccent();
  store.set('mode', mode);
  $('#mode-chip-label').textContent = `runtime: ${mode === 'mule' ? 'mulesoft' : 'informatica'}`;
  $('#chooser').classList.add('collapsed');
  const stage = $('#stage');
  stage.hidden = false;
  const D = mode === 'mule' ? MULE : INFA;
  $('#stage-kicker').textContent = mode === 'mule' ? 'mulesoft · anypoint platform · since 2022' : 'informatica · idmc business 360 · since 2024';
  $('#stage-title').textContent = D.title;
  $('#stage-lede').textContent = D.lede;
  // switch
  $$('.stage-switch button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === mode)));
  requestAnimationFrame(moveThumb);
  // highlights
  $('#highlights').innerHTML = D.highlights.map((h) => `<div class="hl"><b>${escapeHtml(h.k)}</b><p>${escapeHtml(h.t)}</p></div>`).join('')
    + (mode === 'infa' ? D.cards.map((c) => `<div class="hl"><b style="font-size:22px;letter-spacing:-.02em">${escapeHtml(c.name)}</b><p><span class="mono" style="font-size:11px;color:var(--accent)">${escapeHtml(c.sub)}</span><br>${escapeHtml(c.text)}</p></div>`).join('') : '');
  // skills
  $('#skills').innerHTML = Object.entries(D.skills).map(([k, v]) => `<div class="sk-row"><h5>${escapeHtml(k)}</h5><div class="sk-tags">${v.map((s) => `<span class="sk">${escapeHtml(s)}</span>`).join('')}</div></div>`).join('');
  setDiagramMode(mode);
  initMagnetic(stage);
  if (gsap && !REDUCED) {
    gsap.from('.stage-head > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.3 });
    gsap.from('.hl', { y: 40, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: '#highlights', start: 'top 90%' } });
    gsap.from('.sk', { scale: 0.6, opacity: 0, duration: 0.4, stagger: 0.008, ease: 'back.out(2)', scrollTrigger: { trigger: '#skills', start: 'top 90%' } });
  }
  setTimeout(() => ST && ST.refresh(), 100);
}

function moveThumb() {
  const sel = $('.stage-switch button[aria-selected="true"]');
  const thumb = $('.switch-thumb');
  if (!sel) return;
  thumb.style.width = `${sel.offsetWidth}px`;
  thumb.style.transform = `translateX(${sel.offsetLeft - 5}px)`;
}

function initRuntime() {
  initChoiceFx();
  initDiagram();
  $$('.choice').forEach((b) => b.addEventListener('click', (e) => {
    $$('.choice').forEach((c) => c.classList.toggle('active', c === b));
    portal(b.dataset.mode, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  }));
  $$('.stage-switch button').forEach((b) => b.addEventListener('click', (e) => {
    if (b.dataset.mode === currentMode) return;
    const r = b.getBoundingClientRect();
    portalLite(b.dataset.mode, r.left + r.width / 2, r.top + r.height / 2);
  }));
  $('#mode-chip').addEventListener('click', (e) => {
    if (!currentMode) { $('#runtime').scrollIntoView({ behavior: 'smooth' }); return; }
    const next = currentMode === 'mule' ? 'infa' : 'mule';
    portal(next, e.clientX, e.clientY);
  });
  addEventListener('resize', moveThumb);
  const saved = store.get('mode');
  if (saved === 'mule' || saved === 'infa') {
    // returning visitor: keep the chooser visible, but pre-tint with their last runtime
    document.documentElement.dataset.mode = saved; resetAccent();
    $('#mode-chip-label').textContent = `last runtime: ${saved === 'mule' ? 'mulesoft' : 'informatica'}`;
  }
}

/** Quick in-place switch: colour wave across the stage, no navigation. */
async function portalLite(mode, x, y) {
  if (!gsap || REDUCED) { setMode(mode); return; }
  const p = $('#portal');
  p.innerHTML = '';
  p.style.background = mode === 'mule' ? '#00a0df' : '#ff4d00';
  const at = `${x}px ${y}px`;
  gsap.set(p, { clipPath: `circle(0px at ${at})`, opacity: 0.9 });
  await gsap.to(p, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${at})`, duration: 0.55, ease: 'power3.in' });
  setMode(mode);
  await gsap.to(p, { opacity: 0, duration: 0.5, ease: 'power2.out' });
  gsap.set(p, { clipPath: 'circle(0px at 50% 50%)', opacity: 1 });
}

/* =====================================================================
   Projects
   ===================================================================== */
const CAT_LABEL = { all: 'All', ai: 'AI & agents', mule: 'MuleSoft', infa: 'Informatica', web: 'Full-stack & web', mobile: 'Mobile', data: 'Data & dashboards', archive: 'From way back' };
const CAT_COLOR = { ai: '#a78bfa', mule: '#00a0df', infa: '#ff4d00', web: '#34d399', mobile: '#fbbf24', data: '#22d3ee', archive: '#f472b6' };

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
        <div class="card-tags">${p.stack.slice(0, 5).map((s) => `<span>${escapeHtml(s)}</span>`).join('')}</div>
      </div>
    </article>`).join('');

  $$('.card', grid).forEach((card) => {
    const p = PROJECTS[+card.dataset.i];
    let energy = 0, target = 0;
    const cv = card.querySelector('canvas');
    canvasLoop(cv, ({ ctx, w, h, t }, dt) => {
      energy += (target - energy) * Math.min(1, dt * 4);
      MOTIFS[p.motif](ctx, w, h, t, accentRGB(), energy);
    });
    if (FINE && !REDUCED) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 8}deg) translateZ(0)`;
        card.style.setProperty('--gx', `${px * 100}%`); card.style.setProperty('--gy', `${py * 100}%`);
      });
      card.addEventListener('pointerenter', () => { target = 1; card.style.transition = 'transform .15s, border-color .4s, box-shadow .4s'; });
      card.addEventListener('pointerleave', () => { target = 0; card.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1), border-color .4s, box-shadow .4s'; card.style.transform = ''; });
    }
    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(p); } });
  });

  filters.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', filters).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    const f = b.dataset.f;
    const cards = $$('.card', grid);
    const show = cards.filter((c) => f === 'all' || c.dataset.cats.split(' ').includes(f));
    if (!gsap || REDUCED) { cards.forEach((c) => c.classList.toggle('hide', !show.includes(c))); return; }
    gsap.to(cards, { opacity: 0, y: 20, scale: 0.97, duration: 0.2, stagger: 0.01, onComplete: () => {
      cards.forEach((c) => c.classList.toggle('hide', !show.includes(c)));
      gsap.fromTo(show, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', clearProps: 'transform' });
      ST && ST.refresh();
    } });
  });

  if (gsap && ST && !REDUCED) {
    ST.batch('.card', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { y: 80, opacity: 0, rotateX: -12, duration: 1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }) });
  }
}

let modalLoop = null, modalMotif = null;
function openModal(p) {
  const m = $('#modal');
  const catChips = p.cats.map((c) => `<span class="mono" style="font-size:11px;padding:4px 9px;border-radius:999px;border:1px solid ${CAT_COLOR[c]};color:${CAT_COLOR[c]}">${CAT_LABEL[c]}</span>`).join(' ');
  $('#modal-body').innerHTML = `
    <div style="display:flex;gap:6px;flex-wrap:wrap">${catChips}</div>
    <h3 id="modal-title">${escapeHtml(p.title)}</h3>
    <p class="mono" style="font-size:12px;color:var(--accent);margin:-4px 0 14px">${escapeHtml(p.kicker)} · ${escapeHtml(p.year)}</p>
    <p>${escapeHtml(p.summary)}</p>
    <ul>${p.points.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
    <div class="card-tags" style="margin-bottom:18px">${p.stack.map((s) => `<span>${escapeHtml(s)}</span>`).join('')}</div>
    ${p.link ? `<a class="btn primary sm modal-link magnetic" href="${p.link}" target="_blank" rel="noopener"><span>${p.link.includes('github.com') ? 'View the code' : 'Open live site'} ↗</span></a>` : '<p class="mono" style="font-size:11px;color:var(--muted);margin:0">private repository · demo on request</p>'}`;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  modalMotif = p.motif;
  if (!modalLoop) modalLoop = canvasLoop($('#modal-fx'), ({ ctx, w, h, t }) => MOTIFS[modalMotif](ctx, w, h, t, accentRGB(), 0.6), { always: true });
  else { modalLoop.running = true; modalLoop.kick(); }
  initMagnetic(m);
  if (gsap && !REDUCED) {
    gsap.fromTo('.modal-card', { y: 60, opacity: 0, scale: 0.94, rotateX: 10 }, { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.6, ease: 'expo.out' });
    gsap.fromTo('.modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.from('#modal-body > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.04, delay: 0.1, ease: 'power3.out' });
  }
  $('.modal-close').focus();
}
function closeModal() {
  const m = $('#modal');
  if (m.hidden) return;
  const done = () => { m.hidden = true; document.body.style.overflow = ''; if (modalLoop) modalLoop.running = false; };
  if (gsap && !REDUCED) gsap.to('.modal-card', { y: 40, opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.in', onComplete: done });
  else done();
}

/* =====================================================================
   Timeline
   ===================================================================== */
function initTimeline() {
  const list = $('#tl-list');
  list.innerHTML = TIMELINE.map((t) => `<li class="tl-item"><div class="tl-y">${escapeHtml(t.y)}</div><div class="tl-t">${escapeHtml(t.t)}</div><div class="tl-s">${escapeHtml(t.s)}</div></li>`).join('');
  const tl = $('#tl'), svg = $('#tl-line'), path = $('#tl-path'), fill = $('#tl-path-fill'), pkt = $('#tl-packet');
  const items = $$('.tl-item', list);
  let L = 0;
  const layout = () => {
    const H = list.offsetHeight;
    svg.setAttribute('height', H);
    svg.style.height = `${H}px`;
    // a gentle sine so the "wire" feels alive
    let d = 'M2,0';
    for (let y = 10; y <= H; y += 10) d += ` L${2 + Math.sin(y / 60) * 0},${y}`;
    path.setAttribute('d', d); fill.setAttribute('d', d);
    L = fill.getTotalLength();
    fill.style.strokeDasharray = L;
  };
  layout();
  new ResizeObserver(layout).observe(list);
  const update = () => {
    const r = tl.getBoundingClientRect();
    const k = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
    fill.style.strokeDashoffset = L * (1 - k);
    pkt.style.transform = `translateY(${k * list.offsetHeight - 6}px) rotate(45deg)`;
    pkt.style.opacity = k > 0 && k < 1 ? 1 : 0.4;
    items.forEach((it) => it.classList.toggle('on', it.offsetTop + 20 < k * list.offsetHeight));
  };
  addEventListener('scroll', update, { passive: true });
  update();
  if (gsap && ST && !REDUCED) gsap.from(items, { x: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: list, start: 'top 85%' } });
}

/* =====================================================================
   Contact: fibre field converging on the cursor
   ===================================================================== */
function initContact() {
  const cv = $('#contact-fx');
  const host = $('#contact');
  const m = { x: 0.5, y: 0.45, tx: 0.5, ty: 0.45 };
  host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); m.tx = (e.clientX - r.left) / r.width; m.ty = (e.clientY - r.top) / r.height; });
  const fibres = Array.from({ length: 64 }, (_, i) => ({ a: (i / 64) * Math.PI * 2, s: rand(0.2, 1), o: Math.random() }));
  canvasLoop(cv, ({ ctx, w, h, t }, dt) => {
    m.x += (m.tx - m.x) * Math.min(1, dt * 3); m.y += (m.ty - m.y) * Math.min(1, dt * 3);
    ctx.clearRect(0, 0, w, h);
    const cx = m.x * w, cy = m.y * h, R = Math.hypot(w, h);
    const [r, g, b] = accentRGB();
    fibres.forEach((f, i) => {
      const sx = w / 2 + Math.cos(f.a) * R * 0.7, sy = h / 2 + Math.sin(f.a) * R * 0.7;
      const mx = (sx + cx) / 2 + Math.sin(t * 0.6 + i) * 60, my = (sy + cy) / 2 + Math.cos(t * 0.5 + i) * 60;
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.05 + f.s * 0.08})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, cx, cy); ctx.stroke();
      const k = (t * f.s * 0.35 + f.o) % 1;
      const u = 1 - k;
      const px = u * u * sx + 2 * u * k * mx + k * k * cx, py = u * u * sy + 2 * u * k * my + k * k * cy;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.3 + k * 0.7})`;
      ctx.beginPath(); ctx.arc(px, py, 1.2 + k * 1.5, 0, Math.PI * 2); ctx.fill();
    });
    const pulse = 18 + Math.sin(t * 3) * 4;
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse * 5);
    gr.addColorStop(0, `rgba(${r},${g},${b},0.35)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, pulse * 5, 0, Math.PI * 2); ctx.fill();
  });
  const title = $('.contact-title .scramble');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); scramble(title, title.dataset.text, { duration: 1.4 }); } }, { threshold: 0.5 });
  io.observe(title);
  if (gsap && ST && !REDUCED) gsap.from('.cl', { y: 50, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.contact-links', start: 'top 92%' } });
}

/* =====================================================================
   Chrome: progress, msg/s, uptime, keyboard
   ===================================================================== */
function initChrome() {
  const fill = $('#pipe-fill'), tps = $('#pipe-tps'), up = $('#uptime');
  const onScroll = () => {
    const k = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    fill.style.width = `${k * 100}%`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  let last = metrics.delivered;
  const t0 = Date.now();
  setInterval(() => {
    const d = metrics.delivered - last; last = metrics.delivered;
    tps.textContent = `${d} msg/s`;
    const s = Math.floor((Date.now() - t0) / 1000);
    up.textContent = `uptime ${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, 1000);
  $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

/* =====================================================================
   Go
   ===================================================================== */
initCursor();
initTicker();
initStats();
initTitles();
initRuntime();
initSeq();
initProjects();
initTimeline();
initContact();
initChrome();
initMagnetic();
initNet($('#net'));
boot().then(heroIn);
