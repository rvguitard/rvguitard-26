// utils.js
// Simple client-side sanitization and throttler utilities.
// Use textContent when rendering to DOM to avoid HTML injection.
// Exporting to window for easy inclusion in Webflow inline scripts.

(function (global) {
  function sanitize(input, maxLength = 1000) {
    if (typeof input !== 'string') return '';
    // Remove angle brackets (server also rejects them)
    let s = input.replace(/[<>]/g, '');
    // Normalize whitespace and trim
    s = s.replace(/\s+/g, ' ').trim();
    if (s.length > maxLength) s = s.slice(0, maxLength);
    return s;
  }

  // Throttler factory: returns an object with .allow() method that returns true when allowed.
  function createThrottler(minIntervalMs = 10000) {
    let last = 0;
    return {
      allow() {
        const now = Date.now();
        if (now - last < minIntervalMs) return false;
        last = now;
        return true;
      },
      // For debugging/testing
      timeUntilNext() {
        const now = Date.now();
        return Math.max(0, minIntervalMs - (now - last));
      }
    };
  }

  // Safely append a message node to a container as text (no HTML injection)
  function appendTextNode(container, text, className) {
    const el = document.createElement('div');
    if (className) el.className = className;
    el.textContent = text;
    container.appendChild(el);
    return el;
  }

  global.RV_UTILS = {
    sanitize,
    createThrottler,
    appendTextNode
  };
})(window);
