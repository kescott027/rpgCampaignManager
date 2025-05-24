// utils/stickyNoteSync.js

export async function loadStickyNotes() {
  try {
    const res = await fetch("/api/display/sticky-notes");
    const data = await res.json();
    return data.notes || [];
  } catch (err) {
    console.error("❌ Failed to load sticky notes:", err);
    return [];
  }
}

export async function saveStickyNotes(layoutName, notes) {
  try {
    await fetch("/api/display/sticky-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: layoutName,
        notes
      })
    });
  } catch (err) {
    console.error("❌ Failed to save sticky notes:", err);
  }
}

export async function handleRenameLayout(oldName, newName) {
  try {
    const res = await fetch("/api/display/sticky-notes/rename-layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_name: oldName, new_name: newName })
    });
    const result = await res.json();
    console.log("✅ Rename result:", result);
  } catch (err) {
    console.error("❌ Rename failed:", err);
  }
}

export async function handleDeleteLayout(name) {
  try {
    const res = await fetch(`/api/display/sticky-notes/delete-layout?name=${encodeURIComponent(name)}`, {
      method: "DELETE"
    });
    const result = await res.json();
    console.log("🗑️ Delete result:", result);
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
}
