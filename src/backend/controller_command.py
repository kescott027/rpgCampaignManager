#.src.backend.controller_command.py
import json
import logging
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy
from src.backend.utility_help import slash_command_help


class CommandInterpreter:
    def __init__(self):
        self.config = Configuration()
        self.obs_proxy = OBSController()
        self.gpt_proxy = GPTProxy()

    def parse_command(self, command, args=None):
        logging.info(f"Command Interpreter parsing command /{command} {args}")
        command_method = getattr(self, command, self.command_default)
        return command_method(command, args)


    def command_default(self, command, args):

        logging.error(f"Error calling command /{command} {args}")
        reply = f"unknown command /{command} {args}"
        return {"response": reply}


    def gpt(self, request, prompt):

        logging.info(f"calling command {request} {prompt}")
        reply = self.gpt_proxy.send(prompt)
        return {"response": reply}


    def obs(self, command, args):

        logging.info(f"calling command {command} {args}")
        if args.pop(0) == "scene":
            return self.scene("scene", args)

        return {"response": "⚠️ Usage: /obs scene = <SceneName>"}


    @staticmethod
    def help(command, args=None):
        response = slash_command_help(command, args)

        return {"response": response}


    def rebuild(self, command, args=None):
        logging.info("🔁 Rebuilding initiative tracker from scratch")

        characters = self.config.cached_configs.get("characters", [])

        # Reset initiative-related fields
        self.config.cached_configs["initiative_order"] = []
        self.config.cached_configs["initiative_values"] = {}
        self.config.cached_configs["initiative_pending"] = characters + ["GM"]
        self.config.cached_configs["current_slot"] = 0
        self.config.cached_configs["first_pass_done"] = False

        # Rebuild scene mapping if needed
        scene_map = {name: name for name in characters}
        self.config.cached_configs["scene_mapping"] = scene_map

        self.config.cached_configs["initiative_order"] = [
            { "name": name, "initiative": 0, "scene": scene_map[name] }
            for name in characters
        ]

        self.config.write_cached_configs()

        return {
            "response": f"✅ Initiative system rebuilt. Ready for new inputs.",
            "characters": characters,
            "scene_mapping": scene_map
        }


    def scene(self, command, args):
        logging.info(f"calling command {command} {args}")

        filtered_list = list(filter(lambda x: "=" not in x, args))
        scene = " ".join(filtered_list)
        self.obs_proxy.change_scene(scene)

        return {"response": f"🎬 Scene changed to '{scene}'"}

    def submit(self, command, args):
        logging.info(f"calling command {command} {args}")
        if command and command[0] == "initiative":
            name = args[1] if len(args) > 2 else None
            value = int(args[2]) if len(args) > 2 and args[2].isdigit() else 0

            if name:
                self.config.cached_configs["initiative_values"][name] = value
                pending = self.config.cached_configs["initiative_pending"]
                self.config.cached_configs["initiative_pending"] = [n for n in pending if n != name]

                if not self.config.cached_configs["initiative_pending"]:
                    sorted_order = sorted(
                        self.config.cached_configs["initiative_values"].items(),
                        key=lambda x: x[1],
                        reverse=True
                    )
                    final_order = [entry[0] for entry in sorted_order]
                    self.config.cached_configs["initiative_order"] = final_order
                    self.config.cached_configs["current_slot"] = 0

                self.config.write_cached_configs()
                return {"response": f"✅ Initiative order set: {', '.join(final_order)}"}

            else:
                next_up = self.config.cached_configs["initiative_pending"][0]
                self.config.write_cached_configs()
                return {"response": f"📝 What is {next_up}'s initiative?"}

        return {"response": "⚠️ Usage: /submit initiative Kolby 18"}


    def initiative(self, command, args=None):

        if not args:
            args = ""
        logging.info(f"calling command {command} {args}")

        characters = self.config.cached_configs.get("characters", [])

        if not self.config.cached_configs.get("initiative_values"):
            self.config.cached_configs["initiative_values"] = {}

        return {
            "order": self.config.cached_configs.get("initiative_order", []),
            "characters": self.config.cached_configs.get("characters", [])
        }


    def previous_action(self, command, args=None):
        from src.backend.controller_datastore import CombatDatastore
        db = CombatDatastore()

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
        from src.backend.controller_datastore import CombatDatastore
        db = CombatDatastore()

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


    def set_action(self, command, args=None):

        if not args:
            args = ""
        logging.info(f"calling command {command} {args}")

        if command.lower().startswith("characters"):

            characters = [name.strip() for name in remainder[len("characters"):].split(",") if name.strip()]
            scene_map = {name: f"{name}" for name in characters}
            self.config.cached_configs.update({
                "characters": characters,
                "scene_mapping": scene_map,
                "initiative_order": [],
                "current_slot": 0
            })

            self.config.write_cached_configs()

            return {"response": f"✅ Characters set: {', '.join(characters)}"}

        return {"response": f"Unknown set command, expected 'set characters'"}


    def reset_slot(self, command, args=None):
        self.config.cached_configs["current_slot"] = 0
        self.config.write_cached_configs()
        return {"response": "🔁 Initiative index reset to 0"}


    def override(self, command, args):
        logging.info(f"overriding in-memory config: {command} {args}")
        # overrides an existing configuration in memory #

        override_field = args.pop(0)
        equals = args.pop(0) if args[0] == "=" else None
        assembled = "".join(args)

        if (assembled.find("{")>=0) and (assembled.find("}")>=0):
            # treat as json and convert to a dict
            data_type = "dict"
            override_data = json.loads(assembled)

        elif (assembled.find("[]")>=0) and (assembled.find("[]")>=0):
            # make back into a list
            data_type = "list"
            override_data = assembled.split()

        else:
            # just leave as a string
            data_type = "string"
            override_data = assembled

        # override in cached_configs
        self.config.update_cached(override_field, override_data)

        return{"response": f"overriding {override_field} as {data_type}: {override_data}"}
