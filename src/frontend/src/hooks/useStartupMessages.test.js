import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useStartupMessages } from "./useStartupMessages";

// Apply mock fetch before tests
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          sessionName: "GM Session",
          "developer mode": true
        })
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("useStartupMessages", () => {
  test("returns session name and developer mode from config", async () => {
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

