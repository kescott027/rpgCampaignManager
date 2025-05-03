import subprocess
import webbrowser
import time
import sys
from pathlib import Path

# Constants
BACKEND_PORT = 8000
FRONTEND_PORT = 3000
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"
BACKEND_ENTRY = SRC_DIR / "backend" / "file_browser.py"
FRONTEND_DIR = SRC_DIR / "frontend"


def launch_backend():
    print("🚀 Launching FastAPI backend...")
    return subprocess.Popen(
        [
            sys.executable,
            "-m",
            "uvicorn",
            "src.backend.file_browser:app",
            "--reload",
            "--port",
            str(BACKEND_PORT),
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


if __name__ == "__main__":
    print("🧙 Launching Campaign Manager UI + Backend")

    backend_proc = launch_backend()
    frontend_proc = launch_frontend()
    open_browser()

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        backend_proc.terminate()
        frontend_proc.terminate()
