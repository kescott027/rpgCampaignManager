import { useState, useEffect } from "react";
import { get } from "../utils/api";

export function useStartupMessages() {
  const [message, setMessage] = useState("Starting session...");
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const config = await get("/api/session/config");

        const sessionName = config.data.session_name || "Untitled Session";
        const isDev = config.data["developer_mode"] === true;

        setMessage("Welcome to " + sessionName);
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
