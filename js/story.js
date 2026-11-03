// "In 60 seconds": a plain-language, animated explanation for non-technical visitors,
// followed by an interactive "what it changes for your team" flow chart.
import { $, $$, REDUCED, icon } from './util.js';
import { LANG } from './lang.js';

const gsap = window.gsap;
const NS = 'http://www.w3.org/2000/svg';
const FR = LANG === 'fr';
let CHAP_EL;
const CHAP = () => (CHAP_EL === undefined ? (CHAP_EL = document.getElementById('story')) : CHAP_EL);
const mk = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

/* ------------------------------------------------------------------ copy */
const TXT = FR ? {
  tiles: ['RH', 'Paie', 'Finance', 'Commercial', 'Chantiers', 'Accès IT'],
  hub: 'Hub d’intégration',
  steps: [
    { short: 'Le problème', title: 'Des dizaines d’applications qui ne se parlent pas', body: 'Une grande entreprise tourne sur des dizaines d’applications : RH, paie, finance, commercial, chantiers. Chacune garde sa propre copie des données. Les équipes ressaisissent les mêmes informations et les erreurs s’installent.', badge: '⚠ Le même salarié, 6 copies différentes' },
    { short: 'Je connecte', title: 'Je les connecte toutes', body: 'Je construis un standard central. Chaque application s’y branche une seule fois, puis l’information circule toute seule : de façon sûre, instantanée, dans plus de 80 pays.', badge: '✓ Branché une fois, synchronisé partout', tech: 'Techniquement : MuleSoft · 120+ API', go: 'mule' },
    { short: 'Une seule vérité', title: 'Une seule version fiable', body: 'Quand la même personne existe dans cinq systèmes avec cinq orthographes, je construis la version unique et fiable que toutes les applications utilisent : le « golden record ».', badge: '★ 1 fiche fiable au lieu de 3', tech: 'Techniquement : Informatica · MDM', go: 'infa' },
    { short: 'L’IA répond', title: 'Une IA qui répond aux questions', body: 'Sur ces données fiables, des assistants IA répondent aux questions du quotidien en langage naturel, sans jamais voir de mot de passe ni de secret.', badge: '🔒 Réponses sourcées, secrets protégés', tech: 'Techniquement : 30 serveurs MCP · Claude', go: 'ai' },
  ],
  q: 'Combien de personnes ont rejoint le site de Lyon ce mois-ci ?',
  a: '12 arrivées : 8 compagnons et 4 ingénieurs.',
  records: [['RH', 'BENALI Sara'], ['Paie', 'Sara Benali'], ['Accès IT', 's.benali']],
  golden: 'Sara BENALI',
  goldenSub: 'fiche unique ✓',
  prev: 'Précédent', next: 'Suivant', pause: 'Pause', play: 'Lecture',
} : {
  tiles: ['HR', 'Payroll', 'Finance', 'Sales', 'Job sites', 'IT access'],
  hub: 'Integration hub',
  steps: [
    { short: 'The problem', title: 'Dozens of apps that don’t talk', body: 'A large company runs on dozens of apps: HR, payroll, finance, sales, job sites. Each keeps its own copy of the data, so people re-type the same information and mistakes creep in.', badge: '⚠ Same employee, 6 different copies' },
    { short: 'I connect', title: 'I connect all of them', body: 'I build a central switchboard. Each app plugs in once, and information then flows on its own: securely, instantly, in 80+ countries.', badge: '✓ Plugged in once, synced everywhere', tech: 'Technically: MuleSoft · 120+ APIs', go: 'mule' },
    { short: 'One truth', title: 'One trusted version', body: 'When the same person exists in five systems with five spellings, I build the single, trusted version that every app uses: the “golden record”.', badge: '★ 1 trusted record instead of 3', tech: 'Technically: Informatica · MDM', go: 'infa' },
    { short: 'AI answers', title: 'AI that answers questions', body: 'On top of that trusted data, AI assistants answer everyday questions in plain language, without ever seeing passwords or secrets.', badge: '🔒 Sourced answers, secrets protected', tech: 'Technically: 30 MCP servers · Claude', go: 'ai' },
  ],
  q: 'How many people joined the Lyon site this month?',
  a: '12 new joiners: 8 site staff and 4 engineers.',
  records: [['HR', 'BENALI Sara'], ['Payroll', 'Sara Benali'], ['IT access', 's.benali']],
  golden: 'Sara BENALI',
  goldenSub: 'single record ✓',
  prev: 'Previous', next: 'Next', pause: 'Pause', play: 'Play',
};
const EMOJI = ['👥', '💶', '📊', '🤝', '🏗️', '🔐'];
const COLORS = ['#34d399', '#fbbf24', '#a78bfa', '#38bdf8', '#fb923c', '#f472b6'];

