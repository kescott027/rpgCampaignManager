import React, { useState } from 'react';

export default function ChatSection() {
  const [messages, setMessages] = useState([
    { role: 'user', text: 'Who is Bethany?' },
    { role: 'gpt', text: 'Bethany is a corrupted dryad...' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() === '') return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    // TODO: Hook into ChatGPT connector
  };

  return (
    <div className="chat-section">
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
    </div>
  );
}
