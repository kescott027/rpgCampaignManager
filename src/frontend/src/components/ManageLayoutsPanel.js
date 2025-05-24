import React, { useEffect, useState } from "react";
import SidePanel from "./SidePanel";

export default function ManageLayoutsPanel({ onClose, onHide, onTabView }) {
  const [layouts, setLayouts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const res = await fetch("/api/display/layout/list");
      const data = await res.json();
      setLayouts(data.layouts || []);
    } catch (err) {
      console.error("❌ Failed to fetch layouts:", err);
    }
  };

  const handleRename = async () => {
    if (!selected) return;
    const newName = prompt("Enter new layout name:");
    if (!newName || newName === selected) return;
    try {
      const res = await fetch("/api/display/layouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_name: selected, new_name: newName })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setSelected(newName);
        fetchLayouts();
      }
    } catch (err) {
      setError("❌ Rename failed");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const confirmDelete = window.confirm(`Delete layout "${selected}"?`);
    if (!confirmDelete) return;
    try {
      await fetch(`/api/display/layouts?name=${encodeURIComponent(selected)}`, {
        method: "DELETE"
      });
      setSelected(null);
      fetchLayouts();
    } catch (err) {
      setError("❌ Delete failed");
    }
  };

  return (
    <SidePanel
      title="Manage Layouts"
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
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        )}
      </div>
    </SidePanel>
  );
}
