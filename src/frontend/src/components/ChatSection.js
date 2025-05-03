import React, { useEffect, useState } from "react";
import { parseUiCommands } from "../utils/parseUiCommands";
import SecurityConfigModal from "./SecurityConfigModal";
import { checkMissingSecrets } from "utils/checkSecrets";

export default function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionName, setSessionName] = useState("Untitled Session");
  const [showModal, setShowModal] = useState(false);
  // const [missingKeyNotice, setMissingKeyNotice] = useState(false);
  const [setMissingKeyNotice] = useState(false);

  useEffect(() => {
    checkMissingSecrets().then((res) => {
      if (res.anyMissing) {
        setMessages((prev) => [
          ...prev,
          {
            role: "gpt",
            text: `⚠️ Missing API Keys

                rpgCampaignManager is an AI-powered and cloud-enabled campaign management tool.

                This app requires API keys for:

                - OpenAI: https://platform.openai.com/account/api-keys
                - Google Cloud Drive: https://developers.google.com/drive/api/guides/authentication

                To securely enter your keys, type: **configure security**`
          }
        ]);
        setMissingKeyNotice(true);
      }
    });
  }, []);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMsg = { role: "user", text: input };

    if (input.trim().toLowerCase() === "configure security") {
      setShowModal(true);
      setInput("");
      return;
    }

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
      actions.forEach(({ command, value }) => {
        if (command === "session_update") {
          setSessionName(value);
          setRenameNotice("Session has been renamed to \"${value}\"");
          setTimeout(() => setRenameNotice(""), 3000);
        }
        // Future support: tag_add, file_load, etc.
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
