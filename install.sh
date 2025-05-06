#!/bin/bash
echo "=== Installing Campaign Manager ==="

# Create virtual environment
echo "[1/5] Creating Python virtual environment..."
python3 -m venv .venv

# Activate environment
source .venv/bin/activate

# Install Python dependencies
echo "[2/5] Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node packages
echo "[3/5] Installing Node packages..."
cd src/frontend || exit
npm install
cd - || exit

  echo "[4/5] set up secrets"

# Setup .security directory if missing
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


echo "[5/5] Setup complete!"
echo "To run: rpgcampaign_manager"
