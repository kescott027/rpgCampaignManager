import React from 'react';

export default function TabViewer({ activeTab, onTabChange,
                                    tabs = ['Markdown', 'JSON', 'Images', 'PDF', 'Audio', 'Video'],
                                    children }) {
  return (
    <div className="tab-viewer">
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab}
            className={tab === activeTab ? 'active-tab' : ''}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
}
