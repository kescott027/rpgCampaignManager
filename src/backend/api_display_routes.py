# api_display_routes.py
import logging
import shutil
import os
from pathlib import Path
from fastapi import APIRouter, Request, Query, File, Form, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from src.backend.datahandler_display import DisplayDataHandler


router = APIRouter()
router.mount("/assets", StaticFiles(directory="assets"), name="assets")
display = DisplayDataHandler()

@router.get("/api/display/sticky-notes")
def get_sticky_notes():
    """
    Return all saved sticky notes for the display window.
    """
    return {"notes": display.fetch_sticky_notes()}


@router.post("/api/display/sticky-notes")
async def update_sticky_notes(request: Request):
    """
    Replace saved sticky notes with new layout and content.
    """
    try:
        data = await request.json()
        notes = data.get("notes", [])
        # name = data.get("name", "default")
        # display.save_layout(name, notes)
        display.update_sticky_notes(name, notes)
        return {"status": " Sticky notes updated", "count": len(notes)}
    except Exception as e:
        return {"error": str(e)}


@router.post("/api/display/layout")
async def post_sticky_layout(request: Request):
    logging.info(f"request to create a new layout")
    try:
        data = await request.json()
        notes = data.get("notes", [])
        name = data.get("name", "default")
        display.save_layout(name, notes)
        # display.update_sticky_notes(name, notes)
        return {"status": " Sticky notes updated", "count": len(notes)}

    except Exception as e:
        return {"error": str(e)}


@router.get("/api/display/layout")
async def get_sticky_layout(name: str = Query(...)):
    logging.info(f"request get a sticky layout")
    data = await request.json()

    return display.load_layout(name)


@router.delete("/api/display/layout")
async def delete_sticky_layout(name: str = Query(...)):
    logging.info(f"request to delete all sticky layouts")
    try:
        data = await request.json()

        display.delete_layout(name)
        return {"status": f"Layout '{name}' deleted."}
    except Exception as e:
        return {"error": str(e)}


@router.put("/api/display/layout")
async def rename_sticky_layout(request: Request):

    try:
        data = await request.json()
        old_name = data.get("old_name")
        new_name = data.get("new_name")

        if not old_name or not new_name:
            return {"error": "Both old_name and new_name are required."}

        display.rename_layout(old_name, new_name)
        return {"status": f"Renamed layout '{old_name}' to '{new_name}'."}

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
        filename = file.filename
        ext = Path(filename).suffix.lower()

        # Create folder if needed
        asset_folder = Path("assets", user_space, campaign) # / layout
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
    asset_path = os.path.join("assets", user_space, campaign, filename)

    if not os.path.exists(asset_path):
        raise HTTPException(status_code=404, detail="Asset not found")

    return FileResponse(asset_path)


@router.delete("/api/display/sticky-assets")
def delete_sticky_assets(request: Request):
    # delete record

    return display.delete_sticky_assets(request)


@router.put("/api/display/sticky-assets")
def update_sticky_assets(request: Request):

    return display.update_sticky_assets(request)
