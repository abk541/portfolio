// Interactive, animated architecture diagrams for the MuleSoft and Informatica runtimes.
import { MULE, INFA } from './data.js';
import { metrics } from './net.js';
import { t, LANG } from './lang.js';
import { $, canvasLoop, escapeHtml, rand, REDUCED, hexToRgb, accentRGB, bez } from './util.js';

const gsap = window.gsap;

/* ---------- route helpers ---------- */
function curve(p, q, bend = 0.5) {
  const dx = (q[0] - p[0]) * bend;
  return [p, [p[0] + dx, p[1]], [q[0] - dx, q[1]], q];
}
function sample(c, n = 22) { const out = []; for (let i = 0; i <= n; i++) out.push(bez(c[0], c[1], c[2], c[3], i / n)); return out; }
function makeRoute(curves) {
  const pts = [];
  curves.forEach((c, k) => { const s = sample(c); (k ? s.slice(1) : s).forEach((p) => pts.push(p)); });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, L: cum[cum.length - 1] };
}
function posAt(r, s) {
  if (s <= 0) return r.pts[0];
  if (s >= r.L) return r.pts[r.pts.length - 1];
  let lo = 0, hi = r.cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (r.cum[m] < s) lo = m; else hi = m; }
  const t = (s - r.cum[lo]) / (r.cum[hi] - r.cum[lo] || 1);
  return [r.pts[lo][0] + (r.pts[hi][0] - r.pts[lo][0]) * t, r.pts[lo][1] + (r.pts[hi][1] - r.pts[lo][1]) * t];
}
const svgPath = (c) => `M${c[0][0]},${c[0][1]} C${c[1][0]},${c[1][1]} ${c[2][0]},${c[2][1]} ${c[3][0]},${c[3][1]}`;

/* ---------- module state ---------- */
let mode = null;
let els = {};
let routes = [];       // {route, color, domain, kind}
let links = [];        // svg link records {el, domain, from, to}
let packets = [];
let bursts = [];
let focus = null;      // domain id highlighted
let coreHits = 0;
let fx;

export function initDiagram() {
  els = { fit: $('#diagram-fit'), inner: $('#diagram-inner'), cols: $('#diagram-cols'), diagram: $('#diagram'), svg: $('#diagram-svg'), nodes: $('#diagram-nodes'), canvas: $('#diagram-fx'), detail: $('#diagram-detail'), hint: $('#diagram-hint'), pills: $('#domain-pills') };
  fx = canvasLoop(els.canvas, draw);
  els.nodes.addEventListener('mouseleave', () => { if (!pinned) setFocus(null); });
  let lastW = 0;
  new ResizeObserver(() => {
    const w = els.fit.clientWidth;
    if (!mode || !w || Math.abs(w - lastW) < 1) return;
    lastW = w; fit(); layoutRoutes();
  }).observe(els.fit);
}

/** Lay the diagram out at a comfortable logical width, then scale it to fit the panel. */
const LOGICAL_MIN = 940;
function fit() {
  const W = els.fit.clientWidth;
  if (!W) return;
  const L = Math.max(W, LOGICAL_MIN);
  const k = W / L;
  els.inner.style.width = `${L}px`;
  els.inner.style.transform = k < 1 ? `scale(${k})` : '';
  els.fit.style.height = `${els.inner.offsetHeight * k}px`;
}

export function setDiagramMode(m) {
  mode = m;
  focus = null; pinned = null;
  els.detail.innerHTML = '';
  packets = []; bursts = []; coreHits = 0;
  if (m === 'mule') buildMule(); else buildInfa();
  fit();
  requestAnimationFrame(() => {
    layoutRoutes();
    if (!REDUCED && gsap) {
      gsap.fromTo(els.nodes.children, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.012, ease: 'back.out(2)', clearProps: 'scale' });
      const paths = els.svg.querySelectorAll('path');
      paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: 0.004, ease: 'power2.inOut', onComplete: () => paths.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }) });
    }
  });
  buildLab(m);
}

/* ---------- MULE ---------- */
const MX = { back: 7, sapi: 22, dom: 47, gw: 72, cons: 90 };

function setCols(labels, xs) {
  els.cols.innerHTML = labels.map((l, i) => `<span style="position:absolute;left:${xs[i]}%;transform:translateX(-50%)">${escapeHtml(l)}</span>`).join('');
  els.cols.style.height = '16px';
}

