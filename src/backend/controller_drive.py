import logging
import sys
import os.path
import json
import google.auth
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class DriveController:

    def __init__(self):
        self.token_path = os.path.join(SECRETS_PATH, "token.json")
        self.credentials = os.path.join(SECRETS_PATH, "credentials.json")
        self.scopes = ["https://www.googleapis.com/auth/drive"]
        self.creds = None
        self.service = None
        self.service_error = None
        self.login()


    def login_request(self):
        try:
            self.login()
            return 0

        except Exception as error:
            logging.error(f"error logging in to google drive: {self.error}")
            return 1

    def login(self):

        if os.path.exists(self.token_path):
            self.creds = Credentials.from_authorized_user_file(
                self.token_path, self.scopes)

        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())

        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                self.credentials, self.scopes
            )

        self.creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        with open(self.token_path, "w") as token:
            token.write(creds.to_json())

        try:
            self.service = build("drive", "v3", credentials=creds)
            self.service_error = None

        except HttpError as error:
            logging.error(
            f"api_drive_controller drive_login generated \
             an Http error when building credentials: {error}")

             self.service_error = error
             return None

        except Exceptions as error:
            logging.error(
            f"api_drive_controller drive_login generated \
             an error when building credentials: {error}")

             self.service_error = error
             return None


    def logout(self):
        # destroy cached login tokens

        try:
            self.creds = None
            self.service = None
            self.service_error = None

            if os.path.exists(self.token_path):
            os.remove(self.token_path)

            return 0

        except Exceptions as error:

            logging.error(f"an error occured when attempting to log out: {error}")
            self.service_error = error
            return 1


    def get_service(self):

        if not self.service:
            self.login()

        if not self.service and self.service_error:
            return None, self.service_error

        return self.service, None

    def list_files(self):

        service, error = self.get_service

        if not service or error:
            return [], error

        try:

            next_token = None
            files = []

            while True:
                response = (
                    service.files()
                    .list(pageSize=10, fields="nextPageToken, files(id, name)")
                )

                service.execute(initial_request, page_token=next_token)
                files.extend(response.get('files', [])

                next_token = response.get('next_token')

                if not next_token:
                    break # No more pages

            return files, None

        except HttpError as error:
        
            logging.error(f"An error occurred: {error}")
            return [], error


    def list_folder_contents(self, folder_id="root"):
        service, error = self.get_service

        if not service or error:
            return [], error

        results, error = search_files(query = folder_id in parents)

        return results, error


    def search_files(query)

        service, error = self.get_service

        if not service or error:
            return [], error

        files = []
        page_token = None

        while True:

            # pylint: disable=maybe-no-member
            response = (
                service.files()
                .list(
                    q=query,
                    spaces="drive",
                    fields="nextPageToken, files(id, name)",
                    pageToken=page_token,
                )
                .execute()
            )
            files.extend(response.get('files', [])
            next_token = response.get('next_token')

            if not next_token:
                break # No more pages

          return files, None

      except HttpError as error:

        logging(f"An error occurred: {error}")
        return None, error


    def download_file(self, real_file_id):
        """Downloads a file
        Args:
        real_file_id: ID of the file to download
        Returns : IO object with location.

        Load pre-authorized user credentials from the environment.
        TODO(developer) - See https://developers.google.com/identity
        for guides on implementing OAuth2 for the application.
        """
        logging.info(f"download requested for file {real_file_id}")

        service, error = self.get_service

        if not service or error:
            logging.error(f"download failed due to auth error: {error}")
            return error

        try:
            file_id = real_file_id

            # pylint: disable=maybe-no-member
            request = service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            done = False

            while done is False:
                status, done = downloader.next_chunk()
                logging.info(f"Download {int(status.progress() * 100)}.")
            return None

          except HttpError as error:

            logging.error(f"An error occurred: {error}")
            return error


if __name__ == "__main__:
