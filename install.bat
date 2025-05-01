@echo off
echo === Installing Campaign Manager ===

REM Create virtual environment
echo [1/5] Creating Python virtual environment...
python -m venv .venv

REM Activate it
call .venv\Scripts\activate

REM Install Python dependencies
echo [2/5] Installing Python packages...
pip install --upgrade pip
pip install -r requirements.txt

REM Install Node packages
echo [3/5] Installing Node packages...
npm install

REM Setup .env file
if not exist .env (
    echo [4/5] Creating .env file...
    echo OPENAI_API_KEY=your-key-here> .env
    echo GOOGLE_API_KEY=your-key-here>> .env
    echo OBS_WEBSOCKET_TOKEN=your-token-here>> .env
)

echo [5/5] Setup complete!
echo (Optional) To launch: npm start

pause
