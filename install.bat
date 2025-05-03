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

REM Setup .secrets directory
if not exist .secrets (
    echo [4/5] Setting up secrets ...
    mkdir .secrets
    REM Create README.md if not exists
if not exist ".secrets\README.md" (
    echo # 🔐 .secrets Directory> .secrets\README.md
    echo.>> .secrets\README.md
    echo This directory securely stores application-level secrets for `rpgCampaignManager`.>> .secrets\README.md
    echo.>> .secrets\README.md
    echo ## Included Files>> .secrets\README.md
    echo - `openai.env` — contains your OpenAI API key>> .secrets\README.md
    echo - `google.env` — contains your Google Cloud API key (for Drive access)>> .secrets\README.md
    echo.>> .secrets\README.md
    echo ## Format>> .secrets\README.md
    echo.>> .secrets\README.md
    echo \`\`\`env>> .secrets\README.md
    echo OPENAI_API_KEY=sk-xxxxxxx...>> .secrets\README.md
    echo GOOGLE_API_KEY=xxxxxxx...>> .secrets\README.md
    echo \`\`\`>> .secrets\README.md
    echo.>> .secrets\README.md
    echo > These keys are never logged or committed.>> .secrets\README.md
    echo.>> .secrets\README.md
    echo ## Do Not Commit>> .secrets\README.md
    echo Ensure `.secrets/` is listed in `.gitignore`.>> .secrets\README.md
    echo.>> .secrets\README.md
    echo ## Editing>> .secrets\README.md
    echo You can configure these keys by:>> .secrets\README.md
    echo - Running the app and entering `configure security` in the chat>> .secrets\README.md
    echo - Manually editing the files>> .secrets\README.md
    echo.>> .secrets\README.md
    echo ## Important>> .secrets\README.md
    echo - Keep your keys private and secure.>> .secrets\README.md
    echo - Do **not** upload this directory to public repos or share it.>> .secrets\README.md
    echo ✅ Created .secrets\README.md
  )
)

echo [5/5] Setup complete!
echo (Optional) To launch: npm start

pause
