#.src.backend.controller_command.py
import logging
from src.backend.controller_configuration import Configuration
from src.backend.controller_obs import OBSController
from src.backend.controller_gpt import GPTProxy


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

        logging.error(f"Error calling command {command} {args}")
        reply = f"unexpected command /{command} {args}"
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


    def next_action(self, command, args=None):

        if not args:
            args = ""
        logging.info(f"calling command {command} {args}")

        order = self.config.cached_configs.get("initiative_order", [])
        if not order:
            return {"response": "⚠️ Initiative not started. Use /initiative first."}

        index = self.config.cached_configs.get("current_slot", 0)
        index = (index + 1) % len(order)
        self.config.cached_configs["current_slot"] = index
        current = order[index]
        self.config.write_cached_configs()

        scene = self.config.cached_configs.get("scene_mapping", {}).get(current, f"{current} Scene")
        obs.change_scene(scene)

        return {"response": f"🎯 It is now {current}'s turn! (Scene: {scene})"}


    def initiative(self, command, args=None):

        if not args:
            args = ""
        logging.info(f"calling command {command} {args}")

        chars = self.config.cached_configs.get("characters", [])
        self.config.cached_configs["initiative_pending"] = chars + ["GM"]
        self.config.cached_configs["initiative_values"] = {}
        self.config.write_cached_configs()

        return {"response": f"📝 What is {chars[0]}'s initiative?"}


    def set_action(self, command, args=None):

        if not args:
            args = ""
        logging.info(f"calling command {command} {args}")

        if command.lower().startswith("characters"):

            characters = [name.strip() for name in remainder[len("characters"):].split(",") if name.strip()]
            scene_map = {name: f"{name} Scene" for name in characters}
            self.config.cached_configs.update({
                "characters": characters,
                "scene_mapping": scene_map,
                "initiative_order": [],
                "current_slot": 0
            })

            self.config.write_cached_configs()

            return {"response": f"✅ Characters set: {', '.join(characters)}"}

        return {"response": f"Unknown set command, expected 'set characters'"}


