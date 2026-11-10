import { UI, EXPERTISE, EXPERIENCE, EDUCATION, LANGUAGES } from './content.js';
import { COPY, TREE } from './copy.js';
import { PROJECTS } from './projects.data.js';
import { skillInfo } from './skills.js';
import { ICONS } from '../assets/icons.js';
import { heroFlow, archFlow, teamFlow, cutover, barChart, donutChart, THEME, setTheme } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHONE = () => innerWidth < 760;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (n) => (ICONS[n] ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>` : '');
const pad = (n) => String(n).padStart(2, '0');
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const onView = (el, fn, threshold = 0.25) => {
  if (REDUCED || !('IntersectionObserver' in window)) { fn(); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
};
document.documentElement.classList.add('js');
const PC = {}, CAT_COL = {}, ICON_COL = {};
const PILLAR_KEYS = ['mule', 'infa', 'ai'];

/* ------------------------------------------------------------------ language */
const OTHER = [['es', 'Español'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands'], ['ar', 'العربية'], ['tr', 'Türkçe'], ['pl', 'Polski'], ['zh-CN', '中文'], ['ja', '日本語']];
const AUTO = store.get('autoLang') || '';
let lang = AUTO ? 'en' : (store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en'));
let T = { ...UI[lang], ...COPY[lang] };

function setTransCookie(val) {
  const h = location.hostname;
  const exp = val ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  [`; path=/`, `; path=/; domain=${h}`, `; path=/; domain=.${h}`].forEach((d) => { document.cookie = `googtrans=${val}${exp}${d}`; });
}

function initLang() {
  const box = $('#lang');
  const label = AUTO ? AUTO.split('-')[0].toUpperCase() : lang.toUpperCase();
  box.innerHTML = `<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${esc(T.lang)}: ${label}" translate="no"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg><span>${label}</span></button>
    <div class="lang-menu" hidden translate="no">
      <button type="button" data-l="en" class="${!AUTO && lang === 'en' ? 'on' : ''}">English <span>EN</span></button>
      <button type="button" data-l="fr" class="${!AUTO && lang === 'fr' ? 'on' : ''}">Français <span>FR</span></button>
      <span class="sep">${esc(T.otherLangs)}</span>
      <div class="grid">${OTHER.map(([c, n]) => `<button type="button" data-a="${c}" class="${AUTO === c ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>`;
  const btn = $('.lang-btn', box), menu = $('.lang-menu', box);
  btn.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); };
  menu.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a) { store.set('autoLang', b.dataset.a); store.set('lang', 'en'); setTransCookie(`/en/${b.dataset.a}`); location.reload(); return; }
    if (AUTO) { store.set('autoLang', null); setTransCookie(''); store.set('lang', b.dataset.l); location.reload(); return; }
    if (b.dataset.l === lang) { menu.hidden = true; return; }
    store.set('lang', b.dataset.l);
    lang = b.dataset.l;
    menu.hidden = true;
    renderAll();
    initLang();
  };
  if (AUTO && !window.__gt) {
    window.__gt = true;
    setTransCookie(`/en/${AUTO}`);
    const holder = document.createElement('div'); holder.id = 'gt'; holder.style.display = 'none'; document.body.appendChild(holder);
    window.gtInit = () => { try { new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'gt'); } catch { /* ignore */ } };
    const sc = document.createElement('script'); sc.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; sc.async = true; document.body.appendChild(sc);
    if (AUTO === 'ar') document.documentElement.dir = 'rtl';
  }
}
document.addEventListener('click', (e) => {
  const box = $('#lang');
  if (box && !box.contains(e.target)) { const m = $('.lang-menu', box); if (m && !m.hidden) { m.hidden = true; $('.lang-btn', box).setAttribute('aria-expanded', 'false'); } }
});

/* ------------------------------------------------------------------ chart & flow strings */
const X2 = {
  en: {
    targets: ['Business apps', 'AI agents', 'Snowflake BI', 'Partners'], hub: ['Integration', 'hub'],
    muleChart: 'Platform at a glance', muleBars: [['Mule APIs in production', 120, '+'], ['HR interfaces migrated', 40], ['MCP servers for AI agents', 30], ['Flex Gateway proxies', 25, '+']],
    infaChart: 'Business 360 jobs in production', infaTotal: 'B360 jobs', infaSegs: ['Exports (egress)', 'Ingestion (ingress)', 'Business events', 'Match & merge', 'Other jobs'],
    aiChart: 'Response time', aiBars: [['Simple question (no AI)', 0.41, ' s'], ['Question that needs AI', 2.1, ' s']],
    cutTitle: 'Mule 3 → Mule 4, with zero downtime', cutText: 'Proxy APIs sat in front of every legacy flow, so traffic could move interface by interface across 80+ countries. Drag to replay the cut-over.',
    cutLabel: 'cut-over', cutMeta: (n) => `${n} / 40 interfaces on Mule 4`, cutDone: 'Mule 3 decommissioned ✓', cutLive: 'zero downtime',
    cutNodes: { src: 'HR consumers', srcSub: '80+ countries', proxy: 'Proxy API', proxySub: 'routing rule', flows: 'flows' },
    arch: 'Architecture', walk: 'Walk through a question', proof: 'Proof',
  },
  fr: {
    targets: ['Applis métier', 'Agents IA', 'Snowflake BI', 'Partenaires'], hub: ['Hub', 'd’intégration'],
    muleChart: 'La plateforme en chiffres', muleBars: [['API Mule en production', 120, '+'], ['Interfaces RH migrées', 40], ['Serveurs MCP pour agents IA', 30], ['Proxys Flex Gateway', 25, '+']],
    infaChart: 'Jobs Business 360 en production', infaTotal: 'jobs B360', infaSegs: ['Exports (egress)', 'Ingestion (ingress)', 'Business events', 'Match and merge', 'Autres jobs'],
    aiChart: 'Temps de réponse', aiBars: [['Question simple (sans IA)', 0.41, ' s'], ['Question qui demande l’IA', 2.1, ' s']],
    cutTitle: 'Mule 3 → Mule 4, sans interruption', cutText: 'Des API proxy se plaçaient devant chaque flux historique, pour basculer le trafic interface par interface dans plus de 80 pays. Faites glisser pour rejouer la bascule.',
    cutLabel: 'bascule', cutMeta: (n) => `${n} / 40 interfaces sur Mule 4`, cutDone: 'Mule 3 décommissionné ✓', cutLive: 'zéro interruption',
    cutNodes: { src: 'Consommateurs RH', srcSub: '80+ pays', proxy: 'API proxy', proxySub: 'règle de routage', flows: 'flux' },
    arch: 'Architecture', walk: 'Suivre une question', proof: 'Preuves',
  },
};
const HERO_SOURCES = ['SAP ERP', 'Salesforce', 'Global HR', 'Informatica MDM', 'Hexagon'];
const HUB_APPS = { en: ['HR', 'Payroll', 'Finance', 'Sales', 'Job sites', 'IT access'], fr: ['RH', 'Paie', 'Finance', 'Commercial', 'Chantiers', 'Accès IT'] };
let archCtl = null, teamCtl = null, cutCtl = null, ddCtl = null;

