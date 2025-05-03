// ✅ Mock fetch (GPT response)
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ missingOpenAI: false, missingGoogle: false })
  })
);

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatSection from "../components/ChatSection";

describe("ChatSection", () => {
  test("loads and shows default message", async () => {
    render(<ChatSection />);
    await waitFor(() => {
      expect(screen.getByText(/start chatting/i)).toBeInTheDocument();
    });
  });
});

