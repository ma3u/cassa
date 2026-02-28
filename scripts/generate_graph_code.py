#!/usr/bin/env python3
"""
Convert enriched JSON data into TypeScript buildCaseData() code for PoliceKnowledgeGraph3D.
Reads the enriched JSON and generates the complete nodes[] and links[] arrays
with full details from all sources.
"""
import json, sys, textwrap

INPUT = "input/hydra_graph_data (1).json"

with open(INPUT) as f:
    data = json.load(f)

# ── Map JSON types to component NodeType ──
TYPE_MAP = {
    # Nodes
    "hydra_market": "case",
    "promservice": "organization",
    "bka": "organization", "zit": "organization", "usdoj": "organization",
    "ofac": "organization", "fbi": "organization", "dea": "organization",
    "irs_ci": "organization", "hsi": "organization", "uspis": "organization",
    "jcode": "organization",
    "garantex": "account", "suex": "account", "chatex": "account",
    "bitpapa": "account", "netexchange": "account",
    "ramp": "organization", "wayaway": "communication",
    "omg_market": "organization", "mega_market": "organization",
    "blacksprut": "organization", "solaris": "organization", "kraken_dnm": "organization",
    "darkside": "suspect", "ryuk": "suspect", "sodinokibi": "suspect", "conti": "suspect",
    "sinaloa_cartel": "organization", "cjng": "organization",
    "moscow_court": "law", "us_court_ndca": "law",
    "colonial_pipeline": "victim", "bitfinex": "victim",
    "alphabay": "case", "federation_tower": "location",
    "moiseyev": "suspect", "pavlov": "suspect", "moiseyev_accomplices": "suspect",
    "morgan": "suspect", "lichtenstein": "suspect",
    "zambada": "suspect", "oseguera": "suspect", "zwiebel": "witness",
    "svc_drugs": "drug", "svc_dead_drop": "drug", "svc_btc_mixer": "digital",
    "svc_cashout": "account", "svc_forged_docs": "evidence", "svc_stolen_data": "digital",
    "svc_hacking": "digital", "svc_raas": "digital", "svc_counterfeit": "evidence",
    "svc_escrow": "digital", "svc_dispute": "digital", "svc_reputation": "digital",
    "evt_founded": "process", "evt_ramp_closure": "process", "evt_colonial_pipeline": "process",
    "evt_investigation_start": "process", "evt_seizure": "process",
    "evt_pavlov_indictment": "process", "evt_ofac_sanctions": "process",
    "evt_omg_ddos": "process", "evt_blacksprut_hack": "process",
    "evt_garantex_license_revoked": "process",
    "evt_moiseyev_sentence": "process", "evt_bitpapa_sanctions": "process",
    "hydra_crypto_addresses": "account", "seized_btc": "evidence",
    "infra_servers": "digital", "infra_tor": "digital",
    "eo_13694": "law", "dnm_market_2022": "regulation",
}

# ── Keys to exclude from details (they are already captured in id/label/type/description) ──
EXCLUDE_KEYS = {'id', 'label', 'type', 'sources', 'stix_type', 'stix_relationship_type'}

