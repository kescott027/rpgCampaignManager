import React, { useEffect, useState } from "react";
import SidePanel from "./SidePanel";
import { deleteRequest, get, patch } from "../utils/api";


export default function ManageLayoutsPanel({ onClose, onHide, onTabView, user_space, campaign, fetchLayouts }) {
  const [layouts, setLayouts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLayouts();
  }, []);


  const loadLayouts = async () => {
    try {
      const data = await get("/api/display/layout/list");
      setLayouts(data.layouts || []);
    } catch (err) {
      setError("❌ Failed to fetch layouts");
    }
  };

  useEffect(() => {
    loadLayouts(); // Call on mount
  }, []);


  const handleRename = async () => {
    if (!selected) return;
    const newName = prompt("Enter new layout name:");
    if (!newName || newName === selected) return;
    try {
      const result = await patch("/api/display/layout", {
        old_name: selected,
        new_name: newName,
        user_space,
        campaign
      });

      if (result.error) {
        console.error("❌ Rename failed:", result.error);
        setError(result.error);
      } else {
        setSelected(newName);
        await loadLayouts();     // Refresh local dropdown
        fetchLayouts();          // Refresh parent dropdown
      }
    } catch (err) {
      console.error("❌ Rename exception:", err);
      setError("❌ Rename failed");
    }
  };


  const handleDelete = async () => {
    if (!selected) return;
    const confirmDelete = window.confirm(`Delete layout "${selected}"?`);
    if (!confirmDelete) return;

    try {
      await deleteRequest("/api/display/layout", {
        name: selected,
        user_space,
        campaign
      });
      setSelected(null);
      await loadLayouts();
      fetchLayouts();

    } catch (err) {
      setError("❌ Delete failed");
    }
  };


  return (
    <SidePanel
      title="Manage Scenes"
      icon="🗂️"
      onClose={onClose}
      onHide={onHide}
      onTabView={onTabView}
      style={{ width: "320px" }}
    >
      <div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {layouts.map((name) => (
            <li
              key={name}
              onClick={() => setSelected(name)}
              style={{
                padding: "6px 8px",
                backgroundColor: selected === name ? "#e0f7fa" : "transparent",
                cursor: "pointer"
              }}
            >
              {name}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button onClick={handleRename} disabled={!selected}>✏️ Rename</button>
          <button onClick={handleDelete} disabled={!selected} style={{ color: "red" }}>🗑️ Delete</button>
          <button onClick={fetchLayouts}>🔄 Refresh</button>
          {/* Manual refresh */}
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        )}
      </div>
    </SidePanel>
  );
}
