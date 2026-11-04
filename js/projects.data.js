// Project content, English and French.
export const PROJECTS = [
  {
    "id": "mdm-beam",
    "year": "2026",
    "cats": [
      "ai",
      "mule"
    ],
    "featured": true,
    "link": null,
    "icons": [
      "claude",
      "mulesoft",
      "nodedotjs",
      "express"
    ],
    "stack": [
      "Node.js",
      "Express",
      "Anypoint MCP",
      "Microsoft Foundry",
      "Claude",
      "Entra ID"
    ],
    "en": {
      "title": "MDM Beam",
      "kicker": "Secure company-data chatbot",
      "summary": "A chat assistant that answers questions about enterprise reference data by calling live MCP tools exposed through Anypoint. Claude (via Microsoft Foundry) picks the tool; the server does the rest.",
      "points": [
        "Server-side Entra token cache + MCP tools/list discovery at boot: no cold start",
        "Hybrid fast path: deterministic answers for count / find / list without an LLM round-trip",
        "Paginated search fetched concurrently (6 in flight) with a sequential gap-closing pass",
        "Tool catalogue cached 5 min, served stale-while-revalidate; parallel tool calls per turn",
        "The browser never sees the client secret, Foundry key or MCP token"
      ]
    },
    "fr": {
      "title": "MDM Beam",
      "kicker": "Chatbot sécurisé sur les données de l’entreprise",
      "summary": "Un assistant conversationnel qui répond aux questions sur les données de référence en appelant en direct des outils MCP exposés via Anypoint. Claude (via Microsoft Foundry) choisit l’outil, le serveur fait le reste.",
      "points": [
        "Cache du jeton Entra côté serveur et découverte MCP tools/list au démarrage : aucun démarrage à froid",
        "Voie rapide hybride : réponses déterministes pour compter, trouver, lister, sans appel au modèle",
        "Recherche paginée en parallèle (6 requêtes simultanées) avec une passe de rattrapage",
        "Catalogue d’outils en cache 5 min, rafraîchi en arrière-plan ; appels d’outils parallèles",
        "Le navigateur ne voit jamais le secret client, la clé Foundry ni le jeton MCP"
      ]
    }
  },
  {
    "id": "mcp-bridge-poc",
    "year": "2025",
    "cats": [
      "ai",
      "mule",
      "infa"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "mulesoft",
      "informatica",
      "openai"
    ],
    "stack": [
      "MuleSoft",
      "Informatica MDM",
      "Azure OpenAI",
      "MCP",
      "Flex Gateway"
    ],
    "en": {
      "title": "MCP Bridge PoC",
      "kicker": "AI-driven MDM on MuleSoft × Azure OpenAI",
      "summary": "Proof of concept that exposed Informatica MDM operations as tools for AI agents (Azure OpenAI), through MuleSoft and Flex Gateway. It became the blueprint for 30 production MCP servers.",
      "points": [
        "MDM search / read / upsert surfaced as agent tools",
        "Governed through Flex Gateway policies",
        "Led to 30 MCP servers in production"
      ]
    },
    "fr": {
      "title": "MCP Bridge PoC",
      "kicker": "MDM piloté par l’IA, MuleSoft × Azure OpenAI",
      "summary": "Preuve de concept exposant les opérations du MDM Informatica comme outils pour des agents IA (Azure OpenAI), via MuleSoft et Flex Gateway. Devenue le modèle de 30 serveurs MCP en production.",
      "points": [
        "Recherche, lecture et mise à jour du MDM exposées comme outils d’agent",
        "Gouvernance par les policies Flex Gateway",
        "A donné naissance à 30 serveurs MCP en production"
      ]
    }
  },
  {
    "id": "b360-mdm",
    "year": "2024 →",
    "cats": [
      "infa",
      "data"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "informatica",
      "snowflake",
      "sap"
    ],
    "stack": [
      "IDMC",
      "Business 360",
      "CDI",
      "CAI",
      "Reference 360",
      "Snowflake"
    ],
    "en": {
      "title": "Group MDM on Business 360",
      "kicker": "Reference-data platform, built & run",
      "summary": "The group-wide golden record for employees, projects and organisation: 3 domains, ~20 business entities, 14 sources, published by events to MuleSoft and by egress to Snowflake.",
      "points": [
        "~150 CDI mappings, 110 taskflows, 140 B360 jobs",
        "21 match & merge jobs with source-trust survivorship",
        "~30 business events every 5–15 min; Snowflake exports per entity",
        "Make-or-buy study vs Semarchy and an open-source option, AtroCore PoC"
      ]
    },
    "fr": {
      "title": "MDM groupe sur Business 360",
      "kicker": "Plateforme de données de référence, construite et exploitée",
      "summary": "Le golden record du groupe pour les collaborateurs, les projets et l’organisation : 3 domaines, une vingtaine de business entities, 14 sources, diffusé par événements vers MuleSoft et par egress vers Snowflake.",
      "points": [
        "~150 mappings CDI, 110 taskflows, 140 jobs B360",
        "21 jobs de match and merge avec survivance par source",
        "~30 business events toutes les 5 à 15 min ; exports Snowflake par entité",
        "Étude make or buy face à Semarchy et une solution open source, PoC AtroCore"
      ]
    }
  },
  {
    "id": "mule-platform",
    "year": "2022 →",
    "cats": [
      "mule"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "mulesoft",
      "salesforce",
      "sap",
      "splunk"
    ],
    "stack": [
      "Mule 4",
      "DataWeave",
      "Flex Gateway",
      "CloudHub 2.0",
      "RTF",
      "Splunk"
    ],
    "en": {
      "title": "Enterprise integration platform",
      "kicker": "120+ APIs across 9 domains",
      "summary": "The integration backbone connecting SAP, Salesforce, Informatica MDM, HR, payroll and job-site tools in 80+ countries, with the golden book and templates every API starts from.",
      "points": [
        "Design-first RAML / OAS, MUnit, API Manager policies",
        "Global error handler, logging connector and project templates",
        "25+ Flex Gateway proxies with a custom API-key policy",
        "Production on CloudHub 1.0 / 2.0, Runtime Fabric and on-prem"
      ]
    },
    "fr": {
      "title": "Plateforme d’intégration groupe",
      "kicker": "120+ API sur 9 domaines",
      "summary": "Le socle d’intégration reliant SAP, Salesforce, le MDM Informatica, les RH, la paie et les outils chantier dans plus de 80 pays, avec le golden book et les templates dont part chaque API.",
      "points": [
        "Design-first RAML / OAS, MUnit, policies API Manager",
        "Gestionnaire d’erreurs global, connecteur de logging et templates de projet",
        "25+ proxys Flex Gateway avec une policy de clé d’API sur mesure",
        "Production sur CloudHub 1.0 / 2.0, Runtime Fabric et on-premise"
      ]
    }
  },
  {
    "id": "idmc-tooling",
    "year": "2025",
    "cats": [
      "infa",
      "web"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "nodedotjs",
      "informatica"
    ],
    "stack": [
      "Node.js",
      "PowerShell",
      "Playwright",
      "IDMC REST API"
    ],
    "en": {
      "title": "IDMC release tooling",
      "kicker": "Deployments without surprises",
      "summary": "Scripts that patch and verify IDMC export packages between DEV, PREPROD and PROD: connection and agent remapping, checksums, backups and a change log, so promotions are repeatable and reversible.",
      "points": [
        "Package patching & validation in Node.js and PowerShell",
        "Connection / Secure Agent remapping per environment",
        "Backups, checksums and rollback path",
        "Playwright for UI checks the API does not cover"
      ]
    },
    "fr": {
      "title": "Outillage de livraison IDMC",
      "kicker": "Des déploiements sans surprise",
      "summary": "Scripts qui patchent et vérifient les packages d’export IDMC entre DEV, PREPROD et PROD : remappage des connexions et des agents, checksums, sauvegardes et journal, pour des promotions reproductibles et réversibles.",
      "points": [
        "Patch et validation des packages en Node.js et PowerShell",
        "Remappage des connexions et Secure Agents par environnement",
        "Sauvegardes, checksums et retour arrière",
        "Playwright pour les contrôles UI que l’API ne couvre pas"
      ]
    }
  },
  {
    "id": "mule-architect",
    "year": "2026",
    "cats": [
      "ai",
      "mule"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "openai",
      "mulesoft"
    ],
    "stack": [
      "Prompt engineering",
      "API-led",
      "Azure AD"
    ],
    "en": {
      "title": "Mule Design GPT",
      "kicker": "An AI assistant for Mule solution design, prompt-engineered",
      "summary": "A specialised assistant that writes detailed API-led technical and functional specifications, constrained by the team's own standards: Flow / Process / System API split, reuse-first, Azure AD everywhere, private SAPIs.",
      "points": [
        "Encodes the house reference architecture as rules",
        "Explicit, traceable assumptions when inputs are missing",
        "Outputs ready-to-review specs in French"
      ]
    },
    "fr": {
      "title": "Mule Design GPT",
      "kicker": "Un assistant IA de conception Mule, guidé par prompt",
      "summary": "Un assistant spécialisé qui rédige des spécifications techniques et fonctionnelles API-led détaillées, dans le respect des standards de l’équipe : découpage Flow / Process / System API, réutilisation d’abord, Azure AD partout, SAPI privées.",
      "points": [
        "Encode l’architecture de référence maison sous forme de règles",
        "Hypothèses explicites et traçables quand une information manque",
        "Produit des spécifications en français prêtes à relire"
      ]
    }
  },
  {
    "id": "hev-dash",
    "year": "2026",
    "cats": [
      "mobile"
    ],
    "featured": true,
    "link": null,
    "icons": [
      "kotlin",
      "androidauto",
      "android"
    ],
    "stack": [
      "Kotlin",
      "Android Auto",
      "Car App Library",
      "Gradle",
      "GitHub Actions"
    ],
    "en": {
      "title": "HEV Dash",
      "kicker": "Custom Android Auto dashboard",
      "summary": "A glowing digital cluster for a 2022 Elantra Hybrid, rendered on the Android Auto surface. Registers as a navigation app to draw freely while Spotify, Maps and Waze keep working.",
      "points": [
        "Speed, fuel/battery, range, odometer from car data, with GPS fallback",
        "One renderer shared by car screen and phone live preview",
        "Themes, glow strength, carbon / OLED backgrounds, demo mode",
        "CI builds a signed APK release on every push"
      ]
    },
    "fr": {
      "title": "HEV Dash",
      "kicker": "Tableau de bord Android Auto sur mesure",
      "summary": "Un compteur numérique lumineux pour une Elantra Hybrid 2022, affiché sur l’écran Android Auto. Déclaré comme application de navigation pour dessiner librement, pendant que Spotify, Maps et Waze continuent de fonctionner.",
      "points": [
        "Vitesse, carburant/batterie, autonomie, kilométrage depuis la voiture, avec repli GPS",
        "Un seul moteur de rendu pour l’écran de la voiture et l’aperçu sur le téléphone",
        "Thèmes, intensité du halo, fonds carbone / OLED, mode démo",
        "La CI publie un APK signé à chaque push"
      ]
    }
  },
  {
    "id": "ce-crm",
    "year": "2026",
    "cats": [
      "web"
    ],
    "featured": true,
    "link": null,
    "icons": [
      "react",
      "typescript",
      "postgresql",
      "supabase"
    ],
    "stack": [
      "React",
      "TypeScript",
      "Zustand",
      "Node.js",
      "PostgreSQL",
      "Supabase",
      "Vitest"
    ],
    "en": {
      "title": "CE Sol CRM / ERP",
      "kicker": "Operations platform for a federal contractor",
      "summary": "Full-stack CRM/ERP covering the whole federal-contracting lifecycle: BD tracker, pipeline, proposals, contracts, past performances, subcontractor database, HR, certifications and finance projections.",
      "points": [
        "15+ business modules with role-based admin",
        "Node/TypeScript API with SQL migrations and a native Postgres cut-over plan",
        "PDF generation and QR codes, notifications, dashboards with Recharts"
      ]
    },
    "fr": {
      "title": "CE Sol CRM / ERP",
      "kicker": "Plateforme d’opérations pour un prestataire fédéral",
      "summary": "CRM/ERP full-stack couvrant tout le cycle des marchés publics fédéraux : suivi commercial, pipeline, propositions, contrats, références, base de sous-traitants, RH, certifications et projections financières.",
      "points": [
        "Plus de 15 modules métier avec administration par rôles",
        "API Node/TypeScript avec migrations SQL et plan de bascule vers Postgres natif",
        "Génération de PDF et QR codes, notifications, tableaux de bord Recharts"
      ]
    }
  },
  {
    "id": "docfdar",
    "year": "2026",
    "cats": [
      "web"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "react",
      "supabase",
      "firebase",
      "tailwindcss"
    ],
    "stack": [
      "React",
      "TypeScript",
      "Supabase",
      "Firebase",
      "Tailwind"
    ],
    "en": {
      "title": "DocFdar",
      "kicker": "On-demand home doctor visits",
      "summary": "Lets people in Rabat, Salé and Témara request a home medical visit by phone or WhatsApp, with coverage, availability, timing and fees confirmed per request.",
      "points": [
        "Pre-rendered static head per route for SEO, generated sitemap & robots",
        "Supabase backend with Edge Functions, secrets kept server-side",
        "Firebase hosting, tested before every deploy"
      ]
    },
    "fr": {
      "title": "DocFdar",
      "kicker": "Visites médicales à domicile à la demande",
      "summary": "Permet aux habitants de Rabat, Salé et Témara de demander une visite médicale à domicile par téléphone ou WhatsApp, avec couverture, disponibilité, délai et tarif confirmés pour chaque demande.",
      "points": [
        "En-tête statique pré-rendu par route pour le SEO, sitemap et robots générés",
        "Backend Supabase avec Edge Functions, secrets gardés côté serveur",
        "Hébergement Firebase, testé avant chaque déploiement"
      ]
    }
  },
  {
    "id": "blue-site",
    "year": "2026",
    "cats": [
      "web",
      "data"
    ],
    "featured": false,
    "link": "https://github.com/abk541/blue-site",
    "icons": [
      "react",
      "vite"
    ],
    "stack": [
      "React",
      "Framer Motion",
      "Recharts",
      "Vite",
      "Vitest"
    ],
    "en": {
      "title": "Blue Site",
      "kicker": "Water intelligence for construction sites",
      "summary": "Estimates, monitors and optimises job-site water consumption: a calculator plus an IoT dashboard with thresholds, filters, PowerRank, alerts and sensor drill-downs.",
      "points": [
        "Fully client-side calculation engine covered by Vitest",
        "Print / PDF report that follows the active filters",
        "Mock IoT telemetry with live charts"
      ]
    },
    "fr": {
      "title": "Blue Site",
      "kicker": "Pilotage de l’eau sur les chantiers",
      "summary": "Estime, suit et optimise la consommation d’eau des chantiers : un calculateur et un tableau de bord IoT avec seuils, filtres, PowerRank, alertes et détail par capteur.",
      "points": [
        "Moteur de calcul entièrement côté client, couvert par Vitest",
        "Rapport imprimable / PDF qui suit les filtres actifs",
        "Télémesure IoT simulée avec graphiques en direct"
      ]
    }
  },
  {
    "id": "cutanea",
    "year": "2026",
    "cats": [
      "web"
    ],
    "featured": true,
    "link": "https://abk541.github.io/cutanea/",
    "icons": [
      "nextdotjs",
      "typescript",
      "threedotjs"
    ],
    "stack": [
      "Next.js 15",
      "TypeScript",
      "GSAP",
      "Framer Motion",
      "WebGL"
    ],
    "en": {
      "title": "Cutanéa",
      "kicker": "Skincare lab showcase, WebGL",
      "summary": "A showcase site for a skincare lab with a reactive WebGL liquid background, a curtain-and-counter intro, scroll choreography and product storytelling.",
      "points": [
        "WebGL liquid shader reacting to the cursor",
        "GSAP ScrollTrigger + Lenis smooth scroll",
        "Static export deployed on GitHub Pages"
      ]
    },
    "fr": {
      "title": "Cutanéa",
      "kicker": "Site vitrine d’un laboratoire de soins, WebGL",
      "summary": "Le site vitrine d’un laboratoire de soins de la peau : fond liquide WebGL réactif, intro rideau et compteur, chorégraphie au scroll et mise en scène des produits.",
      "points": [
        "Shader liquide WebGL qui réagit au curseur",
        "GSAP ScrollTrigger + défilement fluide Lenis",
        "Export statique déployé sur GitHub Pages"
      ]
    }
  },
  {
    "id": "ce-site",
    "year": "2026",
    "cats": [
      "web"
    ],
    "featured": false,
    "link": "https://github.com/abk541/ce-solution-plus-redesign",
    "icons": [
      "nextdotjs",
      "threedotjs"
    ],
    "stack": [
      "Next.js",
      "three.js",
      "GSAP",
      "Lenis",
      "Lighthouse CI"
    ],
    "en": {
      "title": "CE Solution Plus",
      "kicker": "Federal contractor website, two iterations",
      "summary": "A Next.js + three.js marketing site, then a framework-free redesign: WebGL starfield, kinetic type, CSS-mask logo, Lighthouse-gated CI with accessibility ≥ 95.",
      "points": [
        "Content visible without JS; motion is progressive enhancement",
        "Only transform / opacity / clip-path animated, no perpetual loops",
        "Full reduced-motion path"
      ]
    },
    "fr": {
      "title": "CE Solution Plus",
      "kicker": "Site d’un prestataire fédéral, en deux versions",
      "summary": "Un site Next.js + three.js, puis une refonte sans framework : champ d’étoiles WebGL, typographie animée, logo en masque CSS, CI contrôlée par Lighthouse avec une accessibilité ≥ 95.",
      "points": [
        "Contenu visible sans JavaScript ; l’animation est un plus",
        "Seuls transform, opacity et clip-path sont animés, aucune boucle infinie",
        "Parcours complet en mouvement réduit"
      ]
    }
  },
  {
    "id": "gastroboard",
    "year": "2026",
    "cats": [
      "data",
      "web"
    ],
    "featured": false,
    "link": "https://github.com/abk541/Route66",
    "icons": [],
    "stack": [
      "JavaScript",
      "Canvas / SVG",
      "CSV"
    ],
    "en": {
      "title": "Restaurant Performance Studio",
      "kicker": "Analytics dashboard from raw CSV",
      "summary": "A zero-install analytics studio built from a restaurant CSV export: product, category, team, heatmap and trend views, with a live CSV / mock-data toggle for client demos.",
      "points": [
        "Search, sort, date filters and quick chips",
        "Heatmaps and trends computed in the browser",
        "Static, Pages-ready"
      ]
    },
    "fr": {
      "title": "Studio de performance restaurant",
      "kicker": "Tableau de bord analytique à partir d’un CSV brut",
      "summary": "Un studio d’analyse sans installation construit à partir d’un export CSV de restaurant : vues produits, catégories, équipe, heatmap et tendances, avec bascule CSV / données de démo pour les présentations client.",
      "points": [
        "Recherche, tri, filtres de dates et raccourcis",
        "Heatmaps et tendances calculées dans le navigateur",
        "Statique, prêt pour GitHub Pages"
      ]
    }
  },
  {
    "id": "adaptive-tutor",
    "year": "2026",
    "cats": [
      "ai",
      "web"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "react",
      "typescript"
    ],
    "stack": [
      "React",
      "TypeScript",
      "shadcn/ui",
      "Playwright"
    ],
    "en": {
      "title": "Adaptive Tutor",
      "kicker": "AI math tutor for every child",
      "summary": "Product site and interactive demo for an adaptive math tutor that adjusts difficulty to each child, with a parent dashboard and progress tracking.",
      "points": [
        "Interactive demo and dashboard sections",
        "Playwright + Vitest tested"
      ]
    },
    "fr": {
      "title": "Adaptive Tutor",
      "kicker": "Un tuteur de maths IA pour chaque enfant",
      "summary": "Site produit et démo interactive d’un tuteur de mathématiques adaptatif qui ajuste la difficulté à chaque enfant, avec tableau de bord parent et suivi des progrès.",
      "points": [
        "Sections démo et tableau de bord interactives",
        "Testé avec Playwright et Vitest"
      ]
    }
  },
  {
    "id": "aqp-apis",
    "year": "2023",
    "cats": [
      "mule"
    ],
    "featured": false,
    "link": null,
    "icons": [
      "mulesoft",
      "salesforce"
    ],
    "stack": [
      "Mule 4",
      "RAML",
      "DataWeave",
      "Salesforce",
      "ESRI"
    ],
    "en": {
      "title": "Salesforce SAPI & ESRI XAPI",
      "kicker": "Early API-led builds",
      "summary": "A Salesforce System API and a GIS (ESRI) Experience API, designed contract-first in RAML and published to Anypoint Exchange.",
      "points": [
        "RAML data types, examples and Exchange modules",
        "Implementation split into config / common / implementation flows"
      ]
    },
    "fr": {
      "title": "Salesforce SAPI & ESRI XAPI",
      "kicker": "Premières API API-led",
      "summary": "Une API système Salesforce et une API d’expérience SIG (ESRI), conçues contrat d’abord en RAML et publiées sur Anypoint Exchange.",
      "points": [
        "Types de données RAML, exemples et modules Exchange",
        "Implémentation découpée en flux config / common / implementation"
      ]
    }
  },
  {
    "id": "flowise",
    "year": "2023",
    "cats": [
      "ai",
      "archive"
    ],
    "featured": false,
    "link": "https://github.com/abk541/Flowise",
    "icons": [
      "nodedotjs",
      "openai"
    ],
    "stack": [
      "Node.js",
      "LangChain",
      "LLMs"
    ],
    "en": {
      "title": "Flowise experiments",
      "kicker": "Visual LLM flows, before it was cool",
      "summary": "Forked and hacked on Flowise to wire LLM chains and agents visually: my first steps into what later became MCP servers and agent tooling.",
      "points": [
        "Drag-and-drop LLM chains",
        "Early agent / tool experiments"
      ]
    },
    "fr": {
      "title": "Expériences Flowise",
      "kicker": "Des flux LLM visuels, avant que ce soit à la mode",
      "summary": "Fork et bidouille de Flowise pour assembler visuellement des chaînes LLM et des agents : mes premiers pas vers ce qui deviendra les serveurs MCP et l’outillage d’agents.",
      "points": [
        "Chaînes LLM en glisser-déposer",
        "Premières expériences d’agents et d’outils"
      ]
    }
  },
  {
    "id": "tft",
    "year": "Way back",
    "cats": [
      "ai",
      "archive"
    ],
    "featured": false,
    "link": null,
    "icons": [],
    "stack": [
      "Side project",
      "Gaming"
    ],
    "en": {
      "title": "TFT Assistant",
      "kicker": "Where the itch started",
      "summary": "A companion for Teamfight Tactics that helped decide what to build next: one of the first apps I made for fun, long before integration was my job.",
      "points": [
        "Reading game state and suggesting the next move",
        "Proof that I automate everything I touch"
      ]
    },
    "fr": {
      "title": "TFT Assistant",
      "kicker": "Là où tout a commencé",
      "summary": "Un compagnon pour Teamfight Tactics qui aidait à décider quoi construire ensuite : l’une des premières applications que j’ai faites pour le plaisir, bien avant que l’intégration devienne mon métier.",
      "points": [
        "Lecture de l’état du jeu et suggestion du prochain coup",
        "La preuve que j’automatise tout ce que je touche"
      ],
      "year": "Il y a longtemps"
    }
  }
];
