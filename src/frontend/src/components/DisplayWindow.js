
jsx
Copy
Edit
import React, { useState, useEffect } from 'react';
import TabViewer from './TabViewer';

export default function DisplayWindow({ filePath }) {
  const [activeTab, setActiveTab] = useState('Markdown');
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState('text');

  useEffect(() => {
    if (!filePath) return;

    fetch(`/api/load-file?path=${encodeURIComponent(filePath)}`)
      .then((res) => res.json())
      .then((data) => {
        setFileContent(data.content || '');
        setFileType(data.type || 'text');
      })
      .catch((err) => {
        console.error("Error loading file:", err);
        setFileContent(`[Error loading file]`);
      });
  }, [filePath]);

  return (
    <div className="display-window">
      <TabViewer
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={['Markdown', 'JSON', 'Images']}
      >
        {{
          Markdown: (
            <pre>
              {fileType === 'text' ? fileContent : '[Non-text file]'}
            </pre>
          ),
          JSON: (
            <pre>
              {fileType === 'json'
                ? JSON.stringify(JSON.parse(fileContent), null, 2)
                : '[Not JSON]'}
            </pre>
          ),
          Images: fileType === 'image' ? (
            <img
              src={`/api/load-image?path=${encodeURIComponent(filePath)}`}
              alt="preview"
              style={{ maxWidth: '100%' }}
            />
          ) : (
            <p>[Not an image]</p>
          ),
        }[activeTab]}
      </TabViewer>
    </div>
  );
}
