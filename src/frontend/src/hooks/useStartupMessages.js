import { useState, useEffect } from "react";

export function useStartupMessages() {
  const [message, setMessage] = useState("Starting session...");
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/manager_config.json");
        const config = await res.json();

        const sessionName = config.sessionName || "Untitled Session";
        const isDev = config["developer mode"] === true;

        setMessage(`Welcome to ${sessionName}`);
        setDevMode(isDev);
      } catch (err) {
        console.error("❌ Failed to load config:", err);
        setMessage("Welcome to Untitled Session");
        setDevMode(false);
      }
    }

    fetchConfig();
  }, []);

  return { message, devMode };
}
