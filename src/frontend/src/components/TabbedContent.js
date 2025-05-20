import React from "react";
import TabViewer from "./TabViewer";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";

export default function TabbedContent({
                                        filePath,
                                        fileType,
                                        fileContent,
                                        activeTab,
                                        setActiveTab,
                                        initiativeTab,
                                        charactersTab
                                      }) {
  return (
    <TabViewer
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={[
        "Markdown",
        "JSON",
        "Images",
        ...(initiativeTab ? ["Initiative"] : []),
        ...(charactersTab ? ["Characters"] : []),
        "ChatGPT"
      ]}
      tabContent={{
        Markdown: <pre>{fileType === "text" || fileType === "markdown" ? fileContent : "[Not a Markdown file]"}</pre>,

        JSON: <pre>{fileType === "json" ? JSON.stringify(JSON.parse(fileContent), null, 2) : "[Not JSON]"}</pre>,

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
            onClose={() => setActiveTab("Markdown")}
            onHide={() => {
            }}
            onTabView={() => {
            }}
          />
        ),

        Characters: charactersTab && (
          <CharacterPanel
            onClose={() => setActiveTab("Markdown")}
            onHide={() => {
            }}
            onTabView={() => {
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
    />
  );
}
