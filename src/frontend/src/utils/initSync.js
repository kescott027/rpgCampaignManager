import { post } from "./api";

export async function persistInitiativeState(entries) {
  try {
    await post("/api/combat/update-combat-queue", entries);
  } catch (err) {
    console.error("❌ Failed to persist initiative queue:", err);
  }
}
