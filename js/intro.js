// Landing: the name is written by rivers of data; platforms and APIs float in depth around it.
import { $, icon, REDUCED, FINE, rand, clamp } from './util.js';
import { t as tr } from './lang.js';

const gsap = window.gsap;
const PALETTE = [[0, 160, 223], [125, 211, 252], [167, 139, 250], [244, 114, 182], [255, 106, 43], [255, 176, 32]];

const FLOATERS = [
  { ic: 'mulesoft', t: 'MuleSoft', c: '#00a0df', big: 1 },
  { ic: 'informatica', t: 'Informatica', c: '#ff5a1f', big: 1 },
  { t: 'GET /coworkers', c: '#34d399', code: 1 },
  { ic: 'sap', t: 'SAP', c: '#4fa8ff' },
  { ic: 'salesforce', t: 'Salesforce', c: '#38bdf8' },
  { ic: 'snowflake', t: 'Snowflake', c: '#7dd3fc' },
  { t: 'Flex Gateway', c: '#00a0df' },
  { ic: 'claude', t: 'MCP · Claude', c: '#e58a6b' },
  { t: 'Golden record ★', c: '#facc15' },
  { t: 'POST /invoices', c: '#a78bfa', code: 1 },
  { t: 'DataWeave', c: '#7dd3fc' },
  { t: 'Business 360', c: '#ff8a4c' },
  { t: '200 OK', c: '#34d399', code: 1 },
  { t: 'event · project.updated', c: '#f472b6', code: 1 },
];

