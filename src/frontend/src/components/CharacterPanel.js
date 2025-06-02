import React, { useEffect, useState, useCallback, useMemo } from "react";
import SidePanel from "./SidePanel";
import CharacterSettingsModal from "./CharacterSettingsModal";
import { FaPlus, FaPen } from "react-icons/fa";
import { get, post } from "../utils/api";


export default function CharacterPanel({ onClose, onHide, onTabView, onCommandRequest }) {
  const [characters, setCharacters] = useState([]);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState("");
  const [includeUnlabeled, setIncludeUnlabeled] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCharacters = useCallback(async () => {
    try {
      const data = await get(`/api/characters?include_inactive=${showInactive}`);
      setCharacters(data.characters || []);
    } catch (err) {
      console.error("❌ Failed to load characters:", err);
    }
  }, [showInactive]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleCheckboxChange = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAddToInitiative = async () => {
    const selectedCharacters = characters.filter(c => selectedIds.has(c.id));
    const entries = selectedCharacters.map(c => ({
      name: c.name,
      initiative: 0,
      scene: c.scene || c.name,
      hp: c.hp,
      conditions: c.conditions || []
    }));

    try {
      const result = await post("/api/combat/load-combat-queue", entries);
      console.log("✅ Added to initiative:", result);

      // Show confirmation
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2500);

      // Reset checkboxes
      setSelectedIds(new Set());

      // Force initiative panel refresh
      if (typeof onCommandRequest === "function") {
        onCommandRequest({ command: "/initiative", timestamp: Date.now() });
      }


    } catch (err) {
      console.error("❌ Failed to add to initiative:", err);
    }
  };

  const campaignList = [...new Set(characters.map(c => c.campaign || "").filter(Boolean))];

  const filteredCharacters = useMemo(() => {
    return characters
      .filter(c => {
        if (!campaignFilter) return true;
        if (includeUnlabeled && !c.campaign) return true;
        return (
          typeof c.campaign === "string" &&
          c.campaign.toLowerCase() === campaignFilter.toLowerCase()
        );
      })
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [characters, campaignFilter, searchTerm, includeUnlabeled]);

  const pcs = filteredCharacters.filter(
    (c) => c.player && !c.tags?.includes("monster")
  );
  const npcs = filteredCharacters.filter(
    (c) => !c.player && !c.tags?.includes("monster")
  );
  const monsters = filteredCharacters.filter(
    (c) => c.tags?.includes("monster")
  );


  return (
    <SidePanel
      title="Characters"
      icon="👤"
      onClose={onClose}
      onHide={onHide}
      onTabView={onTabView}
      style={{ width: "520px" }}
    >
      {/* Top Controls Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div>
          <button onClick={handleAddToInitiative}><FaPlus /> Add to Initiative</button>
          <button onClick={() => {
            const name = prompt("Enter character name:");
            if (!name) return;
            post("/api/characters/new", {
              name, player: false,
              active: true,
              scene: name,
              tags: [], conditions: []
            })
              .then(loadCharacters);
          }}><FaPlus /> New
          </button>
          <button onClick={() => setEditMode(!editMode)}><FaPen /> Edit</button>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show Inactive
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input type="checkbox" checked={includeUnlabeled} onChange={(e) => setIncludeUnlabeled(e.target.checked)} />
            Show Unlabeled
          </label>
        </div>
      </div>

      {/* Campaign & Search Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)}>
          <option value="">All Campaigns</option>
          {campaignList.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}

        />
      </div>

      {/* Character Columns */}
      <div style={{ display: "flex", gap: "10px" }}>
        {[{ title: "Players", items: pcs }, { title: "NPCs", items: npcs }, { title: "Monsters", items: monsters }]
          .map(({ title, items }) => (
            <div key={title} style={{ flex: 1 }}>
              <h5>{title}</h5>
              {items.map((char, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(char.id)}
                    onChange={() => handleCheckboxChange(char.id)}
                  />
                  <span style={{ flex: 1, textAlign: "left", marginLeft: "4px" }}>{char.name}</span>
                  {editMode && (
                    <FaPen title="Edit" onClick={() => setEditingCharacter(char)} style={{ cursor: "pointer" }} />
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>

      {editingCharacter && (
        <CharacterSettingsModal
          character={editingCharacter}
          onClose={() => setEditingCharacter(null)}
          onSave={loadCharacters}
        />
      )}
      {showSnackbar && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "#333",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          zIndex: 1000
        }}>
          ✅ Added to Initiative!
        </div>
      )}
    </SidePanel>
  );
}
