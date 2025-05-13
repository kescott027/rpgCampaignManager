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


  useEffect(() => {
    fetch("/manager_config.json")
      .then((res) => res.json())
      .then((config) => setDevMode(config["developer mode"] === true));
  }, []);

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setInitialTab(detectFileTab(filePath));
  };

  return (
    <div className="app-container">
      <Sidebar onFileSelect={handleFileSelect} />
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
          />
          <ChatSection filePath={selectedFile} sessionName="GM Session" devMode={devMode} />
        </Split>
      </div>
    </div>
  );
}
