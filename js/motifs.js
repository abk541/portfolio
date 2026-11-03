// Small generative visuals, one per project "motif". Each: (ctx, w, h, t, rgb, energy) => void
const TAU = Math.PI * 2;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// The grid + glow background never changes for a given size and colour: render once, then blit.
const BG = new Map();
function bg(ctx, w, h, c) {
  const key = `${w | 0}x${h | 0}:${c}`;
  let off = BG.get(key);
  if (!off) {
    off = document.createElement('canvas');
    off.width = Math.max(1, w | 0); off.height = Math.max(1, h | 0);
    const o = off.getContext('2d');
    const g = o.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.8);
    g.addColorStop(0, rgba(c, 0.16)); g.addColorStop(1, 'rgba(10,12,20,0)');
    o.fillStyle = '#0a0c14'; o.fillRect(0, 0, w, h);
    o.fillStyle = g; o.fillRect(0, 0, w, h);
    o.strokeStyle = 'rgba(255,255,255,0.035)'; o.lineWidth = 1;
    o.beginPath();
    for (let x = 0.5; x < w; x += 24) { o.moveTo(x, 0); o.lineTo(x, h); }
    for (let y = 0.5; y < h; y += 24) { o.moveTo(0, y); o.lineTo(w, y); }
    o.stroke();
    if (BG.size > 60) BG.clear();
    BG.set(key, off);
  }
  ctx.drawImage(off, 0, 0, w, h);
}