/* ------------------------------------------------------------------ text */
function fillText() {
  document.documentElement.lang = AUTO || lang;
  $$('[data-k]').forEach((el) => { const v = T[el.dataset.k]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-icon]').forEach((el) => { if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });
  $('#msg').placeholder = T.placeholder;
}

/* ------------------------------------------------------------------ palette + theme */
const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const hexRgb = (h) => { const n = parseInt(h.slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
function readPalette() {
  ['mule', 'infa', 'ai', 'web', 'ops', 'edu', 'data', 'gold', 'accent', 'green'].forEach((k) => { PC[k] = cssVar('--' + k); });
  Object.assign(CAT_COL, { ai: PC.ai, mule: PC.mule, infa: PC.infa, web: PC.web, mobile: PC.ops, data: PC.data, archive: PC.gold });
  Object.assign(ICON_COL, { mulesoft: PC.mule, informatica: PC.infa, claude: PC.ai });
  const light = document.documentElement.dataset.theme === 'light';
  setTheme({ ink: cssVar('--bg'), raised: cssVar('--surface'), bone: cssVar('--text'), bone2: cssVar('--text-2'), muted: cssVar('--muted'), accent: PC.accent, onAccent: cssVar('--on-accent'), aRgb: hexRgb(PC.accent), lRgb: light ? '60,64,74' : '160,166,178' });
}
function initTheme() {
  const btn = $('#theme-btn');
  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    store.set('theme', next);
    renderAll();
  });
}

/* ------------------------------------------------------------------ nav: a pipeline that fills as you scroll */
function renderNav() {
  const items = T.nav.map(([id, l]) => `<a href="#${id}" data-sec="${id}"><i></i><span>${esc(l)}</span></a>`).join('');
  const nav = $('#flow-nav');
  nav.innerHTML = `<span class="fill"></span>${items}`;
  nav.style.setProperty('--n', T.nav.length);
  $('#sheet-links').innerHTML = items;
  $$('.next[data-next]').forEach((a) => { const n = T.nav.find((x) => x[0] === a.dataset.next); a.innerHTML = `<small>${esc(T.nextSec)}</small>${esc(n[1])}<span aria-hidden="true">↓</span>`; });
  $('#theme-btn').setAttribute('aria-label', T.themeL);
  updateFlow();
}
function updateFlow() {
  const ids = T.nav.map((n) => n[0]);
  const y = scrollY + innerHeight * 0.38;
  let idx = -1, frac = 0;
  ids.forEach((id, i) => {
    const el = document.getElementById(id), top = el.offsetTop;
    if (y < top) return;
    idx = i;
    const end = i < ids.length - 1 ? document.getElementById(ids[i + 1]).offsetTop : top + el.offsetHeight;
    frac = Math.max(0, Math.min(1, (y - top) / (end - top)));
  });
  const p = idx < 0 ? 0 : Math.min(1, (idx + (idx === ids.length - 1 ? 0 : frac)) / (ids.length - 1));
  $('#flow-nav').style.setProperty('--p', p.toFixed(4));
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#nav').style.setProperty('--pp', max > 0 ? (scrollY / max).toFixed(4) : 0);
  $$('[data-sec]').forEach((a) => {
    const i = ids.indexOf(a.dataset.sec), on = i === idx;
    a.classList.toggle('on', on); a.classList.toggle('done', i < idx);
    on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
  });
}
function toggleSheet(open) {
  const sheet = $('#sheet'), btn = $('#menu-btn');
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? T.close : T.menu);
  document.body.classList.toggle('lock', open);
  if (open) { sheet.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open'))); }
  else { sheet.classList.remove('open'); sheet.hidden = true; }
}

/* ------------------------------------------------------------------ hero: the site as a flow map */
const MAP_COL = ['accent', 'mule', 'infa', 'ai', 'web', 'ops'];
function renderMap() {
  const svg = $('#sitemap'), small = innerWidth < 760;
  const W = small ? 360 : 600, H = small ? 420 : 450, C = [W / 2, H / 2];
  const nw = small ? 126 : 190, nh = small ? 46 : 62;
  const pos = small ? [[70, 48], [290, 48], [292, 210], [290, 372], [70, 372], [68, 210]] : [[118, 66], [482, 66], [500, 225], [482, 384], [118, 384], [100, 225]];
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('aria-label', T.mapHint);
  let html = '';
  T.nav.forEach(([id, label], i) => {
    const [x, y] = pos[i], col = PC[MAP_COL[i]];
    const mx = (C[0] + x) / 2, my = (C[1] + y) / 2, bend = (i % 2 ? 1 : -1) * (small ? 14 : 22);
    const d = `M${C[0]},${C[1]} Q${mx + (y === C[1] ? 0 : bend)},${my + (y === C[1] ? bend : 0)} ${x},${y}`;
    const x0 = x - nw / 2, y0 = y - nh / 2;
    html += `<g class="sm-g" style="--c:${col}"><path class="sm-edge" d="${d}"/>${REDUCED ? '' : `<circle r="3.5" class="sm-pkt"><animateMotion dur="${2.4 + i * 0.25}s" begin="${-i * 0.6}s" repeatCount="indefinite" path="${d}"/></circle>`}
      <a class="sm-node" href="#${id}" aria-label="${esc(label)}: ${esc(T.mapNodes[id])}"><rect x="${x0}" y="${y0}" width="${nw}" height="${nh}" rx="14"/><rect class="bar" x="${x0 + 10}" y="${y0 + 12}" width="4" height="${nh - 24}" rx="2"/>
        <text class="t" x="${x0 + 24}" y="${small ? y + 5 : y0 + 26}">${esc(label)}</text>${small ? '' : `<text class="s" x="${x0 + 24}" y="${y0 + 45}">${esc(T.mapNodes[id])}</text>`}
        <text class="go" x="${x0 + nw - 24}" y="${y + 5}">→</text></a></g>`;
  });
  html += `<g class="sm-core"><circle class="ring" cx="${C[0]}" cy="${C[1]}" r="${small ? 26 : 32}"/><circle class="c" cx="${C[0]}" cy="${C[1]}" r="${small ? 26 : 32}"/><text x="${C[0]}" y="${C[1] + 6}" text-anchor="middle">AE</text></g>`;
  svg.innerHTML = html;
}
const KPI_META = [
  ['mule', 'M4 7h16M4 12h16M4 17h10', [8, 14, 12, 22, 30, 42, 60, 78, 96, 120]],
  ['infa', 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', [10, 22, 30, 52, 70, 88, 104, 118, 130, 140]],
  ['ai', 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z', [0, 1, 2, 4, 6, 9, 14, 19, 25, 30]],
  ['web', 'M12 3a9 9 0 100 18 9 9 0 000-18zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3', [12, 20, 26, 34, 41, 50, 58, 66, 74, 80]],
];
function spark(vals, col, id) {
  const max = Math.max(...vals), W = 96, H = 36;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 3 - (v / max) * (H - 6)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="sg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".3"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${W},${H} L0,${H} Z" fill="url(#sg${id})"/><path class="sp-line" d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" pathLength="1"/></svg>`;
}
let kpiDone = false;
function renderHero() {
  renderMap();
  const box = $('#kpis');
  box.innerHTML = T.kpis.map(([n, sfx, l, d], i) => { const [ck, ic, vals] = KPI_META[i], col = PC[ck]; return `<article class="card kpi rv" style="--c:${col};--d:${i * 0.07}s">
      <div class="kpi-top"><span class="kpi-ic"><svg viewBox="0 0 24 24"><path d="${ic}"/></svg></span><span class="kpi-d">${esc(d)}</span></div>
      <div class="kpi-row"><b class="kpi-v"><span data-n="${n}">${kpiDone || REDUCED ? n : 0}</span>${sfx ? `<sup>${sfx}</sup>` : ''}</b>${spark(vals, col, i)}</div>
      <p class="kpi-l">${esc(l)}</p></article>`; }).join('');
  if (kpiDone || REDUCED) { box.classList.add('go'); return; }
  onView(box, () => {
    kpiDone = true; box.classList.add('go');
    $$('[data-n]', box).forEach((el, i) => {
      const target = +el.dataset.n, t0 = performance.now() + i * 90;
      const st = (now) => { const k = Math.max(0, Math.min(1, (now - t0) / 1400)); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(st); };
      requestAnimationFrame(st);
    });
  }, 0.2);
}

/* ------------------------------------------------------------------ about */
function renderAbout() {
  $('#facts').innerHTML = T.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#pipeline').innerHTML = `<div class="pl-end">${esc(T.pipeIn)}</div><i class="pl-arrow"></i>`
    + T.pillars.map((p, i) => { const k = PILLAR_KEYS[i]; return `<div class="pl-step" style="--c:${PC[k]}"><div class="top"><span class="pl-ic">${icon(EXPERTISE[k].icon)}</span><span><b>${esc(p.k)}</b><small>${esc(p.p)}</small></span></div><p>${esc(p.t)}</p></div><i class="pl-arrow"></i>`; }).join('')
    + `<div class="pl-end out">${esc(T.pipeOut)}</div>`;
  renderRadar();
}
function renderRadar() {
  const svg = $('#radar'); svg.innerHTML = '';
  const cx = 200, cy = 185, R = 120, A = T.attrs, n = A.length;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  [0.25, 0.5, 0.75, 1].forEach((k) => svgEl('polygon', { points: A.map((_, i) => pt(i, R * k).join(',')).join(' '), class: 'rd-grid' }, svg));
  A.forEach((_, i) => { const [x, y] = pt(i, R); svgEl('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'rd-axis' }, svg); });
  svgEl('polygon', { points: A.map(([, v], i) => pt(i, (R * v) / 100).join(',')).join(' '), class: 'rd-shape' }, svg);
  A.forEach(([l, v], i) => {
    const [x, y] = pt(i, (R * v) / 100); svgEl('circle', { cx: x, cy: y, r: 4.5, class: 'rd-dot' }, svg);
    const [lx, ly] = pt(i, R + 26);
    const anchor = Math.abs(lx - cx) < 10 ? 'middle' : lx > cx ? 'start' : 'end';
    const t = svgEl('text', { x: lx, y: ly, 'text-anchor': anchor, class: 'rd-lab' }, svg); t.textContent = l;
    const vt = svgEl('text', { x: lx, y: ly + 16, 'text-anchor': anchor, class: 'rd-val' }, svg); vt.textContent = v;
  });
  svg.setAttribute('aria-label', A.map(([l, v]) => `${l} ${v}`).join(', '));
  svg.parentElement.classList.remove('go');
  onView(svg, () => svg.parentElement.classList.add('go'), 0.35);
}

/* ------------------------------------------------------------------ mission briefing */
let compareState = 'before', compareAuto = false;
function renderCompare() {
  const seg = $('#compare-seg');
  seg.innerHTML = `<button role="tab" type="button" data-s="before">${esc(T.toggleBefore)}</button><button role="tab" type="button" data-s="after">${esc(T.toggleAfter)}</button>`;
  seg.onclick = (e) => { const b = e.target.closest('button'); if (b) { compareAuto = true; setCompare(b.dataset.s); } };
  const svg = $('#compare-svg'); svg.innerHTML = '';
  svg.setAttribute('aria-label', `${T.toggleBefore} / ${T.toggleAfter}`);
  const C = [320, 170];
  const P = [[320, 40], [520, 100], [520, 245], [320, 300], [120, 245], [120, 100]];
  const gMess = svgEl('g', { id: 'cmp-mess' }, svg);
  [[0, 2], [0, 3], [0, 4], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 5], [0, 1], [3, 4]].forEach(([a, b], k) => {
    const [x1, y1] = P[a], [x2, y2] = P[b];
    const bend = (k % 2 ? 1 : -1) * 26;
    svgEl('path', { d: `M${x1},${y1} Q${(x1 + x2) / 2 + bend},${(y1 + y2) / 2 - bend} ${x2},${y2}`, class: 'cmp-mess' }, gMess);
  });
  const warnTxt = lang === 'fr' ? ['ressaisie', 'copie divergente', 'erreur'] : ['re-typed', 'out of sync', 'error'];
  [[230, 128], [420, 212], [404, 120]].forEach(([x, y], i) => { const t = svgEl('text', { x, y, class: 'cmp-warn', 'text-anchor': 'middle' }, gMess); t.textContent = '⚠ ' + warnTxt[i]; });
  const gLinks = svgEl('g', { id: 'cmp-links' }, svg);
  P.forEach(([x, y], i) => {
    svgEl('path', { d: `M${x},${y} L${C[0]},${C[1]}`, id: `cl${i}`, class: 'cmp-link' }, gLinks);
    if (!REDUCED) {
      const d = svgEl('circle', { r: 3.5, class: 'cmp-dot' }, gLinks);
      const am = svgEl('animateMotion', { dur: '2.2s', begin: `-${(i * 0.37).toFixed(2)}s`, repeatCount: 'indefinite', keyPoints: i % 2 ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear' }, d);
      svgEl('mpath', { href: `#cl${i}` }, am);
    }
  });
  const hub = svgEl('g', { class: 'cmp-hub', id: 'cmp-hub' }, svg);
  svgEl('rect', { x: C[0] - 70, y: C[1] - 22, width: 140, height: 44, rx: 22 }, hub);
  const ht = svgEl('text', { x: C[0], y: C[1] + 5, 'text-anchor': 'middle' }, hub); ht.textContent = T.hubLabel;
  P.forEach(([x, y], i) => {
    const g = svgEl('g', { class: 'cmp-app' }, svg);
    svgEl('circle', { cx: x, cy: y, r: 34 }, g);
    const t = svgEl('text', { x, y: y + 5, 'text-anchor': 'middle' }, g); t.textContent = HUB_APPS[lang][i];
  });
  setCompare(compareState);
  if (!compareAuto && !REDUCED) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => { if (!compareAuto) { compareAuto = true; setCompare('after'); } }, 1800); } }, { threshold: 0.6 });
    io.observe(svg);
  }
}
function setCompare(s) {
  compareState = s;
  $$('#compare-seg button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.s === s)));
  const after = s === 'after';
  $('#cmp-mess').style.opacity = after ? 0 : 1;
  $('#cmp-links').style.opacity = after ? 1 : 0;
  const hub = $('#cmp-hub'); hub.style.opacity = after ? 1 : 0; hub.style.transform = after ? 'scale(1)' : 'scale(.6)';
  $('#compare-cap').textContent = after ? T.afterCaption : T.beforeCaption;
}
let teamIdx = 0, teamTimers = [];
function renderTeams() {
  const seg = $('#team-seg');
  seg.innerHTML = T.teams.map((t, i) => `<button role="tab" type="button" data-i="${i}">${esc(t.label)}</button>`).join('');
  seg.setAttribute('aria-label', T.teamPick);
  seg.onclick = (e) => { const b = e.target.closest('button'); if (b) showTeam(+b.dataset.i); };
  showTeam(teamIdx, true);
}
function showTeam(i, quiet) {
  teamIdx = i;
  teamTimers.forEach(clearTimeout); teamTimers = [];
  const t = T.teams[i];
  $$('#team-seg button').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  const board = $('#team-board');
  const res = t.id === 'mgmt' ? T.teamResultMgmt(t.to.length) : T.teamResult(t.to.length);
  board.innerHTML = `<canvas class="team-fx" aria-hidden="true"></canvas><div class="tb-from"><span>${t.id === 'mgmt' ? '⟵' : '⟶'}</span><b>${esc(t.from)}</b></div>
    <div class="tb-to">${t.to.map((x) => `<div class="tb-item"><i>✓</i><span>${esc(x)}</span></div>`).join('')}<p class="tb-res">${esc(res)}</p></div>`;
  if (teamCtl) teamCtl.destroy();
  teamCtl = teamFlow($('.team-fx', board), board, PC.green);
  const items = $$('.tb-item, .tb-res', board);
  if (REDUCED) { items.forEach((el) => el.classList.add('in')); return; }
  const run = () => items.forEach((el, k) => teamTimers.push(setTimeout(() => el.classList.add('in'), 100 + k * 110)));
  if (quiet) { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 }); io.observe(board); }
  else run();
}

/* ------------------------------------------------------------------ worlds */
let xKey = 'mule', xDom = null, aiFlow = 0, aiTimers = [];
const xName = (k) => (k === 'ai' ? (lang === 'fr' ? 'IA' : 'AI') : EXPERTISE[k].name);
function renderXTabs() {
  const tabs = $('#xtabs');
  tabs.innerHTML = Object.entries(EXPERTISE).map(([k, x]) => `<button role="tab" type="button" class="wtab" data-x="${k}" id="tab-${k}" aria-controls="xpanel" style="--c:${PC[k]}">
      <span class="wt-ic">${icon(x.icon)}</span><span><b translate="no">${esc(xName(k))}</b><small>${esc(x[lang].tab)}</small><em>${esc(T.since[k])}</em></span></button>`).join('');
  tabs.onclick = (e) => { const b = e.target.closest('button'); if (b && b.dataset.x !== xKey) { xKey = b.dataset.x; xDom = null; renderX(true); } };
  tabs.onkeydown = (e) => {
    const keys = Object.keys(EXPERTISE), i = keys.indexOf(xKey);
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
    e.preventDefault(); xKey = keys[(i + d + keys.length) % keys.length]; xDom = null; renderX(true); $(`#tab-${xKey}`).focus();
  };
  renderX();
}
function renderX(swap) {
  $$('#xtabs button').forEach((b) => { const on = b.dataset.x === xKey; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  const X = EXPERTISE[xKey], L = X[lang], C = X2[lang];
  const panel = $('#xpanel');
  panel.style.setProperty('--c', PC[xKey]);
  panel.setAttribute('aria-labelledby', `tab-${xKey}`);
  if (swap) { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }
  const pillar = T.pillars[PILLAR_KEYS.indexOf(xKey)];
  let body = '';
  if (xKey === 'ai') {
    body = `<article class="panel"><div class="ph-row"><h3 class="ph">${esc(C.walk)} · MDM Beam</h3></div><div class="ai-box">
      <div class="seg" role="tablist" id="ai-seg">${L.flows.map((f, i) => `<button role="tab" type="button" data-i="${i}">${esc(i ? T.aiSmart : T.aiFast)}</button>`).join('')}</div>
      <div class="ai-q"><p class="bubble" id="ai-q"></p></div>
      <ol class="ai-steps" id="ai-steps"></ol>
      <div class="ai-a" id="ai-a" aria-live="polite"></div></div></article>`;
  } else {
    const cons = X.consumers[lang];
    body = `<article class="panel"><div class="ph-row"><h3 class="ph">${esc(C.arch)}</h3><span class="hint-s">👆 ${esc(T.tapDomain)}</span></div>
      <div class="arch-grid">
        <canvas class="arch-fx" aria-hidden="true"></canvas>
        <div class="arch-col"><h4>${esc(L.cols[0])}</h4><div class="chips">${X.systems.map((s) => `<span class="chip" data-s="${esc(s)}" translate="no">${esc(s)}</span>`).join('')}</div></div>
        <div class="pipe"><span>${esc(L.links[0])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[1])}</h4><div class="doms">${X.domains.map((d) => `<button type="button" class="dom" data-d="${d.id}" aria-pressed="false">${esc(d[lang][0])}</button>`).join('')}</div></div>
        <div class="pipe"><span>${esc(L.links[1])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[2])}</h4><div class="cons">${cons.map((c, i) => `<div class="con" data-c="${i}">${esc(c)}</div>`).join('')}</div></div>
      </div>
      <div class="arch-detail" id="arch-detail" aria-live="polite"></div></article>`;
    if (xKey === 'mule') {
      body += `<article class="panel"><div class="cut-box"><div><h4>${esc(C.cutTitle)}</h4><p>${esc(C.cutText)}</p>
        <label class="cut"><span>${esc(C.cutLabel)}</span><input type="range" min="0" max="100" value="0" id="cut" aria-label="${esc(C.cutLabel)}"><b id="cut-v">0%</b></label>
        <p class="cut-meta" id="cut-meta">${esc(C.cutMeta(0))} · ${esc(C.cutLive)}</p></div><canvas id="cut-fx" aria-hidden="true"></canvas></div></article>`;
    }
  }
  panel.innerHTML = `<div class="x-top">
      <article class="panel plain-box"><span class="tag" style="--c:${PC.green}">${esc(T.plainLabel)}</span><p>${esc(pillar.t)}</p></article>
      <article class="panel x-intro"><span class="tag">${esc(T.techLabel)}</span><h3>${esc(L.title)}</h3><p>${esc(L.text)}</p></article>
    </div>${body}
    <div class="x-cols">
      <article class="panel"><div class="ph-row"><h3 class="ph">${esc(T.results)}</h3></div><ul class="res">${L.results.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('')}</ul></article>
      <article class="panel chart" id="x-chart"></article>
    </div>
    <article class="panel"><div class="ph-row"><h3 class="ph">${esc(T.skills)}</h3><span class="hint-s">${X.skills.length}</span></div>
      <div class="skills">${X.skills.map((s) => `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>`).join('')}</div></article>`;
  renderChart();
  [archCtl, cutCtl, ddCtl].forEach((c) => c && c.destroy()); archCtl = cutCtl = ddCtl = null;
  if (xKey === 'ai') {
    $('#ai-seg').onclick = (e) => { const b = e.target.closest('button'); if (b) playAI(+b.dataset.i); };
    playAI(aiFlow, true);
  } else {
    $$('.dom', panel).forEach((b) => b.addEventListener('click', () => { xDom = xDom === b.dataset.d ? null : b.dataset.d; applyDom(); }));
    applyDom();
    const grid = $('.arch-grid', panel);
    archCtl = archFlow($('.arch-fx', panel), grid, () => ({
      domains: X.domains, color: PC[xKey], selected: () => xDom,
      sysEls: Object.fromEntries($$('.chip', grid).map((e) => [e.dataset.s, e])),
      domEls: Object.fromEntries($$('.dom', grid).map((e) => [e.dataset.d, e])),
      conEls: Object.fromEntries($$('.con', grid).map((e) => [+e.dataset.c, e])),
    }));
    if (xKey === 'mule') {
      cutCtl = cutover($('#cut-fx'), $('#cut'), (k) => {
        if (!$('#cut-v')) return;
        $('#cut-v').textContent = `${Math.round(k * 100)}%`;
        $('#cut-meta').textContent = `${C.cutMeta(Math.round(k * 40))} · ${k >= 1 ? C.cutDone : C.cutLive}`;
      }, C.cutNodes);
    }
  }
}
function renderChart() {
  const host = $('#x-chart'), C = X2[lang];
  if (xKey === 'mule') { host.innerHTML = `<h5>${esc(C.muleChart)}</h5><div></div>`; barChart(host.lastElementChild, C.muleBars, PC.mule); }
  else if (xKey === 'infa') {
    host.innerHTML = `<h5>${esc(C.infaChart)}</h5><div></div>`;
    donutChart(host.lastElementChild, [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v, [PC.infa, PC.gold, PC.mule, PC.ai, PC.edu][i]]), C.infaTotal);
  } else { host.innerHTML = `<h5>${esc(C.aiChart)}</h5><div></div>`; barChart(host.lastElementChild, C.aiBars, PC.ai); }
}
function applyDom() {
  const X = EXPERTISE[xKey];
  const d = X.domains.find((x) => x.id === xDom);
  $$('.dom').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.d === xDom)));
  $$('.chip').forEach((c) => { const hit = d && d.sys.includes(c.dataset.s); c.classList.toggle('hit', !!hit); c.classList.toggle('dim', !!d && !hit); });
  $$('.con').forEach((c) => { const hit = d && d.use.includes(+c.dataset.c); c.classList.toggle('hit', !!hit); c.classList.toggle('dim', !!d && !hit); });
  const det = $('#arch-detail');
  const txt = d ? `<b>${esc(d[lang][0])}</b><p>${esc(d[lang][1])}</p>` : `<b>${esc(UI[lang].all)}</b><p>${esc(X[lang].text)}</p>`;
  const cons = X.consumers[lang].map((c) => c.split(' (')[0]);
  const srcs = (d ? d.sys : X.systems).slice(0, PHONE() ? 4 : 6);
  const tgts = d ? d.use.map((u) => cons[u]) : cons;
  const n = Math.max(srcs.length, tgts.length);
  det.innerHTML = `<div class="dd-t">${txt}</div><div class="dd-flow" style="height:${Math.max(200, n * 48 + 48)}px"><canvas aria-hidden="true"></canvas></div>`;
  if (ddCtl) ddCtl.destroy();
  ddCtl = heroFlow($('.dd-flow canvas', det), { sources: srcs, targets: tgts, hub: [xKey === 'mule' ? 'API' : 'MDM'], compact: true });
}
function playAI(i, waitVisible) {
  aiFlow = i;
  aiTimers.forEach(clearTimeout); aiTimers = [];
  const f = EXPERTISE.ai[lang].flows[i];
  $$('#ai-seg button').forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  $('#ai-q').textContent = f.q;
  const ol = $('#ai-steps');
  ol.innerHTML = f.steps.map((s) => `<li>${esc(s)}</li>`).join('');
  const a = $('#ai-a');
  a.classList.remove('in');
  a.innerHTML = `${esc(f.a)}<small>${esc(f.meta)}</small>`;
  const lis = $$('li', ol);
  const run = () => {
    if (REDUCED) { lis.forEach((l) => l.classList.add('on')); a.classList.add('in'); return; }
    lis.forEach((l, k) => aiTimers.push(setTimeout(() => l.classList.add('on'), 150 + k * 260)));
    aiTimers.push(setTimeout(() => a.classList.add('in'), 250 + lis.length * 260));
  };
  if (waitVisible) { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.3 }); io.observe(ol); } else run();
}

