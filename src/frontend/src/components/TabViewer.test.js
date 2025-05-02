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
        {mockContent['Tab A']}
      </TabViewer>
    );

    expect(screen.getByText(/Content A/i)).toBeInTheDocument();
  });

  /*
  Commenting this out temporarily until existing test set completes.
  test('returns PDF, Audio, and Video types correctly', () => {
  expect(detectFileTab('guide.pdf')).toBe('PDF');
  expect(detectFileTab('theme.mp3')).toBe('Audio');
  expect(detectFileTab('trailer.webm')).toBe('Video');
  });
  */



  test('calls onTabChange when a tab is clicked', () => {
    const mockChange = jest.fn();

    render(
      <TabViewer
        tabs={mockTabs}
        activeTab="Tab A"
        onTabChange={mockChange}
      >
        {mockContent['Tab A']}
      </TabViewer>
    );

    const tabB = screen.getByRole('button', { name: /Tab B/i });
    fireEvent.click(tabB);

    expect(mockChange).toHaveBeenCalledWith('Tab B');
  });
});
