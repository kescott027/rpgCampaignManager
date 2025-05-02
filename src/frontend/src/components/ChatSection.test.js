import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatSection from 'components/ChatSection';

describe('ChatSection', () => {
  test('renders initial messages from state', () => {
    render(<ChatSection />);
    expect(screen.getByText(/Who is Bethany/i)).toBeInTheDocument();
    expect(screen.getByText(/Bethany is a corrupted dryad/i)).toBeInTheDocument();
  });

  test('adds a new user message when sent', () => {
    render(<ChatSection />);

    const textarea = screen.getByPlaceholderText(/Type a command/i);
    const sendButton = screen.getByText(/Send/i);

    fireEvent.change(textarea, { target: { value: 'Hello GPT' } });
    fireEvent.click(sendButton);

    expect(screen.getByText(/Hello GPT/i)).toBeInTheDocument();
  });
});
