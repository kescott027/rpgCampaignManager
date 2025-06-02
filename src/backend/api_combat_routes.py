import logging
from fastapi import APIRouter, Request
from src.backend.datahandler_combat import CombatDataHandler, CombatHandler


logging.basicConfig(level=logging.INFO)
router = APIRouter()
datahandler = CombatDataHandler()
combat_handler = CombatHandler()

@router.get("/api/combat/combat-queue")
def fetch_combat_queue(include_inactive: bool = False):
    """Fetch current combat initiative queue."""
    queue = datahandler.get_combat_queue(include_inactive)
    return {"queue": queue}


@router.post("/api/combat/load-combat-queue")
async def load_combat_queue(request: Request):
    """Clear and replace initiative queue with new entries."""
    try:
        data = await request.json()
        entries = data.get("entries")

        if not isinstance(entries, list):
            return {"error": "Invalid or missing 'entries' list"}

        datahandler.load_combat_queue(entries)
        return {"status": "✅ Combat queue loaded", "count": len(entries)}

    except Exception as e:
        return {"load_combat_queue route error": str(e)}


@router.get("/api/combat/current-turn")
def get_current_turn():
    from src.backend.dataHandler import CombatDataHandler
    logging.debug(f"api_combat_routes: -> datahandler: get_current_turn")
    return datahandler.get_current_turn() or {"error": "No active combat."}


@router.post("/api/combat/update-combat-queue")
def update_combat_queue(data: dict):
    logging.debug(f'update-combat-queue route calling DataHandler/update-combat-queue with{data}')
    try:
        result = combat_handler.update_combat_queue(data.get("entries", []))
        return {"status": "✅ Combat queue updated", "count": result}
    except Exception as e:
        logging.debug(f'update-combat-route failed to update DataHandler {e}')
        return { "error": str(e)}