# ── German labels for detail keys ──
KEY_LABELS = {
    'subtype': 'Kategorie', 'founded': 'Gegründet', 'closed': 'Geschlossen',
    'language': 'Sprache', 'network': 'Netzwerk', 'payment_method': 'Zahlungsmethode',
    'country_origin': 'Herkunftsland', 'customers': 'Kundenkonten', 'seller_accounts': 'Verkäuferkonten',
    'revenue_2016_usd': 'Umsatz 2016 (USD)', 'revenue_2018_usd': 'Umsatz 2018 (USD)',
    'revenue_2020_eur': 'Umsatz 2020 (EUR)', 'revenue_2020_usd': 'Umsatz 2020 (USD)',
    'revenue_2021_crypto_usd': 'Krypto-Umsatz 2021 (USD)',
    'illicit_sources_since_2020_usd': 'Illegale Zuflüsse seit 2020 (USD)',
    'total_crypto_2015_2022_usd': 'Krypto-Gesamtvolumen 2015–2022 (USD)',
    'market_share_2021': 'Marktanteil 2021', 'market_share_2022_pre_shutdown': 'Marktanteil vor Abschaltung',
    'daily_revenue_pre_shutdown_usd': 'Tagesumsatz vor Abschaltung (USD)',
    'daily_revenue_post_shutdown_usd': 'Tagesumsatz nach Abschaltung (USD)',
    'geographic_coverage_russia': 'Marktabdeckung Russland',
    'illicit_btc_share_russian_exchanges_2019': 'Anteil illegaler BTC an russ. Börsen 2019',
    'ransomware_proceeds_laundered_usd': 'Gewaschene Ransomware-Erlöse (USD)',
    'status': 'Status', 'aliases': 'Alias-Namen', 'country': 'Land', 'role': 'Rolle',
    'nationality': 'Nationalität', 'sentence': 'Urteil', 'sentence_date': 'Urteilsdatum',
    'fine_rubles': 'Geldstrafe (Rubel)', 'convicted_of': 'Verurteilt wegen',
    'historic_note': 'Historische Bedeutung',
    'age_at_indictment': 'Alter bei Anklage', 'company': 'Firma',
    'company_operated_since': 'Firma betrieben seit', 'indictment_date': 'Anklagedatum',
    'charges': 'Anklagepunkte', 'court': 'Gericht',
    'count': 'Anzahl', 'sentences_range': 'Strafmaß', 'collective_fines_rubles': 'Geldstrafen gesamt (Rubel)',
    'registered': 'Registriert', 'operations': 'Betrieb', 'location_detail': 'Standort-Detail',
    'sanctioned': 'Sanktioniert', 'illicit_transactions_usd': 'Illegale Transaktionen (USD)',
    'conti_proceeds_usd': 'Conti-Erlöse (USD)', 'hydra_proceeds_usd': 'Hydra-Erlöse (USD)',
    'estonian_license_revoked': 'Estl. Lizenz entzogen', 'location': 'Standort', 'note': 'Anmerkung',
    'domain': 'Domain', 'relationship_to_hydra': 'Beziehung zu Hydra',
    'peak_share': 'Spitzenmarktanteil', 'peak_share_date': 'Datum Spitzenanteil',
    'active_since': 'Aktiv seit', 'offers_money_laundering': 'Bietet Geldwäsche an',
    'notable_attack': 'Bekanntester Angriff',
    'sector': 'Sektor', 'hack_year': 'Hack-Jahr', 'hack_amount_usd': 'Hack-Schaden (USD)',
    'total_value_at_seizure_usd': 'Wert bei Beschlagnahmung (USD)',
    'city': 'Stadt', 'date': 'Datum', 'description': 'Beschreibung',
    'ransom_btc': 'Lösegeld (BTC)', 'ransom_usd': 'Lösegeld (USD)', 'recovered_btc': 'Wiederhergestellt (BTC)',
    'btc_seized': 'BTC beschlagnahmt', 'btc_value_eur': 'Wert (EUR)', 'btc_value_usd': 'Wert (USD)',
    'transactions_count': 'Transaktionen', 'crypto_addresses_sanctioned': 'Krypto-Adressen sanktioniert',
    'legal_basis': 'Rechtsgrundlage', 'reason': 'Grund',
    'amount_btc': 'Menge (BTC)', 'value_eur': 'Wert (EUR)', 'value_usd': 'Wert (USD)',
    'seizure_date': 'Beschlagnahmedatum', 'transaction_count': 'Transaktionsanzahl',
    'hosted_by': 'Gehostet von', 'list': 'Liste',
    'title': 'Titel', 'issued_by': 'Herausgeber',
    'total_revenue_2022_usd': 'Gesamtumsatz 2022 (USD)', 'total_revenue_2021_usd': 'Gesamtumsatz 2021 (USD)',
    'decline_pct': 'Rückgang (%)',
    'details': 'Details', 'methods': 'Methoden', 'order_types': 'Bestelltypen',
    'cost_share': 'Kostenanteil', 'purpose': 'Zweck',
    # STIX/XPolizei metadata
    'stix_infrastructure_types': 'STIX Infrastruktur-Typ', 'stix_identity_class': 'STIX Identity-Klasse',
    'stix_sectors': 'STIX Sektoren', 'stix_threat_actor_types': 'STIX Threat-Actor-Typ',
    'stix_malware_types': 'STIX Malware-Typ', 'stix_tool_types': 'STIX Tool-Typ',
    'stix_indicator_types': 'STIX Indikator-Typ', 'stix_secondary_type': 'STIX Sekundärtyp',
    'stix_first_seen': 'STIX Erstmalig gesehen',
    'xpolizei_type': 'XPolizei-Typ',
    'applicable_standards': 'Standards',
}

def fmt_val(v):
    """Format a value for TypeScript string."""
    if isinstance(v, list):
        return ', '.join(str(x) for x in v)
    return str(v)

