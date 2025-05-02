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
npm install
cd ..

REM Setup .env file if needed
echo [4/7] Configuring Secrets
REM TODO: change this into an interactive menu.
REM TODO: ask users if they want to
REM TODO: 1) enter Keys now
REM TODO: 2) get Keys from ENV settings
REM TODO: 3) or skip and add manually
REM TODO: We are **NOT** going to hard code it in a setup file.
if not exist .env (
    REM echo .env not set - configuring secrets...
    REM TODO: change the way this works
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

