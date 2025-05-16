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


@router.post("/api/session/start-combat")
def start_combat(data: dict):
    logging.info("⚔️ Starting combat queue")
    queue = args or []

    # Defensive check: ensure all entries are valid objects
    if not all(isinstance(e, dict) and "name" in e for e in queue):
        return {"response": "❌ Invalid combat queue format"}

    try:
        entries = data.get("entries")
        if not isinstance(entries, list):
            return {"error": "Missing or invalid 'entries' list"}

        for e in entries:
            queue.append({
                "name": e.get("name"),
                "initiative": int(e.get("initiative") or 0),
                "scene": e.get("scene") or e.get("name"),
                "hp": e.get("hp"),  # optional for now
                "conditions": e.get("conditions", [])
            })

        queue = sorted(queue, key=lambda x: x["initiative"], reverse=True)

        config.cached_configs["combat_state"] = {
            "initiative_queue": queue,
            "current_index": 0
        }
        config.write_cached_configs()

        return {
            "status": "started",
            "current": queue[0]["name"],
            "scene": queue[0]["scene"],
            "queue": queue
        }

    except Exception as e:
        logging.error(f"Failed to start combat: {e}")
        return {"error": str(e)}


@router.get("/api/session/combat-state")
def get_combat_state():
    return config.cached_configs.get("combat_state", {})


@router.post("/api/session/scene-mapping")
def update_scene_mapping(data: dict):
    try:
        name = data.get("name")
        scene = data.get("scene")

        if not name or not isinstance(scene, str):
            return {"error": "Missing or invalid 'name' or 'scene'"}

        scene_map = config.cached_configs.get("scene_mapping", {})
        scene_map[name] = scene
        config.cached_configs["scene_mapping"] = scene_map
        config.write_cached_configs()

        return {"status": "updated", "mapping": {name: scene}}
    except Exception as e:
        logging.error(f"Failed to update scene mapping: {e}")
        return {"error": str(e)}