function buildMule() {
  els.diagram.style.height = '640px';
  setCols(MULE.columns, [MX.back, MX.sapi, MX.dom, MX.gw, MX.cons]);
  const nb = MULE.backends.length;
  let html = '';
  MULE.backends.forEach((b, i) => {
    const y = 3 + (i / (nb - 1)) * 94;
    html += `<div class="dn backend" data-b="${escapeHtml(b)}" style="left:${MX.back}%;top:${y}%">${escapeHtml(b)}</div>`;
    html += `<div class="dn sapi" data-s="${escapeHtml(b)}" style="left:${MX.sapi}%;top:${y}%" title="System API · ${escapeHtml(b)}"></div>`;
  });
  const nd = MULE.domains.length;
  MULE.domains.forEach((d, i) => {
    const y = 5 + (i / (nd - 1)) * 90;
    html += `<div class="dn domain" data-d="${d.id}" style="left:${MX.dom}%;top:${y}%;--c:${d.color}" tabindex="0" role="button">${escapeHtml(d.name)}<small>${escapeHtml(d.tag)}</small></div>`;
  });
  html += `<div class="dn gw" style="left:${MX.gw}%;top:50%">FLEX GATEWAY</div>`;
  MULE.consumers.forEach((c, i) => {
    const y = 22 + i * 28;
    html += `<div class="dn consumer" data-c="${c.id}" style="left:${MX.cons}%;top:${y}%">${escapeHtml(c.label)}<small>${escapeHtml(c.sub)}</small></div>`;
  });
  els.nodes.innerHTML = html;
  els.hint.textContent = t('Back-ends → System APIs → Process APIs → Gateway → consumers');
  bindDomains('[data-d]', (id) => MULE.domains.find((d) => d.id === id));
  buildPills(MULE.domains);
}

/* ---------- INFA ---------- */
const IX = { src: 7, ing: 25, core: 50, dif: 73, cons: 91 };
const INFA_FEEDS = {
  cow: ['SAS SI RH', 'ADP', 'IAM', 'Employee Profile', 'eCheckIn', 'CoWorker Tool'],
  proj: ['SAP ECC', 'SAP BW', 'BMS', 'PUMA', 'Salesforce CRM'],
  org: ['SAP ECC', 'SAP BW', 'SAS SI RH', 'BMS'],
};
const REALTIME = ['IAM', 'Employee Profile', 'CoWorker Tool', 'eCheckIn'];

function buildInfa() {
  els.diagram.style.height = '560px';
  setCols(['Source systems', 'Ingestion', 'Business 360 MDM core', 'Distribution', 'Consumers'].map(t), [IX.src, IX.ing, IX.core, IX.dif, IX.cons]);
  let html = '';
  const ns = INFA.sources.length;
  INFA.sources.forEach((s, i) => {
    const y = 4 + (i / (ns - 1)) * 92;
    html += `<div class="dn backend" data-b="${escapeHtml(s)}" style="left:${IX.src}%;top:${y}%">${escapeHtml(s)}</div>`;
  });
  INFA.ingestion.forEach((g, i) => {
    html += `<div class="dn stage-node" data-i="${g.id}" style="left:${IX.ing}%;top:${i ? 70 : 32}%">${escapeHtml(g.label)}<small>${escapeHtml(g.sub)}</small></div>`;
  });
  html += `<div class="dn core" style="left:${IX.core}%;top:50%">
    <span class="core-title">${t('Golden record per domain')}</span>
    ${INFA.domains.map((d) => `<button class="core-dom" data-d="${d.id}" style="--c:${d.color}" type="button">${escapeHtml(d.name)}</button>`).join('')}
    <span class="core-chips">${INFA.core.map((c) => `<span>${escapeHtml(c)}</span>`).join('')}</span>
    <span class="core-stat" id="core-stat">${escapeHtml(INFA.coreStats)}</span>
    <span class="core-stat" id="core-count">0 ${t('records consolidated')}</span>
  </div>`;
  INFA.diffusion.forEach((g, i) => {
    html += `<div class="dn stage-node" data-f="${g.id}" style="left:${IX.dif}%;top:${20 + i * 30}%">${escapeHtml(g.label)}<small>${escapeHtml(g.sub)}</small></div>`;
  });
  INFA.consumers.forEach((c, i) => {
    html += `<div class="dn consumer" data-c="${c.id}" style="left:${IX.cons}%;top:${20 + i * 30}%">${escapeHtml(c.label)}<small>${escapeHtml(c.sub)}</small></div>`;
  });
  els.nodes.innerHTML = html;
  els.hint.textContent = t('Sources → ingestion → golden record → distribution → consumers');
  bindDomains('[data-d]', (id) => INFA.domains.find((d) => d.id === id));
  buildPills(INFA.domains);
}

