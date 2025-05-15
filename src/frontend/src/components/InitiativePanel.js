// InitiativePanel.js
import React, { useState } from "react";
import {
  FaCog, FaPlus, FaArrowRight,
  FaTimes, FaEyeSlash, FaArrowRight as FaArrowTab
} from "react-icons/fa";

export default function InitiativePanel({
                                          characters = [],
                                          currentIndex = 0,
                                          onStartCombat,
                                          onNext,
                                          onUpdate,
                                          onClose,
                                          onHide,
                                          onTabView
                                        }) {
  const [settingsOpenIndex, setSettingsOpenIndex] = useState(null);
  const [sceneInput, setSceneInput] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...characters];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onUpdate(updated);
  };

  const addEntry = () => {
    onUpdate([...characters, { name: "", initiative: "" }]);
  };

  const handleSettingsOpen = (index) => {
    setSettingsOpenIndex(index);
    setSceneInput(characters[index]?.scene || "");
  };

  const handleSettingsClose = () => {
    setSettingsOpenIndex(null);
    setSceneInput("");
  };

  const handleSettingsSave = async () => {
    const char = characters[settingsOpenIndex];
    try {
      await fetch("/api/session/scene-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: char.name, scene: sceneInput })
      });
      console.log(`Updated scene for ${char.name}: ${sceneInput}`);
    } catch (err) {
      console.error("Failed to update scene mapping", err);
    }
    handleSettingsClose();
  };

  return (
    <div className="initiative-panel" style={{
      width: "260px",
      padding: "10px",
      background: "#f8f9fa",
      borderRight: "1px solid #ccc",
      position: "relative"
    }}>
      {/* Top controls */}
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

      {/* Initiative list */}
      {characters.map((entry, index) => (
        <div
          key={index}
          className={`initiative-entry ${index === currentIndex ? "active-slot" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px",
            backgroundColor: index === currentIndex ? "#f0fff4" : "transparent",
            borderLeft: index === currentIndex ? "4px solid green" : "4px solid transparent",
            paddingLeft: "4px"
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
          <FaCog
            title="Settings"
            style={{ cursor: "pointer" }}
            onClick={() => handleSettingsOpen(index)}
          />
        </div>
      ))}

      {/* Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={addEntry} style={{ marginRight: "10px" }}>
          <FaPlus /> Add
        </button>
        <button onClick={() => onStartCombat(characters)}>
          Start Combat
        </button>
        <button onClick={onNext} title="Next Turn" style={{ float: "right", marginTop: "5px" }}>
          <FaArrowRight />
        </button>
      </div>

      {/* Modal popup */}
      {settingsOpenIndex !== null && (
        <div style={{
          position: "absolute", top: "30%", left: "10%", width: "80%",
          background: "white", border: "1px solid #999", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          padding: "10px", zIndex: 100
        }}>
          <h4>Settings: {characters[settingsOpenIndex].name}</h4>
          <label>Character Scene</label>
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
