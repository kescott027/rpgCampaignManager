import { detectFileTab } from './fileHelpers';

describe('detectFileTab', () => {
  test('returns Images for image files', () => {
    expect(detectFileTab('map.webp')).toBe('Images');
    expect(detectFileTab('portrait.jpg')).toBe('Images');
  });

  test('returns JSON for .json files', () => {
    expect(detectFileTab('data.json')).toBe('JSON');
  });

  test('defaults to Markdown for .md and others', () => {
    expect(detectFileTab('notes.md')).toBe('Markdown');
    expect(detectFileTab('logfile.txt')).toBe('Markdown');
  });

  test('handles null or undefined', () => {
    expect(detectFileTab()).toBe('Markdown');
    expect(detectFileTab(null)).toBe('Markdown');
  });
});
