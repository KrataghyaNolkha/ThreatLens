from fastapi import APIRouter
from services.mitre_service import get_technique_by_id

router = APIRouter()


@router.get("/technique/{tech_id}")
def get_mitre_technique(tech_id: str):
    technique = get_technique_by_id(tech_id)

    if not technique:
        return {"error": "Technique not found"}

    return technique