import React, { useState } from "react";

export default function StickyNote({ id, type, content, position, onClose }) {
  const [pos, setPos] = useState(position);
  const [dragOffset, setDragOffset] = useState(null);

  const handleMouseDown = (e) => {
    setDragOffset({
      x: e.clientX - pos.left,
      y: e.clientY - pos.top
    });
  };

  const handleMouseMove = (e) => {
    if (!dragOffset) return;
    setPos({
      top: e.clientY - dragOffset.y,
      left: e.clientX - dragOffset.x
    });
  };

  const handleMouseUp = () => {
    setDragOffset(null);
  };

  return (
    <div
      className="sticky-note"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        background: "lightyellow",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        maxWidth: "240px",
        zIndex: 10,
        cursor: "move"
      }}
    >
      <button onClick={() => onClose(id)} style={{ float: "right", marginLeft: "8px" }}>❌</button>
      <div style={{ overflowWrap: "break-word" }}>
        {type === "image" ? (
          <img src={content} alt="sticky" style={{ maxWidth: "100%" }} />
        ) : (
          <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
        )}
      </div>
    </div>
  );
}
