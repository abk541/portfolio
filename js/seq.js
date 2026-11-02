// AI section: a live sequence diagram + server log for an MCP-grounded question.
import { $, sleep, REDUCED } from './util.js';

const LANES = [
  { id: 'ui', short: 'Browser', name: 'Browser', sub: 'chat UI' },
  { id: 'srv', short: 'Server', name: 'MDM Beam', sub: 'Node · Express' },
  { id: 'entra', short: 'Entra', name: 'Entra ID', sub: 'OAuth 2.0' },
  { id: 'llm', short: 'Claude', name: 'Claude', sub: 'MS Foundry' },
  { id: 'mcp', short: 'MCP', name: 'Anypoint MCP', sub: 'Flex Gateway' },
  { id: 'sapi', short: 'SAPI', name: 'MDM SAPI', sub: 'Informatica B360' },
];
const C = { req: '#a78bfa', ok: '#34d399', llm: '#f472b6', mcp: '#00a0df', data: '#ff4d00', auth: '#fbbf24' };

const FLOWS = [
  {
    q: 'How many active projects mention “tunnel”?',
    steps: [
      ['ui', 'srv', 'POST /api/chat', C.req, '<span class="ac">POST</span> /api/chat  {q: "how many … tunnel"}'],
      ['srv', 'srv', 'intent = count → fast path', C.ok, '<span class="ok">fast-path</span> intent=count  criteria={name:"tunnel"}  <span class="dim">(no LLM round-trip)</span>'],
      ['srv', 'srv', 'Entra token: cache hit', C.auth, '<span class="wa">auth</span> entra token cached · expires in 41m'],
      ['srv', 'mcp', 'tools/call search_by_name', C.mcp, '<span class="ac">mcp</span> tools/call post_projects_search_by_name page=1'],
      ['mcp', 'sapi', 'GET /projects?page=1', C.mcp, '<span class="dim">gw</span> x-api-key ✓  rate-limit ✓  → sapi'],
      ['sapi', 'mcp', '200 · page 1 / 4', C.data, '<span class="pk">sapi</span> 200  rows=10  hasMore=true'],
      ['srv', 'mcp', 'pages 2–4 · ×3 concurrent', C.mcp, '<span class="ac">mcp</span> fan-out pages 2,3,4  concurrency=6', 3],
      ['mcp', 'srv', 'rows → 37', C.data, '<span class="pk">mcp</span> bridge dry · retrieved=37 · source counted 52 across all fields'],
      ['srv', 'ui', '37 projects · server-built answer', C.ok, '<span class="ok">200</span> answer in <b>412ms</b> · 0 tokens spent'],
    ],
  },
  {
    q: 'Which Swiss tunnel projects started after 2023, and who manages them?',
    steps: [
      ['ui', 'srv', 'POST /api/chat', C.req, '<span class="ac">POST</span> /api/chat  {q: "which swiss tunnel projects …"}'],
      ['srv', 'srv', 'intent = nuanced → Claude', C.llm, '<span class="pk">route</span> intent=nuanced → model'],
      ['srv', 'entra', 'refresh token', C.auth, '<span class="wa">auth</span> client_credentials → entra'],
      ['entra', 'srv', 'access_token (1h)', C.auth, '<span class="wa">auth</span> token cached · tool catalog fresh (stale-while-revalidate)'],
      ['srv', 'llm', 'messages + 14 MCP tools', C.llm, '<span class="pk">llm</span> messages.create  tools=14 (cached catalog)'],
      ['llm', 'srv', 'tool_use ×2 (parallel)', C.llm, '<span class="pk">llm</span> tool_use search_projects{country:"CH"}  +  get_coworkers{role:"manager"}'],
      ['srv', 'mcp', 'tools/call ×2 in parallel', C.mcp, '<span class="ac">mcp</span> Promise.all([search_projects, get_coworkers])', 2],
      ['mcp', 'sapi', 'GET /projects · GET /coworkers', C.mcp, '<span class="dim">gw</span> policies ✓ → sapi', 2],
      ['sapi', 'mcp', '200 · golden records', C.data, '<span class="pk">sapi</span> 200  projects=6  coworkers=6'],
      ['mcp', 'srv', 'results', C.data, '<span class="pk">mcp</span> results merged'],
      ['srv', 'llm', 'tool_result: totals + sample', C.llm, '<span class="pk">llm</span> tool_result  (totals + 5 sample rows, not the full set)'],
      ['llm', 'srv', 'grounded answer', C.llm, '<span class="ok">llm</span> answer grounded on 2 tool calls'],
      ['srv', 'ui', 'answer + full table', C.ok, '<span class="ok">200</span> answer in <b>2.1s</b> · UI renders all 6 rows'],
    ],
  },
];

let flowIdx = 0;
let runId = 0;
const NS = 'http://www.w3.org/2000/svg';

