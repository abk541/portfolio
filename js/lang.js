// Language: English and French are hand-written; other languages use automatic translation.
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const saved = read('lang');
const browserFr = (navigator.language || '').toLowerCase().startsWith('fr');
export const LANG = saved === 'fr' || saved === 'en' ? saved : (browserFr ? 'fr' : 'en');
export const AUTO_LANG = read('autoLang') || '';   // e.g. 'es', 'de', 'ar' (machine translation on top of English)
document.documentElement.lang = AUTO_LANG || LANG;

export const OTHER_LANGS = [
  ['es', 'Español'], ['de', 'Deutsch'], ['it', 'Italiano'], ['pt', 'Português'], ['nl', 'Nederlands'],
  ['ar', 'العربية'], ['tr', 'Türkçe'], ['pl', 'Polski'], ['ru', 'Русский'], ['zh-CN', '中文'], ['ja', '日本語'], ['hi', 'हिन्दी'],
];

/** Deep-merge translated fields into an object (arrays merge index by index). */
export function mergeInto(target, src) {
  if (!src) return target;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (Array.isArray(v) && Array.isArray(target[k])) {
      v.forEach((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item) && typeof target[k][i] === 'object') mergeInto(target[k][i], item);
        else if (item !== undefined) target[k][i] = item;
      });
    } else if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') {
      mergeInto(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

// UI strings. Keys are the English text; only French needs an entry.
const FR_UI = {
  // nav
  'Expertise': 'Expertise', 'AI': 'IA', 'Projects': 'Projets', 'Journey': 'Parcours', 'Contact': 'Contact', 'Home': 'Accueil',
  'Language': 'Langue', 'Other languages (automatic)': 'Autres langues (automatique)',
  // intro
  'intro.tag': '<span class="serif">Je fais dialoguer</span> les systèmes d’entreprise.',
  'Integration architect · MuleSoft · Informatica · AI': 'Architecte d’intégration · MuleSoft · Informatica · IA',
  'Touch the letters · tap anywhere · then scroll or press Enter': 'Touchez les lettres · tapez n’importe où · puis faites défiler ou appuyez sur Entrée',
  'Touch the letters · swipe up to enter': 'Touchez les lettres · glissez vers le haut pour entrer',
  'ENTER · EXPLORE · ENTER · EXPLORE ·': 'ENTRER · EXPLORER · ENTRER · EXPLORER ·',
  // hero
  'Tech Lead · Bouygues Construction IT': 'Tech Lead · Bouygues Construction IT',
  'Systems that': 'Des systèmes', 'talk.': 'qui parlent.',
  'I connect enterprise systems with': 'Je connecte les systèmes d’entreprise avec',
  'Full-stack apps': 'des apps full-stack', 'Agentic AI': 'l’IA agentique',
  '120+ APIs in production, a group-wide MDM, and 30 MCP servers that let AI agents use real company data.': 'Plus de 120 API en production, un MDM à l’échelle du groupe et 30 serveurs MCP qui donnent aux agents IA accès aux vraies données de l’entreprise.',
  'Explore my expertise': 'Découvrir mon expertise', 'See projects': 'Voir les projets',
  // impact
  'Impact': 'Impact', 'Numbers that run in production': 'Des chiffres qui tournent en production',
  // expertise
  '01 · Expertise': '01 · Expertise', 'Two platforms. One architect.': 'Deux plateformes. Un architecte.',
  'Pick a platform to see the architecture I designed, a live demo, key results and skills.': 'Choisissez une plateforme pour voir l’architecture que j’ai conçue, une démo en direct, les résultats clés et les compétences.',
  'API-led integration · since 2022': 'Intégration API-led · depuis 2022', 'IDMC · Business 360 MDM · since 2024': 'IDMC · MDM Business 360 · depuis 2024',
  'Architecture · live traffic': 'Architecture · trafic en direct',
  'Live demo': 'Démo en direct', 'Key results': 'Résultats clés', 'Skills': 'Compétences',
  'All traffic': 'Tout le trafic',
  'Back-ends → System APIs → Process APIs → Gateway → consumers': 'Back-ends → API système → API process → Gateway → consommateurs',
  'Sources → ingestion → golden record → distribution → consumers': 'Sources → ingestion → golden record → diffusion → consommateurs',
  'Source systems': 'Systèmes sources', 'Ingestion': 'Ingestion', 'Business 360 MDM core': 'Cœur MDM Business 360', 'Distribution': 'Diffusion', 'Consumers': 'Consommateurs',
  'Golden record per domain': 'Golden record par domaine', 'records consolidated': 'enregistrements consolidés',
  'Runtimes & ops': 'Runtimes et exploitation', 'Patterns': 'Patterns d’intégration', 'API, cloud & security': 'API, cloud et sécurité', 'DevOps': 'DevOps',
  'Data integration': 'Intégration de données', 'CAI orchestration': 'Orchestration CAI', 'Data': 'Data', 'Industrialisation': 'Industrialisation',
  // labs
  'Mule 3 → Mule 4 migration': 'Migration Mule 3 → Mule 4',
  'lab.mule.title': 'Migrer ~40 interfaces RH critiques <em class="serif">sans perdre un seul message.</em>',
  'lab.mule.text': 'Des API proxy se plaçaient devant chaque flux historique, pour basculer le trafic interface par interface dans plus de 80 pays. Faites glisser le curseur pour rejouer la bascule.',
  'cut-over': 'bascule', 'interfaces on Mule 4': 'interfaces sur Mule 4', 'zero downtime': 'zéro interruption', 'Mule 3 decommissioned ✓': 'Mule 3 décommissionné ✓',
  'HR consumers': 'Consommateurs RH', '80+ countries': '80+ pays', 'Proxy API': 'API proxy', 'routing rule': 'règle de routage', 'flows': 'flux',
  'Match & merge': 'Match and merge',
  'lab.infa.title': 'Trois fiches incohérentes entrent. <em class="serif">Un golden record en sort.</em>',
  'lab.infa.text': 'La fiabilité de chaque source décide quelle valeur survit pour chaque champ. Lancez le rapprochement pour voir la survivance à l’œuvre.',
  'Run match': 'Lancer le rapprochement', '★ Golden record': '★ Golden record',
  // AI
  '02 · AI architecture': '02 · Architecture IA', 'AI that reads the company, safely': 'Une IA qui lit l’entreprise, en sécurité',
  'MDM Beam answers questions about company data through governed MCP tools. Pick a question and see what happens behind the scenes.': 'MDM Beam répond aux questions sur les données de l’entreprise via des outils MCP gouvernés. Choisissez une question et découvrez ce qui se passe en coulisses.',
  'Company-data assistant': 'Assistant données d’entreprise', 'online': 'en ligne', 'Try a question': 'Essayez une question', 'Behind the scenes': 'En coulisses',
  'Pick a question below to see how MDM Beam answers it.': 'Choisissez une question ci-dessous pour voir comment MDM Beam y répond.',
  'Secrets stay on the server': 'Les secrets restent sur le serveur', 'Tokens and keys never reach the browser. They are cached and refreshed before they expire.': 'Jetons et clés n’atteignent jamais le navigateur. Ils sont mis en cache et renouvelés avant expiration.',
  'Simple first, AI when needed': 'Simple d’abord, l’IA si nécessaire', 'Counts and lookups get an instant server-built answer. The model is used only when a question needs interpretation.': 'Les comptages et recherches obtiennent une réponse instantanée du serveur. Le modèle n’intervient que si la question demande une interprétation.',
  'Every tool is a governed API': 'Chaque outil est une API gouvernée', 'Agent tools sit behind Flex Gateway with API keys, rate limits and Splunk traces, like any other consumer.': 'Les outils des agents passent par Flex Gateway avec clés d’API, limites de débit et traces Splunk, comme tout autre consommateur.',
  'Fast by design': 'Rapide par conception', 'Warm caches at start-up, parallel tool calls and concurrent pagination.': 'Caches préchauffés au démarrage, appels d’outils parallèles et pagination concurrente.',
  // projects
  '03 · Projects': '03 · Projets', 'Everything I\'ve shipped': 'Tout ce que j’ai livré',
  'Enterprise integration, AI assistants, mobile, CRMs and WebGL sites. Tap any card for details.': 'Intégration d’entreprise, assistants IA, mobile, CRM et sites WebGL. Touchez une carte pour le détail.',
  'All': 'Tout', 'AI & agents': 'IA et agents', 'Web & full-stack': 'Web et full-stack', 'Mobile': 'Mobile', 'Early days': 'Les débuts',
  'Details': 'Détails', 'View the code': 'Voir le code', 'Open the live site': 'Ouvrir le site', 'Private repository · demo on request': 'Dépôt privé · démo sur demande',
  // journey
  '04 · Journey': '04 · Parcours', 'From security to integration to AI': 'De la sécurité à l’intégration, puis à l’IA',
  // contact
  '05 · Contact': '05 · Contact', 'Let\'s integrate.': 'Intégrons.',
  'contact.lede': 'Architecture d’intégration, MDM, IA agentique sur les données d’entreprise, ou un produit qui doit exister le mois prochain. Anglais C2 · Français C2/C1 · Arabe langue maternelle.',
  'Email me': 'Écrivez-moi', 'Let\'s connect': 'Restons en contact',
  'Hand-built with Canvas, SVG and GSAP': 'Fait main avec Canvas, SVG et GSAP',
  // skill popover
  'Where I used it': 'Où je l’ai utilisé',
  // misc
  'MuleSoft': 'MuleSoft', 'Informatica': 'Informatica', 'AI · Lead': 'IA · Lead',
};

export function t(key) {
  if (LANG === 'fr' && FR_UI[key] !== undefined) return FR_UI[key];
  // keys like 'intro.tag' have an English default stored in the DOM, so return null to keep it
  return key.includes('.') && /^[a-z]+\.[a-z.]+$/.test(key) ? null : key;
}

/** Apply translations to every [data-i18n] / [data-i18n-html] element. */
export function translateDom(root = document) {
  if (LANG === 'en') return;
  root.querySelectorAll('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n || el.textContent.trim()); if (v) el.textContent = v; });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { const v = t(el.dataset.i18nHtml); if (v) el.innerHTML = v; });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    const v = t(key); if (v) el.setAttribute(attr, v);
  });
  root.querySelectorAll('[data-text]').forEach((el) => { const v = t(el.dataset.text); if (v) el.dataset.text = v; });
}
