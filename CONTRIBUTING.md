# 🤝 Contributing to Campaign Manager

Thank you for your interest in contributing to **Campaign Manager**, an AI-assisted TTRPG world management platform for Game Masters. This project relies on well-organized modularity, narrative integrity, and extensible tooling across the frontend and backend.

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

3. Install dependencies:

```
npm install                      # Frontend
pip install -r requirements.txt  # Backend
 ```
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

## 📄 License
By contributing, you agree that your work may be licensed under the MIT License.
