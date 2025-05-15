import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useStartupMessages } from "./useStartupMessages";

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
    const { result } = renderHook(() => useStartupMessages());

    await waitFor(() =>
      expect(result.current.message).toBe("Welcome to GM Session")
    );

    expect(result.current.devMode).toBe(true);
  });

  test("handles fetch failure gracefully", async () => {
    fetch.mockImplementationOnce(() => Promise.reject("API down"));

    const { result } = renderHook(() => useStartupMessages());

    await waitFor(() =>
      expect(result.current.message).toBe("Welcome to Untitled Session")
    );

    expect(result.current.devMode).toBe(false);
  });
});
