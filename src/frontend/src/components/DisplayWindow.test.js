import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DisplayWindow from "./DisplayWindow";
import { get, post } from "../utils/api";

// jest.mock("./TabbedContent", () => () => <div>📑 TabbedContent Rendered</div>);
// jest.mock("./StickyNote", () => (props) => <div>🧷 StickyNote {props.content}</div>);
jest.mock("./DriveListing", () => (props) => (
  <div>
    📁 DriveListing:
    {props.filePath?.payload?.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
));
// jest.mock("./PanelManager", () => () => <div>🪟 PanelManager Placeholder</div>);
jest.mock("../utils/api", () => ({
  get: jest.fn(),
  post: jest.fn()
}));

beforeEach(() => {
  get.mockReset();
  post.mockReset();
});

describe("DisplayWindow", () => {
  test("renders fallback when no file is selected", () => {
    render(<DisplayWindow />);
    expect(screen.getByText(/no file selected/i)).toBeInTheDocument();
  });

  /**
   test("loads and renders markdown content", async () => {
    get.mockResolvedValueOnce({ content: "## Hello Markdown", type: "text" });
    render(<DisplayWindow filePath="notes.md" />);

    expect(await screen.findByText(/hello markdown/i)).toBeInTheDocument();
  });

   test("renders Google Drive folder listing", () => {
    const filePath = {
      type: "drive-listing",
      payload: [{ id: "1", name: "Folder A", mimeType: "application/vnd.google-apps.folder" }]
    };

    render(<DisplayWindow filePath={filePath} onFileSelect={() => {}} />);
    expect(screen.getByText("Folder A")).toBeInTheDocument();
  });

   test("renders Google Drive file content", () => {
    const filePath = {
      type: "drive-file",
      payload: "Drive file content here"
    };

    render(<DisplayWindow filePath={filePath} />);
    expect(screen.getByText(/Drive file content here/)).toBeInTheDocument();
  });

   test("renders markdown content when file is loaded", async () => {
  // First: layout list
  get.mockResolvedValueOnce({ layouts: [] });

  // Second: file content
  get.mockResolvedValueOnce({
    content: "### Sticky content",
    type: "text",
  });

  render(<DisplayWindow filePath="note.md" />);


  expect(await screen.findByRole("heading", { name: /sticky content/i })).toBeInTheDocument();
});

   test("loads layout from dropdown and updates sticky note state", async () => {
    get
      .mockResolvedValueOnce({ layouts: ["Session 1"] }) // layoutNames
      .mockResolvedValueOnce({ notes: [{ id: 1, content: "Test", type: "markdown", position: { x: 0, y: 0 }, size: { width: 100, height: 100 } }] }); // layout data

    render(<DisplayWindow filePath="note.md" />);

    await waitFor(() => screen.getByRole("combobox"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Session 1" } });

    await waitFor(() => expect(screen.getByText("Test")).toBeInTheDocument());
  });  **/
});
