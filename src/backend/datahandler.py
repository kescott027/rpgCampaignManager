# dataHandler.py
import sqlite3
import json
import logging
import os
from pathlib import Path
from src.backend.controller_configuration import Configuration


logging.basicConfig(level=logging.DEBUG)
DB_PATH = Path("cm_datastore.db")


class RpgDatabase:
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching Storage controller.DataHandler.RpgDatabase')
        self.config = Configuration()
        self.db_path = self.database_path('cm_datastore.db')
        logging.debug(f'dataHandler.RpgDatabase.__init__ launching')

    def database_path(self, db_name):
        logging.debug(f'dataHandler.RpgDatabase.database_path - db_name {db_name}')
        db_path = os.path.join(
                self.config.root_directory,
                self.config.current_configs.get('local_assets_directory'),
                db_name)

        return db_path


    def init(self):

        return

    def read(self, executable, rows=None):
        logging.debug(f'dataHandler.RpgDatabase.read:  {executable} rows={str(rows)}')
        try:
            conn = self.connect()
            cursor = conn.cursor()

            cursor.execute(executable)

            if rows:
                response = cursor.fetchmany(rows)
            else:
                response = cursor.fetchall()

            conn.commit()
            conn.close()
            # logging.debug(f"sending response: {response}")
            return response

        except sqlite3.OperationalError as error:
            ui_error_msg = f'Error: Failed to read from database'
            logging.error(ui_error_msg)
            logging.debug(f'datahandler.read failed read operation: {error}')
            return {ui_error_msg}

        except Exception as e:
            ui_error_msg = f'Error: Failed to communicate with database'
            logging.error(ui_error_nsg)
            logging.debug(f'datahandler.read failed read operation: {error}')
            return {ui_error_msg}


    def table_exists(self, table_name):
        query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?;"
        with self.connect() as conn:
            result = conn.execute(query, (table_name,)).fetchone()
            return result is not None


    def init_as_needed(self, table_definitions):
        for table_name, init_fn in table_definitions.items():
            if not self.table_exists(table_name):
                print(f" Creating missing table: {table_name}")
                init_fn()


    def dataset_write(self, executable, params):
        result = {}
        try:
            with self.connect() as conn:
                cursor = conn.cursor()
                for key, value in params.items():
                    cursor.execute(
                        executable,
                        (key, value)
                    )
            conn.commit()
            con.close()
            return {'200 Operation Successful'}

        except sqlite3.OperationalError as error:
            ui_error_msg = f'Failed to write to database, error'
            logging.error(ui_error_msg)
            logging.debug(f'datahandler.write failed write operation: {error}')
            return {ui_error_msg}

        except Exception as e:
            ui_error_msg = f'Error: Failed to communicate with database'
            logging.error(ui_error_msg)
            logging.debug(f'datahandler.write failed write operation: {error}')
            return {ui_error_msg}


    def write(self, executable, params=None):
        logging.debug(f'dataHandler.RpgDatabase.write:  {executable} params={str(params)}')

        conn = self.connect()
        cursor = conn.cursor()

        result = cursor.execute(executable, params or ())

        conn.commit()
        conn.close()
        # logging.debug(f"write complete: {result}")
        return result


    def connect(self):
        logging.debug(f'dataHandler.RpgDatabase.connect:  {self.db_path}')
        return sqlite3.connect(self.db_path)


