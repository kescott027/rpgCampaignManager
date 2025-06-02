// utils/debounce.js

export function debounce(fn, delay = 300) {
  let timeoutId;

  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
