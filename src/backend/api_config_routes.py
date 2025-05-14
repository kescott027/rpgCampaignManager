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
