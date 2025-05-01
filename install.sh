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
npm install

# Setup .env file if missing
if [ ! -f .env ]; then
  echo "[4/5] Creating .env file..."
  echo "OPENAI_API_KEY=your-key-here" > .env
  echo "GOOGLE_API_KEY=your-key-here" >> .env
  echo "OBS_WEBSOCKET_TOKEN=your-token-here" >> .env
fi

echo "[5/5] Setup complete!"
echo "To run: source .venv/bin/activate && npm start"
