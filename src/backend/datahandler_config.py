import datetime
import json
import logging
from fastapi.responses import JSONResponse
from src.backend.datahandler import RpgDatabase as Db
from src.backend.controller_localstore import StorageController
from src.backend.controller_configuration import Configuration as Config

class ConfigDataHandler(Db):
    def __init__(self):
        super().__init__()
        self.config = Config()
        self.init()


    def init(self):
        table_definition ={
        "user": self.user_table_init,
        "campaigns": self.campaigns_table_init,
        "campaign_players": self.campaign_players_table_init,
        "session": self.session_table_init
        }

        self.init_as_needed(table_definition)
        return


    def user_table_init(self):
        command = """
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );
        """
        self.write(command)


    def campaigns_table_init(self):
        command = """
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_name TEXT NOT NULL,
            campaign_system TEXT,
            campaign_description TEXT,
            owner_id INTEGER,
            FOREIGN KEY (owner_id) REFERENCES user(id)
        );
        """
        self.write(command)


    def campaign_players_table_init(self):
        command = """
        CREATE TABLE IF NOT EXISTS campaign_players (
            campaign_id INTEGER,
            user_id INTEGER,
            PRIMARY KEY (campaign_id, user_id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
            FOREIGN KEY (user_id) REFERENCES user(id)
        );
        """
        self.write(command)


    def session_table_init(self):
        command = """
        CREATE TABLE IF NOT EXISTS session (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_name TEXT,
            user_id INTEGER,
            campaign_id INTEGER,
            developer_mode BOOLEAN,
            secrets_path TEXT,
            local_assets_directory TEXT,
            database_name TEXT,
            local_file_store_root TEXT,
            google_drive_oauth BOOLEAN,
            google_drive_service BOOLEAN,
            google_drive_api BOOLEAN,
            default_drive_scopes TEXT,
            gpt_default_prompt TEXT,
            obs_host TEXT,
            obs_port INTEGER,
            character_schema TEXT,
            character_schema_datatypes TEXT,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        );
        """
        self.write(command)

    @staticmethod
    def get_session_schema():
        return  {
            "user_id": "local",
            "session_name": "Untitled Session",
            "session_token": "",
            "developer_mode": False,
            "secrets_path": ".security/",
            "local_assets_directory": "assets",
            "database_name": "cm_datastore.db",
            "local_file_store_root": "my_campaigns/",
            "google_drive_oauth": False,
            "google_drive_service": False,
            "google_drive_api": True,
            "default_drive_scopes": "https://www.googleapis.com/auth/drive.readonly",
            "gpt_default_prompt": "You are a helpful and creative Game Master.",
            "obs_host": "localhost",
            "obs_port": 4455,
            "character_schema": "{}",
            "character_schema_datatypes": "{}"
        }

    def create_session_config(self, user_id):
        session_config = {}
        session_config.update(self.get_session_schema())
        manager_config = self.config.manager_configs
        session_config.update(manager_config)
        session_config['user_id'] = user_id

        # Build insert query dynamically
        columns = ', '.join(session_config.keys())
        placeholders = ', '.join(['?'] * len(session_config))
        values = tuple(session_config.values())

        insert_query = f"INSERT INTO session ({columns}) VALUES ({placeholders});"
        self.write(insert_query, values)

        # Return the newly inserted row as a dictionary
        return self.get_session_config(user_id)


    def get_session_config(self, user_id):
        query = "SELECT * FROM session WHERE user_id = ? LIMIT 1;"
        results = self.read(query, user_id, rows=1)

        if not results:
            return self.create_session_config(user_id)

        columns_query = "PRAGMA table_info(session);"
        column_results = self.read(columns_query)

        row = results[0]
        columns = [desc[1] for desc in column_results]

        return dict(zip(columns, row))


def update_session_config(self, user_id, **kwargs):
    if not kwargs:
        raise ValueError("No fields provided for update.")

    # Make sure the session exists first (or create it if needed)
    session = self.get_session_config(user_id)

    # Update only the fields passed in kwargs
    set_clause = ', '.join(f"{key} = ?" for key in kwargs.keys())
    values = tuple(kwargs.values())

    update_query = f"""
        UPDATE session
        SET {set_clause}
        WHERE user_id = ?;
    """

    self.write(update_query, values + (user_id,))

    # Return the updated session config
    return self.get_session_config(user_id)


    def add_user(self):
        return

    def update_user(self):
        return

    def delete_user(self):
        return
