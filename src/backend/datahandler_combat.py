import json
import logging
from src.backend.datahandler import RpgDatabase
import sqlite3

class InitiativeCommandHandler:
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching InitiativeCommandHandler')
        self.combat_handler = CombatDataHandler(source='InitiativeCommandHandler')

    def rebuild(self, command, args=None):
        return None


    def submit(self, command, args):
        return None


    def initiative(self, command, args):

        flag = None
        logging.error(f"initiative_controller:initiative call: {command} {args}")
        if args == 'include_inactive':
            flag = include_inactive=True
        initiative = self.combat_handler.get_combat_queue(command, flag)

        return None

    def previous_action(self, command, args=None):
       from src.backend.dataHandler import CombatDataHandler
       db = CombatDataHandler()

       prev = db.reverse_turn()
       if not prev:
           return {"response": "⚠️ Cannot go back — no combatants."}

       name = prev["name"]
       scene = prev.get("scene") or name

       try:
           self.obs_proxy.change_scene(scene)
       except Exception as e:
           logging.error(f"❌ OBS scene update failed: {e}")

       return {
           "response": f"🔁 Reversed to {name}'s turn. (Scene: {scene})",
           "current": name,
           "current_index": prev["current_index"]
       }


    def next_action(self, command, args=None):
       from src.backend.dataHandler import CombatDataHandler
       db = CombatDataHandler()

       next_entry = db.advance_turn()

       if not next_entry:
           return {"response": "⚠️ No active combatants."}

       name = next_entry["name"]
       scene = next_entry.get("scene") or name
       index = next_entry["current_index"]

       try:
           self.obs_proxy.change_scene(scene)
       except Exception as e:
           logging.error(f"❌ OBS scene update failed: {e}")

       return {
           "response": f"🎯 It is now {name}'s turn! (Scene: {scene})",
           "current": name,
           "current_index": index,
           "scene": scene
           }


    def reset_slot(self, command, args=None):
        return None


class CombatDataHandler(RpgDatabase):
    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching OBSController')
        logging.debug(f'datahandler_combat.CombatDatabase.__init__() ')
        logging.debug(f'datahandler_combat:CombatDataHandler calling superclass RpgDatabase.__init__()')
        super().__init__()


    def init(self):
        table_definitions = {
        "combat_queue": self.init_combat_queue
        }

    def init_combat_queue(self):
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

        self.db.write(command)


    def get_combat_queue(self, include_inactive=False):
        """Fetch current combat queue from DB."""

        if include_inactive:
            command = "SELECT name, initiative, scene, hp, conditions, is_active FROM combat_queue ORDER BY initiative DESC"
        else:
            command = "SELECT name, initiative, scene, hp, conditions FROM combat_queue WHERE is_active = 1 ORDER BY initiative DESC"
        try:

            initiative_queue = self.read(executable=command)

        except Exception as error:
            raise ValueError(command, error)

        result = ([
            {
                "name": current_character[0],
                "initiative": current_character[1],
                "scene": current_character[2],
                "hp": current_character[3],
                "conditions": json.loads(current_character[4])
            }
            for current_character in initiative_queue
        ])
        logging.debug(f"CombatDataHandler.get_combat_queue fetcing : {result}")
        return result


    def clear_queue(self, args=None):
        logging.info('Clear Queue requested - deleting current combat_queue')
        self.write("DELETE FROM combat_queue")  # clear
        logging.info(' Combat Queue Cleared')
        return {"result": 200, "status": "OK"}


    def replace_queue(self, entries: list[dict]):
        logging.debug(f' replace_queue deleting current combat_queue')
        self.write("DELETE FROM combat_queue")  # clear
        logging.debug(f' replace queue writing {entries}to replace_queue')
        for entry in entries:
            self.write(
                """
                INSERT INTO combat_queue (name, initiative, scene, hp, conditions, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    entry.get("name", ""),
                    entry.get("initiative", 0),
                    entry.get("scene", entry.get("name", "")),
                    entry.get("hp", 0),
                    json.dumps(entry.get("conditions", [])),
                    1
                )
            )

    def load_combat_queue(self, entries):
        """Clear and load new initiative queue into the database."""
        self.write("DELETE FROM combat_queue")

        insert_cmd = """
        INSERT INTO combat_queue (name, initiative, scene, hp, conditions, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        """

        for entry in entries:
            queue_insert = (
                entry.get("name"),
                entry.get("initiative", 0),
                entry.get("scene", entry.get("name")),
                entry.get("hp", None),
                json.dumps(entry.get("conditions", []))
            )

            self.write(insert_cmd, queue_insert)
            logging.debug(f'writing to queue: {queue_insert}')


    def advance_turn(self):
        """Advance to the next combatant and return their full info."""
        conn = self.connect()
        cursor = conn.db.cursor()

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


class CombatHandler:

    def __init__(self, source='Unknown'):
        self.source = source
        logging.debug(f'{source} launching CombatHandler')
        self.DataHandler = CombatDataHandler()
        self.db = self.DataHandler.database_path('cm_datastore.db')


    @staticmethod
    def name_case(name):
        return name[0].upper() + name[1:].lower()

    def get_character_pool():
        return


    def get_initiative_queue(self, command, args=None, include_inactive=None):

        """Fetch current combat queue from DB."""

        if args == 'include_inactive':
            command = "SELECT name, initiative, scene, hp, conditions, is_active FROM combat_queue ORDER BY initiative DESC"
        else:
            command = "SELECT name, initiative, scene, hp, conditions FROM combat_queue WHERE is_active = 1 ORDER BY initiative DESC"

        try:

            initiative_queue = self.DataHandler.read(executable=command)

        except Exception as error:
            raise ValueError(command, error)

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

    def set_initiative(self, args):
        requests = args.split()
        params = []

        #try:
        while len(requests)>0:
            char = requests.pop(0)
            init = requests.pop(0)
            params.append( (init, char) )

        command = "UPDATE combat_queue SET initiative = ? WHERE name = ?"
        try:
            for initiative, character in params:
                self.DataHandler.write(command, (initiative, character))
                logging.info(f"CombatHandler.set_initiative: initiative for {character} to {initiative}")

        except Exception as error:

            logging.error(f"CombatHandler:set_initiative failed : {error}")
            return {"response": 500, "message": "update failed"}

        return {"response": 200, "message": "Upadate Complete"}


    def update_combat_queue(self, entries: list[dict]):

        if not isinstance(entries, list):
            raise ValueError("Entries must be a list of dicts")

        logging.debug(f' DataHandler/update-combat-queue sending {entries}to replace_queue')
        self.DataHandler.replace_queue(entries)

        return len(entries)



    def change_initiative_slot(target_character, order):
        # get current initiative slot of target

        # pop character out of initiative

        # insert character back into initiative
        return


    def get_character_pool():
        return


    def get_character_pool():
        return
