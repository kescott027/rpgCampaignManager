import json
from fastapi import APIRouter, Request
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController

config = Configuration()
obs = OBSController()
router = APIRouter()


@router.get("/api/config")
def read_config():
    try:
        with open("manager_config.json", "r") as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e)}

@router.post("/api/session/command")
async def session_command(request: Request):
    data = await request.json()
    cmd = data.get("command")

    if cmd == "set_characters":
        chars = data.get("characters", [])
        mapping = {name: f"{name} Scene" for name in chars}
        config.cached_configs["characters"] = chars
        config.cached_configs["scene_mapping"] = mapping
        config.cached_configs["initiative_order"] = []
        config.cached_configs["current_slot"] = 0
        config.write_cached_configs()
        return {"status": "saved", "characters": chars}

    elif cmd == "start_initiative":
        chars = config.cached_configs.get("characters", [])
        # Prompt order is handled on frontend for now
        config.cached_configs["initiative_pending"] = chars + ["GM"]
        config.write_cached_configs()
        return {"status": "awaiting_input", "next": config.cached_configs["initiative_pending"][0]}

    elif cmd == "next_initiative":
        order = config.cached_configs.get("initiative_order", [])
        if not order:
            return {"error": "Initiative order not set"}

        index = config.cached_configs.get("current_slot", 0)
        index = (index + 1) % len(order)
        config.cached_configs["current_slot"] = index
        current = order[index]

        config.write_cached_configs()

        # Send scene switch to OBS
        mapping = config.cached_configs.get("scene_mapping", {})
        scene = mapping.get(current, f"{current} Scene")
        obs.change_scene(scene)

        return {"status": "ok", "current": current}

    elif cmd == "submit_initiative":
        name = data.get("name")
        value = int(data.get("value", 0))
        if "initiative_values" not in config.cached_configs:
            config.cached_configs["initiative_values"] = {}
        config.cached_configs["initiative_values"][name] = value

        # Check if we’ve completed the list
        pending = config.cached_configs.get("initiative_pending", [])
        updated = [n for n in pending if n != name]
        config.cached_configs["initiative_pending"] = updated

        if not updated:
            # Sort the final initiative order
            final_order = sorted(
                config.cached_configs["initiative_values"].items(),
                key=lambda x: x[1],
                reverse=True
            )
            order = [n[0] for n in final_order]
            config.cached_configs["initiative_order"] = order
            config.cached_configs["current_slot"] = 0

            config.write_cached_configs()
            return {"status": "ready", "order": order}

        config.write_cached_configs()
        return {"status": "continue", "next": updated[0]}

    else:
        return {"error": f"Unknown command '{cmd}'"}
