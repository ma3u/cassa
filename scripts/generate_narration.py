#!/usr/bin/env python3
"""Generate ElevenLabs narration audio for CASSA police knowledge graph."""
import json, urllib.request, os, sys

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "sk_7b84de73a0b49273b9e91f6735696d0097a56f967ef8b4ba")
VOICE_ID = "ekJ0doQ5Wa25P7W5HCj7"  # Lucius - Deep voice, male, old, German

NARRATION_TEXT = """Meine Damen und Herren, hier spricht Kriminaldirektor Weber vom Bundeskriminalamt.

Ich lade Sie ein, einen Blick hinter die Kulissen moderner Ermittlungsarbeit zu werfen, und zu verstehen, warum ein Knowledge Graph das entscheidende Werkzeug im Kampf gegen organisierte Kriminalität ist.

Stellen Sie sich vor, Sie ermitteln gegen ein internationales Darknet-Netzwerk. Sie haben Millionen von Datenpunkten — Personen, Konten, Kryptowährungsadressen, Kommunikationsverläufe, Beweismittel, Gerichtsbeschlüsse. In klassischen Datenbanken liegen diese Informationen in getrennten Silos. Zusammenhänge bleiben unsichtbar. Genau hier setzt der Knowledge Graph an: Er verbindet alle Entitäten und ihre Beziehungen in einem einzigen, navigierbaren Wissensnetz. Was ein Analyst in Tagen zusammenträgt, zeigt der Graph in Sekunden.

Doch ein Graph allein reicht nicht. Polizeiliche Ermittlungen unterliegen strengen rechtlichen und zeitlichen Rahmenbedingungen. Deshalb haben wir eine Multi-Layered Ontologie-Architektur mit vier Schichten entwickelt.

Schicht Eins ist die Normative Schicht, das strukturelle Skelett. Sie bildet die gesamte Hierarchie der Rechtsquellen ab — vom EU-Recht über das Grundgesetz und die Strafprozessordnung bis hin zu den Landespolizeigesetzen und Dienstvorschriften. Das System kennt die Normenhierarchie und traversiert sie konsistent. Jede Ermittlungsmaßnahme wird automatisch gegen die geltende Rechtsgrundlage geprüft.

Schicht Zwei ist die Zeitliche Dimension, Validität und Versionierung. Jede Rechtsgrundlage hat eine zeitliche Gültigkeit. Das System prüft automatisch, welche Gesetzesfassung zum Tatzeitpunkt galt, berechnet Verjährungsfristen korrekt und warnt rechtzeitig vor ablaufenden Haftprüfungsterminen oder TKÜ-Verlängerungen.

Schicht Drei ist die Prozedurale Zustandsmaschine, die Prozessdimension. Hier werden Ermittlungsverfahren als formale Prozesse mit definierten Zuständen, Übergängen und Fristen modelliert. Das System macht proaktive Vorschläge für nächste Schritte, überwacht Verfahrenszustände und stellt sicher, dass keine Frist versäumt wird.

Schicht Vier ist der Fallbezogene Overlay, die Faktendimension. Hier liegen die konkreten Fakten eines Ermittlungsvorgangs: Personen, Beweismittel, Zeugenaussagen, Kommunikationsdaten, Finanztransaktionen. All diese Fakten werden im Kontext der darunterliegenden drei Schichten interpretiert und verknüpft.

Was Sie jetzt vor sich sehen, ist genau ein solcher Knowledge Graph. Er zeigt die Operation Hydra — die Zerschlagung des weltweit größten Darknet-Marktplatzes. Jeder Knoten ist eine Entität, jede Verbindungslinie eine nachgewiesene Beziehung. Personen, Organisationen, Kryptobörsen, Sanktionen, Rechtsgrundlagen — alles miteinander verwoben.

Diese vier Schichten zusammen bilden einen digitalen Zwilling des Ermittlungsfalls. Kein Datensilo, keine verlorene Verbindung, keine übersehene Frist. Das ist die Zukunft der Polizeiarbeit.

Danke für Ihre Aufmerksamkeit."""

# Use ElevenLabs text-to-speech API
url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
payload = json.dumps({
    "text": NARRATION_TEXT,
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
        "stability": 0.65,
        "similarity_boost": 0.80,
        "style": 0.35,
        "use_speaker_boost": True
    }
}).encode("utf-8")

req = urllib.request.Request(
    url,
    data=payload,
    headers={
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    },
    method="POST"
)

output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "audio", "hydra_briefing.mp3")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

print(f"Generating speech with voice: Lucius (Deep voice)...")
print(f"Text length: {len(NARRATION_TEXT)} characters")
print(f"Output: {output_path}")

try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        audio_data = resp.read()
        with open(output_path, "wb") as f:
            f.write(audio_data)
        size_kb = len(audio_data) / 1024
        print(f"Success! Audio saved: {size_kb:.0f} KB ({size_kb/1024:.1f} MB)")
except urllib.error.HTTPError as e:
    error_body = e.read().decode("utf-8", errors="replace")
    print(f"HTTP Error {e.code}: {e.reason}")
    print(f"Response: {error_body}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
