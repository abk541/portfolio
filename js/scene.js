// The opening "skill universe": a glowing integration core, skills orbiting on
// rings (one per practice), data particles streaming into the core.
// Renders only while visible, caps pixel ratio, and degrades to nothing if WebGL is missing.
import * as THREE from '../vendor/three.module.min.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const RINGS = [
  { key: 'ai', color: 0xa78bfa, r: 3.1, tilt: [1.15, 0.0, 0.35], speed: 0.16, skills: ['MCP', 'Claude', 'Azure OpenAI', 'Prompt engineering', 'Anypoint MCP'] },
  { key: 'mule', color: 0x38bdf8, r: 4.5, tilt: [1.35, 0.0, -0.4], speed: -0.11, skills: ['Mule 4', 'DataWeave', 'Flex Gateway', 'API-led connectivity', 'RAML', 'MUnit', 'Anypoint Platform'] },
  { key: 'infa', color: 0xffa53b, r: 5.9, tilt: [1.05, 0.0, 0.9], speed: 0.075, skills: ['IDMC', 'Business 360', 'CDI', 'CAI', 'Match & merge', 'Snowflake', 'Reference 360'] },
  { key: 'web', color: 0x3dffa8, r: 7.2, tilt: [1.5, 0.0, 0.15], speed: -0.05, skills: ['React', 'TypeScript', 'Node.js', 'Kotlin', 'Next.js', 'Supabase'] },
];

function glowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,.35)') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, mid); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function labelTexture(text, color) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const f = '600 44px Inter, system-ui, sans-serif'; g.font = f;
  const w = Math.ceil(g.measureText(text).width) + 48; c.width = w; c.height = 76;
  g.font = f;
  g.fillStyle = 'rgba(5,8,18,.78)'; g.strokeStyle = color; g.lineWidth = 3;
  const r = 20; g.beginPath(); g.roundRect(2, 2, w - 4, 72, r); g.fill(); g.stroke();
  g.fillStyle = '#eaf0ff'; g.textBaseline = 'middle'; g.fillText(text, 24, 40);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { t, aspect: w / 76 };
}