/* ---------- shared: domain focus ---------- */
function bindDomains(sel, find) {
  els.nodes.querySelectorAll(sel).forEach((n) => {
    const id = n.dataset.d;
    n.addEventListener('mouseenter', () => { if (!pinned) setFocus(id, find(id)); });
    n.addEventListener('focus', () => setFocus(id, find(id)));
    n.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (pinned === id) { pinned = null; setFocus(null); return; }
      pinned = id; setFocus(id, find(id));
    });
  });
}

let pinned = null;

function buildPills(domains) {
  els.pills.innerHTML = `<button class="pill-btn on" data-all type="button" style="--c:#ffffff"><i></i>${t('All traffic')}</button>` +
    domains.map((d) => `<button class="pill-btn" data-d="${d.id}" type="button" style="--c:${d.color}"><i></i>${escapeHtml(d.name)}</button>`).join('');
  els.pills.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.d || null;
    pinned = id;
    setFocus(id, id ? domains.find((d) => d.id === id) : null);
    b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }));
}

function setFocus(id, d) {
  if (focus === id) return;
  focus = id;
  applyFocus();
  if (d) {
    els.detail.innerHTML = `<div class="dd" style="--c:${d.color}"><div><h4>${escapeHtml(d.name)}</h4><span class="tag">${escapeHtml(d.tag || d.sub || '')}</span></div><p>${escapeHtml(d.text)}</p></div>`;
    if (gsap && !REDUCED) gsap.from(els.detail.firstChild, { y: 16, opacity: 0, duration: 0.45, ease: 'power3.out' });
    for (let k = 0; k < 14; k++) setTimeout(() => spawn(true), k * 40);
  } else {
    els.detail.innerHTML = '';
  }
}

function applyFocus() {
  const id = focus;
  els.nodes.querySelectorAll('[data-d]').forEach((n) => n.classList.toggle('on', n.dataset.d === id));
  els.pills.querySelectorAll('.pill-btn').forEach((n) => n.classList.toggle('on', id ? n.dataset.d === id : n.hasAttribute('data-all')));
  let related = null;
  if (id) {
    if (mode === 'mule') { const dom = MULE.domains.find((x) => x.id === id); related = new Set([...dom.links, ...dom.to]); }
    else related = new Set(INFA_FEEDS[id]);
  }
  els.nodes.querySelectorAll('.backend, .sapi, .consumer').forEach((n) => {
    const key = n.dataset.b || n.dataset.s || n.dataset.c;
    n.classList.toggle('dim', !!related && !related.has(key));
  });
  links.forEach((l) => {
    const active = !id || l.domain === id || l.domain === '*';
    l.el.style.opacity = !id ? l.base : l.domain === id ? 0.95 : active ? l.base * 0.6 : 0.04;
    l.el.style.strokeWidth = id && l.domain === id ? 2 : 1;
  });
}

/* ---------- geometry ---------- */
// Layout-space geometry (immune to the fit scale and to GSAP entrance transforms).
// Every .dn is centred on its left/top via translate(-50%,-50%).
function box(el) {
  const w = el.offsetWidth, h = el.offsetHeight, cx = el.offsetLeft, cy = el.offsetTop;
  return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2, cx, cy };
}

function addLink(c, color, domain, base = 0.22) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', svgPath(c));
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', color);
  p.style.opacity = base;
  p.style.transition = 'opacity .35s, stroke-width .35s';
  els.svg.appendChild(p);
  links.push({ el: p, domain, base });
}

