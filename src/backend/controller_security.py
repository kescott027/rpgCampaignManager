import os
import openai
import json
from dotenv import load_dotenv
from .controller_localstore import project_root
from typing import Optional
from pathlib import Path


def secure_path(path: str) -> str:
    # Prevent directory traversal
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(BASE_DIR):
        raise ValueError("Unauthorized path access")
    return abs_path


def load_config():
    config_path = os.path.join(project_root(), "manager_config.json")
    ### troubleshooting

    error_message = f"validating config_path; {config_path}"
    raise ValueError(config_path)
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            config = json.load(f)

        if config["google_drive_oauth"]:
            get_google_oauth_creds
        elif config["google_drive_api"]:
            get_google_drive_key
        elif config["google_drive_service"]:
            get_google_service_account()
        else:
            get_google_oauth_creds
        return config
    return {}


def get_gpt_key():
    env_path = os.path.join(project_root(), ".security", "openai.env")

    if not os.getenv("OPENAI_API_KEY"):
        load_dotenv(env_path)

    openai.api_key = os.getenv("OPENAI_API_KEY")

    if not openai.api_key:
        raise ValueError(f"❌ OPENAI_API_KEY is missing. Path attempted: {env_path}")

    return openai.api_key
