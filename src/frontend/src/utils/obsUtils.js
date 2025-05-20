// obsUtils.js
export async function sendSceneToOBS(sceneName) {
  try {
    const res = await fetch("/api/session/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: `/obs scene = ${sceneName}` })
    });

    const result = await res.json();
    console.log("🎬 OBS Scene Switch:", result?.response || result?.status || result);
  } catch (err) {
    console.error("❌ OBS scene change failed:", err);
  }
}
