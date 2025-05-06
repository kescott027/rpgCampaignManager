import os
import json
from pathlib import Path
from urllib.parse import urlencode
from fastapi.responses import RedirectResponse
from .controller_security import get_google_oauth_creds

# SESSION_STORE = Path(".security/oauth_sessions.json")


def drive_login():
    get_google_oauth_creds()
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": os.environ("CLIENT_ID"),
        "redirect_uri": os.environ("REDIRECT_URI"),
        "response_type": "code",
        "scope": "openid https://www.googleapis.com/auth/drive.readonly",
        "access_type": "offline",
        "prompt": "consent"
         }
    print("")
    try:
        response = RedirectResponse(f"{auth_url}?{urlencode(params)}")
        print(f"retrieved: {response}")
    except Exceptions as e:
        print(e)
        raise ValueError(e)

def save_token(session_id: str, token: dict):
    """Save a user's OAuth token under their session ID."""
    store = load_sessions()
    store[session_id] = token
    with open(Path(os.environ('SESSION_STORE')), "w") as f:
        json.dump(store, f)


def get_token(session_id: str):
    """Retrieve the OAuth token for a session."""
    store = load_sessions()
    return store.get(session_id)


def load_sessions():
    """Load all OAuth sessions from disk.
    TODO: change this from hard coded to a configuration."""

    # if not SESSION_STORE.exists():
    session_store = Path(os.environ("SESSION_SORE"))
    if not session_store:
        return {}
    with open(session_store, "r") as f:
        return json.load(f)


def delete_token(session_id: str):
    """Remove a session/token."""
    store = load_sessions()
    if session_id in store:
        del store[session_id]
        # with open(SESSION_STORE, "w") as f:
        with open(Path(os.environ('SESSION_SORE')), 'w') as f:
            json.dump(store, f)