def fmt_num(n):
    """Format large numbers with dots for German style."""
    s = str(n)
    # If it starts with < or ~ keep prefix
    if s.startswith('<') or s.startswith('~') or s.startswith('>'):
        prefix = s[0]
        rest = s[1:]
    else:
        prefix = ''
        rest = s
    # Remove commas if any
    rest = rest.replace(',', '')
    # If purely numeric, format German-style
    if rest.isdigit() and len(rest) > 3:
        # Reverse, insert dots every 3 digits
        parts = []
        for i, c in enumerate(reversed(rest)):
            if i > 0 and i % 3 == 0:
                parts.append('.')
            parts.append(c)
        return prefix + ''.join(reversed(parts))
    return s

def build_details(node):
    """Build details dict from JSON node."""
    details = {}
    for k, v in node.items():
        if k in EXCLUDE_KEYS:
            continue
        if v is None or v == '' or v == [] or v == {}:
            continue
        label = KEY_LABELS.get(k, k.replace('_', ' ').title())
        val = fmt_val(v)
        # Format specific numeric fields
        if 'usd' in k or 'eur' in k or 'rubles' in k:
            if val.replace('.', '').replace(',', '').replace('<', '').replace('>', '').replace('~', '').isdigit():
                val = fmt_num(val)
                if 'usd' in k:
                    val = f'${val}'
                elif 'eur' in k:
                    val = f'{val} €'
                elif 'rubles' in k:
                    val = f'{val} ₽'
        elif k in ('customers', 'seller_accounts', 'count'):
            val = fmt_num(val)
        details[label] = val
    return details

def escape_ts(s):
    """Escape string for TypeScript single-quoted string."""
    return s.replace("'", "\\'").replace('\n', '\\n')

