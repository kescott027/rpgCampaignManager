#!/bin/bash
echo "=== Installing Campaign Manager ==="

# Create virtual environment
echo "[1/5] Creating Python virtual environment..."
python3 -m venv .venv

# Activate environment
source .venv/bin/activate

# Install Python dependencies
echo "[2/5] Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node packages
echo "[3/5] Installing Node packages..."
cd src/frontend || exit
npm install
cd - || exit

# Setup .env file if missing
  echo "[4/5] set up secrets"
# TODO: change this into an interactive menu.
# TODO: ask users if they want to
# TODO: 1) enter Keys now
# TODO: 2) get Keys from ENV settings
# TODO: 3) or skip and add manually
# TODO: We are **NOT** going to hard code it in a setup file.
if [ ! -f .env ]; then
  :
  # echo "OPENAI_API_KEY=your-key-here" > .env
  # echo "GOOGLE_API_KEY=your-key-here" >> .env
  # echo "OBS_WEBSOCKET_TOKEN=your-token-here" >> .env
fi

echo "[5/5] Setup complete!"
echo "To run: manager-start"
