#!/usr/bin/env python3
"""Find suitable German male voices on ElevenLabs."""
import json, urllib.request, os

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "sk_7b84de73a0b49273b9e91f6735696d0097a56f967ef8b4ba")

# List all default/shared voices
req = urllib.request.Request(
    "https://api.elevenlabs.io/v1/voices",
    headers={"xi-api-key": API_KEY}
)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())

print("=== ALL VOICES ===")
for v in data.get("voices", []):
    labels = v.get("labels", {})
    name = v["name"]
    vid = v["voice_id"]
    gender = labels.get("gender", "?")
    age = labels.get("age", "?")
    accent = labels.get("accent", "?")
    lang = labels.get("language", "?")
    desc = labels.get("description", "?")
    use_case = labels.get("use_case", "?")
    print(f"  {vid} | {name:20s} | {gender:8s} | {age:12s} | {lang:10s} | {accent:15s} | {desc} | {use_case}")

# Search voice library for German voices
print("\n=== VOICE LIBRARY SEARCH: German ===")
req2 = urllib.request.Request(
    "https://api.elevenlabs.io/v1/shared-voices?page_size=20&language=de&gender=male&sort=usage_character_count_7d&sort_direction=desc",
    headers={"xi-api-key": API_KEY}
)
with urllib.request.urlopen(req2) as resp2:
    lib_data = json.loads(resp2.read())

for v in lib_data.get("voices", []):
    name = v.get("name", "?")
    vid = v.get("voice_id", "?")
    accent = v.get("accent", "?")
    age = v.get("age", "?")
    gender = v.get("gender", "?")
    desc = v.get("description", "?")[:80] if v.get("description") else "?"
    use_case = v.get("use_case", "?")
    rate = v.get("rate", "?")
    cloned = v.get("cloned_by_count", 0)
    print(f"  {vid} | {name:25s} | {gender:6s} | {age:12s} | {accent:15s} | cloned:{cloned:6d} | {use_case:15s} | {desc}")
