// src/components/GoogleLogin.js
import React from "react";

export default function GoogleLoginButton({ sessionActive, onLogout }) {
  const handleLogin = () => {
    console.log("google drive login requested.");
    window.location.href = "/api/drive/oauth-login"; // redirects to FastAPI login endpoint
  };

  const handleLogout = async () => {
    console.log("google dive logout requested.");
    await fetch("/api/drive/logout", { method: "POST", credentials: "include" });
    onLogout?.();
    window.location.reload(); // Refresh state
  };

  return (
    <div className="section">
      <h4>🔐 Authentication</h4>
      <div style={{ marginBottom: "10px" }}>
        {sessionActive ? (
          <button onClick={handleLogout}>🔒 Logout Google Drive</button>
        ) : (
          <button onClick={handleLogin}>🔑 Connect Google Drive</button>
        )}
      </div>
    </div>
  );
}
