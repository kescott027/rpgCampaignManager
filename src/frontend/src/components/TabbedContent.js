import React from "react";
import TabViewer from "./TabViewer";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
import ReactMarkdown from "react-markdown";

export default function TabbedContent({
                                        activeTab,
                                        setActiveTab,
                                        initiativeTab,
                                        charactersTab,
                                        sceneTabs = [],
                                        setSceneTabs,
                                        currentScene,
                                        setCurrentScene
                                      }) {

  /**
   const baseTabs = [
   ...(initiativeTab ? ["Initiative"] : []),
   ...(charactersTab ? ["Characters"] : []),
   "Archives"
   ];

   // Define all your dynamic tabs in one list
   const tabLabels = [
   ...sceneTabs.map(s => s.label),
   ...(initiativeTab ? ["Initiative"] : []),
   ...(charactersTab ? ["Characters"] : []),
   "Archives"
   ];
   **/

    // const allTabs = [...sceneTabs.map(t => t.label), ...baseTabs];

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

  // Add control panels and archive
  if (initiativeTab) {
    tabContent["Initiative"] = (
      <InitiativePanel
        onClose={() => setActiveTab(sceneTabs[0]?.label || "Archives")}
        onHide={() => {
        }}
        onTabView={() => {
        }}
      />
    );
  }

  // Add Character Panel
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

  const tabLabels = Object.keys(tabContent);

  return (
    <div>
      <TabViewer
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (sceneTabs.some(s => s.label === tab)) {
            setCurrentScene(tab);
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
