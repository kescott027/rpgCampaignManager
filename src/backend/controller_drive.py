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
from src.backend.controller_configuration import Configuration as Config

class DriveController:

    def __init__(self):
        self.application_configs = Config()
        self.token_file =self.application_configs.drive_token_path
        if not self.token_file:
            self.token_file = os.path.join(
           self.application_configs.secrets_path, ".token.json"
            )
        self.credentials_file =self.application_configs.drive_creds_path
        self.scopes = ["https://www.googleapis.com/auth/drive"]
        self.credentials = None
        self.service = None
        self.create_service()


    def create_service(self):

        if self.token_file and os.path.exists(self.token_file):
            try:

                self.credentials = Credentials.from_authorized_user_file(
                    self.token_file, self.scopes)

            except json.decoder.JSONDecodeError:
                logging.error(
                    "failed to decode token - continue to creds create_service")
            except AttributeError:
                logging.error(
                    "key file is a  Nonetype object, continue to creds create_service")

        if not self.credentials or not self.credentials.valid:
            if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                self.credentials.refresh(Request())

            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, self.scopes
                )

                self.credentials = flow.run_local_server(port=0)

        # Save the credentials for the next run
        # with open(self.token_file, "w") as token:
        #     json.dump(self.token_file, token, indent=4)

        with open(self.token_file, "w") as token:
            token.write(self.credentials.to_json())

        try:
            self.service = build("drive", "v3", credentials=self.credentials)
            # self.service = build("drive", "v3", credentials=creds)
            # return self.service

        except HttpError as error:
            logging.error(
            f"api_drive_controller drive_create_service generated \
             an Http error when building credentials: {error}")

            self.service = None
            return None

        except Exception as error:
            logging.error(
            f"api_drive_controller drive_create_service generated \
             an error when building credentials: {error}")

            self.service = None
            return None


    def logout(self):
        # destroy cached create_service tokens

        try:
            self.credentials = None
            self.service = None

            if os.path.exists(self.token_file):
                os.remove(self.token_file)

            return 0

        except Exceptions as error:

            logging.error(f"an error occured when attempting to log out: {error}")
            return 1


    def get_service(self):
        logging.info('service requested, verifying service exists...')
        if not self.service:
            logging.info("no defined service, calling create service method")
            self.service = self.create_service()

            if not self.service:
                logging.error('Service not found after a call to src.backdend.controller_drive.get_service')
                return None

        logging.info('service created')
        return self.service


    def list_files(self, folder=None, by_id=False):

        if not self.service:
            self.service = build("drive", "v3", credentials=self.credentials)

        service = self.service

        if not service:
            raise ValueError('controller_drive.list_files failed to retrive files from drive')

        # First get the id of the parent to work with:
        try:

            if not by_id:
                parent_id = self.find_file_by_name(folder, directory=True)['files'][0]['id']
                logging.debug(f"retrieving id of folder {folder}: {parent_id} ")
            else:
                parent_id = folder

        except Exception as error:
            logging.error(f'failure to find id of folder {folder} : {error} ')
            return [], error

        try:
            next_token = None
            files = []

            query_string = f"'{parent_id}' in parents"

            while True:
                response = (
                    service.files().list(
                        q=query_string,
                        pageSize=100,
                        fields="nextPageToken, files(id, name, mimeType)")
                ).execute()


                files.extend(response.get('files', []))
                next_token = response.get('next_token')

                if not next_token:
                    break # No more pages
            logging.debug(f"operation complete returning files:{files}")
            return files, None

        except HttpError as error:

            logging.error(f"An error occurred: {error}")
            return [], error


    def list_folder_contents(self, folder_id="my_campaings"):

        service = build("drive", "v3", credentials=self.credentials)

        if not service:
            logging.error(
            f"backend/controller_drive unable to create service from client")
            return []

        file_query = f"'\'{folder_id}\'' in parents"
        results = self.search_files(file_query)

        return results


    def search_files(self, query):

        service = build("drive", "v3", credentials=self.credentials)
        if not service:
            logging(
                "controller_drive.search_files has no valid service after service build")
            return []

        files = []
        page_token = None
        # temporarily update query manually
        # query = f"'mimeType != 'application/vnd.google-apps.folder''"
        #query = f"'Cthulhu' in parents"# and mimeType='application/vnd.google-apps.folder'"
        query="mimeType = 'application/vnd.google-apps.folder'",
        #
        try:

            while True:

                # pylint: disable=maybe-no-member
                response = (service.files().list(
                    q=query,
                    spaces="drive",
                    fields="nextPageToken, files(id, name)",
                    pageToken=page_token,
                    ).execute()
                )

                files.extend(response.get('files', []))
                next_token = response.get('next_token')

                if not next_token:
                    break # No more pages

            return files, None

        except HttpError as error:

            logging.error(f"An error occurred: {error}")
            return None, error


    def find_file_by_name(self, file, directory=False):

        if not self.service:
            self.service = build("drive", "v3", credentials=self.credentials)

        if directory:
            query_string = f"name = '{file}' and mimeType='application/vnd.google-apps.folder'"
        else:
            query = f"name = '{file}'"

        try:
            return self.service.files().list(q=query_string).execute()

        except HttpError as error:

            logging.error(f"An error occurred: {error}")
            return None, error


    def download_file(self, real_file_id):
        """
        Downloads a file
        Args:
        real_file_id: ID of the file to download
        Returns : IO object with location.
        """

        logging.info(f"download requested for file {real_file_id}")

        service, error = self.get_service

        if not service or error:
            logging.error(f"download failed due to auth error: {error}")
            return 1, error

        try:
            file_id = real_file_id

            # pylint: disable=maybe-no-member
            request = service.files().get_media(fileId=file_id)
            file = io.BytesIO()
            downloader = MediaIoBaseDownload(file, request)
            done = False

            while not done:
                status, done = downloader.next_chunk()
                logging.info(f"Download {int(status.progress() * 100)}.")

            logging.info(f"Download completed without errors")
            return 0, None

        except HttpError as error:

            logging.error(f"An error occurred: {error}")
            return 1, error


if __name__ == "__main__":
    pass
