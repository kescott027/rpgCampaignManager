import React, { useState, useEffect } from "react";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // or 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // { type: "error" | "success", message }

  const handleSubmit = async () => {
    if (!username || !password) {
      setStatus({ type: "error", message: "Username and password are required." });
      return;
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Failed to authenticate." });
        return;
      }

      if (mode === "login" && onSuccess) {
        onSuccess(data.user);
      }

      setStatus({ type: "success", message: data.status || "Success!" });
    } catch (err) {
      setStatus({ type: "error", message: "Network error." });
    }
  };

  return (
    <div style={{
      position: "fixed", top: "25%", left: "30%", width: "40%", zIndex: 1000,
      background: "#fff", border: "1px solid #aaa", boxShadow: "0 0 10px rgba(0,0,0,0.2)", padding: "20px"
    }}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {status && (
        <div style={{
          color: status.type === "error" ? "red" : "green",
          marginBottom: "10px"
        }}>{status.message}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={handleSubmit}>
          {mode === "login" ? "Login" : "Register"}
        </button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          Switch to {mode === "login" ? "Register" : "Login"}
        </button>
        <button onClick={onClose} style={{ color: "red" }}>Cancel</button>
      </div>
    </div>
  );
}