let showTip = () => {};
/* ------------------------------------------------------------------ skill tooltip */
function initTip() {
  const tip = $('#tip');
  let cur = null;
  const close = () => { if (cur) cur.setAttribute('aria-expanded', 'false'); cur = null; tip.hidden = true; };
  showTip = (name, b, px, py) => {
    const info = skillInfo(name, lang);
    if (!info) return;
    close();
    if (b) { cur = b; b.setAttribute('aria-expanded', 'true'); }
    $('#tip-t').textContent = name;
    $('#tip-what').textContent = info[0];
    $('#tip-wl').textContent = T.whereUsed;
    $('#tip-where').textContent = info[1];
    tip.hidden = false;
    if (innerWidth > 760) {
      const r = b ? b.getBoundingClientRect() : { left: px, right: px, top: py, bottom: py, width: 0 };
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = `${Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)}px`;
      tip.style.top = `${r.bottom + 10 + h > innerHeight - 12 ? r.top - h - 10 : r.bottom + 10}px`;
    }
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-skill]');
    if (!b) { if (!tip.contains(e.target)) close(); return; }
    if (cur === b) { close(); return; }
    showTip(b.dataset.skill, b);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  addEventListener('scroll', () => { if (!tip.hidden && innerWidth > 760) close(); }, { passive: true });
  $('#case').addEventListener('scroll', close, { passive: true, capture: true });
}

