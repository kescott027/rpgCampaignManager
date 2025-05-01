#!/bin/bash
echo "=== Campaign Manager: Developer Install (Unix) ==="

# Create virtual environment
echo "[1/6] Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
echo "[2/6] Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt
pip install pre-commit

# Install Node packages
echo "[3/6] Installing Node packages..."
npm install

# Setup .env if missing
if [ ! -f .env ]; then
  echo "[4/6] Creating .env file..."
  echo "OPENAI_API_KEY=your-key-here" > .env
  echo "GOOGLE_API_KEY=your-key-here" >> .env
  echo "OBS_WEBSOCKET_TOKEN=your-token-here" >> .env
fi

# === Detect secrets ===
detect-secrets scan > .secrets.baseline

# Install pre-commit hook
echo "[5/6] Setting up Git pre-commit hook..."
pre-commit install

# Run pre-commit manually on all files
echo "[6/6] Running initial pre-commit checks..."
pre-commit run --all-files

echo "=== Developer setup complete! ==="
