import { UI, EXPERTISE, EXPERIENCE, EDUCATION, LANGUAGES } from './content.js';
import { PROJECTS } from './projects.data.js';
import { skillInfo } from './skills.js';
import { ICONS } from '../assets/icons.js';
import { heroFlow, archFlow, teamFlow, cutover, barChart, donutChart } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (n) => (ICONS[n] ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[n]}"/></svg>` : '');
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ------------------------------------------------------------------ language */
const OTHER = [['es', 'Español'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands'], ['ar', 'العربية'], ['tr', 'Türkçe'], ['pl', 'Polski'], ['zh-CN', '中文'], ['ja', '日本語']];
const AUTO = store.get('autoLang') || '';
let lang = AUTO ? 'en' : (store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en'));
let T = UI[lang];

function setTransCookie(val) {
  const h = location.hostname;
  const exp = val ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  [`; path=/`, `; path=/; domain=${h}`, `; path=/; domain=.${h}`].forEach((d) => { document.cookie = `googtrans=${val}${exp}${d}`; });
}

function initLang() {
  const box = $('#lang');
  const label = AUTO ? AUTO.split('-')[0].toUpperCase() : lang.toUpperCase();
  box.innerHTML = `<button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false" translate="no"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg><span>${label}</span></button>
    <div class="lang-menu" hidden translate="no">
      <button type="button" data-l="en" class="${!AUTO && lang === 'en' ? 'on' : ''}">English <span>EN</span></button>
      <button type="button" data-l="fr" class="${!AUTO && lang === 'fr' ? 'on' : ''}">Français <span>FR</span></button>
      <span class="sep">${esc(T.otherLangs)}</span>
      <div class="grid">${OTHER.map(([c, n]) => `<button type="button" data-a="${c}" class="${AUTO === c ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>`;
  const btn = $('.lang-btn', box), menu = $('.lang-menu', box);
  btn.onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); };
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  menu.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a) { store.set('autoLang', b.dataset.a); store.set('lang', 'en'); setTransCookie(`/en/${b.dataset.a}`); location.reload(); return; }
    if (AUTO) { store.set('autoLang', null); setTransCookie(''); store.set('lang', b.dataset.l); location.reload(); return; }
    if (b.dataset.l === lang) { menu.hidden = true; return; }
    store.set('lang', b.dataset.l);
    lang = b.dataset.l; T = UI[lang];
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

const X2 = {
  en: {
    targets: ['Business apps', 'AI agents', 'Snowflake BI', 'Partners'], hub: ['Integration', 'hub'],
    muleChart: 'Platform at a glance', muleBars: [['Mule APIs in production', 120, '+'], ['HR interfaces migrated', 40], ['MCP servers for AI agents', 30], ['Flex Gateway proxies', 25, '+']],
    infaChart: 'Business 360 jobs in production', infaTotal: 'B360 jobs', infaSegs: ['Exports (egress)', 'Ingestion (ingress)', 'Business events', 'Match & merge', 'Other jobs'],
    aiChart: 'Response time', aiBars: [['Simple question (no AI)', 0.41, ' s'], ['Question that needs AI', 2.1, ' s']],
    cutTitle: 'Mule 3 → Mule 4, with zero downtime', cutText: 'Proxy APIs sat in front of every legacy flow, so traffic could move interface by interface across 80+ countries. Drag to replay the cut-over.',
    cutLabel: 'cut-over', cutMeta: (n) => `${n} / 40 interfaces on Mule 4`, cutDone: 'Mule 3 decommissioned ✓', cutLive: 'zero downtime',
    cutNodes: { src: 'HR consumers', srcSub: '80+ countries', proxy: 'Proxy API', proxySub: 'routing rule', flows: 'flows' },
  },
  fr: {
    targets: ['Applis métier', 'Agents IA', 'Snowflake BI', 'Partenaires'], hub: ['Hub', 'd’intégration'],
    muleChart: 'La plateforme en chiffres', muleBars: [['API Mule en production', 120, '+'], ['Interfaces RH migrées', 40], ['Serveurs MCP pour agents IA', 30], ['Proxys Flex Gateway', 25, '+']],
    infaChart: 'Jobs Business 360 en production', infaTotal: 'jobs B360', infaSegs: ['Exports (egress)', 'Ingestion (ingress)', 'Business events', 'Match and merge', 'Autres jobs'],
    aiChart: 'Temps de réponse', aiBars: [['Question simple (sans IA)', 0.41, ' s'], ['Question qui demande l’IA', 2.1, ' s']],
    cutTitle: 'Mule 3 → Mule 4, sans interruption', cutText: 'Des API proxy se plaçaient devant chaque flux historique, pour basculer le trafic interface par interface dans plus de 80 pays. Faites glisser pour rejouer la bascule.',
    cutLabel: 'bascule', cutMeta: (n) => `${n} / 40 interfaces sur Mule 4`, cutDone: 'Mule 3 décommissionné ✓', cutLive: 'zéro interruption',
    cutNodes: { src: 'Consommateurs RH', srcSub: '80+ pays', proxy: 'API proxy', proxySub: 'règle de routage', flows: 'flux' },
  },
};
const HERO_SOURCES = ['SAP ERP', 'Salesforce', 'Global HR', 'Informatica MDM', 'Hexagon'];
let heroCtl = null, archCtl = null, teamCtl = null, cutCtl = null, ddCtl = null;

/* ------------------------------------------------------------------ static text */
function fillText() {
  document.documentElement.lang = AUTO || lang;
  $$('[data-k]').forEach((el) => { const v = T[el.dataset.k]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-kh]').forEach((el) => { el.innerHTML = T[el.dataset.kh]; });
  $$('[data-icon]').forEach((el) => { if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });
}

/* ------------------------------------------------------------------ hero hub */
const HUB_APPS = { en: ['HR', 'Payroll', 'Finance', 'Sales', 'Job sites', 'IT access'], fr: ['RH', 'Paie', 'Finance', 'Commercial', 'Chantiers', 'Accès IT'] };
function renderHub() {
  if (heroCtl) heroCtl.destroy();
  const c = $('#hero-flow');
  const fresh = c.cloneNode(false); c.replaceWith(fresh);
  heroCtl = heroFlow(fresh, { sources: HERO_SOURCES, targets: X2[lang].targets, hub: X2[lang].hub });
}

/* ------------------------------------------------------------------ KPI cards */
const KPIS = [
  [120, '+', 'k1', 'k1d', '#4f8dff', 'M4 7h16M4 12h16M4 17h10', [8, 14, 12, 22, 30, 42, 60, 78, 96, 120]],
  [30, '', 'k2', 'k2d', '#a78bfa', 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z', [0, 1, 2, 4, 6, 9, 14, 19, 25, 30]],
  [150, '', 'k3', 'k3d', '#ff8a5c', 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', [10, 22, 30, 52, 70, 88, 104, 120, 138, 150]],
  [80, '+', 'k4', 'k4d', '#34d399', 'M12 3a9 9 0 100 18 9 9 0 000-18zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3', [12, 20, 26, 34, 41, 50, 58, 66, 74, 80]],
];
let statsDone = false;
function spark(vals, col) {
  const max = Math.max(...vals), W = 120, H = 40;
  const pts = vals.map((v, i) => [(i / (vals.length - 1)) * W, H - 4 - (v / max) * (H - 8)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><linearGradient id="sg${col.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${W},${H} L0,${H} Z" fill="url(#sg${col.slice(1)})"/><path class="sp-line" d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" pathLength="1"/></svg>`;
}
function renderStats() {
  const box = $('#stats');
  box.innerHTML = KPIS.map(([n, sfx, k, kd, col, ic, vals]) => `<article class="g card kpi" style="--c:${col}">
      <div class="kpi-top"><span class="kpi-ic"><svg viewBox="0 0 24 24"><path d="${ic}"/></svg></span><span class="kpi-go">↗</span></div>
      <p class="kpi-l">${esc(T[k])}</p>
      <div class="kpi-row"><b class="kpi-v"><span data-n="${n}">${statsDone || REDUCED ? n : 0}</span>${sfx}</b>${spark(vals, col)}</div>
      <span class="kpi-d">${esc(T[kd])}</span>
    </article>`).join('');
  if (statsDone || REDUCED) { box.classList.add('go'); return; }
  requestAnimationFrame(() => box.classList.add('go'));
  statsDone = true;
  $$('[data-n]', box).forEach((el) => {
    const target = +el.dataset.n, t0 = performance.now() + 250;
    const step = (now) => { const k = Math.max(0, Math.min(1, (now - t0) / 1100)); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* ------------------------------------------------------------------ platform cards (Home) */
const PLAT = { mule: ['#2f8cff', '#4fd1ff'], infa: ['#ff7a3d', '#ffb36b'], ai: ['#8b6cff', '#c4b5fd'] };
function renderPlatforms() {
  const C = X2[lang];
  const host = $('#platforms');
  host.innerHTML = ['mule', 'infa', 'ai'].map((k) => {
    const X = EXPERTISE[k], L = X[lang];
    return `<article class="g card plat" style="--c:${PLAT[k][0]};--c2:${PLAT[k][1]}">
      <div class="plat-h"><span class="plat-logo">${icon(X.icon)}</span><div><b>${esc(X.name === 'AI' ? (lang === 'fr' ? 'IA' : 'AI') : X.name)}</b><small>${esc(L.tab)}</small></div></div>
      <p class="plat-t">${esc(L.title)}</p>
      <div class="plat-chart" id="pc-${k}"></div>
      <ul class="plat-res">${L.results.slice(0, 2).map(([n, t]) => `<li><b>${esc(n)}</b><span>${esc(t.split(/[:,(]/)[0])}</span></li>`).join('')}</ul>
      <a class="gbtn plat-go" href="#expertise" data-go="expertise" data-x="${k}">${esc(T.explore)} →</a>
    </article>`;
  }).join('');
  barChart($('#pc-mule'), C.muleBars, '#4fd1ff');
  donutChart($('#pc-infa'), [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v, ['#ff8a5c', '#fbbf24', '#4fd1ff', '#8b9bff', '#64748b'][i]]), C.infaTotal);
  barChart($('#pc-ai'), C.aiBars, '#a78bfa');
}

/* ------------------------------------------------------------------ home extras */
function renderGreeting() {
  const h = new Date().getHours();
  const g = T.greet[h < 12 ? 0 : h < 18 ? 1 : 2];
  $('#greet').textContent = `${g}, ${T.greetName}`;
  $('#now-date').textContent = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const cur = EXPERIENCE.filter((x) => !x.to);
  $('#now').innerHTML = cur.map((x) => `<li class="now-i"><span class="now-t">${esc(T.since)}<br>${fmtDate(x.from)}</span><div class="now-c"><b>${esc(x[lang].role)}</b><span>${icon(x.icon)}${esc((lang === 'fr' && x.orgFr) || x.org)}</span></div></li>`).join('');
}
function renderVBars() {
  const C = X2[lang];
  const data = [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v]);
  const max = 39;
  const host = $('#vbars');
  host.innerHTML = `<div class="vb-grid">${[40, 30, 20, 10, 0].map((v) => `<span>${v}</span>`).join('')}</div>
    <div class="vb-cols">${data.map(([l, v], i) => `<button type="button" class="vb${i === 0 ? ' hi' : ''}" style="--h:${(v / max) * 100}%;--d:${i * 70}ms" aria-label="${esc(l)}: ${v}"><span class="vb-tip">${v}</span><i></i><em>${esc(l)}</em></button>`).join('')}</div>`;
  host.onpointerover = (e) => { const b = e.target.closest('.vb'); if (!b) return; $$('.vb', host).forEach((x) => x.classList.toggle('hi', x === b)); };
  host.onfocusin = host.onpointerover;
  requestAnimationFrame(() => requestAnimationFrame(() => host.classList.add('go')));
}

/* ------------------------------------------------------------------ before / after */
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
      const d = svgEl('circle', { r: 4, class: 'cmp-dot' }, gLinks);
      const am = svgEl('animateMotion', { dur: '2.2s', begin: `-${(i * 0.37).toFixed(2)}s`, repeatCount: 'indefinite', keyPoints: i % 2 ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear' }, d);
      svgEl('mpath', { href: `#cl${i}` }, am);
    }
  });
  const hub = svgEl('g', { class: 'cmp-hub', id: 'cmp-hub' }, svg);
  svgEl('rect', { x: C[0] - 62, y: C[1] - 22, width: 124, height: 44, rx: 22 }, hub);
  const ht = svgEl('text', { x: C[0], y: C[1] + 5, 'text-anchor': 'middle' }, hub); ht.textContent = T.hubLabel;
  P.forEach(([x, y], i) => {
    const g = svgEl('g', { class: 'cmp-app' }, svg);
    svgEl('circle', { cx: x, cy: y, r: 32 }, g);
    const t = svgEl('text', { x, y: y + 5, 'text-anchor': 'middle' }, g); t.textContent = HUB_APPS[lang][i];
  });
  setCompare(compareState, true);
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

/* ------------------------------------------------------------------ pillars + teams */
function renderPillars() {
  $('#pillars').innerHTML = T.pillars.map((p, i) => `<div class="pillar r"><span class="n">0${i + 1}</span><h3>${esc(p.k)}</h3><span class="p">${esc(p.p)}</span><p>${esc(p.t)}</p></div>`).join('');
  observeReveal($('#pillars'));
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
  board.innerHTML = `<div class="tb-from"><span>${t.id === 'mgmt' ? '⟵' : '⟶'}</span><b>${esc(t.from)}</b></div>
    <div class="tb-to">${t.to.map((x) => `<div class="tb-item"><i>✓</i><span>${esc(x)}</span></div>`).join('')}<p class="tb-res">${esc(res)}</p></div>`;
  board.insertAdjacentHTML('afterbegin', '<canvas class="team-fx" aria-hidden="true"></canvas>');
  if (teamCtl) teamCtl.destroy();
  teamCtl = teamFlow($('.team-fx', board), board);
  const items = $$('.tb-item, .tb-res', board);
  if (REDUCED || quiet === 'instant') { items.forEach((el) => el.classList.add('in')); return; }
  const run = () => items.forEach((el, k) => teamTimers.push(setTimeout(() => el.classList.add('in'), 80 + k * 110)));
  if (quiet) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
    io.observe(board);
  } else run();
}

/* ------------------------------------------------------------------ expertise */
let xKey = 'mule', xDom = null, aiFlow = 0, aiTimers = [];
function renderXTabs() {
  const tabs = $('#xtabs');
  tabs.innerHTML = Object.entries(EXPERTISE).map(([k, x]) => `<button role="tab" type="button" data-x="${k}" style="--c:${x.color}">${icon(x.icon)}<span>${esc(x[lang].tab)}</span></button>`).join('');
  tabs.onclick = (e) => { const b = e.target.closest('button'); if (b && b.dataset.x !== xKey) { xKey = b.dataset.x; xDom = null; renderX(); } };
  renderX();
}
function renderX() {
  $$('#xtabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.x === xKey)));
  const X = EXPERTISE[xKey], L = X[lang];
  const panel = $('#xpanel');
  panel.style.setProperty('--c', X.color);
  panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
  let body = '';
  if (xKey === 'ai') {
    body = `<div class="ai-box">
      <div class="seg" role="tablist" id="ai-seg">${L.flows.map((f, i) => `<button role="tab" type="button" data-i="${i}">${esc(i ? T.aiSmart : T.aiFast)}</button>`).join('')}</div>
      <div class="ai-q"><div class="bubble" id="ai-q"></div></div>
      <ol class="ai-steps" id="ai-steps"></ol>
      <div class="ai-a" id="ai-a"></div>
    </div>`;
  } else {
    const cons = X.consumers[lang];
    body = `<div class="arch">
      <p class="arch-hint">${esc(T.tapDomain)}</p>
      <div class="arch-grid">
        <canvas class="arch-fx" aria-hidden="true"></canvas>
        <div class="arch-col"><h4>${esc(L.cols[0])}</h4><div class="chips">${X.systems.map((s) => `<span class="chip" data-s="${esc(s)}" translate="no">${esc(s)}</span>`).join('')}</div></div>
        <div class="pipe"><div class="ln"></div><span>${esc(L.links[0])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[1])}</h4><div class="doms">${X.domains.map((d) => `<button type="button" class="dom" data-d="${d.id}" aria-pressed="false">${esc(d[lang][0])}</button>`).join('')}</div></div>
        <div class="pipe"><div class="ln"></div><span>${esc(L.links[1])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[2])}</h4><div class="cons">${cons.map((c, i) => `<div class="con" data-c="${i}">${esc(c)}</div>`).join('')}</div></div>
      </div>
      <div class="arch-detail" id="arch-detail" aria-live="polite"></div>
    </div>`;
    if (xKey === 'mule') {
      const C = X2[lang];
      body += `<div class="cut-box"><div><h4>${esc(C.cutTitle)}</h4><p>${esc(C.cutText)}</p>
        <label class="cut"><span>${esc(C.cutLabel)}</span><input type="range" min="0" max="100" value="0" id="cut" aria-label="${esc(C.cutLabel)}"><b id="cut-v">0%</b></label>
        <p class="cut-meta" id="cut-meta">${esc(C.cutMeta(0))} · ${esc(C.cutLive)}</p></div><canvas id="cut-fx" aria-hidden="true"></canvas></div>`;
    }
  }
  panel.innerHTML = `<div class="x-intro"><h3>${esc(L.title)}</h3><p>${esc(L.text)}</p></div>${body}
    <div class="x-cols">
      <div><h4>${esc(T.results)}</h4><ul class="res">${L.results.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('')}</ul></div>
      <div class="chart" id="x-chart"></div>
    </div>
    <div class="x-skills"><h4>${esc(T.skills)}</h4><div class="skills">${X.skills.map((s) => `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>`).join('')}</div></div>`;
  renderChart();
  if (archCtl) { archCtl.destroy(); archCtl = null; }
  if (cutCtl) { cutCtl.destroy(); cutCtl = null; }
  if (xKey === 'ai') {
    $('#ai-seg').onclick = (e) => { const b = e.target.closest('button'); if (b) playAI(+b.dataset.i); };
    playAI(aiFlow, true);
  } else {
    $$('.dom', panel).forEach((b) => b.addEventListener('click', () => { xDom = xDom === b.dataset.d ? null : b.dataset.d; applyDom(); }));
    applyDom();
    const grid = $('.arch-grid', panel);
    archCtl = archFlow($('.arch-fx', panel), grid, () => ({
      domains: X.domains, color: X.color === '#0a8fcc' ? '#4fd1ff' : '#ff8a5c', selected: () => xDom,
      sysEls: Object.fromEntries($$('.chip', grid).map((e) => [e.dataset.s, e])),
      domEls: Object.fromEntries($$('.dom', grid).map((e) => [e.dataset.d, e])),
      conEls: Object.fromEntries($$('.con', grid).map((e) => [+e.dataset.c, e])),
    }));
    if (xKey === 'mule') {
      const C = X2[lang];
      cutCtl = cutover($('#cut-fx'), $('#cut'), (k) => {
        $('#cut-v').textContent = `${Math.round(k * 100)}%`;
        $('#cut-meta').textContent = `${C.cutMeta(Math.round(k * 40))} · ${k >= 1 ? C.cutDone : C.cutLive}`;
      }, C.cutNodes);
    }
  }
}
function renderChart() {
  const host = $('#x-chart'), C = X2[lang];
  if (xKey === 'mule') { host.innerHTML = ''; host.insertAdjacentHTML('beforeend', `<h5>${esc(C.muleChart)}</h5><div></div>`); barChart(host.lastElementChild, C.muleBars, '#4fd1ff'); }
  else if (xKey === 'infa') {
    host.innerHTML = `<h5>${esc(C.infaChart)}</h5><div></div>`;
    const cols = ['#ff8a5c', '#fbbf24', '#4fd1ff', '#8b9bff', '#475569'];
    donutChart(host.lastElementChild, [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v, cols[i]]), C.infaTotal);
  } else { host.innerHTML = `<h5>${esc(C.aiChart)}</h5><div></div>`; barChart(host.lastElementChild, C.aiBars, '#a78bfa'); }
  const inner = host.lastElementChild;
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); host.classList.add('go'); } }, { threshold: 0.3 }).observe(inner);
}
function applyDom() {
  const X = EXPERTISE[xKey];
  const d = X.domains.find((x) => x.id === xDom);
  $$('.dom').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.d === xDom)));
  $$('.chip').forEach((c) => { const hit = d && d.sys.includes(c.dataset.s); c.classList.toggle('hit', !!hit); c.classList.toggle('dim', !!d && !hit); });
  $$('.con').forEach((c) => { const hit = d && d.use.includes(+c.dataset.c); c.classList.toggle('hit', !!hit); c.classList.toggle('dim', !!d && !hit); });
  const det = $('#arch-detail');
  const txt = d ? `<b>${esc(d[lang][0])}</b><p>${esc(d[lang][1])}</p>` : `<b>${esc(T.all)}</b><p>${esc(X[lang].text)}</p>`;
  const cons = X.consumers[lang].map((c) => c.split(' (')[0]);
  const srcs = (d ? d.sys : X.systems).slice(0, 6);
  const tgts = d ? d.use.map((u) => cons[u]) : cons;
  const n = Math.max(srcs.length, tgts.length);
  det.innerHTML = `<div class="dd-t">${txt}</div><div class="dd-flow" style="height:${Math.max(170, n * 38 + 40)}px"><canvas aria-hidden="true"></canvas></div>`;
  if (ddCtl) ddCtl.destroy();
  const mule = xKey === 'mule';
  ddCtl = heroFlow($('.dd-flow canvas', det), { sources: srcs, targets: tgts, hub: [mule ? 'API' : 'MDM'], compact: true,
    hubColor: mule ? ['#9fd4ff', '#2f8cff'] : ['#ffd0a8', '#ff7a3d'], cols: mule ? ['#4fd1ff', '#7fb0ff', '#9cc0ff', '#38bdf8', '#60a5fa', '#93c5fd'] : ['#ffb36b', '#ff8a5c', '#fbbf24', '#fdba74', '#f97316', '#fcd34d'] });
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

/* ------------------------------------------------------------------ skill tooltip */
function initTip() {
  const tip = $('#tip');
  let cur = null;
  const close = () => { if (cur) cur.setAttribute('aria-expanded', 'false'); cur = null; tip.hidden = true; };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-skill]');
    if (!b) { if (!tip.contains(e.target)) close(); return; }
    if (cur === b) { close(); return; }
    const info = skillInfo(b.dataset.skill, lang);
    if (!info) return;
    close();
    cur = b; b.setAttribute('aria-expanded', 'true');
    $('#tip-t').textContent = b.dataset.skill;
    $('#tip-what').textContent = info[0];
    $('#tip-wl').textContent = T.whereUsed;
    $('#tip-where').textContent = info[1];
    tip.hidden = false;
    if (innerWidth > 700) {
      const r = b.getBoundingClientRect();
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = `${Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)}px`;
      tip.style.top = `${r.bottom + 10 + h > innerHeight - 12 ? r.top - h - 10 : r.bottom + 10}px`;
    }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  addEventListener('scroll', () => { if (!tip.hidden && innerWidth > 700) close(); }, { passive: true });
}