export function initScene(canvas, { onSkill } = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch { return null; }
  const phone = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone() ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070f, 0.022);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const world = new THREE.Group(); scene.add(world);
  const glow = glowTexture();
  const disposables = [glow];

  // starfield
  const STARS = phone() ? 700 : 1400;
  const sp = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) { const r = 40 + Math.random() * 60, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); sp.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.35, map: glow, transparent: true, depthWrite: false, color: 0x9fb8ff, opacity: 0.8, blending: THREE.AdditiveBlending }));
  scene.add(stars); disposables.push(sg, stars.material);

  // core
  const core = new THREE.Group(); world.add(core);
  const ico = new THREE.IcosahedronGeometry(1.5, 1);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(ico), new THREE.LineBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0.75 }));
  const ico2 = new THREE.IcosahedronGeometry(2.05, 0);
  const wire2 = new THREE.LineSegments(new THREE.EdgesGeometry(ico2), new THREE.LineBasicMaterial({ color: 0x9b7bff, transparent: true, opacity: 0.35 }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), new THREE.MeshBasicMaterial({ color: 0x0b2a4a }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x38e1ff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(7.5, 7.5, 1);
  const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0x9b7bff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo2.scale.set(14, 14, 1);
  core.add(halo2, ball, wire, wire2, halo);
  disposables.push(ico, ico2, wire.geometry, wire.material, wire2.geometry, wire2.material, ball.geometry, ball.material, halo.material, halo2.material);

  // pulses from the core
  const pulses = [];
  const ringGeo = new THREE.RingGeometry(0.98, 1, 96); disposables.push(ringGeo);
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x38e1ff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = Math.PI / 2 + 0.25; m.userData.t = i / 3; core.add(m); pulses.push(m); disposables.push(m.material);
  }

  // orbit rings with skill nodes
  const nodes = [];
  const ringGroups = RINGS.map((R) => {
    const g = new THREE.Group(); g.rotation.set(...R.tilt); world.add(g);
    const pts = new THREE.EllipseCurve(0, 0, R.r, R.r).getPoints(160).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.LineLoop(lg, new THREE.LineBasicMaterial({ color: R.color, transparent: true, opacity: 0.28 }));
    g.add(line); disposables.push(lg, line.material);
    const spin = new THREE.Group(); g.add(spin);
    const hex = '#' + R.color.toString(16).padStart(6, '0');
    R.skills.forEach((name, i) => {
      const a = (i / R.skills.length) * Math.PI * 2;
      const holder = new THREE.Object3D(); holder.position.set(Math.cos(a) * R.r, Math.sin(a) * R.r, 0); spin.add(holder);
      const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: R.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      dot.scale.set(0.9, 0.9, 1); holder.add(dot);
      const { t, aspect } = labelTexture(name, hex);
      const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.92 }));
      const h = 0.42; lab.scale.set(h * aspect, h, 1); lab.center.set(0.5, -0.55); holder.add(lab);
      lab.userData = { name, key: R.key, base: [h * aspect, h], dot };
      nodes.push(lab);
      disposables.push(dot.material, t, lab.material);
    });
    return { g, spin, R };
  });

  // data streams: particles flying from far sources into the core along curves
  const N = phone() ? 160 : 320;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const parts = [];
  const palette = RINGS.map((r) => new THREE.Color(r.color)).concat([new THREE.Color(0x38e1ff)]);
  const spawn = (p) => {
    const th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1), r = 9 + Math.random() * 6;
    p.a = new THREE.Vector3(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6, r * Math.cos(ph));
    p.c = p.a.clone().multiplyScalar(0.45).add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));
    p.t = 0; p.v = 0.18 + Math.random() * 0.25; p.col = palette[(Math.random() * palette.length) | 0];
  };
  for (let i = 0; i < N; i++) { const p = {}; spawn(p); p.t = Math.random(); parts.push(p); }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const stream = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.28, map: glow, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  world.add(stream); disposables.push(pg, stream.material);
  const tmp = new THREE.Vector3(), zero = new THREE.Vector3();

  // interaction
  const mouse = new THREE.Vector2(0, 0), target = new THREE.Vector2(0, 0), ndc = new THREE.Vector2(9, 9);
  const ray = new THREE.Raycaster();
  let hovered = null;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    target.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ndc.copy(target);
  };
  const onLeave = () => { target.set(0, 0); ndc.set(9, 9); };
  const onClick = (e) => { if (hovered && onSkill) onSkill(hovered.userData.name, e.clientX, e.clientY); };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('click', onClick);

  // layout
  let offsetX = 0, offsetY = 0;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = w / h > 1.25;
    camera.position.set(0, 2.2, wide ? 17 : 23);
    offsetX = wide ? Math.min(6.4, (w / h) * 3.6) : 0;
    offsetY = wide ? 0 : 5.2;
    camera.updateProjectionMatrix();
    draw(0);
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  let visible = true, raf = 0, last = 0, t = 0, dead = false, intro = REDUCED ? 1 : 0;
  function draw(dt) {
    t += dt;
    intro = Math.min(1, intro + dt * 0.55);
    const ease = 1 - Math.pow(1 - intro, 3);
    mouse.lerp(target, 0.05);
    world.position.x = offsetX; world.position.y = offsetY;
    world.rotation.y = mouse.x * 0.35 + t * 0.04;
    world.rotation.x = -mouse.y * 0.18;
    world.scale.setScalar(0.6 + 0.4 * ease);
    camera.lookAt(0, 0, 0);
    core.rotation.y += dt * 0.35; wire.rotation.x += dt * 0.2; wire2.rotation.y -= dt * 0.25;
    const beat = 1 + Math.sin(t * 2.2) * 0.04;
    halo.scale.set(7.5 * beat, 7.5 * beat, 1);
    pulses.forEach((m) => { m.userData.t = (m.userData.t + dt * 0.33) % 1; const k = m.userData.t; m.scale.setScalar(1.6 + k * 7); m.material.opacity = 0.5 * (1 - k) * ease; });
    ringGroups.forEach(({ spin, R }) => { spin.rotation.z += dt * R.speed; spin.children.forEach((h) => { h.rotation.z = -spin.rotation.z; }); });
    stars.rotation.y += dt * 0.006;
    for (let i = 0; i < N; i++) {
      const p = parts[i];
      p.t += dt * p.v;
      if (p.t >= 1) spawn(p);
      const k = p.t, u = 1 - k;
      tmp.set(0, 0, 0).addScaledVector(p.a, u * u).addScaledVector(p.c, 2 * u * k).addScaledVector(zero, k * k);
      pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
      const f = Math.min(1, k * 4) * (k > 0.9 ? (1 - k) * 10 : 1);
      col[i * 3] = p.col.r * f; col[i * 3 + 1] = p.col.g * f; col[i * 3 + 2] = p.col.b * f;
    }
    pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
    // hover pick
    ray.setFromCamera(ndc, camera);
    const hit = ndc.x < 2 ? ray.intersectObjects(nodes, false)[0] : null;
    const h = hit ? hit.object : null;
    if (h !== hovered) {
      if (hovered) { const [w0, h0] = hovered.userData.base; hovered.scale.set(w0, h0, 1); hovered.userData.dot.scale.set(0.9, 0.9, 1); }
      hovered = h;
      if (hovered) { const [w0, h0] = hovered.userData.base; hovered.scale.set(w0 * 1.35, h0 * 1.35, 1); hovered.userData.dot.scale.set(1.8, 1.8, 1); }
      canvas.style.cursor = hovered ? 'pointer' : '';
    }
    renderer.render(scene, camera);
  }
  const frame = (now) => {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    draw(dt);
    if (!REDUCED) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && !dead) { last = 0; raf = requestAnimationFrame(frame); } };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '40px' });
  io.observe(canvas);
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  resize(); kick();

  return {
    destroy() {
      dead = true; ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerdown', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick);
      disposables.forEach((d) => d.dispose && d.dispose()); renderer.dispose();
    },
  };
}
