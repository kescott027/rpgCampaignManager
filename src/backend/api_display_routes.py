# api_display_routes.py
import logging
import shutil
import os
from pathlib import Path
from fastapi import APIRouter, Request, Query, File, Form, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from src.backend.datahandler_display import DisplayDataHandler


router = APIRouter()
router.mount("/assets", StaticFiles(directory="assets"), name="assets")
display = DisplayDataHandler()

@router.get("/api/display/sticky-notes")
def get_sticky_notes(
    name: str = Query(...),
    user_space: str = Query(...),
    campaign: str = Query(...)
):
    """
    Return all saved sticky notes for the display window.
    """
    notes = display.load_layout
    return {"notes": display.fetch_sticky_notes(name, user_space, campaign)}


@router.post("/api/display/sticky-notes")
async def save_sticky_notes(payload: dict):

    name = payload.get('name')
    notes = payload.get('notes', [])
    user_space = payload.get('user_space', 'local')
    campaign = payload.get('campaign', 'sandbox')

    layout_id = display.get_or_create_layout_id(name, user_space, campaign)

    display.update_layout(layout_id, notes)

    return {"status": "success", "layout": name, "count": len(notes)}


@router.post("/api/display/layout")
async def post_sticky_layout(request: Request):
    logging.info(f"request to create a new layout")
    try:
        data = await request.json()
        notes = data.get("notes", [])
        name = data.get("name", "default")
        display.save_layout(name, notes)

        return {"status": " Sticky notes updated", "count": len(notes)}

    except Exception as e:
        return {"error": str(e)}


@router.get("/api/display/layout")
def get_sticky_layout(
    name: str = Query(...),
    user_space: str = Query(...),
    campaign: str = Query(...)
):
    logging.info(f"request get a sticky layout")
    result = display.load_layout(name, user_space, campaign)

    return result


@router.delete("/api/display/layout")
async def delete_sticky_layout(
    name: str = Query(...),
    user_space: str = Query(...),
    campaign: str = Query(...)
):
    logging.info(f"request to delete  sticky layout {name}-{user_space}-{campaign}")
    try:

        display.delete_layout(name, user_space, campaign)
        return {"status": f"Layout '{name}-{user_space}-{campaign}' deleted."}
    except Exception as e:
        return {"error": str(e)}


@router.patch("/api/display/layout")
async def rename_sticky_layout(request: Request):

    try:
        data = await request.json()
        old_name = data.get("old_name")
        new_name = data.get("new_name")
        user_space = data.get("user_space")
        campaign = data.get("campaign")

        if not old_name or not new_name:
            return {"error": "Both old_name and new_name are required."}

        display.rename_layout(old_name, new_name, user_space, campaign)
        return {"status": f"Renamed layout '{old_name}-{user_space}-{campaign}' to '{new_name}-{user_space}-{campaign}'."}

    except Exception as e:
        return {"error": str(e)}


@router.get("/api/display/layout/list")
def get_layout_names( request: Request ):
    layout_list = display.fetch_layout_names()
    return { "layouts": layout_list }


@router.get("/api/display/sticky-assets")
def get_sticky_assets(request: Request):

    try:
        assets = display.fetch_sticky_assets(
            user_space=user_space or None,
            campaign=campaign or None
        )
        return {"assets": assets}

    except Exception as e:
        message = f"Error: GET /api/display/sticky_assets failed."
        logging.error(message)
        logging.debug(f"Error: api_display_routes.post: {e} ")
        return {"status": "error", "text": message }


@router.post("/api/display/sticky-assets")
async def upload_sticky_asset(
    file: UploadFile = File(...),
    layout: str = Form("default"),
    user_space: str = Form("local"),
    campaign: str = Form("ForgeSworn"),
    type: str = Form("image")
):
    logging.info(f"sticky-assets Post content")

    try:
        from werkzeug.utils import secure_filename
        filename = secure_filename(file.filename)
        ext = Path(filename).suffix.lower()

        # Create folder if needed
        safe_root = Path("assets").resolve()
        asset_folder = safe_root / user_space / campaign

        # Normalize and validate that the resolved path is within the safe root directory
        try:
            asset_folder = asset_folder.resolve(strict=True)
            if not asset_folder.is_relative_to(safe_root):
                raise ValueError("Path traversal detected")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid path")

        asset_folder.mkdir(parents=True, exist_ok=True)

        asset_path = asset_folder / filename

        # Save file to disk
        with asset_path.open("wb") as f:
            shutil.copyfileobj(file.file, f)

        display.post_sticky_assets(file, type, asset_path, user_space, campaign, layout)
        relative_path=f"./{str(asset_path)}"
        # Return relative path for use in <img src="...">

        return {"status": "✅ Uploaded", "asset_path": relative_path}

    except Exception as e:
        return {"error": str(e)}


@router.get("/assets/{user_space}/{campaign}/{filename}")
async def get_asset_file(user_space: str, campaign: str, filename: str):
    """
    Serve static asset files from assets/{user_space}/{campaign}/{filename}
    """
    ext = Path(filename).suffix.lower()
    logging.info(f"returning file type: {ext}")

    safe_root = Path("assets").resolve()
    asset_path = safe_root / user_space / campaign / filename

    # Normalize and validate that the resolved path is within the safe root directory
    try:
        asset_path = asset_path.resolve(strict=False)
        if not asset_path.is_relative_to(safe_root):
            raise HTTPException(status_code=400, detail="Path traversal detected")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid path")

    if ext in [".md", ".txt"]:
        with asset_path.open("r", encoding="utf-8") as f:
            content = f.read()
        return content

    if not asset_path.exists():
        raise HTTPException(status_code=404, detail="Asset not found")

    return FileResponse(asset_path)


@router.delete("/api/display/sticky-assets")
def delete_sticky_assets(request: Request):
    # delete record

    return display.delete_sticky_assets(request)


@router.put("/api/display/sticky-assets")
def update_sticky_assets(request: Request):

    return display.update_sticky_assets(request)
