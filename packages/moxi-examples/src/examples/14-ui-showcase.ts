import {
  setupMoxi,
  UITabs,
  TabItem,
  UILayer,
  UIScaleMode
} from 'moxi';
import { createButtonsShowcase } from './ui/buttons-showcase';

/**
 * Example 14: UI Showcase - Buttons
 *
 * Demonstrates:
 * - Different button styles (primary, secondary, success, danger)
 * - Rounded and pill-shaped buttons
 * - Size variations (small, medium, large)
 * - Modern color schemes
 * - Sprite-based buttons with BitmapText
 */
export async function initUIShowcase() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine } = await setupMoxi({
    hostElement: root,
    renderOptions: {
      width: 1600,
      height: 900,
      backgroundColor: 0x1a1a2e
    }
  });

  // Create tab items
  const tabItems: TabItem[] = [
    {
      key: 'buttons',
      label: 'Buttons',
      content: await createButtonsShowcase()
    }
  ];

  // Create tabs - use full canvas dimensions
  const tabs = new UITabs({
    items: tabItems,
    defaultActiveKey: 'buttons',
    type: 'line',
    width: 1600,
    height: 900,
    hashPrefix: 'ui-showcase',
    onChange: (key) => {
      console.log('Active tab changed to:', key);
    }
  });

  // Layout the tabs
  tabs.layout(1600, 900);

  // Create UI layer with scale mode
  const uiLayer = new UILayer({
    scaleMode: UIScaleMode.ScaleUI,
    targetWidth: 1600,
    targetHeight: 900
  });

  // Add tabs to UI layer, then layer to scene
  uiLayer.addChild(tabs.container);
  scene.addChild(uiLayer);

  // Update layer scale based on canvas size
  uiLayer.updateScale(1600, 900);

  // Initialize and start
  scene.init();
  engine.start();
}
