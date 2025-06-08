# src/backend/controller_obs.py
import json
import logging
import os
from pathlib import Path
import obsws_python as obs
from src.backend.controller_configuration import Configuration as Config
from src.backend.utility_file import json_loader

logging.basicConfig(level=logging.DEBUG)


class OBSController:
    def __init__(self, host='localhost', port=4455, password=None, source=None):
        self.config = Config(source='OBSController')
        self.host = host
        self.port = port
        self.password = ""
        self.ws = None
        self.configure_controller()
        self.connect()


    def configure_controller(self):
        self.host = self.config.current_configs.get("obs_host")
        self.port = self.config.current_configs.get("obs_port")
        self.password = self.get_obs_password()
        if not self.host or not self.port or not self.password:
            logging.error('failed to load one or more OBS configurations:')
            if not self.host:
                logging.error('unable to load OBS host:')
            if not self.port:
                logging.error('unable to load OBS port:')
            if not self.password:
                logging.error('unable to load OBS password:')


    def get_obs_password(self):
        obs_password_path = os.path.join(self.config.secrets_path, "obs_password.json")
        with open(obs_password_path, 'r') as f:
            secret = json.load(f).get("obs_password")
        return secret


    def execute_command(self, command, args):
        # redo with updated web socket
        command_args = args[0]
        try:
            self.connect()
            command_options = {
                "scene": self.change_scene,
                "record": self.toggle_recording
            }

            command = command_options.get(command, None)
            if not command:
                return f"❓ Unknown command: {command}"
            else:
                return command(command_args)

        except Exception as e:
            logging.error(f"OBS command failed: {e}")
            return f"❌ OBS error: {e}"
        finally:
            self.disconnect()


    def change_scene(self, scene_name):
        logging.info(f"recieving screen change request to {scene_name}")
        self.ws.set_current_program_scene(scene_name)
        return f"🎬 Switched scene to '{scene_name}'"


    def get_scene_list(self):
        logging.info(f"retrieving scene names")
        response = self.ws.get_scene_list()
        logging.error(dir(response))
        return response.scenes


    def connect(self):
        try:
            self.ws = obs.ReqClient(host='localhost', port=4455, password=self.password)
            logging.info("✅ Connected to OBS WebSocket")
        except Exception as e:
            logging.error(f"❌ Failed to connect to OBS: {e}")
        return


    def create_scene(self, scene_name):
        self.ws.create_scene(scene_name)
        return True


    def create_scene_item(self, scene_name, image_path, enabled=True):
        return self.ws.create_scene_item(scene_name, image_path, enabled=True,)


    def broadcast(self, payload):
        self.ws.broadcast_custom_event(payload)
        logging.info("OBS Broadcasting custom event")
        return


    def disconnect(self):
        if self.ws:
            self.ws.disconnect()
            logging.info("Disconnected from OBS WebSocket")
        return


    def toggle_recording(self, action="start"):
        action = action.lower()
        if action == "start":
            self.ws.call(requests.StartRecord())
            return "⏺️ Recording started"
        elif action == "stop":
            self.ws.call(requests.StopRecord())
            return "⏹️ Recording stopped"
        else:
            return f"⚠️ Unknown recording action '{action}'"



class OBSCommandHandler:
    def __init__(self, source=None  ):
        self.proxy = OBSController()


    def scene(self, command, args):
        logging.info(f"OBSCommandHandler calling command: {command} args: {args}")
        if not args:
            return {"response": "Usage: /obs scene = <SceneName>"}

        scene = args.replace('scene =', '').strip()

        logging.info(f"sending scene change to proxy {scene}")
        self.proxy.change_scene(scene)
        return {"response": f"Scene changed to '{scene}'"}


    def send_image_to_campaign_scene(self, image_path):
        current_dir = str(os.getcwd())
        logging.info(f"current directory: {current_dir}")
        abs_path = f"{current_dir}{image_path}"
        # abs_path = Path(combined_path)
        scene_name = "campaignManager"
        source_name = "StickyImage"
        logging.info(f"sending {abs_path} to OBS")

        scenes = self.proxy.get_scene_list()

        exists = any(d.get("sceneName") == scene_name for d in scenes)
        if not exists:
            self.proxy.create_scene(scene_name)

        # Create or update image source
        params = self.proxy.create_scene_item(scene_name, abs_path, enabled=True,)
        self.proxy.change_scene(scene)

        return True


