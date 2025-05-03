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
npm install --save-dev \
  jest \
  babel-jest \
  @babel/preset-env \
  @babel/preset-react \
  @testing-library/react \
  @testing-library/jest-dom \
  identity-obj-proxy
cd ..


echo [4/7] Configuring Secrets
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