/* ------------------------------------------------------------------ projects */
const CAT_COL = { ai: '#8b6cff', mule: '#2f8cff', infa: '#ff7a3d', web: '#22c38e', mobile: '#ff5c7a', data: '#18b8c9', archive: '#e3a62f' };
const CAT_IC = { ai: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z', mule: 'M4 12h4l3-6 2 12 3-6h4', infa: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', web: 'M3 5h18v14H3zM3 9h18', mobile: 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zm3 15h2', data: 'M5 20V10m7 10V4m7 16v-7', archive: 'M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18' };
let filter = 'all';
function renderWork() {
  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  const fl = $('#filters');
  fl.innerHTML = Object.keys(T.filters).filter((k) => counts[k]).map((k) => `<button role="tab" type="button" data-f="${k}" aria-selected="${k === filter}">${esc(T.filters[k])}</button>`).join('');
  fl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('button', fl).forEach((x) => x.setAttribute('aria-selected', String(x === b))); applyFilter(true); };
  $('#works').innerHTML = PROJECTS.map((p, i) => {
    const L = p[lang], c = p.cats[0];
    const year = (lang === 'fr' && L.year) || p.year;
    return `<li class="tile" data-cats="${p.cats.join(' ')}" style="--c:${CAT_COL[c]}"><button type="button" data-p="${i}">
      <span class="t-top"><span class="t-ic"><svg viewBox="0 0 24 24"><path d="${CAT_IC[c]}"/></svg></span><span class="t-cat">${esc(T.filters[c])}</span></span>
      <span class="t-title">${esc(L.title)}</span>
      <span class="t-sum">${esc(L.kicker)}</span>
      <span class="t-foot"><span class="t-year">${esc(year)}</span><span class="t-icons">${p.icons.slice(0, 3).map(icon).join('')}</span></span>
    </button></li>`;
  }).join('');
  $('#works').onclick = (e) => { const b = e.target.closest('[data-p]'); if (b) openDrawer(PROJECTS[+b.dataset.p], b); };
  applyFilter();
}
function applyFilter(anim) {
  let k = 0;
  $$('#works .tile').forEach((li) => {
    const show = filter === 'all' || li.dataset.cats.split(' ').includes(filter);
    li.hidden = !show;
    if (show && anim && !REDUCED) { li.style.animation = 'none'; void li.offsetWidth; li.style.animation = ''; li.style.setProperty('--d', `${k++ * 40}ms`); }
  });
}

