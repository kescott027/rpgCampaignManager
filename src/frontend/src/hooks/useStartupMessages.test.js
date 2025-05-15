import { renderHook } from "@testing-library/react";
import { useStartupMessages } from "./useStartupMessages";

// Mock the config fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        "developer mode": true,
        sessionName: "GM Session"
      })
  })
);

describe("useStartupMessages", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns default session name and developer mode", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useStartupMessages());

    // Wait for useEffect fetch to complete
    await waitForNextUpdate();

    expect(result.current.message).toContain("Welcome to GM Session");
    expect(result.current.devMode).toBe(true);
  });

  test("handles fetch failure gracefully", async () => {
    fetch.mockImplementationOnce(() => Promise.reject("API down"));

    const { result, waitForNextUpdate } = renderHook(() => useStartupMessages());
    await waitForNextUpdate();

    expect(result.current.message).toContain("Welcome to Untitled Session");
    expect(result.current.devMode).toBe(false);
  });
});
