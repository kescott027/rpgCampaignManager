import json
import logging
from fastapi import APIRouter, Request, Query
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.datahandler_config import ConfigDataHandler

logging.basicConfig(level=logging.DEBUG)
config = Configuration()
config_data = ConfigDataHandler()
obs = OBSController()
router = APIRouter()


@router.get("/api/session/config")
def get_config(user_id: str = Query(...)):

    if not user_id:
        return { "status": 400, "message": "user_id required for session creation" }

    try:
        config = self.config_data.get_session_config(user_id)

        if not config:
            return {"status": 404, "message": "session config not found"}

        config_json = json.dumps(config)
        return { "status": 200, "data": config_json, "message": "OK" }

    except Exception as e:
        logging.error(f"api_config_routes failed to return session config from get_config: {e}")
        return { "status": 500, "message": "Internal Server Error" }


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
