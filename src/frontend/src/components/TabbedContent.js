import React from "react";
import TabViewer from "./TabViewer";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
import { startCombat } from "../handlers/startCombatHandler";
import { advanceTurn, reverseTurn } from "../handlers/turnHandlers";
import ReactMarkdown from "react-markdown";


export default function TabbedContent({
                                        activeTab,
                                        setActiveTab,
                                        initiativeTab,
                                        charactersTab,
                                        sceneTabs = [],
                                        setSceneTabs,
                                        setCurrentScene,
                                        newSceneName,
                                        setNewSceneName,
                                        clearStickyNotes
                                      }) {

  const tabContent = {};

  // Add scene tabs
  sceneTabs.forEach(({ label, content, fileType }) => {
    tabContent[label] = (
      <>
        {fileType === "image" ? (
          <img src={content} alt="Scene" style={{ maxWidth: "100%" }} />
        ) : fileType === "markdown" || fileType === "text" ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <p>[Scene tab has no valid content]</p>
        )}
      </>
    );
  });

  if (initiativeTab) {
    tabContent["Initiative"] = (
      <InitiativePanel
        onClose={() => setActiveTab(sceneTabs[0]?.label || "Archives")}
        onStartCombat={async (entries) => {
          const reloaded = await startCombat(entries);
        }}
        onHide={() => {
        }}
        onTabView={() => {
        }}
        onNext={async () => {
          const res = await fetch("/api/combat/combat-queue");
          const queue = (await res.json()).queue;
          await advanceTurn(queue, 0); // or use state
        }}
        onPrevious={async () => {
          const res = await fetch("/api/combat/combat-queue");
          const queue = (await res.json()).queue;
          await reverseTurn(queue, 0);
        }}
      />
    );
  }

  if (charactersTab) {
    tabContent["Characters"] = (
      <CharacterPanel
        onClose={() => setActiveTab(sceneTabs[0]?.label || "Archives")}
        onHide={() => {
        }}
        onTabView={() => {
        }}
      />
    );
  }

  // Add Archives tab
  tabContent["Archives"] = (
    <iframe
      src="https://2e.aonprd.com/Creatures.aspx"
      title="Archives of Nethys"
      style={{ width: "100%", height: "75vh", border: "none" }}
    />
  );

  tabContent["Scenes"] = (
    <div style={{ padding: "10px" }}>
      <h3>Manage Scenes</h3>
      <input
        type="text"
        placeholder="New Scene Name"
        value={newSceneName}
        onChange={(e) => setNewSceneName(e.target.value)}
        style={{ marginRight: "8px" }}
      />
      <button
        onClick={() => {
          if (!newSceneName.trim()) return;
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
  );

  const tabLabels = ["Scenes", ...Object.keys(tabContent).filter(tab => tab !== "Scenes")];

  return (
    <div>
      <TabViewer
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (sceneTabs.some(s => s.label === tab)) {
            setCurrentScene(tab);
          } else {
            setCurrentScene(null);
          }
        }}
        onTabSelected={(tab) => {
          if (tab === "Archives" || tab === "Scenes") {
            clearStickyNotes();
          }
        }}
        tabs={tabLabels}
        tabContent={tabContent}
      />

      {/* Scene tab delete button (optional) */}
      {sceneTabs.some(s => s.label === activeTab) && (
        <div style={{ marginTop: "8px" }}>
          <button
            onClick={() => {
              setSceneTabs(tabs => tabs.filter(s => s.label !== activeTab));
              setActiveTab("Archives");
              setCurrentScene("Archives");
            }}
          >
            🗑️ Delete Scene Tab
          </button>
        </div>
      )}
    </div>
  );
}
