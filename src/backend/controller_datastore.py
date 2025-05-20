# controller_datastore.py
import sqlite3
import json
import logging
import os
from pathlib import Path
from src.backend.controller_configuration import Configuration

DB_PATH = Path("cm_datastore.db")


class RpgDatabase:
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching Storage controller.datastore.RpgDatabase')
        self.config = Configuration()
        self.db_path = self.database_path('cm_datastore.db')
        logging.debug(f'controller_datastore.RpgDatabase.__init__ launching')

    def database_path(self, db_name):
        logging.debug(f'controller_datastore.RpgDatabase.database_path - db_name {db_name}')
        db_path = os.path.join(
                self.config.root_directory,
                self.config.current_configs.get('local_assets_directory'),
                db_name)

        return db_path


    def init(self):

        return

    def read(self, executable, rows=None):
        logging.debug(f'controller_datastore.RpgDatabase.read:  {executable} rows={str(rows)}')
        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute(executable)

        if rows:
            response = cursor.fetchmany(rows)
        else:
            response = cursor.fetchall()

        conn.commit()
        conn.close()

        return response


    def dataset_write(self, executable, params):
        result = {}
        with self.connect() as conn:
            cursor = conn.cursor()
            for key, value in params.items():
                cursor.execute(
                    executable,
                    (key, value)
                )
        conn.commit()
        con.close()


    def write(self, executable, params=None):
        logging.debug(f'controller_datastore.RpgDatabase.write:  {executable} params={str(params)}')

        conn = self.connect()
        cursor = conn.cursor()

        result = cursor.execute(executable, params or ())

        conn.commit()
        conn.close()

        return result


    def connect(self):
        logging.debug(f'controller_datastore.RpgDatabase.connect:  {self.db_path}')
        return sqlite3.connect(self.db_path)


