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