const SCH_LBL = {
  en: { mule: 'System → Process → Experience APIs', infa: 'Many records → one golden record', ai: 'Question → governed tools → answer', mobile: 'Vehicle data → dashboard', web: 'Interface · product', data: 'Raw data → insight', archive: 'Early experiment' },
  fr: { mule: 'API système → process → expérience', infa: 'Des fiches multiples → un golden record', ai: 'Question → outils gouvernés → réponse', mobile: 'Données véhicule → tableau de bord', web: 'Interface · produit', data: 'Données brutes → indicateurs', archive: 'Premières expériences' },
};
function dot(path, dur = 3.2, delay = 0) {
  if (REDUCED) return '';
  return `<circle r="3.2" class="sc-a"><animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${path}" calcMode="spline" keyTimes="0;1" keySplines=".45 0 .25 1"/></circle>`;
}
function schematic(cat) {
  const box = (x, y, w, h, cls = 'sc-b') => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" class="${cls}"/>`;
  let g = '';
  if (cat === 'mule') {
    const E = [70, 150, 230], P = [110, 190], S = [44, 104, 164, 230];
    const yE = 58, yP = 112, yS = 166;
    S.forEach((x, i) => { const p = P[i < 2 ? 0 : 1]; g += `<path class="sc-l${i === 2 ? ' hi' : ''}" d="M${x},${yS - 10} C${x},${yS - 30} ${p},${yP + 30} ${p},${yP + 10}"/>`; });
    P.forEach((p, i) => E.forEach((e, j) => { if (Math.abs(p - e) < 100) g += `<path class="sc-l${i === 1 && j === 2 ? ' hi' : ''}" d="M${p},${yP - 10} C${p},${yP - 30} ${e},${yE + 30} ${e},${yE + 10}"/>`; }));
    const lab = (x, y, t) => `<text x="${x}" y="${y + 3}" class="sc-t" text-anchor="middle">${t}</text>`;
    E.forEach((x, i) => { g += box(x, yE, 56, 20) + lab(x, yE, ['APPS', 'PARTNERS', 'AI'][i]); });
    P.forEach((x, i) => { g += box(x, yP, 60, 20) + lab(x, yP, ['HR', 'FINANCE'][i]); });
    S.forEach((x, i) => { g += box(x, yS, 50, 20) + lab(x, yS, ['SAP', 'SFDC', 'MDM', 'PAYROLL'][i]); });
    g += `<text x="300" y="${yE + 3}" class="sc-t" text-anchor="end" opacity=".6">EXP</text><text x="300" y="${yP + 3}" class="sc-t" text-anchor="end" opacity=".6">PRC</text><text x="300" y="${yS + 3}" class="sc-t" text-anchor="end" opacity=".6">SYS</text>`;
    g += dot(`M164,156 C164,136 190,142 190,122 L190,102 C190,82 230,98 230,68`, 2.6);
  } else if (cat === 'infa') {
    const ys = [40, 66, 92, 128, 154, 180];
    ys.forEach((y, i) => { const w = [64, 52, 70, 58, 66, 48][i]; g += `<path class="sc-l${i === 2 ? ' hi' : ''}" d="M${30 + w},${y} C150,${y} 160,110 196,110"/>`; g += box(30 + w / 2, y, w, 14); });
    g += `<circle cx="222" cy="110" r="26" class="sc-b"/><circle cx="222" cy="110" r="34" class="sc-d"/><circle cx="222" cy="110" r="5" class="sc-a"/>`;
    [70, 110, 150].forEach((y) => { g += `<path class="sc-l" d="M248,110 C270,110 270,${y} 292,${y}"/><circle cx="296" cy="${y}" r="3" class="sc-f"/>`; });
    g += dot('M100,92 C150,92 160,110 196,110', 2.2);
  } else if (cat === 'ai') {
    g += `${box(92, 46, 132, 26)}<rect x="34" y="42" width="78" height="2" class="sc-f" opacity=".5"/><rect x="34" y="48" width="50" height="2" class="sc-f" opacity=".3"/>`;
    g += `<path class="sc-l hi" d="M158,46 C200,46 160,108 160,108"/><circle cx="160" cy="112" r="14" class="sc-b"/><circle cx="160" cy="112" r="4" class="sc-a"/>`;
    [[80, 168], [160, 176], [240, 168]].forEach(([x, y], i) => { g += `<path class="sc-l${i === 1 ? ' hi' : ''}" d="M160,126 C160,150 ${x},${y - 30} ${x},${y - 10}"/>${box(x, y, 50, 18)}<text x="${x}" y="${y + 3}" class="sc-t" text-anchor="middle">MCP</text>`; });
    g += `<path class="sc-l" d="M174,112 C230,112 230,80 250,80"/>${box(272, 78, 76, 26)}<rect x="244" y="74" width="50" height="2" class="sc-f" opacity=".5"/><rect x="244" y="80" width="34" height="2" class="sc-f" opacity=".3"/>`;
    g += dot('M158,46 C200,46 160,98 160,98 L160,126 C160,150 160,146 160,166', 2.4);
  } else if (cat === 'mobile') {
    g += `<rect x="40" y="40" width="240" height="140" rx="4" class="sc-b"/><path class="sc-l" d="M70,150 A60,60 0 0 1 190,150"/><path class="sc-l hi" d="M70,150 A60,60 0 0 1 150,95"/>`;
    g += `<g><line x1="130" y1="150" x2="130" y2="104" stroke="${THEME.accent}" stroke-width="1.5">${REDUCED ? '' : '<animateTransform attributeName="transform" type="rotate" values="-60 130 150;40 130 150;-10 130 150;-60 130 150" dur="5s" repeatCount="indefinite"/>'}</line></g><circle cx="130" cy="150" r="4" class="sc-f"/>`;
    [0, 1, 2, 3].forEach((i) => { g += `<rect x="${212 + i * 14}" y="${150 - [40, 60, 30, 50][i]}" width="7" height="${[40, 60, 30, 50][i]}" class="sc-f" opacity="${i === 1 ? 1 : 0.35}"/>`; });
    g += `<text x="52" y="58" class="sc-t">EV · 72%</text>`;
  } else if (cat === 'web') {
    g += `<rect x="40" y="34" width="240" height="152" class="sc-b"/><line x1="40" y1="52" x2="280" y2="52" class="sc-l"/>`;
    [0, 1, 2].forEach((i) => { g += `<circle cx="${52 + i * 9}" cy="43" r="2" class="sc-f" opacity=".4"/>`; });
    g += `<rect x="56" y="70" width="110" height="10" class="sc-f" opacity=".85"/><rect x="56" y="88" width="80" height="6" class="sc-f" opacity=".3"/><rect x="56" y="104" width="44" height="14" class="sc-a"/>`;
    g += `<rect x="184" y="68" width="80" height="62" class="sc-b"/><path class="sc-l" d="M184,130 L210,104 L228,118 L264,86"/>`;
    [0, 1, 2].forEach((i) => { g += `<rect x="${56 + i * 72}" y="146" width="64" height="26" class="sc-b"/>`; });
    g += dot('M90,160 C130,150 180,120 224,96 C250,82 240,60 224,111', 4);
  } else if (cat === 'data') {
    const hs = [50, 80, 64, 110, 92, 128];
    hs.forEach((h, i) => { g += `<rect x="${56 + i * 38}" y="${180 - h}" width="18" height="${h}" class="sc-f" opacity="${i === 5 ? 1 : 0.22}"/>`; });
    const pts = hs.map((h, i) => `${65 + i * 38},${170 - h - 10}`).join(' L');
    g += `<path class="sc-l hi" d="M${pts}"/><line x1="40" y1="180" x2="290" y2="180" class="sc-l"/>`;
    g += dot(`M${pts}`, 3.6);
  } else {
    const hex = (r) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i - Math.PI / 6; return `${160 + r * Math.cos(a)},${110 + r * Math.sin(a)}`; }).join(' ');
    g += `<polygon points="${hex(70)}" class="sc-b"/><polygon points="${hex(44)}" class="sc-d" fill="none"/><circle cx="160" cy="110" r="4" class="sc-a"/>`;
    g += dot(`M${hex(70).split(' ').join(' L')} Z`, 6);
  }
  return `<svg viewBox="0 0 320 220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${g}</svg><span class="lbl">${esc(SCH_LBL[lang][cat] || '')}</span>`;
}

