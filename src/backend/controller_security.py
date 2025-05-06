import os
import openai
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from .controller_localstore import project_root
from typing import Optional
from pathlib import Path


class SecretPayload(BaseModel):
    openaiKey: Optional[str] = None
    googleKey: Optional[str] = None


class SecretCheckResponse(BaseModel):
    missingOpenAI: bool
    missingGoogle: bool


def secure_path(path: str) -> str:
    # Prevent directory traversal
    abs_path = os.path.abspath(path)
    if not abs_path.startswith(BASE_DIR):
        raise ValueError("Unauthorized path access")
    return abs_path


def load_config():
    config_path = Path(__file__).resolve().parents[2] / "manager_config.json"
    if config_path.exists():
        with open(config_path, "r") as f:
            config = json.load(f)

        if config["google_drive_oath"]:
            get_google_oauth_creds
        elif config["google_drive_api"]:
            get_google_drive_key
        elif config["google_drive_service"]:
            get_google_service_account()
        else:
            get_google_oauth_creds
        return config
    return {}


def get_google_oauth_creds():

    if not os.getenv("GOOGLE_CLIENT_ID"):
        env_path = os.path.join(project_root(), ".security", "oauth.json")
        oath_keys = json.loads(env_path)

        os.environ["GOOGLE_CLIENT_ID"] = oath_keys["Client_ID"]
        os.environ["GOOGLE_CLIENT_SECRET"] = oath_keys["Client_Secret"]
        os.environ["REDIRECT_URI"] = oath_keys["Redirect_Url"]
        os.environ["SESSION_STORE"] = Path(".security/oauth_sessions.json")
        if not os.getenv("GOOGLE_CLIENT_ID"):
            raise ValueError(
                f"❌ GOOGLE_CLIENT_ID is missing. ensure your google client credentials are configured correctly: {env_path}"
            )

    return oath_keys


def get_google_service_account():

    if not os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH"):
        env_path = os.path.join(project_root(), ".security", "service_account.json")
        os.environ["GOOGLE_SERVICE_ACCOUNT_PATH"] = env_path
        if not os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH"):
            raise ValueError(
                f"❌ GOOGLE_SERVICE_ACCOUNT_PATH is missing. Path attempted: {env_path}"
            )

    return os.getenv("GOOGLE_SERVICE_ACCOUNT_PATH")


def get_google_drive_key():

    if not os.getenv("GOOGLE_DRIVE_KEY"):
        env_path = os.path.join(project_root(), ".security", "drive_api.key")
        load_dotenv(env_path)

    google_drive_key = os.getenv("GOOGLE_DRIVE_KEY")

    if not google_drive_key:
        raise ValueError(f"❌ GOOGLE_DRIVE_KEY is missing. Path attempted: {env_path}")

    return google_drive_key


def get_gpt_key():
    env_path = os.path.join(project_root(), ".security", "openai.env")

    if not os.getenv("OPENAI_API_KEY"):
        load_dotenv(env_path)

    openai.api_key = os.getenv("OPENAI_API_KEY")

    if not openai.api_key:
        raise ValueError(f"❌ OPENAI_API_KEY is missing. Path attempted: {env_path}")

    return openai.api_key


def key_loader(file_path):
    try:
        with open(file_path, "r") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                file.seek(0)
                lines = file.read().splitlines()
                data = dict(line.split(":", 1) for line in lines if ":" in line)
                return {k.strip(): v.strip() for k, v in data.items()}
    except FileNotFoundError:
        print(f"Error: File not found at '{file_path}'")
    except Exception as e:
        print(f"An error occurred: {e}")
