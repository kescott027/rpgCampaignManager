import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  test('renders sidebar and display window', () => {
    render(<App />);

    // Sidebar navigation
    expect(screen.getByText(/Campaign Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Entity Index/i)).toBeInTheDocument();

    // Display pane
    expect(screen.getByText(/Display Window/i)).toBeInTheDocument();
  });

  test('renders chat section with preloaded messages', () => {
    render(<App />);
    expect(screen.getByText(/Who is Bethany/i)).toBeInTheDocument();
    expect(screen.getByText(/Bethany is a corrupted dryad/i)).toBeInTheDocument();
  });
});