function layoutRoutes() {
  const W = els.diagram.clientWidth, H = els.diagram.clientHeight;
  els.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  els.svg.innerHTML = '';
  links = []; routes = [];
  const q = (s) => els.nodes.querySelector(s);
  const cssEsc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : s);

  if (mode === 'mule') {
    const gw = box(q('.gw'));
    const sapiBox = {};
    MULE.backends.forEach((b) => {
      const bb = box(q(`[data-b="${cssEsc(b)}"]`)), sb = box(q(`[data-s="${cssEsc(b)}"]`));
      sapiBox[b] = { bb, sb };
      addLink(curve([bb.r, bb.cy], [sb.l, sb.cy]), '#ffffff', '*', 0.12);
    });
    const cons = {};
    MULE.consumers.forEach((c) => { cons[c.id] = box(q(`[data-c="${c.id}"]`)); });
    MULE.domains.forEach((d) => {
      const db = box(q(`[data-d="${d.id}"]`));
      const gIn = [gw.l, Math.min(gw.b - 10, Math.max(gw.t + 10, db.cy))];
      const c2 = curve([db.r, db.cy], gIn, 0.55);
      addLink(c2, d.color, d.id);
      d.links.forEach((b) => {
        const { bb, sb } = sapiBox[b];
        const c1 = curve([sb.r, sb.cy], [db.l, db.cy], 0.5);
        addLink(c1, d.color, d.id);
        d.to.forEach((cid) => {
          const cb = cons[cid];
          const gOut = [gw.r, Math.min(gw.b - 10, Math.max(gw.t + 10, cb.cy))];
          const c3 = curve(gOut, [cb.l, cb.cy], 0.5);
          routes.push({ route: makeRoute([curve([bb.r, bb.cy], [sb.l, sb.cy]), c1, c2, [gIn, gIn, gOut, gOut], c3]), color: d.color, domain: d.id });
        });
      });
    });
    // gateway → consumers links
    MULE.consumers.forEach((c) => {
      const cb = cons[c.id];
      addLink(curve([gw.r, Math.min(gw.b - 10, Math.max(gw.t + 10, cb.cy))], [cb.l, cb.cy]), '#ffffff', '*', 0.25);
    });
  } else {
    const core = box(q('.core'));
    const ing = { cdi: box(q('[data-i="cdi"]')), rt: box(q('[data-i="rt"]')) };
    const coreIn = (y) => [core.l, Math.min(core.b - 20, Math.max(core.t + 20, y))];
    INFA.sources.forEach((s) => {
      const sb = box(q(`[data-b="${cssEsc(s)}"]`));
      const g = REALTIME.includes(s) ? 'rt' : 'cdi';
      const ib = ing[g];
      const c1 = curve([sb.r, sb.cy], [ib.l, ib.cy]);
      const doms = Object.keys(INFA_FEEDS).filter((k) => INFA_FEEDS[k].includes(s));
      const color = INFA.domains.find((d) => d.id === (doms[0] || 'cow')).color;
      doms.forEach((dm) => addLink(c1, INFA.domains.find((d) => d.id === dm).color, dm, 0.2));
      const c2 = curve([ib.r, ib.cy], coreIn(ib.cy + rand(-30, 30)));
      doms.forEach((dm) => routes.push({ route: makeRoute([c1, c2]), color: INFA.domains.find((d) => d.id === dm).color, domain: dm, kind: 'in' }));
      if (!doms.length) routes.push({ route: makeRoute([c1, c2]), color, domain: 'cow', kind: 'in' });
    });
    Object.values(ing).forEach((ib) => addLink(curve([ib.r, ib.cy], coreIn(ib.cy)), '#ffffff', '*', 0.3));
    INFA.diffusion.forEach((f, i) => {
      const fb = box(q(`[data-f="${f.id}"]`));
      const cb = box(q(`[data-c="${INFA.consumers[i].id}"]`));
      const c1 = curve([core.r, Math.min(core.b - 20, Math.max(core.t + 20, fb.cy))], [fb.l, fb.cy]);
      const c2 = curve([fb.r, fb.cy], [cb.l, cb.cy]);
      addLink(c1, '#facc15', '*', 0.35); addLink(c2, '#facc15', '*', 0.35);
      routes.push({ route: makeRoute([c1, c2]), color: '#facc15', domain: '*', kind: 'out' });
    });
  }
  applyFocus();
}