# ── Generate node descriptions (German) ──
DESC_MAP = {
    'hydra_market': 'Weltweit größter Darknet-Marktplatz (2015–2022), $5,2 Mrd. Krypto-Volumen',
    'promservice': 'Bulletproof-Hosting-Firma (Novosibirsk) – betrieb Hydra-Server seit Nov 2015',
    'bka': 'Deutsche Bundespolizei – leitete Hydra-Ermittlung & Server-Beschlagnahmung',
    'zit': 'Zentralstelle zur Bekämpfung der Internetkriminalität (Frankfurt)',
    'usdoj': 'US-Justizministerium – koordinierte internationale Ermittlung',
    'ofac': 'Office of Foreign Assets Control – US-Sanktionsbehörde',
    'fbi': 'Federal Bureau of Investigation – JCODE-Mitglied',
    'dea': 'Drug Enforcement Administration – JCODE-Mitglied',
    'irs_ci': 'IRS Criminal Investigation – Blockchain-Forensik & Finanzermittlung',
    'hsi': 'Homeland Security Investigations – JCODE-Mitglied',
    'uspis': 'U.S. Postal Inspection Service – Ermittlung Postversand-Drogen',
    'jcode': 'Joint Criminal Opioid & Darknet Enforcement – FBI, DEA, IRS-CI, HSI, USPIS',
    'garantex': 'Kryptobörse – $100 Mio. illegale Transaktionen, sanktioniert 05.04.2022',
    'suex': 'Kryptobörse – sanktioniert 2021, Federation Tower Moskau',
    'chatex': 'Kryptobörse – sanktioniert 2021, Federation Tower Moskau',
    'bitpapa': 'Kryptobörse – sanktioniert März 2024 (Hydra/Garantex-Transaktionen)',
    'netexchange': 'Kryptobörse – sanktioniert März 2024 (Hydra/Garantex-Transaktionen)',
    'ramp': 'Russian Anonymous Marketplace – Vorgänger von Hydra (geschlossen Sep 2017)',
    'wayaway': 'Darknet-Forum wayaway.biz – langjähriger Hydra-Partner',
    'omg_market': 'Hydra-Nachfolger – 65,2% Marktanteil, bietet Geldwäsche',
    'mega_market': 'Hydra-Nachfolgemarkt – bietet Geldwäsche',
    'blacksprut': 'Hydra-Nachfolger – 68,5% Spitzenanteil, gehackt Nov 2022',
    'solaris': 'Hydra-Nachfolger – von Kraken gekapert Jan 2023',
    'kraken_dnm': 'Darknet-Markt – kaperte Solaris im Januar 2023',
    'darkside': 'Ransomware-Gruppe – Colonial-Pipeline-Angriff, 4% BTC über Hydra',
    'ryuk': 'Ransomware-Gruppe – Teil von $8 Mio. über Hydra gewaschen',
    'sodinokibi': 'Ransomware-Gruppe (REvil) – Teil von $8 Mio. über Hydra gewaschen',
    'conti': 'Ransomware-Gruppe – ~$6 Mio. über Garantex gewaschen',
    'sinaloa_cartel': 'Mexikanisches Kartell – Geldwäsche über Hydra (Smurfing)',
    'cjng': 'Jalisco New Generation Cartel – Geldwäsche über Hydra (Smurfing)',
    'moscow_court': 'Moskauer Regionalgericht – Moiseyev-Urteil 02.12.2024',
    'us_court_ndca': 'U.S. District Court N.D. California – Anklage Pavlov',
    'colonial_pipeline': 'US-Öl/Gas-Infrastruktur – DarkSide-Ransomware-Opfer (Mai 2021)',
    'bitfinex': 'Kryptobörse – Hack 2016 ($4,5 Mrd.), Erlöse über Hydra-Mixer gewaschen',
    'alphabay': 'Darknet-Marktplatz – beschlagnahmt Juli 2017 (~$1 Mrd.)',
    'federation_tower': 'Standort von Garantex, SUEX, CHATEX – alle sanktioniert',
    'moiseyev': 'Gründer/Betreiber Hydra Market – lebenslänglich verurteilt 02.12.2024',
    'pavlov': 'Server-Administrator (Promservice Ltd.) – in USA angeklagt 05.04.2022',
    'moiseyev_accomplices': '15 Mitverschwörer – 8–23 Jahre Haft (02.12.2024)',
    'morgan': 'Bitfinex-Hack-Verschwörerin – Hydra-Mixer zur Geldwäsche genutzt',
    'lichtenstein': 'Bitfinex-Hack-Verschwörer – Hydra-Mixer zur Geldwäsche genutzt',
    'zambada': 'Anführer Sinaloa-Kartell – Geldwäsche über Hydra',
    'oseguera': 'Anführer CJNG-Kartell – Geldwäsche über Hydra',
    'zwiebel': 'BKA-Ermittler – leitete Hydra-Server-Beschlagnahmung',
    'svc_drugs': 'Kokain, Meth, LSD, Heroin, Opioide, Vorläufersubstanzen – Groß-/Einzelhandel',
    'svc_dead_drop': 'Klad/Zakladka-System – Prikop, Magnetisch, Taynik-Methoden',
    'svc_btc_mixer': 'Hydras interner Bitcoin-Mixer – Ransomware, Kartelle, Hacker',
    'svc_cashout': 'BTC→Rubel, Barlieferung, Überweisung, SIM-Karten, vergrabenes Bargeld',
    'svc_forged_docs': 'Gefälschte Ausweise, Pässe, Führerscheine mit anpassbaren Fotos',
    'svc_stolen_data': 'Gestohlene Kreditkarten-, Bank- und Identitätsdaten',
    'svc_hacking': 'Hacking-als-Dienstleistung – Tools und Auftragsarbeiten',
    'svc_raas': 'Ransomware-as-a-Service – DarkSide, Ryuk, REvil, Conti u.a.',
    'svc_counterfeit': 'Gefälschte Banknoten',
    'svc_escrow': 'Treuhand-System für sichere Darknet-Transaktionen',
    'svc_dispute': 'Streitbeilegungssystem zwischen Käufern und Verkäufern',
    'svc_reputation': 'Bewertungssystem für Verkäufer – Vertrauensinfrastruktur',
    'evt_founded': 'Gründung des Hydra-Marktplatzes (2015)',
    'evt_ramp_closure': 'RAMP geschlossen Sep 2017 – Hydra wird Monopolist',
    'evt_colonial_pipeline': 'DarkSide-Ransomware: 75 BTC Lösegeld, 63,7 BTC wiederhergestellt',
    'evt_investigation_start': 'BKA + ZIT Frankfurt beginnen Hydra-Infrastruktur-Ermittlung (Aug 2021)',
    'evt_seizure': 'BKA beschlagnahmt Server + 543,3 BTC (~23 Mio. €) am 05.04.2022',
    'evt_pavlov_indictment': 'US-Anklage gegen Pavlov – Drogen-/Geldwäsche-Verschwörung',
    'evt_ofac_sanctions': 'OFAC sanktioniert Hydra + Garantex, >100 Krypto-Adressen auf SDN-Liste',
    'evt_omg_ddos': 'DDoS-Angriff auf OMG!OMG! – Händler-Migration zu Mega/Blacksprut',
    'evt_blacksprut_hack': 'Blacksprut bei 68,5% Marktanteil gehackt (Nov 2022)',
    'evt_garantex_license_revoked': 'Estlands FIU entzieht Garantex-Kryptolizenz (Feb 2022)',
    'evt_moiseyev_sentence': 'Lebenslänglich für Moiseyev – erste lebenslange Drogenstrafe Russlands',
    'evt_bitpapa_sanctions': 'OFAC sanktioniert Bitpapa + NetExchange (März 2024)',
    'hydra_crypto_addresses': 'Über 100 Krypto-Adressen auf OFAC-SDN-Liste',
    'seized_btc': 'Beschlagnahmte 543,3 BTC durch BKA am 05.04.2022',
    'infra_servers': 'Physische Server in Deutschland – Promservice Ltd. seit 2015',
    'infra_tor': 'Tor-Anonymisierungsnetzwerk – Zugang zu .onion-Diensten',
    'eo_13694': 'US-Sanktionsgrundlage – Blockierung von Eigentum bei Cyber-Aktivitäten',
    'dnm_market_2022': 'DNM-Gesamtumsatz: $3,1 Mrd. (2021) → $1,5 Mrd. (2022), –51,6%',
    # Countries
    'country_russia': 'Hauptmarkt, Herkunftsland Betreiber, Standort Garantex/SUEX/CHATEX',
    'country_germany': 'Standort der Hydra-Server, BKA/ZIT-Ermittlung',
    'country_usa': 'Anklage, Sanktionen, JCODE-Ermittlung',
    'country_ukraine': 'Hydra-Marktgebiet – zweitgrößter Drogenumsatz',
    'country_estonia': 'Garantex-Registrierung, Lizenzentzug Feb 2022',
    'country_mexico': 'Sinaloa-Kartell und CJNG – Geldwäsche über Hydra',
    'country_belarus': 'Hydra-Marktgebiet',
    'country_kazakhstan': 'Hydra-Marktgebiet',
    'country_moldova': 'Hydra-Marktgebiet',
    'country_azerbaijan': 'Hydra-Marktgebiet',
    'country_armenia': 'Hydra-Marktgebiet',
    'country_kyrgyzstan': 'Hydra-Marktgebiet',
    'country_uzbekistan': 'Hydra-Marktgebiet',
    'country_tajikistan': 'Hydra-Marktgebiet',
}

