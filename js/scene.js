// The opening "skill universe": a glowing integration core with skills orbiting on
// rings (one per practice) and data particles streaming in. Skill names are HTML labels
// laid over the canvas: they fade with depth and hide when they would overlap, so the
// view never gets crowded. Drag to spin, tap a label to pick a skill.
import * as THREE from '../vendor/three.module.min.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const RINGS = [
  { key: 'ai', color: 0xa78bfa, r: 3.2, tilt: [1.2, 0, 0.35], speed: 0.13, skills: ['MCP', 'Claude', 'Azure OpenAI', 'Prompt engineering'] },
  { key: 'mule', color: 0x38bdf8, r: 4.7, tilt: [1.38, 0, -0.38], speed: -0.09, skills: ['Mule 4', 'DataWeave', 'Flex Gateway', 'API-led connectivity', 'MUnit'] },
  { key: 'infa', color: 0xffa53b, r: 6.1, tilt: [1.1, 0, 0.85], speed: 0.06, skills: ['Business 360', 'CDI', 'Match & merge', 'Snowflake', 'CAI'] },
  { key: 'web', color: 0x3dffa8, r: 7.4, tilt: [1.5, 0, 0.12], speed: -0.04, skills: ['React', 'TypeScript', 'Kotlin', 'Node.js'] },
];
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/**
 * @param {HTMLElement} box  container holding the canvas and the label layer
 * @param {{onPick?:(name:string, x:number, y:number, color:string, key:string)=>void, onInteract?:()=>void}} opts
 */
