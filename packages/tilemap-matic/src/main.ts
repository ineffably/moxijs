/**
 * TileMapMatic Standalone Entry Point
 * This file is the entry point for running tilemap-matic as a standalone app.
 * For library usage, import from 'tilemap-matic' directly.
 */
import { initTileMapMatic } from './index';

// Mark bundle as loaded for the lazy-load trick
declare global {
  interface Window {
    _bundleLoaded?: boolean;
    tileMapMatic?: Awaited<ReturnType<typeof initTileMapMatic>>;
  }
}

window._bundleLoaded = true;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    initTileMapMatic({ hostElement: app })
      .then((cleanup) => {
        // Expose cleanup function for testing/debugging
        window.tileMapMatic = cleanup as any;
        console.log('TileMapMatic ready');
      })
      .catch(console.error);
  }
});
