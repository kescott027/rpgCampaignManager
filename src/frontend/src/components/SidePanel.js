import React from "react";

export default function SidePanel({
                                    title = "Panel",
                                    icon = "📋",
                                    onClose,
                                    onHide,
                                    onTabView,
                                    children,
                                    style = {}
                                  }) {
  return (
    <div className="side-panel" style={{ width: "260px", borderRight: "1px solid #ccc", padding: "10px", ...style }}>
      <div className="side-panel-header"
           style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h4 style={{ margin: 0 }}>{icon} {title}</h4>
        <div style={{ display: "flex", gap: "8px" }}>
          {onClose && (
            <button title="Close" onClick={onClose}
                    style={{ color: "red", background: "none", border: "none" }}>❌</button>
          )}
          {onHide && (
            <button title="Hide" onClick={onHide} style={{ background: "none", border: "none" }}>👁️</button>
          )}
          {onTabView && (
            <button title="Move to Tab" onClick={onTabView}
                    style={{ color: "green", background: "none", border: "none" }}>➡️</button>
          )}
        </div>
      </div>

      <div className="side-panel-body">
        {children}
      </div>
    </div>
  );
}
