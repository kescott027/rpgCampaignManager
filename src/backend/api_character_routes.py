from fastapi import APIRouter, Request
from src.backend.datahandler_characters import CharacterDataHandler

router = APIRouter()
db = CharacterDataHandler()

@router.get("/api/characters")
def get_characters(include_inactive: bool = False):
    characters = db.get_characters(include_inactive=include_inactive)
    return {"characters": characters}


@router.post("/api/characters/new")
async def create_character(request: Request):
    try:
        data = await request.json()
        if not data.get("name"):
            return {"error": "Missing character name."}

        db.add_character(data)
        return {"status": "✅ Character added", "character": data}

    except Exception as e:
        return {"error": str(e)}


@router.post("/api/characters/update")
async def update_character(request: Request):
    try:
        data = await request.json()
        if not data.get("id"):
            return {"error": "Missing character ID for update."}

        db.update_character(data)
        return {"status": "✅ Character updated", "character": data}

    except Exception as e:
        return {"error": str(e)}