let lastFocus = null;
function openDrawer(p, from) {
  lastFocus = from;
  const L = p[lang], d = $('#drawer');
  const year = (lang === 'fr' && L.year) || p.year;
  const cats = p.cats.map((c) => T.filters[c]).filter(Boolean).join(' · ');
  $('#drawer-body').innerHTML = `<p class="dr-meta">${esc(year)} · ${esc(cats)}</p>
    <h2 id="dr-title">${esc(L.title)}</h2>
    <p class="dr-kicker">${esc(L.kicker)}</p>
    <p class="dr-sum">${esc(L.summary)}</p>
    <ul class="dr-pts">${L.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="dr-h">${esc(T.builtWith)}</p>
    <div class="skills">${p.stack.map((s) => (skillInfo(s, lang) ? `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>` : `<span class="sk" translate="no">${esc(s)}</span>`)).join('')}</div>
    <div class="dr-actions">${p.link ? `<a class="gbtn primary" href="${p.link}" target="_blank" rel="noopener">${esc(p.link.includes('github.com') ? T.viewCode : T.openSite)} <span class="arrow">↗</span></a>` : `<p class="dr-private">${esc(T.privateRepo)}</p>`}</div>`;
  $('.x', d).setAttribute('aria-label', T.close);
  d.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('open')));
  $('.drawer-card', d).scrollTop = 0;
  $('.drawer-card', d).focus({ preventScroll: true });
}
function closeDrawer() {
  const d = $('#drawer');
  if (d.hidden) return;
  d.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { d.hidden = true; }, REDUCED ? 0 : 400);
  lastFocus && lastFocus.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ experience */
