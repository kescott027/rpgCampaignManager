import logging
from fastapi import APIRouter, Request
from src.backend.datahandler_combat import CombatDataHandler, CombatHandler
from pydantic import BaseModel
from typing import List, Optional


class InitiativeEntry(BaseModel):
    name: str
    initiative: int
    scene: Optional[str] = None
    hp: Optional[int] = None
    conditions: List[str] = []


class InitiativeQueueUpdate(BaseModel):
    entries: List[InitiativeEntry]


logging.basicConfig(level=logging.INFO)
router = APIRouter()
data_handler = CombatDataHandler()
combat_handler = CombatHandler()

@router.get("/api/combat/combat-queue")
def fetch_combat_queue(include_inactive: bool = False):
    """Fetch current combat initiative queue."""
    queue = data_handler.get_combat_queue(include_inactive)
    return {"queue": queue}


@router.post("/api/combat/load-combat-queue")
async def load_combat_queue(request: Request):
    """Clear and replace initiative queue with new entries."""
    try:
        data = await request.json()
        entries = data.get("entries")

        if not isinstance(entries, list):
            return {"error": "Invalid or missing 'entries' list"}

        data_handler.load_combat_queue(entries)
        return {"status": "✅ Combat queue loaded", "count": len(entries)}

    except Exception as e:
        return {"load_combat_queue route error": str(e)}


@router.get("/api/combat/current-turn")
def get_current_turn():
    logging.debug(f"api_combat_routes: -> data_handler: get_current_turn")
    return data_handler.get_current_turn() or {"error": "No active combat."}


@router.post("/api/combat/turn")
def get_current_turn(data: dict):
    turn = data.get('turn', 0)
    logging.debug(f"api_combat_routes: -> data_handler: set_initiative")
    return data_handler.set_current_turn(turn)


@router.post("/api/combat/update-combat-queue")
def update_combat_queue(payload: InitiativeQueueUpdate):

    logging.debug(f'update-combat-queue route calling DataHandler/update-combat-queue with{payload}')
    try:
        result = combat_handler.update_combat_queue(payload.entries)
        return {"status": "✅ Combat queue updated", "count": result}
    except Exception as e:
        logging.debug(f'update-combat-route failed to update DataHandler {e}')
        return { "error": str(e)}

@router.post("/api/combat/jump-to-index")
def jump_to_index(payload: dict):
    index = payload.get("index")
    if index is None:
        return {"error": "Missing index"}

    data_handler.set_current_index(index)

    # Return the current turn so frontend can re-highlight and change OBS scene
    return data_handler.get_current_turn()
