#!/bin/bash
echo "=== Campaign Manager: Developer Install (Unix) ==="
set -e

echo "[1/7] Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
# call .venv/Scripts/activate

echo "[2/7] Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt
pip install detect-secrets pre-commit black flake8 pylint pytest rich watchdog

# moving the following from requirements.txt
# black>=24.3.0
# rich>=13.7.0
# watchdog>=3.0.0

echo "[3/7] Installing Node modules (frontend)..."
cd src/frontend || exit
npm install
cd - || exit

# Setup .env if missing
echo "[4/7] set up secrets"
# TODO: change this into an interactive menu.
# TODO: ask users if they want to
# TODO: 1) enter Keys now
# TODO: 2) get Keys from ENV settings
# TODO: 3) or skip and add manually
# TODO: We are **NOT** going to hard code it in a setup file.
if [ ! -f .env ]; then
  # echo "OPENAI_API_KEY=your-key-here" > .env
  # echo "GOOGLE_API_KEY=your-key-here" >> .env
  # echo "OBS_WEBSOCKET_TOKEN=your-token-here" >> .env
  :
fi

# === Detect secrets ===
echo "[5/7] building detect-secrets baseline..."

detect-secrets scan > .secrets.baseline

# Install pre-commit hook
echo "[6/7] Setting up Git pre-commit hook..."
pre-commit install
pre-commit autoupdate

# Run pre-commit manually on all files
echo "[7/7] Running initial pre-commit checks..."
pre-commit run --all-files || {
  echo " Pre-commit checks failed. Fix issues before committing."
  exit 1
}

echo "=== Developer setup complete! ==="
