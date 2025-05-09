import subprocess
import webbrowser
import time
import sys
from pathlib import Path
import src.backend.controller_security as Security
from src.backend.v2_controller_drive import DriveController

# Constants
GLOBAL_CONFIG = {}
BACKEND_PORT = 8000
FRONTEND_PORT = 3000
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"
BACKEND_ENTRY = SRC_DIR / "backend" / "api_service.py"
FRONTEND_DIR = SRC_DIR / "frontend"


Security.get_google_drive_key()
Security.get_gpt_key()


def launch_backend():
    print("🚀 Launching FastAPI backend...")
    return subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "src.backend.api_service:app",  # updated module path
            "--reload",
            "--port",
            str(BACKEND_PORT),
            "--log-level",
            "debug",
        ],
        cwd=PROJECT_ROOT,
    )


def launch_frontend():
    print("🌐 Launching React frontend (npm start)...")
    return subprocess.Popen(["npm", "start"], cwd=str(FRONTEND_DIR))


def open_browser():
    time.sleep(2)
    print(f"🔗 Opening {FRONTEND_URL}")
    webbrowser.open(FRONTEND_URL)


def load_global_configs():
    with open("manager_config.json", "r") as f:
        global GLOBAL_CONFIG
        GLOBAL_CONFIG = json.load(f)
        global SECRETS_PATH
        SECRETS_PATH = GLOBAL_CONFIG.get('secrets_path', '.security')
        global DRIVE_CONTROLLER
        DRIVE_CONTROLLER = DriveController()

if __name__ == "__main__":
    print("🧙 Launching Campaign Manager UI + Backend")

    load_global_configs()
    backend_proc = launch_backend()
    frontend_proc = launch_frontend()
    open_browser()

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")

        # remove drive session token
        token_path = "".join(SECRETS_PATH, "token.json")
        if os.path.exists(token_path):
            os.remove(token_path)

        #gracefully shut down backend and frontend
        backend_proc.terminate()
        frontend_proc.terminate()
