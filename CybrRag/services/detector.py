from typing import Dict

# In-memory counter (for demo brute force detection)
failed_login_tracker = {}


def detect_threat(parsed_log: Dict) -> Dict:
    threat_type = None
    confidence = 0
    mitre_candidate = None

    event_id = parsed_log.get("event_id")
    status = parsed_log.get("status")
    ip = parsed_log.get("source_ip")
    raw = parsed_log.get("raw", "").lower()

    # -------- BRUTE FORCE DETECTION --------
    if event_id == "4625" and status == "Failed":
        if ip:
            failed_login_tracker[ip] = failed_login_tracker.get(ip, 0) + 1

            if failed_login_tracker[ip] >= 3:
                threat_type = "Brute Force Attack"
                confidence = 0.85
                mitre_candidate = "T1110"

    # -------- POWERSHELL EXECUTION --------
    if "powershell" in raw:
        threat_type = "Suspicious PowerShell Execution"
        confidence = 0.75
        mitre_candidate = "T1059"

    # -------- CREDENTIAL DUMPING --------
    if "lsass" in raw:
        threat_type = "Credential Dumping Attempt"
        confidence = 0.90
        mitre_candidate = "T1003"

    return {
        "threat_detected": threat_type,
        "confidence": confidence,
        "mitre_candidate": mitre_candidate,
        "failed_attempts_from_ip": failed_login_tracker.get(ip, 0) if ip else 0
    }