# src/backend/controller_obs.py
import json
import logging
import os
import obsws_python as obs
from src.backend.controller_configuration import Configuration as Config
from src.backend.utility_file import json_loader


class OBSController:
    def __init__(self, host='localhost', port=4455, password=None):
        self.config = Config()
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
        try:
            self.connect()

            if command == "scene":
                return self.change_scene(args[0]) if args else "No scene name provided."
            elif command == "record":
                action = args[0].lower() if args else "start"
                return self.toggle_recording(action)
            else:
                return f"❓ Unknown command: {command}"

        except Exception as e:
            logging.error(f"OBS command failed: {e}")
            return f"❌ OBS error: {e}"
        finally:
            self.disconnect()


    def change_scene(self, scene_name):
        logging.info(f"recieving screen change request to {scene_name}")
        self.ws.set_current_program_scene(scene_name)
        return f"🎬 Switched scene to '{scene_name}'"


    def connect(self):
        try:
            self.ws = obs.ReqClient(host='localhost', port=4455, password=self.password)
            logging.info("✅ Connected to OBS WebSocket")
        except Exception as e:
            logging.error(f"❌ Failed to connect to OBS: {e}")
            raise


    def disconnect(self):
        if self.ws:
            self.ws.disconnect()
            logging.info("🔌 Disconnected from OBS WebSocket")


    def toggle_recording(self, action):
        if action == "start":
            self.ws.call(requests.StartRecord())
            return "⏺️ Recording started"
        elif action == "stop":
            self.ws.call(requests.StopRecord())
            return "⏹️ Recording stopped"
        else:
            return f"⚠️ Unknown recording action '{action}'"
