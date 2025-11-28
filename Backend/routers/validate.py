from fastapi import APIRouter
import re

router = APIRouter()

@router.post("/validate")
def validate_code(data: dict):
    code = data["code"]

    patterns = [
        r"console\.log",
        r"let\s",
        r"const\s",
        r"function\s",
    ]

    for p in patterns:
        if re.search(p, code):
            return {"ok": True, "msg": "Correcto"}

    return {"ok": False, "msg": "Incorrecto"}
