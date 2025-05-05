import React from 'react';
import FileTree from './FileTree';

export default function Sidebar({ onFileSelect }) {
  const handleDriveClick = async () => {
    try {
      const res = await fetch("/api/drive/list?folderId=root");
      const data = await res.json();
      onFileSelect({ type: "drive-listing", payload: data.items });
    } catch (err) {
      console.error("Failed to fetch Google Drive contents:", err);
    }
  };

  return (
    <div className="sidebar">
      <h2>Campaign Manager</h2>

      <div className="section">
        <input
          type="text"
          placeholder="Search..."
          style={{ width: "100%", padding: "5px" }}
          aria-label="Search"
        />
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
