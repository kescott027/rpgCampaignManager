import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StickyNote({ id, content, type, position, size, onClose, onUpdate }) {
  const [noteContent, setNoteContent] = useState(type === "markdown" ? "Loading..." : content);
  /**  const [currentPos, setCurrentPos] = useState(position || { x: 100, y: 100 });
   const [currentSize, setCurrentSize] = useState(size || { width: 240, height: 180 });
   const effectivePosition = position ?? { x: 100, y: 100 };
   const effectiveSize = size ?? { width: 240, height: 180 };
   // Sync if props change
   useEffect(() => {
    if (position) setCurrentPos(position);
    if (size) setCurrentSize(size);
  }, [position, size]);
   **/
  useEffect(() => {
    if (type !== "markdown") return;
    if (typeof content !== "string" || !content.includes(".")) return;

    const normalizedPath = content.startsWith("/") ? content : `/${content}`;
    fetch(normalizedPath)
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(text => {
        let cleaned = text.trim();
        if (cleaned.startsWith("\"") && cleaned.endsWith("\"")) {
          cleaned = cleaned.slice(1, -1);
        }
        cleaned = cleaned
          .replace(/\\n/g, "\n")
          .split("\n")
          .map(line => line.trimStart())
          .join("\n");
        setNoteContent(cleaned);
      })
      .catch((err) => {
        console.error("❌ Failed to load markdown content:", err);
        setNoteContent("❌ Failed to load markdown");
      });
  }, [type, content]);

  const renderContent = () => {
    if (type === "markdown") {
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{noteContent}</ReactMarkdown>;
    } else if (type === "image") {
      return <img src={content} alt="Image" style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
    } else if (type === "pdf") {
      return <embed src={content} type="application/pdf" width="100%" height="100%" />;
    } else {
      return <p>Unsupported type</p>;
    }
  };
  console.log("📌 Rendering StickyNote", id, position, size);
  console.log("📐 Note", id, "→ Pos:", position, "Size:", size);
  const fallbackPosition = position ?? { x: 100, y: 100 };
  const fallbackSize = size ?? { width: 240, height: 180 };

  return (
    <Rnd
      position={fallbackPosition}
      size={fallbackSize}
      onDragStop={(e, d) => {
        onUpdate?.(id, {
          position: { x: d.x, y: d.y },
          size: fallbackSize  // keep size unchanged on drag
        });
      }}
      onResizeStop={(e, direction, ref, delta, newPos) => {
        const newSize = {
          width: ref.offsetWidth,
          height: ref.offsetHeight
        };
        onUpdate?.(id, {
          position: newPos,
          size: newSize
        });
      }}
      minWidth={40}
      minHeight={40}
      bounds="parent"
      style={{
        position: "absolute",
        zIndex: 20,
        background: "#ffffcc",
        border: "1px solid #ccc",
        boxShadow: "2px 2px 4px rgba(0,0,0,0.2)",
        padding: "4px",
        overflow: "hidden",
        pointerEvents: "auto"
      }}
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
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
          {type === "markdown"
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{noteContent}</ReactMarkdown>
            : <img src={content} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />}
        </div>
      </div>
    </Rnd>
  );
}
