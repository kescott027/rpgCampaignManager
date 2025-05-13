export default function TabViewer({ activeTab, onTabChange, tabs = ["Markdown", "JSON", "Images"], children }) {
  return (
    <div className="p-4">
      <div className="flex mb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`px-3 py-1 rounded border
                        ${tab === activeTab ? "bg-gray-800 text-white font-bold" : "bg-gray-200 text-black"}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
}
