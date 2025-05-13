import React, { useState, useEffect } from 'react';
import TabViewer from './TabViewer';

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");

  // 🗂️ Google Drive Listing Renderer
  const renderDriveListing = () => {
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
                      ? `/api/drive/listid?folderId=${item.id}`
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
  };

  // 📁 Local file loader
  useEffect(() => {
    // Only run for string-based local file paths
    if (!filePath || typeof filePath !== "string") return;

    fetch(`/api/localstore/load-file?path=${encodeURIComponent(filePath)}`, {
      method: "GET",
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setFileContent(data.content || "");
        setFileType(data.type || "text");
      })
      .catch((err) => {
        console.error("Error loading file:", err);
        setFileContent("[Error loading file]");
      });
  }, [filePath]);

  // 🛑 Null check
  if (!filePath) return <div className="display-window">No file selected</div>;

  // 📂 Drive listing handler
  if (filePath.type === "drive-listing") {
    return <div className="display-window">{renderDriveListing()}</div>;
  }

  // 📄 Drive file preview
  if (filePath.type === "drive-file") {
    return (
      <div className="display-window">
        <pre>{filePath.payload}</pre>
      </div>
    );
  }

  // 🧾 Default file viewer with TabViewer
  return (
    <div className="display-window">
      <TabViewer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={["Markdown", "JSON", "Images"]}
      >
        {{
          Markdown: (
            <pre>
              {fileType === "text" || fileType === "markdown"
                ? fileContent
                : "[Not a Markdown file]"}
            </pre>
          ),
          JSON: (
            <pre>
              {fileType === "json"
                ? JSON.stringify(JSON.parse(fileContent), null, 2)
                : "[Not JSON]"}
            </pre>
          ),
          Images: fileType === "image" ? (
            <img
              src={`/api/localstore/load-image?path=${encodeURIComponent(filePath)}`}
              alt={`Image preview: ${filePath}`}
              style={{ maxWidth: "100%" }}
            />
          ) : (
            <p>[Not an image]</p>
          )
        }[activeTab]}
      </TabViewer>
    </div>
  );
}
