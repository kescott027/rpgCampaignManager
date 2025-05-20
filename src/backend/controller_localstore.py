import os
import io
import logging
from typing import List
from src.backend.utility_file import json_loader, project_root, open_file, write_file
from src.backend.controller_configuration import Configuration as Config


logging.basicConfig(level=logging.DEBUG)


class StorageController:

    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching Storage controller')
        self.config = Config()
        self.assets_directory = None
        self.local_storage_root = None
        self.my_campaigns = None

        self.config_local_storage()
        self.file_tree = self.load_file_tree()


    def config_local_storage(self):

        root_dir = self.config.root_directory
        asset_dir = self.config.current_configs.get('local_assets_directory', 'assets')
        campaign_storage = self.config.current_configs.get(
            'local_file_store_root', 'my_campaigns')
        self.my_campaigns = self.configs.current_configs.get('my_campaigns')

        self.assets_directory = os.path.join(root_dir, asset_dir)
        self.local_storage_root = os.path.join(self.assets_directory, campaign_storage)

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



if __name__ == "__main__":
    pass
