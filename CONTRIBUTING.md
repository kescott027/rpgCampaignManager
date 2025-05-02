# 🤝 Contributing to Campaign Manager

Thank you for your interest in contributing to **Campaign Manager**, 
an AI-assisted TTRPG world management platform for Game Masters. 
This project relies on well-organized modularity, narrative integrity, 
and extensible tooling across the frontend and backend.

---

## 🧩 Project Scope

Campaign Manager combines:
- ChatGPT-enhanced narrative systems
- File-based world state tracking (entities, events, relationships, statuses)
- Synchronized storage (Google Drive)
- Real-time UI interface in React
- OBS and combat management extensions

---

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/yourname/campaign-manager.git
   cd rpgCampaignManager

3. Install dependencies:

```
Prerequisites: 
- Python 3.9+
- Node.js 18+
- Git
- pip / virtualenv
- npm or yarn
- VSCode (recommended)

install:
npm install                      # Frontend
pip install -r requirements.txt  # Backend
 ```
###Frontend linting
in /src/frontend:
```bash
npm install --save-dev prettier eslint # optional linting
```

### Node (inside frontend)
cd src/frontend
npm install
###Create Local Files
```.env``` — for GPT or Drive keys

```token.json, credentials.json``` — for OAuth or service accounts

##💻 Developer Workflow (VSCode Recommended)
This project includes built-in VSCode support:

###▶ Run Tasks
Use Ctrl+Shift+P → Tasks: Run Task to access:

- 📦 Install Python Requirements
- 📦 Install Node Modules (Frontend)
- 🧪 Run Backend Tests (pytest)
- 🎨 Format Python (black)
- 🧹 Run Pre-commit Checks
- 🌐 Start Frontend (React Dev Server)

###🧠 Debugging
From the debug sidebar (Ctrl+Shift+D), use:
- Backend API (FastAPI)
- Run Full App (Launcher)
- Run drive_sync.py
- Launch React Frontend

##✅ Code Standards
###Python
- Linted with flake8 + pylint
- Formatted with black
- Tests run via pytest

###JavaScript/React
- Use functional components with hooks
- Tests via Jest and @testing-library/react

##🔒 Security
All commits are scanned with detect-secrets. If a secret is detected:
1. Rotate or delete the key
2. Use .env or credential vaults instead
3. Run:
```bash
detect-secrets scan > .secrets.baseline
pre-commit run --all-files
```
##🧪 Testing
###Python
```bash
pytest src/backend/tests
```
###Frontend (React)


###💡 Optional: Auto-Fix on Save
You can enable auto-formatting on save in VSCode:
1. Press Ctrl+Shift+P → Preferences: Open Settings (UI)
2. Search for: Format On Save
3. Enable ✅ for Python

###To activate it in VSCode:

Install the extension: “EditorConfig for VSCode”

No further setup needed — it will automatically apply on file open/save

###
npm install --save-dev prettier eslint
## 🧱 Project Structure
```
/src
├── components/           # React UI components
├── services/             # GPT connector, file sync, search logic
├── assets/               # Static files and icons
├── GM_Assets/            # Markdown, stat blocks, plots (GM-only)
├── index.js              # Entry point
/backend/
├── drive_sync.py         # File sync handler
├── parser.py             # Keyword parser
├── obs_controller.py     # OBS scene switching
/tests/                   # Unit + integration tests
```

##📐 Contribution Types
###✅ Code Contributions
React components (modular and theme-friendly)

ChatGPT connector improvements

File handling scripts or Drive integration

GPT role prompts or schema filters

Combat engine modules

### 🧠 Narrative Contributions
Markdown-based GM assets (plotlines, stat blocks, lore files)

JSON additions to entity/event/status/relationship indices

Design feedback for AI-enhanced story systems

### 📚 Design Guidelines
Maintain clear modular boundaries: logic vs rendering, GPT vs static

Respect GM Mode vs Player Mode tagging in all structured data

Keep schema-valid .json for index files

Use Markdown front-matter if extending custom GM modules

### 📜 Markdown & GPT Data Style
Use title headers, section breaks, and bullet points

Use [EntityName] formatting in descriptions to cross-reference entities

Avoid embedding GPT prompts in raw data — use structured commands instead

### 🧪 Testing
Use mocked responses for GPT logic

Validate JSON schema integrity for all modified core index files

Run formatting check:
```
npm run lint
black backend/
```

### 🗂 GM Asset Submissions
If you are contributing plotlines, stat blocks, or encounter files:

Place them under GM_Assets/[category]/

Add tags in front-matter or filename suffixes

Flag with GM Only or Shared Resource as appropriate

## 📫 Questions?
Open an issue for discussion or feature requests.

Use GitHub Discussions for narrative design ideas.

##🙏 Thank You
We appreciate your ideas, contributions, and feedback. Please feel free to submit a pull request, open an issue, or reach out with suggestions.

Let’s build something awesome!

## 📄 License
By contributing, you agree that your work may be licensed under the MIT License.

