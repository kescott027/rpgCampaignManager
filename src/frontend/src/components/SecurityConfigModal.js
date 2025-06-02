import React, { useState } from "react";
import { post } from "../utils/api";

export default function SecurityConfigModal({ onClose }) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [googleKey, setGoogleKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveSecrets = async () => {
    setSaving(true);
    await post("/api/secrets/save",
      { openaiKey, googleKey },
      { credentials: "include" });
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
