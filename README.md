# 🔒 CASSA — Polizeilicher Knowledge Graph

**Computer-Aided Structured Security Analysis** — Interaktive 3D-Visualisierung eines polizeilichen Wissensgrafen am Beispiel der **Operation Hydra** (Zerschlagung des weltweit größten Darknet-Marktplatzes).

> **[▶ Live-App öffnen](https://ma3u.github.io/cassa/)**

![Entitäten](https://img.shields.io/badge/Entitäten-88-blue) ![Beziehungen](https://img.shields.io/badge/Beziehungen-113-green) ![STIX 2.1](https://img.shields.io/badge/STIX-2.1-orange) ![XPolizei](https://img.shields.io/badge/XPolizei-2.0-red)

---

## Was ist CASSA?

CASSA demonstriert, wie ein **Knowledge Graph** komplexe, grenzüberschreitende Ermittlungsfälle strukturiert darstellen kann. Das Projekt zeigt die **Multi-Layered Ontologie-Architektur** mit vier Schichten:

| Schicht | Name | Beschreibung |
|---------|------|-------------|
| 1 | **Normative Schicht** | Hierarchie der Rechtsquellen — EU-Recht, Grundgesetz, StPO, Landespolizeigesetze |
| 2 | **Zeitliche Dimension** | Versionierung und Gültigkeitsprüfung von Gesetzesfassungen, Fristen, Verjährung |
| 3 | **Prozedurale Zustandsmaschine** | Ermittlungsverfahren als formale Prozesse mit Zuständen und Übergängen |
| 4 | **Fallbezogener Overlay** | Konkrete Fakten: Personen, Beweismittel, Transaktionen, Kommunikationsdaten |

## Features

- **Interaktiver 3D-Knowledge-Graph** — 88 Entitäten, 113 Beziehungen, 18 Knotentypen mit Force-Directed Layout
- **Detailpanel** — Klick auf jeden Knoten zeigt Ermittlungsdetails, Verbindungsstatistik, Quellen
- **Relationen-Labels** — Beziehungstypen direkt auf den Kanten sichtbar
- **Polizei-Briefing** — ElevenLabs-generierte Sprachausgabe (deutsche Männerstimme „Lucius")
- **Standards-Sektion** — STIX 2.1, ISO 27037/27042, NIST 800-86, DSGVO, NIS2, XPolizei 2.0
- **Best Practices** — Chain of Custody, Blockchain-Forensik, strukturierte Ermittlungsführung
- **Grenzüberschreitende Kooperation** — Europol, JCODE, Eurojust, MLATs, Interpol
- **Responsive Design** — Dark Mode, optimiert für Desktop und Tablet

---

## Tech Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 19 | UI-Framework |
| TypeScript | 5.7 | Typsicherheit |
| Vite | 7 | Build-Tool (SWC) |
| Tailwind CSS | 4 | Styling (oklch Farbsystem) |
| shadcn/ui | — | UI-Komponentenbibliothek (Radix UI) |
| react-force-graph-3d | 1.29 | 3D-Graph-Visualisierung |
| three.js | 0.175 | WebGL-Rendering |
| framer-motion | 12.6 | Animationen |
| ElevenLabs API | v1 | Text-to-Speech (Buildzeit) |

---

## Schnellstart

```bash
# Repository klonen
git clone https://github.com/ma3u/cassa.git
cd cassa

# Dependencies installieren
npm ci

# Entwicklungsserver starten (Port 5000)
npm run dev

# Produktions-Build erstellen
npm run build

# Linting
npm run lint
```

> **Voraussetzung:** Node.js 22+

---

## Projektstruktur

```
├── src/
│   ├── App.tsx                          # Haupt-SPA (~1271 Zeilen) — alle Sektionen + Narration
│   ├── components/
│   │   ├── PoliceKnowledgeGraph3D.tsx   # 3D-Knowledge-Graph (~1050 Zeilen)
│   │   └── ui/                          # 45 shadcn/ui-Komponenten
│   ├── hooks/use-mobile.ts              # useIsMobile() Hook
│   ├── lib/utils.ts                     # cn() Hilfsfunktion (clsx + tailwind-merge)
│   ├── styles/theme.css                 # Radix-Farbskalen, Spark-Theme-Variablen
│   ├── main.css                         # Tailwind v4 Entry, Design-Tokens
│   └── index.css                        # oklch-Farben, Hero-Pattern, Network-Pattern
├── input/                               # Quelldaten für den Graphen
│   ├── hydra_graph_data (1).json        # Angereicherte Daten (88 Knoten, 113 Relationen)
│   ├── hydra_graph_data.json            # Originaldaten
│   ├── hydra_neo4j_import*.cypher       # Neo4j-Import-Skripte
│   ├── hydra_nodes*.csv                 # Knoten-CSVs
│   └── hydra_relationships*.csv         # Relationen-CSVs
├── public/audio/
│   └── hydra_briefing.mp3              # ElevenLabs-Narration (Lucius-Stimme, deutsch)
├── scripts/                            # Python-Hilfsskripte
│   ├── find_voices.py                  # ElevenLabs-Stimmensuche
│   ├── generate_narration.py           # Audio-Generierung (Lucius, eleven_multilingual_v2)
│   ├── generate_hydra_voice.py         # Erweiterte TTS-Generierung
│   └── generate_graph_code.py          # JSON → TypeScript buildCaseData()-Konvertierung
├── .github/
│   ├── copilot-instructions.md         # Projekt-Richtlinien für GitHub Copilot
│   ├── dependabot.yml                  # Dependabot-Konfiguration
│   └── workflows/deploy.yml           # GitHub Pages Deployment (Node 22)
├── check-console.mjs                  # Playwright: Konsolen-Fehler-Logger
├── test-graph.mjs                     # Playwright: Headless-Screenshot + Pixelanalyse
├── vite.config.ts                     # Vite: base '/cassa/', Plugins, Path-Alias
└── tsconfig.json                      # TypeScript: ES2020, strictNullChecks, bundler
```

---

## Wichtige Dateien und Funktionen

### `src/App.tsx` — Haupt-Applikation

Die Single-Page-App enthält alle scroll-basierten Sektionen:

| Sektion | Beschreibung |
|---------|-------------|
| **Hero** | Landing mit animiertem Hintergrund und Intro-Guide |
| **Architektur** | 4-Schichten-Ontologie-Modell (interaktiv auswählbar) |
| **Features** | 6 Feature-Cards mit Animationen |
| **Knowledge Graph** | Eingebettete `PoliceKnowledgeGraph3D`-Komponente |
| **Praxisszenarien** | 4 Ermittlungsszenarien als Tabs |
| **Standards & Compliance** | 15 Standards in 3 Kategorien (International, EU, National) |
| **Best Practices** | 4 Kategorien mit 20 Ermittlungs-Best-Practices |
| **Grenzüberschreitende Kooperation** | 3 Säulen + Lessons Learned |
| **CTA** | Call-to-Action und Kontakt |

**Schlüsselfunktionen:**
- `toggleNarration()` — Startet/stoppt die ElevenLabs-Audio-Narration
- `scrollToSection(id)` — Smooth-Scroll zur jeweiligen Sektion
- State: `selectedLayer`, `activeScenario`, `showIntroGuide`, `isPlayingNarration`

### `src/components/PoliceKnowledgeGraph3D.tsx` — 3D-Knowledge-Graph

Die Kernkomponente des Projekts mit self-contained Daten und Rendering:

**18 Knotentypen:**
```
suspect · victim · witness · case · evidence · location · communication
law · organization · account · vehicle · weapon · drug · digital
regulation · process · sop · anzeige
```

**Schlüsselfunktionen:**
- `buildCaseData()` — Erzeugt alle 88 Knoten und 113 Relationen mit deutschen Ermittlungsdetails
- `nodeThreeObject()` — Custom 3D-Rendering jedes Knotens (Sphäre + Label)
- `linkThreeObject()` — Relationstyp-Labels auf allen Kanten
- `onNodeClick()` / `onNodeHover()` — Interaktion: Selektion und Highlighting
- `navigateToNode()` — Kamera-Animation zu einem Knoten
- `renderGroup()` — Kategorisierte Beziehungsdarstellung im Detailpanel

**Datenstruktur:**
```typescript
interface GraphNode {
  id: string; label: string; type: NodeType; description: string
  details?: Record<string, string>  // z.B. { 'Nationalität': 'Russisch', 'Urteil': 'Lebenslänglich' }
  timestamp?: string; score?: number
}
interface GraphLink {
  source: string; target: string; type: string; description?: string
}
```

**Konfigurationsobjekte:**
- `NODE_COLORS` — oklch-Farben pro Knotentyp
- `NODE_LABELS` — Emoji + deutscher Label pro Typ (z.B. `🔴 Verdächtiger`)
- `SOURCE_REGISTRY` — Quellen-URLs pro Knoten-ID

### `input/hydra_graph_data (1).json` — Angereicherte Quelldaten

88 Knoten und 113 Relationen mit:
- `sources[]` — Quellenreferenzen (OFAC, BKA, DOJ, Chainalysis, Elliptic, TRM Labs, Gwern)
- `stix_type` — STIX 2.1 SDO-Mapping (z.B. `threat-actor`, `infrastructure`)
- `xpolizei_type` — XPolizei 2.0 Typ-Mapping
- `applicable_standards[]` — ISO 27037, ISO 27042, NIST 800-86, EO 13694

### `scripts/generate_narration.py` — Audio-Generierung

Generiert das Polizei-Briefing per ElevenLabs REST API:
- **Stimme:** Lucius (deep, male, old, German)
- **Modell:** `eleven_multilingual_v2`
- **Output:** `public/audio/hydra_briefing.mp3`
- **Benötigt:** `ELEVENLABS_API_KEY` in `.env`

### `scripts/generate_graph_code.py` — JSON→TypeScript-Konvertierung

Liest die angereicherte JSON-Datei und generiert TypeScript-Code für `buildCaseData()`.

---

## Datenmodell

### 88 Entitäten (Knoten)

| Typ | Anzahl | Beispiele |
|-----|--------|----------|
| Verdächtige | 10 | Stanislav Moiseyev, Dmitry Pavlov, DarkSide, Conti |
| Organisationen | 13 | BKA, OFAC, FBI, OMG Market, Sinaloa-Kartell |
| Konten/Börsen | 6 | Garantex, SUEX, CHATEX, Bitpapa |
| Prozesse/Events | 13 | Hydra-Gründung, Seizure, OFAC-Sanktionen |
| Gesetze | 3 | Moskauer Regionalgericht, EO 13694 |
| Digitale Assets | 6 | Bitcoin-Mixer, Tor-Netzwerk, Ransomware-as-a-Service |
| Standorte | 14 | Russland, Deutschland, USA, Federation Tower |
| Dienste | 12 | Drogenverkauf, Dead-Drop, Treuhand, Streitbeilegung |
| Fälle | 2 | Hydra Market, AlphaBay |
| Weitere | 9 | Beweismittel, Opfer, Zeugen, Regulierung |

### 113 Beziehungen (Kanten)

Beziehungstypen u.a.: `betrieb`, `ermittelt_gegen`, `sanktionierte`, `nutzt_für_geldwäsche`, `operiert_von`, `beschlagnahmte`, `verurteilte`, `nachfolger_von`

---

## Deployment

Das Projekt wird automatisch über **GitHub Actions** auf **GitHub Pages** deployt:

1. Push auf `main` → `.github/workflows/deploy.yml` triggert
2. `npm ci` → `npm run build` → `dist/` wird deployt
3. Erreichbar unter: **https://ma3u.github.io/cassa/**

---

## Umgebungsvariablen

| Variable | Datei | Zweck |
|----------|-------|-------|
| `ELEVENLABS_API_KEY` | `.env` | ElevenLabs TTS API-Key (nur für `scripts/*.py`) |

> `.env` ist in `.gitignore` — niemals API-Keys committen.

---

## Standards & Normen

Das Projekt integriert folgende Standards für polizeiliche Ermittlungsarbeit:

- **STIX 2.1** (OASIS) — Structured Threat Intelligence eXpression
- **XPolizei 2.0** — Deutscher Polizei-Interoperabilitätsstandard
- **ISO 27037** — Digitale Beweissicherung
- **ISO 27042** — Analyse digitaler Beweismittel
- **NIST SP 800-86** — Forensische Techniken
- **EO 13694** — US-Sanktionsgrundlage für Cyber-Aktivitäten
- **DSGVO** — Datenschutz-Grundverordnung
- **NIS2** — EU-Cybersicherheitsrichtlinie
- **StPO** — Deutsche Strafprozessordnung

---

## Sicherheit

- Alle Falldaten sind **fiktiv** — Adressen mit `XXX` geschwärzt, Aktenzeichen erfunden
- Sicherheitslücken bitte über `opensource-security@github.com` melden
- DSGVO/NIS2-Referenzen sind rechtlich korrekt
- API-Keys werden nur zur Buildzeit verwendet, nicht zur Laufzeit

## Lizenz

MIT License — siehe [LICENSE](LICENSE)