# ── Build the complete nodes array ──
print("// === GENERATED NODES ===")
for node in data['nodes']:
    nid = node['id']
    ntype = TYPE_MAP.get(nid, 'digital')
    label = node.get('label', nid)
    desc = DESC_MAP.get(nid, node.get('description', label))
    details = build_details(node)
    ts = node.get('date', node.get('founded', ''))
    
    # Build details string
    det_str = '{ ' + ', '.join(f"'{escape_ts(k)}': '{escape_ts(v)}'" for k,v in details.items()) + ' }'
    
    parts = [
        f"id: '{nid}'",
        f"label: '{escape_ts(label)}'",
        f"type: '{ntype}'",
        f"description: '{escape_ts(desc)}'",
        f"details: {det_str}",
    ]
    if ts:
        parts.append(f"timestamp: '{escape_ts(str(ts))}'")
    
    print(f"    {{ {', '.join(parts)} }},")

print()
print("// === GENERATED RELATIONSHIPS ===")
# Build links with enriched descriptions
for rel in data['relationships']:
    src = rel['source_id']
    tgt = rel['target_id']
    rtype = rel.get('relationship_type', 'RELATED_TO')
    # Build German-friendly type
    type_label = rtype.replace('_', ' ').lower()
    
    # Build description from all extra fields
    desc_parts = []
    if rel.get('date'):
        desc_parts.append(rel['date'])
    if rel.get('details'):
        desc_parts.append(rel['details'])
    if rel.get('start'):
        desc_parts.append(f"von {rel['start']}")
    if rel.get('end'):
        desc_parts.append(f"bis {rel['end']}")
    if rel.get('legal_basis'):
        desc_parts.append(f"Rechtsgrundlage: {rel['legal_basis']}")
    if rel.get('amount_usd'):
        desc_parts.append(f"${rel['amount_usd']}")
    if rel.get('stix_relationship_type'):
        desc_parts.append(f"STIX: {rel['stix_relationship_type']}")
    if rel.get('applicable_standards'):
        desc_parts.append(f"Standards: {', '.join(rel['applicable_standards'])}")
    if rel.get('sources'):
        desc_parts.append(f"Quellen: {', '.join(rel['sources'])}")
    
    desc = ' | '.join(desc_parts) if desc_parts else ''
    
    if desc:
        print(f"    {{ source: '{src}', target: '{tgt}', type: '{escape_ts(type_label)}', description: '{escape_ts(desc)}' }},")
    else:
        print(f"    {{ source: '{src}', target: '{tgt}', type: '{escape_ts(type_label)}' }},")
