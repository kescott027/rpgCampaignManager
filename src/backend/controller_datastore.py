# controller_datastore.py
import sqlite3
import json
import os
from pathlib import Path
from src.backend.controller_configuration import Configuration

DB_PATH = Path("cm_datastore.db")


class RpgDatabase:
    def __init__(self):
        self.config = Configuration()
        self.db_path = self.database_path('cm_datastore.db')


    def database_path(self, db_name):
        db_path = os.path.join(
                self.config.root_directory,
                self.config.current_configs.get('local_assets_directory'),
                db_name)

        return db_path


    def init(self):

        return

    def read(self, executable, rows=None):

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


    def write(self, executable, params=None):

        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute(executable, params or ())

        conn.commit()
        conn.close()


    def connect(self):
        return sqlite3.connect(self.db_path)



class CombatDatastore(RpgDatabase):
    def __init__(self):
        super().__init__()

        self.init()


    def init(self):
        """Create tables if they don't exist."""
        command = """
        CREATE TABLE IF NOT EXISTS combat_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            initiative INTEGER DEFAULT 0,
            scene TEXT,
            hp INTEGER,
            conditions TEXT DEFAULT '[]',
            is_active BOOLEAN DEFAULT 1
        );
        """

        self.write(command)


    def get_combat_queue(self, include_inactive=False):
        """Fetch current combat queue from DB."""

        if include_inactive:
            command = "SELECT name, initiative, scene, hp, conditions, is_active FROM combat_queue ORDER BY initiative DESC"
        else:
            command = "SELECT name, initiative, scene, hp, conditions FROM combat_queue WHERE is_active = 1 ORDER BY initiative DESC"

        initiative_queue = self.read(command)

        return [
            {
                "name": current_character[0],
                "initiative": current_character[1],
                "scene": current_character[2],
                "hp": current_character[3],
                "conditions": json.loads(current_character[4])
            }
            for current_character in initiative_queue
        ]

    def load_combat_queue(self, entries):
        """Clear and load new initiative queue into the database."""
        self.write("DELETE FROM combat_queue")

        insert_cmd = """
        INSERT INTO combat_queue (name, initiative, scene, hp, conditions, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        """

        for entry in entries:
            self.write(insert_cmd, (
                entry.get("name"),
                entry.get("initiative", 0),
                entry.get("scene", entry.get("name")),
                entry.get("hp", None),
                json.dumps(entry.get("conditions", []))
            ))


    def advance_turn(self):
        """Advance to the next combatant and return their full info."""
        conn = self.connect()
        cursor = conn.cursor()

        # Fetch current turn index
        cursor.execute("SELECT COUNT(*) FROM combat_queue WHERE is_active = 1")
        total = cursor.fetchone()[0]
        if total == 0:
            return None

        # Create temp table if needed to track current index
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS turn_index (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            current_index INTEGER DEFAULT 0
        );
        """)

        # Ensure row exists
        cursor.execute("INSERT OR IGNORE INTO turn_index (id, current_index) VALUES (1, 0)")

        # Read current index
        cursor.execute("SELECT current_index FROM turn_index WHERE id = 1")
        current_index = cursor.fetchone()[0]

        # Fetch ordered queue
        cursor.execute("""
            SELECT name, initiative, scene, hp, conditions
            FROM combat_queue
            WHERE is_active = 1
            ORDER BY initiative DESC
        """)
        queue = cursor.fetchall()

        if not queue:
            return None

        # Advance index
        next_index = (current_index + 1) % len(queue)
        cursor.execute("UPDATE turn_index SET current_index = ? WHERE id = 1", (next_index,))
        conn.commit()

        next_up = queue[next_index]
        conn.close()

        return {
            "name": next_up[0],
            "initiative": next_up[1],
            "scene": next_up[2],
            "hp": next_up[3],
            "conditions": json.loads(next_up[4]),
            "current_index": next_index
        }

    def reverse_turn(self):
        """Move back one step in the initiative queue."""
        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM combat_queue WHERE is_active = 1")
        total = cursor.fetchone()[0]
        if total == 0:
            return None

        cursor.execute("SELECT current_index FROM turn_index WHERE id = 1")
        index = cursor.fetchone()[0]

        prev_index = (index - 1 + total) % total
        cursor.execute("UPDATE turn_index SET current_index = ? WHERE id = 1", (prev_index,))
        conn.commit()

        cursor.execute("""
            SELECT name, initiative, scene, hp, conditions
            FROM combat_queue
            WHERE is_active = 1
            ORDER BY initiative DESC
        """)
        queue = cursor.fetchall()
        conn.close()

        prev = queue[prev_index]
        return {
            "name": prev[0],
            "initiative": prev[1],
            "scene": prev[2],
            "hp": prev[3],
            "conditions": json.loads(prev[4]),
            "current_index": prev_index
        }

    def get_current_turn(self):
        """Return the currently active turn without advancing."""
        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM combat_queue WHERE is_active = 1")
        total = cursor.fetchone()[0]
        if total == 0:
            return None

        cursor.execute("SELECT current_index FROM turn_index WHERE id = 1")
        index = cursor.fetchone()[0]

        cursor.execute("""
            SELECT name, initiative, scene, hp, conditions
            FROM combat_queue
            WHERE is_active = 1
            ORDER BY initiative DESC
        """)
        queue = cursor.fetchall()
        conn.close()

        if not queue:
            return None

        current = queue[index]
        return {
            "name": current[0],
            "initiative": current[1],
            "scene": current[2],
            "hp": current[3],
            "conditions": json.loads(current[4]),
            "current_index": index
        }
