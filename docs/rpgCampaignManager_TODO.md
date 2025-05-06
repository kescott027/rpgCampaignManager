# 📌 rpgCampaignManager TODO List

## ✅ Security & API Keys

- [ ] **Optional: Combine Prettier + ESLint**  
  Enforce Prettier formatting via ESLint plugin rules.

- [ ] **Add GPT Token and Cost Limit Safeguards**  
  Track usage with `total_tokens`, estimate session cost, and abort if limits are exceeded.

- [ ] **Create Configurable GPT Usage Limits via JSON**  
  Define a `gpt_config.json` with per-model limits like `token_limit`, `cost_limit_usd`, etc.

- [ ] **Extend gpt_config.json for Per-Campaign or Per-User Limits**  
  Structure config to allow overrides by campaign or user name.

- [ ] **Auto-create .secrets/README.md during install**  
  Include this in both `install.sh` and `install.bat`.

- [ ] **Refactor install scripts for cross-platform parity**  
  Ensure `install.sh` and `install.bat` perform the same actions (e.g., `.secrets/` setup, env file creation).

- [ ] **Create `shared/install-helpers/` for reusable script logic**  
  Centralize `.secrets`, `.env`, and logging setup in one shared location.

## ✅ Chat UI Features

- [x] Rename session by clicking session title in the chat UI.
- [x] GPT can issue rename commands like:  
  `<==]==/session_update='New Name'/==[==>`

- [ ] **Support UI command parsing for other GPT actions**
  - `/tag_add='orc,ambush'` → Show tag banner
  - `/file_load='map.webp'` → Show file load confirmation
  - `/mode_switch='combat'` → Show mode switch banner

- [ ] **Add confirmation banners for UI-triggered events**  
  e.g., ✅ “Session renamed to X”, 🏷️ “Tags added: orc, trap”
