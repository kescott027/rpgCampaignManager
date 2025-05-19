import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaPlus,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaEyeSlash,
  FaArrowRight as FaArrowTab
} from "react-icons/fa";

export default function InitiativePanel({
                                          characters = [],
                                          currentIndex = 0,
                                          onStartCombat,
                                          onNext,
                                          onPrevious,
                                          onUpdate,
                                          onClose,
                                          onHide,
                                          onTabView,
                                          onRefresh
                                        }) {
  const [entries, setEntries] = useState(() => {
    if (!Array.isArray(characters)) {
      console.warn("⚠️ InitiativePanel received non-array 'characters':", characters);
      return [];
    }
    return characters.map((char) =>
      typeof char === "string"
        ? { name: char, initiative: "", scene: char }
        : {
          name: char.name || "",
          initiative: char.initiative || "",
          scene: char.scene || char.name || ""
        }
    );
  });

  useEffect(() => {
    if (Array.isArray(characters)) {
      setEntries(characters);
    }
  }, [characters]);

  const [dragIndex, setDragIndex] = useState(null);
  const [settingsOpenIndex, setSettingsOpenIndex] = useState(null);
  const [sceneInput, setSceneInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
    onUpdate && onUpdate(updated);
  };

  const addEntry = () => {
    const updated = [...entries, { name: "", initiative: "", scene: "" }];
    setEntries(updated);
    onUpdate && onUpdate(updated);
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) return;
    const reordered = [...entries];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setEntries(reordered);
    onUpdate && onUpdate(reordered);
    setDragIndex(null);
  };

  const handleDelete = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    onUpdate && onUpdate(updated);
  };

  const clearAll = () => {
    const confirmed = window.confirm("Are you sure you want to clear the entire initiative queue?");
    if (!confirmed) return;
    setEntries([]);
    onUpdate && onUpdate([]);
  };

  const handleSettingsOpen = (index) => {
    setSettingsOpenIndex(index);
    setNameInput(entries[index]?.name || "");
    setSceneInput(entries[index]?.scene || "");
  };

  const handleSettingsSave = () => {
    const updated = [...entries];
    updated[settingsOpenIndex] = {
      ...updated[settingsOpenIndex],
      name: nameInput.trim(),
      scene: sceneInput.trim() || nameInput.trim()
    };
    setEntries(updated);
    onUpdate && onUpdate(updated);
    handleSettingsClose();
  };

  const handleSettingsClose = () => {
    setSettingsOpenIndex(null);
    setNameInput("");
    setSceneInput("");
  };

  return (
    <div className="initiative-panel" style={{
      width: "280px",
      padding: "10px",
      background: "#f8f9fa",
      borderRight: "1px solid #ccc",
      position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h4 style={{ margin: 0 }}>Initiative Tracker</h4>
        <div style={{ display: "flex", gap: "8px" }}>
          <button title="Close" onClick={onClose} style={{ color: "red", background: "none", border: "none" }}>
            <FaTimes />
          </button>
          <button title="Hide in Dock" onClick={onHide} style={{ background: "none", border: "none" }}>
            <FaEyeSlash />
          </button>
          <button title="Tab View" onClick={onTabView} style={{ color: "green", background: "none", border: "none" }}>
            <FaArrowTab />
          </button>
        </div>
      </div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className={`initiative-entry ${index === currentIndex ? "active-slot" : ""}`}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px",
            backgroundColor: index === currentIndex ? "#f0fff4" : "transparent",
            borderLeft: index === currentIndex ? "4px solid green" : "4px solid transparent",
            paddingLeft: "4px",
            cursor: "move"
          }}
        >
          <input
            type="text"
            value={entry.name}
            placeholder="Name"
            onChange={(e) => handleChange(index, "name", e.target.value)}
            style={{ flex: 1, marginRight: "4px" }}
          />
          <input
            type="number"
            value={entry.initiative}
            placeholder="Init"
            onChange={(e) => handleChange(index, "initiative", e.target.value)}
            style={{ width: "50px", marginRight: "4px" }}
          />
          <FaCog title="Settings" style={{ cursor: "pointer", marginRight: "4px" }}
                 onClick={() => handleSettingsOpen(index)} />
          <FaTimes title="Remove" style={{ cursor: "pointer", color: "red" }} onClick={() => handleDelete(index)} />
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <button onClick={addEntry}><FaPlus /> Add</button>
        <button onClick={clearAll}>Clear All</button>
        <button onClick={onRefresh}>🔄 Refresh</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button onClick={onPrevious} title="Previous Turn">⏪</button>
        <button onClick={onStartCombat}>Start Combat</button>
        <button onClick={onNext} title="Next Turn"><FaArrowRight /></button>
      </div>

      {settingsOpenIndex !== null && (
        <div style={{
          position: "absolute", top: "30%", left: "10%", width: "80%",
          background: "white", border: "1px solid #999", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          padding: "10px", zIndex: 100
        }}>
          <h4>Settings</h4>
          <label>Character Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <label>Scene</label>
          <input
            type="text"
            value={sceneInput}
            onChange={(e) => setSceneInput(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button onClick={handleSettingsClose}>Cancel</button>
            <button onClick={handleSettingsSave}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
