import { setupMoxi } from '@moxijs/core';
import {
  UITabs,
  TabItem,
  UILayer,
  UIScaleMode,
  UIFocusManager
} from '@moxijs/ui';
import { Assets } from 'pixi.js';
import { ASSETS } from '../../assets-config';
import { createButtonsShowcase } from '../ui/buttons-showcase';
import { createTextInputsShowcase } from '../ui/text-inputs-showcase';
import { createOptionControlsShowcase } from '../ui/option-controls-showcase';
import { createThemingShowcase } from '../ui/theming-showcase';
import { createPanelsShowcase } from '../ui/panels-showcase';

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
    showLoadingScene: true,
    renderOptions: {
      width: 1600,
      height: 900,
      backgroundColor: 0x1e1e1e, // Dark neutral gray theme
      resolution: window.devicePixelRatio || 2, // Match device DPR for crisp rendering
      antialias: false // Disable anti-aliasing for sharper text
    }
  });

  // Load PixelOperator8 font for crisp UI text
  await Assets.load({
    alias: 'PixelOperator8',
    src: ASSETS.PIXEL_OPERATOR8_FONT,
    data: {
      family: 'PixelOperator8'
    }
  });

  // Create a single focus manager for all tabs
  const focusManager = new UIFocusManager();

  // Create tab items
  const tabItems: TabItem[] = [
    {
      key: 'buttons',
      label: 'Buttons',
      content: await createButtonsShowcase()
    },
    {
      key: 'text-inputs',
      label: 'Text Inputs',
      content: await createTextInputsShowcase()
    },
    {
      key: 'option-controls',
      label: 'Option Controls',
      content: await createOptionControlsShowcase()
    },
    {
      key: 'theming',
      label: 'Theming & Forms',
      content: await createThemingShowcase()
    },
    {
      key: 'panels',
      label: 'Panels',
      content: await createPanelsShowcase()
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

      // Re-register the active tab's content with the focus manager
      const activeTab = tabItems.find(item => item.key === key);
      if (activeTab) {
        focusManager.clear();
        focusManager.registerContainer(activeTab.content);
        console.log(`📋 Re-registered ${focusManager.getFocusableComponents().length} focusable components`);
      }
    }
  });

  // Layout the tabs
  tabs.layout(1600, 900);

  // Register the initial tab's content with the focus manager
  const initialTab = tabItems.find(item => item.key === tabs.getActiveKey());
  if (initialTab) {
    focusManager.registerContainer(initialTab.content);
    console.log(`💡 Tab Focus Navigation enabled! Press Tab to navigate.`);
    console.log(`📋 Found ${focusManager.getFocusableComponents().length} focusable components`);
  }

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
