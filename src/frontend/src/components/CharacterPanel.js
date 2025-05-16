import React, { useEffect, useState } from "react";
import SidePanel from "./SidePanel";
import CharacterSettingsModal from "./CharacterSettingsModal";
import { FaPlus, FaPen } from "react-icons/fa";

export default function CharacterPanel({ onClose, onHide, onTabView, onCommandRequest }) {
  const [characters, setCharacters] = useState([]);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, [showInactive]);

  const loadCharacters = async () => {
    try {
      const res = await fetch(`/api/characters?include_inactive=${showInactive}`);
      const data = await res.json();
      setCharacters(data.characters || []);
    } catch (err) {
      console.error("❌ Failed to load characters:", err);
    }
  };

  const handleCheckboxChange = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
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
      const res = await fetch("/api/datastore/load-combat-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries })
      });

      const result = await res.json();
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


  const pcs = characters.filter(c => c.player && !c.tags?.includes("monster"));
  const npcs = characters.filter(c => !c.player && !c.tags?.includes("monster"));
  const monsters = characters.filter(c => c.tags?.includes("monster"));

  return (
    <SidePanel
      title="Characters"
      icon="👤"
      onClose={onClose}
      onHide={onHide}
      onTabView={onTabView}
      style={{ width: "520px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            style={{ marginRight: "6px" }}
          />
          Show Inactive
        </label>

        <button onClick={() => {
          const name = prompt("Enter character name:");
          if (!name) return;
          fetch("/api/characters/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              player: false,
              active: true,
              scene: name,
              tags: [],
              conditions: []
            })
          }).then(loadCharacters);
        }}>
          <FaPlus /> New
        </button>
      </div>

      <button onClick={handleAddToInitiative} style={{ marginBottom: "10px" }}>
        ➕ Add to Initiative
      </button>

      <div style={{ display: "flex", gap: "10px" }}>
        {/* PCs */}
        <div style={{ flex: 1 }}>
          <h5>Players</h5>
          {pcs.map((char, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <input
                type="checkbox"
                checked={selectedIds.has(char.id)}
                onChange={() => handleCheckboxChange(char.id)}
              />
              <span>{char.name}</span>
              <FaPen title="Edit" onClick={() => setEditingCharacter(char)} style={{ cursor: "pointer" }} />
            </div>
          ))}
        </div>

        {/* NPCs */}
        <div style={{ flex: 1 }}>
          <h5>NPCs</h5>
          {npcs.map((char, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <input
                type="checkbox"
                checked={selectedIds.has(char.id)}
                onChange={() => handleCheckboxChange(char.id)}
              />
              <span>{char.name}</span>
              <FaPen title="Edit" onClick={() => setEditingCharacter(char)} style={{ cursor: "pointer" }} />
            </div>
          ))}
        </div>

        {/* Monsters */}
        <div style={{ flex: 1 }}>
          <h5>Monsters</h5>
          {monsters.map((char, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{char.name}</span>
              <FaPen title="Edit" onClick={() => setEditingCharacter(char)} style={{ cursor: "pointer" }} />
            </div>
          ))}
        </div>
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
