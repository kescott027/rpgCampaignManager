import React, { useState, useEffect } from "react";
import PanelManager from "./PanelManager";
import TabbedContent from "./TabbedContent";
import DriveListing from "./DriveListing";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
import StickyNote from "./StickyNote";
import { debounce } from "../utils/debounce";
import { saveStickyNotes, handleRenameLayout, handleDeleteLayout } from "../utils/stickyNoteSync";
import ManageLayoutsPanel from "./ManageLayoutsPanel";
import { get, post } from "../utils/api";

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {

  const [initiativeTab, setInitiativeTab] = useState(false);
  const [charactersTab, setCharactersTab] = useState(false);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [currentLayout, setCurrentLayout] = useState("default");
  const [layoutNames, setLayoutNames] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("");
  const debouncedSaveStickyNotes = debounce((layoutName, notes) => {
    saveStickyNotes(layoutName, notes);
  }, 300);
  const [tabs, setTabs] = useState([{ key: "archives", label: "Archives" }]);
  const [activeTab, setActiveTab] = useState("archives");
  const [sceneTabs, setSceneTabs] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);
  const [newSceneName, setNewSceneName] = useState("");
  const addSceneTab = (sceneName) => {
    const tabKey = `scene:${sceneName}`;
    if (!tabs.find(t => t.key === tabKey)) {
      setTabs([...tabs, { key: tabKey, label: sceneName }]);
    }
    setActiveTab(tabKey);
    loadSceneLayout(sceneName);
  };

  const user_space = "local";
  const campaign = "sandbox";

  const loadSceneLayout = async (sceneName) => {
    try {
      const layoutName = `scene:${sceneName}`;
      const data = await get(`/api/display/layout?name=${encodeURIComponent(layoutName)}&user_space=local&campaign=sandbox`);
      if (Array.isArray(data.notes)) {
        setStickyNotes(data.notes);
        setCurrentLayout(layoutName);
      }
    } catch (err) {
      console.error("❌ Failed to load scene layout:", err);
    }
  };

  useEffect(() => {
    if (!currentScene) return;

    const layoutName = `scene:${currentScene}`;

    get(`/api/display/layout?name=${encodeURIComponent(layoutName)}&user_space=local&campaign=sandbox`)
      .then(data => {
        if (Array.isArray(data.notes)) {
          setStickyNotes(data.notes);
          setCurrentLayout(layoutName);
          console.log(`✅ Loaded layout for ${layoutName}`);
        }
      })
      .catch(err => {
        console.warn("⚠️ No layout for scene, starting fresh.");
        setStickyNotes([]);
        setCurrentLayout(layoutName);
      });
  }, [currentScene]);

  const fetchLayouts = async () => {
    try {
      const data = await get("/api/display/layout/list");
      setLayoutNames(Array.isArray(data.layouts) ? data.layouts : []);
    } catch (err) {
      console.error("❌ Failed to fetch layout names:", err);
    }
  };


  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleSaveLayout = async () => {
    const name = prompt("Enter a name for this layout:");
    if (!name) return;

    try {
      const payload = {
        name: name,
        notes: stickyNotes,
        user_space: user_space,
        campaign: campaign
      };
      const res = await post("/api/display/sticky-notes", payload);
      const namesData = await get("/api/display/layout/list");
      setLayoutNames(namesData.layouts || []);

      const result = await res.json();
      console.log("✅ Layout saved:", result);
      setLayoutNames(namesData.layouts || []);

    } catch (err) {
      console.error("❌ Failed to save layout:", err);
    }
  };

  const handleLoadLayout = async () => {
    const name = prompt("Enter layout name to load:");
    if (!name) return;

    try {
      const data = get(`/api/display/layout?name=${encodeURIComponent(name)}&user_space=${encodeURIComponent(user_space)}&campaign=${encodeURIComponent(campaign)}`);

      if (Array.isArray(data.notes)) {
        setStickyNotes(data.notes.map(note => ({
          ...note,
          size: note.size ?? { width: 240, height: 180 }
        })));
        setCurrentLayout(name);  // ✅ Store loaded layout for future saves
        console.log("✅ Layout loaded");
      } else {
        alert("⚠️ Layout not found.");
      }
    } catch (err) {
      console.error("❌ Failed to load layout:", err);
    }
  };

  useEffect(() => {
    const saveStickyNotes = async () => {
      try {
        const payload = {
          name: currentLayout,
          notes: stickyNotes
        };
        await post("/api/display/sticky-notes", payload);
      } catch (err) {
        console.error("Failed to save sticky notes:", err);
      }
    };

    window.addEventListener("beforeunload", saveStickyNotes);
    return () => window.removeEventListener("beforeunload", saveStickyNotes);
  }, [stickyNotes]);


  const handleDrop = async (e) => {
    e.preventDefault();
    console.log("📦 Files dropped:", e.dataTransfer.files);

    const files = Array.from(e.dataTransfer.files);

    try {
      for (const file of files) {
        const type = file.type;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("layout", currentLayout || "default");
        formData.append("user_space", user_space || "local");
        formData.append("campaign", campaign || "sandbox");
        formData.append("type", file.type);

//        const response = await post("/api/display/sticky-assets", formData);
//        const uploadData = await response.json();  // <-- required
//        const assetPath = uploadData.asset_path;

        const uploadData = await post("/api/display/sticky-assets", formData);
        console.log("✅ Parsed uploadData:", uploadData);
        const assetPath = uploadData.asset_path;
        console.log("✅ asset path:", assetPath);
        const reader = new FileReader();

        reader.onload = () => {
          const id = Date.now();
          const note = {
            id,
            type: type.startsWith("image") ? "image" : "markdown",
            content: assetPath,
            position: {
              x: e.clientX - 50,
              y: e.clientY - 50
            },
            size: { width: 240, height: 180 }
          };
          console.log("🧷 New sticky note data:", note);
          setStickyNotes(prev => {
            const updated = [...prev, note];
            saveStickyNotes(currentLayout, updated);
            console.log("Sticky note created:", note);
            return updated;
          });
        };

        if (type.startsWith("image")) {
          reader.readAsDataURL(file);  // Just to trigger reader.onload
        } else if (type === "text/markdown" || type === "text/plain") {
          reader.readAsText(file);
        }
      }

    } catch (err) {
      console.error("❌ Error handling dropped file:", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="display-window" style={{ display: "flex", position: "relative", overflow: "visible" }}
         onDrop={handleDrop}
         onDragOver={handleDragOver}
    >
      <PanelManager
        filePath={filePath}
        onFileSelect={onFileSelect}
        setInitiativeTab={setInitiativeTab}
        setCharactersTab={setCharactersTab}
        renderInitiativePanel={(isTab, controls) => <InitiativePanel {...controls} />}
        renderCharacterPanel={(isTab, controls) => <CharacterPanel {...controls}
                                                                   onCommandRequest={(cmd) => onFileSelect(cmd)} />}
      />
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="New Scene Name"
          value={newSceneName}
          onChange={(e) => setNewSceneName(e.target.value)}
        />
        <button
          onClick={() => {
            if (!newSceneName) return;
            const scene = { label: newSceneName, content: "", fileType: "markdown" };
            setSceneTabs((prev) => [...prev, scene]);
            setActiveTab(newSceneName);
            setCurrentScene(newSceneName);
            setNewSceneName("");
          }}
        >
          ➕ Add Scene
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {filePath?.type === "drive-listing" ? (
          <DriveListing filePath={filePath} onFileSelect={onFileSelect} />
        ) : filePath?.type === "drive-file" ? (
          <pre>{filePath.payload}</pre>
        ) : (
          <TabbedContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            initiativeTab={initiativeTab}
            charactersTab={charactersTab}
            sceneTabs={sceneTabs}
            setSceneTabs={setSceneTabs}
            currentScene={currentScene}
            setCurrentScene={setCurrentScene}
          />
        )}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
          <select
            value={selectedLayout}
            onChange={async (e) => {
              const layout_name = e.target.value;
              setSelectedLayout(layout_name);
              if (layout_name) {
                try {
                  const data = await get(`/api/display/layout?name=${encodeURIComponent(layout_name)}&user_space=${encodeURIComponent(user_space)}&campaign=${encodeURIComponent(campaign)}`);
                  if (Array.isArray(data.notes)) {
                    setStickyNotes(data.notes);
                    setCurrentLayout(layout_name);
                    console.log("✅ Layout loaded:", layout_name);
                  }
                } catch (err) {
                  console.error("❌ Failed to load layout:", err);
                }
              }
            }}
          >
            <option value="">-- Load Layout --</option>
            {layoutNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button onClick={handleSaveLayout}>💾 Save Layout</button>
          <button onClick={() => setShowLayoutManager(true)}>
            🛠️ Manage Layouts
          </button>
        </div>

      </div>

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {Array.isArray(stickyNotes) && stickyNotes.map(note => (
          <StickyNote
            key={note.id}
            id={note.id}
            type={note.type}
            content={note.content}
            position={note.position}
            size={note.size}
            onClose={(id) =>
              setStickyNotes(notes => notes.filter(n => n.id !== id))
            }
            onUpdate={(id, updates) => {
              setStickyNotes(prev => {
                const updated = prev.map(note =>
                  note.id === id ? { ...note, ...updates } : note
                );
                debouncedSaveStickyNotes(currentLayout, updated);
                return updated;
              });
            }}
          />
        ))}
      </div>
      {showLayoutManager && (
        <ManageLayoutsPanel
          onClose={() => setShowLayoutManager(false)}
          onRename={handleRenameLayout}
          onDelete={handleDeleteLayout}
          user_space={user_space}
          campaign={campaign}
          fetchLayouts={fetchLayouts}
        />
      )}
    </div>
  );
}