/* ------------------------------------------------------------------ skills: link graph skills ↔ projects */
const yearsSince = (ym) => { const [y, m] = ym.split('-').map(Number); return (Date.now() - new Date(y, m - 1, 1)) / 31557600000; };
const ALIAS = { MuleSoft: 'Anypoint Platform', RTF: 'Runtime Fabric', 'API-led': 'API-led connectivity', 'Informatica MDM': 'Business 360', 'Next.js 15': 'Next.js', 'Azure AD': 'Entra ID', 'IDMC REST API': 'IDMC' };
const SKILL_DOM = {};
Object.entries(TREE).forEach(([k, tiers]) => tiers.flat().forEach((s) => { SKILL_DOM[s] = k; }));
const PROJ_SKILLS = PROJECTS.map((p) => [...new Set(p.stack.map((s) => ALIAS[s] || s).filter((s) => SKILL_DOM[s]))]);
let gSel = { type: 'skill', id: 'Mule 4' }, gDom = 'mule', gRO = null;
function renderSkills() {
  barChart($('#years'), T.yearsRows.map(([l, d]) => [l, Math.round(yearsSince(d) * 10) / 10, T.yearsUnit]), PC.accent);
  const ycols = [PC.mule, PC.ai, PC.infa, PC.web];
  $$('#years .bar-track i').forEach((i, k) => i.style.setProperty('--c', ycols[k]));
  donutChart($('#skill-donut'), T.branches.map(([k, name]) => [name, TREE[k].flat().length, PC[k]]), T.donutTotal);
  const g = $('#graph');
  g.innerHTML = `<svg aria-hidden="true"></svg>
    <div class="g-col"><h4>${esc(T.skillsCol)}</h4>${T.branches.map(([k, name, sub]) => `<section class="g-dom${k === gDom ? ' sel' : ''}" data-b="${k}" style="--c:${PC[k]}"><h5><i></i>${esc(name)}<small>${esc(sub)}</small></h5>
      <div class="g-chips">${TREE[k].flat().map((s) => `<button type="button" class="g-skill" data-s="${esc(s)}" aria-pressed="false" translate="no">${esc(s)}</button>`).join('')}</div></section>`).join('')}</div>
    <div class="g-gap"></div>
    <div class="g-col g-pcol"><h4>${esc(T.projectsCol)}</h4><div class="g-projs">${PROJECTS.map((p, i) => `<button type="button" class="g-proj" data-g="${i}" aria-pressed="false" style="--c:${CAT_COL[p.cats[0]]}"><i></i>${esc(p[lang].title)}</button>`).join('')}</div></div>`;
  const seg = $('#graph-seg');
  seg.innerHTML = T.branches.map(([k, name]) => `<button role="tab" type="button" data-b="${k}" aria-selected="${k === gDom}">${esc(name)}</button>`).join('');
  seg.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    gDom = b.dataset.b;
    $$('button', seg).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $$('.g-dom', g).forEach((d) => d.classList.toggle('sel', d.dataset.b === gDom));
    selectGraph('skill', TREE[gDom][0][0]);
  };
  const pick = (e) => {
    const s = e.target.closest('.g-skill'), p = e.target.closest('.g-proj');
    if (s) selectGraph('skill', s.dataset.s); else if (p) selectGraph('proj', +p.dataset.g);
  };
  g.onclick = pick;
  g.onpointerover = (e) => { if (e.pointerType === 'mouse') pick(e); };
  g.onfocusin = pick;
  $('#graph-info').onclick = (e) => { const b = e.target.closest('[data-open]'); if (b) openCase(+b.dataset.open, b); };
  if (gRO) gRO.disconnect();
  gRO = new ResizeObserver(() => drawLinks()); gRO.observe(g);
  selectGraph(gSel.type, gSel.id);
}
function selectGraph(type, id) {
  if (gSel.type === type && gSel.id === id && $('#graph').classList.contains('sel')) return;
  gSel = { type, id };
  const g = $('#graph'); g.classList.add('sel');
  const skills = type === 'skill' ? [id] : PROJ_SKILLS[id];
  const projs = type === 'skill' ? PROJECTS.map((_, i) => i).filter((i) => PROJ_SKILLS[i].includes(id)) : [id];
  $$('.g-skill', g).forEach((b) => { const on = skills.includes(b.dataset.s); b.setAttribute('aria-pressed', String(type === 'skill' && on)); b.classList.toggle('hit', type === 'proj' && on); });
  $$('.g-proj', g).forEach((b) => { const on = projs.includes(+b.dataset.g); b.setAttribute('aria-pressed', String(type === 'proj' && on)); b.classList.toggle('hit', type === 'skill' && on); });
  const info = $('#graph-info');
  if (type === 'skill') {
    const i = skillInfo(id, lang) || ['', ''];
    info.innerHTML = `<div class="gi-t" style="--c:${PC[SKILL_DOM[id]]}"><b>${esc(id)}</b> · ${esc(i[0])}<em>${esc(i[1])}</em></div>
      <div class="gi-p">${projs.length ? `<small>${esc(T.usedIn)}</small>${projs.map((p) => `<button type="button" class="gi-btn" data-open="${p}">${esc(PROJECTS[p][lang].title)}</button>`).join('')}` : `<small>${esc(T.everyday)}</small>`}</div>`;
  } else {
    const p = PROJECTS[id];
    info.innerHTML = `<div class="gi-t" style="--c:${CAT_COL[p.cats[0]]}"><b>${esc(p[lang].title)}</b> · ${esc(p[lang].kicker)}<em>${esc(skills.join(' · '))}</em></div>
      <div class="gi-p"><button type="button" class="gi-btn" data-open="${id}">${esc(T.viewProject)} →</button></div>`;
  }
  drawLinks();
}
function drawLinks() {
  const g = $('#graph'), svg = $('svg', g);
  if (!svg) return;
  svg.innerHTML = '';
  if (getComputedStyle(svg).display === 'none') return;
  const R = g.getBoundingClientRect();
  const skills = gSel.type === 'skill' ? [gSel.id] : PROJ_SKILLS[gSel.id];
  const projs = gSel.type === 'skill' ? PROJECTS.map((_, i) => i).filter((i) => PROJ_SKILLS[i].includes(gSel.id)) : [gSel.id];
  skills.forEach((s) => {
    const se = $(`.g-skill[data-s="${CSS.escape(s)}"]`, g); if (!se) return;
    const a = se.getBoundingClientRect();
    projs.forEach((p) => {
      const b = $(`.g-proj[data-g="${p}"]`, g).getBoundingClientRect();
      const x1 = a.right - R.left, y1 = a.top + a.height / 2 - R.top, x2 = b.left - R.left, y2 = b.top + b.height / 2 - R.top;
      const dx = Math.max(60, (x2 - x1) * 0.5);
      const path = svgEl('path', { d: `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`, class: 'g-link' }, svg);
      path.style.setProperty('--c', PC[SKILL_DOM[s]]);
      path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
    });
  });
}

