#!/usr/bin/env python3
"""
Generate Operation Hydra narration audio via ElevenLabs API.
Usage:
    ELEVENLABS_API_KEY=<key>  python scripts/generate_hydra_voice.py
    python scripts/generate_hydra_voice.py --login   # prompts for API key and saves to .env
"""
import argparse
import os
import sys
from pathlib import Path

# ── Narration text (German) ──────────────────────────────────────────────────
HYDRA_NARRATION = """
Willkommen bei CASSA – dem intelligenten Wissensgrafen für Ermittlungsbehörden, entwickelt von Sopra Steria.

Ich erkläre Ihnen jetzt den realen internationalen Kriminalfall Hydra Market – 
den weltweit größten Darknet-Marktplatz – und zeige, warum eine Graphendatenbank 
das mächtigste Werkzeug ist, um die Verbindungen in solch komplexen Fällen aufzudecken.

Kapitel Eins: Hydra Market – Aufstieg des größten Darknet-Marktplatzes der Welt.

Im Jahr 2015 wurde im russischsprachigen Darknet eine Plattform namens Hydra Market gegründet.
Zugänglich ausschließlich über das Tor-Netzwerk, entwickelte sich Hydra in nur wenigen Jahren
zum dominantesten illegalen Online-Marktplatz der Geschichte.

Als 2017 der Konkurrent RAMP von russischen Behörden geschlossen wurde, 
übernahm Hydra die Monopolstellung. Bis 2021 kontrollierte die Plattform
rund 80 Prozent aller Darknet-Transaktionen weltweit.

Die Zahlen sind erschreckend: 17 Millionen Kundenkonten, 19.000 Verkäufer,
und ein kumuliertes Kryptowährungsvolumen von 5,2 Milliarden US-Dollar zwischen 2015 und 2022.

Hydra bot weit mehr als nur Drogen an – obwohl der Drogenhandel das Kerngeschäft war.
Das ikonische Liefersystem namens Klad oder Zakladka funktionierte über sogenannte Dead Drops:
Drogen wurden physisch vergraben, magnetisch befestigt oder an geheimen Orten versteckt.
Käufer erhielten nach Zahlung die GPS-Koordinaten.

Darüber hinaus bot Hydra gestohlene Finanzdaten, gefälschte Identitätsdokumente, 
Hacking-als-Dienstleistung, Ransomware-as-a-Service, Falschgeld und einen hochentwickelten 
Bitcoin-Mixing-Service namens Bitcoin Bank Mixer an.

Kapitel Zwei: Die Schlüsselpersonen.

Im Zentrum des Graphen sehen Sie Hydra Market als zentralen Knoten. 
Von ihm gehen Verbindungen zu den wichtigsten Akteuren aus.

Stanislav Moiseyev – Gründer und Hauptbetreiber von Hydra.
Am 2. Dezember 2024 verurteilte das Moskauer Regionalgericht Moiseyev zu lebenslanger Haft.
Es war das erste Mal in der russischen Geschichte, dass ein Angeklagter für Drogenhandel 
lebenslänglich verurteilt wurde. 15 seiner Mitverschwörer erhielten Strafen zwischen 8 und 23 Jahren.

Dmitry Pavlov, 30 Jahre alt, betrieb über seine Firma Promservice Limited in Nowosibirsk 
die physische Server-Infrastruktur von Hydra – sogenanntes Bulletproof Hosting.
Am 5. April 2022 wurde er von einem Bundesgericht in Nord-Kalifornien angeklagt:
Verschwörung zum Drogenhandel und Geldwäsche.

Im Graphen sehen Sie auch die Verbindungen zu internationalen Kriminellen:
Heather Morgan und Ilya Lichtenstein – die Bitfinex-Hacker – nutzten Hydras Bitcoin-Mixer, 
um Erlöse aus dem 4,5-Milliarden-Dollar-Hack zu waschen.
Die mexikanischen Drogenkartelle Sinaloa und das Jalisco New Generation Cartel 
wuschen über Hydra systematisch Geld durch Smurfing – Kleintransaktionen unter 7.500 Dollar.

Kapitel Drei: Die Verbindung zur Ransomware und kritischen Infrastruktur.

Besonders alarmierend war die Rolle von Hydra als Geldwäsche-Plattform für Ransomware-Gruppen.
DarkSide – verantwortlich für den Colonial-Pipeline-Angriff im Mai 2021, der die gesamte 
US-Ostküste lahmlegte – cashten rund 4 Prozent ihrer Bitcoin-Gewinne über Hydra aus.
Ryuk, REvil und Conti wuschen zusammen mindestens 8 Millionen Dollar über die Plattform.
Conti allein transferierte 6 Millionen Dollar über die sanktionierte Börse Garantex.

Im Graphen sehen Sie diese Verbindungskette deutlich:
Von der Ransomware-Gruppe über Hydra zu den Kryptobörsen – Garantex, SUEX, CHATEX –
alle in der Moskauer Federation Tower angesiedelt, alle inzwischen sanktioniert.

Kapitel Vier: Die internationale Ermittlung und Abschaltung.

Im August 2021 begannen das Bundeskriminalamt und die Zentralstelle zur Bekämpfung 
der Internetkriminalität in Frankfurt eine verdeckte Ermittlung gegen Hydra-Server-Infrastruktur in Deutschland.

Am 5. April 2022 schlug die Stunde: Das BKA, geleitet von Ermittler Sebastian Zwiebel, 
beschlagnahmte die Hydra-Server und 543,3 Bitcoin im Wert von rund 25 Millionen Dollar.

Zeitgleich koordinierte die JCODE Task Force in den USA – bestehend aus FBI, DEA, 
IRS Criminal Investigation, Homeland Security und dem Postal Inspection Service – 
die internationale Verfolgung.

Das OFAC, die Sanktionsbehörde des US-Finanzministeriums, setzte Hydra und Garantex 
auf die Sanktionsliste und blockte über 100 Kryptowährungsadressen. 
2024 folgten Sanktionen gegen Bitpapa und NetExchange.

Im Graphen sehen Sie dieses internationale Netzwerk der Strafverfolgung:
Deutsche, amerikanische und russische Behörden – verbunden durch Ermittlungskanten zum zentralen Hydra-Knoten.
Jede Behörde, jedes Gericht, jede Sanktion ist als eigener Knoten modelliert,
mit den relevanten Metadaten als Knotenattribute.

Kapitel Fünf: Nachfolger und die Fragmentierung des Darknet.

Nach der Abschaltung von Hydra fragmentierte sich der russischsprachige Darknet-Markt.
OMG!OMG! übernahm mit 65 Prozent den größten Marktanteil.
Mega, Blacksprut, Solaris und Kraken kämpften um den Rest.
Im Januar 2023 kaperte Kraken sogar den Konkurrenten Solaris.
Das Wayaway-Forum blieb als langjähriger Partner weiterhin aktiv.

Alle diese Nachfolgemärkte sind im Graphen als Organisationsknoten modelliert,
mit Kanten die ihre Beziehung zu Hydra beschreiben: Nachfolger von, Konkurrent von, oder Partner.

Kapitel Sechs: Warum eine Graphendatenbank Kriminelle schneller vor Gericht bringt.

Erstens: Netzwerktraversierung in Echtzeit. 
Hydra hat über 80 Entitäten und mehr als 130 Beziehungen in unserem Graphen.
In einer relationalen Datenbank bräuchten Sie dutzende Tabellen-Joins.
In einer Graphendatenbank wie Neo4j folgen Sie einfach den Kanten – in Millisekunden.
Die Frage "Welche Ransomware-Gruppen nutzten Hydra, und über welche Börsen wuschen sie Geld?"
wird durch eine einzige Graph-Traversierung von drei Hops beantwortet.

Zweitens: Mustererkennung über Silos hinweg.
Traditionelle Polizeisysteme speichern Drogendelikte, Cyberangriffe und Geldwäsche 
in getrennten Datenbanken. Der Fall Hydra zeigt: Diese Verbrechen sind vernetzt.
Ein Graph verbindet automatisch den Ransomware-Angriff auf Colonial Pipeline 
mit dem Bitcoin-Mixer auf Hydra und den Kryptobörsen in Moskau –
Zusammenhänge, die in Silos monatelang unentdeckt blieben.

Drittens: Echtzeit-Alerting bei neuen Ermittlungsdaten.
Wird ein neuer Kryptovorfall gemeldet und eine bekannte Wallet-Adresse taucht auf,
erkennt der Graph sofort: Diese Adresse ist bereits mit Hydra verknüpft –
ein direkter Ermittlungshinweis, der in Tabellen erst nach manuellem Abgleich aufgefallen wäre.

Viertens: Gerichtsverwertbare Beweisketten.
Jede Kante im Graphen trägt Metadaten: Zeitstempel, Rechtsgrundlage, Sachbearbeiter.
Die Chain of Evidence – von der Beschlagnahmung der 543 Bitcoin 
über die Blockchain-Analyse bis zur Verurteilung von Moiseyev – 
ist als zusammenhängender Pfad im Graphen nachvollziehbar.

Fünftens: Internationale Zusammenarbeit durch Teilgraphen.
BKA, FBI, OFAC und Europol arbeiten an unterschiedlichen Aspekten desselben Falls.
Durch Graph-basierte Zugriffskontrolle kann jede Behörde genau den Teilgraphen sehen,
der für ihren Zuständigkeitsbereich relevant ist – datenschutzkonform und in Echtzeit.

Zusammenfassung.

Der Fall Hydra Market demonstriert eindrucksvoll, warum moderne Kriminalitätsbekämpfung 
vernetzte Datenstrukturen braucht. Ein einzelner Darknet-Marktplatz verband Drogenhandel 
in zehn Ländern, Ransomware-Angriffe auf kritische Infrastruktur, Geldwäsche über sanktionierte Börsen,
mexikanische Kartelle und den größten Kryptohack in der Geschichte.

Nur ein Wissensgraph kann diese Komplexität abbilden, durchsuchen und in Echtzeit auswerten.

Das ist CASSA – die Zukunft der Ermittlungsarbeit. 
Eine Graphendatenbank, die genauso vernetzt denkt wie die organisierte Kriminalität selbst agiert.
""".strip()

