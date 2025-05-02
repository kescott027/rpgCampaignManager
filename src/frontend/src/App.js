import React, { useState } from 'react';
import Split from 'react-split';
import Sidebar from 'components/Sidebar';
import DisplayWindow from 'components/DisplayWindow';
import ChatSection from 'components/ChatSection';
import { detectFileTab } from 'utils/fileHelpers';
import './App.css';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialTab, setInitialTab] = useState('Markdown');

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setInitialTab(detectFileTab(filePath));

    // Determine tab based on extension
    const ext = filePath.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      setInitialTab('Images');
    } else if (ext === 'json') {
      setInitialTab('JSON');
    } else {
      setInitialTab('Markdown');
    }
  };


  return (
    <div className="app-container">
      <Sidebar onFileSelect={handleFileSelect} />
      <div className="split-wrapper">
        <Split
          direction="vertical"
          sizes={[60, 40]}
          minSize={200}
          style={{ height: '100%', width: '100%' }}
        >
          <DisplayWindow filePath={selectedFile} initialTab={initialTab} />
          <ChatSection />
        </Split>
      </div>
    </div>
  );
}
