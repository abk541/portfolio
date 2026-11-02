// AI section: a chat demo with a "behind the scenes" step list.
import { $, $$, icon, sleep, REDUCED, escapeHtml } from './util.js';

const IC = {
  browser: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".6"/><circle cx="9" cy="6.5" r=".6"/></svg>',
  server: '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6.5h.01M8 17.5h.01"/></svg>',
  route: '<svg viewBox="0 0 24 24"><path d="M6 3v6a6 6 0 0 0 6 6h6"/><path d="M15 12l3 3-3 3"/><circle cx="6" cy="3" r="1"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/></svg>',
  tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  db: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
  layers: '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
};
const brand = (n) => icon(n).replace('<svg ', '<svg class="fill" ');

const C = { ui: '#a78bfa', srv: '#34d399', auth: '#fbbf24', llm: '#f472b6', mcp: '#00a0df', data: '#ff6a2b' };

const FLOWS = [
  {
    q: 'How many active projects mention “tunnel”?',
    hint: 'Simple count → answered without AI',
    meta: 'Fast path · 412 ms',
    steps: [
      { ic: IC.browser, c: C.ui, t: 'Question sent', d: 'Only the question leaves the browser. No keys, no tokens.' },
      { ic: IC.route, c: C.srv, t: 'Recognised as a simple count', d: 'Simple intents skip the AI model entirely.', tag: 'no AI call' },
      { ic: IC.key, c: C.auth, t: 'Identity token already cached', d: 'Microsoft Entra ID token was warmed up at start-up.' },
      { ic: () => brand('mulesoft'), c: C.mcp, t: 'Search tool called through the gateway', d: 'Anypoint MCP behind Flex Gateway: API key and rate-limit checks.' },
      { ic: IC.layers, c: C.data, t: '4 result pages fetched in parallel', d: 'Up to 6 requests at once instead of one by one.' },
      { ic: IC.check, c: C.srv, t: 'Answer built by the server', d: 'Deterministic, instant, and costs zero AI tokens.', tag: '412 ms' },
    ],
    answer: `<b>37 active projects</b> mention “tunnel” in their name.<div class="meta"><span>412 ms</span><span>fast path</span><span>0 AI tokens</span></div>`,
  },
  {
    q: 'Which Swiss tunnel projects started after 2023, and who manages them?',
    hint: 'Needs interpretation → Claude + 2 tools',
    meta: 'AI path · 2.1 s',
    steps: [
      { ic: IC.browser, c: C.ui, t: 'Question sent', d: 'Only the question leaves the browser.' },
      { ic: IC.route, c: C.llm, t: 'Needs interpretation → AI path', d: 'Filters on country, date and people: a job for the model.' },
      { ic: IC.key, c: C.auth, t: 'Fresh identity token', d: 'Client-credentials flow with Microsoft Entra ID, cached for the hour.' },
      { ic: () => brand('claude'), c: C.llm, t: 'Claude picks 2 tools', d: 'From a cached catalogue of 14 MCP tools (refreshed in the background).' },
      { ic: () => brand('mulesoft'), c: C.mcp, t: 'Both tools run in parallel', d: 'Projects in Switzerland + their managers, through Flex Gateway.' },
      { ic: () => brand('informatica'), c: C.data, t: 'Golden records returned', d: 'Straight from the Informatica Business 360 MDM.' },
      { ic: () => brand('claude'), c: C.llm, t: 'Answer grounded in the results', d: 'The model sees totals and a sample, not the whole dataset.' },
      { ic: IC.check, c: C.srv, t: 'Answer + full table', d: 'The interface renders every row.', tag: '2.1 s' },
    ],
    answer: `<b>6 Swiss tunnel projects</b> started after 2023. Here they are with their managers:
      <table><tr><td>Tunnel · Lausanne</td><td>J. M•••</td></tr><tr><td>Gallery · Valais</td><td>S. B•••</td></tr><tr><td>Tunnel · Bern</td><td>L. R•••</td></tr><tr><td colspan="2" style="text-align:left">+ 3 more</td></tr></table>
      <div class="meta"><span>2.1 s</span><span>2 tool calls</span><span>grounded</span></div>`,
  },
];

let runId = 0;

export function initAI() {
  const body = $('#chat-body'), chips = $('#chat-chips'), hops = $('#hops'), meta = $('#route-meta');
  body.innerHTML = `<p class="chat-empty">Pick a question below to see how MDM Beam answers it.</p>`;
  chips.innerHTML = FLOWS.map((f, i) => `<button class="chip-q" data-i="${i}" type="button"><span>${escapeHtml(f.q)}<small>${escapeHtml(f.hint)}</small></span><span class="go"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></button>`).join('');

  const renderSteps = (f) => {
    hops.innerHTML = f.steps.map((s) => `<li class="hop" style="--c:${s.c}"><span class="hop-ic">${typeof s.ic === 'function' ? s.ic() : s.ic}</span><span class="hop-tx"><b>${escapeHtml(s.t)}</b><span>${escapeHtml(s.d)}</span>${s.tag ? `<em>${escapeHtml(s.tag)}</em>` : ''}</span></li>`).join('');
    meta.textContent = f.meta;
  };

  const run = async (i) => {
    const my = ++runId;
    const f = FLOWS[i];
    $$('.chip-q', chips).forEach((c, k) => c.classList.toggle('on', k === i));
    renderSteps(f);
    body.innerHTML = `<div class="msg user">${escapeHtml(f.q)}</div><div class="msg bot typing"><i></i><i></i><i></i></div>`;
    const items = $$('.hop', hops);
    const step = REDUCED ? 0 : 300;
    for (let k = 0; k < items.length; k++) {
      if (my !== runId) return;
      if (k) { items[k - 1].classList.remove('on'); items[k - 1].classList.add('done'); }
      items[k].classList.add('on');
      await sleep(step);
    }
    if (my !== runId) return;
    items[items.length - 1].classList.remove('on');
    items[items.length - 1].classList.add('done');
    body.querySelector('.typing').outerHTML = `<div class="msg bot">${f.answer}</div>`;
    if (window.gsap && !REDUCED) window.gsap.from(body.lastElementChild, { y: 14, opacity: 0, duration: 0.4, ease: 'power3.out' });
  };

  chips.addEventListener('click', (e) => { const b = e.target.closest('.chip-q'); if (b) run(+b.dataset.i); });
  renderSteps(FLOWS[0]);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); run(0); } }, { threshold: 0.4 });
  io.observe($('#chat'));
}
