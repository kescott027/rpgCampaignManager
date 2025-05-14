// ChatSection.js
import React, { useState } from "react";

function parseOBSCommand(text) {
  const [_, type, __, ...rest] = text.split(/\s+/);
  return {
    command: type,
    args: [rest.join(" ")]
  };
}

export default function ChatSection({ sessionName = "Untitled Session", filePath = null, devMode = false }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [showDevTools, setShowDevTools] = useState(false);
  const [initiativeQueue, setInitiativeQueue] = useState([]);
  const [initiativeMap, setInitiativeMap] = useState({});

  const sendCommandToBackend = async (command, payload = {}) => {
    try {
      const res = await fetch("/api/session/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, ...payload })
      });
      return await res.json();
    } catch (err) {
      console.error("Command error:", err);
      setMessages(prev => [...prev, { role: "system", text: "❌ Failed to execute command" }]);
    }
  };

  const handleCustomCommand = async (command) => {
    const [cmd, ...rest] = command.slice(1).split(" ");
    const args = rest.join(" ");

    switch (cmd.toLowerCase()) {
      case "set":
        if (args.toLowerCase().startsWith("characters")) {
          const names = args.slice("characters".length).split(",").map(n => n.trim());
          await sendCommandToBackend("set_characters", { characters: names });
          setMessages(prev => [...prev, { role: "system", text: `✅ Characters set: ${names.join(", ")}` }]);
        } else {
          setMessages(prev => [...prev, { role: "system", text: "⚠️ Usage: /set characters Kolby, Aria..." }]);
        }
        break;

      case "initiative":
        const result = await sendCommandToBackend("start_initiative", {});
        if (result?.next) {
          setInitiativeQueue(result.next ? [result.next] : []);
          setInitiativeMap({});
          setMessages(prev => [...prev, { role: "system", text: `📝 What is ${result.next}'s initiative?` }]);
        }
        break;

      case "next":
        const nextRes = await sendCommandToBackend("next_initiative", {});
        const active = nextRes?.current || "Unknown";
        setMessages(prev => [...prev, { role: "system", text: `🎯 It is now ${active}'s turn!` }]);
        break;

      default:
        setMessages(prev => [...prev, { role: "system", text: `⚠️ Unknown command: /${cmd}` }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (input.startsWith("/")) {
      await handleCustomCommand(input);
      setInput("");
      return;
    }

    if (initiativeQueue.length > 0) {
      const name = initiativeQueue[0];
      const value = parseInt(input.trim());

      if (isNaN(value)) {
        setMessages(prev => [...prev, { role: "system", text: "⚠️ Please enter a number." }]);
        return;
      }

      const updatedMap = { ...initiativeMap, [name]: value };
      setInitiativeMap(updatedMap);

      const remaining = [...initiativeQueue.slice(1)];
      const res = await sendCommandToBackend("submit_initiative", { name, value });

      if (remaining.length > 0) {
        setInitiativeQueue(remaining);
        setMessages(prev => [...prev, { role: "system", text: `📝 What is ${remaining[0]}'s initiative?` }]);
      } else {
        setInitiativeQueue([]);
        setMessages(prev => [...prev, { role: "system", text: `✅ Initiative order submitted.` }]);
      }

      setInput("");
      return;
    }

    if (input.trim().toUpperCase().startsWith("OBS")) {
      try {
        const obsCommand = parseOBSCommand(input);
        const res = await fetch("/api/obs/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(obsCommand)
        });
        const data = await res.json();
        const obsResponse = data.status || data.message || "✅ OBS Command sent";
        setMessages(prev => [...prev, { role: "obs", text: obsResponse }]);
      } catch (err) {
        console.error("OBS Error:", err);
        setMessages(prev => [...prev, { role: "obs", text: "❌ OBS error: " + err }]);
      }
      setInput("");
      return;
    }

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

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
      setMessages(prev => [...prev, gptMessage]);
    } catch (err) {
      console.error("❌ Error connecting to GPT:", err);
      setMessages(prev => [...prev, { role: "gpt", text: "❌ Error connecting to GPT: " + err }]);
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

  const devToolbox = devMode && showDevTools && (
    <div className="dev-toolbox" style={{
      background: "#222",
      color: "#eee",
      padding: "10px",
      marginBottom: "5px",
      borderTop: "2px solid #555"
    }}>
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
          <button onClick={downloadMarkdown}>⬇️ Export Chatlog as Markdown</button>
        </div>
        <div className="chat-log">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>{msg.text}</div>
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
