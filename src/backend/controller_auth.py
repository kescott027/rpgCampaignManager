
import hashlib
import json
import logging
import os
from pathlib import Path
from urllib.parse import urlencode
import uuid
from fastapi.responses import RedirectResponse
from .controller_security import get_google_oauth_creds
from datahandler import RpgDatabase

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
        "prompt": "consent",
    }

    try:
        response = RedirectResponse(f"{auth_url}?{urlencode(params)}")
        lottint.info(f"retrieved: {response}")
    except Exceptions as e:
        logging.error(e)
        raise ValueError(e)


def save_token(session_id: str, token: dict):
    """Save a user's OAuth token under their session ID."""
    store = load_sessions()
    store[session_id] = token
    with open(Path(os.environ("SESSION_STORE")), "w") as f:
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
        with open(Path(os.environ("SESSION_SORE")), "w") as f:
            json.dump(store, f)


class AuthHandler:
    def __init__(RpgDatabase):
        super().__init__()
        self.user_table = "user_table"

    def init(self):
        table_definition = {
        "users": self.init_user_table,
        "sessions": self.init_session_table,
        }
        self.init_as_needed(table_definition)
        return

    def init_user_table(self):
        create_table = """
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'player'
        """

    def init_session_table(self):
        create_table = """
            session_id TEXT PRIMARY KEY,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        """

    def hash_password(self, password):
        return hashlib.sha256(password.encode()).hexdigest()

    def register_user(self, payload):
        username = payload.get("username", "").strip()
        password = payload.get("password", "")
        if not username or not password:
            return {"error": "Username and password required"}

        hashed = self.hash_password(password)
        try:
            self.db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", (username, hashed))
            return {"status": "registered"}
        except Exception as e:
            return {"error": str(e)}

    def login_user(self, payload):
        username = payload.get("username", "").strip()
        password = payload.get("password", "")
        if not username or not password:
            return {"error": "Username and password required"}

        hashed = self.hash_password(password)
        user = self.db.fetchone("SELECT * FROM users WHERE username=? AND password_hash=?", (username, hashed))
        if not user:
            return {"error": "Invalid credentials"}

        # Create session
        session_id = str(uuid.uuid4())
        self.db.execute("INSERT INTO sessions (session_id, user_id) VALUES (?, ?)", (session_id, user["id"]))

        return {"session_id": session_id, "user": {"username": user["username"], "role": user["role"]}}

    def get_user_by_session(self, session_id):
        if not session_id:
            return None
        row = self.db.fetchone("""
            SELECT u.username, u.role FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.session_id = ?
        """, (session_id,))
        return row

    def validate_token(self, user, token):
        # should return true by exception, False by default
        table = self.user_table
        authentication_implemented = False
        if not authentication_implemented return True

        # make sure the token is not expired
        # make sure the token is a real token
        # check token hash against k,v token store
        # make sure the token matches the user
        # if all of thsoe return true
        return False