/* ------------------------------------------------------------------ projects */
const FEATURED = ['mule-platform', 'b360-mdm', 'mdm-beam', 'hev-dash'];
const yearOf = (p) => (lang === 'fr' && p[lang].year) || p.year;
const catTags = (p) => p.cats.map((c) => `<span class="tag" style="--c:${CAT_COL[c]}">${esc(T.filters[c])}</span>`).join('');
let filter = 'all';
function renderProjects() {
  $('#featured').innerHTML = FEATURED.map((id, k) => {
    const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i], L = p[lang];
    return `<button type="button" class="feat rv" data-p="${i}" style="--sc:${CAT_COL[p.cats[0]]};--d:${(k % 2) * 0.08}s">
      <div class="schem">${schematic(p.cats[0])}</div>
      <div class="feat-b"><div class="meta-row">${catTags(p)}<span class="yr">${esc(yearOf(p))}</span></div>
        <h4>${esc(L.title)}</h4><p class="k">${esc(L.kicker)}</p><p>${esc(L.summary)}</p><span class="go-l">${esc(T.read)} →</span></div></button>`;
  }).join('');
  renderTimeline();
  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  const fl = $('#filters');
  fl.innerHTML = Object.keys(T.filters).filter((k) => counts[k]).map((k) => `<button role="tab" type="button" data-f="${k}" aria-selected="${k === filter}">${esc(T.filters[k])}<sup>${counts[k]}</sup></button>`).join('');
  fl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('button', fl).forEach((x) => x.setAttribute('aria-selected', String(x === b))); applyFilter(true); };
  $('#tiles').innerHTML = PROJECTS.map((p, i) => {
    const L = p[lang];
    return `<li data-cats="${p.cats.join(' ')}"><button type="button" class="tile" data-p="${i}" style="--c:${CAT_COL[p.cats[0]]}">
      <span class="meta-row">${catTags(p)}<span class="yr">${esc(yearOf(p))}</span></span>
      <h4>${esc(L.title)}</h4><p>${esc(L.kicker)}</p>
      <span class="tile-f"><span class="ics">${p.icons.slice(0, 4).map(icon).join('')}</span><span class="more">${esc(T.read)} →</span></span></button></li>`;
  }).join('');
  applyFilter();
}
function renderTimeline() {
  // every project as a dot: one row per category, one column per year
  const yearKey = (p) => { const m = String(p.year).match(/\d{4}/); return m ? m[0] : 'early'; };
  const years = [...new Set(PROJECTS.map(yearKey))].sort((a, b) => (a === 'early' ? -1 : b === 'early' ? 1 : a.localeCompare(b)));
  const cats = Object.keys(T.filters).filter((c) => c !== 'all' && PROJECTS.some((p) => p.cats[0] === c));
  const host = $('#timeline');
  host.style.setProperty('--cols', years.length);
  let n = 0;
  host.innerHTML = `<span class="tl-y"></span>${years.map((y) => `<span class="tl-y">${y === 'early' ? esc(T.early) : y}</span>`).join('')}`
    + cats.map((c) => `<span class="tl-lab" style="--c:${CAT_COL[c]}"><i></i>${esc(T.filters[c])}</span>`
      + years.map((y) => `<span class="tl-cell">${PROJECTS.map((p, i) => (p.cats[0] === c && yearKey(p) === y ? `<button type="button" class="tl-dot" data-p="${i}" data-title="${esc(p[lang].title)}" aria-label="${esc(p[lang].title)}" style="--c:${CAT_COL[c]};--d:${(n++ * 0.04).toFixed(2)}s"></button>` : '')).join('')}</span>`).join('')).join('');
  const lab = $('#hover-label');
  host.onpointerover = (e) => {
    const d = e.target.closest('.tl-dot'); if (!d || e.pointerType !== 'mouse') return;
    const r = d.getBoundingClientRect();
    lab.textContent = d.dataset.title; lab.hidden = false;
    lab.style.left = `${r.left + r.width / 2}px`; lab.style.top = `${r.top}px`;
  };
  host.onpointerout = (e) => { if (e.target.closest('.tl-dot')) lab.hidden = true; };
  host.classList.remove('go');
  onView(host, () => host.classList.add('go'), 0.3);
}
function applyFilter(anim) {
  let k = 0;
  $$('#tiles li').forEach((li) => {
    const show = filter === 'all' || li.dataset.cats.split(' ').includes(filter);
    li.hidden = !show;
    li.classList.remove('pop');
    if (show && anim && !REDUCED) { void li.offsetWidth; li.style.setProperty('--d', `${k++ * 35}ms`); li.classList.add('pop'); }
  });
}
let lastFocus = null, caseIdx = -1;
function openCase(i, from) {
  if (from) lastFocus = from;
  caseIdx = i;
  const p = PROJECTS[i], L = p[lang], d = $('#case');
  const next = (i + 1) % PROJECTS.length;
  $('#case-meta').textContent = `${T.caseLabel} ${i + 1} / ${PROJECTS.length}`;
  const body = $('#case-body');
  body.style.setProperty('--sc', CAT_COL[p.cats[0]]);
  body.innerHTML = `<div class="meta-row">${catTags(p)}<span class="yr">${esc(yearOf(p))}</span></div>
    <h2 class="cb-t" id="case-title">${esc(L.title)}</h2>
    <p class="cb-k">${esc(L.kicker)}</p>
    <div class="schem">${schematic(p.cats[0])}</div>
    <div class="cb-sec"><h3>${esc(T.overview)}</h3><p>${esc(L.summary)}</p></div>
    <div class="cb-sec"><h3>${esc(T.built)}</h3><ul class="cb-pts">${L.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="cb-sec"><h3>${esc(T.stackL)}</h3><div class="skills">${p.stack.map((s) => (skillInfo(s, lang) ? `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>` : `<span class="sk" translate="no">${esc(s)}</span>`)).join('')}</div></div>
    <div class="cb-act">${p.link ? `<a class="btn primary" href="${p.link}" target="_blank" rel="noopener">${esc(p.link.includes('github.com') ? T.viewCode : T.openSite)} ↗</a>` : `<p class="cb-private">🔒 ${esc(T.privateRepo)}</p>`}</div>
    <button class="cb-next" type="button" data-next="${next}"><span><small>${esc(T.next)}</small><b>${esc(PROJECTS[next][lang].title)}</b></span><span aria-hidden="true">→</span></button>`;
  $('.x', d).setAttribute('aria-label', T.close);
  const card = $('.case-card', d);
  if (d.hidden) { d.hidden = false; document.body.classList.add('lock'); requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('open'))); }
  card.scrollTop = 0;
  card.focus({ preventScroll: true });
}
function closeCase() {
  const d = $('#case');
  if (d.hidden) return;
  d.classList.remove('open');
  document.body.classList.remove('lock');
  d.hidden = true;
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ career: one line that branches */
function fmtDate(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric' });
}
// newest first; track 0 = MuleSoft (and studies), 1 = Informatica, 2 = AI & full-stack
const BRANCH = [{ x: 0, t: 0 }, { x: 1, t: 1 }, { x: 3, t: 1 }, { x: 2, t: 2 }, { x: 4, t: 0 }, { e: 0, t: 0 }, { e: 1, t: 0 }];
const TRACK_KEY = ['mule', 'infa', 'ai'];
const openSteps = new Set([0]);
let bRO = null, bRaf = 0;
function renderCareer() {
  $('#track-legend').innerHTML = T.tracks.map((t, i) => `<span style="--c:${PC[TRACK_KEY[i]]}"><i></i>${esc(t)}</span>`).join('') + `<span style="--c:${PC.edu}"><i></i>${esc(T.studies)}</span>`;
  const host = $('#branch');
  host.innerHTML = `<svg aria-hidden="true"></svg>` + BRANCH.map((r, k) => {
    if (r.e !== undefined) {
      const e = EDUCATION[r.e];
      return `<div class="b-row" data-r="${k}" style="--c:${PC.edu}"><div class="b-head"><h4>${esc(e[lang][0])}</h4><p><span>${esc(e[lang][1])}</span><span class="b-when">${esc(e.years)}</span></p></div></div>`;
    }
    const x = EXPERIENCE[r.x], L = x[lang], org = (lang === 'fr' && x.orgFr) || x.org, open = openSteps.has(k);
    return `<div class="b-row${open ? ' open' : ''}" data-r="${k}" style="--c:${PC[TRACK_KEY[r.t]]}">
      <button type="button" class="b-head" aria-expanded="${open}" aria-controls="bm${k}"><h4>${esc(L.role)}</h4>
        <p>${icon(x.icon)}<span>${esc(org)}</span><span class="b-when">${x.to ? `${fmtDate(x.from)} – ${fmtDate(x.to)}` : `${fmtDate(x.from)} – ${esc(T.present)}`}</span>${x.to ? '' : `<span class="b-cur">${esc(T.current)}</span>`}</p>
        <span class="b-plus" aria-hidden="true">+</span></button>
      <div class="b-more" id="bm${k}"><div><p class="sum">${esc(L.sum)}</p><ul>${L.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div></div>`;
  }).join('');
  host.onclick = (e) => {
    const b = e.target.closest('button.b-head'); if (!b) return;
    const row = b.closest('.b-row'), k = +row.dataset.r, open = !row.classList.contains('open');
    row.classList.toggle('open', open); open ? openSteps.add(k) : openSteps.delete(k);
    b.setAttribute('aria-expanded', String(open));
    drawBranch();
  };
  if (bRO) bRO.disconnect();
  bRO = new ResizeObserver(() => { if (!bRaf) bRaf = requestAnimationFrame(() => { bRaf = 0; drawBranch(); }); });
  bRO.observe(host);
  drawBranch();
  $('#edu').innerHTML = EDUCATION.map((e) => `<li><span>${esc(e[lang][0])}<small>${esc(e[lang][1])}</small></span><span>${esc(e.years)}</span></li>`).join('');
  $('#langs').innerHTML = LANGUAGES[lang].map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join('');
  if (REDUCED) host.classList.add('go'); else onView(host, () => host.classList.add('go'), 0.15);
}
function drawBranch() {
  const host = $('#branch'), svg = $('svg', host); if (!svg) return;
  const rows = $$('.b-row', host);
  const y = rows.map((r) => r.offsetTop + $('.b-head', r).offsetHeight / 2);
  const X = innerWidth < 760 ? [12, 32, 52] : [16, 42, 68];
  const top = y[0], c = PC;
  const mid = (a, b, k) => a + (b - a) * k;
  const yB1 = mid(y[2], y[3], 0.6), yB2 = mid(y[3], y[4], 0.6);
  const lines = [
    [c.edu, `M${X[0]},${y[6]} L${X[0]},${y[4]}`, 0],
    [c.mule, `M${X[0]},${y[4]} L${X[0]},${top}`, 0.35],
    [c.ai, `M${X[0]},${yB2} C${X[0]},${mid(yB2, y[3], 0.55)} ${X[2]},${mid(yB2, y[3], 0.45)} ${X[2]},${y[3]} L${X[2]},${top}`, 0.7],
    [c.infa, `M${X[0]},${yB1} C${X[0]},${mid(yB1, y[2], 0.55)} ${X[1]},${mid(yB1, y[2], 0.45)} ${X[1]},${y[2]} L${X[1]},${top}`, 0.95],
  ];
  svg.innerHTML = '';
  lines.forEach(([col, d, delay]) => { const p = svgEl('path', { d, class: 'b-line' }, svg); p.style.setProperty('--c', col); p.style.setProperty('--len', Math.ceil(p.getTotalLength())); p.style.setProperty('--d', `${delay}s`); });
  BRANCH.forEach((r, k) => {
    const n = svgEl('circle', { cx: X[r.t], cy: y[k], r: 7, class: `b-node${rows[k].classList.contains('open') ? ' sel' : ''}` }, svg);
    n.style.setProperty('--c', r.e !== undefined ? c.edu : c[TRACK_KEY[r.t]]);
  });
}

/* ------------------------------------------------------------------ contact */
function initContact() {
  $('#compose').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#msg').value.trim();
    location.href = `mailto:abdelkader.elazzouzi@gmail.com?subject=${encodeURIComponent(lang === 'fr' ? 'Prise de contact via votre portfolio' : 'Hello from your portfolio')}&body=${encodeURIComponent(v)}`;
  };
}

