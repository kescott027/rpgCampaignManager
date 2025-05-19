// Sort entries by initiative descending
export function sortInitiative(entries) {
  return [...entries].sort((a, b) => {
    const initA = parseInt(a.initiative) || 0;
    const initB = parseInt(b.initiative) || 0;
    return initB - initA;
  });
}

// Ensure an entry has name and scene
export function normalizeEntry(entry) {
  const name = entry?.name || "";
  return {
    ...entry,
    name,
    initiative: parseInt(entry.initiative) || 0,
    scene: entry.scene || name
  };
}

// Normalize all entries
export function normalizeAll(entries) {
  return entries.map(normalizeEntry);
}

// Rotate top entry to the bottom (used in /next)
export function rotateInitiative(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const [first, ...rest] = entries;
  return [...rest, first];
}

// Get active character from current index
export function getCurrentEntry(entries, index = 0) {
  if (!entries || entries.length === 0) return null;
  return entries[index % entries.length];
}
