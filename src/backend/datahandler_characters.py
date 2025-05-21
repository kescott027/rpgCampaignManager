from .datahandler import RpgDatabase
import json

class CharacterDataHandler(RpgDatabase):
    def __init__(self):
        super().__init__()
        self.init()

    def init(self):
        create_table = """
        CREATE TABLE IF NOT EXISTS characters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            player BOOLEAN DEFAULT 1,
            player_name TEXT,
            scene TEXT,
            campaign TEXT,
            active BOOLEAN DEFAULT 1,
            image TEXT,
            datafile TEXT,
            ac INTEGER,
            hp INTEGER,
            perception INTEGER,
            will INTEGER,
            fortitude INTEGER,
            reflex INTEGER,
            conditions TEXT DEFAULT '[]',
            notes TEXT,
            tags TEXT DEFAULT '[]'
        );
        """
        self.write(create_table)


    def get_characters(self, include_inactive=False):
        command = "SELECT * FROM characters"
        if not include_inactive:
            command += " WHERE active = 1"
        rows = self.read (command)

        # Convert each row to dict
        columns = [
            "id", "name", "player", "player_name", "scene", "campaign",
            "active", "image", "datafile", "ac", "hp",
            "perception", "will", "fortitude", "reflex",
            "conditions", "notes", "tags"
        ]

        return [
            {
                **dict(zip(columns, row)),
                "conditions": json.loads(row[15]),
                "tags": json.loads(row[17])
            }
            for row in rows
        ]

    def add_character(self, character):
        insert = """
        INSERT INTO characters (
            name, player, player_name, scene, campaign, active,
            image, datafile, ac, hp,
            perception, will, fortitude, reflex,
            conditions, notes, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        self.write(insert, (
            character["name"],
            int(character.get("player", True)),
            character.get("player_name"),
            character.get("scene"),
            character.get("campaign"),
            int(character.get("active", True)),
            character.get("image"),
            character.get("datafile"),
            character.get("ac"),
            character.get("hp"),
            character.get("perception"),
            character.get("will"),
            character.get("fortitude"),
            character.get("reflex"),
            json.dumps(character.get("conditions", [])),
            character.get("notes"),
            json.dumps(character.get("tags", []))
        ))

    def update_character(self, character):
        update = """
        UPDATE characters SET
          name = ?, player = ?, player_name = ?, scene = ?, campaign = ?, active = ?,
          image = ?, datafile = ?, ac = ?, hp = ?,
          perception = ?, will = ?, fortitude = ?, reflex = ?,
          conditions = ?, notes = ?, tags = ?
        WHERE id = ?
        """

        self.write(update, (
            character.get("name"),
            int(character.get("player", True)),
            character.get("player_name"),
            character.get("scene"),
            character.get("campaign"),
            int(character.get("active", True)),
            character.get("image"),
            character.get("datafile"),
            character.get("ac"),
            character.get("hp"),
            character.get("perception"),
            character.get("will"),
            character.get("fortitude"),
            character.get("reflex"),
            json.dumps(character.get("conditions", [])),
            character.get("notes"),
            json.dumps(character.get("tags", [])),
            character["id"]
        ))

    def replace_queue(self, entries):
        conn = self.connect()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM combat_queue")

        for entry in entries:
            cursor.execute("""
                INSERT INTO combat_queue (name, initiative, scene, hp, conditions, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (
                entry.get("name"),
                int(entry.get("initiative", 0)),
                entry.get("scene") or entry.get("name"),
                entry.get("hp") or 0,
                json.dumps(entry.get("conditions", []))
            ))

        conn.commit()
        conn.close()
