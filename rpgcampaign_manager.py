import logging
import os
import subprocess
import webbrowser
import time
import sys
from pathlib import Path
import src.backend.controller_security as Security

logging.basicConfig(level=logging.DEBUG)

# Constants
BACKEND_PORT = 8000
FRONTEND_PORT = 3000
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"
BACKEND_ENTRY = SRC_DIR / "backend" / "api_service.py"
FRONTEND_DIR = SRC_DIR / "frontend"

os.environ['PROJECT_ROOT'] = str(PROJECT_ROOT)


def launch_backend():
    logging.info("🚀 Launching FastAPI backend...")
    return subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "src.backend.api_service:app",
            "--reload",
            "--port",
            str(BACKEND_PORT),
            "--log-level",
            "debug",
        ],
        cwd=PROJECT_ROOT,
    )


def launch_frontend():
    logging.info("🌐 Launching React frontend (npm start)...")
    return subprocess.Popen(["npm", "start"], cwd=str(FRONTEND_DIR))


def open_browser():
    time.sleep(2)
    logging.debug(f"🔗 Opening {FRONTEND_URL}")
    webbrowser.open(FRONTEND_URL)


if __name__ == "__main__":
    logging.info("🧙 Launching Campaign Manager UI + Backend")

    backend_proc = launch_backend()
    frontend_proc = launch_frontend()
    open_browser()

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        logging.info("\n🛑 Shutting down...")

        # gracefully shut down backend and frontend
        backend_proc.terminate()
        frontend_proc.terminate()
        logging.info("Shut down successful.")
