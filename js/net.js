// Hero: a rotating 3D globe of systems. Edges are integrations, packets are messages.
import { canvasLoop, rand, REDUCED, accentRGB } from './util.js';

const LABELS = ['SAP ECC', 'Salesforce', 'Informatica MDM', 'Snowflake', 'Flex Gateway', 'Global HR', 'Generix', 'Splunk', 'Azure OpenAI', 'MCP server', 'Dayforce', 'Hexagon', 'SAP BW', 'Claude', 'CloudHub 2.0', 'Runtime Fabric', 'Memority', 'Dashdoc'];
const COLORS = [[0, 160, 223], [255, 77, 0], [167, 139, 250], [34, 211, 238], [52, 211, 153]];

export const metrics = { delivered: 0 };

export function initNet(canvas) {
  const nodes = [];
  const edges = [];
  const packets = [];
  const rings = [];
  const N = window.innerWidth < 760 ? 70 : 130;
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const j = rand(0.92, 1.08);
    nodes.push({ x: Math.cos(th) * r * j, y: y * j, z: Math.sin(th) * r * j, label: null, px: 0, py: 0, pz: 0, s: 1, heat: 0 });
  }
  // label a spread of nodes
  LABELS.forEach((l, k) => { nodes[Math.floor((k + 0.5) * (N / LABELS.length))].label = l; });

  // k-nearest edges
  const seen = new Set();
  nodes.forEach((a, i) => {
    const d = nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2]).sort((p, q) => p[1] - q[1]);
    for (let k = 1; k <= 3; k++) {
      const j = d[k][0];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) { seen.add(key); edges.push({ a: i, b: j, glow: 0 }); }
    }
  });
  const adj = nodes.map(() => []);
  edges.forEach((e, idx) => { adj[e.a].push(idx); adj[e.b].push(idx); });

  const mouse = { x: -9999, y: -9999, tx: 0, ty: 0, inside: false };
  let rotY = 0, rotX = -0.25, velY = 0.12;
  let hover = -1;
  let cx = 0, cy = 0, R = 0;

  const spawn = (fromNode = -1, color) => {
    const ei = fromNode >= 0 ? adj[fromNode][(Math.random() * adj[fromNode].length) | 0] : (Math.random() * edges.length) | 0;
    const e = edges[ei];
    const dir = fromNode >= 0 ? (e.a === fromNode ? 1 : -1) : (Math.random() < 0.5 ? 1 : -1);
    packets.push({ e: ei, t: dir > 0 ? 0 : 1, dir, v: rand(0.35, 0.8), c: color || COLORS[(Math.random() * COLORS.length) | 0], hops: fromNode >= 0 ? 4 : (Math.random() * 3) | 0 });
  };

  const host = canvas.parentElement;
  host.addEventListener('pointermove', (ev) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top; mouse.inside = true;
    mouse.tx = (mouse.x / r.width - 0.5); mouse.ty = (mouse.y / r.height - 0.5);
  });
  host.addEventListener('pointerleave', () => { mouse.inside = false; mouse.x = mouse.y = -9999; });
  host.addEventListener('click', (ev) => {
    if (ev.target.closest('a,button')) return;
    const r = canvas.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    rings.push({ x, y, r: 0, a: 1 });
    // nearest front node
    let best = -1, bd = Infinity;
    nodes.forEach((n, i) => { const d = (n.px - x) ** 2 + (n.py - y) ** 2; if (n.pz > -0.2 && d < bd) { bd = d; best = i; } });
    if (best >= 0) {
      nodes[best].heat = 1;
      const c = accentRGB();
      for (let k = 0; k < 36; k++) spawn(best, k % 3 ? c : COLORS[(Math.random() * COLORS.length) | 0]);
    }
    velY += 0.9;
  });

  const st = canvasLoop(canvas, (s, dt) => {
    const { ctx, w, h } = s;
    ctx.clearRect(0, 0, w, h);

    // rotation & mouse parallax
    velY += (0.12 - velY) * Math.min(1, dt * 1.5);
    rotY += velY * dt + (mouse.inside ? mouse.tx * 0.6 * dt : 0);
    const targetX = -0.25 + (mouse.inside ? mouse.ty * 0.6 : 0);
    rotX += (targetX - rotX) * Math.min(1, dt * 2);

    const cyR = Math.cos(rotY), syR = Math.sin(rotY), cxR = Math.cos(rotX), sxR = Math.sin(rotX);
    const fov = 2.6;

    // project
    for (const n of nodes) {
      let x = n.x * cyR - n.z * syR;
      let z = n.x * syR + n.z * cyR;
      let y = n.y * cxR - z * sxR;
      z = n.y * sxR + z * cxR;
      const p = fov / (fov + z);
      n.px = cx + x * R * p; n.py = cy + y * R * p; n.pz = -z; n.s = p;
      // cursor warp: push projected point away a little
      if (mouse.inside) {
        const dx = n.px - mouse.x, dy = n.py - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160) { const f = (1 - Math.sqrt(d2) / 160) * 26; const d = Math.sqrt(d2) || 1; n.px += (dx / d) * f; n.py += (dy / d) * f; }
      }
      n.heat *= 0.96;
    }

    // hover node
    hover = -1;
    if (mouse.inside) {
      let bd = 26 * 26;
      nodes.forEach((n, i) => { const d = (n.px - mouse.x) ** 2 + (n.py - mouse.y) ** 2; if (n.pz > 0 && d < bd) { bd = d; hover = i; } });
    }

    // edges
    ctx.lineWidth = 1;
    for (const e of edges) {
      const a = nodes[e.a], b = nodes[e.b];
      const depth = (a.pz + b.pz) / 2; // -1..1
      const hot = hover >= 0 && (e.a === hover || e.b === hover);
      e.glow *= 0.94;
      const al = 0.05 + (depth + 1) * 0.07 + e.glow * 0.5 + (hot ? 0.5 : 0);
      ctx.strokeStyle = hot ? `rgba(255,255,255,${al})` : `rgba(160,175,210,${al})`;
      ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke();
    }

    // equator orbit ring (the gateway)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.35);
    ctx.scale(1, 0.22);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath(); ctx.arc(0, 0, R * 1.42, 0, Math.PI * 2); ctx.stroke();
    const [ar, ag, ab] = accentRGB();
    for (let k = 0; k < 7; k++) {
      const ang = s.t * 0.5 + k * (Math.PI * 2 / 7);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.9)`;
      ctx.beginPath(); ctx.arc(Math.cos(ang) * R * 1.42, Math.sin(ang) * R * 1.42, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // packets
    if (!REDUCED && packets.length < (window.innerWidth < 760 ? 50 : 110) && Math.random() < 0.7) spawn();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      const e = edges[p.e];
      p.t += p.dir * p.v * dt;
      if (p.t > 1 || p.t < 0) {
        const arrived = p.dir > 0 ? e.b : e.a;
        nodes[arrived].heat = Math.min(1, nodes[arrived].heat + 0.35);
        e.glow = 1;
        metrics.delivered++;
        if (p.hops-- > 0) {
          const nxt = adj[arrived][(Math.random() * adj[arrived].length) | 0];
          const ne = edges[nxt];
          p.e = nxt; p.dir = ne.a === arrived ? 1 : -1; p.t = p.dir > 0 ? 0 : 1;
        } else { packets.splice(i, 1); }
        continue;
      }
      const a = nodes[e.a], b = nodes[e.b];
      const x = a.px + (b.px - a.px) * p.t, y = a.py + (b.py - a.py) * p.t;
      const depth = a.pz + (b.pz - a.pz) * p.t;
      const tx = x - (b.px - a.px) * 0.08 * p.dir, ty = y - (b.py - a.py) * 0.08 * p.dir;
      const al = 0.35 + (depth + 1) * 0.32;
      const [r, g, bb] = p.c;
      ctx.strokeStyle = `rgba(${r},${g},${bb},${al * 0.6})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      ctx.fillStyle = `rgba(${r},${g},${bb},${al})`;
      ctx.beginPath(); ctx.arc(x, y, 1.6 + (depth + 1) * 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const front = (n.pz + 1) / 2;
      const rad = (n.label ? 2.6 : 1.4) * n.s + n.heat * 3;
      ctx.fillStyle = n.label ? `rgba(255,255,255,${0.25 + front * 0.75})` : `rgba(190,200,225,${0.15 + front * 0.5})`;
      ctx.beginPath(); ctx.arc(n.px, n.py, rad, 0, Math.PI * 2); ctx.fill();
      if (n.heat > 0.05) {
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${n.heat * 0.8})`;
        ctx.beginPath(); ctx.arc(n.px, n.py, rad + 6 * (1 - n.heat) + 2, 0, Math.PI * 2); ctx.stroke();
      }
      if (n.label && n.pz > 0.15 && w > 700) {
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(200,210,235,${(n.pz - 0.15) * 0.9})`;
        ctx.fillText(n.label, n.px + 8, n.py + 3);
      }
    }

    // hover tooltip
    if (hover >= 0) {
      const n = nodes[hover];
      ctx.strokeStyle = `rgb(${ar},${ag},${ab})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(n.px, n.py, 10, 0, Math.PI * 2); ctx.stroke();
      const txt = n.label || `node-${hover.toString(16).padStart(3, '0')} · ${adj[hover].length} links`;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      const tw = ctx.measureText(txt).width + 16;
      ctx.fillStyle = 'rgba(5,6,10,.9)'; ctx.strokeStyle = 'rgba(255,255,255,.2)';
      ctx.beginPath(); ctx.roundRect(n.px + 14, n.py - 26, tw, 22, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(txt, n.px + 22, n.py - 11);
      if (Math.random() < 0.15) spawn(hover);
    }

    // shockwaves
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += dt * 900; r.a -= dt * 1.4;
      if (r.a <= 0) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${r.a})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${r.a * 0.4})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
  }, {
    onResize: (s) => {
      const mobile = s.w < 900;
      cx = mobile ? s.w * 0.5 : s.w * 0.7;
      cy = mobile ? s.h * 0.42 : s.h * 0.5;
      R = Math.min(s.w, s.h) * (mobile ? 0.36 : 0.36);
      canvas.style.opacity = mobile ? '0.55' : '1';
    },
  });

  // warm up
  for (let i = 0; i < 60; i++) spawn();
  return st;
}