/* ---------- packets ---------- */
function spawn(focused = false) {
  if (!routes.length) return;
  let pool = routes;
  if (mode === 'infa') pool = routes.filter((r) => r.kind === 'in');
  if (focus && (focused || Math.random() < 0.85)) {
    const f = pool.filter((r) => r.domain === focus);
    if (f.length) pool = f;
  }
  if (!pool.length) return;
  const r = pool[(Math.random() * pool.length) | 0];
  const back = mode === 'mule' && Math.random() < 0.35; // responses flow back
  packets.push({ r: r.route, s: back ? r.route.L : 0, v: rand(170, 300) * (back ? -1 : 1), rgb: hexToRgb(r.color), kind: r.kind, size: rand(1.6, 2.6) });
}

function emitGolden() {
  const outs = routes.filter((r) => r.kind === 'out');
  if (!outs.length) return;
  const r = outs[(Math.random() * outs.length) | 0];
  packets.push({ r: r.route, s: 0, v: rand(150, 230), rgb: [250, 204, 21], kind: 'out', size: 3 });
}

function draw(s, dt) {
  const { ctx, w, h } = s;
  ctx.clearRect(0, 0, w, h);
  if (!mode) return;
  const rate = focus ? 0.5 : 0.75;
  if (!REDUCED && packets.length < (w < 700 ? 60 : 130) && Math.random() < rate) spawn();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.s += p.v * dt;
    if (p.s > p.r.L || p.s < 0) {
      const end = p.r.pts[p.v > 0 ? p.r.pts.length - 1 : 0];
      bursts.push({ x: end[0], y: end[1], a: 1, rgb: p.rgb });
      metrics.delivered++;
      if (p.kind === 'in') {
        coreHits++;
        if (coreHits % 3 === 0) emitGolden();
        const el = document.getElementById('core-count');
        if (el) el.textContent = `${(coreHits * 1371).toLocaleString(LANG === 'fr' ? 'fr-FR' : 'en-US')} ${t('records consolidated')}`;
      }
      packets.splice(i, 1);
      continue;
    }
    const [r, g, b] = p.rgb;
    const dir = Math.sign(p.v);
    // trail
    ctx.lineWidth = p.size;
    ctx.lineCap = 'round';
    let prev = posAt(p.r, p.s);
    for (let k = 1; k <= 8; k++) {
      const q = posAt(p.r, p.s - dir * k * 5);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.55 * (1 - k / 9)})`;
      ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      prev = q;
    }
    const [x, y] = posAt(p.r, p.s);
    ctx.fillStyle = `rgba(${r},${g},${b},1)`;
    ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(${r},${g},${b},0.18)`;
    ctx.beginPath(); ctx.arc(x, y, p.size * 4, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.a -= dt * 2.6;
    if (b.a <= 0) { bursts.splice(i, 1); continue; }
    ctx.strokeStyle = `rgba(${b.rgb[0]},${b.rgb[1]},${b.rgb[2]},${b.a * 0.8})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(b.x, b.y, (1 - b.a) * 14 + 2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

/* =====================================================================
   Labs: MuleSoft strangler cut-over · Informatica match & merge
   ===================================================================== */
function buildLab(m) {
  const lab = $('#merge-lab');
  lab.hidden = false;
  const copy = lab.querySelector('.merge-copy');
  const board = $('#merge-board');
  board.innerHTML = '';
  board.classList.toggle('cutover', m === 'mule');
  if (m === 'mule') {
    copy.innerHTML = `<span class="eyebrow">${t('Mule 3 → Mule 4 migration')}</span>
      <h4>${t('lab.mule.title') || 'Migrating ~40 critical HR interfaces <em class="serif">without dropping a single message.</em>'}</h4>
      <p>${t('lab.mule.text') || 'Proxy APIs sat in front of every legacy flow, so traffic could shift interface by interface across 80+ countries. Drag the slider to replay the cut-over.'}</p>
      <label class="cut"><span>${t('cut-over')}</span><input type="range" min="0" max="100" value="0" id="cut" aria-label="${t('cut-over')}"><b id="cut-v">0%</b></label>
      <p class="cut-meta" id="cut-meta">0 / 40 ${t('interfaces on Mule 4')}</p>`;
    buildCutover(board);
  } else {
    copy.innerHTML = `<span class="eyebrow">${t('Match & merge')}</span>
      <h4>${t('lab.infa.title') || 'Three messy records walk in. <em class="serif">One golden record walks out.</em>'}</h4>
      <p>${t('lab.infa.text') || 'Per-source trust decides which value survives for every field. Run the match to watch survivorship do its job.'}</p>
      <button class="btn primary magnetic" id="merge-run" type="button"><span>${t('Run match')}</span></button>`;
    buildMerge(board);
  }
}

function buildCutover(board) {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  board.appendChild(cv);
  const input = $('#cut'), vEl = $('#cut-v'), meta = $('#cut-meta');
  let cut = 0;
  input.addEventListener('input', () => {
    cut = +input.value / 100;
    vEl.textContent = `${input.value}%`;
    meta.textContent = `${Math.round(cut * 40)} / 40 ${t('interfaces on Mule 4')} · ${cut >= 1 ? t('Mule 3 decommissioned ✓') : t('zero downtime')}`;
  });
  // auto-play once when visible
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && gsap && !REDUCED) {
      io.disconnect();
      const o = { v: 0 };
      gsap.to(o, { v: 62, duration: 2.6, ease: 'power2.inOut', onUpdate: () => { input.value = o.v; input.dispatchEvent(new Event('input')); } });
    }
  }, { threshold: 0.5 });
  io.observe(board);

  const ps = [];
  canvasLoop(cv, (s, dt) => {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    const bw = Math.min(124, w * 0.29), bh = 48;
    const src = [bw / 2 + 2, h * 0.5], proxy = [w * 0.47, h * 0.5], m3 = [w - bw / 2 - 2, h * 0.24], m4 = [w - bw / 2 - 2, h * 0.76];
    const nodes = [
      { p: src, label: t('HR consumers'), sub: t('80+ countries'), c: '#ffffff' },
      { p: proxy, label: t('Proxy API'), sub: t('routing rule'), c: '#00a0df' },
      { p: m3, label: 'Mule 3', sub: `${40 - Math.round(cut * 40)} ${t('flows')}`, c: '#6b7280', fade: 1 - cut },
      { p: m4, label: 'Mule 4', sub: `${Math.round(cut * 40)} ${t('flows')}`, c: '#00a0df' },
    ];
    const c1 = curve(src, proxy), c3 = curve(proxy, m3), c4 = curve(proxy, m4);
    const stroke = (c, col, a) => { ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(...c[0]); ctx.bezierCurveTo(...c[1], ...c[2], ...c[3]); ctx.stroke(); ctx.globalAlpha = 1; };
    stroke(c1, '#ffffff', 0.25); stroke(c3, '#9ca3af', 0.15 + 0.5 * (1 - cut)); stroke(c4, '#00a0df', 0.15 + 0.6 * cut);
    if (!REDUCED && Math.random() < 0.6) ps.push({ t: 0, seg: 0, to: Math.random() < cut ? 4 : 3, v: rand(0.7, 1.1) });
    ctx.globalCompositeOperation = 'lighter';
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.t += dt * p.v;
      if (p.t >= 1) { if (p.seg === 0) { p.seg = 1; p.t = 0; } else { ps.splice(i, 1); continue; } }
      const c = p.seg === 0 ? c1 : p.to === 4 ? c4 : c3;
      const [x, y] = bez(c[0], c[1], c[2], c[3], p.t);
      ctx.fillStyle = p.seg === 0 ? 'rgba(255,255,255,.9)' : p.to === 4 ? 'rgba(0,160,223,1)' : 'rgba(156,163,175,.9)';
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    nodes.forEach((n) => {
      const a = n.fade === undefined ? 1 : 0.35 + 0.65 * n.fade;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#0a0c14'; ctx.strokeStyle = n.c; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(n.p[0] - bw / 2, n.p[1] - bh / 2, bw, bh, 12); ctx.fill(); ctx.stroke();
      let fsz = bw < 110 ? 12 : 13.5;
      ctx.font = `600 ${fsz}px Inter, sans-serif`;
      while (fsz > 8 && ctx.measureText(n.label).width > bw - 12) { fsz -= 0.5; ctx.font = `600 ${fsz}px Inter, sans-serif`; }
      ctx.fillStyle = '#f1f3f9'; ctx.textAlign = 'center';
      ctx.fillText(n.label, n.p[0], n.p[1] - 2);
      ctx.fillStyle = '#7d8699'; ctx.font = `${bw < 110 ? 10 : 11}px Inter, sans-serif`;
      ctx.fillText(n.sub, n.p[0], n.p[1] + 13);
      ctx.globalAlpha = 1;
    });
    ctx.textAlign = 'left';
  });
}

const RECORDS = [
  { src: 'SAS SI RH', c: '#fb923c', trust: 'trust 0.9', f: { Name: 'BENALI Sara', Email: 's.benali@corp.example', Phone: '—', Birth: '1991-04-12', OrgUnit: 'UO-4471' } },
  { src: 'ADP', c: '#38bdf8', trust: 'trust 0.7', f: { Name: 'Sara Benali', Email: '—', Phone: '+33 6 12 34 56 78', Birth: '12/04/1991', OrgUnit: 'UO-4470' } },
  { src: 'IAM', c: '#a78bfa', trust: 'trust 0.8', f: { Name: 'sbenali', Email: 'sara.benali@example.com', Phone: '0612345678', Birth: '—', OrgUnit: '—' } },
];
const GOLDEN = { Name: 'Sara BENALI', Email: 'sara.benali@example.com', Phone: '+33 6 12 34 56 78', Birth: '1991-04-12', OrgUnit: 'UO-4471' };
const WIN = { Name: 0, Email: 2, Phone: 1, Birth: 0, OrgUnit: 0 };

function recHtml(r, i) {
  return `<div class="rec" data-r="${i}" style="--c:${r.c}"><div class="src"><b>${r.src}</b><span>${r.trust}</span></div>${Object.entries(r.f).map(([k, v]) => `<div class="f" data-k="${k}"><span>${k}</span><span>${escapeHtml(v)}</span></div>`).join('')}</div>`;
}

function buildMerge(board) {
  board.innerHTML = RECORDS.map(recHtml).join('') + `<div class="rec golden"><div class="src"><b>★ Golden record</b><span>CoWorker #48213</span></div>${Object.entries(GOLDEN).map(([k, v]) => `<div class="f win"><span>${k}</span><span>${escapeHtml(v)}</span></div>`).join('')}</div>`;
  const place = () => {
    const W = board.clientWidth, H = board.clientHeight;
    const recs = [...board.querySelectorAll('.rec:not(.golden)')];
    const gap = 10;
    const rw = Math.min(210, (W - gap * 2) / 3);
    board.classList.toggle('narrow', rw < 170);
    recs.forEach((r, i) => { r.style.width = rw + 'px'; r.style.left = i * (rw + gap) + (W - (rw * 3 + gap * 2)) / 2 + 'px'; r.style.top = '0px'; });
    const g = board.querySelector('.golden');
    g.style.width = Math.min(270, W) + 'px';
    g.style.left = (W - g.offsetWidth) / 2 + 'px';
    g.style.top = (H - g.offsetHeight) + 'px';
  };
  place();
  new ResizeObserver(place).observe(board);
  let running = false;
  const run = () => {
    if (running || !gsap) return;
    running = true;
    const recs = [...board.querySelectorAll('.rec:not(.golden)')];
    const g = board.querySelector('.golden');
    recs.forEach((r) => r.querySelectorAll('.f').forEach((f) => f.classList.remove('win', 'bad')));
    gsap.set(recs, { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 });
    gsap.set(g, { opacity: 0, scale: 0.6 });
    const tl = gsap.timeline({ onComplete: () => { running = false; } });
    // mark survivors field by field
    Object.keys(WIN).forEach((k, i) => {
      tl.add(() => {
        recs.forEach((r, ri) => {
          const f = r.querySelector(`[data-k="${k}"]`);
          f.classList.add(ri === WIN[k] ? 'win' : 'bad');
        });
      }, 0.25 + i * 0.28);
    });
    const gx = g.offsetLeft + g.offsetWidth / 2, gy = g.offsetTop + g.offsetHeight / 2;
    tl.to(recs, {
      x: (i, el) => gx - (el.offsetLeft + el.offsetWidth / 2),
      y: (i, el) => gy - (el.offsetTop + el.offsetHeight / 2),
      scale: 0.55, rotate: (i) => (i - 1) * 14, opacity: 0, duration: 0.8, ease: 'power3.in', stagger: 0.08,
    }, 1.9);
    tl.to(g, { opacity: 1, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.55)' }, 2.7);
    tl.to(recs, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0.4, duration: 0.6, ease: 'power2.out' }, 3.8);
  };
  $('#merge-run').addEventListener('click', run);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(run, 400); } }, { threshold: 0.6 });
  io.observe(board);
}
