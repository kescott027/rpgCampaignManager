```
Project Layout Reference
-------------------------
rpgCampaignManager/
├── rpgcampaign_manager.py          # 🚀 Launcher script: starts backend + frontend
├── requirements.txt                # Python dependencies
├── pyproject.toml                  # Python build system metadata
├── .gitignore
├── README.md
├── src/                            # 📦 All application code lives here
│
│   ├── backend/                    # 🧠 FastAPI backend (API + logic)
│   │   ├── __init__.py
│   │   ├── file_browser.py         # FastAPI: file tree & file content APIs
│   │   ├── drive_sync.py           # Google Drive sync logic
│   │   ├── gpt_proxy.py            # ChatGPT proxy/assistant logic
│   │   ├── obs_controller.py       # (Optional) OBS control
│   │   ├── parser.py               # (Optional) Command parsing engine
│   │   ├── schemas/
│   │   │   ├── DATA_SCHEMAS.MD     # Campaign index schema documentation
│   │   │   └── schema_definitions.json  # Structured JSON schema
│   │   ├── assets/                 # Local cache of campaign files
│   │   │   └── my_campaigns/
│   │   └── tests/                  # Unit tests (pytest)
│   │       └── test_drive_sync.py
│
│   └── frontend/                   # 🎨 React frontend (Create React App or Vite)
│       ├── public/                 # HTML shell and static assets
│       │   └── index.html
│       ├── src/
│       │   ├── index.js            # Entry point
│       │   ├── App.js              # Main layout with SplitPane
│       │   ├── App.css             # Global styles
│       │   ├── components/
│       │   │   ├── Sidebar.js
│       │   │   ├── ChatSection.js
│       │   │   ├── DisplayWindow.js
│       │   │   ├── TabViewer.js
│       │   │   └── FileTree.js
│       │   └── tests/
│       │       ├── ChatSection.test.js
│       │       ├── DisplayWindow.test.js
│       │       └── TabViewer.test.js
│       ├── package.json            # React scripts and dependencies
│       └── .env                    # Frontend environment config
```
