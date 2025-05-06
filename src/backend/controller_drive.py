import os
import json

# import requests
from googleapiclient.discovery import build
from google.oauth2 import service_account
from src.backend.controller_security import (
    get_google_drive_key,
    get_google_service_account,
    load_config,
    get_google_oauth_creds,
)
from src.backend.controller_auth import drive_login
from pathlib import Path
from fastapi import Request
from fastapi.responses import HTMLResponse
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request as GoogleRequest
from src.backend.controller_security import project_root


SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]


def load_drive_mode():
    config = load_config()
    if config.get("google_drive_oath", False):
        return "service"
    if config.get("google_drive_service", False):
        return "service"
    if config.get("google_drive_api", False):
        return "api"
    return None


def get_drive_service():
    mode = load_drive_mode()

    if mode == "service":
        creds_path = get_google_service_account()
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )
        return build("drive", "v3", credentials=creds)

    elif mode == "api":
        api_key = get_google_drive_key()
        return build("drive", "v3", developerKey=api_key)

    raise EnvironmentError(
        "❌ No valid Google Drive auth method found. Check 'manager_config.json' or .security/"
    )


def get_drive_service_with_oauth(token: str):
    """Return a Drive service object authenticated with an OAuth token."""
    return build(
        "drive",
        "v3",
        credentials=None,
        developerKey=None,
        requestBuilder=lambda *args, **kwargs: requests.Request(
            *args, headers={"Authorization": f"Bearer {token}"}
        ),
    )


def search_google_drive(query: str, oauth_token=None, max_results=5):
    """Search files in Drive via query using appropriate auth method."""
    url = "https://www.googleapis.com/drive/v3/files"
    params = {
        "q": f"name contains '{query}' and trashed = false",
        "fields": "files(id, name, mimeType, modifiedTime)",
        "pageSize": max_results,
    }

    headers = {}
    config = load_config()
    if oauth_token:
        headers["Authorization"] = f"Bearer {oauth_token}"
    elif config.get("google_drive_api"):
        params["key"] = get_google_drive_key()

    response = requests.get(url, params=params, headers=headers)
    if not response.ok:
        raise RuntimeError(
            f"Google Drive API search failed: {response.status_code} - {response.text}"
        )
    return response.json().get("files", [])


def list_folder_contents(folder_id="root", oauth_token=None):
    """
    List contents of a Google Drive folder using OAuth, API key, or service account.
    """
    config = load_config()
    if config.get("google_drive_oath"):
        if not oauth_token:
            oauth_token = drive_login()
        headers = {"Authorization": f"Bearer {oauth_token}"}
        url = "https://www.googleapis.com/drive/v3/files"
        params = {
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "files(id, name, mimeType, modifiedTime)",
        }
        response = requests.get(url, headers=headers, params=params)

    elif config.get("google_drive_service"):
        # Service account logic — existing
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_file(
            get_google_service_account(), scopes=SCOPES
        )
        service = build("drive", "v3", credentials=creds)
        response = (
            service.files()
            .list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="files(id, name, mimeType, modifiedTime)",
            )
            .execute()
        )
        return response.get("files", [])

    elif config.get("google_drive_api"):
        # API key fallback
        api_key = get_google_drive_key()
        url = "https://www.googleapis.com/drive/v3/files"
        params = {
            "key": api_key,
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "files(id, name, mimeType, modifiedTime)",
        }
        response = requests.get(url, params=params)
        return response.json().get("files", [])

    else:
        raise ValueError("❌ No valid Google Drive configuration found.")

    if not response.ok:
        error = f" 🚨 Google API ERROR: {response.status_code} - {response.text}"
        raise RuntimeError(error)

    else:
        service = get_drive_service()
        results = (
            service.files()
            .list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="files(id, name, mimeType, modifiedTime)",
            )
            .execute()
        )
        return results.get("files", [])


def read_text_file(file_id: str, oauth_token=None) -> str:
    """Download text content from Google Drive file using OAuth or fallback."""
    if oauth_token:
        headers = {"Authorization": f"Bearer {oauth_token}"}
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
        response = requests.get(url, headers=headers)
    else:
        api_key = get_google_drive_key()
        url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media&key={api_key}"
        response = requests.get(url)

    if response.status_code != 200:
        raise RuntimeError(
            f"Google Drive file read error: {response.status_code} - {response.text}"
        )
    return response.text


def get_oauth_flow():
    client_secrets_path = (
        Path(project_root()) / ".security" / "oauth_client_secret.json"
    )
    if not client_secrets_path.exists():
        raise FileNotFoundError("❌ Missing OAuth client secret file.")

    redirect_uri = "http://localhost:8000/api/drive/oauth2callback"

    return Flow.from_client_secrets_file(
        client_secrets_path,
        scopes=["https://www.googleapis.com/auth/drive.readonly"],
        redirect_uri=redirect_uri,
    )


async def handle_google_oauth_callback(request: Request):
    try:
        print("starting oauth2 callback")
        # Extract auth code from query params
        code = request.query_params.get("code")
        if not code:
            return HTMLResponse(
                content="❌ No code provided in callback URL.", status_code=400
            )

        # Initialize flow
        flow = get_oauth_flow()

        # Fetch token using the code
        flow.fetch_token(code=code)

        # Get credentials from flow
        creds = flow.credentials

        # Store session to file
        session_data = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
        }

        security_dir = Path(project_root()) / ".security"
        security_dir.mkdir(exist_ok=True)
        with open(security_dir / "oauth_sessions.json", "w") as f:
            json.dump(session_data, f)

        print("✅ OAuth token stored successfully.")
        return HTMLResponse(
            content="✅ Google Drive connected! You may now close this window.",
            status_code=200,
        )

    except Exception as e:
        print(f"❌ Error in OAuth callback: {e}")
        return HTMLResponse(content=f"OAuth Error: {e}", status_code=500)
