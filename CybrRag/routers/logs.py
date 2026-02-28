from fastapi import APIRouter
from pydantic import BaseModel
from services.parser import parse_log

router = APIRouter()

class LogInput(BaseModel):
    log: str


@router.post("/parse")
def parse_log_endpoint(data: LogInput):
    parsed = parse_log(data.log)
    return {
        "parsed_log": parsed
    }