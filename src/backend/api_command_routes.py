# api_config_routes.py (unified session command router)

import logging
from fastapi import APIRouter, Request
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy
from src.backend.controller_command import CommandHandler
from src.backend.controller_combat import CombatDatastore


logging.basicConfig(level=logging.INFO)
router = APIRouter()
dispatcher = CommandHandler()
combat_datastore = CombatDatastore()
combat_handler = CommandHandler()
config = Configuration()


@router.post("/api/session/help")
async def session_help_command(request: Request):
    return dispatcher.help()


@router.post("/api/session/command")
async def handle_session_command(request: Request):
    data = await request.json()
    logging.debug(f"local command request: {data}")
    return dispatcher.interface(data)



@router.get("/api/session/initiative")
def get_initiative_order():
    logging.info(f"receeived get erquest for /api/session/initiative")
    return combat_datastore.get_combat_queue()


@router.post("/api/session/initiative")
def update_initiative_order(data: dict):
    return {"error": "deprecated api"}


@router.post("/api/session/rename-character")
def rename_character(data: dict):
    return {"error": "deprecated api"}

