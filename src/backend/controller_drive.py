
import os
import json
import requests
from googleapiclient.discovery import build
from google.oauth2 import service_account
from src.backend.controller_security import get_google_drive_key, get_google_service_account
from pathlib import Path

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def load_drive_mode():
    config_path = Path(__file__).resolve().parents[2] / 'manager_config.json'
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = json.load(f)
            if config.get("google_drive_service", False):
                return "service"
            if config.get("google_drive_api", False):
                return "api"
    return None

def get_drive_service():
    mode = load_drive_mode()

    if mode == "service":
        creds_path = get_google_service_account()
        creds = service_account.Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        return build('drive', 'v3', credentials=creds)

    elif mode == "api":
        api_key = get_google_drive_key()
        return build('drive', 'v3', developerKey=api_key)

    raise EnvironmentError("❌ No valid Google Drive auth method found. Check 'manager_config.json' or .security/")

def search_google_drive(query, max_results=5):
    service = get_drive_service()
    results = service.files().list(
        q=f"name contains '{query}' and trashed = false",
        pageSize=max_results,
        fields="files(id, name, mimeType, modifiedTime)"
    ).execute()
    return results.get('files', [])

def list_folder_contents(folder_id="root"):
    mode = load_drive_mode()
    if mode == "api":
        api_key = get_google_drive_key()
        params = {
            "key": api_key,
            "q": f"'{folder_id}' in parents and trashed = false",
            "fields": "files(id, name, mimeType, modifiedTime)"
        }
        url = "https://www.googleapis.com/drive/v3/files"
        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise RuntimeError(f"Google Drive API error: {response.status_code} - {response.text}")
        return response.json().get("files", [])
    else:
        service = get_drive_service()
        results = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="files(id, name, mimeType, modifiedTime)"
        ).execute()
        return results.get('files', [])

def read_text_file(file_id):
    service = get_drive_service()
    file = service.files().get_media(fileId=file_id).execute()
    return file.decode('utf-8')
