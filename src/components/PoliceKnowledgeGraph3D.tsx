import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
import { X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react'

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────
type NodeType =
  | 'suspect'
  | 'victim'
  | 'witness'
  | 'case'
  | 'evidence'
  | 'location'
  | 'communication'
  | 'law'
  | 'organization'
  | 'account'
  | 'vehicle'
  | 'weapon'
  | 'drug'
  | 'digital'
  | 'regulation'
  | 'process'
  | 'sop'
  | 'anzeige'

interface GraphNode {
  id: string
  label: string
  type: NodeType
  description: string
  details?: Record<string, string>
  timestamp?: string
  score?: number
  x?: number
  y?: number
  z?: number
}

interface GraphLink {
  source: string | { id: string }
  target: string | { id: string }
  type: string
  description?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface SourceReference {
  title: string
  url?: string
  futureSource?: string
}

const SOURCE_REGISTRY: Partial<Record<string, SourceReference[]>> = {
  'law-100a': [{ title: '§100a StPO (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/stpo/__100a.html' }],
  'law-100b': [{ title: '§100b StPO (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/stpo/__100b.html' }],
  'law-261': [{ title: '§261 StGB (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/stgb/__261.html' }],
  'law-303b': [{ title: '§303b StGB (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/stgb/__303b.html' }],
  'law-129': [{ title: '§129 StGB (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/stgb/__129.html' }],
  'law-29a': [{ title: '§29a BtMG (gesetze-im-internet)', url: 'https://www.gesetze-im-internet.de/btmg_1981/__29a.html' }],
  'reg-nis2': [{ title: 'NIS2 (EU 2022/2555)', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' }],
  'reg-dsgvo': [{ title: 'DSGVO (EU 2016/679)', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' }],
  'reg-eudora': [{ title: 'DORA (EU 2022/2554)', url: 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj' }],
  'reg-ecidir': [{ title: 'CER-Richtlinie (EU 2022/2557)', url: 'https://eur-lex.europa.eu/eli/dir/2022/2557/oj' }],
  'reg-bsig': [{ title: 'BSIG (konsolidierter Stand)', futureSource: 'Offizielle BMJ/BfJ-Normseite für BSIG (stabiler Deep-Link)' }],
  'reg-kritisv': [{ title: 'BSI-KritisV (konsolidierter Stand)', futureSource: 'Offizielle BMJ/BfJ-Normseite für BSI-KritisV (stabiler Deep-Link)' }],
  'org-europol': [
    { title: 'Europol Hauptseite', url: 'https://www.europol.europa.eu/' },
    { title: 'SIENA Produktseite', futureSource: 'Direkte, stabile SIENA-Unterseite bei Europol' },
  ],
  'proc-meldepflicht': [{ title: 'BSI Melde- und Vorfallportal', url: 'https://www.bsi.bund.de/DE/IT-Sicherheitsvorfall/it-sicherheitsvorfall_node.html' }],
  'anz-internet-cyber': [{ title: 'Polizei-Onlinewachen Übersicht', futureSource: 'Zentrale, stabile Bund/Länder-Übersicht aller Onlinewachen' }],
  'anz-app-scada': [{ title: 'Polizei-Onlinewachen / Apps', futureSource: 'Offizielle Landespolizei-App-Verzeichnisse + API/OpenData-Schnittstelle' }],
  'reg-xpolizei': [{ title: 'XÖV / XPolizei Standard', futureSource: 'Offizielle XPolizei-Spezifikation inkl. Versionierung und Codelisten' }],
}

// ────────────────────────────────────────────
// Color palette per node type
// ────────────────────────────────────────────
const NODE_COLORS: Record<NodeType, string> = {
  suspect: '#ef4444',
  victim: '#f97316',
  witness: '#eab308',
  case: '#06b6d4',
  evidence: '#a855f7',
  location: '#22c55e',
  communication: '#3b82f6',
  law: '#8b5cf6',
  organization: '#ec4899',
  account: '#14b8a6',
  vehicle: '#64748b',
  weapon: '#dc2626',
  drug: '#d97706',
  digital: '#0ea5e9',
  regulation: '#6366f1',
  process: '#f59e0b',
  sop: '#10b981',
  anzeige: '#f43f5e',
}

const NODE_LABELS: Record<NodeType, string> = {
  suspect: '👤 Verdächtiger',
  victim: '🎯 Opfer',
  witness: '👁 Zeuge',
  case: '📋 Verfahren',
  evidence: '🔍 Beweismittel',
  location: '📍 Ort',
  communication: '💬 Kommunikation',
  law: '⚖️ Rechtsgrundlage',
  organization: '🏢 Organisation',
  account: '💳 Konto/Finanzen',
  vehicle: '🚗 Fahrzeug',
  weapon: '🔫 Waffe',
  drug: '💊 Betäubungsmittel',
  digital: '💻 Digital',
  regulation: '📜 Regulierung/Richtlinie',
  process: '🔄 Prozess',
  sop: '📖 SOP',
  anzeige: '📝 Anzeige',
}

// ────────────────────────────────────────────
// Real case: "Hydra Market" – world's largest darknet marketplace
// Based on: DOJ indictments, OFAC sanctions, BKA press releases,
// Moscow Regional Court sentencing (Dec 2024), public court records
// ────────────────────────────────────────────
function buildCaseData(): GraphData {
  const nodes: GraphNode[] = [
    // ── CENTRAL ENTITY ──
    { id: 'hydra_market', label: 'Hydra Market', type: 'case', description: 'Weltweit größter Darknet-Marktplatz (2015–2022)', details: { 'Gegründet': '2015', 'Abgeschaltet': '05.04.2022', 'Kunden': 'ca. 17 Millionen', 'Verkäufer': 'ca. 19.000', 'Krypto-Volumen': '$5,2 Mrd. (2015–2022)', 'Marktanteil 2021': '~80% aller Darknet-Transaktionen', 'Sprache': 'Russisch', 'Netzwerk': 'Tor (.onion)', 'Hauptsitz-Server': 'Deutschland' } },

    // ── KEY PERSONS ──
    { id: 'moiseyev', label: 'Stanislav Moiseyev', type: 'suspect', description: 'Gründer und Betreiber von Hydra Market', details: { 'Nationalität': 'Russisch', 'Rolle': 'Gründer/Betreiber Hydra Market', 'Urteil': 'Lebenslänglich (02.12.2024)', 'Gericht': 'Moskauer Regionalgericht', 'Geldstrafe': '4 Mio. Rubel', 'Delikte': 'Organisation krim. Vereinigung, Drogenproduktion/-handel' } },
    { id: 'pavlov', label: 'Dmitry O. Pavlov', type: 'suspect', description: 'Server-Administrator über Promservice Ltd.', details: { 'Nationalität': 'Russisch', 'Alter bei Anklage': '30', 'Firma': 'Promservice Ltd. (Novosibirsk)', 'Anklage': '05.04.2022 – U.S. District Court N.D. California', 'Delikte': 'Verschwörung zum Drogenhandel, Geldwäsche' } },
    { id: 'moiseyev_accomplices', label: '15 Mitverschwörer', type: 'suspect', description: '15 verurteilte Komplizen von Moiseyev', details: { 'Anzahl': '15', 'Strafmaß': '8–23 Jahre Haft', 'Geldstrafen gesamt': '16 Mio. Rubel', 'Verurteilung': '02.12.2024' } },
    { id: 'zwiebel', label: 'Sebastian Zwiebel', type: 'witness', description: 'BKA-Ermittler, leitete Hydra-Abschaltung', details: { 'Nationalität': 'Deutsch', 'Behörde': 'BKA', 'Rolle': 'Einsatzleiter Hydra-Beschlagnahmung' } },
    { id: 'morgan', label: 'Heather "Razzlekhan" Morgan', type: 'suspect', description: 'Bitfinex-Hack-Verschwörerin, nutzte Hydra-Mixer', details: { 'Nationalität': 'Amerikanisch', 'Rolle': 'Geldwäsche Bitfinex-Hack-Erlöse über Hydra Bitcoin-Mixer' } },
    { id: 'lichtenstein', label: 'Ilya "Dutch" Lichtenstein', type: 'suspect', description: 'Bitfinex-Hack-Verschwörer, nutzte Hydra-Mixer', details: { 'Nationalität': 'Amerikanisch', 'Rolle': 'Geldwäsche Bitfinex-Hack-Erlöse über Hydra Bitcoin-Mixer' } },
    { id: 'zambada', label: 'Ismael "El Mayo" Zambada', type: 'suspect', description: 'Anführer des Sinaloa-Kartells', details: { 'Nationalität': 'Mexikanisch', 'Rolle': 'Kartellführer, Nutzung Hydra für Geldwäsche', 'Methode': 'Smurfing (<$7.500 pro Transaktion)', 'Verknüpfte Konten': '12' } },
    { id: 'oseguera', label: 'Nemesio "El Mencho" Oseguera', type: 'suspect', description: 'Anführer des CJNG-Kartells', details: { 'Nationalität': 'Mexikanisch', 'Rolle': 'Kartellführer, Nutzung Hydra für Geldwäsche', 'Methode': 'Smurfing (<$7.500 pro Transaktion)' } },

    // ── LAW ENFORCEMENT / GOVERNMENT ──
    { id: 'bka', label: 'BKA (Bundeskriminalamt)', type: 'organization', description: 'Deutsche Bundespolizei – leitete Hydra-Beschlagnahmung', details: { 'Land': 'Deutschland', 'Rolle': 'Ermittlung & Server-Beschlagnahmung', 'Zeitraum': 'Aug 2021 – Apr 2022' } },
    { id: 'zit', label: 'ZIT Frankfurt', type: 'organization', description: 'Zentralstelle zur Bekämpfung der Internetkriminalität', details: { 'Sitz': 'Frankfurt am Main', 'Rolle': 'Ermittlungsführung Cybercrime', 'Ermittlungsbeginn': 'August 2021' } },
    { id: 'usdoj', label: 'U.S. Dept. of Justice', type: 'organization', description: 'Koordinierte internationale Ermittlung', details: { 'Rolle': 'Anklageerhebung, internationale Koordination' } },
    { id: 'fbi', label: 'FBI', type: 'organization', description: 'Federal Bureau of Investigation', details: { 'Rolle': 'Ermittlung Hydra Market', 'Teil von': 'JCODE Task Force' } },
    { id: 'dea', label: 'DEA', type: 'organization', description: 'Drug Enforcement Administration', details: { 'Rolle': 'Ermittlung Drogenhandel über Hydra', 'Teil von': 'JCODE Task Force' } },
    { id: 'irs_ci', label: 'IRS Criminal Investigation', type: 'organization', description: 'Steuerfahndung / Kryptoforensik', details: { 'Rolle': 'Blockchain-Analyse und Finanzermittlung', 'Teil von': 'JCODE Task Force' } },
    { id: 'hsi', label: 'HSI (Homeland Security)', type: 'organization', description: 'Homeland Security Investigations', details: { 'Rolle': 'Ermittlung', 'Teil von': 'JCODE Task Force' } },
    { id: 'uspis', label: 'U.S. Postal Inspection', type: 'organization', description: 'U.S. Postal Inspection Service', details: { 'Rolle': 'Ermittlung Postversand-Drogen', 'Teil von': 'JCODE Task Force' } },
    { id: 'jcode', label: 'JCODE Task Force', type: 'organization', description: 'Joint Criminal Opioid & Darknet Enforcement', details: { 'Mitglieder': 'FBI, DEA, IRS-CI, HSI, USPIS', 'Rolle': 'Koordinierte Darknet-Ermittlung' } },
    { id: 'ofac', label: 'OFAC (U.S. Treasury)', type: 'organization', description: 'Office of Foreign Assets Control – Sanktionsbehörde', details: { 'Rolle': 'Sanktionen gegen Hydra, Garantex, SUEX, CHATEX, Bitpapa, NetExchange', 'Krypto-Adressen': '>100 auf SDN-Liste gesetzt' } },

    // ── COURTS ──
    { id: 'moscow_court', label: 'Moskauer Regionalgericht', type: 'law', description: 'Verurteilung Moiseyev & Komplizen', details: { 'Urteil': '02.12.2024', 'Historisch': 'Erste lebenslängliche Strafe für Drogenhandel in Russland' } },
    { id: 'us_court_ndca', label: 'U.S. District Court N.D. California', type: 'law', description: 'Anklage gegen Pavlov', details: { 'Anklage': '05.04.2022', 'Delikte': 'Drogen-Verschwörung, Geldwäsche-Verschwörung' } },

    // ── PROMSERVICE ──
    { id: 'promservice', label: 'Promservice Ltd.', type: 'organization', description: 'Hosting-Firma von Pavlov – betrieb Hydra-Server', details: { 'Sitz': 'Novosibirsk, Russland', 'Betrieb': 'Seit Nov 2015', 'Rolle': 'Bulletproof Hosting für Hydra' } },

    // ── CRYPTO EXCHANGES (sanctioned) ──
    { id: 'garantex', label: 'Garantex', type: 'account', description: 'Kryptobörse – $100 Mio. illegale Transaktionen', details: { 'Registriert': 'Estland', 'Betrieb': 'Moskau, Federation Tower', 'Gegründet': '2019', 'Sanktioniert': '05.04.2022', 'Illegales Volumen': '$100 Mio.', 'Hydra-Bezug': '$2,6 Mio. Geldwäsche' } },
    { id: 'suex', label: 'SUEX OTC', type: 'account', description: 'Kryptobörse – sanktioniert 2021', details: { 'Sitz': 'Moskau, Federation Tower', 'Sanktioniert': '2021', 'Rolle': 'Geldwäsche-Dienst für Hydra' } },
    { id: 'chatex', label: 'CHATEX', type: 'account', description: 'Kryptobörse – sanktioniert 2021', details: { 'Sitz': 'Moskau, Federation Tower', 'Sanktioniert': '2021', 'Rolle': 'Geldwäsche-Dienst für Hydra' } },
    { id: 'bitpapa', label: 'Bitpapa', type: 'account', description: 'Kryptobörse – sanktioniert März 2024', details: { 'Sanktioniert': 'März 2024', 'Grund': 'Transaktionen mit Hydra & Garantex' } },
    { id: 'netexchange', label: 'NetExchange', type: 'account', description: 'Kryptobörse – sanktioniert März 2024', details: { 'Sanktioniert': 'März 2024', 'Grund': 'Transaktionen mit Hydra & Garantex' } },

    // ── RANSOMWARE GROUPS ──
    { id: 'darkside', label: 'DarkSide', type: 'suspect', description: 'Ransomware-Gruppe – Colonial Pipeline Angriff', details: { 'Land': 'Russland', 'Hydra-Nutzung': '4% der BTC-Gewinne über Hydra ausgecasht', 'Bekanntester Angriff': 'Colonial Pipeline (Mai 2021)' } },
    { id: 'ryuk', label: 'Ryuk', type: 'suspect', description: 'Ransomware-Gruppe', details: { 'Hydra-Nutzung': 'Teil von $8 Mio. Ransomware-Erlösen über Hydra gewaschen' } },
    { id: 'sodinokibi', label: 'Sodinokibi / REvil', type: 'suspect', description: 'Ransomware-Gruppe', details: { 'Hydra-Nutzung': 'Teil von $8 Mio. Ransomware-Erlösen über Hydra gewaschen' } },
    { id: 'conti', label: 'Conti', type: 'suspect', description: 'Ransomware-Gruppe', details: { 'Hydra-Nutzung': '~$6 Mio. über Garantex gewaschen', 'Garantex-Bezug': '$6 Mio. direkte Transaktionen' } },

    // ── DRUG CARTELS ──
    { id: 'sinaloa_cartel', label: 'Sinaloa-Kartell', type: 'organization', description: 'Mexikanisches Drogenkartell – nutzte Hydra für Geldwäsche', details: { 'Land': 'Mexiko', 'Methode': 'Smurfing (<$7.500 pro Transaktion)', 'Verknüpfte Konten': '12', 'Anführer': 'Ismael "El Mayo" Zambada' } },
    { id: 'cjng', label: 'CJNG (Jalisco-Kartell)', type: 'organization', description: 'Jalisco New Generation Cartel – nutzte Hydra für Geldwäsche', details: { 'Land': 'Mexiko', 'Methode': 'Smurfing (<$7.500 pro Transaktion)', 'Anführer': 'Nemesio "El Mencho" Oseguera' } },

    // ── DARKNET COMPETITORS / SUCCESSORS ──
    { id: 'ramp', label: 'RAMP', type: 'organization', description: 'Russian Anonymous Marketplace – Vorgänger von Hydra', details: { 'Status': 'Geschlossen Sep 2017', 'Land': 'Russland', 'Bedeutung': 'Nach Schließung wurde Hydra dominant' } },
    { id: 'omg_market', label: 'OMG!OMG! Market', type: 'organization', description: 'Hydra-Nachfolger – 65,2% Marktanteil', details: { 'Rolle': 'Größter Hydra-Nachfolgemarkt', 'Marktanteil': '65,2%' } },
    { id: 'mega_market', label: 'Mega Darknet Market', type: 'organization', description: 'Hydra-Nachfolger', details: { 'Rolle': 'Hydra-Nachfolgemarkt' } },
    { id: 'blacksprut', label: 'Blacksprut Market', type: 'organization', description: 'Hydra-Nachfolger', details: { 'Rolle': 'Hydra-Nachfolgemarkt' } },
    { id: 'solaris', label: 'Solaris', type: 'organization', description: 'Hydra-Nachfolger – von Kraken übernommen', details: { 'Status': 'Von Kraken gekapert (Jan 2023)' } },
    { id: 'kraken_dnm', label: 'Kraken (DNM)', type: 'organization', description: 'Darknet-Markt – übernahm Solaris', details: { 'Aktion': 'Kaperte Solaris im Jan 2023' } },
    { id: 'wayaway', label: 'Wayaway Forum', type: 'communication', description: 'Darknet-Forum – langjähriger Partner von Hydra', details: { 'Domain': 'wayaway.biz', 'Rolle': 'Hydra-Partnerforum' } },

    // ── SERVICES offered by Hydra ──
    { id: 'svc_drugs', label: 'Drogenverkauf', type: 'drug', description: 'Kokain, Meth, LSD, Heroin, Opioide, Vorläufersubstanzen', details: { 'Angebot': 'Groß- und Einzelhandel', 'Liefermethode': 'Dead-Drop (Klad/Zakladka)' } },
    { id: 'svc_dead_drop', label: 'Dead-Drop Lieferung', type: 'drug', description: 'Klad/Zakladka-System für physische Übergaben', details: { 'Methoden': 'Vergraben (Prikop), Magnetisch, Versteck (Taynik)', 'Bestelltypen': 'Sofortbestellungen, Vorbestellungen', 'Kosten': '>50% des Drogenpreises bei einigen Artikeln' } },
    { id: 'svc_btc_mixer', label: 'Bitcoin Bank Mixer', type: 'digital', description: 'Hydras eigener Krypto-Mixing-Service', details: { 'Zweck': 'Verschleierung von Kryptotransaktionen', 'Nutzer': 'Ransomware-Gruppen, Kartelle, Hacker' } },
    { id: 'svc_cashout', label: 'Cash-Out-Dienste', type: 'account', description: 'BTC zu Rubel, Barlieferungen, Überweisungen', details: { 'Methoden': 'BTC→Rubel, Barlieferung, Überweisung, SIM-Karten-Zahlung, Physisch vergrabenes Bargeld' } },
    { id: 'svc_forged_docs', label: 'Gefälschte Dokumente', type: 'evidence', description: 'Identitätsdokumente mit anpassbaren Fotos', details: { 'Art': 'Ausweise, Pässe, Führerscheine' } },
    { id: 'svc_stolen_data', label: 'Gestohlene Finanzdaten', type: 'digital', description: 'Kreditkarteninformationen, persönliche Daten', details: { 'Angebot': 'Kreditkarten, Bankdaten, Identitätsdaten' } },
    { id: 'svc_hacking', label: 'Hacking-Dienste & Tools', type: 'digital', description: 'Hacking-als-Dienstleistung', details: {} },
    { id: 'svc_raas', label: 'Ransomware-as-a-Service', type: 'digital', description: 'RaaS-Angebote im Hydra-Marktplatz', details: { 'Nutzer': 'DarkSide, Ryuk, REvil, Conti und andere' } },
    { id: 'svc_counterfeit', label: 'Falschgeld', type: 'evidence', description: 'Gefälschte Banknoten', details: {} },
    { id: 'svc_escrow', label: 'Treuhand-System', type: 'digital', description: 'Escrow für sichere Transaktionen', details: { 'Zweck': 'Käuferschutz bei Darknet-Deals' } },

    // ── CRITICAL EVENTS ──
    { id: 'evt_founded', label: 'Hydra gegründet (2015)', type: 'process', description: 'Gründung des Hydra Darknet-Marktplatzes', timestamp: '2015', details: {} },
    { id: 'evt_ramp_closure', label: 'RAMP geschlossen (Sep 2017)', type: 'process', description: 'Russische Behörden schließen RAMP – Hydra wird dominant', timestamp: 'September 2017', details: { 'Folge': 'Hydra übernimmt Monopol' } },
    { id: 'evt_colonial_pipeline', label: 'Colonial Pipeline Angriff', type: 'process', description: 'DarkSide-Ransomware-Angriff auf US-Pipeline', timestamp: '07.05.2021', details: { 'Lösegeld': '75 BTC (~$4,4 Mio.)', 'Wiederhergestellt': '63,7 BTC durch FBI', 'Auswirkung': 'Kraftstoffmangel an US-Ostküste' } },
    { id: 'evt_investigation_start', label: 'BKA/ZIT Ermittlung beginnt', type: 'process', description: 'Deutsche Behörden beginnen mit Hydra-Infrastruktur-Ermittlung', timestamp: 'August 2021', details: { 'Behörden': 'BKA + ZIT Frankfurt' } },
    { id: 'evt_seizure', label: 'Hydra-Server beschlagnahmt', type: 'process', description: 'BKA beschlagnahmt Hydra-Server und 543,3 BTC', timestamp: '05.04.2022', details: { 'BTC beschlagnahmt': '543,3 BTC', 'Wert EUR': '~23 Mio. EUR', 'Wert USD': '~$25 Mio.', 'Transaktionen': '88' } },
    { id: 'evt_pavlov_indictment', label: 'Pavlov angeklagt (USA)', type: 'process', description: 'U.S. Anklage gegen Pavlov', timestamp: '05.04.2022', details: { 'Gericht': 'U.S. District Court N.D. California' } },
    { id: 'evt_ofac_sanctions', label: 'OFAC-Sanktionen (Hydra+Garantex)', type: 'process', description: 'OFAC sanktioniert Hydra & Garantex, über 100 Krypto-Adressen', timestamp: '05.04.2022', details: { 'Sanktionierte Krypto-Adressen': '>100' } },
    { id: 'evt_moiseyev_sentence', label: 'Moiseyev: Lebenslang (Dez 2024)', type: 'process', description: 'Historische Verurteilung: Erste lebenslängliche Strafe für Drogenhandel in Russland', timestamp: '02.12.2024', details: { 'Gericht': 'Moskauer Regionalgericht', 'Mitverurteilte': '15 (8–23 Jahre)' } },
    { id: 'evt_bitpapa_sanctions', label: 'Bitpapa & NetExchange sanktioniert', type: 'process', description: 'OFAC sanktioniert weitere Kryptobörsen', timestamp: 'März 2024', details: { 'Grund': 'Transaktionen mit Hydra & Garantex' } },

    // ── COUNTRIES ──
    { id: 'country_russia', label: '🇷🇺 Russland', type: 'location', description: 'Hauptmarkt und Herkunftsland der Betreiber', details: {} },
    { id: 'country_germany', label: '🇩🇪 Deutschland', type: 'location', description: 'Standort der Hydra-Server', details: {} },
    { id: 'country_usa', label: '🇺🇸 USA', type: 'location', description: 'Anklage, Sanktionen, Ermittlung', details: {} },
    { id: 'country_ukraine', label: '🇺🇦 Ukraine', type: 'location', description: 'Hydra-Marktgebiet', details: {} },
    { id: 'country_estonia', label: '🇪🇪 Estland', type: 'location', description: 'Garantex-Registrierung', details: {} },
    { id: 'country_mexico', label: '🇲🇽 Mexiko', type: 'location', description: 'Sinaloa- und CJNG-Kartelle', details: {} },
    { id: 'country_belarus', label: '🇧🇾 Belarus', type: 'location', description: 'Hydra-Marktgebiet', details: {} },
    { id: 'country_kazakhstan', label: '🇰🇿 Kasachstan', type: 'location', description: 'Hydra-Marktgebiet', details: {} },
    { id: 'country_moldova', label: '🇲🇩 Moldau', type: 'location', description: 'Hydra-Marktgebiet', details: {} },

    // ── CRYPTO ASSETS ──
    { id: 'hydra_crypto_addresses', label: 'Hydra Krypto-Adressen (SDN)', type: 'account', description: 'Über 100 Krypto-Adressen auf OFAC-SDN-Liste', details: { 'Anzahl': '>100', 'Liste': 'OFAC SDN List' } },
    { id: 'seized_btc', label: 'Beschlagnahmte 543,3 BTC', type: 'evidence', description: 'Beschlagnahmte Bitcoin durch BKA', details: { 'Menge': '543,3 BTC', 'Wert EUR': '~23 Mio. EUR', 'Wert USD': '~$25 Mio.', 'Datum': '05.04.2022' } },

    // ── INFRASTRUCTURE ──
    { id: 'infra_servers', label: 'Hydra Server-Infrastruktur', type: 'digital', description: 'Physische Server in Deutschland, betrieben von Promservice', details: { 'Standort': 'Deutschland', 'Betreiber': 'Promservice Ltd.', 'Netzwerk': 'Tor' } },
    { id: 'infra_tor', label: 'Tor-Netzwerk', type: 'digital', description: 'Anonymisierungsnetzwerk – Zugang zu Hydra', details: { 'Typ': 'Anonymisierungsnetzwerk', 'Rolle': 'Zugangsnetzwerk für .onion-Dienste' } },

    // ── VICTIMS / TARGETS ──
    { id: 'colonial_pipeline', label: 'Colonial Pipeline', type: 'victim', description: 'US-Öl/Gas-Infrastruktur – DarkSide-Ransomware-Opfer', details: { 'Land': 'USA', 'Sektor': 'Öl/Gas Infrastruktur', 'Lösegeld': '75 BTC (~$4,4 Mio.)', 'Wiederhergestellt': '63,7 BTC' } },
    { id: 'bitfinex', label: 'Bitfinex', type: 'victim', description: 'Kryptobörse – Hack 2016, Erlöse über Hydra gewaschen', details: { 'Hack-Jahr': '2016', 'Schaden': '$4,5 Mrd.', 'Geldwäsche': 'Über Hydra Bitcoin Bank Mixer' } },

    // ── ADDITIONAL ENTITIES ──
    { id: 'alphabay', label: 'AlphaBay', type: 'case', description: 'Darknet-Marktplatz – beschlagnahmt Juli 2017 (~$1 Mrd.)', details: { 'Status': 'Beschlagnahmt Juli 2017', 'Wert': '~$1 Mrd. bei Beschlagnahmung', 'Vergleich': 'Hydra hatte $5,2 Mrd. Gesamtvolumen' } },
    { id: 'federation_tower', label: 'Federation Tower (Moskau)', type: 'location', description: 'Standort von Garantex, SUEX und CHATEX', details: { 'Stadt': 'Moskau', 'Land': 'Russland', 'Mieter': 'Garantex, SUEX, CHATEX – alle sanktioniert' } },
    { id: 'evt_omg_ddos', label: 'OMG!OMG! DDoS-Angriff', type: 'process', description: 'DDoS auf OMG-Markt – Händlermigration zu Mega/Blacksprut', timestamp: 'Juni 2022', details: { 'Auswirkung': 'Vendor-Migration zu Mega und Blacksprut' } },
    { id: 'evt_blacksprut_hack', label: 'Blacksprut gehackt', type: 'process', description: 'Blacksprut bei 68,5 % Marktanteil gehackt', timestamp: 'November 2022', details: { 'Marktanteil': '68,5 % vor Hack' } },
    { id: 'evt_garantex_license_revoked', label: 'Garantex-Lizenz entzogen', type: 'process', description: 'Estlands FIU entzog Garantex-Kryptolizenz wegen Geldwäsche', timestamp: 'Februar 2022', details: { 'Behörde': 'Estlands FIU', 'Grund': 'Verstöße gegen Geldwäschevorschriften' } },
    { id: 'eo_13694', label: 'Executive Order 13694', type: 'law', description: 'US-Sanktionsgrundlage – Blockierung von Eigentum bei Cyber-Aktivitäten', details: { 'Herausgeber': 'Präsident der USA', 'Anwendung': 'Hydra, Garantex, SUEX, CHATEX, Bitpapa, NetExchange' } },
    { id: 'dnm_market_2022', label: 'DNM-Marktübersicht 2022', type: 'regulation', description: 'Gesamter DNM-Umsatz: $3,1 Mrd. (2021) → $1,5 Mrd. (2022)', details: { 'Umsatz 2021': '$3,1 Mrd.', 'Umsatz 2022': '$1,5 Mrd.', 'Rückgang': '51,6 %', 'Hauptgrund': 'Hydra-Abschaltung' } },
  ]

  const links: GraphLink[] = [
    // ── PERSONS → HYDRA MARKET ──
    { source: 'moiseyev', target: 'hydra_market', type: 'gründete und betrieb', description: 'Gründer/Hauptbetreiber' },
    { source: 'pavlov', target: 'hydra_market', type: 'administrierte Server', description: 'Server-Administrator' },
    { source: 'moiseyev_accomplices', target: 'hydra_market', type: 'betrieben mit', description: '15 Mitverschwörer' },
    { source: 'promservice', target: 'hydra_market', type: 'hostete Server für', description: 'Seit Nov 2015' },
    { source: 'pavlov', target: 'promservice', type: 'besaß/betrieb', description: 'Firmeneigentümer' },

    // ── INFRASTRUCTURE ──
    { source: 'hydra_market', target: 'infra_servers', type: 'Infrastruktur' },
    { source: 'promservice', target: 'infra_servers', type: 'administrierte' },
    { source: 'infra_servers', target: 'country_germany', type: 'Standort' },
    { source: 'hydra_market', target: 'infra_tor', type: 'erreichbar über' },

    // ── LAW ENFORCEMENT → HYDRA ──
    { source: 'bka', target: 'hydra_market', type: 'ermittelte & beschlagnahmte', description: 'Aug 2021 – Apr 2022' },
    { source: 'zit', target: 'hydra_market', type: 'ermittelte', description: 'Seit August 2021' },
    { source: 'usdoj', target: 'hydra_market', type: 'koordinierte Ermittlung' },
    { source: 'fbi', target: 'hydra_market', type: 'ermittelte' },
    { source: 'dea', target: 'hydra_market', type: 'ermittelte' },
    { source: 'irs_ci', target: 'hydra_market', type: 'ermittelte' },
    { source: 'hsi', target: 'hydra_market', type: 'ermittelte' },
    { source: 'uspis', target: 'hydra_market', type: 'ermittelte' },
    { source: 'jcode', target: 'hydra_market', type: 'koordinierte Ermittlung' },
    { source: 'zwiebel', target: 'evt_seizure', type: 'leitete Operation' },
    { source: 'zwiebel', target: 'bka', type: 'arbeitet für' },

    // ── JCODE MEMBERS ──
    { source: 'fbi', target: 'jcode', type: 'Mitglied' },
    { source: 'dea', target: 'jcode', type: 'Mitglied' },
    { source: 'irs_ci', target: 'jcode', type: 'Mitglied' },
    { source: 'hsi', target: 'jcode', type: 'Mitglied' },
    { source: 'uspis', target: 'jcode', type: 'Mitglied' },

    // ── SANCTIONS ──
    { source: 'ofac', target: 'hydra_market', type: 'sanktionierte', description: '05.04.2022' },
    { source: 'ofac', target: 'garantex', type: 'sanktionierte', description: '05.04.2022' },
    { source: 'ofac', target: 'suex', type: 'sanktionierte', description: '2021' },
    { source: 'ofac', target: 'chatex', type: 'sanktionierte', description: '2021' },
    { source: 'ofac', target: 'bitpapa', type: 'sanktionierte', description: 'März 2024' },
    { source: 'ofac', target: 'netexchange', type: 'sanktionierte', description: 'März 2024' },
    { source: 'ofac', target: 'hydra_crypto_addresses', type: 'auf SDN-Liste', description: '>100 Adressen' },

    // ── INDICTMENTS / SENTENCES ──
    { source: 'usdoj', target: 'pavlov', type: 'klagte an', description: '05.04.2022' },
    { source: 'us_court_ndca', target: 'pavlov', type: 'Anklage', description: 'Drogen-/Geldwäsche-Verschwörung' },
    { source: 'moscow_court', target: 'moiseyev', type: 'verurteilte', description: 'Lebenslänglich (02.12.2024)' },
    { source: 'moscow_court', target: 'moiseyev_accomplices', type: 'verurteilte', description: '8–23 Jahre (02.12.2024)' },

    // ── HYDRA SERVICES ──
    { source: 'hydra_market', target: 'svc_drugs', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_dead_drop', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_btc_mixer', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_cashout', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_forged_docs', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_stolen_data', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_hacking', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_raas', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_counterfeit', type: 'bot an' },
    { source: 'hydra_market', target: 'svc_escrow', type: 'bot an' },

    // ── MARKET COUNTRIES ──
    { source: 'hydra_market', target: 'country_russia', type: 'Marktgebiet' },
    { source: 'hydra_market', target: 'country_ukraine', type: 'Marktgebiet' },
    { source: 'hydra_market', target: 'country_belarus', type: 'Marktgebiet' },
    { source: 'hydra_market', target: 'country_kazakhstan', type: 'Marktgebiet' },
    { source: 'hydra_market', target: 'country_moldova', type: 'Marktgebiet' },

    // ── COMPETITORS / SUCCESSORS ──
    { source: 'ramp', target: 'hydra_market', type: 'Konkurrent (2015–2017)', description: 'Hydra wurde nach RAMP-Schließung dominant' },
    { source: 'hydra_market', target: 'ramp', type: 'Nachfolger von' },
    { source: 'wayaway', target: 'hydra_market', type: 'Partnerforum' },
    { source: 'omg_market', target: 'hydra_market', type: 'Nachfolger von' },
    { source: 'mega_market', target: 'hydra_market', type: 'Nachfolger von' },
    { source: 'blacksprut', target: 'hydra_market', type: 'Nachfolger von' },
    { source: 'solaris', target: 'hydra_market', type: 'Nachfolger von' },
    { source: 'kraken_dnm', target: 'hydra_market', type: 'Nachfolger von' },
    { source: 'kraken_dnm', target: 'solaris', type: 'kaperte', description: 'Januar 2023' },

    // ── MONEY LAUNDERING: CRYPTO EXCHANGES ──
    { source: 'garantex', target: 'hydra_market', type: 'Geldwäsche', description: '$2,6 Mio.' },
    { source: 'suex', target: 'hydra_market', type: 'Geldwäsche' },
    { source: 'chatex', target: 'hydra_market', type: 'Geldwäsche' },
    { source: 'bitpapa', target: 'hydra_market', type: 'Transaktionen' },
    { source: 'netexchange', target: 'hydra_market', type: 'Transaktionen' },

    // ── RANSOMWARE → HYDRA (money laundering) ──
    { source: 'darkside', target: 'hydra_market', type: 'Geldwäsche über Hydra', description: '4% der BTC-Gewinne ausgecasht' },
    { source: 'ryuk', target: 'hydra_market', type: 'Geldwäsche über Hydra', description: 'Teil von $8 Mio. Ransomware-Erlösen' },
    { source: 'sodinokibi', target: 'hydra_market', type: 'Geldwäsche über Hydra', description: 'Teil von $8 Mio. Ransomware-Erlösen' },
    { source: 'conti', target: 'hydra_market', type: 'Geldwäsche über Hydra', description: '~$6 Mio. via Garantex' },
    { source: 'conti', target: 'garantex', type: 'Geldwäsche', description: '$6 Mio.' },
    { source: 'darkside', target: 'colonial_pipeline', type: 'Ransomware-Angriff', description: '75 BTC Lösegeld (Mai 2021)' },

    // ── DRUG CARTELS → HYDRA ──
    { source: 'sinaloa_cartel', target: 'hydra_market', type: 'Geldwäsche (Smurfing)', description: '12 verknüpfte Konten, <$7.500/Tx' },
    { source: 'cjng', target: 'hydra_market', type: 'Geldwäsche (Smurfing)', description: '<$7.500 pro Transaktion' },
    { source: 'zambada', target: 'sinaloa_cartel', type: 'führt' },
    { source: 'oseguera', target: 'cjng', type: 'führt' },

    // ── BITFINEX HACK → HYDRA ──
    { source: 'morgan', target: 'hydra_market', type: 'nutzte Mixer-Dienst', description: 'Bitfinex-Hack-Erlöse gewaschen' },
    { source: 'lichtenstein', target: 'hydra_market', type: 'nutzte Mixer-Dienst', description: 'Bitfinex-Hack-Erlöse gewaschen' },
    { source: 'morgan', target: 'bitfinex', type: 'Verschwörung zur Geldwäsche' },
    { source: 'lichtenstein', target: 'bitfinex', type: 'Verschwörung zur Geldwäsche' },

    // ── SEIZURE / EVIDENCE ──
    { source: 'bka', target: 'seized_btc', type: 'beschlagnahmte', description: '543,3 BTC am 05.04.2022' },

    // ── EVENTS → ENTITIES ──
    { source: 'evt_founded', target: 'hydra_market', type: 'bezieht sich auf' },
    { source: 'evt_ramp_closure', target: 'ramp', type: 'bezieht sich auf' },
    { source: 'evt_investigation_start', target: 'bka', type: 'initiiert von' },
    { source: 'evt_investigation_start', target: 'zit', type: 'initiiert von' },
    { source: 'evt_seizure', target: 'hydra_market', type: 'bezieht sich auf' },
    { source: 'evt_seizure', target: 'bka', type: 'durchgeführt von' },
    { source: 'evt_pavlov_indictment', target: 'pavlov', type: 'bezieht sich auf' },
    { source: 'evt_ofac_sanctions', target: 'hydra_market', type: 'bezieht sich auf' },
    { source: 'evt_ofac_sanctions', target: 'garantex', type: 'bezieht sich auf' },
    { source: 'evt_moiseyev_sentence', target: 'moiseyev', type: 'bezieht sich auf' },
    { source: 'evt_bitpapa_sanctions', target: 'bitpapa', type: 'bezieht sich auf' },
    { source: 'evt_bitpapa_sanctions', target: 'netexchange', type: 'bezieht sich auf' },
    { source: 'darkside', target: 'evt_colonial_pipeline', type: 'verübte' },

    // ── CITIZENSHIP ──
    { source: 'moiseyev', target: 'country_russia', type: 'Staatsbürger' },
    { source: 'pavlov', target: 'country_russia', type: 'Staatsbürger' },
    { source: 'zwiebel', target: 'country_germany', type: 'Staatsbürger' },
    { source: 'zambada', target: 'country_mexico', type: 'Staatsbürger' },
    { source: 'oseguera', target: 'country_mexico', type: 'Staatsbürger' },
    { source: 'garantex', target: 'country_estonia', type: 'registriert in' },
    { source: 'bka', target: 'country_germany', type: 'Sitz' },
    { source: 'ofac', target: 'country_usa', type: 'Sitz' },
    { source: 'usdoj', target: 'country_usa', type: 'Sitz' },

    // ── ADDITIONAL LINKS ──
    { source: 'evt_omg_ddos', target: 'omg_market', type: 'bezieht sich auf', description: 'DDoS-Angriff Juni 2022' },
    { source: 'evt_blacksprut_hack', target: 'blacksprut', type: 'bezieht sich auf', description: 'Hack November 2022' },
    { source: 'evt_garantex_license_revoked', target: 'garantex', type: 'bezieht sich auf', description: 'Lizenzentzug Feb 2022' },
    { source: 'evt_garantex_license_revoked', target: 'country_estonia', type: 'reguliert von' },
    { source: 'garantex', target: 'federation_tower', type: 'Standort', description: 'Federation Tower, Moskau' },
    { source: 'suex', target: 'federation_tower', type: 'Standort', description: 'Federation Tower, Moskau' },
    { source: 'chatex', target: 'federation_tower', type: 'Standort', description: 'Federation Tower, Moskau' },
    { source: 'evt_ofac_sanctions', target: 'eo_13694', type: 'Rechtsgrundlage', description: 'Executive Order 13694' },
  ]

  return { nodes, links }
}

// Helpers to get ID from link source/target (may be object after d3 processing)
function getLinkSourceId(link: GraphLink): string {
  return typeof link.source === 'object' ? (link.source as any).id : link.source
}
function getLinkTargetId(link: GraphLink): string {
  return typeof link.target === 'object' ? (link.target as any).id : link.target
}

// ────────────────────────────────────────────
// Component
// ────────────────────────────────────────────
export function PoliceKnowledgeGraph3D() {
  const graphRef = useRef<ForceGraphMethods>(undefined!)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [relatedLinks, setRelatedLinks] = useState<GraphLink[]>([])
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set())
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [userInteracting, setUserInteracting] = useState(false)

  // Listen for native fullscreen changes (e.g. user presses Escape)
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const graphData = useMemo(() => buildCaseData(), [])

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)
    window.addEventListener('resize', updateSize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [isFullscreen])

  // Initial camera position + ensure scene has proper lighting
  useEffect(() => {
    const fg = graphRef.current
    if (!fg) return

    // Add lights to the scene so MeshLambertMaterial nodes are visible
    const scene = fg.scene()
    if (scene) {
      // Check if we already added our lights (avoid duplicates on re-render)
      if (!scene.getObjectByName('__cassa_ambient')) {
        const ambient = new THREE.AmbientLight(0xffffff, 1.2)
        ambient.name = '__cassa_ambient'
        scene.add(ambient)

        const dir = new THREE.DirectionalLight(0xffffff, 0.8)
        dir.name = '__cassa_dir'
        dir.position.set(200, 300, 200)
        scene.add(dir)

        const dir2 = new THREE.DirectionalLight(0xaabbff, 0.4)
        dir2.name = '__cassa_dir2'
        dir2.position.set(-200, -100, -200)
        scene.add(dir2)
      }
    }

    setTimeout(() => {
      fg.cameraPosition({ x: 0, y: 0, z: 350 }, { x: 0, y: 0, z: 0 }, 2000)
    }, 500)
  }, [])

  // Stop auto-rotate when user interacts (mouse/touch) with the graph
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onInteract = () => setUserInteracting(true)
    el.addEventListener('pointerdown', onInteract)
    el.addEventListener('wheel', onInteract, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', onInteract)
      el.removeEventListener('wheel', onInteract)
    }
  }, [])

  // Auto-rotate when nothing selected and user hasn't interacted
  useEffect(() => {
    if (selectedNode || userInteracting) return
    let angle = 0
    const timer = setInterval(() => {
      const fg = graphRef.current
      if (!fg) return
      angle += 0.002
      const dist = 350
      fg.cameraPosition({
        x: dist * Math.sin(angle),
        y: 50,
        z: dist * Math.cos(angle)
      })
    }, 30)
    return () => clearInterval(timer)
  }, [selectedNode, userInteracting])

  // Keyboard navigation (arrow keys to rotate camera, +/- to zoom)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKeyDown = (e: KeyboardEvent) => {
      const fg = graphRef.current
      if (!fg) return
      const cam = fg.camera()
      const pos = cam.position
      const step = 15
      const zoomStep = 30
      let newPos = { x: pos.x, y: pos.y, z: pos.z }
      let handled = true
      switch (e.key) {
        case 'ArrowLeft':  newPos.x -= step; break
        case 'ArrowRight': newPos.x += step; break
        case 'ArrowUp':    newPos.y += step; break
        case 'ArrowDown':  newPos.y -= step; break
        case '+': case '=': {
          // Zoom in (move towards origin)
          const d = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2)
          const factor = Math.max(0.1, (d - zoomStep) / d)
          newPos = { x: pos.x * factor, y: pos.y * factor, z: pos.z * factor }
          break
        }
        case '-': case '_': {
          // Zoom out
          const d2 = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2)
          const factor2 = (d2 + zoomStep) / d2
          newPos = { x: pos.x * factor2, y: pos.y * factor2, z: pos.z * factor2 }
          break
        }
        default: handled = false
      }
      if (handled) {
        e.preventDefault()
        setUserInteracting(true)
        fg.cameraPosition(newPos, undefined, 300)
      }
    }
    el.setAttribute('tabindex', '0')
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [])

  const linkKey = useCallback((l: GraphLink) => {
    return `${getLinkSourceId(l)}__${getLinkTargetId(l)}__${l.type}`
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    const gNode = node as GraphNode
    setSelectedNode(gNode)

    const related = graphData.links.filter(l => {
      const s = getLinkSourceId(l)
      const t = getLinkTargetId(l)
      return s === gNode.id || t === gNode.id
    })
    setRelatedLinks(related)

    const nodeSet = new Set<string>([gNode.id])
    const linkSet = new Set<string>()
    related.forEach(l => {
      nodeSet.add(getLinkSourceId(l))
      nodeSet.add(getLinkTargetId(l))
      linkSet.add(linkKey(l))
    })
    setHighlightNodes(nodeSet)
    setHighlightLinks(linkSet)

    const fg = graphRef.current
    if (fg) {
      const dist = 120
      fg.cameraPosition(
        { x: (node.x || 0) + dist, y: (node.y || 0) + dist / 2, z: (node.z || 0) + dist },
        { x: node.x, y: node.y, z: node.z },
        1500
      )
    }
  }, [graphData.links, linkKey])

  const clearSelection = useCallback(() => {
    if (!selectedNode && highlightLinks.size === 0 && highlightNodes.size === 0) return
    setSelectedNode(null)
    setRelatedLinks([])
    setHighlightNodes(new Set())
    setHighlightLinks(new Set())
    const fg = graphRef.current
    if (fg) {
      fg.cameraPosition({ x: 0, y: 0, z: 350 }, { x: 0, y: 0, z: 0 }, 1500)
    }
  }, [highlightLinks.size, highlightNodes.size, selectedNode])

  const handleBackgroundClick = useCallback(() => {
    if (!selectedNode) return
    clearSelection()
  }, [clearSelection, selectedNode])

  const handleReset = useCallback(() => {
    setUserInteracting(false)
    clearSelection()
  }, [clearSelection])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        // fallback: just toggle CSS fullscreen
        setIsFullscreen(f => !f)
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Custom node rendering
  const nodeThreeObject = useCallback((node: any) => {
    const gNode = node as GraphNode
    const color = NODE_COLORS[gNode.type] || '#888'
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(gNode.id)
    const isSelected = selectedNode?.id === gNode.id

    const group = new THREE.Group()

    const radius = isSelected ? 5 : highlightNodes.has(gNode.id) && highlightNodes.size > 0 ? 4 : 3
    const geo = new THREE.SphereGeometry(radius, 24, 24)
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: !isHighlighted,
      opacity: isHighlighted ? 1 : 0.15,
      emissive: color,
      emissiveIntensity: isSelected ? 0.7 : 0.35,
    })
    const sphere = new THREE.Mesh(geo, mat)
    group.add(sphere)

    // Pulsing ring for selected node
    if (isSelected) {
      const ringGeo = new THREE.RingGeometry(6, 7.5, 32)
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      group.add(ring)
    }

    // Label
    const sprite = new SpriteText(gNode.label) as any
    sprite.color = isHighlighted ? color : '#555'
    sprite.textHeight = isSelected ? 4 : 2.5
    sprite.fontWeight = isSelected ? 'bold' : 'normal'
    sprite.backgroundColor = isHighlighted ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'
    sprite.padding = 1.5
    sprite.borderRadius = 3
    ;(sprite as THREE.Object3D).position.set(0, radius + 3, 0)
    group.add(sprite as THREE.Object3D)

    return group
  }, [highlightNodes, selectedNode])

  const linkColor = useCallback((link: any) => {
    if (highlightLinks.size === 0) return 'rgba(255,255,255,0.12)'
    return highlightLinks.has(linkKey(link)) ? 'rgba(255,180,50,0.9)' : 'rgba(255,255,255,0.04)'
  }, [highlightLinks, linkKey])

  const linkWidth = useCallback((link: any) => {
    if (highlightLinks.size === 0) return 0.5
    return highlightLinks.has(linkKey(link)) ? 2.5 : 0.2
  }, [highlightLinks, linkKey])

  const linkDirectionalParticles = useCallback((link: any) => {
    return highlightLinks.has(linkKey(link)) ? 4 : 0
  }, [highlightLinks, linkKey])

  const linkThreeObject = useCallback((_link: any) => {
    // Create sprite for every link. Visibility is toggled per-frame in linkPositionUpdate.
    const sprite = new SpriteText('') as any
    sprite.visible = false
    sprite.color = '#ffd166'
    sprite.textHeight = 2.8
    sprite.fontWeight = 'bold'
    sprite.backgroundColor = 'rgba(10,14,26,0.88)'
    sprite.padding = 1.5
    sprite.borderRadius = 4
    sprite.strokeWidth = 0
    return sprite as THREE.Object3D
  }, [])

  const linkPositionUpdate = useCallback((sprite: any, coords: any, linkData: any) => {
    // sprite   = THREE SpriteText object (from linkThreeObject)
    // coords   = { start: {x,y,z}, end: {x,y,z} } — world positions (2nd arg)
    // linkData = the link object (source/target/type) — 3rd arg in react-force-graph-3d
    if (!sprite || typeof sprite.text !== 'string') return
    if (!coords?.start || !coords?.end) return

    const lKey = linkData ? linkKey(linkData) : null
    const isHighlighted = lKey ? (highlightLinks.size > 0 && highlightLinks.has(lKey)) : false

    if (!isHighlighted) {
      sprite.visible = false
      return
    }

    // Format type: FOUNDED_AND_OPERATED → FOUNDED AND OPERATED
    const label = linkData?.type
      ? (linkData.type as string).replace(/_/g, '\u00a0')
      : ''
    sprite.text = label
    sprite.visible = true

    const middle = {
      x: coords.start.x + (coords.end.x - coords.start.x) / 2,
      y: coords.start.y + (coords.end.y - coords.start.y) / 2,
      z: coords.start.z + (coords.end.z - coords.start.z) / 2,
    }
    Object.assign((sprite as THREE.Object3D).position, middle)
  }, [highlightLinks, linkKey])

  const navigateToNode = useCallback((nodeId: string) => {
    const node = graphData.nodes.find(n => n.id === nodeId)
    if (node) handleNodeClick(node)
  }, [graphData.nodes, handleNodeClick])

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-[#0a0e1a]'
    : 'w-full h-full min-h-[600px] bg-[#0a0e1a] relative rounded-xl overflow-hidden'

  return (
    <div className={containerClass} ref={containerRef}>
      <ForceGraph3D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#0a0e1a"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkThreeObject={linkThreeObject}
        linkThreeObjectExtend={true}
        linkPositionUpdate={linkPositionUpdate}
        linkDirectionalParticles={linkDirectionalParticles}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => '#ffb432'}
        linkOpacity={0.6}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        enableNodeDrag={true}
        enableNavigationControls={true}
        showNavInfo={false}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={80}
        cooldownTicks={200}
      />

      {/* Case title */}
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <div className="text-white/90 text-lg font-bold tracking-wide">
          🔒 Operation Hydra — Polizeilicher Knowledge Graph
        </div>
        <div className="text-white/50 text-xs mt-1">
          Grenzüberschreitende OK · Cybercrime · Geldwäsche · BtM · Krypto-Forensik
        </div>
        <div className="text-white/30 text-[10px] mt-0.5">
          {graphData.nodes.length} Entitäten · {graphData.links.length} Beziehungen · STIX 2.1 / XPolizei 2.0
        </div>
        <div className="text-white/20 text-[9px] mt-0.5">
          Quellen: BKA, DOJ, OFAC, Chainalysis, Elliptic, TRM Labs, Gwern
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors backdrop-blur-sm cursor-pointer"
          title="Reset Ansicht"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors backdrop-blur-sm cursor-pointer"
          title={isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Legend */}
      {(() => {
        const typeCounts: Record<string, number> = {}
        graphData.nodes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] || 0) + 1 })
        // Only show types that actually exist in the graph, sorted by count desc
        const activeTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
        return (
          <div className="absolute bottom-4 left-4 pointer-events-none select-none">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-white/10 p-3 max-w-lg">
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-semibold mb-2">
                Legende — {graphData.nodes.length} Entitäten · {graphData.links.length} Relationen
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {activeTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: NODE_COLORS[type as NodeType] }}
                    />
                    <span className="text-[10px] text-white/60 whitespace-nowrap">
                      {NODE_LABELS[type as NodeType]} <span className="text-white/30">({count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Interaction hint */}
      {!selectedNode && (
        <div className="absolute bottom-4 right-4 text-white/40 text-xs pointer-events-none text-right select-none">
          Klick = Auswählen · Ziehen = Drehen · Scrollen = Zoom
        </div>
      )}

      {/* Detail panel */}
      {selectedNode && (() => {
        // Classify related links by the type of the connected node
        const categorized: { link: GraphLink; other: GraphNode; isOutgoing: boolean; category: string }[] = []
        relatedLinks.forEach(link => {
          const sourceId = getLinkSourceId(link)
          const targetId = getLinkTargetId(link)
          const isOutgoing = sourceId === selectedNode.id
          const otherId = isOutgoing ? targetId : sourceId
          const otherNode = graphData.nodes.find(n => n.id === otherId)
          if (!otherNode) return
          let category: string
          switch (otherNode.type) {
            case 'law': category = 'law'; break
            case 'regulation': category = 'regulation'; break
            case 'process': category = 'process'; break
            case 'sop': category = 'sop'; break
            case 'anzeige': category = 'anzeige'; break
            default: category = 'other'; break
          }
          categorized.push({ link, other: otherNode, isOutgoing, category })
        })

        const lawLinks = categorized.filter(c => c.category === 'law')
        const regLinks = categorized.filter(c => c.category === 'regulation')
        const procLinks = categorized.filter(c => c.category === 'process')
        const sopLinks = categorized.filter(c => c.category === 'sop')
        const anzeigeLinks = categorized.filter(c => c.category === 'anzeige')
        const otherLinks = categorized.filter(c => c.category === 'other')

        // Determine timestamp: explicit field, or well-known detail keys
        const timestamp = selectedNode.timestamp
          || selectedNode.details?.['Datum']
          || selectedNode.details?.['Beginn']
          || selectedNode.details?.['In Kraft']
          || selectedNode.details?.['Durchsuchung']
          || selectedNode.details?.['Einsatz seit']
          || selectedNode.details?.['Gründung']
          || selectedNode.details?.['Aussage']

        const sources = SOURCE_REGISTRY[selectedNode.id] || []

        const renderGroup = (
          title: string,
          icon: string,
          items: typeof categorized,
          borderBottom = true
        ) => {
          if (items.length === 0) return null
          return (
            <div className={`px-4 py-3 ${borderBottom ? 'border-b border-white/10' : ''}`}>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                {icon} {title} ({items.length})
              </div>
              <div className="space-y-1">
                {items.map(({ link, other, isOutgoing }, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateToNode(other.id)}
                    className="w-full text-left rounded-lg p-2 hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: NODE_COLORS[other.type] }}
                      />
                      <span className="text-xs font-medium group-hover:text-amber-400 transition-colors truncate">
                        {other.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isOutgoing ? 'bg-amber-500/15 text-amber-400/80' : 'bg-cyan-500/15 text-cyan-400/80'}`}>
                        {isOutgoing ? '→' : '←'} {link.type}
                      </span>
                      {link.description && (
                        <span className="text-[10px] text-white/40 truncate">
                          {link.description}
                        </span>
                      )}
                    </div>
                    {other.description && (
                      <div className="text-[10px] text-white/30 ml-5 mt-0.5 leading-relaxed">{other.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        }

        return (
        <div className="absolute top-16 right-4 w-96 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl text-white">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/98 backdrop-blur-md p-4 border-b border-white/10 z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                />
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 flex-shrink-0">
                  {NODE_LABELS[selectedNode.type]}
                </span>
              </div>
              <button
                onClick={clearSelection}
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
            <h3 className="text-base font-bold mt-2 leading-tight">{selectedNode.label}</h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">{selectedNode.description}</p>
            {selectedNode.score != null && (
              <div className="mt-2 px-2 py-1.5 rounded-md bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Wahrscheinlichkeits-Score</span>
                  <span className={`text-xs font-bold ${
                    selectedNode.score >= 80 ? 'text-red-400' : selectedNode.score >= 60 ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    {selectedNode.score}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedNode.score}%`,
                      backgroundColor: selectedNode.score >= 80 ? '#ef4444' : selectedNode.score >= 60 ? '#f59e0b' : '#6366f1',
                    }}
                  />
                </div>
                <div className="text-[10px] text-white/30 mt-1">
                  {selectedNode.score >= 80 ? 'Sehr hohe Fallrelevanz' : selectedNode.score >= 60 ? 'Mittlere bis hohe Fallrelevanz' : 'Fallrelevanz wird geprüft'}
                </div>
              </div>
            )}
            {timestamp && (
              <div className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px]">📅</span>
                <span className="text-xs text-amber-400/90 font-medium">{timestamp}</span>
              </div>
            )}
          </div>

          {/* Details */}
          {selectedNode.details && Object.keys(selectedNode.details).length > 0 && (
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                📋 Details ({Object.keys(selectedNode.details).length} Felder)
              </div>
              <div className="space-y-1.5">
                {Object.entries(selectedNode.details).map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-xs p-1.5 rounded-md hover:bg-white/5 transition-colors">
                    <span className="text-white/50 flex-shrink-0 min-w-[100px] font-medium">{key}:</span>
                    <span className="text-white/90 break-words">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection summary */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              🔗 Verbindungen ({relatedLinks.length})
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const incoming = categorized.filter(c => !c.isOutgoing).length
                const outgoing = categorized.filter(c => c.isOutgoing).length
                const uniqueTypes = new Set(categorized.map(c => c.other.type)).size
                return (
                  <>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-sm font-bold text-cyan-400">{incoming}</div>
                      <div className="text-[9px] text-white/40">Eingehend</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-sm font-bold text-amber-400">{outgoing}</div>
                      <div className="text-[9px] text-white/40">Ausgehend</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/5">
                      <div className="text-sm font-bold text-emerald-400">{uniqueTypes}</div>
                      <div className="text-[9px] text-white/40">Typen</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {sources.length > 0 && (
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Quellen</div>
              <div className="space-y-1.5">
                {sources.map((source, idx) => (
                  <div key={idx} className="text-xs text-white/80">
                    <div className="text-white/90">• {source.title}</div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-300 hover:text-cyan-200 underline break-all"
                      >
                        {source.url}
                      </a>
                    )}
                    {source.futureSource && (
                      <div className="text-[11px] text-amber-300/90">Künftige Quelle: {source.futureSource}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorized link groups */}
          {renderGroup('Gesetze', '⚖️', lawLinks)}
          {renderGroup('Regulierungen & Richtlinien', '📜', regLinks)}
          {renderGroup('Prozesse & Verfahren', '🔄', procLinks)}
          {renderGroup('SOPs & Leitfäden', '📖', sopLinks)}
          {renderGroup('Anzeigen (Internet/App)', '📝', anzeigeLinks)}
          {renderGroup('Beziehungen', '🔗', otherLinks, false)}
        </div>
        )
      })()}
    </div>
  )
}
