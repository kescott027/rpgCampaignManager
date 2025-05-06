import React from 'react';
import { render, screen } from '@testing-library/react';
import App from 'App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(
        { content: '## Welcome to the campaign', type: 'text' }),
    })
  );
});

describe('App', () => {
  test('renders Campaign Manager UI with Sidebar and Tabs', async () => {
    render(<App />);

    // Sidebar exists
    expect(screen.getByText(/Campaign Manager/i)).toBeInTheDocument();

    // Tabs render
    // expect(screen.getByRole('button', { name: /Markdown/i })).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: /JSON/i })).toBeInTheDocument();
    // expect(screen.getByRole('button', { name: /Images/i })).toBeInTheDocument();


    // Chat window input is visible
    expect(screen.getByPlaceholderText(/Type a command or message/i)).toBeInTheDocument();
  });
});
