import React, { useState } from "react";
import { Rnd } from "react-rnd";

export default function StickyNote({ id, content, type, initialPos, initialSize, onClose, onUpdate }) {
  const [position, setPosition] = useState(initialPos || { x: 100, y: 100 });
  const [dragOffset, setDragOffset] = useState(null);
  const [size, setSize] = useState(initialSize || { width: 240, height: 180 });

  const handleMouseDown = (e) => {
    setDragOffset({
      x: e.clientX - position.left,
      y: e.clientY - position.top
    });
  };

  const handleMouseMove = (e) => {
    if (!dragOffset) return;
    setPosition({
      top: e.clientY - dragOffset.y,
      left: e.clientX - dragOffset.x
    });
  };

  const handleDragStop = (e, d) => {
    setPosition({ x: d.x, y: d.y });
    onUpdate && onUpdate(id, { position: { x: d.x, y: d.y }, size });
  };

  const handleMouseUp = () => {
    setDragOffset(null);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
    setSize(newSize);
    setPosition(position);
    onUpdate && onUpdate(id, { position: position, size: newSize });
  };


  const renderContent = () => {
    if (type === "markdown") {
      return <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>;
    } else if (type === "image") {
      return <img src={content} alt="Dropped" style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
    } else {
      return <p>Unsupported type</p>;
    }
  };

  return (
    <Rnd
      default={{
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height
      }}
      minWidth={40}
      minHeight={40}
      bounds="parent"
      style={{ zIndex: 10, background: "#fff9c4", border: "1px solid #ccc", boxShadow: "2px 2px 6px rgba(0,0,0,0.1)" }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
    >
      <div style={{ width: "100%", height: "100%", padding: "5px", position: "relative" }}>
        <button
          onClick={() => onClose(id)}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            background: "#ff6666",
            border: "none",
            color: "white",
            borderRadius: "3px",
            cursor: "pointer",
            padding: "2px 6px",
            fontSize: "12px",
            zIndex: 20
          }}
        >
          ✕
        </button>
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>{renderContent()}</div>
      </div>
    </Rnd>
  );
}
