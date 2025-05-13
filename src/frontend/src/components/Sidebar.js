import React, { useEffect, useState } from "react";
import FileTree from "./FileTree";
import GoogleLoginButton from "./GoogleLogin";
import logo from "./assets/logo.png";

export default function Sidebar({ onFileSelect }) {
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    // Detect session by checking cookie
    const hasSession = document.cookie.includes("session_id=");
    setSessionActive(hasSession);
  }, []);

  const handleDriveClick = async () => {
    try {
      const res = await fetch("/api/drive/list?folderId=root", {
        method: "GET",
        credentials: "include"
      });
      const data = await res.json();

      if (res.ok && data.items) {
        onFileSelect({ type: "drive-listing", payload: data.items });
      } else {
        console.error("❌ Failed to fetch root folder items:", data.error || data);
        alert(`Drive Error:\n${data.error || "Unknown error"}`);
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

      <GoogleLoginButton
        sessionActive={sessionActive}
        onLogout={() => setSessionActive(false)}
      />

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

      <div className="section">
        <h4>⚔️ Assets</h4>
        <ul>
          <li>GM Assets</li>
          <li>Combat Mode</li>
        </ul>
      </div>

      <div className="section">
        <h4>🛠️ Debug Tools</h4>
        <button
          onClick={handleDriveClick}
          style={{ width: "100%", padding: "5px" }}
          aria-label="Trigger Root Folder API Test"
        >
          🔍 Test Root Folder
        </button>
      </div>
    </div>
  );
}
