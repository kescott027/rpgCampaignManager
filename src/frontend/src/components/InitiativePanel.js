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
  const [dragIndex, setDragIndex] = useState(null);
  const [settingsOpenIndex, setSettingsOpenIndex] = useState(null);
  const [sceneInput, setSceneInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  const handleChange = (index, field, value) => {
    const updated = [...characters];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onUpdate(updated);
  };

  const addEntry = async () => {
    const updated = [...characters, { name: "", initiative: "", scene: "" }];
    onUpdate(updated);

    try {
      await fetch("/api/session/initiative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: updated })
      });
    } catch (err) {
      console.error("❌ Failed to persist added entry:", err);
    }
  };

  const handleSettingsOpen = (index) => {
    console.log("⚙ Opening settings for:", characters[index]);
    setSettingsOpenIndex(index);
    setNameInput(characters[index]?.name || "");
    setSceneInput(characters[index]?.scene || "");
  };

  const handleSettingsClose = () => {
    setSettingsOpenIndex(null);
    setSceneInput("");
    setNameInput("");
  };

  const handleSettingsSave = async () => {
    const original = characters[settingsOpenIndex];
    const updatedList = [...characters];
    const oldName = original.name;
    const newName = nameInput;

    try {
      // Rename character if name changed
      if (oldName !== newName) {
        await fetch("/api/session/rename-character", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ old_name: oldName, new_name: newName })
        });
      }

      // Update scene mapping
      await fetch("/api/session/scene-mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, scene: sceneInput })
      });

      // Update local state
      updatedList[settingsOpenIndex] = {
        ...original,
        name: newName,
        scene: sceneInput
      };
      onUpdate(updatedList);
    } catch (err) {
      console.error("❌ Failed to save character settings:", err);
    }

    handleSettingsClose();
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const updated = [...characters];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdate(updated);
    setDragIndex(null);
    console.log("💾 Saving new order:", updated);

    // persist to backend
    fetch("/api/session/initiative", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: updated })
    }).catch((err) =>
      console.error("❌ Failed to persist initiative order:", err)
    );
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
          draggable
          onDragStart={() => handleDragStart(index)}
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

        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/session/command", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: "/rebuild" })
              });
              const data = await res.json();
              console.log("🔁 Initiative rebuilt:", data.response);
              if (data.characters) {
                onUpdate(data.characters.map(name => ({
                  name,
                  initiative: "",
                  scene: data.scene_mapping?.[name] || `${name} Scene`
                })));
              }
            } catch (err) {
              console.error("❌ Failed to rebuild initiative:", err);
            }
          }}
          title="Reset and rebuild initiative state"
          style={{ float: "left", marginTop: "5px", marginRight: "10px", background: "#ffc107" }}
        >
          🔁 Reset
        </button>
      </div>

      {/* Settings Modal */}
      {settingsOpenIndex !== null && (
        <div style={{
          position: "absolute", top: "30%", left: "10%", width: "80%",
          background: "white", border: "1px solid #999", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          padding: "10px", zIndex: 100
        }}>
          <h4>Settings: {characters[settingsOpenIndex].name}</h4>
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
