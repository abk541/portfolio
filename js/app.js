import { UI, EXPERTISE, EXPERIENCE, EDUCATION, LANGUAGES } from './content.js';
import { COPY } from './copy.js';
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
document.documentElement.classList.add('js');

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
let heroCtl = null, archCtl = null, teamCtl = null, cutCtl = null, ddCtl = null;

/* ------------------------------------------------------------------ text + word-split titles */
function splitWords(el) {
  if (AUTO) return; // keep sentences whole so automatic translation can read them
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--d', `${Math.min(i++ * 0.045, 0.7).toFixed(3)}s`);
          w.appendChild(s); frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  el.classList.add('armed');
}
function fillText() {
  document.documentElement.lang = AUTO || lang;
  $$('[data-k]').forEach((el) => { const v = T[el.dataset.k]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-kh]').forEach((el) => { el.innerHTML = T[el.dataset.kh]; });
  $$('[data-nav]').forEach((el) => { el.textContent = T.nav.find((n) => n[0] === el.dataset.nav)[1]; });
  $$('.split').forEach(splitWords);
  $('#msg').placeholder = T.placeholder;
  if (matchMedia('(hover: none)').matches) $('[data-k="tryIt"]').textContent = T.tryItTouch;
  $('.band').setAttribute('aria-label', `${T.from} → ${T.via} → ${T.to}`);
}

/* ------------------------------------------------------------------ nav */
function renderNav() {
  const links = T.nav.map(([id, l], i) => `<a href="#${id}" data-sec="${id}"><span class="n">${pad(i + 1)}</span>${esc(l)}</a>`).join('');
  $('#nav-links').innerHTML = links;
  $('#sheet-links').innerHTML = T.nav.map(([id, l], i) => `<a href="#${id}" data-sec="${id}" style="--d:${(0.05 + i * 0.04).toFixed(2)}s"><span class="n">${pad(i + 1)}</span>${esc(l)}</a>`).join('');
  markNav();
}
let current = '';
function markNav() {
  $$('[data-sec]').forEach((a) => { const on = a.dataset.sec === current; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
}
function toggleSheet(open) {
  const sheet = $('#sheet'), btn = $('#menu-btn');
  btn.setAttribute('aria-expanded', String(open));
  $('span', btn).textContent = open ? T.close : T.menu;
  document.body.classList.toggle('lock', open);
  if (open) { sheet.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open'))); }
  else { sheet.classList.remove('open'); setTimeout(() => { if (!sheet.classList.contains('open')) sheet.hidden = true; }, REDUCED ? 0 : 350); }
}

/* ------------------------------------------------------------------ hero */
function renderHub() {
  if (heroCtl) heroCtl.destroy();
  const c = $('#hero-flow');
  const fresh = c.cloneNode(false); c.replaceWith(fresh);
  heroCtl = heroFlow(fresh, { sources: HERO_SOURCES, targets: X2[lang].targets, hub: X2[lang].hub, compact: PHONE() });
}
let numbersDone = false;
function renderNumbers() {
  const box = $('#numbers');
  box.innerHTML = T.numbers.map(([n, sfx, l], i) => `<div class="rv" style="--d:${i * 0.08}s"><dt>${esc(l)}</dt><dd><span data-n="${n}">${numbersDone || REDUCED ? n : 0}</span>${sfx ? `<sup>${sfx}</sup>` : ''}</dd></div>`).join('');
  if (numbersDone || REDUCED) return;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect(); numbersDone = true;
    $$('[data-n]', box).forEach((el, i) => {
      const target = +el.dataset.n, t0 = performance.now() + 150 + i * 90;
      const step = (now) => { const k = Math.max(0, Math.min(1, (now - t0) / 1400)); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  io.observe(box);
}

/* ------------------------------------------------------------------ 01 profile */
function renderProfile() {
  $('#facts').innerHTML = T.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#pillars').innerHTML = T.pillars.map((p, i) => `<li class="rv" style="--d:${i * 0.1}s"><p class="n mono"><span>${pad(i + 1)}</span><b>${esc(p.p)}</b></p><h3>${esc(p.k)}</h3><p>${esc(p.t)}</p></li>`).join('');
}

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
  [[230, 128], [420, 212], [404, 120]].forEach(([x, y], i) => { const t = svgEl('text', { x, y, class: 'cmp-warn', 'text-anchor': 'middle' }, gMess); t.textContent = '× ' + warnTxt[i]; });
  const gLinks = svgEl('g', { id: 'cmp-links' }, svg);
  P.forEach(([x, y], i) => {
    svgEl('path', { d: `M${x},${y} L${C[0]},${C[1]}`, id: `cl${i}`, class: 'cmp-link' }, gLinks);
    if (!REDUCED) {
      const d = svgEl('circle', { r: 3, class: 'cmp-dot' }, gLinks);
      const am = svgEl('animateMotion', { dur: '2.4s', begin: `-${(i * 0.4).toFixed(2)}s`, repeatCount: 'indefinite', keyPoints: i % 2 ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear' }, d);
      svgEl('mpath', { href: `#cl${i}` }, am);
    }
  });
  const hub = svgEl('g', { class: 'cmp-hub', id: 'cmp-hub' }, svg);
  svgEl('rect', { x: C[0] - 70, y: C[1] - 20, width: 140, height: 40 }, hub);
  const ht = svgEl('text', { x: C[0], y: C[1] + 4, 'text-anchor': 'middle' }, hub); ht.textContent = T.hubLabel;
  P.forEach(([x, y], i) => {
    const g = svgEl('g', { class: 'cmp-app' }, svg);
    svgEl('circle', { cx: x, cy: y, r: 34 }, g);
    const t = svgEl('text', { x, y: y + 5, 'text-anchor': 'middle' }, g); t.textContent = HUB_APPS[lang][i];
  });
  setCompare(compareState);
  if (!compareAuto && !REDUCED) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => { if (!compareAuto) { compareAuto = true; setCompare('after'); } }, 2000); } }, { threshold: 0.6 });
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
  board.innerHTML = `<canvas class="team-fx" aria-hidden="true"></canvas><div class="tb-from"><span>${t.id === 'mgmt' ? '← 1' : '1 →'}</span><b>${esc(t.from)}</b></div>
    <div class="tb-to">${t.to.map((x) => `<div class="tb-item"><i>✓</i><span>${esc(x)}</span></div>`).join('')}<p class="tb-res">${esc(res)}</p></div>`;
  if (teamCtl) teamCtl.destroy();
  teamCtl = teamFlow($('.team-fx', board), board, THEME.accent);
  const items = $$('.tb-item, .tb-res', board);
  if (REDUCED) { items.forEach((el) => el.classList.add('in')); return; }
  const run = () => items.forEach((el, k) => teamTimers.push(setTimeout(() => el.classList.add('in'), 120 + k * 120)));
  if (quiet) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.4 });
    io.observe(board);
  } else run();
}

/* ------------------------------------------------------------------ 02 practice */
let xKey = 'mule', xDom = null, aiFlow = 0, aiTimers = [];
const xName = (k) => (k === 'ai' ? (lang === 'fr' ? 'IA' : 'AI') : EXPERTISE[k].name);
function renderXTabs() {
  const tabs = $('#xtabs');
  tabs.innerHTML = Object.entries(EXPERTISE).map(([k, x], i) => `<button role="tab" type="button" data-x="${k}" aria-controls="xpanel" id="tab-${k}">
      <span class="pl-top"><span>${pad(i + 1)}</span><span>${esc(T.since[k])}</span></span>
      <span class="pl-n">${icon(x.icon)}<span translate="no">${esc(xName(k))}</span></span>
      <span class="pl-d">${esc(x[lang].tab)}</span></button>`).join('');
  tabs.onclick = (e) => {
    const b = e.target.closest('button'); if (!b || b.dataset.x === xKey) return;
    xKey = b.dataset.x; xDom = null; renderX(true);
    const top = $('#practice .practice').getBoundingClientRect().top;
    if (top < 0) scrollTo({ top: scrollY + top - (PHONE() ? 120 : 100), behavior: REDUCED ? 'auto' : 'smooth' });
  };
  tabs.onkeydown = (e) => {
    const keys = Object.keys(EXPERTISE), i = keys.indexOf(xKey);
    const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    xKey = keys[(i + d + keys.length) % keys.length]; xDom = null; renderX(true);
    $(`#tab-${xKey}`).focus();
  };
  renderX();
}
function renderX(swap) {
  $$('#xtabs button').forEach((b) => { const on = b.dataset.x === xKey; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  const X = EXPERTISE[xKey], L = X[lang], C = X2[lang];
  const panel = $('#xpanel');
  panel.setAttribute('aria-labelledby', `tab-${xKey}`);
  if (swap) { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }
  let body = '';
  if (xKey === 'ai') {
    body = `<div class="blk"><div class="blk-h"><span class="mono">${esc(C.walk)}</span><span class="mono">MDM Beam</span></div><div class="ai-box">
      <div class="toggle" role="tablist" id="ai-seg">${L.flows.map((f, i) => `<button role="tab" type="button" data-i="${i}">${esc(i ? T.aiSmart : T.aiFast)}</button>`).join('')}</div>
      <div class="ai-q"><p class="bubble" id="ai-q"></p></div>
      <ol class="ai-steps" id="ai-steps"></ol>
      <div class="ai-a" id="ai-a" aria-live="polite"></div>
    </div></div>`;
  } else {
    const cons = X.consumers[lang];
    body = `<div class="blk arch"><div class="blk-h"><span class="mono">${esc(C.arch)}</span><span class="mono">${esc(T.tapDomain)}</span></div>
      <div class="arch-grid">
        <canvas class="arch-fx" aria-hidden="true"></canvas>
        <div class="arch-col"><h4>${esc(L.cols[0])}</h4><div class="chips">${X.systems.map((s) => `<span class="chip" data-s="${esc(s)}" translate="no">${esc(s)}</span>`).join('')}</div></div>
        <div class="pipe"><span>${esc(L.links[0])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[1])}</h4><div class="doms">${X.domains.map((d) => `<button type="button" class="dom" data-d="${d.id}" aria-pressed="false">${esc(d[lang][0])}</button>`).join('')}</div></div>
        <div class="pipe"><span>${esc(L.links[1])}</span></div>
        <div class="arch-col"><h4>${esc(L.cols[2])}</h4><div class="cons">${cons.map((c, i) => `<div class="con" data-c="${i}">${esc(c)}</div>`).join('')}</div></div>
      </div>
      <div class="arch-detail" id="arch-detail" aria-live="polite"></div>
    </div>`;
    if (xKey === 'mule') {
      body += `<div class="blk"><div class="blk-h"><span class="mono">${esc(C.cutTitle)}</span><span class="mono">2022 – 2024</span></div><div class="cut-box"><div><p>${esc(C.cutText)}</p>
        <label class="cut"><span>${esc(C.cutLabel)}</span><input type="range" min="0" max="100" value="0" id="cut" aria-label="${esc(C.cutLabel)}"><b id="cut-v">0%</b></label>
        <p class="cut-meta" id="cut-meta">${esc(C.cutMeta(0))} · ${esc(C.cutLive)}</p></div><canvas id="cut-fx" aria-hidden="true"></canvas></div></div>`;
    }
  }
  panel.innerHTML = `<div class="x-intro"><h3>${esc(L.title)}</h3><p>${esc(L.text)}</p></div>${body}
    <div class="blk"><div class="blk-h"><span class="mono">${esc(T.results)}</span><span class="mono">${esc(C.proof)}</span></div>
      <div class="x-cols"><ul class="res">${L.results.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('')}</ul><div class="chart" id="x-chart"></div></div></div>
    <div class="blk"><div class="blk-h"><span class="mono">${esc(T.skills)}</span><span class="mono">${X.skills.length}</span></div>
      <div class="skills">${X.skills.map((s) => `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>`).join('')}</div></div>`;
  renderChart();
  if (archCtl) { archCtl.destroy(); archCtl = null; }
  if (cutCtl) { cutCtl.destroy(); cutCtl = null; }
  if (ddCtl) { ddCtl.destroy(); ddCtl = null; }
  if (xKey === 'ai') {
    $('#ai-seg').onclick = (e) => { const b = e.target.closest('button'); if (b) playAI(+b.dataset.i); };
    playAI(aiFlow, true);
  } else {
    $$('.dom', panel).forEach((b) => b.addEventListener('click', () => { xDom = xDom === b.dataset.d ? null : b.dataset.d; applyDom(); }));
    applyDom();
    const grid = $('.arch-grid', panel);
    archCtl = archFlow($('.arch-fx', panel), grid, () => ({
      domains: X.domains, color: THEME.accent, selected: () => xDom,
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
const MONO_SEGS = [THEME.accent, '#edeae3', '#b9b6ae', '#7c7a74', '#45443f'];
function renderChart() {
  const host = $('#x-chart'), C = X2[lang];
  if (xKey === 'mule') { host.innerHTML = `<h5>${esc(C.muleChart)}</h5><div></div>`; barChart(host.lastElementChild, C.muleBars, THEME.accent); }
  else if (xKey === 'infa') {
    host.innerHTML = `<h5>${esc(C.infaChart)}</h5><div></div>`;
    donutChart(host.lastElementChild, [39, 36, 32, 21, 12].map((v, i) => [C.infaSegs[i], v, MONO_SEGS[i]]), C.infaTotal);
  } else { host.innerHTML = `<h5>${esc(C.aiChart)}</h5><div></div>`; barChart(host.lastElementChild, C.aiBars, THEME.accent); }
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
    lis.forEach((l, k) => aiTimers.push(setTimeout(() => l.classList.add('on'), 150 + k * 280)));
    aiTimers.push(setTimeout(() => a.classList.add('in'), 300 + lis.length * 280));
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
    if (innerWidth > 760) {
      const r = b.getBoundingClientRect();
      const w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = `${Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12)}px`;
      tip.style.top = `${r.bottom + 10 + h > innerHeight - 12 ? r.top - h - 10 : r.bottom + 10}px`;
    }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  addEventListener('scroll', () => { if (!tip.hidden && innerWidth > 760) close(); }, { passive: true });
  $('#case').addEventListener('scroll', close, { passive: true, capture: true });
}

/* ------------------------------------------------------------------ 03 work: schematics */
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

/* ------------------------------------------------------------------ 03 work: cases + index */
const FEATURED = ['mule-platform', 'b360-mdm', 'mdm-beam', 'hev-dash'];
const yearOf = (p) => (lang === 'fr' && p[lang].year) || p.year;
const catsOf = (p) => p.cats.map((c) => T.filters[c]).filter(Boolean).join(' · ');
const mainCat = (p) => p.cats[0];
let filter = 'all';
function renderWork() {
  $('#cases').innerHTML = FEATURED.map((id, k) => {
    const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i], L = p[lang];
    return `<article class="cs">
      <div class="cs-meta rv"><span class="num">${pad(k + 1)}</span><span class="mono">${esc(T.caseLabel)}</span><span class="mono">${esc(catsOf(p))} · ${esc(yearOf(p))}</span></div>
      <div class="cs-text rv" style="--d:.08s"><h3>${esc(L.title)}</h3><span class="kick">${esc(L.kicker)}</span><p>${esc(L.summary)}</p>
        <button class="cs-go" type="button" data-p="${i}">${esc(T.read)} <span aria-hidden="true">→</span></button></div>
      <figure class="cs-fig rv" style="--d:.16s"><div class="schem" data-p="${i}">${schematic(mainCat(p))}</div></figure>
    </article>`;
  }).join('');
  $('#cases').onclick = (e) => { const b = e.target.closest('[data-p]'); if (b) openCase(+b.dataset.p, b.closest('.cs').querySelector('.cs-go')); };

  const counts = { all: PROJECTS.length };
  PROJECTS.forEach((p) => p.cats.forEach((c) => (counts[c] = (counts[c] || 0) + 1)));
  const fl = $('#filters');
  fl.innerHTML = Object.keys(T.filters).filter((k) => counts[k]).map((k) => `<button role="tab" type="button" data-f="${k}" aria-selected="${k === filter}">${esc(k === 'all' ? T.all : T.filters[k])}<sup>${counts[k]}</sup></button>`).join('');
  fl.onclick = (e) => { const b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; $$('button', fl).forEach((x) => x.setAttribute('aria-selected', String(x === b))); applyFilter(true); };
  $('#index-list').innerHTML = PROJECTS.map((p, i) => {
    const L = p[lang];
    return `<li data-cats="${p.cats.join(' ')}"><button type="button" data-p="${i}">
      <span class="ix-n">${pad(i + 1)}</span>
      <span class="ix-t"><b>${esc(L.title)}</b><span>${esc(L.kicker)}</span></span>
      <span class="ix-c">${esc(catsOf(p))}</span>
      <span class="ix-y">${esc(yearOf(p))}</span>
      <span class="ix-a" aria-hidden="true">→</span></button></li>`;
  }).join('');
  $('#index-list').onclick = (e) => { const b = e.target.closest('[data-p]'); if (b) openCase(+b.dataset.p, b); };
  applyFilter();
}
function applyFilter(anim) {
  let k = 0;
  $$('#index-list li').forEach((li) => {
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
  $('#case-meta').textContent = `${T.caseLabel} · ${pad(i + 1)} / ${PROJECTS.length} · ${yearOf(p)}`;
  $('#case-body').innerHTML = `<p class="mono" style="color:var(--muted)">${esc(catsOf(p))}</p>
    <h2 class="cb-t" id="case-title" style="margin-top:20px">${esc(L.title)}</h2>
    <p class="cb-k">${esc(L.kicker)}</p>
    <figure class="cb-fig"><div class="schem">${schematic(mainCat(p))}</div></figure>
    <div class="cb-g">
      <div><p class="kicker mono">${esc(T.overview)}</p><p>${esc(L.summary)}</p></div>
      <div><p class="kicker mono">${esc(T.built)}</p><ol class="cb-pts">${L.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
    </div>
    <div class="cb-row"><span class="mono">${esc(T.stackL)}</span><div class="skills">${p.stack.map((s) => (skillInfo(s, lang) ? `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>` : `<span class="sk" translate="no">${esc(s)}</span>`)).join('')}</div></div>
    <div class="cb-row"><span class="mono">${esc(T.year)}</span><span>${esc(yearOf(p))}</span></div>
    <div class="cb-act">${p.link ? `<a class="btn solid" href="${p.link}" target="_blank" rel="noopener">${esc(p.link.includes('github.com') ? T.viewCode : T.openSite)} <span class="arr" aria-hidden="true">↗</span></a>` : `<p class="cb-private">${esc(T.privateRepo)}</p>`}</div>
    <button class="cb-next" type="button" data-next="${next}"><span class="mono">${lang === 'fr' ? 'Projet suivant' : 'Next project'} · ${pad(next + 1)}</span><b>${esc(PROJECTS[next][lang].title)} →</b></button>`;
  $('.x span', d).textContent = T.close;
  const card = $('.case-card', d);
  if (d.hidden) {
    d.hidden = false;
    document.body.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('open')));
  }
  card.scrollTop = 0;
  card.focus({ preventScroll: true });
}
function closeCase() {
  const d = $('#case');
  if (d.hidden) return;
  d.classList.remove('open');
  document.body.classList.remove('lock');
  setTimeout(() => { d.hidden = true; }, REDUCED ? 0 : 450);
  lastFocus && lastFocus.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ 04 stack */
function renderLayers() {
  $('#layers').innerHTML = T.layers.map(([name, desc, techs], i) => `<li class="rv" style="--d:${(i * 0.05).toFixed(2)}s">
      <span class="ly-i">L${T.layers.length - i}</span>
      <div class="ly-n"><b>${esc(name)}</b><span>${esc(desc)}</span></div>
      <div class="skills">${techs.map((s) => `<button type="button" class="sk" data-skill="${esc(s)}" aria-expanded="false" translate="no">${esc(s)}</button>`).join('')}</div>
    </li>`).join('');
}

/* ------------------------------------------------------------------ 05 path */
const openRows = new Set([0]);
function fmtDate(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric' });
}
function renderCV() {
  $('#cv').innerHTML = EXPERIENCE.map((x, i) => {
    const L = x[lang];
    const org = (lang === 'fr' && x.orgFr) || x.org;
    return `<li class="cv-row rv${x.to ? '' : ' now'}${openRows.has(i) ? ' open' : ''}" data-i="${i}">
      <div class="cv-when">${x.to ? `${fmtDate(x.from)} – ${fmtDate(x.to)}` : `${fmtDate(x.from)} –<span class="now-t">${esc(T.present)}</span>`}</div>
      <div class="cv-body">
        <h3 class="cv-role">${esc(L.role)}</h3>
        <p class="cv-org">${icon(x.icon)}<span>${esc(org)}</span></p>
        <p class="cv-sum">${esc(L.sum)}</p>
        <div class="cv-pts" id="cvp${i}"><ul>${L.pts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
        <button type="button" class="cv-more" aria-expanded="${openRows.has(i)}" aria-controls="cvp${i}"><i aria-hidden="true">+</i><span>${esc(openRows.has(i) ? T.less : T.more)}</span></button>
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
}

/* ------------------------------------------------------------------ 06 contact */
function initContact() {
  $('#compose').onsubmit = (e) => {
    e.preventDefault();
    const v = $('#msg').value.trim();
    location.href = `mailto:abdelkader.elazzouzi@gmail.com?subject=${encodeURIComponent(lang === 'fr' ? 'Prise de contact via votre portfolio' : 'Hello from your portfolio')}&body=${encodeURIComponent(v)}`;
  };
}

/* ------------------------------------------------------------------ reveal, scroll, sections */
let revealIO;
function observeReveal(root = document) {
  const els = $$('.rv:not(.in), .split:not(.in)', root);
  if (REDUCED || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  if (!revealIO) revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => revealIO.observe(el));
}
function initScroll() {
  const nav = $('#nav'), prog = $('#progress'), fill = $('#route-fill');
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    nav.classList.toggle('scrolled', scrollY > 12);
    const r = $('.route-wrap').getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) fill.style.setProperty('--f', Math.max(0, Math.min(1, (innerHeight * 0.62 - r.top) / r.height)).toFixed(4));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
  const secs = $$('.sec');
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { current = e.target.id; e.target.classList.add('on'); markNav(); } else e.target.classList.remove('on'); });
    if (scrollY < innerHeight * 0.5) { current = ''; markNav(); }
  }, { rootMargin: '-40% 0px -55% 0px' });
  secs.forEach((s) => io.observe(s));
}
function initChrome() {
  $('#menu-btn').addEventListener('click', () => toggleSheet($('#menu-btn').getAttribute('aria-expanded') !== 'true'));
  $('#sheet').addEventListener('click', (e) => { if (e.target.closest('a')) toggleSheet(false); });
  $('#case').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeCase();
    const n = e.target.closest('[data-next]'); if (n) openCase(+n.dataset.next);
  });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#case').hidden) closeCase();
    else if ($('#menu-btn').getAttribute('aria-expanded') === 'true') { toggleSheet(false); $('#menu-btn').focus(); }
  });
  // keep keyboard focus inside the open case study
  $('#case').addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('#case button, #case a[href]').filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  let w = innerWidth;
  addEventListener('resize', () => { if ((w < 760) !== (innerWidth < 760)) renderHub(); w = innerWidth; });
}

/* ------------------------------------------------------------------ go */
function renderAll() {
  T = { ...UI[lang], ...COPY[lang] };
  fillText();
  renderNav();
  renderHub();
  renderNumbers();
  renderProfile();
  renderCompare();
  renderTeams();
  renderXTabs();
  renderWork();
  renderLayers();
  renderCV();
  if (caseIdx >= 0 && !$('#case').hidden) openCase(caseIdx);
  observeReveal();
}

initChrome();
initTip();
initContact();
renderAll();
initLang();
initScroll();
