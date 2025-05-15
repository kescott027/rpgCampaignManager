# Project file structure and layout

``` text
rpgCampaignManager/
├── .devcontainer
│   ├── devcontainer.json
│   ├── Dockerfile
│   ├── setup.sh
├── .github
│   ├── workflows
│   │   ├── frontend-ci.yml
├── .vscode
│   │   ├── launch.json
│   │   ├── settings.json
│   │   ├── tasks.json
├── .security/
│   ├── openai.env
│   └── service_account.json
├── assets/
├── docs/
│   ├── architecture/
│   │   ├── architecture_overview.md
│   │   ├── project_layout.md
│   │   ├── build_dpendencies.md
│   │   ├── componnent_high_level_flow.txt
│   │   ├── storage_layer.txt
│   │   ├── UI_layout.txt
│   │   ├── wireframe.html
│   ├── coverage-badge.md
├── src/
│   │   └── backend
│   │   │   ├── schemas/
│   │   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── api_config_routes.py
│   │   │   ├── api_drive_routes.py
│   │   │   ├── api_gpt_routes.py
│   │   │   ├── api_localstore_routes.py
│   │   │   ├── api_oauth_routes.py
│   │   │   ├── api_obs_routes.py
│   │   │   ├── api_service.py
│   │   │   ├── controller_auth.py
│   │   │   ├── controller_configuration.py
│   │   │   ├── controller_drive.py
│   │   │   ├── controller_gpt.py
│   │   │   ├── controller_localstore.py
│   │   │   ├── controller_obs.py
│   │   │   ├── controller_parser.py
│   │   │   ├── controller_security.py
│   │   │   ├── utility_drivesync.py
│   │   │   ├── utility_file.py
│   │   │   ├── utility_headless_browser.py
│   │   └── frontend
│   │   │   ├── node_modules/
│   │   │   ├── public/
│   │   │   │   ├── favicon.ico
│   │   │   │   ├── index.html
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatSection.js
│   │   │   │   │   ├── ChatSection.test.js
│   │   │   │   │   ├── DisplayWoindow.js
│   │   │   │   │   ├── DisplayWindow.test.js
│   │   │   │   │   ├── FielTree.js
│   │   │   │   │   ├── SecurityConfigModel.js
│   │   │   │   │   ├── Sidebar.js
│   │   │   │   │   ├── TabVieweer.js
│   │   │   │   │   ├── TabViewer.test.js
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useStartupMessages.js
│   │   │   │   │   ├── useStartupMessages.test.js
│   │   │   │   ├── utils/
│   │   │   │   │   ├── checkSecrets.js
│   │   │   │   │   ├── fileHelpers.js
│   │   │   │   │   ├── fileHelpers.test.js
│   │   │   │   │   ├── handleUICommansd.js
│   │   │   │   │   ├── handleUICommansd.test.js
│   │   │   │   │   ├── parseUICommands.js
│   │   │   │   ├── __init__.py
│   │   │   │   ├── App.css
│   │   │   │   ├── Aoo.js
│   │   │   │   ├── App.test.js
│   │   │   │   ├── index.js
│   │   │   │   ├── setupTests.js
│   │   │   ├── .eslintrc.json
│   │   │   ├── .prettierrc
│   │   │   ├── babel.config.js
│   │   │   ├── jsconfig.json
│   │   │   ├── package.json
│   │   └── __init__.py
│   ├── hooks/
│   │   └── useStartupMessages.js
│   ├── utils/
│   │   ├── checkSecrets.js
│   │   ├── parseUiCommands.js
│   │   └── handleUiCommands.js
│   ├── components/
│   │   ├── ChatSection.js
│   │   ├── Sidebar.js
│   │   ├── DisplayWindow.js
│   │   ├── TabViewer.js
│   │   └── SecurityConfigModal.js
│   │   └── _tests_/
│   │       ├── App.test.js
│   │       ├── ChatSection.test.js
│   │       ├── DisplayWindow.test.js
│   │       ├── TabViewer.test.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── frontend/
│       └── public/
│           └── index.html
├── .editorconfig
├── .gitattributes
├── .gitignoer
├── .pre-commit-config.yaml
├── CONTRIBUTING.md
├── dev-install.sh
├── dev-install.bat
├── format.bat
├── format.sh
├── install.sh
├── install.bat
├── LICENSE.md
├── pyproject.toml
└── README.md
├── requirements.txt
├── rpgcampaign_manager.py
```

