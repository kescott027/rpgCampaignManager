import React, { useState } from "react";

export default function ChatSection({
                                      sessionName = "Untitled Session",
                                      filePath = null,
                                      devMode = false
                                    }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [showDevTools, setShowDevTools] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (devMode) {
      setMessages((prev) => [
        ...prev,
        { role: "debug", text: `📤 Sending prompt: ${input}` }
      ]);
    }

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/gpt/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, session: sessionName })
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response:\n${text}`);
      }

      const data = await res.json();
      const gptMessage = { role: "gpt", text: data.response };
      setMessages((prev) => [...prev, gptMessage]);
    } catch (err) {
      console.error("❌ Error connecting to GPT:", err);
      setMessages((prev) => [
        ...prev,
        { role: "gpt", text: "❌ Error connecting to GPT: " + err }
      ]);
    }

    setInput("");
  };

  const downloadMarkdown = async () => {
    if (!filePath) return;
    const res = await fetch(
      `/api/gpt/export-chatlog?path=${encodeURIComponent(filePath.path)}`
    );
    const data = await res.json();
    const blob = new Blob([data.markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = data.filename.replace(".json", ".md");
    link.click();
  };

  const devToggleButton = (
    <div
      style={{
        position: "absolute",
        top: "-12px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        width: "24px",
        height: "12px",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        cursor: "pointer",
        zIndex: 10
      }}
      title="Toggle Dev Tools"
      onClick={() => setShowDevTools((prev) => !prev)}
    />
  );

  const devToolbox =
    devMode &&
    showDevTools && (
      <div
        className="dev-toolbox"
        style={{
          background: "#222",
          color: "#eee",
          padding: "10px",
          marginBottom: "5px",
          borderTop: "2px solid #555"
        }}
      >
        <strong>🧪 Dev Toolbox</strong>
        <button onClick={downloadMarkdown}>⬇ Export Markdown</button>
      </div>
    );

  return (
    <div className="chat-section-wrapper" style={{ position: "relative" }}>
      {devMode && devToggleButton}
      {devToolbox}
      <div className="chat-section">
        <div className="chat-tools">
          <button onClick={downloadMarkdown}>
            ⬇️ Export Chatlog as Markdown
          </button>
        </div>
        <div className="chat-log">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <textarea
            placeholder="Type a command or message..."
            rows="2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
