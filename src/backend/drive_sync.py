import os
import io

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google.oauth2 import service_account

# === Constants ===
SCOPES = ["https://www.googleapis.com/auth/drive.file"]
ROOT_FOLDER_NAME = "rpgCampaignManager"
TOKEN_PATH = "./secrets/service_account.json"
CREDENTIALS_PATH = "credentials.json"


class DriveSync:
    def __init__(self, auth_method="service_account"):
        self.creds = None
        self.service = None
        self.root_folder_id = None
        self.working_dir = os.getcwd()
        self.authenticate(auth_method)
        self.ensure_root_folder()

    def service_account_auth(self, key_path="service_account.json"):
        """
        Authenticate using a service account JSON key.
        Works only with Google Workspace Drive API (not personal accounts).
        """
        full_path = os.path.join(self.working_dir, key_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(
                f"Service account key file not found at: {full_path}"
            )

        creds = service_account.Credentials.from_service_account_file(
            full_path, scopes=["https://www.googleapis.com/auth/drive.file"]
        )
        self.creds = creds
        self.service = build("drive", "v3", credentials=self.creds)

        # Optional: ensure root folder setup if needed
        self.ensure_root_folder()

        print("✅ Service account authentication successful.")

    def user_auth(self):
        if os.path.exists(TOKEN_PATH):
            self.creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
        self.creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "w") as token:
            token.write(self.creds.to_json())
        self.service = build("drive", "v3", credentials=self.creds)

        return

    def authenticate(self, auth_method):
        if auth_method == "service_account":
            self.service_account_auth()
        else:
            self.user_auth()
        return

    def ensure_root_folder(self):
        results = (
            self.service.files()
                .list(
                q=f"name='{ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'",
                spaces="drive",
                fields="files(id, name)",
            )
                .execute()
        )
        folders = results.get("files", [])
        if folders:
            self.root_folder_id = folders[0]["id"]
        else:
            file_metadata = {
                "name": ROOT_FOLDER_NAME,
                "mimeType": "application/vnd.google-apps.folder",
            }
            folder = (
                self.service.files().create(body=file_metadata, fields="id").execute()
            )
            self.root_folder_id = folder.get("id")

    def upload_file(self, local_path: str, drive_filename: str):
        file_metadata = {"name": drive_filename, "parents": [self.root_folder_id]}
        media = MediaFileUpload(local_path, resumable=True)
        file = (
            self.service.files()
                .create(body=file_metadata, media_body=media, fields="id")
                .execute()
        )
        return file.get("id")

    def download_file(self, drive_filename: str, local_path: str):
        results = (
            self.service.files()
                .list(
                q=f"name='{drive_filename}' and '{self.root_folder_id}' in parents",
                spaces="drive",
                fields="files(id, name)",
            )
                .execute()
        )
        items = results.get("files", [])
        if not items:
            raise FileNotFoundError(f"{drive_filename} not found in Drive.")
        file_id = items[0]["id"]
        request = self.service.files().get_media(fileId=file_id)
        fh = io.FileIO(local_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
        return local_path

    def list_drive_files(self):
        results = (
            self.service.files()
                .list(
                q=f"'{self.root_folder_id}' in parents",
                spaces="drive",
                fields="files(id, name, modifiedTime)",
            )
                .execute()
        )
        return results.get("files", [])


# === Example Usage ===
if __name__ == "__main__":
    sync = DriveSync()
    files = sync.list_drive_files()
    for f in files:
        print(f"{f['name']} (last modified: {f['modifiedTime']})")
