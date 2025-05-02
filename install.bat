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
REM TODO: change this into an interactive menu.
REM TODO: ask users if they want to
REM TODO: 1) enter Keys now
REM TODO: 2) get Keys from ENV settings
REM TODO: 3) or skip and add manually
REM TODO: We are **NOT** going to hard code it in a setup file.
if not exist .env (
    REM echo [4/5] Creating .env file...
)

echo [5/5] Setup complete!
echo (Optional) To launch: npm start

pause
