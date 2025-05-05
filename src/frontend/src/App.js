import React, { useState } from "react";
import Split from "react-split";
import Sidebar from "components/Sidebar";
import DisplayWindow from "components/DisplayWindow";
import ChatSection from "components/ChatSection";
import { detectFileTab } from "utils/detectFileTab";
// import { detectInitialTab } from './utils/detectInitialTab';
import "./App.css";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialTab, setInitialTab] = useState("Markdown");

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setInitialTab(detectFileTab(filePath));

    // Determine tab based on extension
    const tab = detectFileTab(filePath);
    setInitialTab(tab);
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
          <DisplayWindow filePath={selectedFile}
                         initialTab={initialTab}
                         onFileSelect={handleFileSelect}
          />
          <ChatSection />
        </Split>
      </div>
    </div>
  );
}
