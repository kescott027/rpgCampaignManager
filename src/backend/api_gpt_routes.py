import os
import json
import logging
from fastapi import APIRouter, Request, Query, FastAPI
from fastapi.responses import JSONResponse
from openai import OpenAI
from pathlib import Path
from .controller_gpt import GPTProxy
from .controller_security import secure_path, GptLoader, get_gpt_key
# from src.backend.controller_configuration import Configuration as Config

logging.basicConfig(level=logging.DEBUG)
router = APIRouter()
client = OpenAI(api_key=get_gpt_key())
proxy = GPTProxy(source='api_gpt_routes')


@router.post("/api/gpt/proxy")
async def gpt_proxy(req: Request):
    try:
        body = await req.json()
        prompt = body.get("prompt")
        session = body.get("session", "default")

        if not prompt:
            return {"error": "Missing prompt"}

        chat_response = client.chat.completions.create(
            model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]
        )

        response_text = chat_response.choices[0].message.content
        return {"response": response_text}

    except Exception as e:
        return {"error": str(e)}


@router.get("/api/gpt/export-chatlog")
def export_chatlog_as_md(path: str):
    try:
        abs_path = secure_path(path)
        if not os.path.exists(abs_path):
            return JSONResponse(status_code=404, content={"error": "File not found"})

        with open(abs_path, "r") as f:
            history = json.load(f)

        md_lines = ["# 💬 GPT Chat Log\n"]
        for entry in history:
            role = entry["role"].capitalize()
            content = entry["content"]
            md_lines.append(f"**{role}:**\n\n{content}\n\n---\n")

        return {"filename": os.path.basename(path), "markdown": "\n".join(md_lines)}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@router.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    response = proxy.send(message)
    return {"response": response}
