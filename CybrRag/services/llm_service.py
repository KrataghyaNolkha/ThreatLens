import requests
import json
from config import settings

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def clean_llm_response(raw_text: str):
    """
    Extracts the first valid JSON object from LLM response safely.
    """
    import re
    import json

    try:
        raw_text = raw_text.strip()

        # Remove markdown blocks
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        # Extract first JSON object using regex
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)

        if match:
            json_text = match.group(0)
            return json.loads(json_text)

        return {"raw_response": raw_text}

    except Exception:
        return {"raw_response": raw_text}


def generate_soc_summary(parsed, detection, mitre, cves, ip_intel, risk):

    if not settings.GROQ_API_KEY:
        return {"error": "Missing GROQ_API_KEY"}

    prompt = f"""
You are a senior SOC analyst.

Analyze the following structured security event and respond ONLY in valid JSON format:

{{
  "executive_summary": "...",
  "technical_analysis": "...",
  "business_impact": "...",
  "recommended_actions": "..."
}}

Event Data:
Parsed Log: {json.dumps(parsed)}
Detection Result: {json.dumps(detection)}
MITRE: {json.dumps(mitre)}
CVEs: {json.dumps(cves)}
IP Intelligence: {json.dumps(ip_intel)}
Risk Assessment: {json.dumps(risk)}
"""

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert cybersecurity SOC analyst."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 600
    }

    response = requests.post(GROQ_URL, headers=headers, json=payload)

    if response.status_code != 200:
        return {
            "error": "Groq API Error",
            "status_code": response.status_code,
            "response": response.text
        }

    result = response.json()
    raw_output = result["choices"][0]["message"]["content"]

    return clean_llm_response(raw_output)