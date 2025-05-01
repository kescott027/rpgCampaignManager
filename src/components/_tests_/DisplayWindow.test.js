import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DisplayWindow from '../DisplayWindow';
import '@testing-library/jest-dom';


describe('DisplayWindow', () => {
  test('renders the component and shows Markdown tab by default', () => {
    render(<DisplayWindow />);

    // Check initial Markdown content
    expect(screen.getByText(/Markdown preview here/i)).toBeInTheDocument();
  });

  test('switches to JSON tab on click', () => {
    render(<DisplayWindow />);

    const jsonTab = screen.getByRole('button', { name: /JSON/i });
    fireEvent.click(jsonTab);

    expect(screen.getByText(/Colby Jackson/i)).toBeInTheDocument();
  });

  test('switches to Images tab and displays an image', () => {
    render(<DisplayWindow />);

    const imageTab = screen.getByRole('button', { name: /Images/i });
    fireEvent.click(imageTab);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
