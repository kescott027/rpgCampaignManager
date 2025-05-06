import json
from fastapi import APIRouter

router = APIRouter()


@router.get("/api/config")
def read_config():
    try:
        with open("manager_config.json", "r") as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e)}
