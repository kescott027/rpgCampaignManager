"""
api_drive_routes controls communication to google drive
"""

from fastapi import APIRouter, Query, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from src.backend.controller_auth import get_token, delete_token
from src.backend.controller_drive import (
    list_folder_contents,
    search_google_drive,
    read_text_file,
    get_oauth_flow,
    handle_google_oauth_callback,
)


router = APIRouter()


@router.get("/api/drive/oauth-login")
def google_oauth_login():
    try:
        flow = get_oauth_flow()
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",  # ensures refresh_token is returned
        )
        print("logging into google drive")
        return RedirectResponse(auth_url)
    except Exception as e:
        return {"error": f"OAuth login failed: {e}"}


@router.post("/api/drive/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id:
        delete_token(session_id)
        response.delete_cookie("session_id")
    print("Logging out of google drive")
    return {"status": "logged out"}


@router.get("/api/drive/oauth2callback")
async def oauth2callback(code: str, request: Request):
    print("✅ Requesting OAuth callback:", session_data)
    return await handle_google_oauth_callback(request)


@router.get("/api/drive/file")
async def drive_file(id: str):

    session_id = request.cookies.get("session_id")
    token = get_token(session_id) if session_id else None
    access_token = token.get("access_token") if token else None
    try:
        content = read_text_file(id)
        return {"id": id, "content": content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/drive/list")
async def drive_list(
    request: Request, folderId: str = "root"
):  # Query("root")): # Query(default="root")):

    session_id = request.cookies.get("session_id")
    token = get_token(session_id) if session_id else None
    access_token = token.get("access_token") if token else None

    try:
        items = list_folder_contents(folder_id=folderId, oauth_token=access_token)
        return {"items": items}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/drive/search")
async def search_drive(q: str):
    # need to account for refresh token as above
    """
    Search Google Drive for files containing the query in their name.
    Returns a list of matched files with basic metadata.
    """

    session_id = request.cookies.get("session_id")
    token = get_token(session_id) if session_id else None
    access_token = token.get("access_token") if token else None

    try:
        results = search_google_drive(q)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}
