export async function persistInitiativeState(entries) {
  try {
    await fetch("/api/datastore/update-combat-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });
  } catch (err) {
    console.error("❌ Failed to persist initiative queue:", err);
  }
}
