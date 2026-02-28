def calculate_risk(detection, cves, ip_intel):
    score = 0

    # Detection confidence weight
    confidence = detection.get("confidence", 0)
    score += confidence * 50

    # CVSS contribution
    if cves:
        for cve in cves:
            if cve.get("cvss_score"):
                score += cve["cvss_score"] * 2
                break  # only use highest one

    # VirusTotal contribution
    if ip_intel and ip_intel.get("reputation"):
        malicious = ip_intel["reputation"].get("malicious", 0)
        suspicious = ip_intel["reputation"].get("suspicious", 0)
        score += malicious * 5
        score += suspicious * 2

    # Classification
    if score >= 86:
        level = "CRITICAL"
    elif score >= 61:
        level = "HIGH"
    elif score >= 31:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "risk_score": round(score, 2),
        "risk_level": level
    }