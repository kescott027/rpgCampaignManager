import React from 'react';
import SplitPane from 'react-split-pane';
import Sidebar from './components/Sidebar';
import DisplayWindow from './components/DisplayWindow';
import ChatSection from './components/ChatSection';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <SplitPane split="horizontal" minSize={200} defaultSize="60%">
        <DisplayWindow />
        <ChatSection />
      </SplitPane>
    </div>
  );
}