export function initScene(box, { onPick, onInteract } = {}) {
  const canvas = box.querySelector('canvas'), layer = box.querySelector('.uni-labels');
  const phone = innerWidth < 760;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone, alpha: true, powerPreference: 'high-performance' }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.4 : 1.6));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const world = new THREE.Group(); scene.add(world);
  const glow = glowTexture();
  const disposables = [glow];

  // starfield
  const STARS = phone ? 320 : 650;
  const sp = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) { const r = 35 + Math.random() * 50, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); sp.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.4, map: glow, transparent: true, depthWrite: false, color: 0x9fb8ff, opacity: 0.7, blending: THREE.AdditiveBlending }));
  scene.add(stars); disposables.push(sg, stars.material);

  // core
  const core = new THREE.Group(); world.add(core);
  const ico = new THREE.IcosahedronGeometry(1.5, 1), ico2 = new THREE.IcosahedronGeometry(2.05, 0);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(ico), new THREE.LineBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0.8 }));
  const wire2 = new THREE.LineSegments(new THREE.EdgesGeometry(ico2), new THREE.LineBasicMaterial({ color: 0x9b7bff, transparent: true, opacity: 0.35 }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 24), new THREE.MeshBasicMaterial({ color: 0x0b2a4a }));
  const mkGlow = (color, s, o) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.set(s, s, 1); disposables.push(m.material); return m; };
  const halo = mkGlow(0x38e1ff, 7, 0.85), halo2 = mkGlow(0x9b7bff, 13, 0.4);
  core.add(halo2, ball, wire, wire2, halo);
  disposables.push(ico, ico2, wire.geometry, wire.material, wire2.geometry, wire2.material, ball.geometry, ball.material);

  const pulses = [];
  const ringGeo = new THREE.RingGeometry(0.97, 1, 72); disposables.push(ringGeo);
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = Math.PI / 2 + 0.25; m.userData.t = i / 2; core.add(m); pulses.push(m); disposables.push(m.material);
  }

  // rings, glowing skill dots, and their HTML labels
  const nodes = [];
  layer.innerHTML = '';
  const rings = RINGS.map((R) => {
    const g = new THREE.Group(); g.rotation.set(...R.tilt); world.add(g);
    const pts = new THREE.EllipseCurve(0, 0, R.r, R.r).getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.LineLoop(lg, new THREE.LineBasicMaterial({ color: R.color, transparent: true, opacity: 0.22 }));
    g.add(line); disposables.push(lg, line.material);
    const spin = new THREE.Group(); g.add(spin);
    R.skills.forEach((name, i) => {
      const a = (i / R.skills.length) * Math.PI * 2 + R.r;
      const holder = new THREE.Object3D(); holder.position.set(Math.cos(a) * R.r, Math.sin(a) * R.r, 0); spin.add(holder);
      const dot = mkGlow(R.color, 0.85, 1); holder.add(dot);
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'uni-l'; el.textContent = name; el.style.setProperty('--c', hex(R.color));
      el.setAttribute('translate', 'no');
      layer.appendChild(el);
      const n = { name, key: R.key, color: hex(R.color), holder, dot, el, w: 0, h: 0, x: 0, y: 0, shown: false, op: -1 };
      el.addEventListener('click', (e) => { e.stopPropagation(); if (dragMoved) return; pick(n); });
      nodes.push(n);
    });
    return { spin, R };
  });

  // data particles streaming into the core
  const N = phone ? 80 : 170;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const parts = [];
  const palette = RINGS.map((r) => new THREE.Color(r.color)).concat([new THREE.Color(0x38e1ff)]);
  const spawn = (p) => {
    const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), r = 9 + Math.random() * 5;
    p.a = new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6, r * Math.cos(ph));
    p.c = p.a.clone().multiplyScalar(0.45).add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));
    p.t = 0; p.v = 0.16 + Math.random() * 0.22; p.col = palette[(Math.random() * palette.length) | 0];
  };
  for (let i = 0; i < N; i++) { const p = {}; spawn(p); p.t = Math.random(); parts.push(p); }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stream = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.3, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  world.add(stream); disposables.push(pg, stream.material);
  const tmp = new THREE.Vector3(), v = new THREE.Vector3();

  // interaction: drag to spin (with inertia), tilt toward the pointer, pick a label
  let yaw = 0, yawVel = 0.06, tiltX = 0, tiltT = 0, dragging = false, dragMoved = false, lastX = 0, startX = 0, startY = 0, paused = false, selected = null;
  const down = (e) => { dragging = true; dragMoved = false; lastX = startX = e.clientX; startY = e.clientY; onInteract && onInteract(); };
  const move = (e) => {
    const r = box.getBoundingClientRect();
    tiltT = (((e.clientY - r.top) / r.height) - 0.5) * -0.35;
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) dragMoved = true;
    yaw += dx * 0.006; yawVel = dx * 0.006 * 60;
    kick();
  };
  const up = () => { dragging = false; setTimeout(() => { dragMoved = false; }, 0); };
  box.addEventListener('pointerdown', down);
  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  function pick(n) {
    selected = n;
    nodes.forEach((m) => m.el.classList.toggle('sel', m === n));
    onPick && onPick(n.name, n.x, n.y, n.color, n.key);
  }

  // layout: fit the outer ring inside the box
  let W = 1, H = 1;
  const measure = () => nodes.forEach((n) => { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; });
  const resize = () => {
    W = box.clientWidth; H = box.clientHeight; if (!W || !H) return;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const fit = 7.9 / (Math.tan((25 * Math.PI) / 180) * Math.min(1, camera.aspect));
    camera.position.set(0, 1.6, fit);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    measure();
    draw(0);
  };
  const ro = new ResizeObserver(resize); ro.observe(box);

  let visible = true, raf = 0, last = 0, t = 0, dead = false, intro = REDUCED ? 1 : 0;
  const placed = [];
  function draw(dt) {
    t += dt;
    intro = Math.min(1, intro + dt * 0.6);
    const ease = 1 - Math.pow(1 - intro, 3);
    if (!dragging) { yawVel += ((paused ? 0 : 0.06) - yawVel) * Math.min(1, dt * 1.5); yaw += yawVel * dt; }
    tiltX += (tiltT - tiltX) * Math.min(1, dt * 3);
    world.rotation.set(tiltX, yaw, 0);
    world.scale.setScalar(0.65 + 0.35 * ease);
    core.rotation.y += dt * 0.3; wire.rotation.x += dt * 0.18; wire2.rotation.y -= dt * 0.22;
    const beat = 1 + Math.sin(t * 2.2) * 0.04; halo.scale.set(7 * beat, 7 * beat, 1);
    pulses.forEach((m) => { m.userData.t = (m.userData.t + dt * 0.3) % 1; const k = m.userData.t; m.scale.setScalar(1.6 + k * 7); m.material.opacity = 0.45 * (1 - k) * ease; });
    if (!paused) rings.forEach(({ spin, R }) => { spin.rotation.z += dt * R.speed; });
    stars.rotation.y += dt * 0.005;
    for (let i = 0; i < N; i++) {
      const p = parts[i];
      p.t += dt * p.v;
      if (p.t >= 1) spawn(p);
      const k = p.t, u = 1 - k;
      tmp.copy(p.a).multiplyScalar(u * u).addScaledVector(p.c, 2 * u * k);
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
      const f = Math.min(1, k * 4) * (k > 0.9 ? (1 - k) * 10 : 1);
      col[i * 3] = p.col.r * f; col[i * 3 + 1] = p.col.g * f; col[i * 3 + 2] = p.col.b * f;
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
    // labels: project, fade with depth, and skip any that would overlap a closer one
    world.updateMatrixWorld();
    nodes.forEach((n) => {
      n.holder.getWorldPosition(v);
      n.depth = v.distanceTo(camera.position);
      v.project(camera);
      n.x = (v.x * 0.5 + 0.5) * W; n.y = (-v.y * 0.5 + 0.5) * H;
    });
    const sorted = nodes.slice().sort((a, b) => (a === selected ? -1 : b === selected ? 1 : a.depth - b.depth));
    const dMin = camera.position.z - 8, dMax = camera.position.z + 8, minX = innerWidth >= 760 ? W * 0.14 : 4;
    placed.length = 0;
    for (const n of sorted) {
      const near = 1 - Math.min(1, Math.max(0, (n.depth - dMin) / (dMax - dMin)));
      const rx = n.x - n.w / 2, ry = n.y - n.h - 10;
      let ok = ease > 0.5 && rx > minX && rx + n.w < W - 4 && ry > 4 && n.y < H - 4 && (near > 0.32 || n === selected);
      if (ok) for (const r of placed) { if (rx < r[2] + 8 && rx + n.w + 8 > r[0] && ry < r[3] + 6 && ry + n.h + 6 > r[1]) { ok = false; break; } }
      if (ok) placed.push([rx, ry, rx + n.w, ry + n.h]);
      const op = ok ? (n === selected ? 1 : 0.45 + near * 0.55) : 0;
      if (Math.abs(op - n.op) > 0.02) { n.el.style.opacity = op.toFixed(2); n.op = op; }
      if (ok !== n.shown) { n.el.style.pointerEvents = ok ? 'auto' : 'none'; n.el.tabIndex = ok ? 0 : -1; n.shown = ok; }
      if (ok) n.el.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      n.dot.scale.setScalar(n === selected ? 1.8 : 0.85);
    }
  }
  const frame = (now) => {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    draw(dt);
    if (!REDUCED) raf = requestAnimationFrame(frame);
  };
  function kick() { if (!raf && !dead && visible) { last = 0; raf = requestAnimationFrame(frame); } }
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '40px' });
  io.observe(box);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  resize(); kick();

  return {
    /** freeze orbits while a skill pop-up is open, so the label stays next to it */
    hold(on) { paused = !!on; if (!on) { selected = null; nodes.forEach((m) => m.el.classList.remove('sel')); } },
    /** a visible label to nudge when the visitor is idle */
    hintable() { return nodes.filter((n) => n.shown && n !== selected); },
    relabel() { measure(); },
    destroy() {
      dead = true; ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      box.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
      layer.innerHTML = '';
      disposables.forEach((d) => d.dispose && d.dispose()); renderer.dispose();
    },
  };
}
