# Project Guidelines — CASSA Polizei Knowledge Graph

## Overview
Sopra Steria CASSA landing page with interactive 3D police knowledge graph ("Operation Hydra"). All UI text is **German**. Domain: law enforcement, legal references (StPO, StGB, BtMG, GwG, BSIG, NIS2, DSGVO).

Deployed at: `https://<user>.github.io/cassa/` (base path `/cassa/`)

## Tech Stack
- **React 19** + **TypeScript 5.7** + **Vite 7** (SWC plugin, `@vitejs/plugin-react-swc`)
- **Tailwind CSS v4** (`@tailwindcss/vite`, oklch color space, `@theme inline`)
- **shadcn/ui** ("new-york" style, `@/components/ui/*`) with 14 Radix UI primitives
- **react-force-graph-3d** ^1.29 + **three.js** ^0.175 + **three-spritetext** ^1.10 for 3D graph
- **framer-motion** ^12.6 for animations
- **d3** ^7.9 (force layout engine used by react-force-graph)
- **@github/spark** platform — **never** remove `sparkPlugin()` or `createIconImportProxy()` from `vite.config.ts`
- **react-error-boundary** ^6.0 wrapping `<App />` in `main.tsx`

## Build & Dev
```sh
npm run dev       # Vite dev server (default port 5000)
npm run build     # tsc -b --noCheck && vite build
npm run lint      # eslint .
npm run preview   # Preview production build
npm run kill      # fuser -k 5000/tcp
npm run optimize  # vite optimize (pre-bundle deps)
```

## CI/CD
- **GitHub Actions**: `.github/workflows/deploy.yml` — Node 22, `npm ci` → `npm run build` → deploy `dist/` to GitHub Pages
- **Dependabot**: `.github/dependabot.yml` — npm daily, devcontainers weekly

## Project Structure

```
├── .github/
│   ├── copilot-instructions.md    # This file
│   ├── dependabot.yml
│   └── workflows/deploy.yml      # GitHub Pages deploy
├── input/                         # Graph source data (JSON, CSV, Cypher)
│   ├── hydra_graph_data (1).json  # Enriched: 88 nodes, 113 rels, STIX/XPolizei/standards
│   ├── hydra_graph_data.json      # Original graph data
│   ├── hydra_neo4j_import*.cypher # Neo4j import scripts
│   ├── hydra_nodes*.csv           # Node CSVs (original + enriched)
│   └── hydra_relationships*.csv   # Relationship CSVs (original + enriched)
├── public/audio/                  # Static audio assets
│   ├── hydra_briefing.mp3         # ElevenLabs narration (Lucius voice, current)
│   ├── hydra_erklaerung.mp3       # Legacy narration (unused)
│   └── hydra_narration.mp3        # Legacy narration (unused)
├── scripts/                       # Python helper scripts (see below)
├── src/
│   ├── App.tsx                    # Main SPA (~1271 lines), all scroll sections + narration
│   ├── ErrorFallback.tsx          # Error boundary fallback UI
│   ├── main.tsx                   # createRoot, ErrorBoundary, CSS imports
│   ├── main.css                   # Tailwind v4 entry, @theme inline, design tokens
│   ├── index.css                  # Custom oklch colors, hero-pattern, network-pattern
│   ├── vite-end.d.ts              # Vite + Spark runtime type declarations
│   ├── components/
│   │   ├── PoliceKnowledgeGraph3D.tsx  # 3D force-graph (~1002 lines)
│   │   └── ui/                    # 45 shadcn/ui components (accordion → tooltip)
│   ├── hooks/
│   │   └── use-mobile.ts          # useIsMobile() — breakpoint 768px
│   ├── lib/
│   │   └── utils.ts               # cn() = twMerge(clsx(...))
│   └── styles/
│       └── theme.css              # Radix color scales, Spark theme vars
├── check-console.mjs             # Playwright: console error/warning logger
├── test-graph.mjs                # Playwright: headless screenshot + pixel analysis
├── components.json               # shadcn/ui config
├── runtime.config.json           # Spark app ID
├── spark.meta.json               # Spark metadata
├── tailwind.config.js            # Radix color scale integration, spacing
├── theme.json                    # Empty (theming via CSS)
├── vite.config.ts                # base: '/cassa/', plugins, path alias
└── tsconfig.json                 # ES2020, strictNullChecks, bundler resolution
```

