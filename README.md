# Abdelkader El Azzouzi · Portfolio

Interactive portfolio: integration architecture (MuleSoft & Informatica IDMC), agentic AI on enterprise data, and AI-enhanced full-stack apps.

**Live:** https://abk541.github.io/portfolio/

## What's inside

- **Hero**: a rotating 3D globe of systems; edges are integrations, packets are messages. Move to bend the traffic, click to fire a burst.
- **Runtime chooser**: pick MuleSoft or Informatica; a portal transition re-themes the whole site.
  - *MuleSoft*: the API-led landscape (back-ends → System APIs → Process APIs by domain → Flex Gateway → consumers) with live traffic, per-domain tracing, and a Mule 3 → 4 cut-over simulator.
  - *Informatica*: the Business 360 MDM flow (sources → CDI / real time → golden record → events / egress / CAI → consumers) and a live match & merge demo.
- **AI architecture**: an animated sequence diagram + server log of an MCP-grounded question (fast path vs. LLM path).
- **Projects**: 17 apps, filterable, each with its own generative visual.
- **Timeline** and **contact**.

## Stack

Hand-written HTML, CSS and ES modules. Canvas 2D and SVG for every visual, GSAP + ScrollTrigger for choreography. No build step: the repository root is the site.

```bash
python3 -m http.server 8000   # http://localhost:8000
```

Respects `prefers-reduced-motion`. Brand icons from [Simple Icons](https://simpleicons.org) (CC0).
