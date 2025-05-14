# api_config_routes.py (unified session command router)
from fastapi import APIRouter, Request
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy
from src.backend.controller_command import CommandInterpreter

router = APIRouter()
Interpreter = CommandInterpreter()

@router.post("/api/session/command")
async def handle_session_command(request: Request):
    data = await request.json()
    raw_command = data.get("command", "").strip()

    if not raw_command.startswith("/"):
        return {"error": "Invalid command syntax. Use / to prefix commands."}

    command_line = raw_command[1:].strip()
    parts = command_line.split()
    verb = parts[0].lower() if parts else ""
    args = parts[1:] if len(parts) > 1 else []
    remainder = " ".join(args)

    # === Command routing ===
    if verb.lower() == ("set" or "next"):  #  handle protected words
        verb = verb + "_action"

    return Interpreter.parse_command(verb, args)

