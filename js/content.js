// All site copy, English and French. Brand / product names are never translated.

export const UI = {
  en: {
    navHome: 'Home', navProjects: 'Projects', navCareer: 'Career',
    roleShort: 'Integration & AI Tech Lead',
    greet: ['Good morning', 'Good afternoon', 'Good evening'], greetName: 'I’m Abdelkader.',
    k1: 'Mule APIs in production', k1d: '9 business areas', k2: 'MCP servers for AI agents', k2d: 'since 2025', k3: 'CDI mappings shipped', k3d: '14 source systems', k4: 'countries reached', k4d: 'zero downtime',
    liveTitle: 'Live integration', liveTag: 'Live', liveSub: 'Business systems flowing through the hub to apps, AI agents and analytics. Hover a system to trace it, click to send a burst.',
    nowTitle: 'Right now', since: 'Since',
    jobsTitle: 'Master-data jobs in production', jobsTag: '140 jobs', jobsSub: 'Informatica Business 360 jobs by type. Hover a bar.',
    careerSub: 'From information-systems security to integration, data and AI.',
    msgTitle: 'Messages', msgSearch: 'Search', online: 'Usually replies within a day', typeHere: 'Write your message…', send: 'Send',
    open: 'Open', profile: 'Profile', basedOn: 'Open to', roles: 'Tech Lead · Integration · Data · AI on enterprise data',
    threads: [
      { id: 'mail', name: 'Email', icon: 'gmail', handle: 'abdelkader.elazzouzi@gmail.com', href: 'mailto:abdelkader.elazzouzi@gmail.com', preview: 'Fastest way to reach me', msgs: ['Hi, thanks for stopping by 👋', 'I’m open to Tech Lead roles in integration, data and AI.', 'Email is the fastest way to reach me. Type below and press Send: it opens your mail app with your message ready.'] },
      { id: 'in', name: 'LinkedIn', icon: 'linkedin', handle: 'Abdelkader El Azzouzi', href: 'https://www.linkedin.com/in/abdelkader-el-azzouzi-7778a5189', preview: 'Let’s connect', msgs: ['My full background and recommendations are on LinkedIn.', 'Feel free to connect or message me there.'] },
      { id: 'gh', name: 'GitHub', icon: 'github', handle: '@abk541', href: 'https://github.com/abk541', preview: 'Code and side projects', msgs: ['Public code and side projects live on GitHub.', 'Enterprise work is private, but I’m happy to walk you through it.'] },
    ],
    navWork: 'Work', navExpertise: 'Expertise', navExperience: 'Experience', navContact: 'Contact',
    lang: 'Language', otherLangs: 'Other languages (automatic)', menu: 'Menu', close: 'Close',
    heroEyebrow: 'Integration & AI Tech Lead · Bouygues Construction IT',
    heroTitle: 'I connect the software a company runs on, <em>and make AI useful on top of it.</em>',
    heroSub: 'Tech Lead for MuleSoft and Informatica at a global construction group. 120+ APIs in production, a group-wide master-data platform, and 30 MCP servers that let AI agents work with real company data. Building AI-enhanced products since 2023.',
    ctaWork: 'See selected work', ctaContact: 'Get in touch',
    stat1: 'APIs designed and running in production', stat2: 'MCP servers serving AI agents', stat3: 'countries reached by the HR flows I migrated', stat4: 'engineers led day to day',
    hubLabel: 'Integration hub',
    // what I do
    doEyebrow: 'In plain words', doTitle: 'What I do, without the jargon',
    doLede: 'Large companies run on dozens of apps that each keep their own copy of the data. I make them work as one.',
    toggleBefore: 'Without me', toggleAfter: 'With me',
    beforeCaption: 'Every app talks to every other app its own way. People re-type data, copies drift apart, and mistakes reach payroll.',
    afterCaption: 'Every app plugs into one hub, once. Data flows automatically, securely, and everyone works from the same version.',
    pillars: [
      { k: 'Connect', p: 'MuleSoft', t: 'I link HR, finance, sales and field apps so information moves on its own instead of by email and spreadsheets.' },
      { k: 'Clean', p: 'Informatica', t: 'When the same person exists five times with five spellings, I build the single trusted record every app uses.' },
      { k: 'Augment', p: 'AI', t: 'On top of that trusted data, AI assistants answer everyday questions safely, without ever seeing passwords or secrets.' },
    ],
    teamTitle: 'What it changes for a team', teamPick: 'Pick a team',
    teams: [
      { id: 'hr', label: 'HR', from: 'A new hire is entered once', to: ['Payroll', 'IT access & badge', 'Expenses', 'Project tools', 'Company directory', 'HR reporting'] },
      { id: 'fin', label: 'Finance', from: 'A supplier invoice arrives', to: ['Checked against the order', 'Booked in SAP', 'Archived', 'Status sent back', 'Reporting'] },
      { id: 'ops', label: 'Operations', from: 'A machine is booked for a site', to: ['Equipment ERP', 'Transport', 'Delivery note', 'Costs in SAP', 'Expenses'] },
      { id: 'mgmt', label: 'Leadership', from: 'One dashboard is opened', to: ['HR data', 'Finance data', 'Project data', 'Sales data', 'Operations data'] },
    ],
    teamResult: (n) => `Updated automatically in ${n} places. No re-typing.`,
    teamResultMgmt: (n) => `${n} sources, one version of the truth.`,
    // expertise
    exEyebrow: 'Expertise', exTitle: 'Three things I lead',
    exLede: 'Pick an area to see the architecture, explore it, and check the skills behind it. Tap any skill for a one-line explanation.',
    explore: 'Explore the architecture', tapDomain: 'Select a business area to trace its data', all: 'Everything',
    results: 'Key results', skills: 'Skills', whereUsed: 'Where I used it',
    aiPlay: 'Ask a question', aiFast: 'Simple question', aiSmart: 'Question that needs AI',
    // work
    workEyebrow: 'Selected work', workTitle: 'Projects',
    workLede: 'Enterprise platforms, AI assistants, mobile apps and websites. Open any project for details.',
    filters: { all: 'All', ai: 'AI', mule: 'MuleSoft', infa: 'Informatica', web: 'Web & apps', mobile: 'Mobile', data: 'Data', archive: 'Early days' },
    details: 'Details', viewCode: 'View the code', openSite: 'Open the live site', privateRepo: 'Private repository · demo on request', builtWith: 'Built with',
    // experience
    xpEyebrow: 'Experience', xpTitle: 'Career',
    present: 'Present', more: 'Show details', less: 'Hide details',
    eduTitle: 'Education', langTitle: 'Languages',
    // contact
    ctEyebrow: 'Contact', ctTitle: 'Let’s talk about your integration, data or AI project.',
    ctLede: 'Open to Tech Lead roles in integration, data and AI. I usually reply within a day.',
    email: 'Email me', footer: 'Hand-built, no templates.',
  },
  fr: {
    navHome: 'Accueil', navProjects: 'Projets', navCareer: 'Parcours',
    roleShort: 'Tech Lead Intégration & IA',
    greet: ['Bonjour', 'Bon après-midi', 'Bonsoir'], greetName: 'je suis Abdelkader.',
    k1: 'API Mule en production', k1d: '9 domaines métier', k2: 'serveurs MCP pour agents IA', k2d: 'depuis 2025', k3: 'mappings CDI livrés', k3d: '14 systèmes sources', k4: 'pays couverts', k4d: 'zéro interruption',
    liveTitle: 'Intégration en direct', liveTag: 'Direct', liveSub: 'Les systèmes métier circulent par le hub vers les applications, les agents IA et l’analytique. Survolez un système pour le suivre, cliquez pour envoyer une rafale.',
    nowTitle: 'En ce moment', since: 'Depuis',
    jobsTitle: 'Jobs de données de référence en production', jobsTag: '140 jobs', jobsSub: 'Jobs Informatica Business 360 par type. Survolez une barre.',
    careerSub: 'De la sécurité des systèmes d’information à l’intégration, la donnée et l’IA.',
    msgTitle: 'Messages', msgSearch: 'Rechercher', online: 'Répond en général sous 24 h', typeHere: 'Écrivez votre message…', send: 'Envoyer',
    open: 'Ouvrir', profile: 'Profil', basedOn: 'Ouvert à', roles: 'Tech Lead · Intégration · Data · IA sur données d’entreprise',
    threads: [
      { id: 'mail', name: 'E-mail', icon: 'gmail', handle: 'abdelkader.elazzouzi@gmail.com', href: 'mailto:abdelkader.elazzouzi@gmail.com', preview: 'Le plus rapide pour me joindre', msgs: ['Bonjour, merci de votre visite 👋', 'Je suis ouvert aux postes de Tech Lead en intégration, data et IA.', 'L’e-mail est le moyen le plus rapide. Écrivez ci-dessous puis Envoyer : votre messagerie s’ouvre avec votre message prêt.'] },
      { id: 'in', name: 'LinkedIn', icon: 'linkedin', handle: 'Abdelkader El Azzouzi', href: 'https://www.linkedin.com/in/abdelkader-el-azzouzi-7778a5189', preview: 'Restons en contact', msgs: ['Mon parcours complet et mes recommandations sont sur LinkedIn.', 'N’hésitez pas à m’ajouter ou à m’écrire là-bas.'] },
      { id: 'gh', name: 'GitHub', icon: 'github', handle: '@abk541', href: 'https://github.com/abk541', preview: 'Code et projets perso', msgs: ['Le code public et mes projets perso sont sur GitHub.', 'Les projets d’entreprise sont privés, mais je peux vous les présenter.'] },
    ],
    navWork: 'Projets', navExpertise: 'Expertise', navExperience: 'Parcours', navContact: 'Contact',
    lang: 'Langue', otherLangs: 'Autres langues (automatique)', menu: 'Menu', close: 'Fermer',
    heroEyebrow: 'Tech Lead Intégration & IA · Bouygues Construction IT',
    heroTitle: 'Je connecte les logiciels sur lesquels tourne une entreprise, <em>et j’y rends l’IA utile.</em>',
    heroSub: 'Tech Lead MuleSoft et Informatica dans un groupe international de construction. Plus de 120 API en production, une plateforme de données de référence à l’échelle du groupe, et 30 serveurs MCP qui donnent aux agents IA accès aux vraies données de l’entreprise. Full-stack augmenté par l’IA depuis 2023.',
    ctaWork: 'Voir mes projets', ctaContact: 'Me contacter',
    stat1: 'API conçues et en production', stat2: 'serveurs MCP au service des agents IA', stat3: 'pays couverts par les flux RH que j’ai migrés', stat4: 'ingénieurs encadrés au quotidien',
    hubLabel: 'Hub d’intégration',
    doEyebrow: 'En clair', doTitle: 'Ce que je fais, sans jargon',
    doLede: 'Les grandes entreprises tournent sur des dizaines d’applications qui gardent chacune leur propre copie des données. Je les fais fonctionner comme une seule.',
    toggleBefore: 'Sans moi', toggleAfter: 'Avec moi',
    beforeCaption: 'Chaque application parle à chaque autre à sa façon. On ressaisit les données, les copies divergent, et les erreurs arrivent jusqu’à la paie.',
    afterCaption: 'Chaque application se branche une seule fois sur un hub. Les données circulent automatiquement, en sécurité, et tout le monde travaille sur la même version.',
    pillars: [
      { k: 'Connecter', p: 'MuleSoft', t: 'Je relie les applications RH, finance, commerce et chantier pour que l’information circule seule, sans e-mails ni tableurs.' },
      { k: 'Fiabiliser', p: 'Informatica', t: 'Quand la même personne existe cinq fois avec cinq orthographes, je construis la fiche unique et fiable utilisée par toutes les applications.' },
      { k: 'Augmenter', p: 'IA', t: 'Sur ces données fiables, des assistants IA répondent aux questions du quotidien, en sécurité, sans jamais voir de mot de passe.' },
    ],
    teamTitle: 'Ce que ça change pour une équipe', teamPick: 'Choisissez une équipe',
    teams: [
      { id: 'hr', label: 'RH', from: 'Une recrue est saisie une seule fois', to: ['Paie', 'Accès IT et badge', 'Notes de frais', 'Outils projets', 'Annuaire', 'Reporting RH'] },
      { id: 'fin', label: 'Finance', from: 'Une facture fournisseur arrive', to: ['Contrôlée face à la commande', 'Comptabilisée dans SAP', 'Archivée', 'Statut renvoyé', 'Reporting'] },
      { id: 'ops', label: 'Opérations', from: 'Un engin est réservé pour un chantier', to: ['ERP matériel', 'Transport', 'Bon de livraison', 'Coûts dans SAP', 'Dépenses'] },
      { id: 'mgmt', label: 'Direction', from: 'Un tableau de bord s’ouvre', to: ['Données RH', 'Données finance', 'Données projets', 'Données commerciales', 'Données opérations'] },
    ],
    teamResult: (n) => `Mis à jour automatiquement à ${n} endroits. Aucune ressaisie.`,
    teamResultMgmt: (n) => `${n} sources, une seule version de la vérité.`,
    exEyebrow: 'Expertise', exTitle: 'Trois domaines que je pilote',
    exLede: 'Choisissez un domaine pour voir l’architecture, l’explorer, et découvrir les compétences associées. Touchez une compétence pour une explication en une ligne.',
    explore: 'Explorer l’architecture', tapDomain: 'Sélectionnez un domaine métier pour suivre ses données', all: 'Tout',
    results: 'Résultats clés', skills: 'Compétences', whereUsed: 'Où je l’ai utilisé',
    aiPlay: 'Poser une question', aiFast: 'Question simple', aiSmart: 'Question qui demande l’IA',
    workEyebrow: 'Réalisations', workTitle: 'Projets',
    workLede: 'Plateformes d’entreprise, assistants IA, applications mobiles et sites web. Ouvrez un projet pour le détail.',
    filters: { all: 'Tout', ai: 'IA', mule: 'MuleSoft', infa: 'Informatica', web: 'Web et applis', mobile: 'Mobile', data: 'Data', archive: 'Les débuts' },
    details: 'Détails', viewCode: 'Voir le code', openSite: 'Ouvrir le site', privateRepo: 'Dépôt privé · démo sur demande', builtWith: 'Technologies',
    xpEyebrow: 'Parcours', xpTitle: 'Expérience',
    present: 'Aujourd’hui', more: 'Voir le détail', less: 'Masquer le détail',
    eduTitle: 'Formation', langTitle: 'Langues',
    ctEyebrow: 'Contact', ctTitle: 'Parlons de votre projet d’intégration, de données ou d’IA.',
    ctLede: 'Ouvert aux postes de Tech Lead en intégration, data et IA. Je réponds en général sous 24 h.',
    email: 'Écrivez-moi', footer: 'Fait main, sans template.',
  },
};

