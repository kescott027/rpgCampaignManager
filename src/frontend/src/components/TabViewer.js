// TabViewer.js
import React from "react";

export default function TabViewer({
                                    activeTab,
                                    onTabChange,
                                    tabs = [],
                                    tabContent = {}
                                  }) {
  return (
    <div className="tab-viewer">
      <div className="tab-bar" style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => onTabChange(tab)}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              borderBottom: tab === activeTab ? "2px solid green" : "none"
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="tab-body" style={{ padding: "10px" }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
