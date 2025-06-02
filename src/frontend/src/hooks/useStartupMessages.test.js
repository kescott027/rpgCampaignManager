import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useStartupMessages } from "./useStartupMessages";
import { get } from "../utils/api";

jest.mock("../utils/api", () => ({
  get: jest.fn()
}));


afterEach(() => {
  jest.clearAllMocks();
});


describe("useStartupMessages", () => {
  it("returns session name and developer mode from config", async () => {
    get.mockResolvedValueOnce({
      data: {
        session_name: "GM Session",
        developer_mode: true
      }
    });

    const { result } = renderHook(() => useStartupMessages());

    await waitFor(() =>
      expect(result.current.message).toBe("Welcome to GM Session")
    );

    expect(result.current.devMode).toBe(true);
  });

  test("handles fetch failure gracefully", async () => {
    get.mockRejectedValueOnce("API down");

    const { result } = renderHook(() => useStartupMessages());

    await waitFor(() =>
      expect(result.current.message).toBe("Welcome to Untitled Session")
    );

    expect(result.current.devMode).toBe(false);
  });
});

