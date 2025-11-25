/**
 * PIKCELL Standalone Entry Point
 * This file is the entry point for running pikcell as a standalone app.
 * For library usage, import from 'pikcell' directly.
 */
import { initPikcell } from './index';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    initPikcell(app).catch(console.error);
  }
});