export function initSeq() {
  const svg = $('#seq-svg');
  const lanesEl = $('#seq-lanes');
  const term = $('#term-body');
  const input = $('#seq-input');
  const btn = $('#seq-run');
  let geo = null;

  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };

  const drawLanes = () => {
    const W = lanesEl.clientWidth, H = lanesEl.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = '';
    const lw = W / LANES.length;
    const xs = LANES.map((_, i) => lw * (i + 0.5));
    const narrow = lw < 110;
    LANES.forEach((l, i) => {
      mk('line', { x1: xs[i], y1: 44, x2: xs[i], y2: H, class: 'lane-line' }, svg);
      const g = mk('g', { class: 'lane-head' }, svg);
      const bw = Math.min(lw - 8, 132);
      mk('rect', { x: xs[i] - bw / 2, y: 2, width: bw, height: 40, rx: 9 }, g);
      const t = mk('text', { x: xs[i], y: narrow ? 26 : 20, 'text-anchor': 'middle' }, g);
      t.textContent = narrow ? l.short : l.name;
      if (!narrow) { const s = mk('text', { x: xs[i], y: 34, 'text-anchor': 'middle', class: 'sub' }, g); s.textContent = l.sub; }
    });
    const layer = mk('g', {}, svg);
    geo = { W, H, xs, layer, narrow };
  };

  const log = (html) => {
    const caret = term.querySelector('.caret');
    caret && caret.remove();
    const t = new Date();
    const ts = `${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}.${String(t.getMilliseconds()).padStart(3, '0')}`;
    term.insertAdjacentHTML('beforeend', `\n<span class="dim">${ts}</span> ${html}<span class="caret"></span>`);
    term.scrollTop = term.scrollHeight;
  };

  const animateArrow = (x1, x2, y, color, label, delay = 0, myRun) => new Promise((resolve) => {
    const { layer, narrow } = geo;
    const self = x1 === x2;
    const d = self ? `M${x1},${y - 8} C${x1 + 46},${y - 12} ${x1 + 46},${y + 10} ${x1 + 4},${y + 8}` : `M${x1},${y} L${x2},${y}`;
    const p = mk('path', { d, class: 'msg', stroke: color }, layer);
    const L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    const head = mk('circle', { r: 4, fill: color, class: 'dot', style: `color:${color}` }, layer);
    const lab = mk('text', { x: self ? x1 + 50 : (x1 + x2) / 2, y: y - 6, 'text-anchor': self ? 'start' : 'middle', class: 'msg-label', opacity: 0 }, layer);
    lab.textContent = narrow && label.length > 22 ? label.slice(0, 21) + '…' : label;
    const dur = REDUCED ? 1 : 520;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      if (myRun !== runId) return resolve();
      const k = Math.max(0, Math.min(1, (now - t0) / dur));
      const e = 1 - Math.pow(1 - k, 3);
      p.style.strokeDashoffset = L * (1 - e);
      const pt = p.getPointAtLength(L * e);
      head.setAttribute('cx', pt.x); head.setAttribute('cy', pt.y);
      lab.setAttribute('opacity', e);
      if (k < 1) requestAnimationFrame(tick);
      else {
        if (!self) {
          // arrow head
          const dir = Math.sign(x2 - x1);
          mk('path', { d: `M${x2 - dir * 7},${y - 4} L${x2},${y} L${x2 - dir * 7},${y + 4}`, fill: 'none', stroke: color, 'stroke-width': 1.5 }, layer);
        }
        head.setAttribute('r', 2.5);
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });

  const run = async () => {
    const myRun = ++runId;
    const flow = FLOWS[flowIdx % FLOWS.length];
    flowIdx++;
    input.textContent = flow.q;
    drawLanes();
    term.innerHTML = `<span class="dim">› question received</span>`;
    const top = 62, step = (geo.H - top - 16) / flow.steps.length;
    const idx = (id) => LANES.findIndex((l) => l.id === id);
    for (let i = 0; i < flow.steps.length; i++) {
      if (myRun !== runId) return;
      const [a, b, label, color, line, par = 1] = flow.steps[i];
      const y = top + step * (i + 0.5);
      log(line);
      const jobs = [];
      for (let k = 0; k < par; k++) jobs.push(animateArrow(geo.xs[idx(a)], geo.xs[idx(b)], y + k * 5 - (par - 1) * 2.5, color, k ? '' : label, k * 90, myRun));
      await Promise.all(jobs);
      await sleep(REDUCED ? 0 : 160);
    }
    if (myRun === runId) {
      log(`<span class="ok">✓ done</span> <span class="dim">press Send again for a ${flowIdx % 2 ? 'nuanced (LLM)' : 'fast-path'} question</span>`);
      btn.querySelector('span').textContent = 'Ask another';
    }
  };

  btn.addEventListener('click', run);
  new ResizeObserver(() => { if (!geo || Math.abs(lanesEl.clientWidth - geo.W) > 4) { runId++; drawLanes(); } }).observe(lanesEl);
  drawLanes();
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); setTimeout(run, 300); } }, { threshold: 0.45 });
  io.observe(lanesEl);
}
