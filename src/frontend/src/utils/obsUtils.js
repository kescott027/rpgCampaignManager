// obsUtils.js
import { get } from "./api";

export async function sendSceneToOBS(sceneName) {
  try {
    const obs_command = { command: `/obs scene = ${sceneName}` };
    const res = await get("/api/session/command", obs_command);

    const result = await res.json();
    console.log("🎬 OBS Scene Switch:", result?.response || result?.status || result);
  } catch (err) {
    console.error("❌ OBS scene change failed:", err);
  }
}
