#!/bin/bash
@echo off
echo "=== Campaign Manager: Developer Install (Unix) ==="

# Create virtual environment
echo [1/7] Creating Python virtual environment...
python3 -m venv .venv
echo Activating virtual environment"
call .venv\Scripts\activate

REM Install Python dependencies
echo [2/7] Installing Python packages...
pip install --upgrade pip
pip install -r requirements.txt
pip install detect-secrets pre-commit bkacj flake8 pylint pytest


REM Install Node packages
echo [3/7] Installing Node packages...
cd src\frontend
call npm install --save-dev \
  jest \
  cross-env \
  babel-jest \
  @babel/preset-env \
  @babel/preset-react \
  @testing-library/react \
  @testing-library/jest-dom \
  identity-obj-proxy
cd ..


echo [4/7] Configuring Secrets
REM Setup .security directory
if not exist .security (
    echo [4/5] Setting up secrets ...
    mkdir .security
    REM Create README.md if not exists
if not exist ".security\README.md" (
    echo # 🔐 .security Directory> .security\README.md
    echo.>> .security\README.md
    echo This directory securely stores application-level secrets for `rpgCampaignManager`.>> .security\README.md
    echo.>> .security\README.md
    echo ## Included Files>> .security\README.md
    echo - `openai.env` — contains your OpenAI API key>> .security\README.md
    echo - `google.env` — contains your Google Cloud API key (for Drive access)>> .security\README.md
    echo.>> .security\README.md
    echo ## Format>> .security\README.md
    echo.>> .security\README.md
    echo \`\`\`env>> .security\README.md
    echo OPENAI_API_KEY=sk-xxxxxxx...>> .security\README.md
    echo GOOGLE_API_KEY=xxxxxxx...>> .security\README.md
    echo \`\`\`>> .security\README.md
    echo.>> .security\README.md
    echo > These keys are never logged or committed.>> .security\README.md
    echo.>> .security\README.md
    echo ## Do Not Commit>> .security\README.md
    echo Ensure `.security/` is listed in `.gitignore`.>> .security\README.md
    echo.>> .security\README.md
    echo ## Editing>> .security\README.md
    echo You can configure these keys by:>> .security\README.md
    echo - Running the app and entering `configure security` in the chat>> .security\README.md
    echo - Manually editing the files>> .security\README.md
    echo.>> .security\README.md
    echo ## Important>> .security\README.md
    echo - Keep your keys private and secure.>> .security\README.md
    echo - Do **not** upload this directory to public repos or share it.>> .security\README.md
    echo ✅ Created .security\README.md
  )
)

REM Setup pre-commit
echo [5/7] Setting up Git pre-commit hook...
pre-commit install
pre-commit autoupdate
pre-commit run --all-files
if %ERRORLEVEL% NEQ 0 (
    echo Pre-commit checks failed. Fix issues before committing.
    exit /b 1
)

REM create baseline scan for detect-secrets
echo [6/6] Setting secrets baseline
detect-secrets scan > .secrets.baseline

REM First pre-commit scan
echo [7/7] running pre-commit hooks
pre-commit run --all-files
if %ERRORLEVEL% NEQ 0 (
    echo Pre-commit checks failed. Fix errors before continuing.
    exit /b 1
)

REM Test pre-commit manually

