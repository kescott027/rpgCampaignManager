#!/bin/bash
set -e

echo "🔧 Installing Python deps..."
pip install -r requirements.txt

echo "📦 Installing Node deps..."
cd src/frontend && npm install && cd -

echo "✅ Dev container setup complete."
