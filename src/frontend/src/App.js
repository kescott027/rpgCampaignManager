import React, { useState, useEffect } from "react";
import Split from "react-split";
import Sidebar from "components/Sidebar";
import DisplayWindow from "components/DisplayWindow";
import ChatSection from "components/ChatSection";
import { detectFileTab } from "utils/detectFileTab";
import "./App.css";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialTab, setInitialTab] = useState("Markdown");
  const [devMode, setDevMode] = useState(false);
  // const debug = require ('debug')('my_module')

  const [showSidebar, setShowSidebar] = useState(true);


  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((config) => setDevMode(config["developer mode"] === true));
  }, []);

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setInitialTab(detectFileTab(filePath));
  };

  return (
    <div className="app-container">
      {showSidebar && <Sidebar onFileSelect={handleFileSelect} />}
      {/* Sidebar Toggle Button — Always Visible */}
      <button
        onClick={() => setShowSidebar(prev => !prev)}
        title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
        style={{
          position: "absolute",
          left: showSidebar ? 260 : 0,
          top: 10,
          zIndex: 1000,
          background: "#444",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: showSidebar ? "0 4px 4px 0" : "4px",
          cursor: "pointer",
          opacity: 0.8
          // pointerEvents: "none"
        }}
      >
        {showSidebar ? "⏴" : "⏵"}
      </button>
      <div className="split-wrapper">
        <Split
          direction="vertical"
          sizes={[60, 40]}
          minSize={200}
          style={{ height: "100%", width: "100%" }}
        >
          <DisplayWindow
            filePath={selectedFile}
            initialTab={initialTab}
            onFileSelect={handleFileSelect}
            /**style={[
              zIndex: 1
            ]}**/
          />
          <ChatSection
            filePath={selectedFile}
            sessionName="GM Session"
            devMode={devMode}
            onFileSelect={handleFileSelect}
          />
        </Split>
      </div>
    </div>
  );
}
