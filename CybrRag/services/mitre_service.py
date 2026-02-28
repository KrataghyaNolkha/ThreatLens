import requests
import json
import os

CACHE_FILE = "data/mitre_cache.json"

MITRE_STIX_URL = (
    "https://raw.githubusercontent.com/mitre-attack/"
    "attack-stix-data/master/enterprise-attack/enterprise-attack.json"
)


def fetch_mitre_data():
    print("Fetching MITRE ATT&CK data...")

    response = requests.get(MITRE_STIX_URL)
    response.raise_for_status()

    stix_data = response.json()

    techniques = []

    for obj in stix_data.get("objects", []):
        if obj.get("type") == "attack-pattern":
            external_refs = obj.get("external_references", [])
            technique_id = None

            for ref in external_refs:
                if ref.get("source_name") == "mitre-attack":
                    technique_id = ref.get("external_id")

            if technique_id:
                techniques.append({
                    "id": technique_id,
                    "name": obj.get("name"),
                    "description": obj.get("description")
                })

    os.makedirs("data", exist_ok=True)

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(techniques, f, indent=2)

    return techniques


def load_mitre_data():
    if not os.path.exists(CACHE_FILE):
        return fetch_mitre_data()

    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            data = f.read().strip()
            if not data:
                return fetch_mitre_data()
            return json.loads(data)
    except Exception:
        return fetch_mitre_data()


def get_technique_by_id(technique_id: str):
    techniques = load_mitre_data()

    for tech in techniques:
        if tech["id"] == technique_id:
            return tech

    return None