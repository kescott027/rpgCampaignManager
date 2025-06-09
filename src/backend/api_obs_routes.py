import os
import json
import logging
from fastapi import APIRouter, Request, Query, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from src.backend.controller_obs import OBSController, OBSCommandHandler


logging.basicConfig(level=logging.DEBUG)
router = APIRouter()
obs = OBSController()
obs_handler = OBSCommandHandler()

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

@router.post("/api/obs/send-image")
async def send_image_to_obs(payload: dict):
    path = payload.get("path")
    if not path:
        raise HTTPException(status_code=400, detail="Missing image path")

    success = obs_handler.send_image_to_campaign_scene(path)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send image to OBS")
    return {"status": 200, "detail": "Image sent to OBS"}

@router.post("/api/obs/set-scene")
async def send_image_to_obs(request: Request):
    data = await request.json()
    scene = data.get("scene")
    if not scene:
        return {status_code: 400, "detail": "missing scene name in request."}

    try:
        # Example OBS utility call
        obs.change_scene(scene)
        return {"status": 201, "detail": "Scene changed", "scene": scene}
    except Exception as e:
        return {"status": 501, "detail": "failed to set scene", "error": str(e)}

