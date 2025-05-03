import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatSection from "./ChatSection";


jest.mock("utils/checkSecrets", () => ({
  checkMissingSecrets: jest.fn().mockResolvedValue({ anyMissing: false })
}));

// ✅ Mock async secret checker
jest.mock("utils/checkSecrets", () => ({
  checkMissingSecrets: jest.fn().mockResolvedValue({ anyMissing: false })
}));

// ✅ Mock fetch (GPT response)
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ response: "Acknowledged!" })
  })
);

describe("ChatSection", () => {
  test("adds a new user message when sent", async () => {
    render(<ChatSection />);

    const textarea = screen.getByPlaceholderText(/Type a command/i);
    const sendButton = screen.getByText(/Send/i);

    // Type message
    fireEvent.change(textarea, { target: { value: "Hello GPT" } });

    // Send message
    fireEvent.click(sendButton);

    // ✅ Expect user message to show up
    await waitFor(() => {
      const messages = screen.getAllByText("Hello GPT");
      expect(messages[0]).toHaveClass("chat-msg user");
    });

    // ✅ Expect GPT response to be rendered
    await waitFor(() => {
      expect(screen.getByText("Acknowledged!")).toHaveClass("chat-msg gpt");
    });
  });
});