# ── Voice preference (German professional voices) ────────────────────────────
PREFERRED_VOICE_NAMES = [
    "Jessica", "Rachel", "Antoni", "Adam",  # fallback to English-capable voices
]


def save_api_key(api_key: str) -> None:
    env_path = Path(__file__).parent.parent / ".env"
    lines = []
    found = False
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                lines.append(f"ELEVENLABS_API_KEY={api_key}")
                found = True
            else:
                lines.append(line)
    if not found:
        lines.append(f"ELEVENLABS_API_KEY={api_key}")
    env_path.write_text("\n".join(lines) + "\n")
    print(f"✓ API key saved to {env_path}")


def login() -> str:
    api_key = input("Enter your ElevenLabs API key: ").strip()
    if not api_key:
        print("Error: API key cannot be empty.", file=sys.stderr)
        sys.exit(1)
    save_api_key(api_key)
    return api_key


def get_api_key() -> str:
    # 1. env var
    key = os.getenv("ELEVENLABS_API_KEY")
    if key:
        return key
    # 2. .env file
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("ELEVENLABS_API_KEY="):
                return line.split("=", 1)[1].strip()
    return ""


def find_best_voice(client) -> tuple[str, str]:
    """Return (voice_id, voice_name) – prefer German or professional voices."""
    try:
        voices = client.voices.get_all()
        voice_list = voices.voices
        # Try to find a German or preferred voice
        for name in PREFERRED_VOICE_NAMES:
            for v in voice_list:
                if name.lower() in v.name.lower():
                    return v.voice_id, v.name
        # Fall back to first available
        if voice_list:
            v = voice_list[0]
            return v.voice_id, v.name
    except Exception as e:
        print(f"Warning: could not fetch voices – {e}", file=sys.stderr)
    # Built-in fallback: Rachel (en)
    return "21m00Tcm4TlvDq8ikWAM", "Rachel"