/* ------------------------------------------------------------------ expertise */
export const EXPERTISE = {
  mule: {
    color: '#0a8fcc', icon: 'mulesoft', name: 'MuleSoft',
    en: {
      tab: 'Integration', title: 'The integration backbone of a global group',
      text: '120+ Mule APIs following API-led connectivity: System APIs wrap each back-end, Process APIs orchestrate each business area, and Flex Gateway exposes them to applications, partners and AI agents.',
      cols: ['Systems', 'Business areas', 'Used by'],
      links: ['System APIs', 'Process APIs + Flex Gateway'],
      results: [
        ['120+', 'Mule APIs across 9 business areas: reference data, SAP finance, e-invoicing (EN 16931), HR, temp staff, equipment, CRM and Swiss payroll.'],
        ['~40', 'critical HR interfaces migrated from Mule 3 to Mule 4 in 80+ countries, with zero downtime through proxy APIs and progressive cut-over.'],
        ['30', 'MCP servers giving AI agents governed access to reference data, born from my MCP Bridge proof of concept.'],
        ['25+', 'Flex Gateway proxies opening SAP and internal tools to non-Mule apps, secured by a custom API-key policy I wrote.'],
      ],
    },
    fr: {
      tab: 'Intégration', title: 'Le socle d’intégration d’un groupe international',
      text: 'Plus de 120 API Mule selon l’approche API-led : les API système encapsulent chaque back-end, les API process orchestrent chaque domaine métier, et Flex Gateway les expose aux applications, aux partenaires et aux agents IA.',
      cols: ['Systèmes', 'Domaines métier', 'Utilisé par'],
      links: ['API système', 'API process + Flex Gateway'],
      results: [
        ['120+', 'API Mule sur 9 domaines : données de référence, finance SAP, facturation électronique (EN 16931), RH, intérim, équipements, CRM et paie suisse.'],
        ['~40', 'interfaces RH critiques migrées de Mule 3 vers Mule 4 dans plus de 80 pays, sans interruption grâce aux API proxy et à une bascule progressive.'],
        ['30', 'serveurs MCP donnant aux agents IA un accès gouverné aux données de référence, nés de mon PoC MCP Bridge.'],
        ['25+', 'proxys Flex Gateway ouvrant SAP et les outils internes aux applications non-Mule, sécurisés par une policy de clé d’API que j’ai développée.'],
      ],
    },
    systems: ['SAP ERP', 'SAP BW', 'Salesforce', 'Informatica MDM', 'Global HR', 'Dayforce', 'Zellis', 'SAP Concur', 'Memority', 'Generix', 'Maileva', 'Hexagon', 'Tracktor', 'Dashdoc', 'Abacus', 'Splunk'],
    consumers: { en: ['Business apps', 'Non-Mule apps', 'AI agents'], fr: ['Applications métier', 'Applications non-Mule', 'Agents IA'] },
    domains: [
      { id: 'mdm', en: ['Reference data', 'System APIs exposing the master data for employees, projects and third parties, with every change pushed to downstream apps through an event manager.'], fr: ['Données de référence', 'API système exposant les données maîtres des collaborateurs, projets et tiers, chaque modification étant diffusée aux applications aval via un gestionnaire d’événements.'], sys: ['Informatica MDM', 'SAP BW', 'Salesforce', 'Global HR', 'SAP ERP'], use: [0, 2] },
      { id: 'sap', en: ['SAP finance', 'One System API per SAP scope: purchase orders and receipts with IDoc tracking, fixed assets, timesheets, payroll postings and BW reporting.'], fr: ['Finance SAP', 'Une API système par périmètre SAP : commandes et réceptions avec suivi des IDoc, immobilisations, feuilles de temps, écritures de paie et reporting BW.'], sys: ['SAP ERP', 'SAP BW'], use: [0, 1] },
      { id: 'einv', en: ['E-invoicing', 'Invoice API with status events and published schemas, end-to-end with the Generix platform and SAP to read, write and archive invoices (EN 16931).'], fr: ['Facturation électronique', 'API facture avec événements de statut et schémas publiés, de bout en bout avec Generix et SAP pour lire, écrire et archiver les factures (EN 16931).'], sys: ['Generix', 'SAP ERP'], use: [0] },
      { id: 'hr', en: ['HR & people', 'Directory and employee-record APIs, payroll flows (Zellis, Dayforce, SAP Concur) and identity lifecycle in Memority.'], fr: ['RH & collaborateurs', 'API annuaire et fiche collaborateur, flux de paie (Zellis, Dayforce, SAP Concur) et cycle de vie des identités dans Memority.'], sys: ['Global HR', 'Dayforce', 'Zellis', 'SAP Concur', 'Memority', 'Salesforce'], use: [0, 1] },
      { id: 'temp', en: ['Temp staff', 'Batch platform for temp-staff contracts: multi-source time sheets with anomaly tracking, valuation and export to SAP.'], fr: ['Intérim', 'Plateforme batch des contrats d’intérim : pointages multi-sources avec suivi des anomalies, valorisation et export vers SAP.'], sys: ['SAP ERP', 'Zellis'], use: [0] },
      { id: 'ch', en: ['Swiss payroll', 'Inbound file routing over SFTP, payroll conversion for Abacus and salary postings in SAP for the Swiss subsidiary.'], fr: ['Paie suisse', 'Routage de fichiers entrants via SFTP, conversion de paie pour Abacus et comptabilisation des salaires dans SAP pour la filiale suisse.'], sys: ['Abacus', 'SAP ERP'], use: [0] },
      { id: 'equip', en: ['Equipment & logistics', 'Equipment ERP, machine bookings, transport and delivery notes, with order validation ahead of SAP and dead-letter queues.'], fr: ['Équipements & logistique', 'ERP matériel, réservations d’engins, transport et bons de livraison, avec validation des commandes avant SAP et dead-letter queues.'], sys: ['Hexagon', 'Tracktor', 'Dashdoc', 'SAP ERP'], use: [0, 1] },
      { id: 'crm', en: ['CRM', 'Salesforce opportunities pushed to master-data projects, document archiving and paper mail through Maileva with status callbacks.'], fr: ['CRM', 'Opportunités Salesforce transmises aux projets du référentiel, archivage documentaire et courrier papier via Maileva avec retour de statut.'], sys: ['Salesforce', 'Maileva', 'Informatica MDM'], use: [0] },
      { id: 'plat', en: ['Platform & AI', '30 MCP servers for AI agents, 25+ gateway proxies with a custom API-key policy, shared templates and centralised logging in Splunk.'], fr: ['Plateforme & IA', '30 serveurs MCP pour les agents IA, 25+ proxys gateway avec policy de clé d’API sur mesure, templates partagés et logs centralisés dans Splunk.'], sys: ['Splunk', 'Informatica MDM'], use: [1, 2] },
    ],
    skills: ['Anypoint Platform', 'Mule 4', 'DataWeave', 'API-led connectivity', 'RAML', 'OAS', 'API Manager', 'Flex Gateway', 'Custom policies', 'MUnit', 'CloudHub 2.0', 'Runtime Fabric', 'Anypoint Monitoring', 'Splunk', 'Event-driven', 'Dead-letter queues', 'SAP IDoc', 'Strangler cut-over', 'OAuth 2.0', 'Azure APIM', 'GitLab CI/CD'],
  },
  infa: {
    color: '#e8590c', icon: 'informatica', name: 'Informatica',
    en: {
      tab: 'Master data', title: 'One trusted record for the whole group',
      text: 'A group-wide MDM on Informatica IDMC Business 360. Sources land through CDI and APIs, are consolidated into three master domains, then broadcast by business events to MuleSoft and by egress to Snowflake.',
      cols: ['Sources', 'Golden record', 'Used by'],
      links: ['CDI batch + real-time API', 'Events · egress · CAI'],
      results: [
        ['3', 'master domains (Employees, Projects & Operations, Organisation & Finance), ~20 business entities, 40 relationships and 50 reference lists.'],
        ['14', 'source systems integrated: ~150 CDI mappings, 110 taskflows and 140 Business 360 jobs in production.'],
        ['21', 'match & merge jobs with per-source trust, exact and fuzzy rules and tested merge thresholds, cleaning millions of records.'],
        ['~30', 'business events published to MuleSoft, plus Snowflake exports per entity for BI.'],
      ],
    },
    fr: {
      tab: 'Données de référence', title: 'Une fiche fiable et unique pour tout le groupe',
      text: 'Un MDM groupe sur Informatica IDMC Business 360. Les sources arrivent par CDI et par API, sont consolidées sur trois domaines maîtres, puis diffusées par événements vers MuleSoft et par egress vers Snowflake.',
      cols: ['Sources', 'Golden record', 'Utilisé par'],
      links: ['Batch CDI + API temps réel', 'Événements · egress · CAI'],
      results: [
        ['3', 'domaines maîtres (Collaborateurs, Projets et Opérations, Organisation et Finance), une vingtaine d’entités, 40 relations et 50 listes de référence.'],
        ['14', 'systèmes sources intégrés : ~150 mappings CDI, 110 taskflows et 140 jobs Business 360 en production.'],
        ['21', 'jobs de match and merge avec fiabilité par source, règles exactes et approchées et seuils de fusion testés, sur des millions d’enregistrements.'],
        ['~30', 'business events publiés vers MuleSoft, plus des exports Snowflake par entité pour la BI.'],
      ],
    },
    systems: ['SAP ECC', 'SAP BW', 'SAS SI RH', 'ADP', 'BMS', 'PUMA', 'eCheckIn', 'IAM', 'Employee Profile', 'CoWorker Tool', 'Salesforce CRM'],
    consumers: { en: ['MuleSoft (payroll, HR, projects)', 'Snowflake (BI)', 'Third-party tools'], fr: ['MuleSoft (paie, RH, projets)', 'Snowflake (BI)', 'Outils tiers'] },
    domains: [
      { id: 'cow', en: ['Employees', 'CoWorker model with 50 fields, job and assignment groups, manager and org-unit relationships, legal entities.'], fr: ['Collaborateurs', 'Modèle CoWorker de 50 champs, groupes de postes et d’affectations, relations manager et unité organisationnelle, sociétés juridiques.'], sys: ['SAS SI RH', 'ADP', 'IAM', 'Employee Profile', 'eCheckIn', 'CoWorker Tool'], use: [0, 1] },
      { id: 'proj', en: ['Projects & Operations', 'Sub-operations on 42 fields with environmental commitments, code generation and links to operations and SAP references.'], fr: ['Projets et Opérations', 'Sous-opérations sur 42 champs avec engagements environnementaux, génération de codes et rattachement aux opérations et références SAP.'], sys: ['SAP ECC', 'SAP BW', 'BMS', 'PUMA', 'Salesforce CRM'], use: [0, 1, 2] },
      { id: 'org', en: ['Organisation & Finance', 'Profit centres, legal and accounting companies, financial units and org units, with hierarchies built in Hierarchy Builder.'], fr: ['Organisation et Finance', 'Profit centers, sociétés juridiques et comptables, unités financières et UO, avec des hiérarchies construites dans Hierarchy Builder.'], sys: ['SAP ECC', 'SAP BW', 'SAS SI RH', 'BMS'], use: [0, 1] },
    ],
    skills: ['IDMC', 'Business 360', 'Multidomain MDM', 'Reference 360', 'CDI', 'CAI', 'CDQ', 'Secure Agent', 'Data modelling', 'Match & merge', 'Survivorship', 'Quality rules', 'Hierarchy Builder', 'Business events', 'Taskflows', 'Snowflake', 'SQL', 'PL/SQL', 'SAP ECC', 'Node.js', 'PowerShell'],
  },
  ai: {
    color: '#6d4ce8', icon: 'claude', name: 'AI',
    en: {
      tab: 'AI on company data', title: 'AI assistants that answer from trusted data',
      text: 'I expose company data to AI agents as governed tools (MCP), behind the same gateways and identity rules as any other app. MDM Beam, the assistant I built, answers questions in plain language without the AI ever seeing a secret.',
      results: [
        ['30', 'MCP servers in production giving agents access to reference data.'],
        ['0', 'secrets in the browser: tokens and keys stay on the server, cached and renewed before they expire.'],
        ['412 ms', 'for simple questions, answered by the server without calling the AI model at all.'],
        ['6', 'result pages fetched in parallel instead of one by one, and tool calls run side by side.'],
      ],
      flows: [
        { q: 'How many active projects mention “tunnel”?', a: '37 active projects mention “tunnel” in their name.', meta: 'Fast path · 412 ms · no AI tokens', steps: ['Question sent (no keys leave the browser)', 'Recognised as a simple count: no AI needed', 'Identity token already cached', 'Search tool called through the gateway', '4 result pages fetched in parallel', 'Answer built by the server'] },
        { q: 'Which Swiss tunnel projects started after 2023, and who manages them?', a: '6 Swiss tunnel projects started after 2023, listed with their managers.', meta: 'AI path · 2.1 s · grounded in 2 tool calls', steps: ['Question sent', 'Needs interpretation: routed to Claude', 'Fresh identity token from Microsoft Entra ID', 'Claude picks 2 tools from a cached catalogue', 'Both tools run in parallel through Flex Gateway', 'Golden records returned from the MDM', 'Answer grounded in the results'] },
      ],
    },
    fr: {
      tab: 'IA sur les données', title: 'Des assistants IA qui répondent à partir de données fiables',
      text: 'J’expose les données de l’entreprise aux agents IA sous forme d’outils gouvernés (MCP), derrière les mêmes gateways et règles d’identité que n’importe quelle application. MDM Beam, l’assistant que j’ai construit, répond en langage courant sans que l’IA ne voie jamais un secret.',
      results: [
        ['30', 'serveurs MCP en production donnant aux agents accès aux données de référence.'],
        ['0', 'secret dans le navigateur : jetons et clés restent sur le serveur, en cache et renouvelés avant expiration.'],
        ['412 ms', 'pour les questions simples, traitées par le serveur sans appeler le modèle IA.'],
        ['6', 'pages de résultats récupérées en parallèle au lieu d’une par une, et des appels d’outils simultanés.'],
      ],
      flows: [
        { q: 'Combien de projets actifs mentionnent « tunnel » ?', a: '37 projets actifs mentionnent « tunnel » dans leur nom.', meta: 'Voie rapide · 412 ms · aucun jeton IA', steps: ['Question envoyée (aucune clé ne quitte le navigateur)', 'Reconnu comme un simple comptage : pas besoin d’IA', 'Jeton d’identité déjà en cache', 'Outil de recherche appelé via la gateway', '4 pages de résultats en parallèle', 'Réponse construite par le serveur'] },
        { q: 'Quels projets de tunnel en Suisse ont démarré après 2023, et qui les pilote ?', a: '6 projets de tunnel suisses ont démarré après 2023, listés avec leurs responsables.', meta: 'Voie IA · 2,1 s · sourcé sur 2 appels d’outils', steps: ['Question envoyée', 'Interprétation nécessaire : envoyée à Claude', 'Nouveau jeton Microsoft Entra ID', 'Claude choisit 2 outils dans un catalogue en cache', 'Les deux outils tournent en parallèle via Flex Gateway', 'Golden records renvoyés par le MDM', 'Réponse ancrée dans les résultats'] },
      ],
    },
    skills: ['MCP', 'Anypoint MCP', 'Claude', 'Microsoft Foundry', 'Azure OpenAI', 'Entra ID', 'Prompt engineering', 'Node.js', 'Express', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Kotlin', 'Android Auto', 'Next.js', 'GSAP', 'GitHub Actions', 'Playwright'],
  },
};

/* ------------------------------------------------------------------ experience */
export const EXPERIENCE = [
  {
    from: '2024-07', to: null, org: 'Bouygues Construction IT', icon: 'mulesoft',
    en: { role: 'Tech Lead, MuleSoft Integration & API Management', sum: 'Lead the group integration platform: architecture, standards and production.', pts: ['Designed and built 120+ Mule APIs across 9 business areas, from SAP finance and e-invoicing (EN 16931) to HR, CRM and Swiss payroll.', 'Brought AI agents to enterprise data: 30 MCP servers in production, after an MCP Bridge proof of concept on Azure OpenAI.', 'Secured the exposure layer with 25+ Flex Gateway proxies and a custom API-key policy.', 'Wrote the team’s best-practice “golden book” and reusable templates (global error handler, logging connector, project templates).', 'Lead 4 engineers: onboarding, code reviews and architecture decisions, with business teams in France and Switzerland.', 'Own production on CloudHub 1.0 & 2.0, Runtime Fabric and on-prem runtimes: monitoring, root-cause analysis and SLAs.'] },
    fr: { role: 'Tech Lead, Intégration MuleSoft & API Management', sum: 'Pilotage du socle d’intégration du groupe : architecture, standards et production.', pts: ['Conception et développement de plus de 120 API Mule sur 9 domaines, de la finance SAP et la facturation électronique (EN 16931) aux RH, au CRM et à la paie suisse.', 'Intégration de l’IA agentique aux données d’entreprise : 30 serveurs MCP en production, après un PoC MCP Bridge sur Azure OpenAI.', 'Sécurisation de la couche d’exposition avec plus de 25 proxys Flex Gateway et une policy de clé d’API sur mesure.', 'Rédaction du référentiel de bonnes pratiques (golden book) et des templates réutilisables (gestionnaire d’erreurs global, connecteur de logging, templates de projet).', 'Encadrement de 4 ingénieurs : intégration, revues de code et arbitrages d’architecture, avec les équipes métier en France et en Suisse.', 'Responsabilité de la production sur CloudHub 1.0 et 2.0, Runtime Fabric et on-premise : supervision, analyse des causes racines et SLA.'] },
  },
  {
    from: '2024-07', to: null, org: 'Bouygues Construction IT', icon: 'informatica',
    en: { role: 'Tech Lead, Reference-Data Platform (Informatica IDMC MDM)', sum: 'Designed and run the group master-data hub on Business 360.', pts: ['Built the group MDM: 3 domains, ~20 business entities, 40 relationships and 50 reference lists, feeding 30–40 systems and Snowflake.', 'Integrated 14 source systems with ~150 CDI mappings, 110 taskflows and 140 Business 360 jobs.', 'Defined quality, survivorship and matching rules; 21 match & merge jobs making millions of records reliable.', 'Industrialised DEV → PREPROD → PROD releases with Node.js and PowerShell tooling, backups and rollback.', 'Led a make-or-buy study (IDMC vs Semarchy vs open source) with an AtroCore proof of concept.'] },
    fr: { role: 'Tech Lead, Plateforme de données de référence (Informatica IDMC MDM)', sum: 'Conception et exploitation du hub de données de référence du groupe sur Business 360.', pts: ['Construction du MDM groupe : 3 domaines, une vingtaine d’entités, 40 relations et 50 listes de référence, alimentant 30 à 40 systèmes et Snowflake.', 'Intégration de 14 systèmes sources avec ~150 mappings CDI, 110 taskflows et 140 jobs Business 360.', 'Définition des règles de qualité, de survivance et de rapprochement ; 21 jobs de match and merge fiabilisant des millions d’enregistrements.', 'Industrialisation des livraisons DEV → PREPROD → PROD avec un outillage Node.js et PowerShell, sauvegardes et retour arrière.', 'Étude make or buy (IDMC, Semarchy, open source) avec un PoC AtroCore.'] },
  },
  {
    from: '2023-01', to: null, org: 'Independent', orgFr: 'Indépendant', icon: 'claude',
    en: { role: 'AI-Enhanced Full-Stack Developer', sum: 'Building products end to end with AI as a co-pilot.', pts: ['MDM Beam: secure company-data assistant on Anypoint MCP and Claude.', 'HEV Dash: custom Android Auto dashboard in Kotlin, released automatically by CI.', 'CRM/ERP for a federal contractor, DocFdar (home doctor visits), Blue Site (water monitoring) and WebGL marketing sites.'] },
    fr: { role: 'Développeur Full-Stack augmenté par l’IA', sum: 'Conception de produits de bout en bout avec l’IA comme copilote.', pts: ['MDM Beam : assistant sécurisé sur les données d’entreprise, avec Anypoint MCP et Claude.', 'HEV Dash : tableau de bord Android Auto sur mesure en Kotlin, publié automatiquement par la CI.', 'CRM/ERP pour un prestataire fédéral, DocFdar (visites médicales à domicile), Blue Site (suivi de l’eau) et sites vitrines WebGL.'] },
  },
  {
    from: '2024-01', to: '2024-07', org: 'Bouygues Construction IT', icon: 'informatica',
    en: { role: 'Data Integration Consultant, Informatica Cloud', sum: 'High-volume data integration on IDMC.', pts: ['Developed high-volume CDI mappings and ETL processing.', 'Modernised legacy XML and PL/SQL flows.', 'Administered IDMC and the Secure Agent: connections and schedules.'] },
    fr: { role: 'Consultant Data Integration, Informatica Cloud', sum: 'Intégration de données à forte volumétrie sur IDMC.', pts: ['Développement de mappings CDI et de traitements ETL à forte volumétrie.', 'Modernisation de flux XML et PL/SQL historiques.', 'Administration d’IDMC et du Secure Agent : connexions et planifications.'] },
  },
  {
    from: '2022-01', to: '2024-07', org: 'Bouygues Construction IT', icon: 'mulesoft',
    en: { role: 'MuleSoft Integration Consultant', sum: 'API-led development and a major runtime migration.', pts: ['Led the Mule 3 → Mule 4 migration of ~40 critical HR interfaces deployed in 80+ countries, sole owner of the final 4 months.', 'Kept service running throughout with proxy APIs and progressive cut-over.', 'Designed contract-first APIs in RAML (e.g. Salesforce System API, ESRI Experience API).'] },
    fr: { role: 'Consultant Intégration MuleSoft', sum: 'Développement API-led et migration majeure de runtime.', pts: ['Pilotage de la migration Mule 3 → Mule 4 d’environ 40 interfaces RH critiques déployées dans plus de 80 pays, avec prise en charge exclusive des 4 derniers mois.', 'Continuité de service assurée par des API proxy et une bascule progressive.', 'Conception d’API contrat d’abord en RAML (ex. API système Salesforce, API d’expérience ESRI).'] },
  },
];

export const EDUCATION = [
  { years: '2020 – 2022', en: ['MSc, Information Systems Security', 'ENSA Kénitra'], fr: ['Master en sécurité des systèmes d’information', 'ENSA Kénitra'] },
  { years: '2019 – 2020', en: ['BSc, Information Systems Engineering', 'ENSA Kénitra'], fr: ['Licence en ingénierie des systèmes d’information', 'ENSA Kénitra'] },
];

export const LANGUAGES = {
  en: [['English', 'C2'], ['French', 'C2 written · C1 spoken'], ['Arabic', 'Native']],
  fr: [['Anglais', 'C2'], ['Français', 'C2 à l’écrit · C1 à l’oral'], ['Arabe', 'Langue maternelle']],
};
