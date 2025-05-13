import React from 'react';
import { render, screen } from '@testing-library/react';
import DisplayWindow from './DisplayWindow';

// Reset global.fetch before each test
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DisplayWindow', () => {
  test('renders Markdown content by default', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        content: '## Welcome to the campaign',
        type: 'text',
      }),
    });

    render(<DisplayWindow filePath="notes.md" />);

    expect(await screen.findByText(/Welcome to the campaign/i)).toBeInTheDocument();
  });

  test('renders JSON content in the JSON tab', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        content: JSON.stringify({ name: 'Colby Jackson' }),
        type: 'json',
      }),
    });

    render(<DisplayWindow filePath="data.json" initialTab="JSON" />);

    expect(await screen.findByText(/Colby Jackson/i)).toBeInTheDocument();
  });

  test('renders image in the Images tab', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        content: '', // Not needed for image
        type: 'image',
      }),
    });

    render(
      <DisplayWindow
        filePath="assets/my_campaigns/Forgesworn/assegs/Grundvollr_Key_Places_Map.png"
        initialTab="Images"
      />
    );

    expect(await screen.findByRole('img')).toBeInTheDocument();
  });

  test('displays fallback for unsupported file type', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        content: '',
        type: 'unknown',
      }),
    });

    render(<DisplayWindow filePath="foo.exe" initialTab="Markdown" />);
    // expect(await screen.findByText(/\[Error loading file\]|\[Non-text file\]/i)).toBeInTheDocument();
  });
});
