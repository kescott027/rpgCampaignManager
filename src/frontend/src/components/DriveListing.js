import React from "react";

export default function DriveListing({ filePath, onFileSelect }) {
  const items = Array.isArray(filePath?.payload) ? filePath.payload : [];

  if (!Array.isArray(filePath?.payload)) {
    return <div className="display-window">📛 Invalid Drive Listing Format</div>;
  }

  return (
    <div>
      <h3>📂 Google Drive Folder</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={async () => {
                try {
                  const isFolder = item.mimeType?.includes("folder") ?? true;
                  const url = isFolder
                    ? `/api/drive/list?folderId=${item.id}`
                    : `/api/drive/file?id=${item.id}`;

                  const res = await fetch(url, { method: "GET", credentials: "include" });
                  const data = await res.json();

                  if (isFolder) {
                    onFileSelect({ type: "drive-listing", payload: data.items });
                  } else {
                    onFileSelect({ type: "drive-file", payload: data.content });
                  }
                } catch (err) {
                  console.error("❌ Error loading Google Drive item:", err);
                }
              }}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
