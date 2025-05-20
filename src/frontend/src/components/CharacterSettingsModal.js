import React, { useState, useEffect } from "react";

export default function CharacterSettingsModal({ character, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...character });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        conditions: formData.conditions || [],
        tags: formData.tags || []
      };

      const res = await fetch("/api/characters/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("✅ Character updated:", data);
      onSave(); // refresh list
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
        <label>Name:<input value={formData.name} onChange={e => updateField("name", e.target.value)} /></label>
        <label>Scene:<input value={formData.scene} onChange={e => updateField("scene", e.target.value)} /></label>
        <label>Campaign:<input value={formData.campaign}
                               onChange={e => updateField("campaign", e.target.value)} /></label>
        <label>AC:<input type="number" value={formData.ac} onChange={e => updateField("ac", e.target.value)} /></label>
        <label>HP:<input type="number" value={formData.hp} onChange={e => updateField("hp", e.target.value)} /></label>
        <label>Perception:<input type="number" value={formData.perception}
                                 onChange={e => updateField("perception", e.target.value)} /></label>
        <label>Will:<input type="number" value={formData.will}
                           onChange={e => updateField("will", e.target.value)} /></label>
        <label>Fortitude:<input type="number" value={formData.fortitude}
                                onChange={e => updateField("fortitude", e.target.value)} /></label>
        <label>Reflex:<input type="number" value={formData.reflex}
                             onChange={e => updateField("reflex", e.target.value)} /></label>
        <label>Player:
          <input type="checkbox" checked={formData.player} onChange={e => updateField("player", e.target.checked)} />
        </label>
        {formData.player && (
          <label>Player Name:<input value={formData.player_name || ""}
                                    onChange={e => updateField("player_name", e.target.value)} /></label>
        )}
        <label>Active:
          <input type="checkbox" checked={formData.active} onChange={e => updateField("active", e.target.checked)} />
        </label>
        <label style={{ width: "100%" }}>Notes:
          <textarea style={{ width: "100%" }} rows="3" value={formData.notes || ""}
                    onChange={e => updateField("notes", e.target.value)} />
        </label>
        <label>Tags:<input value={formData.tags?.join(", ") || ""}
                           onChange={e => updateField("tags", e.target.value.split(",").map(t => t.trim()))} /></label>
      </div>

      <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSave}>OK</button>
      </div>
    </div>
  );
}
