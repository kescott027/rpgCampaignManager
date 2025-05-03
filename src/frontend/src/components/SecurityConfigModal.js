import React, { useState } from "react";

export default function SecurityConfigModal({ onClose }) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveSecrets = async () => {
    setSaving(true);
    await fetch("/api/secrets/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openaiKey, googleKey })
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Configure API Keys</h3>
        <p>These will be saved securely to <code>.security</code> and not logged.</p>

        <input
          type="password"
          placeholder="OpenAI API Key"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
        />
        <input
          type="password"
          placeholder="Google Cloud API Key"
          value={googleKey}
          onChange={(e) => setGoogleKey(e.target.value)}
        />

        <button disabled={saving} onClick={saveSecrets}>
          {saving ? "Saving..." : "Save Keys"}
        </button>
        {saved && <p>✅ Keys saved. Please restart the app.</p>}
      </div>
    </div>
  );
}
