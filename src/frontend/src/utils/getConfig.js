export async function getDeveloperMode() {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    return data.developer_mode === true;
  } catch (err) {
    console.error("⚠️ Error fetching config:", err);
    return false;
  }
}
