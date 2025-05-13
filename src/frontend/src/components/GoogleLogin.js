// src/components/GoogleLogin.js
import React from "react";

export default function GoogleLoginButton({ sessionActive, onLogout }) {
  const handleLogin = () => {
    console.log("Google Drive login requested.");
    window.location.href = "/api/drive/oauth-login"; // Redirect to FastAPI login
  };

  const handleLogout = async () => {
    console.log("Google Drive logout requested.");
    try {
      await fetch("/api/drive/logout", { method: "POST", credentials: "include" });
      onLogout?.();
      window.location.reload(); // Refresh to reflect logout state
    } catch (err) {
      console.error("❌ Logout failed:", err);
      alert("Logout failed. Try refreshing the page.");
    }
  };

  return (
    <div className="section">
      <h4>🔐 Authentication</h4>
      <div className="auth-buttons" style={{ marginBottom: "10px" }}>
        {sessionActive ? (
          <button onClick={handleLogout} aria-label="Logout from Google Drive">
            🔒 Logout Google Drive
          </button>
        ) : (
          <button onClick={handleLogin} aria-label="Connect to Google Drive">
            🔑 Connect Google Drive
          </button>
        )}
      </div>
    </div>
  );
}