const TEAMS = FR ? [
  { id: 'hr', label: '👥 RH', src: ['🧑‍💼', 'Nouvelle recrue saisie une fois'], dst: [['💶', 'Paie'], ['🔐', 'Accès IT et badge'], ['🧾', 'Notes de frais'], ['🏗️', 'Outils projets'], ['📇', 'Annuaire'], ['📊', 'Pilotage RH']], stat: ['1', 'saisie', '6', 'applis à jour'], text: 'Un nouveau collaborateur est saisi une seule fois dans l’outil RH. En quelques minutes, la paie, les accès informatiques, les notes de frais et les outils projets sont à jour, dans plus de 80 pays.' },
  { id: 'fin', label: '💶 Finance', src: ['📨', 'Facture fournisseur reçue'], dst: [['✅', 'Contrôlée vs commande'], ['📒', 'Comptabilisée dans SAP'], ['🗄️', 'Archivée'], ['🔔', 'Statut renvoyé'], ['📊', 'Reporting']], stat: ['1', 'facture', '0', 'ressaisie'], text: 'Les factures arrivent sous forme électronique, sont contrôlées face aux commandes, comptabilisées dans SAP et archivées automatiquement, selon la norme de facturation électronique EN 16931.' },
  { id: 'ops', label: '🚜 Opérations', src: ['🚜', 'Engin réservé pour un chantier'], dst: [['🏭', 'ERP matériel'], ['🚚', 'Transport'], ['📦', 'Bon de livraison'], ['💶', 'Coûts dans SAP'], ['🧾', 'Dépenses']], stat: ['1', 'réservation', '5', 'mises à jour'], text: 'Réserver un engin pour un chantier déclenche le transport, le bon de livraison et l’imputation des coûts dans SAP, sans un seul e-mail.' },
  { id: 'mgmt', label: '📈 Direction', reverse: true, src: ['📈', 'Un tableau de bord fiable'], dst: [['👥', 'RH'], ['💶', 'Finance'], ['🏗️', 'Projets'], ['🤝', 'Commercial'], ['🚜', 'Opérations']], stat: ['5', 'sources', '1', 'seule vérité'], text: 'Les dirigeants voient une image cohérente, parce que chaque chiffre provient des mêmes données fiables, et non de cinq tableurs différents.' },
] : [
  { id: 'hr', label: '👥 HR', src: ['🧑‍💼', 'New hire entered once'], dst: [['💶', 'Payroll'], ['🔐', 'IT access & badge'], ['🧾', 'Expenses'], ['🏗️', 'Project tools'], ['📇', 'Directory'], ['📊', 'HR analytics']], stat: ['1', 'entry', '6', 'apps up to date'], text: 'A new employee is entered once in the HR system. Within minutes, payroll, IT access, expenses and project tools are all up to date, in 80+ countries.' },
  { id: 'fin', label: '💶 Finance', src: ['📨', 'Supplier invoice arrives'], dst: [['✅', 'Checked vs. order'], ['📒', 'Booked in SAP'], ['🗄️', 'Archived'], ['🔔', 'Status sent back'], ['📊', 'Reporting']], stat: ['1', 'invoice', '0', 're-typing'], text: 'Invoices arrive electronically, are checked against purchase orders, booked in SAP and archived automatically, following the EN 16931 e-invoicing standard.' },
  { id: 'ops', label: '🚜 Operations', src: ['🚜', 'Machine booked for a site'], dst: [['🏭', 'Equipment ERP'], ['🚚', 'Transport'], ['📦', 'Delivery note'], ['💶', 'Costs in SAP'], ['🧾', 'Expenses']], stat: ['1', 'booking', '5', 'updates'], text: 'Booking a machine for a job site triggers transport, the delivery note and the costs in SAP, without a single email.' },
  { id: 'mgmt', label: '📈 Leadership', reverse: true, src: ['📈', 'One trusted dashboard'], dst: [['👥', 'HR'], ['💶', 'Finance'], ['🏗️', 'Projects'], ['🤝', 'Sales'], ['🚜', 'Operations']], stat: ['5', 'sources', '1', 'version of the truth'], text: 'Leaders see one consistent picture, because every figure comes from the same trusted data instead of five different spreadsheets.' },
];

