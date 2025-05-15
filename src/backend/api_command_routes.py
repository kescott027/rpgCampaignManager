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


@router.post("/api/session/help")
async def session_help_command(request: Request):
    return Interpreter.help()


@router.post("/api/session/command")
async def handle_session_command(request: Request):
    data = await request.json()
    logging.debug(f"local command request: {data}")
    raw_command = data.get("command", "").strip()
    logging.debug(f"raw command received from prompt: {raw_command}")

    if not raw_command.startswith("/"):
        return {"error": "Invalid command syntax. Use / to prefix commands."}

    command_line = raw_command[1:].strip()
    parts = command_line.split()
    verb = parts[0].lower() if parts else ""
    args = parts[1:] if len(parts) > 1 else []
    remainder = " ".join(args)
    logging.debug(f"Parsed commands:  verb: {verb} - args: {args} - remainder: {remainder}")
    # === Command routing ===
    if (verb.lower() == "set") or (verb.lower() == "next"):  #  handle protected words
        verb_initial = verb.lower()
        verb = verb + "_action"
        logging.info(f"found command {verb_initial}, parsing as {verb}")

    return Interpreter.parse_command(verb, args)


@router.get("/api/session/initiative")
def get_initiative_order():
    return {
        "order": config.cached_configs.get("initiative_order", []),
        "characters": config.cached_configs.get("characters", []),
        "scene_mapping": config.cached_configs.get("scene_mapping", {})
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


@router.post("/api/session/rename-character")
def rename_character(data: dict):
    try:
        old_name = data.get("old_name")
        new_name = data.get("new_name")

        if not old_name or not new_name:
            return {"error": "Both old_name and new_name are required"}

        # Update characters list
        characters = config.cached_configs.get("characters", [])
        config.cached_configs["characters"] = [
            new_name if name == old_name else name for name in characters
        ]

        # Update initiative_order list
        order = config.cached_configs.get("initiative_order", [])
        new_order = []
        for entry in order:
            if isinstance(entry, dict):
                updated = entry.copy()
                if entry.get("name") == old_name:
                    updated["name"] = new_name
                new_order.append(updated)
            elif entry == old_name:
                new_order.append(new_name)
            else:
                new_order.append(entry)
        config.cached_configs["initiative_order"] = new_order

        # Update scene_mapping
        scene_map = config.cached_configs.get("scene_mapping", {})
        if old_name in scene_map:
            scene_map[new_name] = scene_map.pop(old_name)

        config.cached_configs["scene_mapping"] = scene_map

        config.write_cached_configs()

        return {"status": "renamed", "new_name": new_name}

    except Exception as e:
        logging.error(f"Error renaming character: {e}")
        return {"error": str(e)}

