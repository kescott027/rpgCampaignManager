import os
import json
import logging
from fastapi import APIRouter, Request, Query
from fastapi.responses import JSONResponse
from pathlib import Path
from src.backend.controller_obs import OBSController



router = APIRouter()
obs = OBSController()

@router.post("/api/obs/command")
async def handle_obs_command(request: Request):
    try:
        data = await request.json()
        command = data.get("command")
        args = data.get("args", [])
        result = obs.execute_command(command, args)
        return {"status": result}
    except Exception as e:
        return {"error": str(e)}