## Scripts & Tools

### Python Scripts (`scripts/`)
All scripts use Python 3 and `urllib` (no external deps unless noted). API key from `.env` (`ELEVENLABS_API_KEY`).

| Script | Purpose | Usage |
|--------|---------|-------|
| `find_voices.py` | Query ElevenLabs API for German voices | `python3 scripts/find_voices.py` |
| `generate_narration.py` | Generate narration MP3 with ElevenLabs "Lucius" voice | `python3 scripts/generate_narration.py` |
| `generate_hydra_voice.py` | Extended TTS generation with `--login` flag | `python3 scripts/generate_hydra_voice.py` |
| `generate_graph_code.py` | Convert enriched JSON → TypeScript `buildCaseData()` code | `python3 scripts/generate_graph_code.py` |

### Playwright Test Scripts (root)
Require `@playwright/test` + Chromium: `npx playwright install chromium`

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-console.mjs` | Launch browser, log console errors/warnings/network failures | `node check-console.mjs` |
| `test-graph.mjs` | Headless screenshot of 3D graph canvas, pixel analysis | `node test-graph.mjs` |

## Architecture

### Single-Page App
- **No router** — one `App.tsx` with scroll-based sections, using `scrollToSection(id)` helper
- **Sections** (in order): Hero → Architecture (4-Layer Ontology) → Features → Knowledge Graph (3D) → Scenarios → Standards & Compliance → Best Practices → Cross-Border Cooperation → CTA
- **Narration**: `HTMLAudioElement` playing `public/audio/hydra_briefing.mp3` (ElevenLabs "Lucius" German male voice)

### State Management
React hooks only (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`) — no external state library.

Key state in `App.tsx`:
- `selectedLayer: number | null` — 4-layer architecture highlighting
- `activeScenario: number` — scenario tab selection
- `showIntroGuide: boolean` — intro overlay
- `isPlayingNarration: boolean` — audio toggle

### Path Alias
`@/*` → `./src/*` (configured in both `vite.config.ts` and `tsconfig.json`)

### CSS Import Order
`main.tsx` imports: `main.css` → `theme.css` → `index.css`

## Code Style
- Functional components with named exports for features, default export for `App`
- Section dividers: `// ────────────` with section labels
- Types at file top: `type NodeType = 'suspect' | 'victim' | ...` union pattern
- Node data uses `Record<string, string>` for flexible `details` and optional `timestamp`, `score` fields
- Icons from `lucide-react` — primary icon library in components
- Also available: `@heroicons/react`, `@phosphor-icons/react` (Spark icon proxy)

## Graph Component Conventions (`PoliceKnowledgeGraph3D.tsx`)

### 18 Node Types
`suspect`, `victim`, `witness`, `case`, `evidence`, `location`, `communication`, `law`, `organization`, `account`, `vehicle`, `weapon`, `drug`, `digital`, `regulation`, `process`, `sop`, `anzeige`

### Data Architecture
- Each type needs entries in `NODE_COLORS` (oklch) and `NODE_LABELS` (emoji + German label)
- `SOURCE_REGISTRY` maps source keys to URLs
- Node data built in `buildCaseData()` → returns `{ nodes: GraphNode[], links: GraphLink[] }`
- **88 nodes** and **113 relationships** in current dataset
- Links: `{ source, target, type, description? }` — source/target are string node IDs
- Detail panel groups relationships by connected node type: law → regulation → process → sop → anzeige → other

