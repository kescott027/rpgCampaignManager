from fastapi import APIRouter, Query
from src.backend.controller_drive import DriveController
from .controller_security import SecretCheckResponse, SecretPayload

router = APIRouter()



@router.get("/api/secrets/check", response_model=SecretCheckResponse)
async def check_secrets():
    from pathlib import Path

    openai_file = Path(".security/openai.env")
    google_file = Path(".security/google.env")

    return {
        "missingOpenAI": not openai_file.is_file(),
        "missingGoogle": not google_file.is_file(),
    }


@router.post("/api/secrets/save")
async def save_secrets(payload: SecretPayload):
    os.makedirs(".security", exist_ok=True)

    if payload.openaiKey:
        with open(".security/openai.env", "w") as f:
            f.write(f"OPENAI_API_KEY={payload.openaiKey}\n")

    if payload.googleKey:
        with open(".security/google.env", "w") as f:
            f.write(f"GOOGLE_API_KEY={payload.googleKey}\n")

    return {"status": "ok"}
