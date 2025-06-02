import os
import io
import logging
import random
import shutil
from typing import List
from src.backend.utility_file import json_loader, project_root, open_file, write_file
from src.backend.utility_file import random_string_generator as rand_id
from src.backend.controller_configuration import Configuration as Config


logging.basicConfig(level=logging.DEBUG)


class StorageController:

    def __init__(self, source='Unknown'):
        self.config = Config()
        self.assets_directory = None

        self.config_local_storage()



    def config_local_storage(self):

        root_dir = self.config.root_directory
        asset_dir = self.config.current_configs.get('local_assets_directory', 'assets')
        campaign_storage = self.config.current_configs.get(
            'local_file_store_root', 'my_campaigns')

        self.assets_directory = os.path.join(root_dir, asset_dir)


    def load_file_tree(self):
        file_tree = {}

        for campaign in my_campaigns:
            file_tree[campaign] = load_campaign_files(campaign)

        self.file_tree = file_tree


    def load_campaign_files(self, campaign):
        source_directory = os.path.join(self.local_storage_root, campaign)
        campaign_tree = os.walk(source_directory)


    @staticmethod
    def open_file(file):
        return src.backend.utility_file.open_file(file)


    @staticmethod
    def write_file(file):
        return src.backend.utility_file.write_file(file)


class LocalFileHandler(StorageController):
    def __init__(self):
        super().__init__()



    def write_asset_file(self, file, user_space=None, campaign=None):

        user_dir = os.path.join(self.assets_directory, user_space)
        file_path = os.path.join(user_dir, campaign, file.filename)
        os.makedirs(user_dir, exist_ok=True)

        return self._write_asset_to_disk(file_data, file_path)


    def _write_asset_to_disk(self, file_data, file_path):
        try:
            with open(file_path, "wb") as out_file:
                shutil.copyfileobj(file.file, out_file)

            if user_space:
                user_space = user_space
            return {
                "status": "uploaded",
                "filename": file.filename,
                "path": filepath
            }

        except Exception as e:

            logging.error(
                f'LocalFileHandler.write_asset_file: Error uploading file {e}')

            return {f"Error uploading file {file.filename}"}


    def fetch_asset_file(self, file_data):
        try:
            with open(file_path, "r") as open_file:

                return {
                    "status": "opened",
                    "filename": file.filename,
                    "file_data": open_file,
                    "path": f"/assets/sticky/{user_space}/{campaign}/{file.filename}"
                }

        except Exception as e:

            logging.error(
                f'LocalFileHandler.write_asset_file: Error uploading file {e}')

            return {f"Error uploading file {file.filename}"}


    def update_asset_file(self, filepath, operation, new_path=None, file_data=None):
        if not new_path:
            new_path = 'trash'

        op = {
        "copy": shutil.copy2(),
        "move": shutil.move(),
        "overwrite": self.trash_asset_file(),
        }

        try:
            response = op(filepath, new_path)

            try:
                if response and response.text == "trashed":
                    write_response = self._write_asset_to_disk(file_data)
                    response["text"] = "updated"
                    response["path"] = filepath
                    logging.debug(f"update_asset_file operation completed")
                    return response

            except ValueError as error:
                logging.debug(f"error detecting trashed {error}")
                return {"status": "Error", "text": "update failed"}

            return {"status": "OK", "text": f"{op} complete."}

        except Exception as e:
            logging.debug(
                f"localstore.LocalFileHandler.update_asset_file failed : {e}")
            return {"status": "error", "text": "file update failed.", "path": None}


    def trash_asset_file(source_path, discard=None):
        # the discard variable is just for compatability with other methods
        new_path = f"{source_path}.{rand_id(10)}"
        shutil.move(source_path, new_path)

        return {"status": "OK", "text": "trashed", "trashed_path": new_path }




if __name__ == "__main__":
    pass