/* ------------------------------------------------------------------ helpers */
function wrap(text, max) {
  const words = text.split(' '); const lines = []; let cur = '';
  words.forEach((w) => { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}
function textBlock(parent, x, y, lines, attrs = {}, lh = 18) {
  const t = mk('text', { x, y, ...attrs }, parent);
  lines.forEach((l, i) => { const s = mk('tspan', { x, dy: i ? lh : 0 }, t); s.textContent = l; });
  return t;
}

/* ================================================================== STORY */
export function initStory() {
  const svg = $('#story-svg');
  if (!svg) return;
  const stage = $('.story-stage');
  let narrow = false, VW = 800, VH = 460;
  const M = { tiles: [], hub: { x: 400, y: 240, s: 0, a: 0 }, mess: { a: 1 }, links: { a: 0 }, cards: [], gold: { x: 400, y: 240, s: 0, a: 0 }, chat: { q: 0, a: 0, lock: 0 }, courier: { x: 0, y: 0, a: 0 } };
  let step = 0, packets = [], built = false, visible = false, raf = 0, last = 0;
  let G = {};

  const ringPos = (i, n = 6, squeeze = 1) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const rx = narrow ? VW * 0.36 : VW * 0.33, ry = (narrow ? VH * 0.33 : VH * 0.34) * squeeze;
    return [VW / 2 + Math.cos(a) * rx, VH * 0.5 + Math.sin(a) * ry];
  };
  const messPos = (i) => {
    const P = narrow
      ? [[0.2, 0.17], [0.72, 0.12], [0.84, 0.45], [0.66, 0.8], [0.22, 0.86], [0.15, 0.5]]
      : [[0.13, 0.24], [0.43, 0.13], [0.8, 0.22], [0.88, 0.66], [0.55, 0.84], [0.17, 0.74]];
    return [P[i][0] * VW, P[i][1] * VH];
  };

  function build() {
    narrow = stage.clientWidth < 620;
    VW = narrow ? 400 : 800; VH = narrow ? 430 : 440;
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.innerHTML = '';
    const defs = mk('defs', {}, svg);
    defs.innerHTML = `<radialGradient id="hubGlow"><stop offset="0" style="stop-color:rgba(var(--accent-rgb),.5)"/><stop offset="1" style="stop-color:rgba(var(--accent-rgb),0)"/></radialGradient>`;
    G.mess = mk('g', { class: 'st-mess' }, svg);
    G.links = mk('g', { class: 'st-links' }, svg);
    G.packets = mk('g', {}, svg);
    G.hub = mk('g', { class: 'st-hub' }, svg);
    G.tiles = mk('g', {}, svg);
    G.cards = mk('g', {}, svg);
    G.chat = mk('g', {}, svg);
    G.courier = mk('g', { class: 'st-courier' }, svg);

    // spaghetti: each app talks to several others with its own ad-hoc link
    G.messPaths = [];
    [[0, 2], [0, 3], [1, 4], [1, 5], [2, 5], [3, 5], [0, 4], [2, 4]].forEach(([a, b]) => {
      G.messPaths.push({ a, b, el: mk('path', { class: 'st-tangle' }, G.mess) });
    });
    // hub
    mk('circle', { r: narrow ? 70 : 90, fill: 'url(#hubGlow)' }, G.hub);
    mk('rect', { x: -58, y: -34, width: 116, height: 68, rx: 18, class: 'st-hub-box' }, G.hub);
    const hi = mk('g', { transform: 'translate(-11,-24) scale(0.92)', class: 'st-hub-ic' }, G.hub);
    hi.innerHTML = icon('mulesoft').replace('<svg ', '<svg width="24" height="24" ');
    const ht = mk('text', { y: 20, class: 'st-hub-t', 'text-anchor': 'middle' }, G.hub); ht.textContent = TXT.hub;
    G.lock = mk('text', { x: -78, y: 8, 'text-anchor': 'middle', class: 'st-lock' }, G.hub); G.lock.textContent = '🔒';

    // tiles
    G.linkPaths = [];
    M.tiles = TXT.tiles.map((label, i) => {
      const [x, y] = messPos(i);
      const g = mk('g', { class: 'st-tile' }, G.tiles);
      const r = narrow ? 27 : 32;
      mk('circle', { r, class: 'st-tile-c', style: `--c:${COLORS[i]}` }, g);
      const e = mk('text', { y: narrow ? 8 : 9, 'text-anchor': 'middle', class: 'st-emoji' }, g); e.textContent = EMOJI[i];
      const l = mk('text', { y: r + 18, 'text-anchor': 'middle', class: 'st-label' }, g); l.textContent = label;
      G.linkPaths.push(mk('path', { class: 'st-link', style: `--c:${COLORS[i]}` }, G.links));
      return { g, x, y, s: 1, a: 1 };
    });

    // record cards (scene 3)
    M.cards = TXT.records.map(([src, name], i) => {
      const g = mk('g', { class: 'st-card' }, G.cards);
      mk('rect', { x: -66, y: -24, width: 132, height: 48, rx: 10 }, g);
      const s = mk('text', { x: -54, y: -5, class: 'st-card-src' }, g); s.textContent = src;
      const n = mk('text', { x: -54, y: 13, class: 'st-card-name' }, g); n.textContent = name;
      return { g, x: 0, y: 0, s: 0.6, a: 0, i };
    });
    const gg = mk('g', { class: 'st-gold' }, G.cards);
    mk('rect', { x: -80, y: -30, width: 160, height: 60, rx: 14 }, gg);
    const g1 = mk('text', { x: 0, y: -4, 'text-anchor': 'middle', class: 'st-gold-name' }, gg); g1.textContent = '★ ' + TXT.golden;
    const g2 = mk('text', { x: 0, y: 16, 'text-anchor': 'middle', class: 'st-gold-sub' }, gg); g2.textContent = TXT.goldenSub;
    G.gold = gg;

    // chat bubbles (scene 4)
    const maxChars = narrow ? 30 : 34;
    const bub = (txt, cls) => {
      const g = mk('g', { class: `st-bubble ${cls}` }, G.chat);
      const lines = wrap(txt, maxChars);
      const w = Math.min(maxChars, Math.max(...lines.map((l) => l.length))) * 7.4 + 30, h = lines.length * 18 + 22;
      mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16 }, g);
      textBlock(g, 0, -h / 2 + 25, lines, { 'text-anchor': 'middle' });
      return { g, h };
    };
    G.q = bub(TXT.q, 'q'); G.a = bub(TXT.a, 'a');

    // courier (scene 1): someone carrying a document between apps
    const cg = mk('text', { 'text-anchor': 'middle', class: 'st-courier-t' }, G.courier); cg.textContent = '🏃📄';
    built = true;
    applyStep(step, true);
  }

  /* -------- scene choreography -------- */
  let courierTl = null;
  function applyStep(n, instant = false) {
    step = n;
    const d = instant || REDUCED || !gsap ? 0 : 1;
    const to = (o, v, extra = {}) => (gsap ? gsap.to(o, { ...v, duration: (extra.duration ?? 1.1) * d, ease: extra.ease || 'expo.inOut', delay: (extra.delay || 0) * d, overwrite: 'auto' }) : Object.assign(o, v));
    const hubY = n === 3 ? VH * 0.5 : VH * 0.5;
    M.tiles.forEach((t, i) => {
      const [x, y] = n === 0 ? messPos(i) : ringPos(i, 6, n === 3 ? 0.58 : 1);
      to(t, { x, y, s: n === 3 ? 0.82 : 1, a: n === 3 ? 0.45 : 1 }, { delay: i * 0.04 });
    });
    to(M.hub, { x: VW / 2, y: hubY, s: n === 0 ? 0 : 1, a: n === 0 ? 0 : 1 }, { ease: n === 0 ? 'power3.in' : 'back.out(1.6)', delay: n === 0 ? 0 : 0.3 });
    to(M.mess, { a: n === 0 ? 1 : 0 }, { duration: 0.6 });
    to(M.links, { a: n === 0 ? 0 : n === 1 ? 1 : 0.35 }, { duration: 0.8, delay: n === 1 ? 0.5 : 0 });
    to(M.chat, { lock: n === 3 ? 1 : 0 }, { duration: 0.5 });
    // courier
    if (courierTl) { courierTl.kill(); courierTl = null; }
    M.courier.a = 0;
    if (n === 0 && gsap && !REDUCED) {
      courierTl = gsap.timeline({ repeat: -1, delay: 0.6 });
      const seq = [0, 3, 1, 5, 2, 4];
      seq.forEach((k, j) => {
        const [x, y] = messPos(k);
        courierTl.to(M.courier, { x, y: y - 46, a: 1, duration: j ? 1.4 : 0.01, ease: 'sine.inOut' });
        courierTl.to({}, { duration: 0.35 });
      });
    }
    // cards
    M.cards.forEach((c, i) => {
      const src = M.tiles[[0, 1, 5][i]];
      if (n === 2) {
        const [sx, sy] = ringPos([0, 1, 5][i]);
        const off = narrow ? [[-120, -150], [120, -150], [0, 150]][i] : [[-230, -120], [230, -120], [-230, 120]][i];
        gsap && !instant ? gsap.timeline()
          .set(c, { x: sx, y: sy, s: 0.4, a: 0 })
          .to(c, { x: VW / 2 + off[0] * (narrow ? 0.9 : 1), y: VH / 2 + off[1] * (narrow ? 0.9 : 1), s: 1, a: 1, duration: 0.8, ease: 'back.out(1.6)', delay: 0.4 + i * 0.15 })
          .to(c, { x: VW / 2, y: VH / 2, s: 0.4, a: 0, duration: 0.7, ease: 'power3.in', delay: 1.1 - i * 0.1 })
          : Object.assign(c, { a: 0 });
      } else to(c, { a: 0, s: 0.4 }, { duration: 0.3 });
      void src;
    });
    if (n === 2) { gsap ? gsap.timeline().set(M.gold, { x: VW / 2, y: VH / 2, s: 0.3, a: 0 }).to(M.gold, { s: 1, a: 1, duration: instant ? 0 : 0.9, ease: 'elastic.out(1,0.55)', delay: instant ? 0 : 3.0 }) : Object.assign(M.gold, { s: 1, a: 1 }); }
    else to(M.gold, { a: 0, s: 0.5 }, { duration: 0.4 });
    // chat
    if (n === 3) {
      const qy = narrow ? VH * 0.11 : VH * 0.11, ay = narrow ? VH * 0.89 : VH * 0.89;
      gsap && !instant ? gsap.timeline()
        .set(M.chat, { q: 0, a: 0 }).set(M.chat, { qy, ay })
        .to(M.chat, { q: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.5 })
        .add(() => sendQuestion(), '+=0.2')
        .to(M.chat, { a: 1, duration: 0.6, ease: 'back.out(2)' }, '+=2.2')
        : Object.assign(M.chat, { q: 1, a: 1, qy, ay });
    } else to(M.chat, { q: 0, a: 0 }, { duration: 0.3 });
    packets.forEach((p) => p.el && p.el.remove());
    packets = [];
    if (!raf) kick();
  }

  function sendQuestion() {
    // question → hub → 3 apps → hub → answer
    const hub = () => [M.hub.x, M.hub.y];
    const qp = () => [VW / 2, M.chat.qy + G.q.h / 2];
    const ap = () => [VW / 2, M.chat.ay - G.a.h / 2];
    packets.push({ seg: [qp, hub], t: 0, v: 1.6, c: '#f472b6' });
    [0, 2, 4].forEach((k, j) => setTimeout(() => {
      if (step !== 3) return;
      packets.push({ seg: [hub, () => [M.tiles[k].x, M.tiles[k].y], hub], t: 0, v: 0.9, c: COLORS[k] });
    }, 650 + j * 120));
    setTimeout(() => { if (step === 3) packets.push({ seg: [hub, ap], t: 0, v: 1.4, c: '#34d399' }); }, 2400);
  }

  /* -------- render loop -------- */
  function render(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (document.body.classList.contains('intro-open') || (CHAP() && CHAP().__live === false)) { raf = 0; setTimeout(kick, 200); return; }
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    // tiles
    M.tiles.forEach((t, i) => {
      t.g.setAttribute('transform', `translate(${t.x.toFixed(1)},${t.y.toFixed(1)}) scale(${t.s.toFixed(3)})`);
      t.g.style.opacity = t.a;
      G.linkPaths[i].setAttribute('d', `M${t.x},${t.y} L${M.hub.x},${M.hub.y}`);
    });
    G.links.style.opacity = M.links.a;
    G.mess.style.opacity = M.mess.a;
    G.messPaths.forEach((m, k) => {
      const A = M.tiles[m.a], B = M.tiles[m.b];
      const wob = Math.sin(now / 900 + k) * 22;
      m.el.setAttribute('d', `M${A.x},${A.y} Q${(A.x + B.x) / 2 + wob},${(A.y + B.y) / 2 - wob} ${B.x},${B.y}`);
    });
    G.hub.setAttribute('transform', `translate(${M.hub.x},${M.hub.y}) scale(${M.hub.s.toFixed(3)})`);
    G.hub.style.opacity = M.hub.a;
    G.lock.style.opacity = M.chat.lock;
    G.courier.setAttribute('transform', `translate(${M.courier.x.toFixed(1)},${M.courier.y.toFixed(1)})`);
    G.courier.style.opacity = step === 0 ? M.courier.a : 0;
    M.cards.forEach((c) => { c.g.setAttribute('transform', `translate(${c.x},${c.y}) scale(${c.s})`); c.g.style.opacity = c.a; });
    G.gold.setAttribute('transform', `translate(${M.gold.x},${M.gold.y}) scale(${M.gold.s})`); G.gold.style.opacity = M.gold.a;
    G.q.g.setAttribute('transform', `translate(${VW / 2},${M.chat.qy || 0}) scale(${0.6 + 0.4 * M.chat.q})`); G.q.g.style.opacity = M.chat.q;
    G.a.g.setAttribute('transform', `translate(${VW / 2},${M.chat.ay || 0}) scale(${0.6 + 0.4 * M.chat.a})`); G.a.g.style.opacity = M.chat.a;

    // packets: in "connected" scenes, data hops app → hub → another app
    if ((step === 1 || step === 2) && !REDUCED && packets.length < (narrow ? 10 : 16) && Math.random() < (step === 1 ? 0.12 : 0.05)) {
      const a = (Math.random() * 6) | 0; let b = (Math.random() * 6) | 0; if (b === a) b = (a + 3) % 6;
      packets.push({ seg: [() => [M.tiles[a].x, M.tiles[a].y], () => [M.hub.x, M.hub.y], () => [M.tiles[b].x, M.tiles[b].y]], t: 0, v: 0.55 + Math.random() * 0.3, c: COLORS[a] });
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += p.v * dt;
      const legs = p.seg.length - 1;
      if (p.t >= legs) { p.el && p.el.remove(); packets.splice(i, 1); continue; }
      const k = Math.floor(p.t), f = p.t - k;
      const A = p.seg[k](), B = p.seg[k + 1]();
      if (!p.el) p.el = mk('circle', { r: narrow ? 4.5 : 5, class: 'st-packet', fill: p.c, style: `color:${p.c}` }, G.packets);
      p.el.setAttribute('cx', (A[0] + (B[0] - A[0]) * f).toFixed(1));
      p.el.setAttribute('cy', (A[1] + (B[1] - A[1]) * f).toFixed(1));
    }
    raf = requestAnimationFrame(render);
  }
  const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(render); } };

  /* -------- copy, steps, controls -------- */
  const stepsEl = $('#story-steps');
  stepsEl.innerHTML = TXT.steps.map((s, i) => `<button role="tab" type="button" data-i="${i}" aria-selected="${i === 0}"><span class="sn">${i + 1}</span><span class="sl">${s.short}</span><i class="sp"></i></button>`).join('');
  const titleEl = $('#story-title'), bodyEl = $('#story-body'), techEl = $('#story-tech'), badgeEl = $('#story-badge'), numEl = $('#story-num');
  $('#story-prev').setAttribute('aria-label', TXT.prev);
  $('#story-next').setAttribute('aria-label', TXT.next);

  function showCopy(n) {
    const s = TXT.steps[n];
    $$('button', stepsEl).forEach((b, i) => { b.setAttribute('aria-selected', String(i === n)); b.classList.toggle('done', i < n); });
    const set = () => {
      numEl.textContent = String(n + 1).padStart(2, '0') + ' / 04';
      titleEl.textContent = s.title; bodyEl.textContent = s.body;
      badgeEl.textContent = s.badge;
      if (s.tech) { techEl.hidden = false; techEl.querySelector('span').textContent = s.tech; techEl.dataset.go = s.go; } else techEl.hidden = true;
    };
    if (gsap && !REDUCED) {
      gsap.timeline()
        .to(['#story-title', '#story-body', '#story-tech', '#story-badge'], { y: -10, opacity: 0, duration: 0.2, ease: 'power2.in' })
        .add(set)
        .fromTo(['#story-title', '#story-body', '#story-tech', '#story-badge'], { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' });
    } else set();
  }

  // autoplay with per-step progress
  const DUR = 7.5;
  let playing = !REDUCED, prog = 0, userTouched = false;
  const playBtn = $('#story-play');
  const setPlayIcon = () => { playBtn.innerHTML = playing ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>'; playBtn.setAttribute('aria-label', playing ? TXT.pause : TXT.play); };
  setPlayIcon();
  function go(n, fromUser) {
    n = (n + 4) % 4;
    if (fromUser) { userTouched = true; }
    prog = 0;
    showCopy(n);
    applyStep(n);
  }
  let lastTick = performance.now();
  (function tick(now) {
    const dt = (now - lastTick) / 1000; lastTick = now;
    if (playing && visible && !document.body.classList.contains('intro-open')) {
      prog += dt / DUR;
      if (prog >= 1) go(step + 1);
    }
    const cur = $$('.sp', stepsEl)[step];
    if (cur) cur.style.transform = `scaleX(${playing ? prog : 1})`;
    requestAnimationFrame(tick);
  })(performance.now());

  stepsEl.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) go(+b.dataset.i, true); });
  $('#story-prev').addEventListener('click', () => go(step - 1, true));
  $('#story-next').addEventListener('click', () => go(step + 1, true));
  playBtn.addEventListener('click', () => { playing = !playing; setPlayIcon(); });
  // swipe on the stage
  let sx = null;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  stage.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 45) go(step + (dx < 0 ? 1 : -1), true); });
  techEl.addEventListener('click', (e) => {
    const g = techEl.dataset.go;
    if (g === 'mule' || g === 'infa') { e.preventDefault(); document.dispatchEvent(new CustomEvent('goto-platform', { detail: g })); }
  });
  void userTouched;

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { if (!built) build(); kick(); } }, { rootMargin: '80px' }).observe(stage);
  let lastNarrow = null;
  new ResizeObserver(() => { const nn = stage.clientWidth < 620; if (built && nn !== lastNarrow) { lastNarrow = nn; build(); } lastNarrow = nn; }).observe(stage);
  showCopy(0);

  initTeams();
}

