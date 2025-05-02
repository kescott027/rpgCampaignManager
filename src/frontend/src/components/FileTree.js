import React, { useState, useEffect } from "react";

export default function FileTree({ onFileSelect }) {
  const [pathStack, setPathStack] = useState(["assets/my_campaigns"]);
  const [contents, setContents] = useState([]);

  const currentPath = pathStack[pathStack.length - 1];

  useEffect(() => {
    fetch(`/api/list-dir?path=${encodeURIComponent(currentPath)}`)
      .then(res => res.json())
      .then(data => setContents(data.items || []));
  }, [currentPath]);

  const openFolder = (folderName) => {
    setPathStack([...pathStack, `${currentPath}/${folderName}`]);
  };

  const goUp = () => {
    if (pathStack.length > 1) setPathStack(pathStack.slice(0, -1));
  };

  return (
    <div className="file-tree">
      <button onClick={goUp}>⬆️ Up</button>
      <ul>
        {contents.map((item) => (
          <li key={item.name}>
            {item.type === "directory" ? (
              <span onClick={() => openFolder(item.name)}>📁 {item.name}</span>
            ) : (
              <span onClick={() => onFileSelect(`${currentPath}/${item.name}`)}>
                📄 {item.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
