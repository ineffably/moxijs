/**
 * TileMapMatic Example Stub
 * The full implementation is in the @moxijs/tilemap-matic package.
 * This stub provides integration with the moxijs-examples gallery.
 */
import { initTileMapMatic } from '@moxijs/tilemap-matic';

type CleanupFunction = () => void;

/**
 * Initialize TileMapMatic in the examples context
 */
export async function initTileMapMaticExample(): Promise<CleanupFunction> {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  // Initialize using the package
  const cleanup = await initTileMapMatic({
    hostElement: root,
    width: 1280,
    height: 720,
    backgroundColor: 0x1a1a2e
  });

  return cleanup;
}

// Re-export the init function with the expected name pattern
export { initTileMapMaticExample as initTileMapMatic };
