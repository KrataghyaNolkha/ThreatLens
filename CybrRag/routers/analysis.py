from fastapi import APIRouter
from pydantic import BaseModel
from services.parser import parse_log
from services.detector import detect_threat
from services.mitre_service import get_technique_by_id
from services.cve_service import search_cves
from services.ip_intel_service import enrich_ip
from services.risk_engine import calculate_risk
from services.llm_service import generate_soc_summary
router = APIRouter()

class LogInput(BaseModel):
    log: str


@router.post("/analyze")
def analyze_log(data: LogInput):
    parsed = parse_log(data.log)
    detection = detect_threat(parsed)

    mitre_details = None
    cve_results = None
    ip_intel = None

    # MITRE + CVE
    if detection.get("mitre_candidate"):
        mitre_details = get_technique_by_id(detection["mitre_candidate"])

        if mitre_details:
            cve_results = search_cves(mitre_details["name"])

    # IP Enrichment
    if parsed.get("source_ip"):
        ip_intel = enrich_ip(parsed["source_ip"])

    risk = calculate_risk(detection, cve_results, ip_intel)
    soc_summary = generate_soc_summary(
        parsed,
        detection,
        mitre_details,
        cve_results,
        ip_intel,
        risk
    )
    return {
        "parsed_log": parsed,
        "detection_result": detection,
        "mitre_details": mitre_details,
        "related_cves": cve_results,
        "ip_intelligence": ip_intel,
        "risk_assessment": risk,
        "soc_summary": soc_summary
    }