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
let heroCtl = null, archCtl = null, teamCtl = null, cutCtl = null;

/* ------------------------------------------------------------------ static text */
function fillText() {
  document.documentElement.lang = AUTO || lang;
  $$('[data-k]').forEach((el) => { const v = T[el.dataset.k]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-kh]').forEach((el) => { el.innerHTML = T[el.dataset.kh]; });
  $('#burger').setAttribute('aria-label', T.menu);
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

/* ------------------------------------------------------------------ stats */
const STATS = [[120, '+', 'stat1'], [30, '', 'stat2'], [80, '+', 'stat3'], [4, '', 'stat4']];
let statsDone = false;
function renderStats() {
  const dl = $('#stats');
  dl.innerHTML = STATS.map(([n, s, k]) => `<div class="r"><dt><span data-n="${n}">${statsDone || REDUCED ? n : 0}</span>${s}</dt><dd>${esc(T[k])}</dd></div>`).join('');
  observeReveal(dl);
  if (statsDone || REDUCED) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect(); statsDone = true;
    $$('[data-n]', dl).forEach((el) => {
      const target = +el.dataset.n, t0 = performance.now();
      const step = (now) => { const k = Math.min(1, (now - t0) / 900); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  io.observe(dl);
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
  if (d) det.innerHTML = `<b>${esc(d[lang][0])}</b><p>${esc(d[lang][1])}</p>`;
  else det.innerHTML = `<b>${esc(T.all)}</b><p>${esc(X[lang].text)}</p>`;
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

/* ------------------------------------------------------------------ work */
let filter = 'all';
function renderWork() {
  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  const fl = $('#filters');
  fl.innerHTML = Object.keys(T.filters).filter((k) => counts[k]).map((k) => `<button role="tab" type="button" data-f="${k}" aria-selected="${k === filter}">${esc(T.filters[k])}<sup>${counts[k]}</sup></button>`).join('');
  fl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('button', fl).forEach((x) => x.setAttribute('aria-selected', String(x === b))); applyFilter(); };
  $('#works').innerHTML = PROJECTS.map((p, i) => {
    const L = p[lang];
    const year = (lang === 'fr' && L.year) || p.year;
    return `<li class="work${p.featured ? ' featured' : ''}" data-cats="${p.cats.join(' ')}"><button type="button" data-p="${i}">
      <span class="w-year">${esc(year)}</span>
      <span class="w-title">${esc(L.title)}${p.featured ? '<span class="star" aria-hidden="true">★</span>' : ''}<span class="w-kicker">${esc(L.kicker)}</span></span>
      <span class="w-sum">${esc(L.summary)}</span>
      <span class="w-icons">${p.icons.slice(0, 4).map(icon).join('')}</span>
      <span class="w-go" aria-hidden="true">→</span></button></li>`;
  }).join('');
  $('#works').onclick = (e) => { const b = e.target.closest('[data-p]'); if (b) openDrawer(PROJECTS[+b.dataset.p], b); };
  applyFilter();
}
function applyFilter() { $$('#works .work').forEach((li) => { li.hidden = filter !== 'all' && !li.dataset.cats.split(' ').includes(filter); }); }

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
    <div class="dr-actions">${p.link ? `<a class="btn solid" href="${p.link}" target="_blank" rel="noopener">${esc(p.link.includes('github.com') ? T.viewCode : T.openSite)} <span class="arrow">↗</span></a>` : `<p class="dr-private">${esc(T.privateRepo)}</p>`}</div>`;
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

/* ------------------------------------------------------------------ chrome */
let revealIO;
function observeReveal(root = document) {
  if (REDUCED || !('IntersectionObserver' in window)) { $$('.r', root).forEach((el) => el.classList.add('in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.r:not(.in)', root).forEach((el) => revealIO.observe(el));
  if (root.classList && root.classList.contains('r') && !root.classList.contains('in')) revealIO.observe(root);
}

function initChrome() {
  const top = $('#top'), bar = $('#progress');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    top.classList.toggle('scrolled', scrollY > 8);
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? (scrollY / max).toFixed(3) : 0})`;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  // active section in the nav
  const ids = ['work', 'expertise', 'experience', 'contact'];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) $$('.links a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach((id) => io.observe(document.getElementById(id)));
  // mobile sheet
  const burger = $('#burger'), sheet = $('#sheet');
  const setSheet = (open) => { sheet.hidden = !open; burger.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.onclick = () => setSheet(sheet.hidden);
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) setSheet(false); });
  addEventListener('resize', () => { if (innerWidth > 820 && !sheet.hidden) setSheet(false); });
  // drawer
  $('#drawer').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeDrawer(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); if (!sheet.hidden) setSheet(false); } });
}

/* ------------------------------------------------------------------ go */
function renderAll() {
  T = UI[lang];
  fillText();
  renderHub();
  renderStats();
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
