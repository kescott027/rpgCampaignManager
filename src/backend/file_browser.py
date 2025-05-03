# from __future__ import annotations
import os
import re
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi import APIRouter
from .gpt_proxy import GPTProxy
from typing import Optional, List, Iterator, cast
from pydantic import BaseModel

app = FastAPI()
router = APIRouter()
gpt = GPTProxy()

BASE_DIR = os.path.abspath("../../assets/my_campaigns")


def secure_path(path: str) -> str:
    # Prevent directory traversal
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(BASE_DIR):
        raise ValueError("Unauthorized path access")
    return abs_path


class ChatRequest(BaseModel):
    message: str
    session_name: Optional[str] = None
    tags: Optional[List[str]] = []


class SecretPayload(BaseModel):
    openaiKey: Optional[str] = None
    googleKey: Optional[str] = None


class SecretCheckResponse(BaseModel):
    missingOpenAI: bool
    missingGoogle: bool


@app.post("/api/chat")
async def chat(request: ChatRequest):
    response = gpt.send(request.message)
    gpt.save_log()  # saves to a new session file

    # Format session name
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    clean_name = re.sub(r"\W+", "-", request.session_name or "session").strip("-")
    tag_part = f"-{'_'.join(request.tags)}" if request.tags else ""
    filename = f"chatlogs/{clean_name}{tag_part}-{timestamp}.json"

    gpt.save_log(filename)
    return {"response": response}


@app.get("/api/list-dir")
def list_dir(path: str = Query(default=BASE_DIR)):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "Path not found"})

        items = []

        entries = cast(Iterator[os.DirEntry], os.scandir(abs_path))
        for entry in entries:
            items.append(
                {"name": entry.name, "type": "directory" if entry.is_dir() else "file"}
            )
        return {"path": abs_path, "items": items}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/api/load-file")
def load_file(path: str):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "File not found"})

        ext = os.path.splitext(abs_path)[1].lower()
        if ext in [".md", ".txt", ".log"]:
            with open(abs_path, "r", encoding="utf-8") as f:
                return {"content": f.read(), "type": "text"}
        elif ext == ".json":
            with open(abs_path, "r", encoding="utf-8") as f:
                return {"content": f.read(), "type": "json"}
        elif ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            return {"content": "", "type": "image"}
        else:
            return {"content": "[Unsupported file type]", "type": "text"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/api/load-image")
def load_image(path: str):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "Image not found"})
        return FileResponse(abs_path)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/api/secrets/check", response_model=SecretCheckResponse)
async def check_secrets():
    from pathlib import Path

    openai_file = Path(".secrets/openai.env")
    google_file = Path(".secrets/google.env")

    return {
        "missingOpenAI": not openai_file.is_file(),
        "missingGoogle": not google_file.is_file()
    }


@app.post("/api/secrets/save")
async def save_secrets(payload: SecretPayload):
    os.makedirs(".secrets", exist_ok=True)

    if payload.openaiKey:
        with open(".secrets/openai.env", "w") as f:
            f.write(f"OPENAI_API_KEY={payload.openaiKey}\n")

    if payload.googleKey:
        with open(".secrets/google.env", "w") as f:
            f.write(f"GOOGLE_API_KEY={payload.googleKey}\n")

    return {"status": "ok"}