def generate(api_key: str, output_path: Path) -> None:
    from elevenlabs.client import ElevenLabs

    client = ElevenLabs(api_key=api_key)

    print("Fetching available voices …")
    voice_id, voice_name = find_best_voice(client)
    print(f"Using voice: {voice_name} ({voice_id})")

    print("Generating audio …")
    audio_stream = client.text_to_speech.convert(
        voice_id=voice_id,
        output_format="mp3_44100_128",
        text=HYDRA_NARRATION,
        model_id="eleven_multilingual_v2",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        for chunk in audio_stream:
            f.write(chunk)

    size_kb = output_path.stat().st_size // 1024
    print(f"✓ Audio saved to {output_path} ({size_kb} KB)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Operation Hydra audio via ElevenLabs")
    parser.add_argument("--login", action="store_true", help="Prompt for API key and save to .env")
    parser.add_argument("--output", default="public/audio/hydra_erklaerung.mp3", help="Output file path")
    args = parser.parse_args()

    if args.login:
        api_key = login()
    else:
        api_key = get_api_key()
        if not api_key:
            print("No API key found. Run with --login to set one, or set ELEVENLABS_API_KEY.", file=sys.stderr)
            sys.exit(1)

    output_path = Path(__file__).parent.parent / args.output
    generate(api_key, output_path)


if __name__ == "__main__":
    main()
