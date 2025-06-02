import { get } from "./api";

export async function checkMissingSecrets() {
  const res = await get("/api/secrets/check");
  const { missingOpenAI, missingGoogle } = await res.json();

  return {
    missingOpenAI,
    missingGoogle,
    anyMissing: missingOpenAI || missingGoogle
  };
}
