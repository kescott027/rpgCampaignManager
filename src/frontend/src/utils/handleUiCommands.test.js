import { handleUiCommands } from "./handleUiCommands";

jest.useFakeTimers();

describe("handleUiCommands", () => {
  let mockSetSessionName;
  let mockSetRenameNotice;

  beforeEach(() => {
    mockSetSessionName = jest.fn();
    mockSetRenameNotice = jest.fn();
  });

  test("handles session_update command", () => {
    const actions = [{ command: "session_update", value: "New Session Name" }];

    handleUiCommands(actions, {
      setSessionName: mockSetSessionName,
      setRenameNotice: mockSetRenameNotice
    });

    expect(mockSetSessionName).toHaveBeenCalledWith("New Session Name");
    expect(mockSetRenameNotice).toHaveBeenCalledWith("Session has been renamed to \"New Session Name\"");

    // Fast-forward timeout
    jest.runAllTimers();
    expect(mockSetRenameNotice).toHaveBeenLastCalledWith("");
  });

  test("ignores unknown commands", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {
    });

    const actions = [{ command: "unknown_cmd", value: "123" }];

    handleUiCommands(actions, {});

    expect(spy).toHaveBeenCalledWith("[UI Handler] Unknown command: unknown_cmd");

    spy.mockRestore();
  });

  test("handles tag_add command if dispatcher exists", () => {
    const mockSetTagNotice = jest.fn();
    const actions = [{ command: "tag_add", value: "orc,ambush" }];

    handleUiCommands(actions, { setTagNotice: mockSetTagNotice });

    expect(mockSetTagNotice).toHaveBeenCalledWith("🏷️ Tags added: orc,ambush");
  });

  test("handles file_load command if dispatcher exists", () => {
    const mockSetFileBanner = jest.fn();
    const actions = [{ command: "file_load", value: "map.png" }];

    handleUiCommands(actions, { setFileBanner: mockSetFileBanner });

    expect(mockSetFileBanner).toHaveBeenCalledWith("📂 Loaded file: map.png");
  });

  test("handles mode_switch command if dispatcher exists", () => {
    const mockSetModeBanner = jest.fn();
    const actions = [{ command: "mode_switch", value: "combat" }];

    handleUiCommands(actions, { setModeBanner: mockSetModeBanner });

    expect(mockSetModeBanner).toHaveBeenCalledWith("⚔️ Combat mode: combat");
  });
});
