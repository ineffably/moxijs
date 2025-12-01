/**
 * PIKCELL Standalone Entry Point
 * This file is the entry point for running pikcell as a standalone app.
 * For library usage, import from 'pikcell' directly.
 */
import { initPikcell } from './index';

// Extend window interface for testing
declare global {
  interface Window {
    pikcell?: Awaited<ReturnType<typeof initPikcell>>;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    initPikcell(app)
      .then((result) => {
        // Expose to window for testing/debugging
        window.pikcell = result;
        console.log('PIKCELL ready - access via window.pikcell');
      })
      .catch(console.error);
  }
});
