// src/utils/devLogger.js
export const isDebug = !!localStorage.getItem("debugMode");

export function debugLog(...args) {
  if (isDebug) {
    const timestamp = new Date().toISOString();
    console.log("[DEBUG]", timestamp, ...args);
  }
}
