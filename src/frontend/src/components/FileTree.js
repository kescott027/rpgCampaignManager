import React, { useState, useEffect } from "react";

export default function FileTree({ onFileSelect }) {
  const [pathStack, setPathStack] = useState(["root"]);
  const [contents, setContents] = useState([]);

  const currentFolderId = pathStack[pathStack.length - 1];

  useEffect(() => {
    const fetchContents = async () => {
      try {
        // console.log("📁 Opening Drive item:", item.name, item.id);
        console.log("folder Id: ", encodeURIComponent(currentFolderId));
        const res = await fetch(`/api/drive/list?folderId=${encodeURIComponent(currentFolderId)}`, {
          method: "GET",
          credentials: "include"
        });
        const data = await res.json();

        if (data?.items) {
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
    console.log("📁 Opening Drive item:", { folderId });
    setPathStack((prev) => [...prev, folderId]);
  };

  const goUp = () => {
    if (pathStack.length > 1) {
      setPathStack((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="file-tree">
      <button onClick={goUp}>⬆️ Up</button>
      <ul>
        {contents.map((item) => (
          <li key={item.id}>
            {item.mimeType?.includes("folder") ? (
              <span onClick={() => openFolder(item.id)}>📁 {item.name}</span>
            ) : (
              <span onClick={() => onFileSelect({ type: "drive-file", payload: item.id })}>
                📄 {item.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
