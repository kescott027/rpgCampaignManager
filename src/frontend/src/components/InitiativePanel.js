// InitiativePanel.js
import React, { useState } from "react";
import {
  FaCog,
  FaPlus,
  FaArrowRight,
  FaTimes,
  FaEyeSlash,
  FaArrowRight as FaArrowTab
} from "react-icons/fa";
import { persistInitiativeState } from "../utils/initSync";

export default function InitiativePanel({
                                          characters = [],
                                          currentIndex = 0,
                                          onStartCombat,
                                          onNext,
                                          onUpdate,
                                          onClose,
                                          onHide,
                                          onTabView,
                                          onCommandRequest
                                        }) {
  const [entries, setEntries] = useState(
    characters.map((char) =>
      typeof char === "string" ? { name: char, initiative: "", scene: char } : char
    )
  );
  const [dragIndex, setDragIndex] = useState(null);
  const [settingsOpenIndex, setSettingsOpenIndex] = useState(null);
  const [sceneInput, setSceneInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    updated[index].scene = updated[index].scene || updated[index].name;
    setEntries(updated);
    onUpdate && onUpdate(updated);
    persistInitiativeState(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) return;
    const reordered = [...entries];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setEntries(reordered);
    setDragIndex(null);
    onUpdate && onUpdate(reordered);
    persistInitiativeState(reordered);
  };

  const addEntry = () => {
    const updated = [...entries, { name: "", initiative: "", scene: "" }];
    setEntries(updated);
    onUpdate && onUpdate(updated);
    persistInitiativeState(updated);
  };

  const handleStartCombat = () => {
    if (typeof onStartCombat === "function") {
      onStartCombat(entries);
    } else if (typeof onCommandRequest === "function") {
      onCommandRequest({ command: "/start-combat", timestamp: Date.now() });
    }
    handleSettingsClose();
  };

  const handleNext = () => {
    if (typeof onNext === "function") {
      onNext();
    } else if (typeof onCommandRequest === "function") {
      onCommandRequest({ command: "/next", timestamp: Date.now() });
    }
  };

  const handleSettingsOpen = (index) => {
    setSettingsOpenIndex(index);
    setNameInput(entries[index]?.name || "");
    setSceneInput(entries[index]?.scene || "");
  };

  const handleSettingsClose = () => {
    setSettingsOpenIndex(null);
    setSceneInput("");
    setNameInput("");
  };

  const handleSettingsSave = () => {
    if (settingsOpenIndex === null) return;
    const updated = [...entries];
    updated[settingsOpenIndex].name = nameInput;
    updated[settingsOpenIndex].scene = sceneInput || nameInput;
    setEntries(updated);
    onUpdate && onUpdate(updated);
    persistInitiativeState(updated);
    handleSettingsClose();
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
          onDragOver={handleDragOver}
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
          <FaCog
            title="Settings"
            style={{ cursor: "pointer" }}
            onClick={() => handleSettingsOpen(index)}
          />
        </div>
      ))}

      <div style={{ marginTop: "10px" }}>
        <button onClick={addEntry} style={{ marginRight: "10px" }}>
          <FaPlus /> Add
        </button>
        <button onClick={handleStartCombat}>Start Combat</button>
        <button onClick={handleNext} title="Next Turn" style={{ float: "right", marginTop: "5px" }}>
          <FaArrowRight />
        </button>
      </div>

      {settingsOpenIndex !== null && (
        <div style={{
          position: "absolute", top: "30%", left: "10%", width: "80%",
          background: "white", border: "1px solid #999", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          padding: "10px", zIndex: 100
        }}>
          <h4>Settings: {entries[settingsOpenIndex].name}</h4>
          <label>Character Name</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
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
