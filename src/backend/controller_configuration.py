import json
import logging
import os
from src.backend.utility_file import json_loader, project_root, open_file, write_file


logging.basicConfig(level=logging.DEBUG)


class Configuration:

    def __init__(self):
        logging.info("initializing Configuration from files")
        self.current_configs = {}
        self.root_directory = self.set_project_root()
        self.manager_configs = self.open_manager_configs()
        self.current_configs.update(self.manager_configs)

        self.secrets_path = self.current_configs.get('secrets_path')
        self.cached_configs = self.open_cached_configs()
        self.current_configs.update(self.cached_configs)

        self.gpt_path = self.set_secrets_path("openai.env")
        self.drive_token_path = self.set_secrets_path("token.json",
            default=os.path.join(self.secrets_path, "token.json"))
        self.drive_creds_path = self.set_secrets_path("credentials.json")
        self.obs_creds_path = self.current_configs.get("obs_secret_filename")

    @staticmethod
    def set_project_root():
        logging.info(f"setting project root")
        this_project_root = os.environ.get('PROJECT_ROOT')

        if not this_project_root:

                this_project_root = project_root()
                os.environ['PROJECT_ROOT'] = this_project_root

        return this_project_root


    def open_manager_configs(self):
        file_path = os.path.join(self.root_directory, 'manager_config.json')

        logging.info(f'Configuration.open_user_configs loader loading from path {file_path}')

        if not os.path.exists(file_path):
            logging.error(f"utility_file.json_loader is unable to find file {file_path}.  No object returned")
            return {}

        logging.debug(f'{file_path} is a valid file path - proceeding to load...')
        json_file = json_loader(file_path, 'r')

        if not json_file:
            logging.error(
                f"Configuration.open_user_configs failed to load manager_config.json file: {file_path}")
            return {}

        return json_file


    def set_secrets_path(self, stored_data, default=None):
        logging.debug(f'Setting path for {stored_data}...')
        store_path = os.path.join(self.secrets_path, stored_data)

        if os.path.exists(store_path):
            logging.debug(f"{stored_data} found at path {store_path}.")
            return store_path

        logging.error(f"Could not locate key for {stored_data} in location {store_path}.  Validate the secret's location and reload the secret")

        return default


    def open_cached_configs(self):
        cached_configs = {}
        logging.debug('opening cached configs...')
        managed_cache_path = os.path.join(self.secrets_path, "cached_configs.json")
        json_file = json_loader(managed_cache_path)

        if not json_file:
            logging.error(f"Configuration.open_cached_configs failed to load \
                cached_config.json file - creating a new cached config." )

            self.cached_configs = cached_configs
            self.write_cached_configs()

            with open(managed_cache_path, "w") as f:
                json.dump(self.cached_configs, f, indent=4)

            return cached_configs

        return json_file


    def clear_cached_configs(self):

        # drop all cached configs
        logging.info("dropping cached configs")
        self.cached_configs = {}

        # write cached config to cache_store
        managed_cache_path = os.path.join(self.secrets_path, "cached_configs.json")
        status, error = self.write_cached_config()

        if status == 1 or error:
            logging.error(f"Configuration.clear_cached_config experienced \
                an error clearing the cached config: {error}")

        return


    def set_cached_configs(self, settings: dict):
        if type(settings) == dict:
            self.cached_configs.update(settings)
            self.current_configs.update(settings)
        return

    def update_cached(self, keys, values):

        self.current_configs[keys] = values
        self.cached_configs[keys] = values
        self.write_cached_configs()

        return

    def add_cached(self, new_configs):

        self.current_configs.update(new_configs)
        self.cached_configs.update(new_configs)
        self.write_cached_configs()

        return


    def write_cached_configs(self):
        managed_cache_path = os.path.join(self.secrets_path, "cached_configs.json")

        try:
            logging.info("writing cached configs to file")
            with open(managed_cache_path, "w") as f:
                json.dump(self.cached_configs, f, indent=4)

            return 0, None

        except Exceptions as error:
            logging.error("Configuration.write_cached_config experienced \
                an error when writing the cache to disk:  {error}")

            return 1, error



if __name__ == "__main__":

    pass





