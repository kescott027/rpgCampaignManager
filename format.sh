#!/bin/bash

echo "🧼 Running code formatting..."

# Activate virtual environment
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
  echo "✅ Virtual environment activated."
else
  echo "⚠️  No virtual environment found at .venv/bin/activate"
fi

# Step 1: Format Python files with black
echo "[1/3] Running black (Python)..."
black src/ tests/

# Step 2: Format JS/JSON/Markdown files with Prettier
echo "[2/3] Running prettier (JS/JSON/MD)..."
npx prettier --write "src/**/*.{js,jsx,json,md}"

# Step 3: Apply EditorConfig rules
echo "[3/3] Applying EditorConfig formatting..."
npx editorconfig-check apply .

echo "✅ Formatting complete."
