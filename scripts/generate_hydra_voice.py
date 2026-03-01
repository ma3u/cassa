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

# ── Narration text (German) — warm, friendly narrator voice ──────────────
HYDRA_NARRATION = """
Hallo und willkommen bei CASSA — dem intelligenten Wissensgraphen, entwickelt von Sopra Steria.

Fangen wir mit einer ehrlichen Frage an: Warum kann man nicht einfach ChatGPT für polizeiliche Ermittlungen nutzen?

Die Antwort ist simpel — und gleichzeitig komplex. ChatGPT und andere Large Language Models haben drei fundamentale Probleme im Ermittlungskontext.

Erstens: Halluzinationen. Ein LLM erfindet plausibel klingende Fakten. In einem Strafverfahren kann das katastrophal sein — ein falscher Zusammenhang, eine erfundene Rechtsgrundlage, und ein Beschuldigter wird zu Unrecht verfolgt oder ein Täter kommt frei.

Zweitens: Keine rechtliche Validierung. ChatGPT weiß nicht, welche Fassung der Strafprozessordnung zum Tatzeitpunkt galt. Es kann keine Verjährungsfristen berechnen, keine Haftprüfungstermine überwachen, und keine TKÜ-Verlängerungen fristgerecht anstoßen.

Drittens: Keine Beweiskette. Vor Gericht muss jeder Ermittlungsschritt nachvollziehbar sein — wer hat wann was gesichert, auf welcher Rechtsgrundlage, mit welchem Ergebnis. Ein LLM liefert Text ohne Herkunftsnachweis. Das ist nicht gerichtsverwertbar.

Genau hier setzt CASSA an — mit einer Multi-Layered Ontologie-Architektur in vier Schichten.

Schicht Eins ist die Normative Schicht. Sie bildet die gesamte Hierarchie der Rechtsquellen ab — vom EU-Recht über das Grundgesetz und die StPO bis hin zu Landespolizeigesetzen und Dienstvorschriften. Jede Ermittlungsmaßnahme wird automatisch gegen die geltende Rechtsgrundlage geprüft — das kann kein LLM.

Schicht Zwei ist die Zeitliche Dimension. Jedes Gesetz hat eine zeitliche Gültigkeit. Das System prüft automatisch, welche Fassung zum Tatzeitpunkt galt, berechnet Verjährungsfristen und warnt rechtzeitig vor ablaufenden Terminen.

Schicht Drei ist die Prozedurale Zustandsmaschine. Ermittlungsverfahren werden als formale Prozesse modelliert — mit definierten Zuständen, Übergängen und Fristen. Das System schlägt proaktiv nächste Schritte vor und stellt sicher, dass keine Frist versäumt wird.

Schicht Vier ist der Fallbezogene Overlay. Hier liegen die konkreten Fakten: Personen, Beweismittel, Kommunikationsdaten, Finanztransaktionen. All diese Fakten werden im Kontext der darunterliegenden drei Schichten interpretiert.

Jetzt wird es spannend — schauen wir uns den konkreten Fall an. Was ihr im Graphen seht, ist die Operation Hydra: die Zerschlagung des weltweit größten Darknet-Marktplatzes. Und dieser Fall zeigt perfekt, warum ein vernetzter Wissensgraph unverzichtbar ist.

Hydra Market wurde 2015 von Stanislav Moiseyev gegründet und zusammen mit 15 Mittätern betrieben. Dmitry Pavlov administrierte über seine Firma Promservice die Server-Infrastruktur, die sich physisch in Deutschland befand — erreichbar ausschließlich über das Tor-Netzwerk. Allein in diesem ersten Satz stecken schon fünf verknüpfte Entitäten: eine Person, eine Organisation, eine Firma, eine Infrastruktur und ein Land. Das ist die Stärke eines Graphen — alles ist mit allem verbunden.

Die Plattform hatte 17 Millionen Kundenkonten und 19.000 Verkäufer. Hydra bot zwölf verschiedene Service-Kategorien an: Drogenhandel mit einem einzigartigen Dead-Drop-System namens Klad oder Zakladka, einen eingebauten Bitcoin-Mixer, Cash-Out-Services, gefälschte Dokumente, gestohlene Finanzdaten, Hacking-Tools, Ransomware-as-a-Service, Falschgeld — und dazu ein internes Escrow-System, Streitschlichtung und ein Bewertungssystem. Jeder dieser zwölf Services ist im Graph ein eigener Knoten, direkt mit Hydra Market verlinkt.

Was den Fall besonders komplex macht: Hydra bediente zehn Länder — Russland, Ukraine, Belarus, Kasachstan, Aserbaidschan, Armenien, Kirgisistan, Usbekistan, Tadschikistan und Moldawien. Im Graphen sieht man diese zehn Länder als Knoten, jeweils über die Beziehung SERVED MARKET mit Hydra verbunden. Das allein zeigt: mit einer klassischen Aktenstruktur wäre das nicht darstellbar.

Noch komplexer wird das Netzwerk durch die Geldwäsche. Vier große Ransomware-Gruppen — DarkSide, Ryuk, REvil und Conti — nutzten Hydras Bitcoin-Mixer, um Lösegelder zu waschen. DarkSide war die Gruppe hinter dem Colonial-Pipeline-Angriff 2021, der die Treibstoffversorgung an der US-Ostküste lahmlegte. Dazu kamen zwei mexikanische Kartelle — das Sinaloa-Kartell unter Ismael Zambada und das CJNG unter Nemesio Oseguera — die Hydra ebenfalls zur Geldwäsche nutzten. Und dann wären da noch Ilya Lichtenstein und Heather Morgan, bekannt als Dutch und Razzlekhan, die gestohlene Bitcoin aus dem Bitfinex-Hack über Hydras Mixer-Service wuschen.

Im Graphen ergibt das ein hochvernetztes Netz: Personen führen Organisationen, Organisationen nutzen Services, Services gehören zu Hydra, und alles ist über unterschiedliche Beziehungstypen wie LEADS, USED FOR LAUNDERING und USED MIXER SERVICE verbunden. Ein einzelnes Dokument könnte diese Zusammenhänge niemals so darstellen.

Und dann die Finanzspur: Garantex, SUEX und Chatex — drei Kryptobörsen, die Hydra-Gelder wuschen — hatten alle ihren Sitz im selben Gebäude: dem Federation Tower in Moskau. Im Graphen ist das sofort sichtbar: drei Organisations-Knoten, alle über LOCATED AT mit demselben Infrastruktur-Knoten verbunden. So eine räumliche Koinzidenz fällt in Akten vielleicht nie auf — im Graphen springt sie ins Auge.

Am 5. April 2022 schlug die Stunde Null. BKA-Ermittler Sebastian Zwiebel leitete die Operation, bei der die Server beschlagnahmt und 543 Bitcoin sichergestellt wurden. Gleichzeitig koordinierte die JCODE Task Force in den USA die internationale Verfolgung — ein Zusammenschluss aus FBI, DEA, IRS Criminal Investigation, Homeland Security und dem U.S. Postal Inspection Service.

Das OFAC setzte daraufhin nicht nur Hydra und Garantex auf die Sanktionsliste, sondern später auch Bitpapa und NetExchange. Über 100 Kryptowallet-Adressen landeten auf der SDN-Liste — der Specially Designated Nationals List. Die rechtliche Grundlage dafür war Executive Order 13694. Im Graphen ist all das als Event-Kette modelliert: Gründung, RAMP-Schließung, Ermittlungsbeginn, Beschlagnahmung, Anklage, Sanktionen, und schließlich Moiseyevs lebenslange Freiheitsstrafe durch das Moskauer Bezirksgericht.

Und nach der Schließung von Hydra? Im Graph sieht man fünf Nachfolger-Märkte — OMG OMG, Mega, Blacksprut, Solaris und Kraken — alle über SUCCESSOR OF mit Hydra verbunden. Kraken übernahm sogar Solaris komplett. Und auch die Nachfolger wurden Opfer: OMG wurde per DDoS attackiert, Blacksprut wurde gehackt. Die Geschichte geht weiter, und der Graph wächst mit.

Dieser Fall nutzte zahlreiche internationale Standards. STIX 2.1 für den standardisierten Austausch von Bedrohungsinformationen zwischen BKA, FBI und Europol — jede Entität im Graph trägt einen STIX-Typ, zum Beispiel threat-actor für Moiseyev oder infrastructure für die Server. ISO 27037 und ISO 27042 für die forensische Sicherung und Analyse der Beweismittel — die Serverimages, die Wallets, die Kommunikationsdaten. NIST SP 800-86 als Framework für die digitale Forensik. XPolizei 2.0 für den Datenaustausch zwischen deutschen Bundes- und Landesbehörden. Und Executive Order 13694 als Rechtsgrundlage der OFAC-Sanktionen.

Die Best Practices aus dem Hydra-Fall:

Digitale Beweissicherung: SHA-256-Hashwerte bei jeder Sicherung, Write-Blocker, Vier-Augen-Prinzip — lückenlose Chain of Custody nach ISO 27037.

Blockchain-Forensik: Cluster-Analyse von Wallet-Adressen, Cross-Chain-Tracking über Mixer hinweg, automatischer OFAC-Abgleich. Genau so wurde die Verbindung zwischen Garantex, SUEX, Chatex und dem Federation Tower entdeckt.

Strukturierte Ermittlungsführung: Im Graph werden Hypothesen modelliert. Wenn ein neuer Knoten auftaucht — sagen wir, eine neue Wallet-Adresse — verbindet das System automatisch über bestehende Beziehungen. Fristenmanagement läuft automatisch. Aktenzeichen verknüpfen alle Beweismittel.

Und schließlich: der neuro-symbolische Ansatz — LLM-Sprachverarbeitung kombiniert mit deterministischer Graph-Validierung. Das LLM hilft beim Verstehen von Freitext, aber die Validierung läuft über den Graphen. Keine Halluzinationen. Gerichtsverwertbar. BVerfG-konform.

88 Knoten, 113 Beziehungen, 18 Knotentypen, 10 Länder, 12 Services, 7 Schlüsselpersonen, 12 Ereignisse — das ist der Hydra Graph. Und das ist CASSA: ein System, das genauso vernetzt denkt wie die organisierte Kriminalität selbst agiert. Aber auf der richtigen Seite des Gesetzes.
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
