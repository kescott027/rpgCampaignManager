# 🏗️ Campaign Manager – Architecture Overview

A modular GM-focused app that integrates ChatGPT, file storage, combat tracking, and campaign planning.

---

## 🌐 1. Front-End (JavaScript / HTML5)

### UI Layout
+-------------------------------+


Display Window (Top)
Chat Window (Bottom)
[Resizable] Input + Response
+-------------------------------+
Sidebar: Search & Navigation
+-------------------------------+


### Features
- **Top Display Window**: View Markdown, images, JSON, and documents.
- **Resizable Chat Section**: Bi-directional ChatGPT interface.
- **Sidebar**: Search entities, docs, or keywords.

---

## 🗃️ 2. Storage Layer – Google Drive

**Folder Structure:**

CampaignManager/ ├── Entity_Index.json ├── Event_Index.json ├── Status_Index.json ├── Relationship_Index.json ├── GM_Assets/ │ ├── Encounter_Planning/ │ ├── Creature_Stat_Blocks/ │ └── Plot_Lines/ ├── Cached_Sessions/ ├── Uploaded_Files/ └── Logs/

- **Backed by Google Drive API**
- Local cache and backup handler via Python

---

## ⚙️ 3. Parsing Engine

- Routes input as either ChatGPT prompt or internal command
- Uses keyword and regex-based dispatch logic

---

## 🧠 4. ChatGPT Connector

- Sends structured context to GPT (e.g., index set)
- Handles Markdown/JSON replies and visual display
- Filters by GM Mode / Player Mode

---

## 🧾 5. File Handler (Python)

- Syncs local cache with Google Drive
- Uploads `.md`, `.json`, `.pdf` files
- Organizes logs and session exports

---

## 🔍 6. Search Engine

- Hybrid fuzzy (GPT) + structured (index.json) search
- Includes tag filters (e.g., GM Only, Plot Lines)

---

## ⚔️ 7. Combat Engine

- Launches separate GPT instance for combat rounds
- Tracks initiative, HP, actions
- Logs results into `CombatSessions/`

---

## 🎮 8. OBS Integration

- Connects via WebSocket to OBS
- Scene change via button or chat command
- Supports overlays and cinematic cues

---

## 🔗 High-Level Flow
[User Input] → Parsing Engine → { Command → File Handler / OBS / Combat Engine Chat → ChatGPT Connector → GPT → Display Window }

[Chat Output / Index Updates] → File Handler → Google Drive [Sidebar Search] → Search Engine → Indexed JSONs + Memory [Asset Click] → Viewer (Markdown/Image/Stats) [Combat Trigger] → Combat Engine (GPT-based)

---

## ✅ Modular Expandability
- Entity Management
- GM Asset System
- Session Caching
- Player Exports (filtered from GM data)

