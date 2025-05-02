import React, { useState } from 'react';
import SplitPane from 'react-split-pane';
import Sidebar from './src/components/Sidebar';
import DisplayWindow from './components/DisplayWindow';
import ChatSection from './src/components/ChatSection';
import './App.css';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="app-container">
      <Sidebar onFileSelect={handleFileSelect} />
      <SplitPane split="horizontal" minSize={200} defaultSize="60%">
        <DisplayWindow filePath={selectedFile} />
        <ChatSection />
      </SplitPane>
    </div>
  );
}
