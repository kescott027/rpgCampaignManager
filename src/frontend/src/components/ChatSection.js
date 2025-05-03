import React, { useState } from "react";
import { useStartupMessages } from "hooks/useStartupMessages";
import { parseUiCommands } from "../utils/parseUiCommands";
import SecurityConfigModal from "./SecurityConfigModal";
import { handleUiCommands } from "../utils/handleUiCommands";

export default function ChatSection() {
  const [sessionName, setSessionName] = useState("Untitled Session");
  const [input, setInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { messages, setMessages } = useStartupMessages(sessionName);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === "configure security") {
      setShowModal(true);
      setInput("");
      return;
    }

    const userMsg = { role: "user", text: trimmed };

    setMessages((prev) => [...prev, userMsg]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          session_name: sessionName,
          tags: [] // add future support for tags
        })
      });

      const data = await res.json();

      // parse commands and clean GPT text
      const { cleanedText, actions } = parseUiCommands(data.response);

      // Handle UI actions
      handleUiCommands(actions, {
        setSessionName,
        setRenameNotice
        // Add more here in the future
      });

      const botMsg = { role: "gpt", text: cleanedText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
    }

    setInput("");
  };

  const [renameNotice, setRenameNotice] = useState("");

  const promptSessionRename = () => {
    const newName = window.prompt("Enter new session name:", sessionName);
    if (newName) {
      setSessionName(newName);
      setRenameNotice(`Session renamed to "${newName}"`);
      setTimeout(() => setRenameNotice(""), 3000);
    }
  };

  return (
    <div className="chat-section">
      <div
        className="chat-header"
        onClick={promptSessionRename}
        style={{
          textAlign: "center",
          fontWeight: "bold",
          padding: "0.5em",
          backgroundColor: "#f9f9f9",
          borderBottom: "1px solid #ccc",
          cursor: "pointer"
        }}
      >
        {sessionName}
      </div>

      <div className="chat-log">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-msg ${m.role}`}>{m.text}</div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          rows="2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a command or message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      {renameNotice && (
        <div
          className="session-notice"
          style={{
            textAlign: "center",
            fontSize: "0.9",
            color: "#155724",
            backgroundColor: "#d4edda",
            padding: "0.4em",
            marginBottom: "0.5em",
            borderBottom: "1px solid #b2dfdb"
          }}
        >
          ✅ {renameNotice}
        </div>
      )}
      <div>
        {/* Render security modal if needed */}
        {showModal && <SecurityConfigModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}
