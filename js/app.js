import { UI, EXPERTISE, EXPERIENCE, EDUCATION, LANGUAGES } from './content.js';
import { COPY, TREE } from './copy.js';
import { PROJECTS } from './projects.data.js';
import { skillInfo } from './skills.js';
import { ICONS } from '../assets/icons.js';
import { heroFlow, archFlow, teamFlow, cutover, barChart, donutChart, THEME } from './fx.js';

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
const PC = { mule: '#38bdf8', infa: '#ffa53b', ai: '#a78bfa', web: '#3dffa8', ops: '#ff5fa2' };
const CAT_COL = { ai: PC.ai, mule: PC.mule, infa: PC.infa, web: PC.web, mobile: '#ff5fa2', data: '#38e1ff', archive: '#ffcf4a' };
const ICON_COL = { mulesoft: PC.mule, informatica: PC.infa, claude: PC.ai };
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
let archCtl = null, teamCtl = null, cutCtl = null, ddCtl = null, sceneCtl = null;

/* ------------------------------------------------------------------ boot */
function boot() {
  const el = $('#boot');
  let seen = false; try { seen = sessionStorage.getItem('booted') === '1'; } catch { /* ignore */ }
  if (REDUCED || seen) { el.classList.add('done'); zap(); return; }
  try { sessionStorage.setItem('booted', '1'); } catch { /* ignore */ }
  const t0 = performance.now(), D = 1100;
  let done = false;
  const finish = () => { if (done) return; done = true; el.classList.add('done'); removeEventListener('keydown', finish); el.removeEventListener('click', finish); setTimeout(zap, 250); };
  addEventListener('keydown', finish); el.addEventListener('click', finish);
  const step = (now) => {
    const k = Math.min(1, (now - t0) / D), v = Math.round(100 * (1 - Math.pow(1 - k, 2)));
    $('#boot-n').textContent = v; $('#boot-bar').style.width = v + '%';
    if (k < 1 && !done) requestAnimationFrame(step); else setTimeout(finish, 180);
  };
  requestAnimationFrame(step);
}
function zap() {
  const n = $('.hero-name');
  if (REDUCED || !n) return;
  const go = () => { n.classList.remove('zap'); void n.offsetWidth; n.classList.add('zap'); };
  go(); setInterval(() => { if (!document.hidden && scrollY < innerHeight) go(); }, 7000);
}