export function initIntro({ onEnter }) {
  const root = $('#intro');
  const linkCv = $('#intro-links');
  const nameCv = $('#intro-name');
  const floatLayer = $('#intro-floaters');
  const lctx = linkCv.getContext('2d');
  const nctx = nameCv.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  let band = [0, 0, 0, 0];
  let W = 0, H = 0, mask = null, maskW = 0, maskH = 0, inside = [], glyphs = null;
  let parts = [];
  let raf = 0, t = 0, last = performance.now(), running = true, leaving = false;
  const ptr = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0, active: false, vx: 0, vy: 0 };
  const rings = [];

  /* ---------- floaters (DOM, 3D-ish depth) ---------- */
  const fl = FLOATERS.map((f, i) => {
    const el = document.createElement('div');
    el.className = `fl${f.big ? ' big' : ''}${f.code ? ' code' : ''}`;
    el.style.setProperty('--c', f.c);
    el.innerHTML = `${f.ic ? `<span class="fl-ic">${icon(f.ic)}</span>` : '<span class="fl-dot"></span>'}<span>${f.t}</span>`;
    floatLayer.appendChild(el);
    const z = f.big ? rand(0.85, 1) : rand(0.25, 0.95);
    return { el, f, z, bx: 0, by: 0, x: 0, y: 0, ox: 0, oy: 0, ph: rand(0, 6.28), sp: rand(0.15, 0.35), amp: rand(10, 28), hover: 0, w: 0, h: 0 };
  });
  fl.sort((a, b) => a.z - b.z).forEach((o) => floatLayer.appendChild(o.el));
  fl.forEach((o) => {
    o.el.style.zIndex = Math.round(o.z * 10);
    o.el.style.opacity = (0.3 + o.z * 0.65).toFixed(2);
    if (o.z < 0.5) o.el.style.filter = `blur(${((0.5 - o.z) * 6).toFixed(1)}px)`;
    o.el.addEventListener('pointerenter', () => (o.hover = 1));
    o.el.addEventListener('pointerleave', () => (o.hover = 0));
  });

  // pairs that exchange packets
  const pairs = [];
  const linkPackets = [];

  function placeFloaters() {
    const n = fl.length;
    const mobile = W < 700;
    fl.forEach((o) => { o.el.style.display = ''; o.w = o.el.offsetWidth; o.h = o.el.offsetHeight; o.region = 0; });
    pairs.length = 0;
    if (mobile) {
      // Phones: a calm grid in the free space only (above the name, below the button).
      // Rows are measured from the real layout so chips never touch the text.
      const ui = root.querySelector('.intro-ui');
      const uiBottom = ui ? ui.offsetTop + ui.offsetHeight : H * 0.8;
      const ROW = 58;
      const topA = 92, topB = band[1] - 34;
      const topRows = Math.max(0, Math.min(3, Math.floor((topB - topA) / ROW) + 1));
      const botA = uiBottom + 34, botB = H - 30;
      const botRows = botB >= botA ? Math.min(2, Math.floor((botB - botA) / ROW) + 1) : 0;
      const slots = [];
      for (let r = 0; r < topRows; r++) for (let c = 0; c < 2; c++) slots.push([c, topRows === 1 ? topA : topA + (r / (topRows - 1)) * (topB - topA), 1]);
      for (let r = 0; r < botRows; r++) for (let c = 0; c < 2; c++) slots.push([c, botRows === 1 ? (botA + botB) / 2 : botA + (r / (botRows - 1)) * (botB - botA), 2]);
      // most recognisable chips first
      const order = [...fl].sort((a, b) => (b.f.big ? 2 : b.f.ic ? 1 : 0) - (a.f.big ? 2 : a.f.ic ? 1 : 0));
      order.forEach((o, k) => {
        const sl = slots[k];
        if (!sl) { o.el.style.display = 'none'; return; }
        const half = W / 2;
        const cx = sl[0] ? half + half / 2 : half / 2;
        o.bx = Math.min(Math.max(cx, o.w * 0.45 + 10), W - o.w * 0.45 - 10);
        o.by = sl[1];
        o.region = sl[2];
        o.amp = rand(3, 6);
      });
      // link only chips that sit in the same band, so no line crosses the name
      [1, 2].forEach((reg) => {
        const v = fl.map((o, i) => (o.el.style.display !== 'none' && o.region === reg ? i : -1)).filter((i) => i >= 0);
        for (let k = 0; k + 1 < v.length; k++) pairs.push([v[k], v[k + 1]]);
      });
    } else {
      fl.forEach((o, i) => {
        const a = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
        const jitter = rand(0.9, 1.1);
        o.bx = W / 2 + Math.cos(a) * W * 0.4 * jitter;
        o.by = H / 2 + Math.sin(a) * H * 0.38 * jitter;
        if (o.by > band[1] - 30 && o.by < band[3] + 30 && o.bx > band[0] - 40 && o.bx < band[2] + 40) {
          o.bx = o.bx < W / 2 ? band[0] - o.w / 2 - 30 : band[2] + o.w / 2 + 30;
          if (o.bx - o.w / 2 < 8 || o.bx + o.w / 2 > W - 8) o.by = o.by < (band[1] + band[3]) / 2 ? band[1] - 50 : band[3] + 40;
        }
      });
      fl.forEach((o, i) => { pairs.push([i, (i + 1) % n]); if (i % 3 === 0) pairs.push([i, (i + 5) % n]); });
    }
  }

  /* ---------- name mask ---------- */
  function buildMask() {
    const off = document.createElement('canvas');
    maskW = Math.ceil(W); maskH = Math.ceil(H);
    off.width = maskW; off.height = maskH;
    const c = off.getContext('2d');
    const mobile = W < 700;
    const lines = ['Abdelkader', 'El Azzouzi'];
    let fs = mobile ? W * 0.2 : Math.min(W * 0.13, H * 0.22);
    c.font = `700 ${fs}px "Space Grotesk", sans-serif`;
    const maxW = Math.max(...lines.map((l) => c.measureText(l).width));
    const target = W * (mobile ? 0.9 : 0.78);
    fs *= target / maxW;
    c.font = `700 ${fs}px "Space Grotesk", sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const grad = c.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
    PALETTE.forEach((col, i) => grad.addColorStop(i / (PALETTE.length - 1), `rgb(${col})`));
    c.fillStyle = grad;
    const lh = fs * 0.92;
    const cy = H * (mobile ? 0.42 : 0.44);
    c.fillText(lines[0], W / 2, cy - lh / 2);
    c.fillText(lines[1], W / 2, cy + lh / 2);
    const data = c.getImageData(0, 0, maskW, maskH).data;
    mask = new Uint8Array(maskW * maskH);
    inside = [];
    for (let y = 0; y < maskH; y++) for (let x = 0; x < maskW; x++) {
      if (data[(y * maskW + x) * 4 + 3] > 140) { mask[y * maskW + x] = 1; if ((x + y * 7) % 3 === 0) inside.push(x, y); }
    }
    glyphs = off;
    band = [W / 2 - maxW * (target / maxW) / 2, cy - lh, W / 2 + target / 2, cy + lh];
    root.style.setProperty('--name-bottom', `${cy + lh + fs * 0.05}px`);
    return fs;
  }
  const isIn = (x, y) => { const xi = x | 0, yi = y | 0; return xi >= 0 && yi >= 0 && xi < maskW && yi < maskH && mask[yi * maskW + xi] === 1; };
  const randomInside = () => { const k = ((Math.random() * (inside.length / 2)) | 0) * 2; return [inside[k], inside[k + 1]]; };

  function spawnParticles() {
    const count = Math.round(clamp((W * H) / (W < 700 ? 200 : 330), 1100, 3400));
    parts = Array.from({ length: count }, () => {
      const [x, y] = randomInside();
      return { x, y, px: x, py: y, vx: 0, vy: 0, free: 0, tx: x, ty: y, life: rand(1, 4), c: 0 };
    });
  }

  function resize() {
    W = root.clientWidth; H = root.clientHeight;
    [linkCv, nameCv].forEach((cv) => { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; });
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildMask();
    spawnParticles();
    placeFloaters();
  }

  /* ---------- input ---------- */
  const setPtr = (x, y) => { ptr.vx = x - ptr.x; ptr.vy = y - ptr.y; ptr.x = x; ptr.y = y; ptr.tx = x / W - 0.5; ptr.ty = y / H - 0.5; ptr.active = true; };
  root.addEventListener('pointermove', (e) => setPtr(e.clientX, e.clientY));
  root.addEventListener('pointerdown', (e) => {
    setPtr(e.clientX, e.clientY);
    if (e.target.closest('button')) return;
    burst(e.clientX, e.clientY);
  });
  root.addEventListener('pointerleave', () => { ptr.active = false; ptr.x = ptr.y = -9999; });
  // phone tilt drives the parallax
  const onTilt = (e) => {
    if (e.gamma == null) return;
    ptr.tx = clamp(e.gamma / 40, -0.5, 0.5);
    ptr.ty = clamp((e.beta - 45) / 50, -0.5, 0.5);
  };
  window.addEventListener('deviceorientation', onTilt);
  root.addEventListener('touchstart', () => {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {});
  }, { once: true, passive: true });

  function burst(x, y) {
    rings.push({ x, y, r: 0, a: 1 });
    parts.forEach((p) => {
      const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) || 1;
      if (d < 260) {
        const f = (1 - d / 260) * 900;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f; p.free = rand(0.9, 1.6);
        const [tx, ty] = randomInside(); p.tx = tx; p.ty = ty;
      }
    });
    fl.forEach((o) => { const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1; if (d < 320) { o.ox += (dx / d) * (320 - d) * 0.35; o.oy += (dy / d) * (320 - d) * 0.35; } });
  }

  /* ---------- frame ---------- */
  function flowAngle(x, y) {
    return Math.sin(x * 0.006 + t * 0.35) * 1.4 + Math.cos(y * 0.011 - t * 0.25) * 1.2 + Math.sin((x + y) * 0.003 + t * 0.15);
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now; t += dt;
    ptr.px += (ptr.tx - ptr.px) * Math.min(1, dt * 3);
    ptr.py += (ptr.ty - ptr.py) * Math.min(1, dt * 3);

    // --- floaters
    fl.forEach((o, i) => {
      o.ox *= 0.94; o.oy *= 0.94;
      const par = W < 700 ? 22 : 90;
      let x = o.bx + Math.cos(t * o.sp + o.ph) * o.amp - ptr.px * par * o.z;
      let y = o.by + Math.sin(t * o.sp * 1.3 + o.ph) * o.amp - ptr.py * par * 0.7 * o.z;
      if (ptr.active) {
        const dx = x - ptr.x, dy = y - ptr.y, d = Math.hypot(dx, dy) || 1;
        if (d < 170 && !o.hover) { o.ox += (dx / d) * (170 - d) * 0.06; o.oy += (dy / d) * (170 - d) * 0.06; }
      }
      x += o.ox; y += o.oy;
      o.x = x; o.y = y;
      const s = (0.62 + o.z * 0.5) * (1 + o.hover * 0.18);
      const rot = (ptr.px * 18 * o.z).toFixed(2);
      o.el.style.transform = `translate3d(${(x - o.w / 2).toFixed(1)}px, ${(y - o.h / 2).toFixed(1)}px, 0) scale(${s.toFixed(3)}) rotateY(${rot}deg) rotateX(${(-ptr.py * 14 * o.z).toFixed(2)}deg)`;
    });

    // --- links between floaters with travelling packets
    lctx.clearRect(0, 0, W, H);
    pairs.forEach(([a, b], k) => {
      const A = fl[a], B = fl[b];
      const hot = A.hover || B.hover;
      const mx = (A.x + B.x) / 2 + Math.sin(t * 0.4 + k) * 40, my = (A.y + B.y) / 2 + Math.cos(t * 0.3 + k) * 40;
      const grad = lctx.createLinearGradient(A.x, A.y, B.x, B.y);
      grad.addColorStop(0, A.f.c); grad.addColorStop(1, B.f.c);
      lctx.strokeStyle = grad;
      lctx.globalAlpha = hot ? 0.55 : 0.12 * Math.min(A.z, B.z) + 0.05;
      lctx.lineWidth = hot ? 1.6 : 1;
      lctx.beginPath(); lctx.moveTo(A.x, A.y); lctx.quadraticCurveTo(mx, my, B.x, B.y); lctx.stroke();
      if (Math.random() < (hot ? 0.12 : 0.012)) linkPackets.push({ k, s: 0, v: rand(0.35, 0.7) });
    });
    lctx.globalAlpha = 1;
    lctx.globalCompositeOperation = 'lighter';
    for (let i = linkPackets.length - 1; i >= 0; i--) {
      const p = linkPackets[i];
      p.s += p.v * dt;
      if (p.s >= 1) { linkPackets.splice(i, 1); continue; }
      const [a, b] = pairs[p.k] || [];
      if (a === undefined) { linkPackets.splice(i, 1); continue; }
      const A = fl[a], B = fl[b];
      const mx = (A.x + B.x) / 2 + Math.sin(t * 0.4 + p.k) * 40, my = (A.y + B.y) / 2 + Math.cos(t * 0.3 + p.k) * 40;
      const u = 1 - p.s;
      const x = u * u * A.x + 2 * u * p.s * mx + p.s * p.s * B.x, y = u * u * A.y + 2 * u * p.s * my + p.s * p.s * B.y;
      const col = p.s < 0.5 ? A.f.c : B.f.c;
      lctx.globalAlpha = Math.sin(p.s * Math.PI);
      lctx.fillStyle = col; lctx.shadowColor = col; lctx.shadowBlur = 8;
      lctx.beginPath(); lctx.arc(x, y, 2.2, 0, Math.PI * 2); lctx.fill();
      lctx.shadowBlur = 0; lctx.globalAlpha = 1;
    }
    lctx.globalCompositeOperation = 'source-over';

    // --- name: rivers of data
    nctx.globalCompositeOperation = 'destination-out';
    nctx.fillStyle = `rgba(0,0,0,${leaving ? 0.22 : 0.24})`;
    nctx.fillRect(0, 0, W, H);
    if (glyphs && !leaving) { nctx.globalCompositeOperation = 'source-over'; nctx.globalAlpha = W < 700 ? 0.06 : 0.035; nctx.drawImage(glyphs, 0, 0, W, H); nctx.globalAlpha = 1; }
    nctx.globalCompositeOperation = 'lighter';
    nctx.lineWidth = W < 700 ? 1.1 : 1.4;
    nctx.lineCap = 'round';
    const speed = W < 700 ? 38 : 55;
    const cx = W / 2, cy = H * 0.44;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.px = p.x; p.py = p.y;
      if (leaving) {
        // vortex into the centre
        const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * 2600 * dt + (-dy / d) * 1800 * dt;
        p.vy += (dy / d) * 2600 * dt + (dx / d) * 1800 * dt;
        p.vx *= 0.95; p.vy *= 0.95;
        p.x += p.vx * dt; p.y += p.vy * dt;
      } else if (p.free > 0) {
        p.free -= dt;
        const K = 42, Cd = 11;
        p.vx += (K * (p.tx - p.x) - Cd * p.vx) * dt; p.vy += (K * (p.ty - p.y) - Cd * p.vy) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.free <= 0 && !isIn(p.x, p.y)) p.free = 0.2;
      } else {
        const a = flowAngle(p.x, p.y);
        const nx = p.x + Math.cos(a) * speed * dt, ny = p.y + Math.sin(a) * speed * dt;
        p.life -= dt;
        if (!isIn(nx, ny) || p.life <= 0) {
          const [x, y] = randomInside(); p.x = p.px = x; p.y = p.py = y; p.life = rand(1.5, 4);
          continue;
        }
        p.x = nx; p.y = ny;
        // pointer stirs the river
        if (ptr.active) {
          const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
          if (d2 < 95 * 95) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / 95);
            p.vx = (dx / d) * 380 * f + ptr.vx * 6; p.vy = (dy / d) * 380 * f + ptr.vy * 6;
            p.free = rand(0.5, 1.1); p.tx = p.px; p.ty = p.py;
          }
        }
      }
      const k = clamp(p.x / W, 0, 0.999) * (PALETTE.length - 1);
      const i0 = k | 0, f = k - i0, A = PALETTE[i0], B = PALETTE[i0 + 1];
      const r = A[0] + (B[0] - A[0]) * f, g = A[1] + (B[1] - A[1]) * f, b = A[2] + (B[2] - A[2]) * f;
      nctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${p.free > 0 ? 0.95 : 0.75})`;
      nctx.beginPath(); nctx.moveTo(p.px, p.py); nctx.lineTo(p.x + 0.01, p.y); nctx.stroke();
    }
    ptr.vx *= 0.8; ptr.vy *= 0.8;
    nctx.globalCompositeOperation = 'source-over';
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += dt * 700; r.a -= dt * 1.5;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      nctx.strokeStyle = `rgba(255,255,255,${r.a * 0.6})`; nctx.lineWidth = 1.5;
      nctx.beginPath(); nctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); nctx.stroke();
    }

    if (!REDUCED || leaving) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  /* ---------- enter / leave ---------- */
  let entered = false;
  async function enter() {
    if (entered) return;
    entered = true; leaving = true;
    document.body.classList.remove('intro-open');
    const site = $('#top');
    onEnter && onEnter('start');
    if (!gsap || REDUCED) { root.hidden = true; running = false; onEnter && onEnter('done'); return; }
    const cx = W / 2, cy = H * 0.44;
    const R = Math.hypot(W, H);
    const hole = { r: 0 };
    gsap.timeline({
      onComplete: () => { root.hidden = true; running = false; leaving = false; root.style.webkitMaskImage = root.style.maskImage = ''; onEnter && onEnter('done'); },
    })
      .to('.intro-ui', { opacity: 0, y: 20, duration: 0.35, ease: 'power2.in' }, 0)
      .to(fl.map((o) => o.el), { opacity: 0, duration: 0.6, ease: 'power2.in', stagger: 0.02 }, 0)
      .add(() => fl.forEach((o) => { o.ox += (o.x - cx) * 1.6; o.oy += (o.y - cy) * 1.6; }), 0)
      .fromTo(site, { scale: 1.18, filter: 'blur(14px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', clearProps: 'transform,filter' }, 0.55)
      .to(hole, {
        r: R, duration: 1.05, ease: 'expo.in',
        onUpdate: () => {
          const m = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${hole.r}px, #000 ${hole.r + 80}px)`;
          root.style.webkitMaskImage = m; root.style.maskImage = m;
        },
      }, 0.25);
  }

  async function show() {
    entered = false; leaving = false; running = true;
    root.hidden = false;
    root.style.webkitMaskImage = root.style.maskImage = '';
    document.body.classList.add('intro-open');
    const hint = root.querySelector('.intro-hint');
    if (hint && root.clientWidth < 700) hint.textContent = tr('Touch the letters · swipe up to enter');
    // the letters are sampled from the real font, so wait for it (max 1.5 s)
    try { await Promise.race([document.fonts.load('700 120px "Space Grotesk"'), new Promise((r) => setTimeout(r, 1500))]); } catch { /* ignore */ }
    resize();
    fl.forEach((o) => { o.ox = o.oy = 0; o.el.style.opacity = (0.3 + o.z * 0.65).toFixed(2); });
    nctx.clearRect(0, 0, W, H);
    if (gsap && !REDUCED) {
      gsap.fromTo('.intro-ui', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
      gsap.fromTo(fl.map((o) => o.el), { opacity: 0 }, { opacity: (i) => (0.3 + fl[i].z * 0.65), duration: 1.2, stagger: 0.05, delay: 0.2 });
      // particles stream in from the edges
      parts.forEach((p) => { p.free = rand(0.7, 1.3); p.tx = p.x; p.ty = p.y; const a = rand(0, Math.PI * 2), r = rand(0.35, 0.75); p.x = p.px = W / 2 + Math.cos(a) * W * r; p.y = p.py = H * 0.44 + Math.sin(a) * H * r; p.vx = p.vy = 0; });
    }
    start();
  }

  function skip() {
    entered = true; running = false;
    root.hidden = true;
    document.body.classList.remove('intro-open');
  }

  $('#intro-enter').addEventListener('click', enter);
  root.addEventListener('wheel', (e) => { if (e.deltaY > 12) enter(); }, { passive: true });
  let ty0 = null;
  root.addEventListener('touchstart', (e) => { ty0 = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchmove', (e) => { if (ty0 !== null && ty0 - e.touches[0].clientY > 50) enter(); }, { passive: true });
  addEventListener('keydown', (e) => { if (!root.hidden && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) { e.preventDefault(); enter(); } });
  let rT;
  addEventListener('resize', () => { if (root.hidden) return; clearTimeout(rT); rT = setTimeout(resize, 150); });

  return { show, enter, skip };
}
