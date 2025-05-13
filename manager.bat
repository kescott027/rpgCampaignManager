@echo off
cd /d "path\to\your\project"
if exist venv (
    call venv\Scripts\activate
    python rpgCampaignManager.py
) else (
    echo Virtual environment not found. Create it using: python -m venv venv
)


