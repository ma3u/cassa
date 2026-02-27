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
// Complex police case: "Operation Hydra"
// ────────────────────────────────────────────
function buildCaseData(): GraphData {
  const nodes: GraphNode[] = [
    // CASES
    { id: 'case-hydra', label: 'OP Hydra', type: 'case', description: 'Hauptverfahren: Grenzüberschreitende Organisierte Kriminalität', details: { 'Aktenzeichen': '4 StR 23/2024', 'Status': 'Laufend', 'Beginn': '12.01.2024', 'Sachbearbeiter': 'KHK Müller, LKA Hamburg' } },
    { id: 'case-cyber', label: 'Cybercrime-Komplex', type: 'case', description: 'Ransomware-Angriffe auf kritische Infrastruktur', details: { 'Aktenzeichen': '6 Js 482/24', 'Status': 'Verbunden mit OP Hydra', 'Delikte': 'Computersabotage, Erpressung' } },
    { id: 'case-launder', label: 'Geldwäsche-Komplex', type: 'case', description: 'Internationale Geldwäsche über Krypto und Scheinfirmen', details: { 'Aktenzeichen': '3 Ws 117/24', 'Status': 'Ermittlung', 'Volumen': 'ca. 47 Mio. EUR' } },
    { id: 'case-btm', label: 'BtM-Verfahren', type: 'case', description: 'Handel mit Betäubungsmitteln über Darknet', details: { 'Aktenzeichen': '2 StR 89/24', 'Delikte': '§29a BtMG', 'Menge': '145 kg Kokain, 23 kg Heroin' } },

    // SUSPECTS
    { id: 'sus-wolf', label: 'Viktor "Wolf" Sokolov', type: 'suspect', description: 'Hauptverdächtiger, mutmaßlicher Kopf der Organisation', details: { 'Geburtsdatum': '14.03.1978', 'Nationalität': 'Russisch/Deutsch', 'Vorstrafen': '3 (Betrug, GBH, BtM)', 'Status': 'U-Haft seit 15.09.2024' } },
    { id: 'sus-maria', label: 'Maria Petrova', type: 'suspect', description: 'Finanzverwalterin des Netzwerks', details: { 'Geburtsdatum': '22.07.1985', 'Nationalität': 'Bulgarisch', 'Rolle': 'Finanzwesen / Geldwäsche', 'Status': 'Fahndung (SIS-Ausschreibung)' } },
    { id: 'sus-kadir', label: 'Kadir Yılmaz', type: 'suspect', description: 'Logistik und Transport', details: { 'Geburtsdatum': '08.11.1990', 'Nationalität': 'Deutsch/Türkisch', 'Rolle': 'Transportlogistik', 'Status': 'Observiert' } },
    { id: 'sus-leon', label: 'Leon "Byte" Krause', type: 'suspect', description: 'IT-Spezialist, Ransomware-Entwickler', details: { 'Geburtsdatum': '30.05.1995', 'Nationalität': 'Deutsch', 'Rolle': 'Cybercrime / Ransomware', 'Status': 'Festgenommen am 03.10.2024' } },
    { id: 'sus-anna', label: 'Anna Bergmann', type: 'suspect', description: 'Strohfrau für Scheinfirmen', details: { 'Geburtsdatum': '17.12.1992', 'Nationalität': 'Deutsch', 'Rolle': 'Geschäftsführerin Scheinfirmen', 'Status': 'Kooperiert (§46b StGB)' } },
    { id: 'sus-dmitri', label: 'Dmitri Volkov', type: 'suspect', description: 'Kontaktmann in Osteuropa', details: { 'Geburtsdatum': '02.09.1980', 'Nationalität': 'Ukrainisch', 'Rolle': 'Lieferant / Kontakte', 'Status': 'Europol Red Notice' } },
    { id: 'sus-hassan', label: 'Hassan Al-Rashid', type: 'suspect', description: 'BtM-Vertrieb Westdeutschland', details: { 'Geburtsdatum': '19.06.1988', 'Nationalität': 'Libanesisch/Deutsch', 'Rolle': 'Drogenvertrieb', 'Status': 'Observiert' } },

    // VICTIMS / WITNESSES
    { id: 'vic-hospital', label: 'Klinikum Nord', type: 'victim', description: 'Opfer des Ransomware-Angriffs', details: { 'Schaden': '2,3 Mio. EUR', 'Ausfallzeit': '12 Tage', 'Patienten betroffen': 'ca. 4.500' } },
    { id: 'vic-stadtwerk', label: 'Stadtwerke Kiel', type: 'victim', description: 'Opfer des Ransomware-Angriffs', details: { 'Schaden': '890.000 EUR', 'Systeme': 'SCADA-Systeme kompromittiert' } },
    { id: 'wit-informant', label: 'V-Mann "Adler"', type: 'witness', description: 'Verdeckter Ermittler / Vertrauensperson', details: { 'Einsatz seit': 'März 2023', 'Geführt durch': 'LKA Hamburg' } },
    { id: 'wit-neighbor', label: 'Zeuge K. Schmidt', type: 'witness', description: 'Nachbarin, beobachtete Übergabe', details: { 'Aussage': '15.08.2024', 'Beobachtung': 'Verdächtige Pakete' } },
    { id: 'wit-banker', label: 'Zeuge M. Fischer', type: 'witness', description: 'Bankangestellter, meldete Verdacht', details: { 'Verdachtsmeldung': '§43 GwG', 'Datum': '22.06.2024' } },

    // ORGANIZATIONS
    { id: 'org-phoenix', label: 'Phoenix Consulting GmbH', type: 'organization', description: 'Scheinfirma für Geldwäsche', details: { 'Sitz': 'Frankfurt am Main', 'GF': 'Anna Bergmann', 'Gründung': '2022', 'Umsatz': '12,4 Mio. EUR (fiktiv)' } },
    { id: 'org-baltic', label: 'Baltic Trade OÜ', type: 'organization', description: 'Scheinfirma in Estland', details: { 'Sitz': 'Tallinn', 'Status': 'Aktiv', 'Zweck': 'Import/Export (Tarnung)' } },
    { id: 'org-nova', label: 'Nova Digital Solutions', type: 'organization', description: 'IT-Firma als Tarnunternehmen', details: { 'Sitz': 'Berlin', 'GF': 'Leon Krause', 'Mitarbeiter': '3 (Scheinstellen)' } },
    { id: 'org-crypto', label: 'CryptoMix Exchange', type: 'organization', description: 'Kryptobörse ohne Lizenz', details: { 'Sitz': 'Seychellen', 'Volumen': '> 200 Mio. EUR', 'Status': 'Von BaFin gemeldet' } },
    { id: 'org-europol', label: 'Europol', type: 'organization', description: 'Koordinierende Behörde', details: { 'Dienststelle': 'EC3 / EMSC', 'Vorgang': 'SIENA Ref. 2024-HH-4821' } },

    // EVIDENCE
    { id: 'evi-phone1', label: 'iPhone 15 Pro (Sokolov)', type: 'evidence', description: 'Sichergestelltes Mobiltelefon', details: { 'Asservat-Nr': 'AS-2024-0847', 'Cellebrite': 'Extraktion abgeschlossen', 'Inhalte': '14.832 Nachrichten, 2.341 Bilder' } },
    { id: 'evi-laptop', label: 'ThinkPad X1 (Krause)', type: 'evidence', description: 'Laptop mit Ransomware-Quellcode', details: { 'Asservat-Nr': 'AS-2024-1203', 'Verschlüsselung': 'VeraCrypt (entschlüsselt)', 'Fund': 'Ransomware-Builder, C2-Config' } },
    { id: 'evi-usb', label: 'USB-Stick (Tresor)', type: 'evidence', description: 'Verschlüsselter USB mit Finanzdaten', details: { 'Asservat-Nr': 'AS-2024-0912', 'Inhalt': 'Buchhaltung Scheinfirmen', 'Kapazität': '256 GB' } },
    { id: 'evi-docs', label: 'Falsche Pässe (3x)', type: 'evidence', description: 'Gefälschte Identitätsdokumente', details: { 'Asservat-Nr': 'AS-2024-0955', 'Ausgestellt auf': 'Sokolov (3 Alias-Identitäten)' } },
    { id: 'evi-cash', label: 'Bargeld 340.000 EUR', type: 'evidence', description: 'Sichergestelltes Bargeld', details: { 'Asservat-Nr': 'AS-2024-1105', 'Fundort': 'Wohnung Hamburg-Altona', 'Stückelung': '500er und 200er Scheine' } },
    { id: 'evi-server', label: 'C2-Server (beschlagnahmt)', type: 'evidence', description: 'Command & Control Server', details: { 'IP': '185.XXX.XXX.42', 'Standort': 'Rechenzentrum Bukarest', 'Status': 'Forensische Analyse' } },
    { id: 'evi-cctv', label: 'CCTV-Aufnahmen Hafen', type: 'evidence', description: 'Videoaufnahmen der Übergabe', details: { 'Datum': '12.08.2024', 'Ort': 'Hamburger Hafen, Terminal 7', 'Dauer': '4h 23min' } },

    // DRUGS
    { id: 'drug-cocaine', label: '145 kg Kokain', type: 'drug', description: 'Sichergestelltes Kokain', details: { 'Reinheitsgrad': '87%', 'Straßenwert': 'ca. 7,2 Mio. EUR', 'Herkunft': 'Kolumbien (Isotopenanalyse)' } },
    { id: 'drug-heroin', label: '23 kg Heroin', type: 'drug', description: 'Sichergestelltes Heroin', details: { 'Reinheitsgrad': '64%', 'Straßenwert': 'ca. 1,8 Mio. EUR', 'Herkunft': 'Afghanistan via Türkei' } },

    // WEAPONS
    { id: 'wea-glock', label: 'Glock 19 (modifiziert)', type: 'weapon', description: 'Illegale Schusswaffe', details: { 'Seriennummer': 'Entfernt', 'Ballistische Spur': 'Match mit Fall 2023-BW-112' } },
    { id: 'wea-ak', label: 'AK-Pattern Sturmgewehr', type: 'weapon', description: 'Vollautomatische Waffe', details: { 'Herkunft': 'Westbalkan', 'Status': 'Sichergestellt bei Durchsuchung' } },

    // LOCATIONS
    { id: 'loc-hamburg', label: 'Hamburg-Altona (Wohnung)', type: 'location', description: 'Hauptwohnsitz Sokolov', details: { 'Adresse': 'Altonaer Str. XXX', 'Durchsuchung': '15.09.2024', 'Ergebnis': 'Bargeld, Waffen, Dokumente' } },
    { id: 'loc-hafen', label: 'Hamburger Hafen', type: 'location', description: 'Umschlagplatz für BtM', details: { 'Terminal': '7', 'Container': 'MSKU-2847561' } },
    { id: 'loc-berlin', label: 'Berlin-Mitte (Büro)', type: 'location', description: 'Büro Nova Digital Solutions', details: { 'Adresse': 'Friedrichstr. XXX', 'Durchsuchung': '03.10.2024' } },
    { id: 'loc-frankfurt', label: 'Frankfurt (Büro Phoenix)', type: 'location', description: 'Sitz der Scheinfirma', details: { 'Adresse': 'Mainzer Landstr. XXX' } },
    { id: 'loc-tallinn', label: 'Tallinn, Estland', type: 'location', description: 'Sitz Baltic Trade OÜ', details: { 'Kooperation': 'Estnische Polizei / Eurojust' } },
    { id: 'loc-bukarest', label: 'Bukarest (Rechenzentrum)', type: 'location', description: 'Standort des C2-Servers', details: { 'Kooperation': 'Rumänische DIICOT' } },

    // ACCOUNTS / FINANCE
    { id: 'acc-de1', label: 'Konto DE89 (Commerzbank)', type: 'account', description: 'Geschäftskonto Phoenix Consulting', details: { 'Kontoinhaber': 'Phoenix Consulting GmbH', 'Umsätze': '12,4 Mio. EUR (2023-2024)', 'Status': 'Eingefroren' } },
    { id: 'acc-ee1', label: 'Konto EE38 (LHV Pank)', type: 'account', description: 'Konto in Estland', details: { 'Kontoinhaber': 'Baltic Trade OÜ', 'Verdacht': 'Durchlaufkonto' } },
    { id: 'acc-ch1', label: 'Konto CH93 (UBS)', type: 'account', description: 'Schweizer Nummernkonto', details: { 'Guthaben': '3,2 Mio. CHF', 'Status': 'RH-Ersuchen gestellt' } },
    { id: 'acc-paypal1', label: 'PayPal-Konto (maria.p@...)', type: 'account', description: 'Mutmaßlich genutztes E-Geld-Konto für Micro-Layering', details: { 'Kontoinhaber': 'Alias "M. Petrova"', 'Transaktionen': '312 (2023-2024)', 'Volumen': 'ca. 186.000 EUR', 'Status': 'Auskunftsersuchen über StA anhängig', 'Rechtlicher Hinweis': 'Abruf nur bei Anfangsverdacht und Verhältnismäßigkeit, i.d.R. über StA/Beschluss' } },
    { id: 'acc-btc', label: 'Bitcoin Wallet (bc1q...x7f)', type: 'account', description: 'Kryptowallet für Ransomware-Lösegelder', details: { 'Eingänge': '184 BTC', 'Chain Analysis': 'Verbindung zu CryptoMix' } },
    { id: 'acc-monero', label: 'Monero Wallet', type: 'account', description: 'Privacycoin für Verschleierung', details: { 'Geschätztes Volumen': '> 2 Mio. EUR', 'Status': 'Tracking schwierig' } },

    // COMMUNICATION
    { id: 'com-tkue1', label: 'TKÜ Sokolov', type: 'communication', description: 'Telefonüberwachung', details: { 'Anordnung': 'AG Hamburg, 03.05.2024', 'Dauer': '3 Monate (verlängert)', 'Gespräche': '2.841' } },
    { id: 'com-encro', label: 'EncroChat-Daten', type: 'communication', description: 'Entschlüsselte Nachrichten', details: { 'Handle': 'WolfDEN', 'Nachrichten': '4.221', 'Quelle': 'Europol / JIT' } },
    { id: 'com-signal', label: 'Signal-Nachrichten', type: 'communication', description: 'Extrahiert aus Mobiltelefon', details: { 'Gruppen': '7', 'Nachrichten': '8.932', 'Zeitraum': '2023-2024' } },
    { id: 'com-email', label: 'ProtonMail Korrespondenz', type: 'communication', description: 'E-Mail-Verkehr der Scheinfirmen', details: { 'Konten': '4', 'E-Mails': '1.247', 'Quelle': 'Laptop Krause' } },
    { id: 'com-darknet', label: 'Darknet-Forum Posts', type: 'communication', description: 'Beiträge in Untergrund-Foren', details: { 'Username': 'ByteL0rd', 'Posts': '89', 'Forum': 'BreachForums' } },

    // DIGITAL
    { id: 'dig-ransomware', label: 'Ransomware "HydraLock"', type: 'digital', description: 'Entwickelte Schadsoftware', details: { 'Varianten': '3', 'Bekannte Opfer': '14 (europaweit)', 'Lösegeldforderung': '50-500 BTC' } },
    { id: 'dig-vpn', label: 'VPN-Infrastruktur', type: 'digital', description: 'Proton VPN + eigene VPS', details: { 'Server': '8 Standorte', 'Zweck': 'Anonymisierung' } },
    { id: 'dig-blockchain', label: 'Blockchain-Analyse', type: 'digital', description: 'Chainalysis Reactor Ergebnisse', details: { 'Transaktionen': '2.341 analysiert', 'Cluster': '12 identifiziert' } },
    { id: 'dig-social-osint', label: 'Social-Media-OSINT', type: 'digital', description: 'Offene Daten aus Social Media (OSINT) zur Netzwerkanalyse', details: { 'Plattformen': 'Instagram, Telegram, TikTok, X', 'Artefakte': 'Profile, Handles, Kontakte, Zeitmuster', 'Hinweis': 'Nur offen zugängliche Daten + richterlich angeordnete Maßnahmen bei geschützten Inhalten' } },
    { id: 'dig-gps-timeline', label: 'GPS-/Standort-Timeline', type: 'digital', description: 'Zusammenführung von Fahrzeug-, Mobil- und Funkzellenstandorten', details: { 'Zeitraum': '04/2024-10/2024', 'Genutzte Quellen': 'GPS-Tracker, CDR/Funkzelle, ANPR, CCTV-Metadaten', 'Nutzen': 'Tatortkorrelation und Bewegungsprofile' } },
    { id: 'evi-mobile-forensic', label: 'Mobile Forensik-Auszug', type: 'evidence', description: 'Extrahierte Daten aus Mobiltelefonen der Beschuldigten', details: { 'Datenarten': 'Chats, Medien, Kontakte, Geo-Metadaten', 'Geräte': '5 Smartphones', 'Status': 'Gerichtsverwertbar dokumentiert' } },
    { id: 'evi-computer-forensic', label: 'Computer-Forensik-Auszug', type: 'evidence', description: 'Forensische Artefakte aus Laptops/Desktop-Systemen', details: { 'Datenarten': 'Dateisystem, Browser, Mailboxen, Wallet-Dateien', 'Systeme': '3 Laptops, 1 Workstation', 'Status': 'Hash-gesichert, Chain of Custody vollständig' } },

    // VEHICLES
    { id: 'veh-bmw', label: 'BMW X5 (HH-VS 814)', type: 'vehicle', description: 'Fahrzeug Sokolov', details: { 'Halter': 'Phoenix Consulting GmbH', 'GPS-Tracker': 'Installiert seit 04/2024' } },
    { id: 'veh-sprinter', label: 'Mercedes Sprinter (HH-KY 221)', type: 'vehicle', description: 'Transportfahrzeug', details: { 'Halter': 'Kadir Yılmaz', 'Einsatz': 'BtM-Transport' } },
    { id: 'veh-audi', label: 'Audi RS6 (B-LK 9911)', type: 'vehicle', description: 'Fahrzeug Krause', details: { 'Halter': 'Nova Digital Solutions', 'Wert': '145.000 EUR' } },

    // LAWS
    { id: 'law-100a', label: '§100a StPO', type: 'law', description: 'TKÜ-Anordnung', details: { 'Anwendung': 'Sokolov, Yılmaz', 'Beschluss': 'AG Hamburg' } },
    { id: 'law-100b', label: '§100b StPO', type: 'law', description: 'Online-Durchsuchung', details: { 'Anwendung': 'Krause (Laptop)', 'Beschluss': 'LG Hamburg' } },
    { id: 'law-261', label: '§261 StGB', type: 'law', description: 'Geldwäsche', details: { 'Betroffene': 'Sokolov, Petrova, Bergmann' } },
    { id: 'law-29a', label: '§29a BtMG', type: 'law', description: 'Unerlaubter Handel (nicht geringe Menge)', details: { 'Betroffene': 'Sokolov, Yılmaz, Al-Rashid, Volkov' } },
    { id: 'law-303b', label: '§303b StGB', type: 'law', description: 'Computersabotage', details: { 'Betroffene': 'Krause', 'Opfer': 'Klinikum Nord, Stadtwerke Kiel' } },
    { id: 'law-129', label: '§129 StGB', type: 'law', description: 'Kriminelle Vereinigung', details: { 'Betroffene': 'Alle Hauptverdächtigen' } },
    { id: 'law-161', label: '§161 StPO', type: 'law', description: 'Ermittlungsbefugnisse der Staatsanwaltschaft (Auskunftsersuchen)', details: { 'Relevanz': 'Bank-/E-Geld-/Plattformauskünfte im Ermittlungsverfahren', 'Wichtig': 'Verhältnismäßigkeit, Zweckbindung, richterliche Anordnung je nach Eingriffsintensität' } },
    { id: 'law-94', label: '§94 StPO', type: 'law', description: 'Sicherstellung und Beschlagnahme von Beweismitteln', details: { 'Relevanz': 'Geräte, Datenträger, Dokumente, Zugangsdaten', 'Wichtig': 'Beweiskette und richterliche Kontrolle nach Maßgabe StPO' } },

    // REGULATIONS & EU DIRECTIVES
    { id: 'reg-nis2', label: 'NIS2-Richtlinie', type: 'regulation', description: 'EU-Richtlinie 2022/2555 – Netz- und Informationssicherheit', timestamp: '16.01.2023 (in Kraft)', details: { 'Kurzbezeichnung': 'NIS2', 'Vollständiger Titel': 'Richtlinie (EU) 2022/2555 über Maßnahmen für ein hohes gemeinsames Cybersicherheitsniveau', 'In Kraft': '16.01.2023', 'Umsetzungsfrist': '17.10.2024', 'Sektoren': 'Energie, Verkehr, Gesundheit, Wasser, Digitale Infrastruktur, öffentliche Verwaltung, Weltraum', 'Wesentliche Pflichten': 'Risikomanagement, Meldepflichten (24h/72h), Lieferkettensicherheit, Geschäftsführerhaftung', 'Sanktionen': 'Bis 10 Mio. EUR oder 2% des weltweiten Jahresumsatzes' } },
    { id: 'reg-nis2umsucg', label: 'NIS2UmsuCG', type: 'regulation', description: 'NIS2-Umsetzungs- und Cybersicherheitsstärkungsgesetz (Deutschland)', timestamp: '2024 (Entwurf)', details: { 'Status': 'Gesetzentwurf / Parlamentarisches Verfahren', 'Zweck': 'Nationale Umsetzung der NIS2-Richtlinie', 'Ändert': 'BSI-Gesetz, EnWG, TKG, SGB V u.a.', 'Betroffene Einrichtungen': 'ca. 29.000 in Deutschland', 'Neue Pflichten': 'Registrierungspflicht, erweiterte Meldepflichten, Nachweispflichten' } },
    { id: 'reg-bsig', label: 'BSI-Gesetz (BSIG)', type: 'regulation', description: 'Gesetz über das Bundesamt für Sicherheit in der Informationstechnik', timestamp: '14.08.2009', details: { 'Kurzbezeichnung': 'BSIG', 'Relevante Paragraphen': '§8a (KRITIS-Sicherheit), §8b (Meldepflicht), §8c (Besondere Anforderungen)', 'Zuständige Behörde': 'BSI (Bundesamt für Sicherheit in der Informationstechnik)', 'KRITIS-Schwellenwerte': 'Definiert in BSI-KritisV' } },
    { id: 'reg-kritisv', label: 'BSI-KritisV', type: 'regulation', description: 'Verordnung zur Bestimmung Kritischer Infrastrukturen (KRITIS-Verordnung)', timestamp: '22.04.2016', details: { 'Sektoren': 'Energie, Wasser, Ernährung, IT/TK, Gesundheit, Finanz-/Versicherungswesen, Transport/Verkehr, Siedlungsabfallentsorgung', 'Schwellenwerte Gesundheit': '30.000 vollstationäre Fälle/Jahr', 'Schwellenwerte Energie': '104 MW Nennleistung', 'Meldepflicht': 'Unverzüglich an BSI (§8b Abs. 4 BSIG)' } },
    { id: 'reg-dsgvo', label: 'DSGVO', type: 'regulation', description: 'Datenschutz-Grundverordnung (EU 2016/679)', timestamp: '25.05.2018 (Anwendung)', details: { 'Kurzbezeichnung': 'DSGVO / GDPR', 'Relevante Artikel': 'Art. 32 (Sicherheit), Art. 33 (Meldung Aufsichtsbehörde, 72h), Art. 34 (Benachrichtigung Betroffener)', 'Sanktionen': 'Bis 20 Mio. EUR oder 4% des weltweiten Jahresumsatzes', 'Aufsichtsbehörde': 'Landesdatenschutzbeauftragte / BfDI', 'Relevanz im Fall': 'Patientendaten Klinikum Nord, Kundendaten Stadtwerke Kiel' } },
    { id: 'reg-eucsa', label: 'EU Cybersecurity Act', type: 'regulation', description: 'Verordnung (EU) 2019/881 – ENISA und Cybersicherheitszertifizierung', timestamp: '27.06.2019', details: { 'Kurzbezeichnung': 'EU CSA', 'Kernelemente': 'Permanentes Mandat für ENISA, EU-weiter Zertifizierungsrahmen', 'Zertifizierungsschemata': 'EUCC, EUCS, EU5G', 'Relevanz': 'Rahmen für KRITIS-Zertifizierung und Sicherheitsstandards' } },
    { id: 'reg-itsig2', label: 'IT-SiG 2.0', type: 'regulation', description: 'IT-Sicherheitsgesetz 2.0 – Novelle des BSIG', timestamp: '28.05.2021', details: { 'Kernelemente': 'Erweiterung BSI-Befugnisse, Unternehmen im besonderen öffentlichen Interesse (UBI), Angriffserkennung (SzA)', 'Neuer Sektor': 'Siedlungsabfallentsorgung als KRITIS', 'Meldepflicht UBI': 'Selbsterklärung zur IT-Sicherheit alle 2 Jahre', 'Angriffserkennung': 'Pflicht ab 01.05.2023 für KRITIS-Betreiber (§8a Abs. 1a BSIG)' } },
    { id: 'reg-eudora', label: 'EU DORA', type: 'regulation', description: 'Digital Operational Resilience Act (EU 2022/2554)', timestamp: '17.01.2025 (Anwendung)', details: { 'Kurzbezeichnung': 'DORA', 'Zielgruppe': 'Finanzsektor (Banken, Versicherungen, Zahlungsdienstleister)', 'Kernpflichten': 'IKT-Risikomanagement, Incident Reporting, Resilienztests, Third-Party-Risk', 'Relevanz im Fall': 'CryptoMix Exchange, Bankkonten, Geldwäsche-Infrastruktur' } },
    { id: 'reg-ecidir', label: 'EU CER-Richtlinie', type: 'regulation', description: 'Richtlinie (EU) 2022/2557 – Resilienz kritischer Einrichtungen', timestamp: '16.01.2023', details: { 'Kurzbezeichnung': 'CER-Richtlinie (ehem. ECI)', 'Zweck': 'Physische Resilienz kritischer Einrichtungen (Pendant zu NIS2 für physische Sicherheit)', 'Sektoren': '11 Sektoren inkl. Energie, Verkehr, Gesundheit, Wasser, Digitale Infrastruktur', 'Pflichten': 'Risikobewertung, Resilienzpläne, Meldepflichten für Vorfälle' } },
    { id: 'reg-xpolizei', label: 'XPolizei Datenstandard', type: 'regulation', description: 'Semantischer Standard für strukturierte Polizeidaten und Datenaustausch', timestamp: 'Versioniert (laufend)', details: { 'Zweck': 'Interoperabilität zwischen Fachverfahren und Behörden', 'Kernobjekte': 'Person, Vorgang, Delikt, Maßnahme, Beweismittel, Ort, Zeit', 'Nutzen': 'Einheitliche Fallstammdaten, bessere Auswertung, weniger Medienbrüche' } },

    // PROCESSES (Ermittlungs- und Verwaltungsprozesse)
    { id: 'proc-meldepflicht', label: 'KRITIS-Meldepflicht', type: 'process', description: 'Meldepflicht nach §8b BSIG / Art. 23 NIS2', timestamp: 'Fortlaufend', details: { 'Frühwarnung': 'Innerhalb von 24 Stunden nach Kenntnis', 'Erstmeldung': 'Innerhalb von 72 Stunden', 'Abschlussbericht': 'Innerhalb von 1 Monat', 'Meldeweg': 'BSI-Meldestelle über Online-Portal oder CERT-Bund', 'NIS2 Verschärfung': 'Erweiterter Anwendungsbereich, strengere Fristen', 'Falls anwendbar': 'Klinikum Nord und Stadtwerke Kiel als KRITIS-Betreiber' } },
    { id: 'proc-incident', label: 'Incident Response', type: 'process', description: 'Strukturiertes Vorgehen bei Cybersicherheitsvorfällen', timestamp: 'Aktiviert 23.07.2024', details: { 'Phase 1': 'Erkennung & Identifizierung', 'Phase 2': 'Eindämmung (Containment)', 'Phase 3': 'Beseitigung (Eradication)', 'Phase 4': 'Wiederherstellung (Recovery)', 'Phase 5': 'Nachbereitung (Lessons Learned)', 'Standard': 'BSI IT-Grundschutz / NIST SP 800-61', 'Team': 'CERT-Bund, LKA Cybercrime, BSI Mobile Incident Response Team (MIRT)' } },
    { id: 'proc-forensik', label: 'Digitale Forensik', type: 'process', description: 'Forensische Sicherung und Auswertung digitaler Beweismittel', timestamp: 'Laufend seit 15.09.2024', details: { 'Identifizierung': 'Datenträger und Geräte sicherstellen', 'Sicherung': 'Forensische Images (bitgenau, hashverifiziert)', 'Analyse': 'Artefakt-Extraktion, Timeline-Analyse, Malware-RE', 'Dokumentation': 'Lückenlose Beweiskette (Chain of Custody)', 'Tools': 'Cellebrite UFED, X-Ways Forensics, Volatility, AXIOM', 'Leitlinie': 'BSI-Leitfaden IT-Forensik, ISO 27037' } },
    { id: 'proc-rechtshilfe', label: 'Internationale Rechtshilfe', type: 'process', description: 'Grenzüberschreitende Zusammenarbeit über Eurojust/Europol', timestamp: 'Aktiv seit 06/2024', details: { 'JIT': 'Joint Investigation Team (DE, EE, RO, BG)', 'Eurojust': 'Koordinierungstreffen quartalsweise', 'EEA': 'Europäische Ermittlungsanordnung (4 aktiv)', 'RH-Ersuchen': 'Estland (Baltic Trade), Rumänien (C2-Server), Schweiz (UBS-Konto)', 'SIENA': 'Secured Information Exchange via Europol', 'Beteiligung': 'LKA Hamburg, BKA Abt. SO, Europol EC3' } },
    { id: 'proc-bafin', label: 'BaFin-Meldeverfahren', type: 'process', description: 'Verdachtsmeldung nach §43 GwG an FIU/BaFin', timestamp: '22.06.2024', details: { 'Rechtsgrundlage': '§43 GwG (Geldwäschegesetz)', 'Melder': 'Commerzbank (Compliance-Abteilung)', 'Empfänger': 'FIU (Financial Intelligence Unit)', 'Verdacht': 'Auffällige Transaktionsmuster Phoenix Consulting', 'Auslöser': 'Hohe Bareinzahlungen, Round-Tripping EE↔DE↔CH', 'Folgemaßnahmen': 'Kontoeinfrierung, Ermittlungsverfahren §261 StGB' } },
    { id: 'proc-art33', label: 'DSGVO Art. 33/34 Meldung', type: 'process', description: 'Datenschutzverletzung: Meldung an Aufsichtsbehörde und Betroffene', timestamp: '24.07.2024', details: { 'Art. 33': 'Meldung an Aufsichtsbehörde innerhalb 72h', 'Art. 34': 'Benachrichtigung betroffener Personen unverzüglich', 'Klinikum Nord': 'ca. 4.500 Patientendatensätze betroffen', 'Stadtwerke Kiel': 'Kundendaten potenziell kompromittiert', 'Aufsichtsbehörde': 'ULD Schleswig-Holstein / HmbBfDI', 'Status': 'Meldungen erfolgt, Bußgeldverfahren offen' } },
    { id: 'proc-fallstandard', label: 'Fallstammdaten-Standard', type: 'process', description: 'Verbindliche Mindestdaten pro Ermittlungsfall', timestamp: 'Qualitätsprozess laufend', details: { 'Pflichtfelder': 'Aktenzeichen, Delikt(e), Tatzeitraum, Tatort, Beteiligte/Rollen, Maßnahmenhistorie', 'Erweitert': 'Beweismittelkette, Geräte-IDs, Kontobeziehungen, Kommunikationskanäle, Standortdaten', 'Qualität': 'Plausibilitätsprüfung, Dublettenprüfung, Quellenkennzeichnung' } },

    // STANDARD OPERATING PROCEDURES (SOPs)
    { id: 'sop-ransomware', label: 'SOP Ransomware-Lage', type: 'sop', description: 'Erstmaßnahmen bei Ransomware-Vorfällen in KRITIS-Umgebungen', timestamp: 'Version 4.2 / 01.03.2024', details: { 'Sofortmaßnahme 1': 'Netzwerksegmentierung: betroffene Systeme isolieren', 'Sofortmaßnahme 2': 'KEIN Lösegeld zahlen (BSI-Empfehlung)', 'Sofortmaßnahme 3': 'Meldung an BSI/CERT-Bund innerhalb 24h', 'Sofortmaßnahme 4': 'Strafanzeige bei zuständiger ZAC (Zentrale Ansprechstelle Cybercrime)', 'Beweissicherung': 'RAM-Dump vor Shutdown, Netzwerk-Traffic speichern', 'Wiederherstellung': 'Aus Offline-Backups, System-Rebuild', 'Grundlage': 'BSI Maßnahmenkatalog Ransomware, Allianz für Cybersicherheit' } },
    { id: 'sop-beweissicherung', label: 'SOP Digitale Beweissicherung', type: 'sop', description: 'Leitfaden zur gerichtsfesten Sicherung digitaler Beweismittel', timestamp: 'Version 3.1 / 15.06.2024', details: { 'Grundsatz 1': 'Originalbeweise nie direkt bearbeiten', 'Grundsatz 2': 'Bitgenaue forensische Kopie erstellen', 'Grundsatz 3': 'Hash-Werte dokumentieren (SHA-256)', 'Grundsatz 4': 'Lückenlose Chain of Custody führen', 'Grundsatz 5': 'Vier-Augen-Prinzip bei Sicherstellung', 'Tools': 'Write-Blocker, Cellebrite, FTK Imager, X-Ways', 'Norm': 'ISO 27037, BSI IT-Forensik Leitfaden' } },
    { id: 'sop-meldekette', label: 'SOP Meldekette KRITIS', type: 'sop', description: 'Meldekette bei IT-Sicherheitsvorfällen in Kritischen Infrastrukturen', timestamp: 'Version 2.4 / 01.01.2024', details: { 'Stufe 1 (sofort)': 'Interne IT-Sicherheit / CERT informieren', 'Stufe 2 (4h)': 'Geschäftsleitung / CISO informieren', 'Stufe 3 (24h)': 'BSI-Meldestelle (nach §8b BSIG / Art. 23 NIS2)', 'Stufe 4 (24h)': 'Datenschutzbehörde (falls personenbezogene Daten betroffen)', 'Stufe 5 (72h)': 'Vollständige Erstmeldung an BSI mit IoCs', 'Stufe 6 (1 Monat)': 'Abschlussbericht mit Root Cause Analysis', 'Parallel': 'Strafanzeige bei LKA/BKA ZAC' } },
    { id: 'sop-intl', label: 'SOP Internationale Kooperation', type: 'sop', description: 'Verfahren für grenzüberschreitende Ermittlungen in Cybercrime-Fällen', timestamp: 'Version 1.8 / 01.09.2023', details: { 'Kanal 1': 'Europol SIENA für Informationsaustausch', 'Kanal 2': 'Eurojust für Rechtshilfe-Koordinierung', 'Kanal 3': 'Interpol I-24/7 für globale Fahndung', 'JIT-Bildung': 'Über Eurojust mit beteiligten Staaten', 'EEA': 'Europäische Ermittlungsanordnung für Beweiserhebung im Ausland', 'MLATs': 'Gegenseitige Rechtshilfeübereinkommen für Nicht-EU-Staaten', 'Quick Freeze': 'Budapest-Konvention Art. 29 für Datensicherung' } },
    { id: 'sop-krypto', label: 'SOP Kryptoforensik', type: 'sop', description: 'Standard-Verfahren zur Analyse und Nachverfolgung von Kryptowährungstransaktionen', timestamp: 'Version 2.0 / 01.04.2024', details: { 'Schritt 1': 'Wallet-Adressen identifizieren und clustern', 'Schritt 2': 'Transaktionsgraph erstellen (Chainalysis/Elliptic)', 'Schritt 3': 'Mixer/Tumbler-Dienste identifizieren', 'Schritt 4': 'Fiat-Off-Ramps ermitteln (Exchanges mit KYC)', 'Schritt 5': 'Einfrierungsersuchen an Exchanges', 'Schritt 6': 'Zuordnung zu realen Identitäten', 'Herausforderung': 'Privacy Coins (Monero) – eingeschränkte Nachverfolgung' } },
    { id: 'sop-gwg', label: 'SOP Geldwäscheprävention', type: 'sop', description: 'Verfahren zur Erkennung und Meldung von Geldwäscheverdacht nach GwG', timestamp: 'Version 3.0 / 01.07.2024', details: { 'Erkennung': 'Typologien: Smurfing, Round-Tripping, Trade-Based ML', 'Analyse': 'Financial Intelligence – Kontobewegungen, Empfänger, Muster', 'Meldung': 'FIU-Verdachtsmeldung nach §43 GwG', 'Sicherung': 'Kontoeinfrierung / Vermögensbeschlagnahme (§111b StPO)', 'Kooperation': 'FATF, Egmont Group, EU FIU.net', 'Krypto-Bezug': 'MiCA-Verordnung, Transfer of Funds Regulation' } },

    // ANZEIGEN (Internet & App)
    { id: 'anz-internet-cyber', label: 'Online-Anzeige Ransomware', type: 'anzeige', description: 'Strafanzeige über Internetwache – Ransomware-Erpressung', timestamp: '23.07.2024, 14:32 Uhr', score: 94, details: { 'Kanal': 'Internetwache Schleswig-Holstein', 'Anzeigende': 'Klinikum Nord (IT-Leitung)', 'Delikte': '§303a/b StGB, §253 StGB (Erpressung)', 'Vorgangsnr.': 'IW-SH-2024-0074821', 'Status': 'Aufgenommen → LKA Cybercrime', 'Wahrscheinlichkeits-Score': '94% – sehr hohe Fallrelevanz', 'Score-Begründung': 'Direkter Bezug: Opfer = KRITIS, Tatmittel = HydraLock, Tätergruppe identifiziert' } },
    { id: 'anz-internet-gw', label: 'Online-Anzeige Geldwäsche', type: 'anzeige', description: 'Strafanzeige über Internetwache – Verdacht der Geldwäsche', timestamp: '28.06.2024, 09:15 Uhr', score: 87, details: { 'Kanal': 'Internetwache Hessen', 'Anzeigende': 'Compliance-Abt. Commerzbank', 'Delikte': '§261 StGB (Geldwäsche)', 'Vorgangsnr.': 'IW-HE-2024-0031247', 'Status': 'Aufgenommen → StA Frankfurt', 'Wahrscheinlichkeits-Score': '87% – hohe Fallrelevanz', 'Score-Begründung': 'Geschäftskonto Phoenix GmbH, auffällige Muster, §43 GwG Parallelmeldung' } },
    { id: 'anz-internet-btm', label: 'Online-Anzeige BtM-Fund', type: 'anzeige', description: 'Strafanzeige über Internetwache – Fund verdächtiger Pakete', timestamp: '16.08.2024, 21:47 Uhr', score: 72, details: { 'Kanal': 'Internetwache Hamburg', 'Anzeigende': 'Zeuge K. Schmidt (Nachbarin)', 'Delikte': '§29 BtMG (Verdacht)', 'Vorgangsnr.': 'IW-HH-2024-0098432', 'Status': 'Aufgenommen → PK 21 Hamburg-Altona', 'Wahrscheinlichkeits-Score': '72% – erhöhte Fallrelevanz', 'Score-Begründung': 'Adresse = bekanntes Verdächtigen-Objekt, Zeuge bereits vernommen, zeitl. Korrelation' } },
    { id: 'anz-app-waffen', label: 'App-Anzeige Waffenfund', type: 'anzeige', description: 'Strafanzeige über Polizei-App – Hinweis auf illegale Waffen', timestamp: '02.09.2024, 17:22 Uhr', score: 68, details: { 'Kanal': 'Polizei Hamburg App', 'Anzeigende': 'Anonymer Hinweisgeber', 'Delikte': '§51 WaffG, §52 WaffG', 'Vorgangsnr.': 'APP-HH-2024-0005891', 'Status': 'Bearbeitet → Durchsuchungsbeschluss', 'Wahrscheinlichkeits-Score': '68% – mittlere Fallrelevanz', 'Score-Begründung': 'Adresse Altona matches Sokolov-Wohnung, Waffenbesitz bei Vorstrafen-Profil plausibel' } },
    { id: 'anz-app-darknet', label: 'App-Anzeige Darknet-Handel', type: 'anzeige', description: 'Strafanzeige über Polizei-App – Hinweis auf Darknet-Drogenhandel', timestamp: '11.07.2024, 08:55 Uhr', score: 61, details: { 'Kanal': 'BKA-Hinweisportal (App)', 'Anzeigende': 'Anonym (Darknet-Nutzer)', 'Delikte': '§29a BtMG, §303a StGB', 'Vorgangsnr.': 'APP-BKA-2024-0012774', 'Status': 'Ausgewertet → ZAC NRW', 'Wahrscheinlichkeits-Score': '61% – mittlere Fallrelevanz', 'Score-Begründung': 'Username-Match „ByteL0rd", Forenmuster korreliert, noch keine direkte Personenzuordnung' } },
    { id: 'anz-internet-id', label: 'Online-Anzeige Identitätsbetrug', type: 'anzeige', description: 'Strafanzeige über Internetwache – Nutzung gefälschter Ausweispapiere', timestamp: '05.10.2024, 11:08 Uhr', score: 79, details: { 'Kanal': 'Internetwache Hamburg', 'Anzeigende': 'Einwohnermeldeamt Hamburg-Altona', 'Delikte': '§267 StGB (Urkundenfälschung), §276 StGB', 'Vorgangsnr.': 'IW-HH-2024-0112340', 'Status': 'Aufgenommen → K11 Hamburg', 'Wahrscheinlichkeits-Score': '79% – hohe Fallrelevanz', 'Score-Begründung': 'Alias-Identitäten match Sokolov-Feststellungen, zeitlich nach Festnahme gemeldet' } },
    { id: 'anz-app-scada', label: 'App-Anzeige SCADA-Vorfall', type: 'anzeige', description: 'Strafanzeige über Polizei-App – Cyberangriff auf Energieversorger', timestamp: '05.08.2024, 06:12 Uhr', score: 91, details: { 'Kanal': 'Polizei SH App / CERT-Nord', 'Anzeigende': 'Stadtwerke Kiel (IT-Sicherheit)', 'Delikte': '§303b StGB, §317 StGB (Störung öffentl. Betriebe)', 'Vorgangsnr.': 'APP-SH-2024-0003412', 'Status': 'Aufgenommen → LKA SH Cybercrime', 'Wahrscheinlichkeits-Score': '91% – sehr hohe Fallrelevanz', 'Score-Begründung': 'KRITIS-Betreiber, HydraLock-Signatur bestätigt, Tätergruppe = OP Hydra' } },
    { id: 'anz-internet-krypto', label: 'Online-Anzeige Krypto-Betrug', type: 'anzeige', description: 'Strafanzeige über Internetwache – Verdacht auf illegale Kryptobörse', timestamp: '18.09.2024, 14:00 Uhr', score: 55, details: { 'Kanal': 'Internetwache Bayern', 'Anzeigende': 'Geschädigter Anleger (anonym)', 'Delikte': '§263 StGB (Betrug), KWG-Verstoß', 'Vorgangsnr.': 'IW-BY-2024-0089121', 'Status': 'Ausgewertet → BaFin / ZAC Bayern', 'Wahrscheinlichkeits-Score': '55% – Fallrelevanz wird geprüft', 'Score-Begründung': 'CryptoMix Exchange erwähnt, aber Anzeige aus anderem Kontext (Anlagebetrug)' } },
  ]

  const links: GraphLink[] = [
    // CASE STRUCTURE
    { source: 'case-hydra', target: 'case-cyber', type: 'verbunden', description: 'Cybercrime als Teil der OK-Struktur' },
    { source: 'case-hydra', target: 'case-launder', type: 'verbunden', description: 'Geldwäsche-Erlöse aus Hauptverfahren' },
    { source: 'case-hydra', target: 'case-btm', type: 'verbunden', description: 'BtM-Handel finanziert Organisation' },

    // SUSPECTS → CASES
    { source: 'sus-wolf', target: 'case-hydra', type: 'Hauptverdächtiger', description: 'Kopf der Organisation' },
    { source: 'sus-wolf', target: 'case-launder', type: 'verdächtig in', description: 'Geldwäsche-Auftraggeber' },
    { source: 'sus-wolf', target: 'case-btm', type: 'verdächtig in', description: 'Auftraggeber BtM-Handel' },
    { source: 'sus-maria', target: 'case-launder', type: 'verdächtig in', description: 'Finanzielle Abwicklung' },
    { source: 'sus-kadir', target: 'case-btm', type: 'verdächtig in', description: 'BtM-Transport' },
    { source: 'sus-leon', target: 'case-cyber', type: 'Hauptverdächtiger', description: 'Ransomware-Entwickler' },
    { source: 'sus-anna', target: 'case-launder', type: 'verdächtig in', description: 'Strohfrau Scheinfirmen' },
    { source: 'sus-dmitri', target: 'case-btm', type: 'verdächtig in', description: 'Lieferant aus Osteuropa' },
    { source: 'sus-hassan', target: 'case-btm', type: 'verdächtig in', description: 'Vertrieb Deutschland' },

    // SUSPECT NETWORK
    { source: 'sus-wolf', target: 'sus-maria', type: 'Partnerschaft', description: 'Lebensgefährten / Geschäftspartner' },
    { source: 'sus-wolf', target: 'sus-kadir', type: 'beauftragt', description: 'Logistik-Koordination' },
    { source: 'sus-wolf', target: 'sus-leon', type: 'beauftragt', description: 'Cybercrime-Aufträge' },
    { source: 'sus-wolf', target: 'sus-dmitri', type: 'Kontakt', description: 'Lieferantenbeziehung (Osteuropa)' },
    { source: 'sus-wolf', target: 'sus-hassan', type: 'beauftragt', description: 'Vertrieb Westdeutschland' },
    { source: 'sus-maria', target: 'sus-anna', type: 'instruiert', description: 'Anweisungen Scheinfirmen' },
    { source: 'sus-leon', target: 'sus-anna', type: 'bekannt mit', description: 'Alte Bekannte / Uni Leipzig' },
    { source: 'sus-kadir', target: 'sus-hassan', type: 'koordiniert', description: 'Lieferungen abstimmen' },
    { source: 'sus-dmitri', target: 'sus-kadir', type: 'liefert an', description: 'BtM-Übergaben' },

    // ORGANIZATIONS
    { source: 'sus-wolf', target: 'org-phoenix', type: 'kontrolliert', description: 'Wirtschaftlich Berechtigter' },
    { source: 'sus-anna', target: 'org-phoenix', type: 'Geschäftsführerin', description: 'Formale GF (Strohfrau)' },
    { source: 'sus-maria', target: 'org-baltic', type: 'kontrolliert', description: 'Über Treuhänder' },
    { source: 'sus-leon', target: 'org-nova', type: 'Geschäftsführer', description: 'IT-Tarnfirma' },
    { source: 'org-phoenix', target: 'org-baltic', type: 'Geschäftsbeziehung', description: 'Scheinrechnungen' },
    { source: 'org-phoenix', target: 'org-crypto', type: 'Geschäftsbeziehung', description: 'Krypto-Umwandlung' },
    { source: 'org-nova', target: 'org-crypto', type: 'nutzt', description: 'Ransomware-Lösegelder' },
    { source: 'org-europol', target: 'case-hydra', type: 'koordiniert', description: 'JIT / SIENA-Austausch' },

    // EVIDENCE
    { source: 'evi-phone1', target: 'sus-wolf', type: 'gehört', description: 'Persönliches Gerät' },
    { source: 'evi-laptop', target: 'sus-leon', type: 'gehört', description: 'Arbeitsgerät' },
    { source: 'evi-usb', target: 'sus-maria', type: 'gehört', description: 'Finanzdaten / Buchhaltung' },
    { source: 'evi-docs', target: 'sus-wolf', type: 'gehört', description: '3 Alias-Identitäten' },
    { source: 'evi-cash', target: 'loc-hamburg', type: 'gefunden in', description: 'Durchsuchung 15.09.2024' },
    { source: 'evi-cash', target: 'case-launder', type: 'Beweis in', description: 'Herkunft ungeklärt' },
    { source: 'evi-server', target: 'loc-bukarest', type: 'Standort', description: 'Hosting bei localRO' },
    { source: 'evi-server', target: 'case-cyber', type: 'Beweis in', description: 'C2-Infrastruktur' },
    { source: 'evi-phone1', target: 'case-hydra', type: 'Beweis in', description: 'Kommunikationsdaten' },
    { source: 'evi-laptop', target: 'case-cyber', type: 'Beweis in', description: 'Ransomware-Quellcode' },
    { source: 'evi-laptop', target: 'dig-ransomware', type: 'enthält', description: 'HydraLock v3 Builder' },
    { source: 'evi-usb', target: 'case-launder', type: 'Beweis in', description: 'Scheinfirmen-Buchhaltung' },
    { source: 'evi-cctv', target: 'loc-hafen', type: 'aufgenommen in', description: 'Kameraüberwachung' },
    { source: 'evi-cctv', target: 'case-btm', type: 'Beweis in', description: 'BtM-Übergabe dokumentiert' },

    // DRUGS
    { source: 'drug-cocaine', target: 'loc-hafen', type: 'sichergestellt in', description: 'Container MSKU-2847561' },
    { source: 'drug-cocaine', target: 'case-btm', type: 'Beweis in' },
    { source: 'drug-heroin', target: 'loc-hamburg', type: 'sichergestellt in', description: 'Wohnung Sokolov' },
    { source: 'drug-heroin', target: 'case-btm', type: 'Beweis in' },
    { source: 'sus-dmitri', target: 'drug-cocaine', type: 'geliefert', description: 'Über Balkanroute' },
    { source: 'sus-kadir', target: 'drug-cocaine', type: 'transportiert', description: 'Hafen → Lager' },

    // WEAPONS
    { source: 'wea-glock', target: 'sus-wolf', type: 'gehört', description: 'Gefunden bei Durchsuchung' },
    { source: 'wea-glock', target: 'loc-hamburg', type: 'sichergestellt in' },
    { source: 'wea-ak', target: 'loc-hamburg', type: 'sichergestellt in' },
    { source: 'wea-ak', target: 'case-hydra', type: 'Beweis in' },

    // LOCATIONS
    { source: 'sus-wolf', target: 'loc-hamburg', type: 'Wohnort' },
    { source: 'sus-leon', target: 'loc-berlin', type: 'Arbeitsort' },
    { source: 'org-phoenix', target: 'loc-frankfurt', type: 'Firmensitz' },
    { source: 'org-baltic', target: 'loc-tallinn', type: 'Firmensitz' },
    { source: 'sus-kadir', target: 'loc-hafen', type: 'Treffpunkt', description: 'Regelmäßige Übergaben' },

    // ACCOUNTS
    { source: 'org-phoenix', target: 'acc-de1', type: 'Kontoinhaber' },
    { source: 'org-baltic', target: 'acc-ee1', type: 'Kontoinhaber' },
    { source: 'sus-maria', target: 'acc-ch1', type: 'wirtschaftl. berechtigt' },
    { source: 'sus-leon', target: 'acc-btc', type: 'kontrolliert', description: 'Ransomware-Wallet' },
    { source: 'sus-maria', target: 'acc-monero', type: 'kontrolliert', description: 'Verschleierung' },
    { source: 'acc-de1', target: 'acc-ee1', type: 'Überweisungen', description: '47 Transaktionen / 8,2 Mio. EUR' },
    { source: 'acc-ee1', target: 'acc-ch1', type: 'Überweisungen', description: '12 Transaktionen / 3,1 Mio. EUR' },
    { source: 'acc-btc', target: 'org-crypto', type: 'Auszahlung', description: 'BTC → EUR Konvertierung' },
    { source: 'acc-btc', target: 'acc-monero', type: 'Mixing', description: 'Cross-Chain-Swap' },
    { source: 'acc-de1', target: 'case-launder', type: 'ermittelt in' },
    { source: 'acc-ch1', target: 'case-launder', type: 'ermittelt in' },

    // COMMUNICATION
    { source: 'com-tkue1', target: 'sus-wolf', type: 'überwacht' },
    { source: 'com-encro', target: 'sus-wolf', type: 'Nutzer', description: 'Handle: WolfDEN' },
    { source: 'com-encro', target: 'sus-kadir', type: 'Nutzer', description: 'Handle: TruckK' },
    { source: 'com-signal', target: 'evi-phone1', type: 'extrahiert aus' },
    { source: 'com-signal', target: 'sus-wolf', type: 'Nutzer' },
    { source: 'com-signal', target: 'sus-maria', type: 'Nutzer' },
    { source: 'com-email', target: 'evi-laptop', type: 'extrahiert aus' },
    { source: 'com-email', target: 'org-phoenix', type: 'Korrespondenz' },
    { source: 'com-email', target: 'org-baltic', type: 'Korrespondenz' },
    { source: 'com-darknet', target: 'sus-leon', type: 'Nutzer', description: 'Username: ByteL0rd' },
    { source: 'com-darknet', target: 'dig-ransomware', type: 'beworben', description: 'RaaS-Angebote' },

    // DIGITAL
    { source: 'dig-ransomware', target: 'vic-hospital', type: 'Angriff', description: '23.07.2024' },
    { source: 'dig-ransomware', target: 'vic-stadtwerk', type: 'Angriff', description: '05.08.2024' },
    { source: 'dig-ransomware', target: 'case-cyber', type: 'Tatmittel' },
    { source: 'dig-vpn', target: 'sus-leon', type: 'genutzt von' },
    { source: 'dig-vpn', target: 'evi-server', type: 'verbunden mit', description: 'Zugang zum C2-Server' },
    { source: 'dig-blockchain', target: 'acc-btc', type: 'analysiert' },
    { source: 'dig-blockchain', target: 'acc-monero', type: 'analysiert' },

    // VEHICLES
    { source: 'veh-bmw', target: 'sus-wolf', type: 'Halter (indirekt)' },
    { source: 'veh-bmw', target: 'org-phoenix', type: 'Halter (formal)' },
    { source: 'veh-sprinter', target: 'sus-kadir', type: 'Halter' },
    { source: 'veh-sprinter', target: 'loc-hafen', type: 'gesichtet', description: 'GPS/CCTV' },
    { source: 'veh-audi', target: 'sus-leon', type: 'genutzt' },
    { source: 'veh-audi', target: 'org-nova', type: 'Halter (formal)' },

    // VICTIMS / WITNESSES
    { source: 'vic-hospital', target: 'case-cyber', type: 'geschädigt in' },
    { source: 'vic-stadtwerk', target: 'case-cyber', type: 'geschädigt in' },
    { source: 'wit-informant', target: 'case-hydra', type: 'Quelle' },
    { source: 'wit-informant', target: 'sus-wolf', type: 'berichtet über' },
    { source: 'wit-neighbor', target: 'loc-hamburg', type: 'beobachtet' },
    { source: 'wit-neighbor', target: 'case-btm', type: 'Zeugenaussage' },
    { source: 'wit-banker', target: 'acc-de1', type: 'Verdachtsmeldung' },
    { source: 'wit-banker', target: 'case-launder', type: 'Hinweisgeber' },

    // LAWS
    { source: 'law-100a', target: 'com-tkue1', type: 'Rechtsgrundlage' },
    { source: 'law-100b', target: 'evi-laptop', type: 'Rechtsgrundlage' },
    { source: 'law-261', target: 'case-launder', type: 'Rechtsgrundlage' },
    { source: 'law-29a', target: 'case-btm', type: 'Rechtsgrundlage' },
    { source: 'law-303b', target: 'case-cyber', type: 'Rechtsgrundlage' },
    { source: 'law-129', target: 'case-hydra', type: 'Rechtsgrundlage' },
    { source: 'law-161', target: 'acc-de1', type: 'Auskunftsgrundlage' },
    { source: 'law-161', target: 'acc-paypal1', type: 'Auskunftsgrundlage' },
    { source: 'law-94', target: 'evi-mobile-forensic', type: 'Sicherstellung' },
    { source: 'law-94', target: 'evi-computer-forensic', type: 'Sicherstellung' },

    // REGULATIONS ↔ CASES / VICTIMS / INFRASTRUCTURE
    { source: 'reg-nis2', target: 'vic-hospital', type: 'NIS2-Pflicht', description: 'KRITIS-Betreiber Sektor Gesundheit' },
    { source: 'reg-nis2', target: 'vic-stadtwerk', type: 'NIS2-Pflicht', description: 'KRITIS-Betreiber Sektor Energie' },
    { source: 'reg-nis2', target: 'case-cyber', type: 'Regulierung betroffen', description: 'Ransomware-Angriff auf NIS2-Einrichtungen' },
    { source: 'reg-nis2umsucg', target: 'reg-nis2', type: 'setzt um', description: 'Nationale Umsetzung der EU-RIchtlinie' },
    { source: 'reg-nis2umsucg', target: 'reg-bsig', type: 'novelliert', description: 'Umfassende Änderung des BSIG' },
    { source: 'reg-bsig', target: 'vic-hospital', type: 'Sicherheitspflicht', description: '§8a BSIG – Angemessene Vorkehrungen' },
    { source: 'reg-bsig', target: 'vic-stadtwerk', type: 'Sicherheitspflicht', description: '§8a BSIG – Angemessene Vorkehrungen' },
    { source: 'reg-kritisv', target: 'vic-hospital', type: 'KRITIS-Einstufung', description: 'Schwellenwert: >30.000 vollstat. Fälle/J.' },
    { source: 'reg-kritisv', target: 'vic-stadtwerk', type: 'KRITIS-Einstufung', description: 'Schwellenwert: >104 MW Nennleistung' },
    { source: 'reg-kritisv', target: 'reg-bsig', type: 'konkretisiert', description: 'Schwellenwertdefinition für KRITIS' },
    { source: 'reg-dsgvo', target: 'vic-hospital', type: 'Datenschutzpflicht', description: 'Patientendaten (Art. 9 – bes. Kategorien)' },
    { source: 'reg-dsgvo', target: 'vic-stadtwerk', type: 'Datenschutzpflicht', description: 'Kundendaten / Verbrauchsdaten' },
    { source: 'reg-dsgvo', target: 'case-cyber', type: 'Datenschutzverletzung', description: 'Art. 33/34 – Meldepflicht bei Data Breach' },
    { source: 'reg-eucsa', target: 'org-europol', type: 'Rahmenwerk', description: 'ENISA-Koordination, Zertifizierung' },
    { source: 'reg-eucsa', target: 'reg-nis2', type: 'ergänzt', description: 'Zertifizierungsrahmen für NIS2-Pflichten' },
    { source: 'reg-itsig2', target: 'reg-bsig', type: 'novelliert', description: 'Erweiterung BSI-Befugnisse und KRITIS-Pflichten' },
    { source: 'reg-itsig2', target: 'vic-hospital', type: 'Angriffserkennung', description: 'Pflicht zu Systemen zur Angriffserkennung (SzA)' },
    { source: 'reg-itsig2', target: 'vic-stadtwerk', type: 'Angriffserkennung', description: 'Pflicht zu SzA seit 01.05.2023' },
    { source: 'reg-eudora', target: 'org-crypto', type: 'Regulierung', description: 'Finanzsektor-IKT-Resilienz' },
    { source: 'reg-eudora', target: 'case-launder', type: 'Regulierung betroffen', description: 'Digitale Resilienz im Finanzbereich' },
    { source: 'reg-eudora', target: 'acc-de1', type: 'IKT-Risiko', description: 'Bank muss DORA-konform sein' },
    { source: 'reg-ecidir', target: 'vic-hospital', type: 'CER-Pflicht', description: 'Physische Resilienz kritischer Einrichtung' },
    { source: 'reg-ecidir', target: 'vic-stadtwerk', type: 'CER-Pflicht', description: 'Physische Resilienz kritischer Einrichtung' },
    { source: 'reg-ecidir', target: 'reg-nis2', type: 'Pendant', description: 'Physische Sicherheit ergänzt Cyber-Sicherheit' },
    { source: 'reg-xpolizei', target: 'case-hydra', type: 'Datenmodell', description: 'Einheitliche Struktur der Fallstammdaten' },
    { source: 'reg-xpolizei', target: 'proc-fallstandard', type: 'standardisiert', description: 'Mindestfelder für Ermittlungsakte' },

    // PROCESSES ↔ ENTITIES
    { source: 'proc-meldepflicht', target: 'vic-hospital', type: 'Meldepflicht', description: 'Meldung Ransomware-Vorfall an BSI' },
    { source: 'proc-meldepflicht', target: 'vic-stadtwerk', type: 'Meldepflicht', description: 'Meldung SCADA-Kompromittierung an BSI' },
    { source: 'proc-meldepflicht', target: 'reg-nis2', type: 'basiert auf', description: 'Art. 23 NIS2 – Berichtspflichten' },
    { source: 'proc-meldepflicht', target: 'reg-bsig', type: 'basiert auf', description: '§8b Abs. 4 BSIG – Meldung an BSI' },
    { source: 'proc-incident', target: 'case-cyber', type: 'angewendet in', description: 'IR-Prozess nach Ransomware-Welle' },
    { source: 'proc-incident', target: 'vic-hospital', type: 'durchgeführt bei', description: 'Containment und Recovery Klinikum Nord' },
    { source: 'proc-incident', target: 'vic-stadtwerk', type: 'durchgeführt bei', description: 'SCADA-Isolation und Wiederherstellung' },
    { source: 'proc-incident', target: 'dig-ransomware', type: 'analysiert', description: 'HydraLock-Varianten untersucht' },
    { source: 'proc-forensik', target: 'evi-laptop', type: 'angewendet auf', description: 'Forensische Analyse ThinkPad X1' },
    { source: 'proc-forensik', target: 'evi-phone1', type: 'angewendet auf', description: 'Cellebrite-Extraktion iPhone 15 Pro' },
    { source: 'proc-forensik', target: 'evi-server', type: 'angewendet auf', description: 'C2-Server forensische Sicherung' },
    { source: 'proc-forensik', target: 'evi-usb', type: 'angewendet auf', description: 'VeraCrypt-Entschlüsselung USB-Stick' },
    { source: 'proc-rechtshilfe', target: 'org-europol', type: 'koordiniert über', description: 'SIENA / EC3 / EMSC' },
    { source: 'proc-rechtshilfe', target: 'loc-tallinn', type: 'EEA an', description: 'Ermittlungsanordnung Estland' },
    { source: 'proc-rechtshilfe', target: 'loc-bukarest', type: 'EEA an', description: 'Ermittlungsanordnung Rumänien' },
    { source: 'proc-rechtshilfe', target: 'acc-ch1', type: 'RH-Ersuchen', description: 'Schweiz (Nummernkonto UBS)' },
    { source: 'proc-bafin', target: 'wit-banker', type: 'ausgelöst durch', description: 'Verdachtsmeldung M. Fischer' },
    { source: 'proc-bafin', target: 'acc-de1', type: 'untersucht', description: 'Auffällige Transaktionen Phoenix GmbH' },
    { source: 'proc-bafin', target: 'org-crypto', type: 'gemeldet an BaFin', description: 'Kryptobörse ohne Lizenz' },
    { source: 'proc-bafin', target: 'case-launder', type: 'führte zu', description: 'Einleitung Geldwäsche-Ermittlung' },
    { source: 'proc-art33', target: 'vic-hospital', type: 'Meldung durch', description: '4.500 Patientendatensätze betroffen' },
    { source: 'proc-art33', target: 'vic-stadtwerk', type: 'Meldung durch', description: 'Kundendaten potenziell kompromittiert' },
    { source: 'proc-art33', target: 'reg-dsgvo', type: 'basiert auf', description: 'Art. 33/34 DSGVO Meldepflicht' },
    { source: 'proc-art33', target: 'case-cyber', type: 'bezüglich', description: 'Ransomware-bedingte Datenverletzung' },
    { source: 'proc-fallstandard', target: 'case-cyber', type: 'Qualitätsprozess' },
    { source: 'proc-fallstandard', target: 'case-launder', type: 'Qualitätsprozess' },
    { source: 'proc-fallstandard', target: 'case-btm', type: 'Qualitätsprozess' },

    // SOPs ↔ PROCESSES / EVIDENCE / ENTITIES
    { source: 'sop-ransomware', target: 'case-cyber', type: 'angewendet in', description: 'Leitfaden für Ransomware-Erstmaßnahmen' },
    { source: 'sop-ransomware', target: 'vic-hospital', type: 'Leitfaden für', description: 'Empfohlene Sofortmaßnahmen' },
    { source: 'sop-ransomware', target: 'vic-stadtwerk', type: 'Leitfaden für', description: 'Empfohlene Sofortmaßnahmen' },
    { source: 'sop-ransomware', target: 'proc-incident', type: 'konkretisiert', description: 'Ransomware-spezifische IR-Schritte' },
    { source: 'sop-ransomware', target: 'dig-ransomware', type: 'Gegenmaßnahme', description: 'HydraLock-spezifische Empfehlungen' },
    { source: 'sop-beweissicherung', target: 'evi-laptop', type: 'Leitfaden für', description: 'Forensische Sicherung nach SOP' },
    { source: 'sop-beweissicherung', target: 'evi-phone1', type: 'Leitfaden für', description: 'Mobile Forensik nach SOP' },
    { source: 'sop-beweissicherung', target: 'evi-server', type: 'Leitfaden für', description: 'Server-Forensik nach SOP' },
    { source: 'sop-beweissicherung', target: 'proc-forensik', type: 'konkretisiert', description: 'Detaillierte Arbeitsanweisungen' },
    { source: 'sop-meldekette', target: 'proc-meldepflicht', type: 'konkretisiert', description: 'Stufenweise Meldekette' },
    { source: 'sop-meldekette', target: 'vic-hospital', type: 'durchgeführt bei', description: 'Meldekette nach Ransomware-Angriff' },
    { source: 'sop-meldekette', target: 'vic-stadtwerk', type: 'durchgeführt bei', description: 'Meldekette nach SCADA-Vorfall' },
    { source: 'sop-meldekette', target: 'reg-nis2', type: 'setzt um', description: 'Art. 23 NIS2 Meldefristen' },
    { source: 'sop-intl', target: 'proc-rechtshilfe', type: 'konkretisiert', description: 'Arbeitsanweisungen für intl. Kooperation' },
    { source: 'sop-intl', target: 'org-europol', type: 'Leitfaden für', description: 'SIENA/JIT-Verfahren' },
    { source: 'sop-intl', target: 'case-hydra', type: 'angewendet in', description: 'JIT DE-EE-RO-BG' },
    { source: 'sop-krypto', target: 'dig-blockchain', type: 'Leitfaden für', description: 'Blockchain-Analysemethodik' },
    { source: 'sop-krypto', target: 'acc-btc', type: 'angewendet auf', description: 'Bitcoin-Wallet-Analyse' },
    { source: 'sop-krypto', target: 'acc-monero', type: 'angewendet auf', description: 'Monero-Tracking (eingeschränkt)' },
    { source: 'sop-krypto', target: 'org-crypto', type: 'angewendet auf', description: 'CryptoMix Exchange Analyse' },
    { source: 'sop-gwg', target: 'case-launder', type: 'angewendet in', description: 'Geldwäscheerkennung und -bekämpfung' },
    { source: 'sop-gwg', target: 'proc-bafin', type: 'konkretisiert', description: 'GwG-Meldeverfahren' },
    { source: 'sop-gwg', target: 'acc-de1', type: 'angewendet auf', description: 'Transaktionsanalyse Phoenix GmbH' },
    { source: 'sop-gwg', target: 'acc-ch1', type: 'angewendet auf', description: 'Analyse Schweizer Nummernkonto' },
    { source: 'sop-gwg', target: 'acc-monero', type: 'angewendet auf', description: 'Privacy-Coin-Verschleierung' },

    // ANZEIGEN (Internet & App) → CASES / ENTITIES
    { source: 'anz-internet-cyber', target: 'case-cyber', type: 'Anzeige zu', description: 'Ransomware-Strafanzeige (Score: 94%)' },
    { source: 'anz-internet-cyber', target: 'vic-hospital', type: 'erstattet von', description: 'IT-Leitung Klinikum Nord' },
    { source: 'anz-internet-cyber', target: 'dig-ransomware', type: 'betrifft', description: 'HydraLock Ransomware' },
    { source: 'anz-internet-cyber', target: 'law-303b', type: 'Rechtsgrundlage', description: '§303b StGB Computersabotage' },
    { source: 'anz-internet-gw', target: 'case-launder', type: 'Anzeige zu', description: 'Geldwäsche-Verdacht (Score: 87%)' },
    { source: 'anz-internet-gw', target: 'org-phoenix', type: 'betrifft', description: 'Auffällige Kontobewegungen' },
    { source: 'anz-internet-gw', target: 'acc-de1', type: 'betrifft', description: 'Geschäftskonto Commerzbank' },
    { source: 'anz-internet-gw', target: 'law-261', type: 'Rechtsgrundlage', description: '§261 StGB Geldwäsche' },
    { source: 'anz-internet-gw', target: 'wit-banker', type: 'korreliert mit', description: 'Parallel-Verdachtsmeldung M. Fischer' },
    { source: 'anz-internet-btm', target: 'case-btm', type: 'Anzeige zu', description: 'BtM-Fund Verdacht (Score: 72%)' },
    { source: 'anz-internet-btm', target: 'wit-neighbor', type: 'erstattet von', description: 'Zeuge K. Schmidt (Nachbarin)' },
    { source: 'anz-internet-btm', target: 'loc-hamburg', type: 'betrifft Ort', description: 'Hamburg-Altona, Sokolov-Adresse' },
    { source: 'anz-internet-btm', target: 'law-29a', type: 'Rechtsgrundlage', description: '§29a BtMG' },
    { source: 'anz-app-waffen', target: 'case-hydra', type: 'Anzeige zu', description: 'Waffenhinweis Altona (Score: 68%)' },
    { source: 'anz-app-waffen', target: 'loc-hamburg', type: 'betrifft Ort', description: 'Adresse match Sokolov-Wohnung' },
    { source: 'anz-app-waffen', target: 'wea-glock', type: 'führte zu Fund', description: 'Glock 19 sichergestellt' },
    { source: 'anz-app-waffen', target: 'wea-ak', type: 'führte zu Fund', description: 'AK-Pattern sichergestellt' },
    { source: 'anz-app-darknet', target: 'case-btm', type: 'Anzeige zu', description: 'Darknet-Drogenhandel (Score: 61%)' },
    { source: 'anz-app-darknet', target: 'case-cyber', type: 'Anzeige zu', description: 'Cybercrime-Bezug ByteL0rd' },
    { source: 'anz-app-darknet', target: 'com-darknet', type: 'korreliert mit', description: 'Username-Match ByteL0rd' },
    { source: 'anz-app-darknet', target: 'sus-leon', type: 'Hinweis auf', description: 'Verdacht gegen Leon Krause' },
    { source: 'anz-internet-id', target: 'case-hydra', type: 'Anzeige zu', description: 'Identitätsbetrug Sokolov (Score: 79%)' },
    { source: 'anz-internet-id', target: 'evi-docs', type: 'betrifft', description: 'Gefälschte Ausweispapiere' },
    { source: 'anz-internet-id', target: 'sus-wolf', type: 'Hinweis auf', description: 'Alias-Identitäten Viktor Sokolov' },
    { source: 'anz-app-scada', target: 'case-cyber', type: 'Anzeige zu', description: 'SCADA-Cyberangriff (Score: 91%)' },
    { source: 'anz-app-scada', target: 'vic-stadtwerk', type: 'erstattet von', description: 'IT-Sicherheit Stadtwerke Kiel' },
    { source: 'anz-app-scada', target: 'dig-ransomware', type: 'betrifft', description: 'HydraLock-Signatur bestätigt' },
    { source: 'anz-app-scada', target: 'law-303b', type: 'Rechtsgrundlage', description: '§303b StGB, §317 StGB' },
    { source: 'anz-internet-krypto', target: 'case-launder', type: 'Anzeige zu', description: 'Krypto-Betrug CryptoMix (Score: 55%)' },
    { source: 'anz-internet-krypto', target: 'org-crypto', type: 'betrifft', description: 'CryptoMix Exchange genannt' },
    { source: 'anz-internet-krypto', target: 'reg-eudora', type: 'Regulierung betroffen', description: 'DORA / KWG-Verstoß' },

    // PROFESSIONAL DATA ENRICHMENT (Mobile/Computer/Social/GPS/Accounts)
    { source: 'dig-social-osint', target: 'sus-leon', type: 'Profilkorrelation' },
    { source: 'dig-social-osint', target: 'com-darknet', type: 'Handle-Matching' },
    { source: 'dig-social-osint', target: 'case-cyber', type: 'OSINT-Hinweise' },
    { source: 'dig-gps-timeline', target: 'veh-bmw', type: 'Standortdaten' },
    { source: 'dig-gps-timeline', target: 'veh-sprinter', type: 'Standortdaten' },
    { source: 'dig-gps-timeline', target: 'sus-kadir', type: 'Bewegungsprofil' },
    { source: 'dig-gps-timeline', target: 'loc-hafen', type: 'Tatortkorrelation' },
    { source: 'evi-mobile-forensic', target: 'sus-wolf', type: 'Gerätedaten' },
    { source: 'evi-mobile-forensic', target: 'sus-maria', type: 'Gerätedaten' },
    { source: 'evi-mobile-forensic', target: 'com-signal', type: 'Artefakte' },
    { source: 'evi-computer-forensic', target: 'sus-leon', type: 'Gerätedaten' },
    { source: 'evi-computer-forensic', target: 'com-email', type: 'Artefakte' },
    { source: 'evi-computer-forensic', target: 'dig-ransomware', type: 'Artefakte' },
    { source: 'acc-paypal1', target: 'case-launder', type: 'ermittelt in' },
    { source: 'acc-paypal1', target: 'sus-maria', type: 'kontrolliert' },
    { source: 'acc-paypal1', target: 'org-phoenix', type: 'wirtschaftlicher Bezug' },
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

  const linkThreeObject = useCallback((link: any) => {
    if (highlightLinks.size === 0 || !highlightLinks.has(linkKey(link))) return undefined
    const sprite = new SpriteText(`${link.type}`) as any
    sprite.color = '#ffd166'
    sprite.textHeight = 2.2
    sprite.backgroundColor = 'rgba(0,0,0,0.55)'
    sprite.padding = 1
    sprite.borderRadius = 3
    return sprite as THREE.Object3D
  }, [highlightLinks, linkKey])

  const linkPositionUpdate = useCallback((sprite: any, _coords: any, info: any) => {
    // Only reposition custom SpriteText labels, not default line objects
    if (!sprite || typeof sprite.text !== 'string') return
    if (!info?.start || !info?.end) return
    const middle = {
      x: info.start.x + (info.end.x - info.start.x) / 2,
      y: info.start.y + (info.end.y - info.start.y) / 2,
      z: info.start.z + (info.end.z - info.start.z) / 2,
    }
    Object.assign((sprite as THREE.Object3D).position, middle)
  }, [])

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
          🔒 Operation Hydra
        </div>
        <div className="text-white/50 text-xs mt-1">
          Grenzüberschreitende OK · Cybercrime · Geldwäsche · BtM
        </div>
        <div className="text-white/30 text-[10px] mt-0.5">
          {graphData.nodes.length} Entitäten · {graphData.links.length} Beziehungen
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
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-4 gap-y-1 max-w-xl pointer-events-none select-none">
        {Object.entries(NODE_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: NODE_COLORS[type as NodeType] }}
            />
            <span className="text-[10px] text-white/60 whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>

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
                      <span className="text-[10px] text-white/40">
                        {isOutgoing ? '→' : '←'} {link.type}
                      </span>
                      {link.description && (
                        <span className="text-[10px] text-white/30 truncate">
                          · {link.description}
                        </span>
                      )}
                    </div>
                    {other.description && (
                      <div className="text-[10px] text-white/25 ml-5 mt-0.5 truncate">{other.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        }

        return (
        <div className="absolute top-16 right-4 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl text-white">
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
            <p className="text-xs text-white/60 mt-1">{selectedNode.description}</p>
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
          {selectedNode.details && (
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Details</div>
              <div className="space-y-1.5">
                {Object.entries(selectedNode.details).map(([key, val]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="text-white/40 flex-shrink-0">{key}:</span>
                    <span className="text-white/90">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
