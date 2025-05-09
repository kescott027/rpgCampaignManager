import React, { useState, useEffect } from "react";

export default function FileTree({ onFileSelect }) {
  const [pathStack, setPathStack] = useState(["root"]);
  const [contents, setContents] = useState([]);
  const currentFolderId = pathStack[pathStack.length - 1];

  useEffect(() => {
    const fetchContents = async () => {
      try {
        console.log("📁 Fetching folder ID:", currentFolderId);
        const res = await fetch(`/api/drive/list?folderId=${encodeURIComponent(currentFolderId)}`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();

        if (Array.isArray(data?.items)) {
          setContents(data.items);
        } else {
          console.warn("⚠️ Unexpected response format:", data);
          setContents([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch folder contents:", err);
        setContents([]);
      }
    };

    fetchContents();
  }, [currentFolderId]);

  const openFolder = (folderId) => {
    console.log("📂 Navigating to folder:", folderId);
    setPathStack((prev) => [...prev, folderId]);
  };

  const goUp = () => {
    if (pathStack.length > 1) {
      setPathStack((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="file-tree">
      <button onClick={goUp} style={{ marginBottom: "6px" }}>⬆️ Up</button>
      <ul style={{ paddingLeft: "0px", listStyle: "none" }}>
        {contents.map((item) => (
          <li key={item.id} style={{ marginBottom: "4px" }}>
            {item.mimeType?.includes("folder") ? (
              <button onClick={() => openFolder(item.id)} style={{ all: "unset", cursor: "pointer" }}>
                📁 {item.name}
              </button>
            ) : (
              <button
                onClick={() => onFileSelect({ type: "drive-file", payload: item.id })}
                style={{ all: "unset", cursor: "pointer" }}
              >
                📄 {item.name}
              </button>
            )}
          </li>
        ))}
        {contents.length === 0 && (
          <li style={{ color: "#888", fontStyle: "italic" }}>No files found in this folder.</li>
        )}
      </ul>
    </div>
  );
}
