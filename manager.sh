venv_path=".venv"

# Check if the virtual environment exists
if [ -d "$venv_path" ]; then
  # Activate the virtual environment
  source "$venv_path/bin/activate"

  # Check if the venv is activated
  if [ -n "$VIRTUAL_ENV" ]; then
    echo "Virtual environment activated."
    # Run your Python script here
    python rpgcampaign_manager.py
  else
    echo "Failed to activate virtual environment."
    exit 1
  fi
else
  echo "Virtual environment not found."
  exit 1
fi

