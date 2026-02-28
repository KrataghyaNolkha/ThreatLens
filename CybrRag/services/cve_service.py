import requests
from config import settings

NVD_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"


def search_cves(keyword: str, max_results: int = 3):
    params = {
        "keywordSearch": keyword,
        "resultsPerPage": max_results
    }

    headers = {}

    if settings.NVD_API_KEY:
        headers["apiKey"] = settings.NVD_API_KEY

    response = requests.get(NVD_URL, params=params, headers=headers)
    response.raise_for_status()

    data = response.json()

    results = []

    for item in data.get("vulnerabilities", []):
        cve_data = item.get("cve", {})
        metrics = cve_data.get("metrics", {})

        cvss_score = None

        if "cvssMetricV31" in metrics:
            cvss_score = metrics["cvssMetricV31"][0]["cvssData"]["baseScore"]

        results.append({
            "cve_id": cve_data.get("id"),
            "description": cve_data.get("descriptions", [{}])[0].get("value"),
            "cvss_score": cvss_score
        })

    return results