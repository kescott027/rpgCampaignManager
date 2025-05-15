// DisplayWindow.js
import React, { useState, useEffect } from 'react';
import TabViewer from "./TabViewer";
import InitiativePanel from "./InitiativePanel";

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");
  const [showInitiative, setShowInitiative] = useState(false);
  const [initiativeDocked, setInitiativeDocked] = useState(false);
  const [initiativeTab, setInitiativeTab] = useState(false);
  const [initiativeState, setInitiativeState] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (filePath && typeof filePath === "object" && filePath.command === "/initiative") {
      setShowInitiative(true);
      setInitiativeDocked(false);
      setInitiativeTab(false);
      loadInitiativeState();
    }
  }, [filePath]);

  const loadInitiativeState = async () => {
    try {
      const res = await fetch("/api/session/initiative");
      const data = await res.json();

      if (Array.isArray(data.order) && data.order.length > 0) {
        setInitiativeState(
          data.order.every(e => typeof e === "object" && "name" in e)
            ? data.order
            : data.order.map(name => ({ name, initiative: "" }))
        );
      } else if (Array.isArray(data.characters)) {
        const cleaned = data.characters
          .filter(name => typeof name === "string")
          .map(name => ({ name: name.trim(), initiative: "" }));

        setInitiativeState(cleaned); // ✅ DO NOT re-map again
      }
    } catch (err) {
      console.error("Failed to load initiative state:", err);
    }
  };

  const persistInitiativeState = async (entries) => {
    try {
      await fetch("/api/session/initiative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: entries })
      });
    } catch (err) {
      console.error("Failed to save initiative state:", err);
    }
  };

  const handleStartCombat = async (entries) => {
    console.log("handleStartcombat launched");
    const sorted = [...entries]
      .map(e => ({ ...e, initiative: parseInt(e.initiative) || 0 }))
      .sort((a, b) => b.initiative - a.initiative);

    setInitiativeState(sorted);
    await persistInitiativeState(sorted);

    setCurrentIndex(0); // highlight first

    try {
      const res = await fetch("/api/session/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "/next" })
      });
      const data = await res.json();
      console.log("🎯 Combat started:", data.response);
    } catch (err) {
      console.error("❌ Failed to trigger scene change:", err);
    }
  };

  const handleNext = async () => {
    try {
      const res = await fetch("/api/session/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "/next" })
      });
      const data = await res.json();

      if (data?.current_index !== undefined) {
        setCurrentIndex(data.current_index);
      } else {
        // fallback: rotate list visually
        setCurrentIndex((prev) => (prev + 1) % initiativeState.length);
      }

    } catch (err) {
      console.error("❌ Failed to advance initiative:", err);
    }
  };

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
  };

  useEffect(() => {
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

  // 🛡️ Guard fallback
  if (!filePath && !showInitiative) {
    return <div className="display-window">No file selected</div>;
  }
  console.log("📊 initiativeState:", initiativeState);

  return (
    <div className="display-window" style={{ display: "flex", position: "relative" }}>
      {initiativeDocked && (
        <button
          className="initiative-dock-icon"
          title="Show Initiative Tracker"
          onClick={() => {
            setInitiativeDocked(false);
            setShowInitiative(true);
          }}
        >
          🎲
        </button>
      )}

      {showInitiative && !initiativeTab && (
        <div className="initiative-panel-wrapper">
          <div className="initiative-controls">
            <button title="Close Tracker" onClick={() => setShowInitiative(false)}>❌</button>
            <button title="Hide in Dock" onClick={() => {
              setShowInitiative(false);
              setInitiativeDocked(true);
            }}>👁️‍🗨️
            </button>
            <button title="View as Tab" onClick={() => {
              setShowInitiative(false);
              setInitiativeTab(true);
            }}>➡️
            </button>
          </div>
          <InitiativePanel
            characters={initiativeState}
            currentIndex={currentIndex}
            onStartCombat={handleStartCombat}
            onNext={handleNext}
            onUpdate={(entries) => {
              setInitiativeState(entries);
              persistInitiativeState(entries);
            }}
          />
        </div>
      )}

      {/* Main display window */}
      <div style={{ flex: 1 }}>
        {filePath?.type === "drive-listing" ? renderDriveListing() :
          filePath?.type === "drive-file" ? <pre>{filePath.payload}</pre> :
            <TabViewer
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                "Markdown",
                "JSON",
                "Images",
                ...(initiativeTab ? ["Initiative"] : []),
                "ChatGPT"
              ]}
              tabContent={{
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
                    alt="Preview"
                    style={{ maxWidth: "100%" }}
                  />
                ) : (
                  <p>[Not an image]</p>
                ),
                Initiative: initiativeTab && (
                  <InitiativePanel
                    characters={initiativeState}
                    currentIndex={currentIndex}
                    onStartCombat={handleStartCombat}
                    onNext={handleNext}
                    onUpdate={(entries) => {
                      setInitiativeState(entries);
                      persistInitiativeState(entries);
                    }}
                  />
                ),
                ChatGPT: (
                  <iframe
                    src="https://chat.openai.com/chat"
                    title="ChatGPT"
                    style={{ width: "100%", height: "75vh", border: "none" }}
                  />
                )
              }}
            />}
      </div>
    </div>
  );
}
