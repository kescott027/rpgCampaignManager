import React from "react";
import { FaTimes, FaEyeSlash, FaFolderOpen, FaEdit } from "react-icons/fa";

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
          <button title="Edit"><FaEdit /></button>
          {onClose && (
            <button title="Close" onClick={onClose}
                    style={{ color: "red" }}><FaTimes /></button>
          )}
          {onHide && (
            <button title="Hide" onClick={onHide} style={{}}><FaEyeSlash /></button>
          )}
          {onTabView && (
            <button title="Move to Tab" onClick={onTabView}
                    style={{ color: "cadetblue" }}><FaFolderOpen /></button>
          )}
        </div>
      </div>

      <div className="side-panel-body">
        {children}
      </div>
    </div>
  );
}
