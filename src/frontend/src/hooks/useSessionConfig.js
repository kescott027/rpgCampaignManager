import { useEffect, useState } from "react";
import { get } from "../utils/api";

export default function useSessionConfig() {
  const [sessionConfig, setSessionConfig] = useState(null);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSessionConfig() {
      try {
        const response = await get("/api/session/config");

        if (response.status === 200) {
          setSessionConfig(response.data);
          setUserName(response.data.user_name || "");
        } else {
          console.error("❌ Config error:", response.message);
          setError(response.message);
        }
      } catch (err) {
        console.error("❌ API call failed:", err);
        setError("Failed to load session config.");
      }
    }

    fetchSessionConfig();
  }, []);

  return { sessionConfig, userName, error };
}
