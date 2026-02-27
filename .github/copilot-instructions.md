# Project Guidelines — CASSA Polizei Knowledge Graph

## Overview
Sopra Steria CASSA landing page with interactive 3D police knowledge graph ("Operation Hydra"). All UI text is **German**. Domain: law enforcement, legal references (StPO, StGB, BtMG, GwG, BSIG, NIS2, DSGVO).

## Tech Stack
- **React 19** + **TypeScript 5.7** + **Vite 7** (SWC plugin)
- **Tailwind CSS v4** (`@tailwindcss/vite`, oklch color space, `@theme inline`)
- **shadcn/ui** ("new-york" style, `@/components/ui/*`) with Radix UI primitives
- **react-force-graph-3d** + **three.js** + **three-spritetext** for 3D graph
- **framer-motion** for animations
- **@github/spark** platform — do not remove `sparkPlugin()` or icon proxy from `vite.config.ts`

## Build & Dev
```sh
npm run dev       # Vite dev server (port 5000)
npm run build     # tsc -b --noCheck && vite build
npm run lint      # eslint .
npm run preview   # Preview production build
```

## Architecture
- **Single-page app** — no router. One `App.tsx` (~762 lines) with scroll-based sections
- **`PoliceKnowledgeGraph3D.tsx`** — main feature component (~950 lines): self-contained data, types, 3D rendering, detail panel
- **State**: React hooks only (`useState`, `useEffect`, `useMemo`, `useCallback`) — no external state library
- **Path alias**: `@/*` → `./src/*`
- **Utility**: `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge)

## Code Style
- Functional components with named exports for features, default export for `App`
- Section dividers: `// ────────────` with section labels
- Types at file top: `type NodeType = 'suspect' | 'victim' | ...` union pattern
- Node data uses `Record<string, string>` for flexible `details` and optional `timestamp`, `score` fields
- Icons from `lucide-react` — no other icon library in components

## Graph Component Conventions
- **18 node types** (see `NodeType`): suspect, victim, witness, case, evidence, location, communication, law, organization, account, vehicle, weapon, drug, digital, regulation, process, sop, anzeige
- Each type needs entries in `NODE_COLORS` and `NODE_LABELS` (emoji + German label)
- Node data built in `buildCaseData()` — returns `{ nodes, links }`
- Links use `{ source, target, type, description? }` — source/target are node IDs
- Detail panel groups relationships by connected node type: law → regulation → process → sop → anzeige → other
- Demo data uses German legal formats: Aktenzeichen, Asservat-Nr, paragraph references (§100a StPO)
- Addresses are redacted with `XXX` — never use real addresses

## CSS & Theming
- Tailwind v4 with `@theme inline` in `src/main.css` — defines all design tokens
- Custom oklch colors in `src/index.css` (Deep Navy primary, Signal Red accent)
- Dark mode via `.dark` selector and `@custom-variant dark`
- Two fonts: **Space Grotesk** (headings), **Inter** (body)
- Radix color scales imported in `src/styles/theme.css`

## Security
- Report vulnerabilities via `opensource-security@github.com`, not public issues
- All case data is fictional — keep addresses redacted, use fake Aktenzeichen
- DSGVO/NIS2 references must be legally accurate when added
