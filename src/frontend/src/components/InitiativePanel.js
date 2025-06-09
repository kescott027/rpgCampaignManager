import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaPlus,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaEyeSlash,
  FaFolderOpen,
  FaSync,
  FaEdit
} from "react-icons/fa";

export default function InitiativePanel({
                                          characters = [],
                                          currentIndex = 0,
                                          onStartCombat,
                                          onNext,
                                          onPrevious,
                                          onClose,
                                          onHide,
                                          onTabView,
                                          onUpdate,
                                          onRefresh
                                        }) {
  const [editingEntries, setEditingEntries] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [settingsOpenIndex, setSettingsOpenIndex] = useState(null);
  const [sceneInput, setSceneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (Array.isArray(characters)) {
      setEditingEntries(characters);
    }
  }, [characters]);

  const handleChange = (index, field, value) => {
    const updated = [...editingEntries];
    updated[index][field] = value;
    setEditingEntries(updated);
  };


  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) return;
    const reordered = [...editingEntries];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setEditingEntries(reordered);
    setDragIndex(null);
    if (onUpdate) {
      onUpdate(reordered);
    }
  };

  const addEntry = () => {
    const updated = [...editingEntries, { name: "", initiative: "", scene: "" }];
    setEditingEntries(updated);
  };

  const handleSettingsOpen = (index) => {
    setSettingsOpenIndex(index);
    setNameInput(editingEntries[index]?.name || "");
    setSceneInput(editingEntries[index]?.scene || "");
  };

  const handleSettingsClose = () => {
    setSettingsOpenIndex(null);
    setSceneInput("");
    setNameInput("");
  };

  const handleSettingsSave = () => {
    const updated = [...editingEntries];
    updated[settingsOpenIndex] = {
      ...updated[settingsOpenIndex],
      name: nameInput,
      scene: sceneInput
    };
    setEditingEntries(updated);
    onUpdate && onUpdate(updated);
    handleSettingsClose();
  };

  const removeEntry = (index) => {
    const updated = editingEntries.filter((_, i) => i !== index);
    setEditingEntries(updated);
    onUpdate && onUpdate(updated);
  };

  const clearQueue = () => {
    setEditingEntries([]);
    onUpdate && onUpdate([]);
  };

  const handleStartCombat = () => onStartCombat && onStartCombat(editingEntries);
  const handleNext = () => onNext && onNext();
  const handlePrevious = () => onPrevious && onPrevious();
  const handleRefresh = () => onRefresh && onRefresh();

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
        <div style={{ display: "flex", gap: "6px" }}>
          <button title="Edit" onClick={() => setEditMode(!editMode)}><FaEdit /></button>
          <button title="Close" onClick={onClose} style={{ color: "red" }}><FaTimes /></button>
          <button title="Hide in Dock" onClick={onHide}><FaEyeSlash /></button>
          <button title="Tab View" onClick={onTabView}>< FaFolderOpen style={{ color: "cadetblue" }} /></button>
        </div>
      </div>

      {editingEntries.map((entry, index) => (
        <div
          key={index}
          className={`initiative-entry ${index === currentIndex ? "active-slot" : ""}`}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px",
            backgroundColor: index === currentIndex ? "#f0fff4" : "transparent",
            borderLeft: index === currentIndex ? "4px solid green" : "4px solid transparent",
            paddingLeft: "4px"
          }}
        >
          {editMode && (
            <button onClick={() => removeEntry(index)}
                    style={{ marginRight: "4px", color: "red", background: "none", border: "none" }}>❌</button>
          )}
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
          <FaCog style={{ cursor: "pointer" }} onClick={() => handleSettingsOpen(index)} />
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button onClick={handlePrevious} title="Previous Turn"><FaArrowLeft /></button>
        <button onClick={addEntry}><FaPlus /> Add</button>
        <button onClick={handleStartCombat}>Start Combat</button>
        <button onClick={handleNext} title="Next Turn"><FaArrowRight /></button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        <button onClick={handleRefresh}><FaSync /> Refresh</button>
        {editMode && <button onClick={clearQueue} style={{ color: "red" }}>Clear Queue</button>}
      </div>

      {settingsOpenIndex !== null && (
        <div style={{
          position: "absolute", top: "30%", left: "10%", width: "80%",
          background: "white", border: "1px solid #999", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
          padding: "10px", zIndex: 100
        }}>
          <h4>Settings: {editingEntries[settingsOpenIndex].name}</h4>
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
