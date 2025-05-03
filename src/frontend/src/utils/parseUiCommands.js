export function parseUiCommands(gptText) {
  const commandPattern = /<==]==\/(\w+?)='(.*?)'\/==\[==>/g;
  const actions = [];
  let cleanedText = gptText;

  let match;
  while ((match = commandPattern.exec(gptText)) !== null) {
    const [fullMatch, command, value] = match;
    actions.push({ command, value });
    cleanedText = cleanedText.replace(fullMatch, "").trim();
  }

  return { cleanedText, actions };
}
