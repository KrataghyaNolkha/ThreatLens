import re
from typing import Dict


def extract_ip(text: str):
    pattern = r"(?:\d{1,3}\.){3}\d{1,3}"
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_event_id(text: str):
    match = re.search(r"EventID[:\s]+(\d+)", text, re.IGNORECASE)
    return match.group(1) if match else None


def extract_user(text: str):
    match = re.search(r"User[:\s]+(\w+)", text, re.IGNORECASE)
    return match.group(1) if match else None


def extract_status(text: str):
    if "failed" in text.lower():
        return "Failed"
    if "success" in text.lower():
        return "Success"
    return None


def detect_log_type(text: str):
    if "EventID" in text:
        return "windows"
    if "sshd" in text or "pam_unix" in text:
        return "linux"
    return "unknown"


def parse_log(raw_log: str) -> Dict:
    return {
        "event_id": extract_event_id(raw_log),
        "user": extract_user(raw_log),
        "source_ip": extract_ip(raw_log),
        "status": extract_status(raw_log),
        "log_type": detect_log_type(raw_log),
        "raw": raw_log
    }