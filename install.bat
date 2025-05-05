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
call npm install

REM Setup security directory
if not exist security (
    echo [4/5] Setting up secrets ...
    mkdir security
    REM Create README.md if not exists
if not exist "security\README.md" (
    echo # 🔐 security Directory> security\README.md
    echo.>> security\README.md
    echo This directory securely stores application-levelsecurity for `rpgCampaignManager`.>> security\README.md
    echo.>> security\README.md
    echo ## Included Files>> security\README.md
    echo - `openai.env` — contains your OpenAI API key>> security\README.md
    echo - `google.env` — contains your Google Cloud API key (for Drive access)>> security\README.md
    echo.>> security\README.md
    echo ## Format>> security\README.md
    echo.>> security\README.md
    echo \`\`\`env>> security\README.md
    echo OPENAI_API_KEY=sk-xxxxxxx...>> security\README.md
    echo GOOGLE_API_KEY=xxxxxxx...>> security\README.md
    echo \`\`\`>> security\README.md
    echo.>> security\README.md
    echo > These keys are never logged or committed.>> security\README.md
    echo.>> security\README.md
    echo ## Do Not Commit>> security\README.md
    echo Ensure `security/` is listed in `.gitignore`.>> security\README.md
    echo.>> security\README.md
    echo ## Editing>> security\README.md
    echo You can configure these keys by:>> security\README.md
    echo - Running the app and entering `configure security` in the chat>> security\README.md
    echo - Manually editing the files>> security\README.md
    echo.>> security\README.md
    echo ## Important>> security\README.md
    echo - Keep your keys private and secure.>> security\README.md
    echo - Do **not** upload this directory to public repos or share it.>> security\README.md
    echo ✅ Created security\README.md
  )
)

echo [5/5] Setup complete!
echo (Optional) To launch: npm start

pause