### Graph Data Enrichment
Every node in the enriched JSON (`input/hydra_graph_data (1).json`) carries:
- `sources[]` — keys referencing `metadata.sources` (OFAC, TRM, DOJ, ELLIPTIC, etc.)
- `stix_type` — STIX 2.1 SDO mapping (e.g., `threat-actor`, `infrastructure`, `identity`)
- `xpolizei_type` — XPolizei 2.0 type (optional)
- `applicable_standards[]` — ISO 27037, ISO 27042, NIST 800-86, EO 13694, etc.

### German Legal Formats
- Aktenzeichen: `Az. XXXX Js XXXXX/22`
- Asservat-Nr: `ASS-2022-XXXX-XXXX`
- Paragraph references: `§100a StPO`, `§261 StGB`
- Addresses redacted with `XXX` — never use real addresses

## CSS & Theming
- **Tailwind v4** with `@theme inline` in `src/main.css` — all design tokens as CSS custom properties
- **oklch color space** throughout: Deep Navy primary (`oklch(0.25 0.05 250)`), Signal Red accent (`oklch(0.55 0.22 25)`)
- **Dark mode** via `.dark` selector and `@custom-variant dark (&:is(.dark *))`
- **Fonts**: **Space Grotesk** (headings), **Inter** (body) — loaded via Google Fonts in `index.html`
- **Radix color scales**: All scales imported in `src/styles/theme.css` (262 lines)
- **Spark theme vars** in `#spark-app` selector — spacing, radius, neutral/accent mapping but mostly dark/light bg colors
- `tailwind.config.js` (147 lines): extends defaultTheme with Radix CSS variable mappings

## Environment Variables

| Variable | File | Purpose |
|----------|------|---------|
| `ELEVENLABS_API_KEY` | `.env` | ElevenLabs TTS API key (for `scripts/*.py`) |

`.env` is in `.gitignore` — never commit API keys.

## Security
- Report vulnerabilities via `opensource-security@github.com`, not public issues
- All case data is fictional — keep addresses redacted, use fake Aktenzeichen
- DSGVO/NIS2 references must be legally accurate when added
- Never commit `.env` or API keys
- ElevenLabs API key is only used by Python scripts at build time, not at runtime

## Key Dependencies (34 production, 10 dev)

### Core
`react` ^19, `react-dom` ^19, `react-error-boundary` ^6, `framer-motion` ^12.6

### 3D Visualization
`react-force-graph-3d` ^1.29, `three` ^0.175, `three-spritetext` ^1.10, `d3` ^7.9

### UI Components
14 `@radix-ui/react-*` packages, `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `vaul`, `sonner`, `embla-carousel-react`, `react-day-picker`, `react-resizable-panels`, `input-otp`

### Icons
`lucide-react` ^0.484, `@heroicons/react` ^2.2, `@phosphor-icons/react` ^2.1

### Data & Forms
`@tanstack/react-query` ^5.83, `react-hook-form` ^7.54, `@hookform/resolvers` ^4.1, `zod` ^3.25, `recharts` ^2.15

### GitHub/Spark
`@github/spark` >=0.43.1, `octokit` ^4.1, `@octokit/core` ^6.1

### Utilities
`date-fns` ^3.6, `marked` ^15.0, `next-themes` ^0.4, `uuid` ^11.1

### Dev
`vite` ^7.2, `tailwindcss` ^4.1, `typescript` ~5.7, `eslint` ^9.28, `@playwright/test` ^1.58

## TypeScript Configuration
- Target: `ES2020`, Module: `ESNext`, Resolution: `bundler`
- `strictNullChecks: true` (but not full `strict` mode)
- `noEmit: true`, `skipLibCheck: true`, `jsx: react-jsx`
- `isolatedModules: true`, `noFallthroughCasesInSwitch: true`

## Vite Configuration
- **Base**: `/cassa/` (subpath deployment)
- **Plugins**: react-swc, tailwindcss, Spark icon proxy, Spark plugin
- **Alias**: `@` → `src/`
- Known build warnings: CSS `@media` Tailwind v4 artifacts (harmless), bundle >500KB (expected for three.js)
