export function handleUiCommands(actions, dispatch) {
  actions.forEach(({ command, value }) => {
    switch (command) {
      case "session_update":
        dispatch.setSessionName?.(value);
        dispatch.setRenameNotice?.(`Session has been renamed to "${value}"`);
        setTimeout(() => dispatch.setRenameNotice?.(""), 3000);
        break;

      // 🧪 Future support
      case "tag_add":
        dispatch.setTagNotice?.(`🏷️ Tags added: ${value}`);
        break;

      case "file_load":
        dispatch.setFileBanner?.(`📂 Loaded file: ${value}`);
        break;

      case "mode_switch":
        dispatch.setModeBanner?.(`⚔️ Combat mode: ${value}`);
        break;

      default:
        console.warn(`[UI Handler] Unknown command: ${command}`);
    }
  });
}
