// Lightweight canvas flows and SVG charts. One rule everywhere: draw only while visible.
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHONE = innerWidth < 760;
const NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------------ helpers */
export function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
const hcurve = (a, b, k = 0.5) => { const dx = (b[0] - a[0]) * k; return [a, [a[0] + dx, a[1]], [b[0] - dx, b[1]], b]; };
const vcurve = (a, b, k = 0.5) => { const dy = (b[1] - a[1]) * k; return [a, [a[0], a[1] + dy], [b[0], b[1] - dy], b]; };
function sampleRoute(curves, n = 24) {
  const pts = [];
  curves.forEach((c, i) => { for (let k = i ? 1 : 0; k <= n; k++) pts.push(bez(c[0], c[1], c[2], c[3], k / n)); });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, L: cum[cum.length - 1] };
}
function at(r, s) {
  if (s <= 0) return r.pts[0];
  if (s >= r.L) return r.pts[r.pts.length - 1];
  let lo = 0, hi = r.cum.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (r.cum[m] < s) lo = m; else hi = m; }
  const t = (s - r.cum[lo]) / (r.cum[hi] - r.cum[lo] || 1);
  return [r.pts[lo][0] + (r.pts[hi][0] - r.pts[lo][0]) * t, r.pts[lo][1] + (r.pts[hi][1] - r.pts[lo][1]) * t];
}
const strokeCurve = (ctx, c) => { ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); ctx.bezierCurveTo(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]); ctx.stroke(); };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

/** Canvas sized to its box, DPR-capped, animating only while on screen. Returns a controller. */
export function loop(canvas, draw, { onResize } = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, PHONE ? 1.5 : 2);
  const st = { ctx, w: 0, h: 0, t: 0, visible: false, dead: false };
  let raf = 0, last = 0;
  const size = () => {
    st.w = canvas.clientWidth; st.h = canvas.clientHeight;
    if (!st.w || !st.h) return;
    canvas.width = Math.round(st.w * dpr); canvas.height = Math.round(st.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize && onResize(st);
    if (REDUCED || !st.visible) draw(st, 0);
  };
  const frame = (now) => {
    raf = 0;
    if (st.dead || !st.visible || document.hidden) return;
    const dt = Math.min(0.05, Math.max(0, (now - (last || now)) / 1000)); last = now;
    st.t += dt;
    draw(st, dt);
    if (!REDUCED) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && !st.dead) { last = 0; raf = requestAnimationFrame(frame); } };
  const ro = new ResizeObserver(size); ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (st.visible) kick(); }, { rootMargin: '60px' });
  io.observe(canvas);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  size();
  return { st, kick, resize: size, destroy() { st.dead = true; ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); } };
}

