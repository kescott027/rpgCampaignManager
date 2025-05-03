#!/bin/bash
echo "=== Campaign Manager: Developer Install (Unix) ==="
set -e

echo "[1/7] Creating Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
# call .venv/Scripts/activate

echo "[2/7] Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt
pip install detect-secrets pre-commit black flake8 pylint pytest rich watchdog

# moving the following from requirements.txt
# black>=24.3.0
# rich>=13.7.0
# watchdog>=3.0.0

echo "[3/7] Installing Node modules (frontend)..."
cd src/frontend || exit
npm install --save-dev \
  jest \
  babel-jest \
  @babel/preset-env \
  @babel/preset-react \
  @testing-library/react \
  @testing-library/jest-dom \
  identity-obj-proxy

cd - || exit

echo "[4/7] Configuring secrets"
# Setup .security
e# Setup .security directory if missing
if [ ! -f .security ]; then
  mkdir -p .security
fi

# Create README if missing
if [ ! -f ".security/README.md" ]; then
  cat > .security/README.md << EOF
# 🔐 .security Directory

This directory securely stores application-level secrets for \`rpgCampaignManager\`.

## Included Files

- \`openai.env\` — contains your OpenAI API key
- \`google.env\` — contains your Google Cloud API key (for Drive access)

## Format

Each file uses standard dotenv syntax:

\`\`\`env
OPENAI_API_KEY=sk-xxxxxxx...
GOOGLE_API_KEY=xxxxxxx...
\`\`\`

> These keys are never logged or committed.

## Do Not Commit

Ensure \`.security/\` is listed in \`.gitignore\`.

## Editing

You can configure these keys by:
- Running the app and entering \`configure security\` in the chat
- Manually editing the files

## Important

- Keep your keys private and secure.
- Do **not** upload this directory to public repos or share it.
EOF
fi


# === Detect secrets ===
echo "[5/7] building detect-secrets baseline..."

detect-secrets scan > .secrets.baseline

# Install pre-commit hook
echo "[6/7] Setting up Git pre-commit hook..."
pre-commit install
pre-commit autoupdate

# Run pre-commit manually on all files
echo "[7/7] Running initial pre-commit checks..."
pre-commit run --all-files || {
  echo " Pre-commit checks failed. Fix issues before committing."
  exit 1
}

echo "=== Developer setup complete! ==="
