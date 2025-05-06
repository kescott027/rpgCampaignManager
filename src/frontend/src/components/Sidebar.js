import React, { useEffect, useState } from "react";
import FileTree from "./FileTree";
import GoogleLoginButton from "./GoogleLogin";
import logo from "./assets/logo.png";

export default function Sidebar({ onFileSelect }) {
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    // Very basic session detection via cookie presence
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
      onFileSelect({ type: "drive-listing", payload: data.items });
    } catch (err) {
      console.error("Failed to fetch Google Drive contents:", err);
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Campaign Logo" className="logo" />
        <h2>Campaign Manager</h2>
      </div>
      <GoogleLoginButton sessionActive={sessionActive} onLogout={() => setSessionActive(false)} />
      <div className="section">
        <input
          type="text"
          placeholder="Search..."
          style={{ width: "100%", padding: "5px" }}
          aria-label="Search"
        />
      </div>
      <div className="section">
        <h4>🛠️ Debug Tools</h4>
        {<button
          onClick={async () => {
            try {
              console.log("📁 Calling root folder explicitly…");
              const res = await fetch("/api/drive/list?folderId=root", {
                method: "GET",
                credentials: "include"
              });
              const data = await res.json();

              if (res.ok) {
                console.log("✅ Root folder items:", data.items);
                alert(`Loaded ${data.items.length} items from root folder.`);
              } else {
                console.error("❌ Error from API:", data.error);
                alert(`Drive Error:\n${data.error}`);
              }
            } catch (err) {
              console.error("🚨 Unexpected fetch error:", err);
              alert("Unexpected error: " + err.message);
            }
          }}
        >
          🔍 Test Root Folder
        </button>
        }
      </div>
      <div className="section">
        <h4
          onClick={handleDriveClick}
          style={{ cursor: "pointer" }}
          title="Browse Campaign Files from Google Drive"
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
    </div>
  );
}
