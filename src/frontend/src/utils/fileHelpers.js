export function detectFileTab(filePath) {
  if (!filePath) return 'Markdown';

  const ext = filePath.split('.').pop().toLowerCase();

  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];
  const textExts = ['md', 'txt', 'log'];
  const audioExts = ['mp3', 'wav', 'ogg'];
  const videoExts = ['mp4', 'webm', 'mov'];

  if (imageExts.includes(ext)) return 'Images';
  if (textExts.includes(ext)) return 'Markdown';
  if (audioExts.includes(ext)) return 'Audio';
  if (videoExts.includes(ext)) return 'Video';
  if (ext === 'json') return 'JSON';
  if (ext === 'pdf') return 'PDF';

  // Fallback
  return 'Markdown';
}