export const MOTIFS = {
  chat(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const bubbles = 5;
    for (let i = 0; i < bubbles; i++) {
      const k = ((t * 0.25 + i / bubbles) % 1);
      const left = i % 2 === 0;
      const bw = w * (0.28 + ((i * 37) % 20) / 100);
      const x = left ? w * 0.1 : w * 0.9 - bw;
      const y = h * (1.05 - k * 1.1);
      ctx.globalAlpha = Math.sin(k * Math.PI);
      ctx.fillStyle = left ? 'rgba(255,255,255,0.08)' : rgba(c, 0.25);
      ctx.strokeStyle = left ? 'rgba(255,255,255,0.18)' : rgba(c, 0.8);
      ctx.beginPath(); ctx.roundRect(x, y, bw, 26, 13); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let j = 0; j < 3; j++) { ctx.fillRect(x + 12 + j * (bw - 24) / 3, y + 12, (bw - 40) / 3, 2); }
    }
    ctx.globalAlpha = 1;
    // tool-call sparks
    for (let i = 0; i < 6 + e * 10; i++) {
      const a = t * (1 + e) + i;
      ctx.fillStyle = rgba(c, 0.8);
      ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a * 1.3) * w * 0.32, h / 2 + Math.sin(a * 2.1) * h * 0.3, 1.5, 0, TAU); ctx.fill();
    }
  },
  bridge(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const L = [w * 0.16, h / 2], R = [w * 0.84, h / 2];
    ctx.strokeStyle = rgba(c, 0.5); ctx.lineWidth = 1.5;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath(); ctx.moveTo(...L);
      ctx.bezierCurveTo(w * 0.4, h / 2 + k * h * 0.16, w * 0.6, h / 2 - k * h * 0.16, ...R); ctx.stroke();
    }
    for (let i = 0; i < 14 + e * 14; i++) {
      const k = ((t * (0.3 + e * 0.4) + i / 14) % 1);
      const lane = (i % 5) - 2;
      const u = 1 - k;
      const x = u * u * u * L[0] + 3 * u * u * k * w * 0.4 + 3 * u * k * k * w * 0.6 + k * k * k * R[0];
      const y = u * u * u * L[1] + 3 * u * u * k * (h / 2 + lane * h * 0.16) + 3 * u * k * k * (h / 2 - lane * h * 0.16) + k * k * k * R[1];
      ctx.fillStyle = i % 2 ? rgba(c, 1) : 'rgba(255,77,0,0.9)';
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
    }
    [L, R].forEach((p, i) => {
      ctx.fillStyle = '#0a0c14'; ctx.strokeStyle = i ? 'rgba(255,77,0,.9)' : rgba(c, 0.9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p[0], p[1], 16 + Math.sin(t * 3 + i) * 2, 0, TAU); ctx.fill(); ctx.stroke();
    });
  },
  spec(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const lines = 9;
    ctx.font = '10px "JetBrains Mono", monospace';
    for (let i = 0; i < lines; i++) {
      const prog = Math.min(1, Math.max(0, (t * (0.6 + e) - i * 0.25) % 4));
      const y = h * 0.14 + i * (h * 0.78 / lines);
      const indent = [0, 1, 2, 2, 1, 2, 2, 1, 0][i] * 16;
      ctx.fillStyle = i % 4 === 0 ? rgba(c, 0.9) : 'rgba(255,255,255,0.35)';
      ctx.fillRect(w * 0.1 + indent, y, (w * 0.7 - indent) * Math.min(1, prog) * (0.5 + ((i * 29) % 50) / 100), 4);
    }
    // layered API blocks
    ['FLOW', 'PAPI', 'SAPI'].forEach((l, i) => {
      const x = w * 0.72, y = h * 0.18 + i * h * 0.24;
      ctx.strokeStyle = rgba(c, 0.6 + 0.4 * Math.sin(t * 2 + i)); ctx.strokeRect(x, y, w * 0.2, h * 0.16);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(l, x + 8, y + h * 0.1);
    });
  },
  gauge(ctx, w, h, t, c, e) {
    ctx.fillStyle = '#05060a'; ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.62, r = Math.min(w, h) * 0.42;
    const speed = 0.5 + 0.35 * Math.sin(t * 0.7) + e * 0.15;
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
    
    ctx.strokeStyle = rgba(c, 1);
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + (a1 - a0) * speed); ctx.stroke();
    for (let i = 0; i <= 12; i++) {
      const a = a0 + (a1 - a0) * (i / 12);
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); ctx.lineTo(cx + Math.cos(a) * (r - 26), cy + Math.sin(a) * (r - 26)); ctx.stroke();
    }
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.font = `700 ${Math.round(r * 0.5)}px "Space Grotesk", sans-serif`;
    ctx.fillText(String(Math.round(speed * 130)), cx, cy + r * 0.1);
    ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillStyle = rgba(c, 0.9);
    ctx.fillText('km/h · HEV', cx, cy + r * 0.32);
    ctx.textAlign = 'left';
  },
  pipeline(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const cols = ['Lead', 'Bid', 'Proposal', 'Award'];
    const cw = w / cols.length;
    ctx.font = '10px "JetBrains Mono", monospace';
    cols.forEach((l, i) => {
      ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillText(l.toUpperCase(), i * cw + 12, 20);
      ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, h); ctx.stroke();
    });
    for (let i = 0; i < 9; i++) {
      const k = ((t * (0.12 + e * 0.2) + i / 9) % 1);
      const col = Math.floor(k * cols.length);
      const local = (k * cols.length) % 1;
      const x = col * cw + 10 + (local > 0.85 ? (local - 0.85) / 0.15 * cw : 0);
      const y = 32 + ((i * 41) % Math.max(1, h - 64));
      ctx.fillStyle = col === 3 ? rgba(c, 0.5) : 'rgba(255,255,255,.07)';
      ctx.strokeStyle = col === 3 ? rgba(c, 1) : 'rgba(255,255,255,.2)';
      ctx.beginPath(); ctx.roundRect(x, y, cw - 20, 22, 6); ctx.fill(); ctx.stroke();
    }
  },
  pulse(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    ctx.strokeStyle = rgba(c, 1); ctx.lineWidth = 2; 
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const k = ((x / w) * 3 - t * (0.8 + e)) % 1;
      const kk = k < 0 ? k + 1 : k;
      let y = 0;
      if (kk > 0.4 && kk < 0.45) y = -(kk - 0.4) * 20 * h * 0.12;
      else if (kk >= 0.45 && kk < 0.5) y = (kk - 0.475) * 40 * h * 0.12;
      else if (kk >= 0.5 && kk < 0.55) y = -(0.55 - kk) * 10 * h * 0.12;
      x === 0 ? ctx.moveTo(x, h / 2 + y) : ctx.lineTo(x, h / 2 + y);
    }
    ctx.stroke();
    // map pins
    for (let i = 0; i < 3; i++) {
      const px = w * (0.25 + i * 0.25), py = h * 0.78;
      const r = ((t + i * 0.4) % 1.2) * 22;
      ctx.strokeStyle = rgba(c, Math.max(0, 1 - r / 26)); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, TAU); ctx.fill();
    }
  },
  water(ctx, w, h, t, c, e) {
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, w, h);
    const lvl = h * (0.55 - 0.08 * Math.sin(t * 0.5)) - e * 20;
    for (let layer = 0; layer < 3; layer++) {
      ctx.fillStyle = `rgba(56,189,248,${0.15 + layer * 0.12})`;
      ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, lvl + layer * 14 + Math.sin(x * 0.02 + t * (1.2 + layer * 0.4)) * 8 + Math.sin(x * 0.05 - t) * 3);
      ctx.lineTo(w, h); ctx.fill();
    }
    // bars
    for (let i = 0; i < 8; i++) {
      const bh = (0.2 + 0.6 * Math.abs(Math.sin(t * 0.6 + i))) * h * 0.35;
      ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(w * 0.08 + i * w * 0.06, h * 0.42 - bh, w * 0.035, bh);
    }
    ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(125,211,252,.9)';
    ctx.fillText(`${(12.4 + Math.sin(t) * 1.3).toFixed(1)} m³/day`, w * 0.62, h * 0.18);
  },
  liquid(ctx, w, h, t, c, e) {
    ctx.fillStyle = '#0d0a0c'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const blobs = [[236, 72, 153], [251, 191, 36], [167, 139, 250], [52, 211, 153]];
    blobs.forEach((b, i) => {
      const x = w * (0.5 + 0.32 * Math.sin(t * (0.4 + i * 0.13) + i * 2));
      const y = h * (0.5 + 0.3 * Math.cos(t * (0.5 + i * 0.1) + i));
      const r = Math.min(w, h) * (0.45 + 0.1 * e);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${b[0]},${b[1]},${b[2]},0.45)`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = 'italic 34px "Instrument Serif", serif'; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center';
    ctx.fillText('Cutanéa', w / 2, h / 2 + 10); ctx.textAlign = 'left';
  },
  stars(ctx, w, h, t, c, e) {
    ctx.fillStyle = '#04050a'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const z = ((i * 97) % 100) / 100;
      const sp = (0.02 + z * 0.08) * (1 + e * 3);
      const x = (((i * 173) % w) + t * sp * 400) % w;
      const y = (i * 61) % h;
      ctx.fillStyle = `rgba(255,255,255,${0.2 + z * 0.8})`;
      ctx.fillRect(x, y, 1 + z * 1.5, 1 + z * 1.5);
    }
    ctx.font = '600 13px "Space Grotesk", sans-serif'; ctx.fillStyle = rgba(c, 0.95);
    ctx.fillText('★ VETERAN & WOMAN-OWNED', 18, h - 20);
  },
  heat(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const cols = 14, rows = 7, cw = (w - 30) / cols, ch = (h - 40) / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const v = 0.5 + 0.5 * Math.sin(i * 0.7 + j * 1.3 + t * (0.8 + e));
      ctx.fillStyle = `rgba(${Math.round(255 * v)},${Math.round(120 + 60 * (1 - v))},${Math.round(60 + 140 * (1 - v))},${0.25 + v * 0.6})`;
      ctx.beginPath(); ctx.roundRect(15 + i * cw, 20 + j * ch, cw - 3, ch - 3, 3); ctx.fill();
    }
  },
  orbit(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const cx = w / 2, cy = h / 2;
    ctx.font = '600 20px "Space Grotesk", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
    ctx.fillText('∑', cx, cy + 7);
    ['+', '−', '×', '÷', 'π', '√', '%', '='].forEach((s, i) => {
      const r = Math.min(w, h) * (0.22 + (i % 3) * 0.08);
      const a = t * (0.4 + (i % 3) * 0.2) * (1 + e) + i;
      ctx.fillStyle = i % 2 ? rgba(c, 0.95) : 'rgba(255,255,255,.7)';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText(s, cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r + 5);
    });
    ctx.textAlign = 'left';
  },
  hex(ctx, w, h, t, c, e) {
    ctx.fillStyle = '#0b0912'; ctx.fillRect(0, 0, w, h);
    const s = 20, hw = Math.sqrt(3) * s;
    const gold = [250, 204, 21];
    for (let row = 0; row < h / (s * 1.5) + 1; row++) for (let col = 0; col < w / hw + 1; col++) {
      const x = col * hw + (row % 2) * hw / 2, y = row * s * 1.5;
      const v = 0.5 + 0.5 * Math.sin(t * (1 + e) + col * 0.6 + row * 0.9);
      ctx.strokeStyle = v > 0.92 ? rgba(gold, 1) : `rgba(255,255,255,${0.05 + v * 0.12})`;
      ctx.fillStyle = v > 0.92 ? rgba(gold, 0.25) : 'transparent';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; const px = x + Math.cos(a) * s * 0.92, py = y + Math.sin(a) * s * 0.92; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.font = '700 14px "JetBrains Mono", monospace'; ctx.fillStyle = rgba(gold, 0.95);
    ctx.fillText('LVL 8 · 3★ ROLL', 16, h - 16);
  },
  merge(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const cx = w / 2, cy = h / 2;
    const gold = [250, 204, 21];
    for (let i = 0; i < 60; i++) {
      const k = ((t * (0.25 + e * 0.3) + i / 60) % 1);
      const a = i * 2.39996;
      const r = (1 - k) * Math.max(w, h) * 0.55;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.7;
      ctx.fillStyle = rgba(i % 3 === 0 ? [251, 146, 60] : i % 3 === 1 ? [244, 63, 94] : [250, 204, 21], 0.25 + k * 0.7);
      ctx.beginPath(); ctx.arc(x, y, 1.5 + k * 1.5, 0, TAU); ctx.fill();
    }
    const pr = 22 + Math.sin(t * 3) * 3 + e * 6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 3);
    g.addColorStop(0, rgba(gold, 0.6)); g.addColorStop(1, rgba(gold, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, pr * 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(gold, 1); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, pr, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '700 14px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillText('★', cx, cy + 5); ctx.textAlign = 'left';
  },
  mesh(ctx, w, h, t, c, e) {
    bg(ctx, w, h, c);
    const cols = [0.12, 0.38, 0.64, 0.88];
    const rows = [5, 7, 5, 3];
    const pts = cols.map((x, i) => Array.from({ length: rows[i] }, (_, j) => [x * w, h * (j + 1) / (rows[i] + 1)]));
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) pts[i].forEach((a, ai) => pts[i + 1].forEach((b, bi) => {
      if ((ai + bi) % 2) return;
      ctx.strokeStyle = rgba(c, 0.12);
      ctx.beginPath(); ctx.moveTo(...a); ctx.bezierCurveTo(a[0] + w * 0.12, a[1], b[0] - w * 0.12, b[1], ...b); ctx.stroke();
      const k = ((t * (0.5 + e) + ai * 0.17 + bi * 0.29 + i * 0.4) % 1);
      const u = 1 - k;
      const x = u * u * u * a[0] + 3 * u * u * k * (a[0] + w * 0.12) + 3 * u * k * k * (b[0] - w * 0.12) + k * k * k * b[0];
      const y = u * u * u * a[1] + 3 * u * u * k * a[1] + 3 * u * k * k * b[1] + k * k * k * b[1];
      ctx.fillStyle = rgba(c, 0.9); ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
    }));
    pts.flat().forEach((p) => { ctx.fillStyle = '#0a0c14'; ctx.strokeStyle = rgba(c, 0.8); ctx.beginPath(); ctx.roundRect(p[0] - 6, p[1] - 6, 12, 12, 3); ctx.fill(); ctx.stroke(); });
  },
};
