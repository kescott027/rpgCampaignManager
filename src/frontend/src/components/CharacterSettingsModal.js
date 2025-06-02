import React, { useState } from "react";
import { post } from "../utils/api";

export default function CharacterSettingsModal({ character, onClose, onSave }) {
  // const [formData, setFormData] = useState({ ...character });
  const [formData, setFormData] = useState({
    ...character,
    tags: character.tags || []
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumericChange = (field) => (e) => {
    const val = e.target.value;
    updateField(field, val === "" ? 0 : parseInt(val, 10));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        conditions: formData.conditions || [],
        tags: (formData.tags || []).map(t => t.trim().toLowerCase()).filter(Boolean)
      };

      const data = await post("/api/characters/update", payload);

      console.log("✅ Character updated:", data);
      onSave();
      onClose();
    } catch (err) {
      console.error("❌ Failed to update character:", err);
    }
  };

  return (
    <div style={{
      position: "absolute", top: "20%", left: "20%", width: "60%",
      background: "white", padding: "20px", border: "1px solid #aaa",
      boxShadow: "0 0 8px rgba(0,0,0,0.3)", zIndex: 999
    }}>
      <h3>Edit Character: {formData.name}</h3>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <label>Name:<input value={formData.name ?? ""} onChange={e => updateField("name", e.target.value)} /></label>
        <label>Scene:<input value={formData.scene ?? ""} onChange={e => updateField("scene", e.target.value)} /></label>
        <label>Campaign:<input value={formData.campaign ?? ""}
                               onChange={e => updateField("campaign", e.target.value)} /></label>

        <label>AC:<input type="number" value={formData.ac ?? 0} onChange={handleNumericChange("ac")} /></label>
        <label>HP:<input type="number" value={formData.hp ?? 0} onChange={handleNumericChange("hp")} /></label>
        <label>Perception:<input type="number" value={formData.perception ?? 0}
                                 onChange={handleNumericChange("perception")} /></label>
        <label>Will:<input type="number" value={formData.will ?? 0} onChange={handleNumericChange("will")} /></label>
        <label>Fortitude:<input type="number" value={formData.fortitude ?? 0}
                                onChange={handleNumericChange("fortitude")} /></label>
        <label>Reflex:<input type="number" value={formData.reflex ?? 0}
                             onChange={handleNumericChange("reflex")} /></label>

        <label>Player:
          <input type="checkbox" checked={formData.player} onChange={e => updateField("player", e.target.checked)} />
        </label>


        {formData.player && (
          <label>Player Name:
            <input value={formData.player_name ?? ""} onChange={e => updateField("player_name", e.target.value)} />
          </label>
        )}

        <label>Active:
          <input type="checkbox" checked={formData.active} onChange={e => updateField("active", e.target.checked)} />
        </label>

        <div style={{ width: "100%" }}>
          <label>Tags:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "4px 0" }}>
            {formData.tags.map((tag, idx) => (
              <div key={idx} style={{
                backgroundColor: "#ddd",
                borderRadius: "12px",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center"
              }}>
                <span style={{ marginRight: "6px" }}>{tag}</span>
                <button
                  onClick={() => {
                    const updated = formData.tags.filter((_, i) => i !== idx);
                    updateField("tags", updated);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    lineHeight: "1"
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                const newTag = e.target.value.trim().toLowerCase();
                if (!formData.tags.includes(newTag)) {
                  updateField("tags", [...formData.tags, newTag]);
                }
                e.target.value = "";
              }
            }}
          />
        </div>
        <label style={{ width: "100%" }}>Notes:
          <textarea style={{ width: "100%" }} rows="3" value={formData.notes ?? ""}
                    onChange={e => updateField("notes", e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave}>OK</button>
      </div>
    </div>
  );
}

