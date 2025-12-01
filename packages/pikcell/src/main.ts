/**
 * PIKCELL Standalone Entry Point
 * This file is the entry point for running pikcell as a standalone app.
 * For library usage, import from 'pikcell' directly.
 */
import { initPikcell } from './index';
import { getAllThemes, setTheme, getTheme, getThemeInfo, ThemeInfo } from './theming/theme';

// Theme utilities for testing/debugging
const themeUtils = {
  getAllThemes,
  setTheme,
  getTheme,
  getThemeInfo
};

// Extend window interface for testing
declare global {
  interface Window {
    pikcell?: Awaited<ReturnType<typeof initPikcell>> & { theme: typeof themeUtils };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    initPikcell(app)
      .then((result) => {
        // Expose to window for testing/debugging
        window.pikcell = { ...result, theme: themeUtils };
        console.log('PIKCELL ready - access via window.pikcell');
        console.log('Theme utils: window.pikcell.theme.getAllThemes(), .setTheme(), etc.');
      })
      .catch(console.error);
  }
});