/* ------------------------------------------------------------------ reveal + chrome */
let revealIO;
function observeReveal() {
  const els = $$('.rv:not(.in)');
  if (REDUCED || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => revealIO.observe(el));
}
function initChrome() {
  $('#menu-btn').addEventListener('click', () => toggleSheet($('#menu-btn').getAttribute('aria-expanded') !== 'true'));
  $('#sheet').addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    const id = a.getAttribute('href');
    if (!id.startsWith('#')) { toggleSheet(false); return; }
    e.preventDefault();
    toggleSheet(false);
    const t = document.querySelector(id);
    if (t) requestAnimationFrame(() => { t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); history.replaceState(null, '', id); });
  });
  // one delegated handler for every project opener
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#featured [data-p], #tiles [data-p], #timeline [data-p]');
    if (b) openCase(+b.dataset.p, b);
  });
  $('#case').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeCase(); return; }
    const n = e.target.closest('[data-next]'); if (n) openCase(+n.dataset.next);
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#case').hidden) closeCase();
    else if ($('#menu-btn').getAttribute('aria-expanded') === 'true') { toggleSheet(false); $('#menu-btn').focus(); }
  });
  $('#case').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('#case button, #case a[href]').filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; updateFlow(); }); }, { passive: true });
  let w = innerWidth;
  addEventListener('resize', () => { updateFlow(); if ((w < 760) !== (innerWidth < 760)) renderMap(); w = innerWidth; });
}

/* ------------------------------------------------------------------ go */
function renderAll() {
  T = { ...UI[lang], ...COPY[lang] };
  readPalette();
  fillText();
  renderNav();
  renderHero();
  renderAbout();
  renderCompare();
  renderTeams();
  renderSkills();
  renderXTabs();
  renderProjects();
  renderCareer();
  if (caseIdx >= 0 && !$('#case').hidden) openCase(caseIdx);
  observeReveal();
}

initChrome();
initTheme();
initTip();
initContact();
renderAll();
initLang();
