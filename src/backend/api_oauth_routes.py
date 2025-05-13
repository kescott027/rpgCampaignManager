import os
import uuid
import requests
from urllib.parse import urlencode
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from src.backend.controller_auth import save_token
from src.backend.controller_drive import handle_google_oauth_callback


router = APIRouter()

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
# REDIRECT_URI = "http://localhost:8000/api/oauth/callback"


@router.get("/api/oauth/login")
def login():
    print("Logging in to google drive...")
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "openid https://www.googleapis.com/auth/drive.readonly",
        "access_type": "offline",
        "prompt": "consent",
    }
    response = RedirectResponse(f"{auth_url}?{urlencode(params)}")
    print(f"login complete: {response}")
    return response


@router.get("/api/oauth/oauth2callback")
async def oauth2callback(code: str, request: Request):
    print("✅ Requesting OAuth callback:", session_data)
    return await handle_google_oauth_callback(request)


# @router.get("/api/oauth/callback")
# async def oauth_callback(code: str, response: Response):
#     # ...exchange code for token...
#
#     session_id = str(uuid.uuid4())
#     save_token(session_id, token_data)
#
#     # Set session ID in a secure, HttpOnly cookie
#     response.set_cookie(key="session_id", value=session_id, httponly=True)
#     return RedirectResponse("/?oauth=success")

###
### @router.get("/api/oauth/callback")
### def callback(code: str):
### token_url = "https://oauth2.googleapis.com/token"
### data = {
###     "code": code,
###     "client_id": CLIENT_ID,
###     "client_secret": CLIENT_SECRET,
###     "redirect_uri": REDIRECT_URI,
###     "grant_type": "authorization_code"
### }
### response = requests.post(token_url, data=data)
### return response.json()