/* ================================================================== TEAMS */
function initTeams() {
  const svg = $('#team-svg'), tabs = $('#team-tabs'), textEl = $('#team-text'), statEl = $('#team-stat'), stage = $('.team-stage');
  if (!svg) return;
  tabs.innerHTML = TEAMS.map((t, i) => `<button role="tab" type="button" data-i="${i}" aria-selected="${i === 0}">${t.label}</button>`).join('');
  let cur = 0, bands = [], packets = [], visible = false, raf = 0, last = 0, narrow = false;

  function draw(i, animate = true) {
    cur = i;
    const T = TEAMS[i];
    narrow = stage.clientWidth < 620;
    const n = T.dst.length;
    const VW = narrow ? 400 : 860, VH = narrow ? 230 + (Math.ceil(n / 2) - 1) * 92 + 44 : 380;
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.innerHTML = '';
    const gB = mk('g', {}, svg), gP = mk('g', {}, svg), gN = mk('g', {}, svg);
    const node = (x, y, emoji, label, cls, w = narrow ? 168 : 196) => {
      const outer = mk('g', { class: `tm-node ${cls}`, transform: `translate(${x},${y})` }, gN);
      const g = mk('g', {}, outer);
      mk('rect', { x: -w / 2, y: -22, width: w, height: 44, rx: 22 }, g);
      const e = mk('text', { x: -w / 2 + 24, y: 7, 'text-anchor': 'middle', class: 'tm-emoji' }, g); e.textContent = emoji;
      const lines = wrap(label, narrow ? 17 : 21);
      textBlock(g, -w / 2 + 44, lines.length > 1 ? -2 : 5, lines.slice(0, 2), { class: 'tm-label' }, 14);
      return g;
    };
    let src, hub, dsts;
    if (narrow) {
      src = [VW / 2, 40]; hub = [VW / 2, 128];
      dsts = T.dst.map((_, k) => [k % 2 ? VW * 0.74 : VW * 0.26, 230 + Math.floor(k / 2) * 92]);
    } else {
      src = [130, VH / 2]; hub = [400, VH / 2];
      dsts = T.dst.map((_, k) => [690, 44 + (k / (n - 1)) * (VH - 88)]);
    }
    bands = dsts.map((d, k) => {
      const dd = narrow
        ? `M${hub[0]},${hub[1]} C${hub[0]},${hub[1] + 60} ${d[0]},${d[1] - 70} ${d[0]},${d[1] - 22}`
        : `M${hub[0]},${hub[1]} C${hub[0] + 140},${hub[1]} ${d[0] - 160},${d[1]} ${d[0] - 98},${d[1]}`;
      const p = mk('path', { d: dd, class: 'tm-band', style: `--c:${COLORS[k % COLORS.length]}` }, gB);
      return { p, L: p.getTotalLength(), c: COLORS[k % COLORS.length] };
    });
    const trunkD = narrow ? `M${src[0]},${src[1] + 22} L${hub[0]},${hub[1]}` : `M${src[0] + 98},${src[1]} L${hub[0]},${hub[1]}`;
    const trunk = mk('path', { d: trunkD, class: 'tm-trunk' }, gB);
    const trunkL = trunk.getTotalLength();
    // hub
    const hgo = mk('g', { class: 'tm-hub', transform: `translate(${hub[0]},${hub[1]})` }, gN);
    const hg = mk('g', {}, hgo);
    mk('circle', { r: 30 }, hg);
    const hi = mk('g', { transform: 'translate(-12,-12)' }, hg); hi.innerHTML = icon(T.id === 'mgmt' ? 'informatica' : 'mulesoft').replace('<svg ', '<svg width="24" height="24" ');
    const srcNode = node(src[0], src[1], T.src[0], T.src[1], 'src', narrow ? 250 : 196);
    const dstNodes = T.dst.map((d, k) => node(dsts[k][0], dsts[k][1], d[0], d[1], 'dst'));
    // entrance
    if (gsap && !REDUCED && animate) {
      gsap.fromTo(srcNode, { opacity: 0, scale: 0.7, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
      gsap.fromTo(hg, { opacity: 0, scale: 0.3, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.15 });
      trunk.style.strokeDasharray = trunkL; trunk.style.strokeDashoffset = trunkL;
      gsap.to(trunk, { strokeDashoffset: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
      bands.forEach((b, k) => { b.p.style.strokeDasharray = b.L; b.p.style.strokeDashoffset = b.L; gsap.to(b.p, { strokeDashoffset: 0, duration: 0.7, delay: 0.35 + k * 0.08, ease: 'power2.inOut', onComplete: () => { b.p.style.strokeDasharray = ''; } }); });
      gsap.fromTo(dstNodes, { opacity: 0, x: narrow ? 0 : 20, y: narrow ? 20 : 0 }, { opacity: 1, x: 0, y: 0, duration: 0.5, stagger: 0.08, delay: 0.5, ease: 'power3.out', clearProps: 'x,y' });
    }
    // packets travel the whole route: entry → hub → each app (or reverse for leadership)
    packets = [];
    const route = (k) => ({ trunk, trunkL, band: bands[k] });
    let spawnT = 0;
    gP.dataset.k = '0';
    G_TEAM = { gP, route, spawn: () => { const k = (Math.random() * bands.length) | 0; packets.push({ k, t: 0, el: mk('circle', { r: 5, class: 'st-packet', fill: bands[k].c, style: `color:${bands[k].c}` }, gP) }); }, reverse: !!T.reverse };
    void spawnT;
    // copy + stat counter
    statEl.innerHTML = `<b data-n="${T.stat[0]}">0</b> <span>${T.stat[1]}</span> <i>→</i> <b data-n="${T.stat[2]}">0</b> <span>${T.stat[3]}</span>`;
    $$('b', statEl).forEach((b) => {
      const target = +b.dataset.n;
      if (!gsap || REDUCED) { b.textContent = target; return; }
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.2, delay: 0.4, ease: 'power2.out', onUpdate: () => (b.textContent = Math.round(o.v)) });
    });
    if (gsap && !REDUCED) gsap.fromTo([statEl, textEl], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.2 });
    textEl.textContent = T.text;
    $$('button', tabs).forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  }

  let G_TEAM = null;
  function render(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (CHAP() && CHAP().__live === false) { raf = 0; setTimeout(kick, 200); return; }
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (G_TEAM && !REDUCED && packets.length < 14 && Math.random() < 0.09) G_TEAM.spawn();
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += dt * 0.7;
      if (p.t >= 2) { p.el.remove(); packets.splice(i, 1); continue; }
      const { trunk, trunkL, band } = G_TEAM.route(p.k);
      let tt = G_TEAM.reverse ? 2 - p.t : p.t;
      const pt = tt < 1 ? trunk.getPointAtLength(trunkL * tt) : band.p.getPointAtLength(band.L * (tt - 1));
      p.el.setAttribute('cx', pt.x.toFixed(1)); p.el.setAttribute('cy', pt.y.toFixed(1));
    }
    raf = requestAnimationFrame(render);
  }
  const kick = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(render); } };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { draw(+b.dataset.i); kick(); } });
  let drawn = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !drawn) { drawn = true; draw(0); } kick(); }, { rootMargin: '60px' }).observe(stage);
  let lastNarrow = null;
  new ResizeObserver(() => { const nn = stage.clientWidth < 620; if (drawn && lastNarrow !== null && nn !== lastNarrow) draw(cur, false); lastNarrow = nn; }).observe(stage);
}
