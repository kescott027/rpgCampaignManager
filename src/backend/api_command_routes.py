# api_config_routes.py (unified session command router)

import logging
from fastapi import APIRouter, Request
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy
from src.backend.controller_command import CommandInterpreter

router = APIRouter()
Interpreter = CommandInterpreter()
config = Configuration()


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
    if verb.lower() in ("set", "next"):  #  handle protected words
        verb_initial = verb.lower()
        verb = verb + "_action"
        logging.info(f"found command {verb_initial}, parsing as {verb}")

    return Interpreter.parse_command(verb, args)


@router.get("/api/session/initiative")
def get_initiative_order():
    return {
        "order": config.cached_configs.get("initiative_order", []),
        "characters": config.cached_configs.get("characters", [])
    }


@router.post("/api/session/initiative")
def update_initiative_order(data: dict):
    try:
        order = data.get("order")
        if isinstance(order, list):
            config.cached_configs["initiative_order"] = order
            config.write_cached_configs()
            return {"status": "updated"}
        else:
            return {"error": "Invalid format. Expected list."}
    except Exception as e:
        logging.error(f"Error updating initiative: {e}")
        return {"error": str(e)}

