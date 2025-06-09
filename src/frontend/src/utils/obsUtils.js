// obsUtils.js
import { get } from "./api";

/** export async function sendSceneToOBS(sceneName) {
  try {
    const obs_command = { command: `/obs scene = ${sceneName}` };
    const res = await get("/api/session/command", obs_command);

    const result = await res.json();
    console.log("🎬 OBS Scene Switch:", result?.response || result?.status || result);
  } catch (err) {
    console.error("❌ OBS scene change failed:", err);
  }
}
 **/

export async function sendSceneToOBS(scene) {
  try {
    const response = await fetch("/api/obs/set-scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene })
    });
    const result = await response.json();
    console.log("OBS Scene set:", result);
  } catch (err) {
    console.error("OBS scene update failed:", err);
  }
}
