import {
  setupMoxi,
  UITabs,
  TabItem
} from 'moxi';
import { createBasicsTab } from './ui/basics';
import { createComponentsTab } from './ui/components';
import { createFormElementsTab } from './ui/form-elements';

/**
 * Example 14: UI Showcase with Tabs
 *
 * Demonstrates:
 * - UITabs component with multiple tabs
 * - Tab switching functionality
 * - Both line and card tab styles
 * - Organizing UI examples into tabbed interface
 */
export async function initUIShowcase() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const { scene, engine } = await setupMoxi({
    hostElement: root,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: 0x1a1a2e
    }
  });

  // Create tab items with actual UI examples
  const tabItems: TabItem[] = [
    {
      key: 'basics',
      label: 'UI Basics',
      content: createBasicsTab()
    },
    {
      key: 'components',
      label: 'Components',
      content: createComponentsTab()
    },
    {
      key: 'forms',
      label: 'Form Elements',
      content: createFormElementsTab()
    }
  ];

  // Create tabs - use full canvas dimensions
  const tabs = new UITabs({
    items: tabItems,
    defaultActiveKey: 'basics',
    type: 'line',
    width: 1280,
    height: 720,
    hashPrefix: 'ui-showcase', // Enable URL hash sync
    onChange: (key) => {
      console.log('Active tab changed to:', key);
    }
  });

  // Layout and add to scene
  tabs.layout(1280, 720);
  scene.addChild(tabs.container);

  // Initialize and start
  scene.init();
  engine.start();
}
