// import { persistInitiativeState } from "../utils/initSync";
import { sendSceneToOBS } from "../utils/obsUtils";
import { post } from "../utils/api";

import { sortInitiative, getCurrentEntry, normalizeAll } from "./initiativeUtils";

export async function startCombat(entries) {
  // 1. Normalize + sort
  const normalized = normalizeAll(entries);
  const sorted = sortInitiative(normalized);
  //await persistInitiativeState(sorted);

  // 2. Save to backend
  await post("/api/combat/update-combat-queue", { entries: sorted });

  // 3. Reload from backend to guarantee freshness
  const res = await fetch("/api/combat/combat-queue");
  const data = await res.json();
  const reloaded = data.queue || [];

  // 4. Reset backend slot
  // await post("/api/session/command", { command: "/reset_slot 0" });

  // 5. Send OBS scene update for first character
  const active = getCurrentEntry(reloaded, 0);
  const scene = active?.scene || active?.name;
  await sendSceneToOBS(scene);

  return reloaded;
}
