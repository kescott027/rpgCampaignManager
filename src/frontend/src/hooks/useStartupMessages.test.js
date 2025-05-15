import { renderHook } from "@testing-library/react-hooks";
import { useStartupMessages } from "./useStartupMessages";

// Mock the API call
jest.mock("../utils/checkSecrets", () => ({
  checkMissingSecrets: jest.fn()
}));

import { checkMissingSecrets } from "../utils/checkSecrets";

describe("useStartupMessages", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads default startup message when no keys are missing", async () => {
    checkMissingSecrets.mockResolvedValueOnce({ anyMissing: false });

    const { result, waitForNextUpdate } = renderHook(() =>
      useStartupMessages("Test Session")
    );

    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].text).toMatch(/rpgCampaignManager – session Test Session/i);
    expect(result.current.missingKeyNotice).toBe(false);
  });

  test("loads startup message and missing key warning when keys are missing", async () => {
    checkMissingSecrets.mockResolvedValueOnce({ anyMissing: true });

    const { result, waitForNextUpdate } = renderHook(() =>
      useStartupMessages("Test Session")
    );

    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].text).toMatch(/session Test Session/i);
    expect(result.current.messages[1].text).toMatch(/Missing API Keys/i);
    expect(result.current.missingKeyNotice).toBe(true);
  });
});
