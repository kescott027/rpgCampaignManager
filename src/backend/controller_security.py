import os
import openai
import json
import logging
from pydantic import BaseModel
from src.backend.controller_configuration import Configuration as Config
from src.backend.utility_file import json_loader
from .controller_localstore import project_root
from typing import Optional
from pathlib import Path


class SecretPayload(BaseModel):
    openaiKey: Optional[str] = None
    googleKey: Optional[str] = None


class SecretCheckResponse(BaseModel):
    missingOpenAI: bool
    missingGoogle: bool


class GptLoader:
    def __init__(self):
        self.config = Config()
        self.key_path = self.config.gpt_path
        self.key = ""
        self.load_gpt_key()

    def load_gpt_key(self):

        key_path = self.key_path

        if not os.path.exists(key_path):
            logging.error(f"Error - path {key_path} is not found. \
                verify the key location and reload.")
            return None

        gpt_key_json = json_loader(key_path)

        if not gpt_key_json:
            logging.error(f"controller_security.GptLoader could not \
                load GPT key from {self.key_path}.")
            return None

        self.key = gpt_key_json.get("OPENAI_API_KEY", None)
        if not self.key:
            raise ValueError("unable to retrieve OPENAI_API_KEY from json")

        os.environ['OPENAI_API_KEY'] = self.key

        return # gpt_key


def secure_path(path: str) -> str:
    # Prevent directory traversal
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(BASE_DIR):
        raise ValueError("Unauthorized path access")
    return abs_path


def load_config():

    config = Config()
    return config.current_config


def get_gpt_key():

    gpt = GptLoader()
    return gpt.key
