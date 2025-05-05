
from fastapi import APIRouter, Query
from src.backend.controller_drive_dispatcher import (
    list_folder_contents,
    search_google_drive,
    read_text_file
)

router = APIRouter()


@router.get("/api/drive/list")
async def drive_list(folderId: str = Query(default="root")):
    try:
        items = list_folder_contents(folder_id=folderId)
        return {"items": items}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/drive/file")
async def drive_file(id: str):
    try:
        content = read_text_file(id)
        return {"id": id, "content": content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/drive/search")
async def search_drive(q: str):
    """
    Search Google Drive for files containing the query in their name.
    Returns a list of matched files with basic metadata.
    """
    try:
        results = search_google_drive(q)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}





