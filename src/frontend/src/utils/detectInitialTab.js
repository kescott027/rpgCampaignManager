export function detectFileTab(filePath) {
  let ext = "";

  if (typeof filePath === "string") {
    console.log("detectFileTab input:", filePath);
    ext = filePath.split(".").pop().toLowerCase();
  } else if (filePath?.type === "drive-file" && typeof filePath.name === "string") {
    ext = filePath.name.split(".").pop().toLowerCase();
  } else {
    return "Markdown"; // fallback
  }

  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "Images";
  if (ext === "json") return "JSON";
  if (ext === "pdf") return "PDF";
  if (["mp3", "wav", "ogg"].includes(ext)) return "Audio";
  if (["mp4", "avi", "webm"].includes(ext)) return "Video";

  return "Markdown";
}
