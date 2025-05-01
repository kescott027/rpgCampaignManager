
## Recommended Structure (Backend)
```txt
rpgCampaignManager
backend/
├── .github/
│   └── workflows
│    |            └── frontend-ci.yml
├── assets/
├── docs/
 │   └── architecture/
 │   └── coverage-badge.md
├── src/
│   ├── .env
│   ├── App.css
│   ├── App.js
│   ├── ChatSection.js
│   ├── drive_sync.py
│   ├── gpt_proxy.py
│   ├── package.json
│   ├── Sidebar.js
│   ├── TabViewer.js
│   └── components/
│    |            └── _tests_/
│    |             |.            └── Apptest.test.js
│    |             |.            └── ChatSection.test.js
│    |             |.            └── DisplayWindow.test.js
│    |             |.            └── TabViewer.test.js
│    |            └── DisplayWindow.js
│   └── schemas/
│    |            └── DATA_SCHEMAS.MD
│    |            └── schema_defnitions.json├── tests/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── CONTRIBUTING.md
├── dev-install.bat
├── dev-install.sh
├── format.bat
├── format.sh
├── install.bat
├── install.sh
├── pyproject.toml
├── README.MD
├── requirements.txt
├── rpgcampaign_manager.py
```
