// TabViewer.js
import React from "react";

export default function TabViewer({
                                    activeTab,
                                    onTabChange,
                                    tabs = [],
                                    tabContent = {},
                                    onTabSelected = () => {
                                    }
                                  }) {
  return (
    <div className="tab-viewer">
      <div className="tab-bar" style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        {tabs.map((tab) => (
          <div
            key={tab}
            role="button"
            aria-pressed={tab === activeTab}
            className={`tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => {
              onTabChange(tab);
              onTabSelected(tab);
            }}
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
        {tabs.includes(activeTab) ? (
          tabContent[activeTab]
        ) : (
          <div role="alert" style={{ color: "#777" }}>
            🪹 No content for "{activeTab}" tab.
          </div>
        )}
      </div>
    </div>
  );
}
