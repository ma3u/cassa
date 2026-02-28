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
Willkommen bei CASSA – dem intelligenten Wissensgrafen für die organisierte Kriminalitätsbekämpfung von Sopra Steria.

Was Sie hier sehen, ist Operation Hydra: ein reales Fallszenario, das zeigt, wie CASSA komplexe Ermittlungen sichtbar macht.

Im Mittelpunkt steht Viktor "Wolf" Sokolov – mutmaßlicher Kopf einer grenzüberschreitenden kriminellen Organisation. 
Sein Netzwerk verbindet vier Kernsachverhalte: Organisierte Kriminalität, Cybercrime, Geldwäsche und Betäubungsmittelhandel.

Der Cybercrime-Komplex ist besonders bedeutsam. Leon "Byte" Krause entwickelte die Ransomware HydraLock – 
sie traf vierzehn europäische Unternehmen, darunter das Klinikum Nord und die Stadtwerke Kiel als kritische Infrastruktur. 
Schaden: über drei Millionen Euro. Meldepflichten nach NIS2 und DSGVO wurden ausgelöst.

Gleichzeitig lief eine internationale Geldwäsche-Struktur über Scheinfirmen in Frankfurt, Tallinn und ein Schweizer Nummernkonto – 
ein Gesamtvolumen von rund 47 Millionen Euro. Maria Petrova, derzeit auf der Fahndungsliste, koordinierte die Finanzkanäle.

Ergänzt wird das Bild durch Darknet-Drogenhandel: 145 Kilogramm Kokain und 23 Kilogramm Heroin – 
beschlagnahmt im Hamburger Hafen, Straßenwert neun Millionen Euro.

CASSA verbindet all diese Sachverhalte: Verdächtige, Beweismittel, Konten, Kommunikationsdaten, Fahrzeuge, 
Standorte, Rechtsgrundlagen und EU-Regulierungen – alles in einem einzigen, interaktiven Wissensgraphen.

Die KI-gestützte Wahrscheinlichkeitsbewertung hilft Ermittlern, die relevantesten Hinweise zu priorisieren. 
Strafanzeigen – ob über die Internetwache oder die Polizei-App – werden automatisch mit bestehenden Verfahren verknüpft.

Das ist CASSA: Vernetzte Intelligenz für eine wirksamere Strafverfolgung.
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
    parser.add_argument("--output", default="public/audio/hydra_narration.mp3", help="Output file path")
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
