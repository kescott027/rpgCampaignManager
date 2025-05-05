import React, { useState, useEffect } from 'react';
import TabViewer from './TabViewer';

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");

  useEffect(() => {
    if (!filePath || typeof filePath === "object") return;
    fetch(`/api/localstore/load-file?path=${encodeURIComponent(filePath)}`)
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

  const renderDriveListing = () => (
    <div>
      <h3>📂 Google Drive Folder</h3>
      <ul>
        {Array.isArray(filePath?.payload) && filePath.payload.map((item) => (
          <li key={item.id}>
            <button
              onClick={async () => {
                if (item.mimeType.includes("folder")) {
                  const res = await fetch(`/api/drive/list?folderId=${item.id}`);
                  const data = await res.json();
                  onFileSelect({ type: "drive-listing", payload: data.items });
                } else {
                  const res = await fetch(`/api/drive/file?id=${item.id}`);
                  const data = await res.json();
                  onFileSelect({ type: "drive-file", payload: data.content });
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

  let content;

  if (!filePath) {
    content = <div>No file selected</div>;
  } else if (filePath.type === "drive-listing") {
    content = renderDriveListing();
  } else if (filePath.type === "drive-file") {
    content = <pre>{filePath.payload}</pre>;
  } else {
    content = (
      <TabViewer activeTab={activeTab} onTabChange={setActiveTab} tabs={["Markdown", "JSON", "Images"]}>
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
              src={`/api/load-image?path=${encodeURIComponent(filePath)}`}
              alt="preview"
              style={{ maxWidth: "100%" }}
            />
          ) : (
            <p>[Not an image]</p>
          ),
        }[activeTab]}
      </TabViewer>
    );
  }

  return <div className="display-window">{content}</div>;
}