/* ------------------------------------------------------------------ text */
function fillText() {
  document.documentElement.lang = AUTO || lang;
  $$('[data-k]').forEach((el) => { const v = T[el.dataset.k]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-icon]').forEach((el) => { if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });
  $('#msg').placeholder = T.placeholder;
}

/* ------------------------------------------------------------------ nav */
let current = '';
function renderNav() {
  const html = T.nav.map(([id, l], i) => `<a href="#${id}" data-sec="${id}"><span class="n">${pad(i + 1)}</span>${esc(l)}</a>`).join('');
  $('#nav-links').innerHTML = html;
  $('#sheet-links').innerHTML = html;
  markNav();
}
function markNav() {
  $$('[data-sec]').forEach((a) => { const on = a.dataset.sec === current; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
  const i = T.nav.findIndex((n) => n[0] === current);
  $('#xp-l').textContent = `LVL ${i + 2}`;
}
function toggleSheet(open) {
  const sheet = $('#sheet'), btn = $('#menu-btn');
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? T.close : T.menu);
  document.body.classList.toggle('lock', open);
  if (open) { sheet.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open'))); }
  else { sheet.classList.remove('open'); sheet.hidden = true; }
}

/* ------------------------------------------------------------------ hero */
async function initUniverse() {
  if (sceneCtl) return;
  try {
    const { initScene } = await import('./scene.js');
    sceneCtl = initScene($('#universe'), { onSkill: (name, x, y) => showTip(name, null, x, y) });
  } catch (e) { console.warn('3D scene unavailable', e); }
}
let hudDone = false;
function renderHero() {
  const hud = $('#hud');
  hud.innerHTML = T.hud.map(([n, s, l]) => `<div class="hud-i"><b><span data-n="${n}">${hudDone || REDUCED ? n : 0}</span>${s ? `<sup>${s}</sup>` : ''}</b><span>${esc(l)}</span></div>`).join('');
  $('#legend').innerHTML = T.legend.map(([k, l]) => `<span class="lg" style="--c:${PC[k]}"><i></i>${esc(l)}</span>`).join('') + `<span class="hint">${esc(T.orbitHint)}</span>`;
  if (hudDone || REDUCED) return;
  hudDone = true;
  setTimeout(() => $$('[data-n]', hud).forEach((el, i) => {
    const target = +el.dataset.n, t0 = performance.now() + i * 120;
    const st = (now) => { const k = Math.max(0, Math.min(1, (now - t0) / 1400)); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(st); };
    requestAnimationFrame(st);
  }), 900);
}

/* ------------------------------------------------------------------ player */
const ACH_IC = {
  api: 'M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12', zero: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6zM9 12l2 2 4-4', agent: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
  gold: 'M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16.3 6.6 19.2l1.3-6-4.5-4 6-.6z', gate: 'M5 11V8a7 7 0 0114 0v3M4 11h16v10H4zM12 15v2', party: 'M9 11a3 3 0 100-6 3 3 0 000 6zM17 11a2.5 2.5 0 100-5M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14c3 0 6 2 6 5',
  ship: 'M5 15l7-12 7 12M8 15v4h8v-4M12 9v3', lang: 'M4 5h10M9 3v2M6 5c1 4 4 7 8 8M13 5c-1 4-4 7-8 8M14 21l4-9 4 9M15.5 18h5',
};
const ACH_COL = ['#38bdf8', '#3dffa8', '#a78bfa', '#ffa53b', '#ff5fa2', '#ffcf4a', '#38e1ff', '#9b7bff'];
function renderPlayer() {
  const yrs = (Date.now() - new Date(2022, 0, 1)) / 31557600000;
  $('#lvl-n').textContent = Math.floor(yrs);
  $('#lvl-note').textContent = T.xpNote(Math.floor(yrs));
  $('#facts').innerHTML = T.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  onView($('.lvl'), () => { $('#lvl-bar').style.width = `${Math.round((yrs % 1) * 100)}%`; });
  $('#ach').innerHTML = T.ach.map(([k, t, d], i) => `<li style="--c:${ACH_COL[i]}"><span class="ach-ic"><svg viewBox="0 0 24 24"><path d="${ACH_IC[k]}"/></svg></span><span><b>${esc(t)}</b><span>${esc(d)}</span></span></li>`).join('');
  const lis = $$('#ach li');
  onView($('#ach'), () => lis.forEach((li, i) => setTimeout(() => li.classList.add('on'), REDUCED ? 0 : 150 + i * 140)), 0.3);
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
  teamCtl = teamFlow($('.team-fx', board), board, '#3dffa8');
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
      <span class="wt-ic">${icon(x.icon)}</span><span><b translate="no">${esc(xName(k))}</b><small>${esc(x[lang].tab)}</small><em>${esc(T.since[k])}</em></span><span class="entered">▶ ON</span></button>`).join('');
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
      <article class="panel plain-box"><span class="tag" style="--c:#3dffa8">${esc(T.plainLabel)}</span><p>${esc(pillar.t)}</p></article>
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
    donutChart(host.lastElementChild, [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v, [PC.infa, '#fbbf24', PC.mule, PC.ai, '#64748b'][i]]), C.infaTotal);
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
  const srcs = (d ? d.sys : X.systems).slice(0, 6);
  const tgts = d ? d.use.map((u) => cons[u]) : cons;
  const n = Math.max(srcs.length, tgts.length);
  det.innerHTML = `<div class="dd-t">${txt}</div><div class="dd-flow" style="height:${Math.max(170, n * 36 + 36)}px"><canvas aria-hidden="true"></canvas></div>`;
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
    if (e.target.closest('#universe')) return;
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

/* ------------------------------------------------------------------ skill tree */
const BR_IC = { mule: 'mulesoft', infa: 'informatica', ai: 'claude', web: 'react', ops: 'github' };
let treeSel = 'mule';
function renderTree() {
  const host = $('#skilltree');
  const cols = T.branches.map(([k, name, sub]) => {
    const tiers = TREE[k];
    const count = tiers.flat().length;
    return `<div class="br${k === treeSel ? ' sel' : ''}" data-b="${k}" style="--c:${PC[k]}">
      <div class="br-h"><span class="br-ic">${icon(BR_IC[k])}</span><span><b>${esc(name)}</b><small>${esc(sub)}</small></span><em>${count}</em></div>
      ${tiers.map((list, ti) => `<div class="tier"><span class="tier-l">${esc(T.tiers[ti])}</span>${list.map((s) => `<button type="button" class="node" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>`).join('')}</div>`).join('')}
    </div>`;
  }).join('');
  host.innerHTML = `<div class="tree-root"><div class="root-node"><span class="hex">AE</span>${esc(T.rootLabel)}</div></div><div class="tree-cols">${cols}</div>`;
  const seg = $('#tree-seg');
  seg.innerHTML = T.branches.map(([k, name]) => `<button role="tab" type="button" data-b="${k}" aria-selected="${k === treeSel}">${esc(name)}</button>`).join('');
  seg.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    treeSel = b.dataset.b;
    $$('button', seg).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $$('.br', host).forEach((c) => c.classList.toggle('sel', c.dataset.b === treeSel));
    $$(`.br[data-b="${treeSel}"] .node`, host).forEach((n, i) => { n.classList.remove('flash'); void n.offsetWidth; n.style.animationDelay = `${i * 40}ms`; n.classList.add('flash'); });
  };
  // unlock the nodes tier by tier, all branches in parallel
  const unlock = () => {
    $$('.br', host).forEach((br) => $$('.node', br).forEach((n, i) => setTimeout(() => n.classList.add('on'), REDUCED ? 0 : 200 + i * 90)));
  };
  onView(host, unlock, 0.15);
}

/* ------------------------------------------------------------------ quests */
const FEATURED = ['mule-platform', 'b360-mdm', 'mdm-beam', 'hev-dash'];
const yearOf = (p) => (lang === 'fr' && p[lang].year) || p.year;
const rarity = (p) => (FEATURED.includes(p.id) || p.featured ? 'legendary' : p.cats.includes('archive') ? 'common' : (p.cats.includes('mule') || p.cats.includes('infa')) ? 'epic' : 'rare');
const RAR_COL = { legendary: '#ffcf4a', epic: '#a78bfa', rare: '#38e1ff', common: '#8a98b8' };
const rarTag = (p) => { const r = rarity(p); return `<span class="tag rar ${r}" style="--c:${RAR_COL[r]}">★ ${esc(T[r])}</span>`; };
const catTags = (p) => p.cats.map((c) => `<span class="tag" style="--c:${CAT_COL[c]}">${esc(T.filters[c])}</span>`).join('');
let filter = 'all';
function renderQuests() {
  $('#featured').innerHTML = FEATURED.map((id, k) => {
    const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i], L = p[lang];
    return `<button type="button" class="lq rv" data-p="${i}" style="--sc:${CAT_COL[p.cats[0]]};--d:${k * 0.08}s">
      <div class="schem">${schematic(p.cats[0])}</div>
      <div class="lq-b"><div class="meta-row">${rarTag(p)}${catTags(p)}<span class="yr">${esc(yearOf(p))}</span></div>
        <h4>${esc(L.title)}</h4><p class="k">${esc(L.kicker)}</p><p>${esc(L.summary)}</p><span class="go-l">${esc(T.read)} ▸</span></div></button>`;
  }).join('');
  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  const fl = $('#filters');
  fl.innerHTML = Object.keys(T.filters).filter((k) => counts[k]).map((k) => `<button role="tab" type="button" data-f="${k}" aria-selected="${k === filter}">${esc(T.filters[k])}<sup>${counts[k]}</sup></button>`).join('');
  fl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('button', fl).forEach((x) => x.setAttribute('aria-selected', String(x === b))); applyFilter(true); };
  $('#tiles').innerHTML = PROJECTS.map((p, i) => {
    const L = p[lang], r = rarity(p);
    return `<li data-cats="${p.cats.join(' ')}"><button type="button" class="tile" data-p="${i}" style="--c:${RAR_COL[r]}">
      <span class="meta-row">${rarTag(p)}<span class="yr">${esc(yearOf(p))}</span></span>
      <h4>${esc(L.title)}</h4><p>${esc(L.kicker)}</p>
      <span class="meta-row" style="margin:12px 0 0">${catTags(p)}</span>
      <span class="tile-f"><span class="ics">${p.icons.slice(0, 4).map(icon).join('')}</span><span class="more">${esc(T.read)} ▸</span></span></button></li>`;
  }).join('');
  applyFilter();
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
  body.innerHTML = `<div class="meta-row">${rarTag(p)}${catTags(p)}<span class="yr">${esc(yearOf(p))}</span></div>
    <h2 class="cb-t" id="case-title">${esc(L.title)}</h2>
    <p class="cb-k">${esc(L.kicker)}</p>
    <div class="schem">${schematic(p.cats[0])}</div>
    <div class="cb-sec"><h3>${esc(T.overview)}</h3><p>${esc(L.summary)}</p></div>
    <div class="cb-sec"><h3>${esc(T.built)}</h3><ul class="cb-pts">${L.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="cb-sec"><h3>${esc(T.stackL)}</h3><div class="skills">${p.stack.map((s) => (skillInfo(s, lang) ? `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>` : `<span class="sk" translate="no">${esc(s)}</span>`)).join('')}</div></div>
    <div class="cb-act">${p.link ? `<a class="btn primary" href="${p.link}" target="_blank" rel="noopener">${esc(p.link.includes('github.com') ? T.viewCode : T.openSite)} ↗</a>` : `<p class="cb-private">🔒 ${esc(T.privateRepo)}</p>`}</div>
    <button class="cb-next" type="button" data-next="${next}"><span><small>${esc(T.next)}</small><b>${esc(PROJECTS[next][lang].title)}</b></span><span aria-hidden="true">▸</span></button>`;
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

/* ------------------------------------------------------------------ journey map */
function fmtDate(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric' });
}
const SHORT = { en: ['BSc Information Systems', 'MSc IS Security', 'MuleSoft Consultant', 'AI Full-Stack Dev', 'Informatica Consultant', 'Tech Lead MuleSoft', 'Tech Lead MDM'], fr: ['Licence Ingénierie SI', 'Master Sécurité SI', 'Consultant MuleSoft', 'Dév Full-Stack IA', 'Consultant Informatica', 'Tech Lead MuleSoft', 'Tech Lead MDM'] };
function levels() {
  const edu = EDUCATION.slice().reverse().map((e) => ({ edu: e, from: e.years.split('–')[0].trim() }));
  const xp = EXPERIENCE.map((x, i) => ({ xp: x, i })).sort((a, b) => a.xp.from.localeCompare(b.xp.from) || (a.xp.icon === 'mulesoft' ? -1 : 1));
  return [...edu, ...xp];
}
let lvSel = -1, mapAnimDone = false;
function renderJourney() {
  const L = levels();
  if (lvSel < 0) lvSel = L.length - 1;
  const host = $('#map');
  const W = host.clientWidth || 1000, vertical = W < 760;
  const n = L.length;
  const pts = L.map((_, i) => vertical
    ? [i % 2 ? W * 0.72 : W * 0.28, 70 + i * 120]
    : [70 + (i * (W - 140)) / (n - 1), i % 2 ? 230 : 90]);
  const H = vertical ? 70 + (n - 1) * 120 + 90 : 330;
  host.style.height = `${H}px`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += vertical ? ` C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}` : ` C${(x0 + x1) / 2},${y0} ${(x0 + x1) / 2},${y1} ${x1},${y1}`;
  }
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="mapg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9b7bff"/><stop offset="1" stop-color="#38e1ff"/></linearGradient></defs><path class="map-path" d="${d}"/><path class="map-done" id="map-done" d="${d}"/></svg>
    ${L.map((lv, i) => {
      const cur = lv.xp && !lv.xp.to;
      const col = lv.edu ? '#9b7bff' : ICON_COL[lv.xp.icon] || '#38e1ff';
      const year = lv.edu ? lv.edu.years : fmtDate(lv.xp.from);
      return `<button type="button" class="lv reached" data-l="${i}" aria-pressed="${i === lvSel}" style="left:${pts[i][0]}px;top:${pts[i][1]}px;--c:${col}">
        <span class="lv-dot">${i + 1}</span><span class="lv-t">${esc(SHORT[lang][i] || '')}</span><span class="lv-y">${esc(year)}</span>${cur ? `<span class="cur">${esc(T.current)}</span>` : ''}</button>`;
    }).join('')}
    <span class="player-dot" id="player-dot"></span>`;
  const path = $('#map-done'), len = path.getTotalLength(), dot = $('#player-dot');
  const place = (k) => { const p = path.getPointAtLength(len * k); dot.style.left = `${(p.x / W) * 100}%`; dot.style.top = `${p.y}px`; path.style.strokeDashoffset = String(len * (1 - k)); };
  path.style.strokeDasharray = String(len);
  host.onclick = (e) => { const b = e.target.closest('.lv'); if (b) selectLevel(+b.dataset.l, true); };
  if (mapAnimDone || REDUCED) { place(1); }
  else {
    place(0);
    onView(host, () => {
      const t0 = performance.now(), D = 2600;
      const st = (now) => { const k = Math.min(1, (now - t0) / D); place(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(st); else mapAnimDone = true; };
      requestAnimationFrame(st);
    }, 0.35);
  }
  selectLevel(lvSel);
}
function selectLevel(i, anim) {
  lvSel = i;
  $$('#map .lv').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.l === i)));
  const lv = levels()[i], box = $('#level-detail');
  if (lv.edu) {
    box.style.setProperty('--c', '#9b7bff');
    box.innerHTML = `<div class="ld-top"><span class="lvn">${esc(T.lvl)} ${i + 1}</span><span class="tag" style="--c:#9b7bff">${esc(T.eduTag)}</span><span class="ld-when">${esc(lv.edu.years)}</span></div>
      <h3 class="ld-role">${esc(lv.edu[lang][0])}</h3><p class="ld-org">${esc(lv.edu[lang][1])}</p>`;
  } else {
    const x = lv.xp, Lx = x[lang], org = (lang === 'fr' && x.orgFr) || x.org, col = ICON_COL[x.icon] || '#38e1ff';
    box.style.setProperty('--c', col);
    box.innerHTML = `<div class="ld-top"><span class="lvn">${esc(T.lvl)} ${i + 1}</span>${x.to ? '' : `<span class="tag" style="--c:#3dffa8">● ${esc(T.current)}</span>`}<span class="ld-when">${x.to ? `${fmtDate(x.from)} – ${fmtDate(x.to)}` : `${fmtDate(x.from)} – ${esc(T.present)}`}</span></div>
      <h3 class="ld-role">${esc(Lx.role)}</h3><p class="ld-org">${icon(x.icon)}<span>${esc(org)}</span></p>
      <p class="ld-sum">${esc(Lx.sum)}</p><ul class="ld-pts">${Lx.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
  }
  if (anim && !REDUCED) { box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap'); }
}

/* ------------------------------------------------------------------ contact */
function initContact() {
  $('#compose').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#msg').value.trim();
    location.href = `mailto:abdelkader.elazzouzi@gmail.com?subject=${encodeURIComponent(lang === 'fr' ? 'Prise de contact via votre portfolio' : 'Hello from your portfolio')}&body=${encodeURIComponent(v)}`;
  };
}

/* ------------------------------------------------------------------ toasts */
const toasted = new Set();
function toast(id) {
  if (REDUCED || toasted.has(id) || !T.toasts[id]) return;
  toasted.add(id);
  const [t, d] = T.toasts[id];
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="t-ic">🏆</span><span><small>${esc(T.toast)}</small><b>${esc(t)}</b><span>${esc(d)}</span></span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3200);
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
    const b = e.target.closest('#featured [data-p], #tiles [data-p]');
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
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { current = e.target.id; markNav(); toast(e.target.id); } });
    if (scrollY < innerHeight * 0.4) { current = ''; markNav(); }
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('.sec').forEach((s) => io.observe(s));
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { ticking = false; const max = document.documentElement.scrollHeight - innerHeight; $('#xp-bar').style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0); });
  }, { passive: true });
  let w = innerWidth;
  addEventListener('resize', () => { if (Math.abs(w - innerWidth) > 40) { w = innerWidth; renderJourney(); } });
}

/* ------------------------------------------------------------------ go */
function renderAll() {
  T = { ...UI[lang], ...COPY[lang] };
  fillText();
  renderNav();
  renderHero();
  renderPlayer();
  renderCompare();
  renderTeams();
  renderTree();
  renderXTabs();
  renderQuests();
  renderJourney();
  if (caseIdx >= 0 && !$('#case').hidden) openCase(caseIdx);
  observeReveal();
}

initChrome();
initTip();
initContact();
renderAll();
initLang();
boot();
initUniverse();
