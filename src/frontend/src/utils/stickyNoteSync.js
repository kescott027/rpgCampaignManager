// utils/stickyNoteSync.js
import { get, post, deleteRequest } from "./api";


export async function loadStickyNotes() {
  try {
    const res = await get("/api/display/sticky-notes");
    const data = await res.json();
    return data.notes || [];
  } catch (err) {
    console.error("❌ Failed to load sticky notes:", err);
    return [];
  }
}

export async function saveStickyNotes(layoutName, notes) {
  try {
    await post("/api/display/sticky-notes", {
      name: layoutName,
      notes
    });
  } catch (err) {
    console.error("❌ Failed to save sticky notes:", err);
  }
}

export async function handleRenameLayout(oldName, newName) {
  try {
    const res = await post("/api/display/sticky-notes/rename-layout",
      { old_name: oldName, new_name: newName });
    const result = await res.json();
    console.log("✅ Rename result:", result);
  } catch (err) {
    console.error("❌ Rename failed:", err);
  }
}

export async function handleDeleteLayout(name, user_space, campaign) {
  try {
    const res = await deleteRequest(`/api/display/layout?name=${encodeURIComponent(name)}&user_space=${encodeURIComponent(user_space)}&campaign=${encodeURIComponent(campaign)}`);
    const result = await res.json();
    console.log("🗑️ Delete result:", result);
  } catch (err) {
    console.error("❌ Delete failed:", err);
  }
}
