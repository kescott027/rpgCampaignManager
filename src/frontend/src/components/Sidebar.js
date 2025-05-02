import React from 'react';
import FileTree from './FileTree';

export default function Sidebar({ onFileSelect }) {
  return (
    <div className="sidebar">
      <h2>Campaign Manager</h2>

      <div className="section">
        <input
          type="text"
          placeholder="Search..."
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div className="section">
        <h4>📁 Campaign Files</h4>
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
