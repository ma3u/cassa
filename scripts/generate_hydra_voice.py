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
Willkommen bei CASSA – dem intelligenten Wissensgrafen der Polizei von Sopra Steria.

Ich erkläre Ihnen jetzt die Polizeiakte Operation Hydra, die Beziehungen zwischen den Knoten im Graphen, 
und warum eine Graphendatenbank die ideale Lösung für den modernen Polizeidienst ist.

Die Polizeiakte Operation Hydra.

Im Zentrum steht Viktor "Wolf" Sokolov – mutmaßlicher Kopf einer grenzüberschreitenden kriminellen Organisation.
In diesem Graphen sehen Sie ihn als orangefarbenen Knoten. Vier Verfahren verbinden sich mit ihm:
Organisierte Kriminalität, Cybercrime, Geldwäsche und Betäubungsmittelhandel.

Schauen wir auf die Beziehungen zwischen den Knoten.

Sokolov ist über eine direkte Kante als Hauptverdächtiger mit der Operation Hydra verknüpft. 
Von ihm führen Kanten zu seinen Mitstreitern: Leon Krause, dem Ransomware-Entwickler; 
Maria Petrova, der Finanzverwalterin; Kadir Yılmaz, zuständig für Logistik; 
Anna Bergmann, Strohfrau der Scheinfirmen; sowie zu den Lieferanten in Osteuropa und dem Vertriebsnetz in Deutschland.

Die Beweismittel-Knoten zeigen ebenfalls wichtige Verbindungen: 
Das beschlagnahmte Laptop von Krause ist direkt mit dem Ransomware-Code HydraLock verknüpft – 
und dieser wiederum mit den beiden Opfern: dem Klinikum Nord und den Stadtwerken Kiel als kritische Infrastruktur.

Die Geldflüsse verlaufen über Kontenknoten: von der Phoenix Consulting GmbH in Frankfurt 
über die Baltic Trade in Tallinn bis zu einem Schweizer Nummernkonto – insgesamt 47 Millionen Euro Geldwäsche.
Jede Transaktion ist als Kante mit Zeitstempel und Betrag gespeichert.

Rechtsgrundlagen-Knoten wie Paragraph 129 Strafgesetzbuch, Paragraph 303b Strafgesetzbuch und Paragraph 261 Strafgesetzbuch 
sind direkt mit den betroffenen Verdächtigen und Verfahren verbunden. 
Europäische Regelungen wie NIS2 und DSGVO sind mit den Opfern und dem Cybercrime-Komplex verknüpft.

Warum ist eine Graphendatenbank die optimale Lösung für den Polizeidienst?

Erstens: Komplexe Netzwerke auf einen Blick. Traditionelle Datenbanken speichern Daten in Tabellen. 
Bei einem Fall wie Hydra mit über 80 Entitäten und hunderten Beziehungen 
bräuchte man dutzende Tabellen-Joins, die Sekunden oder Minuten dauern würden. 
In einer Graphendatenbank folgt die Abfrage einfach den Kanten – in Millisekunden.

Zweitens: Entdeckung verborgener Zusammenhänge. 
Ein Ermittler kann fragen: Wer kannte Sokolov, der auch Kontakt zu einer Kryptobörse hatte? 
Der Graph traversiert alle Verbindungen und findet die Antwort sofort – 
Erkenntnisse, die in Tabellen monatelange manuelle Analyse erfordert hätten.

Drittens: Dynamische Fallverknüpfung. 
Neue Strafanzeigen werden automatisch auf Übereinstimmungen mit bestehenden Knoten geprüft. 
Kommt eine neue Anzeige mit dem Username "ByteL0rd" herein, erkennt das System sofort: 
dieser Handle ist bereits in der Beweismitteldatenbank mit Leon Krause verknüpft.

Viertens: Rechtssichere Rückverfolgbarkeit. 
Jede Kante trägt Metadaten: Zeitstempel der Erfassung, Sachbearbeiter, Rechtsgrundlage der Maßnahme. 
Die vollständige Chain of Custody ist im Graphen abbildbar – gerichtsverwertbar von Anfang an.

Fünftens: Föderale Interoperabilität. 
Durch den XPolizei-Standard können Behörden Teilgraphen sicher tauschen – 
LKA Hamburg sieht nur die freigegebenen Knoten aus dem BKA-Graphen, Europol erhält seinen eigenen Teilgraphen.

Das ist CASSA: Eine Graphendatenbank, die vernetzt denkt – genauso wie organisierte Kriminalität vernetzt agiert.
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
