import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabViewer from 'components/TabViewer';

describe('TabViewer', () => {
  const mockTabs = ['Tab A', 'Tab B'];
  const mockContent = {
    'Tab A': <div>Content A</div>,
    'Tab B': <div>Content B</div>
  };

  test('displays default tab content', () => {
    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab A"
        onTabChange={() => {}}
      >
        {mockContent}
      </TabViewer>
    );

    expect(screen.getByText(/Content A/i)).toBeInTheDocument();
  });

  test('calls onTabChange when a tab is clicked', () => {
    const mockChange = jest.fn();

    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab A"
        onTabChange={mockChange}
      >
        {mockContent}
      </TabViewer>
    );

    const tabB = screen.getByRole('button', { name: /Tab B/i });
    fireEvent.click(tabB);

    expect(mockChange).toHaveBeenCalledWith('Tab B');
  });
});

