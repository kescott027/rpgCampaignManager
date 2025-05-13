"""
api_drive_routes controls communication to google drive
"""
import os
import logging
from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from google.oauth2.credentials import Credentials
import google.oauth2._client
from src.backend.controller_configuration import Configuration as Config
from src.backend.controller_drive import DriveController
from src.backend.controller_localstore import open_file


router = APIRouter()
DRIVE_CONTROLLER = DriveController()


@router.get("/api/drive/login")
async def google_oauth_login():

    login_confirmation = DRIVE_CONTROLLER.create_service()

    if not login_confirmation:
        return {"status": "Logged in"}

    else:
        logging.error("request to log into google drive failed")
        return {"status": "error"}


@router.post("/api/drive/logout")
async def logout(request: Request, response: Response):
    logout_status = DRIVE_CONTROLLER.logout()
    if logout_status == 0:

        logging.info("🔓 Logged out of Google Drive")
        return {"status": "logged out"}

    else:
        logging.error("request to log out of google drive failed")
        return {"status": "error"}


@router.get("/api/drive/folders")
async def drive_folder():
    folders = []
    query = "mimeType = \'application/vnd.google-apps.folder\'"

    response = DRIVE_CONTROLLER.search_files(q=query)
    return response


@router.get("/api/drive/campaigns")
async def drive_folder():
    # files = []
    FOLDER_ID = "my_campaigns"
    query = f"'{FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'"


    query = "mimeType = \'application/vnd.google-apps.folder\'"

    response =  DRIVE_CONTROLLER.search_drive(q=query)
    return response



@router.get("/api/drive/file/{file_id}")
async def drive_file(request: Request, file_id: str):


    downloaded_file = await download_file(self, real_file_id)

    return open_file(download_file)

    try:
        content = read_text_file(id, oauth_token=access_token)
        return {"id": id, "content": content}

    except Exception as e:
        print("❌ Failed to read file:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/drive/list")
async def google_drive_list(request: Request, folderId: str = "root"):

    # results, error = DRIVE_CONTROLLER.list_folder_contents()
    results, error = DRIVE_CONTROLLER.list_files()

    if error:

        logging.error(f"error retrieving file list: {error}")
        return []

    return results


@router.get("/api/drive/search")
async def search_drive(request: Request, q: str):

    inbound_text = file_query.split()

    if inbound_text.length == 1:
        query = f"name = {file_query}"

    else:
        query = f"{file_query}"

    try:

        file_results, error = DRIVE_CONTROLLER.search_files(file_query)
        return {"results": results}

    except Exception as e:
        print("❌ Drive search failed:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})


