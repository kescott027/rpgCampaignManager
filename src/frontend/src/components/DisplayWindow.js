import React, { useState, useEffect } from "react";
import PanelManager from "./PanelManager";
import TabbedContent from "./TabbedContent";
import DriveListing from "./DriveListing";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";

export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");

  const [initiativeTab, setInitiativeTab] = useState(false);
  const [charactersTab, setCharactersTab] = useState(false);

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

  if (!filePath && !initiativeTab && !charactersTab) {
    return <div className="display-window">No file selected</div>;
  }

  const showDrive = filePath?.type === "drive-listing";
  const showFile = filePath?.type === "drive-file";

  return (
    <div className="display-window" style={{ display: "flex", position: "relative" }}>
      <PanelManager
        filePath={filePath}
        onFileSelect={onFileSelect}
        setInitiativeTab={setInitiativeTab}
        setCharactersTab={setCharactersTab}
        renderInitiativePanel={(isTab, controls) => <InitiativePanel {...controls} />}
        renderCharacterPanel={(isTab, controls) => <CharacterPanel {...controls}
                                                                   onCommandRequest={(cmd) => onFileSelect(cmd)} />}
      />

      <div style={{ flex: 1 }}>
        {filePath?.type === "drive-listing" ? (
          <DriveListing filePath={filePath} onFileSelect={onFileSelect} />
        ) : filePath?.type === "drive-file" ? (
          <pre>{filePath.payload}</pre>
        ) : (
          <TabbedContent
            filePath={filePath}
            fileType={fileType}
            fileContent={fileContent}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            initiativeTab={initiativeTab}
            charactersTab={charactersTab}
          />
        )}
      </div>
    </div>
  );
}
