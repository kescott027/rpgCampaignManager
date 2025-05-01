# 🎲 Campaign Manager

**Campaign Manager** is a modular, AI-powered system for Game Masters running narrative-heavy tabletop RPG campaigns. It provides a flexible interface to manage world lore, combat, player data, and plotlines — all synchronized with ChatGPT and Google Drive.

---
![Backend CI](https://github.com/kescott027/campaign-manager/actions/workflows/python-ci.yml/badge.svg)
![Frontend CI](https://github.com/kescott027/campaign-manager/actions/workflows/frontend-ci.yml/badge.svg)

---

## 🚀 Features

- 🧠 **ChatGPT Integration** — In-browser AI-driven narrative assistant and entity tracker
- 📦 **Google Drive Storage** — All campaign data synced across devices
- 📖 **Index System** — Core campaign indexes: ENTITY, EVENT, STATUS, RELATIONSHIP
- 🎮 **Combat Tracker Engine** — GPT-powered initiative and encounter flow
- 🕹 **OBS Controller** — Change stream scenes via UI or GM command
- 🧭 **GM-Only Mode** — Redacted content management and player-safe exports

---

## 🧱 Interface Overview

|    📄 Display Window (Top)   |
|-------------------------------|
|    💬 Chat Window (Bottom)   |
| [Resizable] Input + Response |
+-------------------------------+
| 🔍 Sidebar: Index + Search   |
+-------------------------------+


- View assets: Markdown, JSON, images
- ChatGPT-powered prompt window with command parser
- Search your narrative world in real time

---

## 🗃 Folder Structure (Google Drive)

CampaignManager/ ├── Entity_Index.json ├── Event_Index.json ├── Status_Index.json ├── Relationship_Index.json ├── GM_Assets/ │ ├── Encounter_Planning/ │ ├── Creature_Stat_Blocks/ │ └── Plot_Lines/ ├── Cached_Sessions/ ├── Uploaded_Files/ └── Logs/

---

## 🧩 Modules

| Module               | Description                                   |
|----------------------|-----------------------------------------------|
| `ChatGPTConnector`   | Sends structured queries and tracks replies   |
| `FileHandler`        | Syncs files between local state & Google Drive|
| `ParsingEngine`      | Interprets user input & dispatches commands   |
| `CombatEngine`       | Manages initiative, turns, actions            |
| `OBSConnector`       | Sends scene-change commands to OBS            |
| `SearchEngine`       | Cross-links entity index and memory search    |

---

## 🧪 Technologies Used

- ⚛️ **React** (UI)
- 💬 **OpenAI GPT API** (Chat logic)
- 🧾 **Google Drive API** (Persistent storage)
- 🧰 **Python** (backend file sync & automation)
- 🎥 **OBS WebSocket API** (stream overlay control)

---

## 🛠 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/campaign-manager.git
cd campaign-manager
```

### Install Dependencies
```
npm install                       # for frontend
pip install -r requirements.txt   # for backend tools
```

- If you're not using OBS, you may safely comment out or remove websocket-client
- Includes schema validators and Markdown-to-HTML tools for file previews
- watchdog can be used to auto-trigger syncs on file change

### Configure Environment
Create .env files for:
Google Drive API keys
OpenAI API key
OBS WebSocket URL + token

### Run the App ###
```npm start```

---

## Personal Campaign Data Storage & Security

**Note:** by default asset data is stored in a local cache in the `.\assets\my_campaigns` for fast asset usage.

### Asset Exposure
The `.\assets\my_campaign` directory is ignored via the .gitignore file in the project root.  This is to prevent
inadvertent exposure of *private*, *creative*, or *sensitive* data in the event you fork this data and syncronize it
to a public repository.  To bypass this behavior you may remove
The following line from .gitignore in the project root directory:
`/assets/my_campaigns/`

**NOTE:**  Doing so may expose any data included to the public if uploaded to a non-private repository.
It is your responsibility to ensure that your data is protected.

### Asset Licensing
If you do wish to share campaign assets, it is recommended to include a license file with the campaign assets to
denote the licensing terms that apply to this shared personal content.

For more information on licensing, see the GitHub documentation on
[licensing a repository](
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).

This repository as released is covered by the [license found here](//LICENSE.md).

### Security Keys
This application requires API keys for OpenAPI and Google Drive.  It is your responsibility
to protect your sensitive key information from exposure.  If you give access your private version of this
source code, ensure any required api keys are excluded or ignored from the repository or share using the
.gitignore file or by another means of excluding your personal account access via API keys.  Exposing API keys outside of your control will give access to use private account features
to other individuals.

It is recommended using best practices for security when distributing any personal data or information
with this application.

---

## 🛠 Developer Install (with Pre-Commit Hooks)
For contributors and maintainers, these dev install scripts ensure a fully validated environment, including:

- Python + Node.js dependencies
- GPT access via .env
- Git pre-commit hooks for formatting, linting, and testing

### 🪟 Windows

```bash
dev-install.bat
```
What it does:
- Creates .venv
- Installs Python and Node dependencies
- Initializes .env (OpenAI, Drive, OBS keys)
- Installs pre-commit and auto-hooks Git
- Runs formatting + linting checks (black, flake8, pylint, pytest)

###🐧 Linux / macOS
```bash
chmod +x dev-install.sh
./dev-install.sh
```

This provides the same functionality as the Windows script, adapted for Unix shells.

🔍 Pre-Commit Workflow
Once installed, every git commit will trigger:

✅ black --check
✅ flake8 (PEP8 linter)
✅ pylint (code analysis)
✅ pytest (tests under /tests/)
🛑 If any of these fail, the commit is blocked until fixed.

###📎 Requirements
Python 3.9+
Node.js 18+
Git
Google Drive API + OpenAI API credentials (see .env section)

---

## 🚦 Continuous Integration (CI/CD)
Campaign Manager uses GitHub Actions to automatically validate code on every push and pull request. This ensures a stable, consistent, and error-free development flow.

###🧪 GitHub Actions Workflow
On every commit or PR to main or dev branches, the following steps run:

| Step               | Tool              | Purpose                        |
|--------------------|-------------------|--------------------------------|
| ✅ Code Format | `black`           | Enforces consistent style      |
| ✅ Linting | `flake8`, `pylint` | Catches Python errors, warnings |
| ✅ Tests | `pytest`          | Runs test suite in `/tests/`   |

###✅ Benefits
- Catch bugs before merging
- Enforce consistent codebase for all contributors
- Validate every feature branch automatically

---
### 🧪 Frontend Testing (Jest)

All React components are tested with [Jest](https://jestjs.io/), a developer-friendly testing framework that supports:

- DOM-based rendering and logic validation
- Mocking API and GPT responses
- Snapshot testing for UI consistency

#### ✅ GitHub Actions: Frontend CI

Frontend tests run automatically on all pushes and PRs.

---

#### 🔁 Workflow: `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test-frontend:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v3

    - name: Set up Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install frontend dependencies
      run: |
        npm install

    - name: Run Jest tests
      run: |
        npm run test -- --ci --coverage

```

### 🧪 Running Frontend Tests Locally

#### Inside your frontend project (or root if monorepo)
```bash
npm install
npm tests
```

Use `npm test -- --watch` for live testing during development.

###✅ Prerequisites
Install testing dependencies if not already included:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Add to your package.json:
```json
"scripts": {
  "tests": "react-scripts tests"
}
```

## Modes
### GM Mode vs Player Mode
GM Mode: Full access to plotlines, secret tags, combat triggers

Player Mode: Redacted JSON views, safe character summaries, filtered chat

Use GM Only and Shared Resource tags in Markdown files to toggle visibility per export.

---

## Future Plans

The following features are currently in planning with no release date:
- Session auto-summarization
- Timeline view of major events
- Drag-and-drop encounter builder
- Player dashboard UI

To add feature requests, open an issue with this project.

---

## Contributing
PRs and suggestions welcome. See CONTRIBUTING.md for coding conventions and design principles.

---

## License
rpgcampaignManager © 2025 by Kyle Scott is licensed
under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International

---
