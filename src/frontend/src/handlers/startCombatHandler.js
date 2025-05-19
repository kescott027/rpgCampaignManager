import { persistInitiativeState } from "../utils/initSync";
import { sendSceneToOBS } from "../utils/obsUtils";
import { sortInitiative, getCurrentEntry, normalizeAll } from "./initiativeUtils";

export async function startCombat(entries) {
  const normalized = normalizeAll(entries);
  const sorted = sortInitiative(normalized);
  await persistInitiativeState(sorted);

  const active = getCurrentEntry(sorted, 0);
  const scene = active?.scene || active?.name;

  // Update OBS scene immediately
  await sendSceneToOBS(scene);

  // Reset backend slot
  await fetch("/api/session/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: "/reset_slot 0" })
  });

  return sorted;
}
