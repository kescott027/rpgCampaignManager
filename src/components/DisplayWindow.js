import React, { useState } from 'react';
import TabViewer from '../TabViewer';

export default function DisplayWindow() {
  const [activeTab, setActiveTab] = useState('Markdown');

  return (
    <div className="display-window">
      <TabViewer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={['Markdown', 'JSON', 'Images']}
      >
        {{
          Markdown: <pre>## Markdown preview here...</pre>,
          JSON: <pre>{JSON.stringify({ name: "Colby Jackson" }, null, 2)}</pre>,
          Images: <img src="https://via.placeholder.com/300" alt="preview" />
        }[activeTab]}
      </TabViewer>
    </div>
  );
}
