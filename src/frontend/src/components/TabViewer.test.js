import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TabViewer from "components/TabViewer";

describe("TabViewer", () => {
  const mockTabs = ["Tab A", "Tab B"];
  const mockContent = {
    "Tab A": <div>Content A</div>,
    "Tab B": <div>Content B</div>
  };

  test("displays default tab content", () => {
    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab A"
        onTabChange={() => {
        }}
        tabContent={mockContent}
      />
    );

    // Use a flexible matcher to avoid DOM nesting issues
    expect(
      screen.getByText((text) => text.includes("Content A"))
    ).toBeInTheDocument();
  });

  test("calls onTabChange when a tab is clicked", () => {
    const mockChange = jest.fn();

    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab A"
        onTabChange={mockChange}
        tabContent={mockContent}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tab B" }));
    expect(mockChange).toHaveBeenCalledWith("Tab B");
  });

  test("renders fallback content when active tab has no content", () => {
    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab X"
        onTabChange={() => {
        }}
        tabContent={mockContent}
      />
    );

    expect(
      screen.getByText(/🪹 No content for "Tab X" tab\./i)
    ).toBeInTheDocument();
  });
});