/* ------------------------------------------------------------------ hero: systems → hub → consumers */
export function heroFlow(canvas, { sources, targets, hub, compact = false, hubColor = ['#a9b5ff', '#5b6cf0'], cols }) {
  const COLS = cols || ['#4fd1ff', '#8b9bff', '#34d399', '#f472b6', '#fbbf24'];
  const FONT = compact ? '500 11.5px Inter, sans-serif' : '500 12.5px Inter, sans-serif', PH = compact ? 26 : 30, HR = compact ? 30 : 36;
  let nodesL = [], nodesR = [], H = [0, 0], routes = [], packets = [], hover = -1;
  const pill = (ctx, x, y, label, align, hot, col) => {
    ctx.font = FONT;
    const w = ctx.measureText(label).width + 30, h = PH;
    const x0 = align === 'l' ? x : x - w;
    ctx.fillStyle = hot ? rgba(col, 0.18) : 'rgba(16,19,27,.95)';
    ctx.strokeStyle = hot ? col : 'rgba(255,255,255,.14)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, 15); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x0 + 13, y, 3.5, 0, 6.283); ctx.fill();
    ctx.fillStyle = hot ? '#fff' : '#dfe3ec'; ctx.fillText(label, x0 + 22, y + 4.5);
    return [x0, x0 + w];
  };
  const ctl = loop(canvas, draw, {
    onResize: (s) => {
      const padY = 26;
      const ys = (n) => Array.from({ length: n }, (_, i) => padY + 18 + (i * (s.h - 2 * padY - 36)) / Math.max(1, n - 1));
      H = [s.w * 0.5, s.h * 0.5];
      const yl = ys(sources.length), yr = ys(targets.length);
      nodesL = sources.map((l, i) => ({ l, x: 4, y: yl[i], c: COLS[i % COLS.length] }));
      nodesR = targets.map((l, i) => ({ l, x: s.w - 4, y: yr[i] }));
      // edges measured roughly by label length
      const ctx = s.ctx; ctx.font = FONT;
      nodesL.forEach((n) => { n.e = n.x + ctx.measureText(n.l).width + 30; });
      nodesR.forEach((n) => { n.e = n.x - ctx.measureText(n.l).width - 30; });
      routes = [];
      nodesL.forEach((a, i) => nodesR.forEach((b, j) => {
        routes.push({ i, j, r: sampleRoute([hcurve([a.e, a.y], [H[0] - HR, H[1]], 0.55), hcurve([H[0] + HR, H[1]], [b.e, b.y], 0.55)]) });
      }));
    },
  });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    hover = -1;
    nodesL.forEach((n, i) => { if (x < n.e + 10 && Math.abs(y - n.y) < PH / 2 + 2) hover = i; });
    canvas.style.cursor = hover >= 0 ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { hover = -1; });
  canvas.addEventListener('click', () => { if (hover >= 0) for (let k = 0; k < 8; k++) spawn(hover, k * 0.06); });
  function spawn(i = (Math.random() * nodesL.length) | 0, delay = 0) {
    const cand = routes.filter((r) => r.i === i);
    const r = cand[(Math.random() * cand.length) | 0];
    if (r) packets.push({ r: r.r, s: -delay * 200, v: 150 + Math.random() * 90, c: nodesL[i].c });
  }
  function draw(s, dt) {
    const { ctx, w, h, t } = s;
    ctx.clearRect(0, 0, w, h);
    if (!nodesL.length) return;
    // links
    ctx.lineWidth = 1.2;
    nodesL.forEach((a, i) => { ctx.strokeStyle = hover === i ? rgba(a.c, 0.7) : rgba(a.c, hover >= 0 ? 0.08 : 0.22); strokeCurve(ctx, hcurve([a.e, a.y], [H[0] - HR, H[1]], 0.55)); });
    nodesR.forEach((b) => { ctx.strokeStyle = 'rgba(139,155,255,.25)'; strokeCurve(ctx, hcurve([H[0] + HR, H[1]], [b.e, b.y], 0.55)); });
    // packets
    if (!REDUCED && packets.length < (PHONE ? 22 : 40) && Math.random() < (hover >= 0 ? 0.35 : 0.18)) spawn(hover >= 0 && Math.random() < 0.7 ? hover : undefined);
    for (let k = packets.length - 1; k >= 0; k--) {
      const p = packets[k];
      p.s += p.v * dt;
      if (p.s > p.r.L) { packets.splice(k, 1); continue; }
      if (p.s < 0) continue;
      const [x, y] = at(p.r, p.s), [x2, y2] = at(p.r, p.s - 14);
      ctx.strokeStyle = rgba(p.c, 0.5); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill();
    }
    // hub
    const pulse = REDUCED ? 0 : (t % 2.4) / 2.4;
    ctx.strokeStyle = `rgba(139,155,255,${0.5 * (1 - pulse)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(H[0], H[1], HR + pulse * 22, 0, 6.283); ctx.stroke();
    const g = ctx.createRadialGradient(H[0], H[1] - 10, 4, H[0], H[1], HR + 4);
    g.addColorStop(0, hubColor[0]); g.addColorStop(1, hubColor[1]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(H[0], H[1], HR, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#07080b'; ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'center';
    hub.forEach((l, i) => ctx.fillText(l, H[0], H[1] + 4 + (i - (hub.length - 1) / 2) * 13));
    ctx.textAlign = 'left';
    nodesL.forEach((n, i) => pill(ctx, n.x, n.y, n.l, 'l', hover === i, n.c));
    nodesR.forEach((n) => pill(ctx, n.x, n.y, n.l, 'r', false, '#8b9bff'));
  }
  return ctl;
}

/* ------------------------------------------------------------------ architecture connectors */
export function archFlow(canvas, grid, getModel) {
  let paths = [], packets = [], model = null;
  const rel = (el) => { const g = grid.getBoundingClientRect(), r = el.getBoundingClientRect(); return { l: r.left - g.left, r: r.right - g.left, t: r.top - g.top, b: r.bottom - g.top, cx: (r.left + r.right) / 2 - g.left, cy: (r.top + r.bottom) / 2 - g.top }; };
  const build = () => {
    model = getModel();
    paths = [];
    if (!model || innerWidth <= 900) return;
    const { sysEls, domEls, conEls, domains } = model;
    domains.forEach((d) => {
      const de = domEls[d.id]; if (!de) return;
      const db = rel(de);
      d.sys.forEach((s) => { const se = sysEls[s]; if (!se) return; const sb = rel(se); paths.push({ d: d.id, k: 'in', c: hcurve([sb.r, sb.cy], [db.l, db.cy], 0.6) }); });
      d.use.forEach((u) => { const ce = conEls[u]; if (!ce) return; const cb = rel(ce); paths.push({ d: d.id, k: 'out', c: hcurve([db.r, db.cy], [cb.l, cb.cy], 0.6) }); });
    });
    paths.forEach((p) => { p.r = sampleRoute([p.c], 20); });
    packets = [];
  };
  const ctl = loop(canvas, draw, { onResize: build });
  function draw(s, dt) {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    if (!paths.length) return;
    const sel = model.selected(), col = model.color;
    ctx.lineWidth = 1.2;
    paths.forEach((p) => {
      const on = !sel || p.d === sel;
      ctx.strokeStyle = on ? rgba(col, sel ? 0.75 : 0.22) : 'rgba(255,255,255,.04)';
      strokeCurve(ctx, p.c);
    });
    const pool = sel ? paths.filter((p) => p.d === sel) : paths;
    if (!REDUCED && pool.length && packets.length < (sel ? 26 : 34) && Math.random() < (sel ? 0.5 : 0.3)) {
      const p = pool[(Math.random() * pool.length) | 0];
      packets.push({ p, s: 0, v: 160 + Math.random() * 80 });
    }
    for (let k = packets.length - 1; k >= 0; k--) {
      const q = packets[k];
      if (sel && q.p.d !== sel) { packets.splice(k, 1); continue; }
      q.s += q.v * dt;
      if (q.s > q.p.r.L) { packets.splice(k, 1); continue; }
      const [x, y] = at(q.p.r, q.s), [x2, y2] = at(q.p.r, q.s - 12);
      ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
    }
  }
  return { ...ctl, rebuild: () => { build(); ctl.st.visible || draw(ctl.st, 0); } };
}

/* ------------------------------------------------------------------ team: one action → many apps */
export function teamFlow(canvas, board, color = '#8b9bff') {
  let paths = [], packets = [];
  const build = () => {
    paths = [];
    const from = board.querySelector('.tb-from'), items = [...board.querySelectorAll('.tb-item')];
    if (!from || !items.length) return;
    const g = board.getBoundingClientRect(), f = from.getBoundingClientRect();
    const stacked = innerWidth <= 700;
    items.forEach((it) => {
      const r = it.querySelector('i').getBoundingClientRect();
      const a = stacked ? [f.left - g.left + 24, f.bottom - g.top] : [f.right - g.left, f.top - g.top + f.height / 2];
      const b = stacked ? [r.left - g.left - 2, r.top - g.top + r.height / 2] : [r.left - g.left - 4, r.top - g.top + r.height / 2];
      const c = stacked ? [a, [a[0], b[1]], [a[0], b[1]], b] : hcurve(a, b, 0.55);
      paths.push({ c, r: sampleRoute([c], 20), el: it });
    });
  };
  const ctl = loop(canvas, draw, { onResize: build });
  function draw(s, dt) {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    paths.forEach((p) => { const on = p.el.classList.contains('in'); ctx.strokeStyle = rgba(color, on ? 0.35 : 0.07); strokeCurve(ctx, p.c); });
    const live = paths.filter((p) => p.el.classList.contains('in'));
    if (!REDUCED && live.length && packets.length < 14 && Math.random() < 0.25) packets.push({ p: live[(Math.random() * live.length) | 0], s: 0, v: 170 + Math.random() * 60 });
    for (let k = packets.length - 1; k >= 0; k--) {
      const q = packets[k];
      q.s += q.v * dt;
      if (q.s > q.p.r.L) { packets.splice(k, 1); continue; }
      const [x, y] = at(q.p.r, q.s);
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 6.283); ctx.fill();
    }
  }
  return { ...ctl, rebuild: build };
}

/* ------------------------------------------------------------------ Mule 3 → 4 cut-over */
export function cutover(canvas, input, onChange, labels) {
  let cut = 0, packets = [];
  const ctl = loop(canvas, draw);
  input.addEventListener('input', () => { cut = +input.value / 100; onChange(cut); ctl.kick(); });
  function draw(s, dt) {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);
    const bw = Math.min(150, w * 0.27), bh = 46;
    const A = [bw / 2 + 2, h / 2], P = [w * 0.48, h / 2], M3 = [w - bw / 2 - 2, h * 0.24], M4 = [w - bw / 2 - 2, h * 0.76];
    const c1 = hcurve([A[0] + bw / 2, A[1]], [P[0] - bw / 2, P[1]]), c3 = hcurve([P[0] + bw / 2, P[1]], [M3[0] - bw / 2, M3[1]]), c4 = hcurve([P[0] + bw / 2, P[1]], [M4[0] - bw / 2, M4[1]]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; strokeCurve(ctx, c1);
    ctx.strokeStyle = `rgba(148,163,184,${0.12 + 0.5 * (1 - cut)})`; strokeCurve(ctx, c3);
    ctx.strokeStyle = `rgba(79,209,255,${0.12 + 0.6 * cut})`; strokeCurve(ctx, c4);
    if (!REDUCED && Math.random() < 0.55 && packets.length < 40) packets.push({ t: 0, seg: 0, to4: Math.random() < cut, v: 0.8 + Math.random() * 0.4 });
    for (let k = packets.length - 1; k >= 0; k--) {
      const p = packets[k];
      p.t += p.v * dt;
      if (p.t >= 1) { if (p.seg === 0) { p.seg = 1; p.t = 0; } else { packets.splice(k, 1); continue; } }
      const c = p.seg === 0 ? c1 : p.to4 ? c4 : c3;
      const [x, y] = bez(c[0], c[1], c[2], c[3], p.t);
      ctx.fillStyle = p.seg === 0 ? '#e6e9f0' : p.to4 ? '#4fd1ff' : '#94a3b8';
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 6.283); ctx.fill();
    }
    const box = (pt, l, sub, stroke, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#10131b'; ctx.strokeStyle = stroke; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(pt[0] - bw / 2, pt[1] - bh / 2, bw, bh, 12); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center';
      let fs = 13; ctx.font = `600 ${fs}px Inter, sans-serif`;
      while (fs > 9 && ctx.measureText(l).width > bw - 12) { fs -= 0.5; ctx.font = `600 ${fs}px Inter, sans-serif`; }
      ctx.fillStyle = '#f2f4f8'; ctx.fillText(l, pt[0], pt[1] - 2);
      ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = '#8a91a3'; ctx.fillText(sub, pt[0], pt[1] + 13);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    };
    box(A, labels.src, labels.srcSub, 'rgba(255,255,255,.3)');
    box(P, labels.proxy, labels.proxySub, '#8b9bff');
    box(M3, 'Mule 3', `${40 - Math.round(cut * 40)} ${labels.flows}`, '#64748b', 0.4 + 0.6 * (1 - cut));
    box(M4, 'Mule 4', `${Math.round(cut * 40)} ${labels.flows}`, '#4fd1ff');
  }
  // auto-play once on first view
  if (!REDUCED) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now) => { const k = Math.min(1, (now - t0) / 2200); const v = Math.round(65 * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)); input.value = v; input.dispatchEvent(new Event('input')); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(canvas);
  }
  return ctl;
}

/* ------------------------------------------------------------------ charts (SVG) */
const svg = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
const onView = (el, fn) => { if (REDUCED) { fn(); return; } const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: 0.35 }); io.observe(el); };

/** Horizontal bars. data: [[label, value, suffix?]] */
export function barChart(host, data, color, unit = '') {
  const max = Math.max(...data.map((d) => d[1]));
  host.innerHTML = `<div class="bars">${data.map(([l, v, sfx = '']) => `<div class="bar" tabindex="0"><span class="bar-l">${l}</span><span class="bar-track"><i style="--w:${(v / max) * 100}%;--c:${color}"></i></span><b class="bar-v" data-v="${v}">0${sfx}${unit}</b></div>`).join('')}</div>`;
  onView(host, () => {
    host.classList.add('go'); host.closest('.chart') && host.closest('.chart').classList.add('go');
    host.querySelectorAll('.bar-v').forEach((b) => {
      const v = +b.dataset.v, sfx = b.textContent.replace(/^0/, ''), t0 = performance.now(), dec = v % 1 ? (v < 1 ? 2 : 1) : 0;
      const st = (now) => { const k = Math.min(1, (now - t0) / 1000); b.textContent = (v * (1 - Math.pow(1 - k, 3))).toFixed(dec) + sfx; if (k < 1) requestAnimationFrame(st); };
      REDUCED ? (b.textContent = v + sfx) : requestAnimationFrame(st);
    });
  });
}

/** Donut. data: [[label, value, color]]; centre shows total, hover shows a segment. */
export function donutChart(host, data, totalLabel) {
  const total = data.reduce((a, d) => a + d[1], 0);
  host.innerHTML = '';
  const wrap = document.createElement('div'); wrap.className = 'donut';
  const s = svg('svg', { viewBox: '0 0 200 200', role: 'img' });
  const R = 78, C = 2 * Math.PI * R;
  svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: 'rgba(255,255,255,.06)', 'stroke-width': 22 }, s);
  let acc = 0;
  const segs = data.map(([l, v, c], i) => {
    const len = (v / total) * C;
    const seg = svg('circle', { cx: 100, cy: 100, r: R, fill: 'none', stroke: c, 'stroke-width': 22, 'stroke-dasharray': `0 ${C}`, transform: `rotate(${-90 + (acc / total) * 360} 100 100)`, class: 'dseg', tabindex: 0 }, s);
    seg.dataset.len = Math.max(0, len - 2); seg.dataset.i = i;
    acc += v;
    return seg;
  });
  const big = svg('text', { x: 100, y: 100, 'text-anchor': 'middle', class: 'd-big' }, s);
  const sm = svg('text', { x: 100, y: 122, 'text-anchor': 'middle', class: 'd-sm' }, s);
  const setCentre = (i) => { if (i === null) { big.textContent = total; sm.textContent = totalLabel; } else { big.textContent = data[i][1]; sm.textContent = data[i][0]; } segs.forEach((g, k) => g.classList.toggle('dim', i !== null && k !== i)); };
  setCentre(null);
  wrap.appendChild(s);
  const legend = document.createElement('ul'); legend.className = 'legend';
  legend.innerHTML = data.map(([l, v, c], i) => `<li data-i="${i}" tabindex="0"><i style="background:${c}"></i><span>${l}</span><b>${v}</b></li>`).join('');
  wrap.appendChild(legend);
  host.appendChild(wrap);
  const pick = (e) => { const t = e.target.closest('[data-i]'); setCentre(t ? +t.dataset.i : null); };
  wrap.addEventListener('pointerover', pick); wrap.addEventListener('focusin', pick);
  wrap.addEventListener('pointerleave', () => setCentre(null)); wrap.addEventListener('focusout', () => setCentre(null));
  onView(host, () => segs.forEach((g, i) => { g.style.transition = REDUCED ? 'none' : `stroke-dasharray .9s cubic-bezier(.22,.8,.24,1) ${i * 0.12}s`; g.setAttribute('stroke-dasharray', `${g.dataset.len} ${C}`); }));
}
