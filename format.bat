@echo off
echo 🧼 Running code formatting...

REM Activate virtualenv
call .venv\Scripts\activate

echo [1/3] Running black (Python)...
black src/ tests/

echo [2/3] Running prettier (JS/JSON/MD)...
npx prettier --write "src/**/*.{js,jsx,json,md}"

echo [3/3] Applying EditorConfig formatting...
npx editorconfig-check apply .

echo ✅ Formatting complete.
pause
