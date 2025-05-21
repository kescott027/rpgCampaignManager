import React, { useState, useEffect } from "react";
import PanelManager from "./PanelManager";
import TabbedContent from "./TabbedContent";
import DriveListing from "./DriveListing";
import InitiativePanel from "./InitiativePanel";
import CharacterPanel from "./CharacterPanel";
import StickyNote from "./StickyNote";


export default function DisplayWindow({ filePath, initialTab = "Markdown", onFileSelect }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fileContent, setFileContent] = useState("");
  const [fileType, setFileType] = useState("text");

  const [initiativeTab, setInitiativeTab] = useState(false);
  const [charactersTab, setCharactersTab] = useState(false);
  const [stickyNotes, setStickyNotes] = useState([]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      const type = file.type;
      const reader = new FileReader();

      reader.onload = () => {
        const id = Date.now();
        const note = {
          id,
          type: type.startsWith("image") ? "image" : "markdown",
          content: reader.result,
          position: {
            top: e.clientY - 50,
            left: e.clientX - 50
          }
        };
        setStickyNotes(prev => [...prev, note]);
      };

      if (type.startsWith("image")) {
        reader.readAsDataURL(file);
      } else if (type === "text/markdown" || "text/plain") {
        reader.readAsText(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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

  if (!filePath && !initiativeTab && !charactersTab) {
    return <div className="display-window">No file selected</div>;
  }

  const showDrive = filePath?.type === "drive-listing";
  const showFile = filePath?.type === "drive-file";

  return (
    <div className="display-window" style={{ display: "flex", position: "relative" }}
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
      {stickyNotes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          type={note.type}
          content={note.content}
          position={note.position}
          onClose={(id) => setStickyNotes(notes => notes.filter(n => n.id !== id))}
        />
      ))}
    </div>
  );
}