const openRows = new Set([0]);
function fmtDate(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric' });
}
function renderCV() {
  $('#cv').innerHTML = EXPERIENCE.map((x, i) => {
    const L = x[lang];
    const org = (lang === 'fr' && x.orgFr) || x.org;
    return `<li class="cv-row r${openRows.has(i) ? ' open' : ''}" data-i="${i}">
      <div class="cv-when">${x.to ? `${fmtDate(x.from)} – ${fmtDate(x.to)}` : `${fmtDate(x.from)} –<span class="now">${esc(T.present)}</span>`}</div>
      <div>
        <h3 class="cv-role">${esc(L.role)}</h3>
        <p class="cv-org">${icon(x.icon)}<span>${esc(org)}</span></p>
        <p class="cv-sum">${esc(L.sum)}</p>
        <div class="cv-pts" id="cvp${i}"><ul>${L.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
        <button type="button" class="cv-more" aria-expanded="${openRows.has(i)}" aria-controls="cvp${i}"><span>${esc(openRows.has(i) ? T.less : T.more)}</span><i>+</i></button>
      </div></li>`;
  }).join('');
  $('#cv').onclick = (e) => {
    const b = e.target.closest('.cv-more'); if (!b) return;
    const row = b.closest('.cv-row'), i = +row.dataset.i;
    const open = !row.classList.contains('open');
    row.classList.toggle('open', open);
    open ? openRows.add(i) : openRows.delete(i);
    b.setAttribute('aria-expanded', String(open));
    b.querySelector('span').textContent = open ? T.less : T.more;
  };
  $('#edu').innerHTML = EDUCATION.map((e) => `<li><span>${esc(e[lang][0])}<small>${esc(e[lang][1])}</small></span><span>${esc(e.years)}</span></li>`).join('');
  $('#langs').innerHTML = LANGUAGES[lang].map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b)}</span></li>`).join('');
  observeReveal($('#cv'));
}

/* ------------------------------------------------------------------ contact: messages */
let thread = 'mail', typingTimer = null;
function renderContact() {
  const list = $('#msg-list');
  list.innerHTML = `<div class="ml-search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>${esc(T.msgSearch)}</span></div>
    ${T.threads.map((t) => `<button type="button" class="ml-i" data-t="${t.id}"><span class="ml-av">${icon(t.icon)}</span><span class="ml-tx"><b>${esc(t.name)}</b><small>${esc(t.preview)}</small></span><i class="ml-dot"></i></button>`).join('')}`;
  list.onclick = (e) => { const b = e.target.closest('[data-t]'); if (b) openThread(b.dataset.t); };
  $('#msg-profile').innerHTML = `<div class="mp-av avatar xl">AE</div><b class="mp-n" translate="no">Abdelkader El Azzouzi</b><span class="mp-r">${esc(T.roleShort)}</span>
    <span class="mp-on"><i></i>${esc(T.online)}</span>
    <div class="mp-sec"><small>${esc(T.basedOn)}</small><p>${esc(T.roles)}</p></div>
    <div class="mp-sec"><small>${esc(T.langTitle)}</small><p>${LANGUAGES[lang].map(([a, b]) => `${esc(a)} · ${esc(b)}`).join('<br>')}</p></div>`;
  $('#mt-input').placeholder = T.typeHere;
  $('#mt-send').textContent = T.send;
  $('#mt-compose').onsubmit = (e) => {
    e.preventDefault();
    const t = T.threads.find((x) => x.id === thread), v = $('#mt-input').value.trim();
    if (thread === 'mail') {
      if (v) { $('#mt-body').insertAdjacentHTML('beforeend', `<div class="bub me">${esc(v)}</div>`); $('#mt-input').value = ''; }
      location.href = `mailto:abdelkader.elazzouzi@gmail.com?subject=${encodeURIComponent(lang === 'fr' ? 'Prise de contact via votre portfolio' : 'Hello from your portfolio')}&body=${encodeURIComponent(v)}`;
    } else window.open(t.href, '_blank', 'noopener');
  };
  openThread(thread, true);
}
function openThread(id, quiet) {
  thread = id;
  clearTimeout(typingTimer);
  const t = T.threads.find((x) => x.id === id);
  $$('.ml-i').forEach((b) => b.setAttribute('aria-current', String(b.dataset.t === id)));
  $('#mt-head').innerHTML = `<span class="ml-av">${icon(t.icon)}</span><div><b>${esc(t.name)}</b><small>${esc(t.handle)}</small></div><a class="gbtn sm" href="${t.href}" ${t.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${esc(T.open)} ↗</a>`;
  const body = $('#mt-body');
  body.innerHTML = '';
  $('#mt-input').hidden = id !== 'mail';
  $('#mt-send').textContent = id === 'mail' ? T.send : `${T.open} ${t.name}`;
  const msgs = t.msgs.slice();
  const push = () => {
    if (!msgs.length) return;
    const m = msgs.shift();
    body.insertAdjacentHTML('beforeend', `<div class="bub">${esc(m)}</div>`);
    body.scrollTop = body.scrollHeight;
    if (msgs.length) { body.insertAdjacentHTML('beforeend', '<div class="bub typing"><i></i><i></i><i></i></div>'); typingTimer = setTimeout(() => { $('.typing', body) && $('.typing', body).remove(); push(); }, REDUCED || quiet ? 0 : 650); }
  };
  if (REDUCED) { t.msgs.forEach((m) => body.insertAdjacentHTML('beforeend', `<div class="bub">${esc(m)}</div>`)); return; }
  push();
}

/* ------------------------------------------------------------------ chrome */
let revealIO;
function observeReveal(root = document) {
  if (REDUCED || !('IntersectionObserver' in window)) { $$('.r', root).forEach((el) => el.classList.add('in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.r:not(.in)', root).forEach((el) => revealIO.observe(el));
  if (root.classList && root.classList.contains('r') && !root.classList.contains('in')) revealIO.observe(root);
}

const VIEWS = [
  ['home', 'navHome', 'M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z'],
  ['expertise', 'navExpertise', 'M5 6a2 2 0 104 0 2 2 0 00-4 0zM15 6a2 2 0 104 0 2 2 0 00-4 0zM10 18a2 2 0 104 0 2 2 0 00-4 0zM7 8l4 8M17 8l-4 8M9 6h6'],
  ['projects', 'navProjects', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  ['career', 'navCareer', 'M4 8h16v11H4zM9 8V5h6v3'],
  ['contact', 'navContact', 'M4 5h16v11H8l-4 4z'],
];
let view = 'home';
function renderNav() {
  $('#pills').innerHTML = VIEWS.slice(0, 4).map(([id, k, d]) => `<a href="#${id}" data-go="${id}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg><span>${esc(T[k])}</span></a>`).join('');
  $('#dock').innerHTML = VIEWS.map(([id, k, d]) => `<a href="#${id}" data-go="${id}" aria-label="${esc(T[k])}"><svg viewBox="0 0 24 24"><path d="${d}"/></svg><span class="dk-l">${esc(T[k])}</span></a>`).join('');
  markNav();
}
function markNav() { $$('[data-go]').forEach((a) => { const on = a.dataset.go === view; a.classList.toggle('on', on); if (a.closest('#dock,#pills')) a.setAttribute('aria-current', on ? 'page' : 'false'); }); }
function show(id, push) {
  if (!VIEWS.some((v) => v[0] === id)) id = 'home';
  const prev = $(`.view[data-view="${view}"]`), next = $(`.view[data-view="${id}"]`);
  view = id;
  markNav();
  if (push) history.pushState(null, '', `#${id}`);
  if (prev === next) { next.hidden = false; enter(next); return; }
  const go = () => { prev.hidden = true; prev.classList.remove('out'); next.hidden = false; scrollTo(0, 0); enter(next); };
  if (REDUCED || !prev || prev.hidden) { if (prev) prev.hidden = true; next.hidden = false; scrollTo(0, 0); enter(next); return; }
  prev.classList.add('out');
  setTimeout(go, 220);
  closeDrawer();
}
function enter(el) {
  el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  // canvases measure their box when they become visible
  requestAnimationFrame(() => { [heroCtl, archCtl, cutCtl, teamCtl, ddCtl].forEach((c) => c && c.resize && c.resize()); });
  document.title = `${view === 'home' ? '' : `${T[VIEWS.find((v) => v[0] === view)[1]]} · `}Abdelkader El Azzouzi`;
}
function initChrome() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    if (a.dataset.x && a.dataset.x !== xKey) { xKey = a.dataset.x; xDom = null; renderX(); }
    show(a.dataset.go, true);
  });
  addEventListener('popstate', () => show(location.hash.slice(1) || 'home'));
  addEventListener('scroll', () => $('#top').classList.toggle('scrolled', scrollY > 8), { passive: true });
  $('#drawer').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeDrawer(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}

/* ------------------------------------------------------------------ go */
function renderAll() {
  T = UI[lang];
  fillText();
  renderNav();
  renderGreeting();
  renderHub();
  renderStats();
  renderVBars();
  renderPlatforms();
  renderContact();
  renderCompare();
  renderPillars();
  renderTeams();
  renderXTabs();
  renderWork();
  renderCV();
  observeReveal();
}

initChrome();
initTip();
renderAll();
initLang();
show(location.hash.slice(1) || 'home');
