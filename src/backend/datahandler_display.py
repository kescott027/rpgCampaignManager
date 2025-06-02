import datetime
import json
import logging
from fastapi.responses import JSONResponse
from src.backend.datahandler import RpgDatabase
from src.backend.controller_configuration import Configuration
from src.backend.controller_localstore import LocalFileHandler


class DisplayDataHandler(RpgDatabase):
    def __init__(self):
        super().__init__()
        self.init()
        self.local_store = LocalFileHandler()


    def init(self):

        table_definitions = {
        "sticky_notes": self.init_sticky_notes,
        "sticky_layouts": self.init_layout,
        "sticky_assets": self.init_sticky_assets
        }

        self.init_as_needed(table_definitions)
        return

    def init_sticky_notes(self):
        command = """
        CREATE TABLE IF NOT EXISTS sticky_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            content TEXT,
            x INTEGER,
            y INTEGER,
            width INTEGER,
            height INTEGER,
            layout_id INTEGER,
            FOREIGN KEY (layout_id) REFERENCES sticky_layouts(id) ON DELETE CASCADE
        );
        """
        self.write(command)

    def init_sticky_assets(self):
        command = """
            CREATE TABLE IF NOT EXISTS sticky_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                path TEXT NOT NULL,
                user_space TEXT,
                campaign TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """
        self.write(command)


    def init_layout(self):
        command = """
        CREATE TABLE IF NOT EXISTS sticky_layouts (
            layout_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            notes TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_space TEXT NOT NULL,
            campaign TEXT NOT NULL
        );
        """
        self.write(command)

    def init_add_sticky_assets(self):
        # -- migration_add_sticky_assets.sql
        command = """
        CREATE TABLE IF NOT EXISTS sticky_assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,             -- e.g., 'image', 'markdown', 'txt', 'pdf', 'mp3', 'docx'
            path TEXT NOT NULL,             -- file path relative to the assets directory
            user_space TEXT DEFAULT '',     -- reserved for multi-user support
            campaign TEXT DEFAULT '',       -- reserved for campaign-based scoping
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        self.write(command)


    def drop_table(self, table_name):
        command = f"DROP TABLE IF EXISTS {table_name};"

        self.write(command)


    @staticmethod
    def validate_user_token(token=None):
        return True


    def update_layout(self, layout_id, layout_data):
        """Save a sticky note layout to the database."""
        # layout_id = get_or_create_layout_id(layout_name)
        json_data = json.dumps(layout_data)
        command = """
        UPDATE sticky_layouts
        SET notes = ?
        WHERE layout_id = ?;
        """
        self.write(command, (json_data, layout_id))


    def load_layout(self, name, user_space, campaign):
        """Load the most recent layout with a given name."""
        logging.info(f"loading layout name: {name}-{user_space}-{campaign}")
        layout_id = self.get_layout_id(name, user_space, campaign)

        if layout_id is None:
            return JSONResponse(status_code=404, content={"notes": []})

        try:
            result = self.read(
                f"SELECT notes FROM sticky_layouts WHERE layout_id = {layout_id}",
            )

            if not result or not result[0][0]:
                logging.warning(f"No notes found for layout ID {layout_id}")
                return JSONResponse(status_code=200, content={"notes": []})

            raw_notes = result[0][0]
            parsed_notes = json.loads(raw_notes)

            logging.info(f"returning stickynotes: {result[0][0]}")
            return JSONResponse(status_code=200, content={'notes': parsed_notes})

        except Exception as e:
            logging.error(f"❌ Failed to load sticky note layout: {e}")
            return JSONResponse(status_code=500, content={"error": "Internal server error."})



    def fetch_layout_names(self):
        """Return a list of all saved layout names (distinct)."""
        logging.info("fetching list of layout names")
        command = "SELECT DISTINCT name FROM sticky_layouts ORDER BY name ASC;"
        results = self.read(command)
        return [r[0] for r in results if r[0]]


    def delete_layout(self, name, user_space, campaign):
        logging.info(f"request to delete {name}-{user_space}-{campaign} from sticky_layouts")
        layout_id = self.get_layout_id(name, user_space, campaign)
        if layout_id is None:
            logging.warning(f"No layout found for {name}-{user_space}-{campaign}")
            return

        command = "DELETE FROM sticky_layouts WHERE layout_id = ?;"
        self.write(command, (layout_id,))
        logging.info(f"Layout {name}-{user_space}-{campaign} (ID {layout_id}) deleted")
        return


    def rename_layout(self, old_name, new_name, user_space, campaign):
        """Rename layout from old_name to new_name."""

        command = """UPDATE sticky_layouts SET name = ?
        WHERE name = ? AND user_space = ? AND campaign = ?;
        """
        self.write(command, (new_name, old_name, user_space, campaign))
        return


    def get_layout_id(self, name, user_space, campaign):
        """
        suggested query:

        query = \"\"\"
        SELECT layout_id FROM sticky_layouts
        WHERE name = ? AND user_space = ? AND campaign = ?;
        \"\"\"

        result = self.read(query, (name, user_space, campaign))
        """

        query = f"""
            SELECT layout_id FROM sticky_layouts
            WHERE name = '{name}' AND user_space = '{user_space}' AND campaign = '{campaign}';
        """
        result = self.read(query)

        if result:
            logging.info(f"load layout returned: {result[0][0]}")
            return result[0][0]

        return None


    def fetch_sticky_note(self, note_id):

        query = f"SELECT type, content, x, y, width, height FROM sticky_notes WHERE id = {note_id};"

        try:
            rows = self.read(query)
            if type(rows) == 'string':
                return rows

            return {
                "id": row[0],
                "type": row[1],
                "content": row[2],
                "position": json.loads(row[3]) if row[3] else {},
                "width": row[5],
                "height": row[6],
                }
        # except JSONDecodeError as error:
        #     return {"Read Error: could not read response "}
        except Exception as e:
            return {"Read Error: could not read response "}


    def fetch_sticky_notes(self, id, user_space, campaign):
        # layout_id = self.get_layout_id(layout_name)
        query = f"SELECT id, type, content, position, size FROM sticky_notes WHERE layout_id = {layout_id};"
        # x, y, width, height FROM sticky_notes;"
        try:
            rows = self.read(query)
            if type(rows) == 'string':
                return rows

            return [
                {
                    "id": row[0],
                    "type": row[1],
                    "content": row[2],
                    "position": json.loads(row[3]) if row[3] else {},
                    "width": row[5],
                    "height": row[6],
                }
                for row in rows
            ]
        # except JSONDecodeError as error:
        #     return {"Read Error: could not read response "}
        except Exception as e:
            return {"Read Error: could not read response "}


    def get_or_create_layout_id(self, name, user_space, campaign):

        layout_id = self.get_layout_id(name, user_space, campaign)
        if layout_id:
            logging.info(f"get layout id returned: {layout_id}")
            return layout_id

        insert = """
            INSERT INTO sticky_layouts (name, user_space, campaign)
            VALUES (?, ?, ?)
        """
        self.write(insert, (name, user_space, campaign))
        return self.get_layout_id(name, user_space, campaign)



    def update_sticky_notes(self, name, notes):
        layout = self.get_or_create_layout_id(name)
        # self.write("DELETE FROM sticky_notes;")
        for note in notes:
            logging.info(f"Saving Stickynote {note.get('id')} to")
            insert_query = (
                "INSERT INTO sticky_notes (id, type, content, x, y, width, height) "
                "VALUES (?, ?, ?, ?, ?, ?, ?);"
            )
            self.write(
                insert_query,
                (
                    note.get("id"),
                    note.get("type"),
                    note.get("content"),
                    note.get("x"),
                    note.get("y"),
                    note.get("width"),
                    note.get("height"),
                )
            )


    def insert_sticky_asset(self, name, type, path, user_space="", campaign=""):
        command = """
            INSERT INTO sticky_assets (name, type, path, user_space, campaign)
            VALUES (?, ?, ?, ?, ?);
        """
        try:
            # timestamp = '{:%Y-%m-%d %H:%M:%S}'.format(datetime.datetime.now())
            self.write(command, (name, type, str(path), user_space, campaign))
            return {"status": "OK", "text": "db.write successful" }

        except Exception as e:
            message = f"Failed to insert sticky_asset {name}"
            logging.debug(
            f"DisplayDataHandler.init_add_sticky_assets: to insert sticky_assets {e}"
            )

            logging.error(message)
            return {"status": "error", "text": message}


    def post_sticky_assets(self, file_data, type, path, user_space=None, campaign=None, layout=None):
        # self.local_store
        file_name = file_data.filename
        logging.info(f"save filename to db: {file_name}")


        try:
            response = self.insert_sticky_asset(
                file_name,
                type,
                path,
                user_space,
                campaign,
            )


            return response

        except Exception as e:

            logging.error(f'DisplayDataHandler.post_sticky_assets db save failed {e}')
            return {"status": "error", "text": "Upload failed: could not contact datastore"}


    def fetch_sticky_assets(self, user_space=None, campaign=None):
        base_query = "SELECT id, filename, path, user_space, campaign, uploaded_at FROM sticky_assets"
        conditions = []
        params = []

        if user_space:
            conditions.append("user_space = ?")
            params.append(user_space)

        if campaign:
            conditions.append("campaign = ?")
            params.append(campaign)

        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)

        base_query += " ORDER BY uploaded_at DESC"

        rows = self.read(base_query, params=params if params else None)
        return [
            {
                "id": r[0],
                "filename": r[1],
                "path": r[2],
                "user_space": r[3],
                "campaign": r[4],
                "uploaded_at": r[5]
            }
            for r in rows
        ]


    def delete_sticky_assets(self, filename, user_space=None, campaign=None):

        base_query = "SELECT path FROM sticky_assets"
        conditions = []
        params = []

        if user_space:
            conditions.append("user_space = ?")
            params.append(user_space)

        if campaign:
            conditions.append("campaign = ?")
            params.append(campaign)

        if conditions:
            base_query += f" filename = {filename}"

        path = self.read(base_query, params=params if params else None)

        response = self.local_store.trash_asset_file(source_path)

        if response.get("text") == "trashed":
            trashed_filename = response.get('trashed_path', 'backup_file')
            command = """
                INSERT INTO sticky_assets (filename, path, user_space, campaign)
                VALUES (?, ?, ?, ?);
            """

            self.write(command, (
                f"{filename}.trashed",
                trashed_path,
                f"{user_space}-trash-bin",
                campaign))

        return response

