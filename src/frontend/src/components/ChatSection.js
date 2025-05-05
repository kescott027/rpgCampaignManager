import React, { useState } from "react";

export default function ChatSection({ sessionName = "Untitled Session", filePath = null }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    console.log("📤 Sending user input:", input);

    try {
      const res = await fetch("/api/gpt/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, session: sessionName })
      });

      console.log("📥 Raw response:", res);
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Unexpected response:\n${text}`);
      }

      const data = await res.json();
      console.log("✅ GPT response received:", data);
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
    const res = await fetch(`/api/gpt/export-chatlog?path=${encodeURIComponent(filePath.path)}`);
    const data = await res.json();
    const blob = new Blob([data.markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = data.filename.replace(".json", ".md");
    link.click();
  };

  return (
    <div className="chat-section">
      <div className="chat-log">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
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
  );
}
