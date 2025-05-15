// TabViewer.js
import React from "react";

export default function TabViewer({ activeTab, onTabChange, tabs = [], tabContent = {} }) {
  return (
    <div className="tab-viewer">
      {/* Tab headers */}
      <div className="tab-header"
           style={{ display: "flex", gap: "10px", padding: "6px 10px", backgroundColor: "#eee" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "5px 10px",
              backgroundColor: tab === activeTab ? "#ddd" : "#fff",
              border: "1px solid #ccc",
              borderBottom: tab === activeTab ? "2px solid #333" : "1px solid #ccc",
              fontWeight: tab === activeTab ? "bold" : "normal"
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="tab-body" style={{ padding: "10px" }}>
        {tabContent[activeTab] || <div style={{ color: "#999" }}>🪹 No content for "{activeTab}" tab.</div>}
      </div>
    </div>
  );
}
