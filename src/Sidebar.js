import React from 'react';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Campaign Manager</h2>
      <div className="section">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="section">
        <h4>Indexes</h4>
        <ul>
          <li>Entity Index</li>
          <li>Event Index</li>
          <li>Status Index</li>
          <li>Relationship Index</li>
        </ul>
      </div>
      <div className="section">
        <h4>Assets</h4>
        <ul>
          <li>GM Assets</li>
          <li>Combat Mode</li>
        </ul>
      </div>
    </div>
  );
}
