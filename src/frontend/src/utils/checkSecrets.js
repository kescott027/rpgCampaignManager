export async function checkMissingSecrets() {
  const res = await fetch("/api/secrets/check");
  const { missingOpenAI, missingGoogle } = await res.json();

  return {
    missingOpenAI,
    missingGoogle,
    anyMissing: missingOpenAI || missingGoogle
  };
}
