import React, { useState, useEffect } from 'react';
import TabViewer from './TabViewer';

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");

  const renderDriveListing = () => {
    const items = Array.isArray(filePath?.payload) ? filePath.payload : [];

    return (
      <div>
        <h3>📂 Google Drive Folder</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={async () => {
                  try {
                    if (item.mimeType.includes("folder")) {
                      //const res = await fetch(`/api/drive/list?folderId=${item.id}`); was ='root'
                      const res = await fetch(`/api/drive/list?folderId==${item.id}`, {
                        method: "GET",
                        credentials: "include" // This sends the session_id cookie
                      });
                      const data = await res.json();
                      onFileSelect({ type: "drive-listing", payload: data.items });
                    } else {
                      const res = await fetch(`/api/drive/file?id=${item.id}`, {
                        method: "GET",
                        credentials: "include" // This sends the session_id cookie
                      });
                      const data = await res.json();
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

  useEffect(() => {
    if (!filePath || typeof filePath === "object") return;

    fetch(`/api/localstore/load-file?path=${encodeURIComponent(filePath)}`, {
      method: "GET",
      credentials: "include" // This sends the session_id cookie
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

  if (!filePath) return <div className="display-window">No file selected</div>;
  if (filePath.type === "drive-listing") return <div className="display-window">{renderDriveListing()}</div>;
  if (filePath.type === "drive-file") return <div className="display-window">
    <pre>{filePath.payload}</pre>
  </div>;

  return (
    <div className="display-window">
      <TabViewer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={["Markdown", "JSON", "Images"]}
      >
        {{
          Markdown: <pre>{fileType === "text" ? fileContent : "[Non-text file]"}</pre>,
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
              alt="preview"
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
