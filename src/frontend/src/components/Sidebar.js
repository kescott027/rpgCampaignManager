import React, { useEffect, useState } from "react";
import FileTree from "./FileTree";
import GoogleLoginButton from "./GoogleLogin";
import logo from "./images/logo.png";
import { get } from "../utils/api";

export default function Sidebar({ onFileSelect }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    // Detect session by checking cookie
    const hasSession = document.cookie.includes("session_id=");
    setSessionActive(hasSession);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleDriveClick = async () => {
    try {
      const data = await get("/api/drive/list?folderId=rpgCampaignManager", {
        credentials: "include"
      });

      if (data.ok && Array.isArray(data)) {
        onFileSelect({ type: "drive-listing", payload: data });
      } else if (data.ok && Array.isArray(data.items)) {
        onFileSelect({ type: "drive-listing", payload: data.items });
      } else {
        console.error("❌ Unexpected response from /api/drive/list:", data);
        alert(`Drive Error:\n${data.error || "Invalid data format received."}`);
      }
    } catch (err) {
      console.error("🚨 Fetch error:", err);
      alert("Unexpected error: " + err.message);
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Campaign Logo" className="logo" />
        <h2>Campaign Manager</h2>
      </div>

      <hr style={{ margin: "10px 0" }} />
      <button onClick={() => setDarkMode(prev => !prev)}>
        {darkMode ? "🌙 Dark Mode On" : "☀️ Light Mode"}
      </button>
      <div className="section">
        <input
          type="text"
          placeholder="Search..."
          style={{ width: "100%", padding: "5px" }}
          aria-label="Search Drive or Campaign"
        />
      </div>

      <div className="section">
        <h4
          onClick={handleDriveClick}
          style={{ cursor: "pointer" }}
          title="Browse your Google Drive Campaign folder"
        >
          📁 Campaign Files
        </h4>
        <FileTree onFileSelect={onFileSelect} />
      </div>

      <div style={{ padding: "10px", borderTop: "1px solid #ccc", marginTop: "10px" }}>
        <h4>Game Panels</h4>

        <button
          onClick={() => onFileSelect({ toggle: "initiative" })}
          style={{ display: "block", marginBottom: "8px" }}
        >
          🎲 Initiative Tracker
        </button>

        <button
          onClick={() => onFileSelect({ toggle: "characters" })}
          style={{ display: "block" }}
        >
          👤 Characters
        </button>

      </div>

      <div className="section">
        <h4>⚔️ Assets</h4>
        <ul>
          <li>GM Assets</li>
          <li>Combat Mode</li>
        </ul>
      </div>
    </div>
  );
}
