import { setupMoxi } from '@moxijs/core';
import {
  UITabs,
  TabItem,
  UILayer,
  UIScaleMode,
  UIFocusManager,
  UIFontConfig,
  UILabel
} from '@moxijs/ui';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../../assets-config';
import { createButtonsShowcase } from '../ui/buttons-showcase';
import { createTextInputsShowcase } from '../ui/text-inputs-showcase';
import { createOptionControlsShowcase } from '../ui/option-controls-showcase';
import { createThemingShowcase } from '../ui/theming-showcase';

/** MSDF Font configuration for UI showcase - children inherit this */
export const MSDF_FONT: UIFontConfig = {
  msdfFontFamily: 'PixelOperator8'
};

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

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    suppressContextMenu: true,
    renderOptions: {
      width: 1600,
      height: 900,
      backgroundColor: 0x1e1e1e, // Dark neutral gray theme
      resolution: window.devicePixelRatio || 2, // Match device DPR for crisp rendering
      antialias: false // Disable anti-aliasing for sharper text
    }
  });

  // Load PixelOperator8 font for Canvas text (fallback)
  await Assets.load({
    alias: 'PixelOperator8',
    src: ASSETS.PIXEL_OPERATOR8_FONT,
    data: {
      family: 'PixelOperator8'
    }
  });

  // Load MSDF font for crisp UI text at any scale
  await Assets.load({
    alias: 'PixelOperator8-MSDF',
    src: ASSETS.PIXEL_OPERATOR8_MSDF_JSON,
    data: { type: 'font' }
  });
  console.log('✅ MSDF font loaded:', MSDF_FONT.msdfFontFamily);

  // Create a single focus manager for all tabs
  const focusManager = new UIFocusManager();

  // Create tab items - pass MSDF_FONT config so children inherit it
  const tabItems: TabItem[] = [
    {
      key: 'buttons',
      label: 'Buttons',
      content: await createButtonsShowcase(MSDF_FONT)
    },
    {
      key: 'text-inputs',
      label: 'Text Inputs',
      content: await createTextInputsShowcase(MSDF_FONT)
    },
    {
      key: 'option-controls',
      label: 'Option Controls',
      content: await createOptionControlsShowcase(MSDF_FONT)
    },
    {
      key: 'theming',
      label: 'Theming & Forms',
      content: await createThemingShowcase(MSDF_FONT)
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
    scaleMode: UIScaleMode.None, // Start with no scaling, we'll control it manually
    targetWidth: 1600,
    targetHeight: 900
  });

  // Add tabs to UI layer, then layer to scene
  uiLayer.addChild(tabs.container);
  scene.addChild(uiLayer);

  // Zoom and pan state
  let currentScale = 1;
  const minScale = 0.25;
  const maxScale = 4;
  const zoomSpeed = 0.02; // Reduced for smoother zooming
  let isPanning = false;
  let lastPanPosition = { x: 0, y: 0 };

  // Create instructions and scale display on the right side of the tab bar
  const controlsDisplay = new PIXI.Container();
  controlsDisplay.position.set(1600 - 400, 4);

  // Line 1: Zoom instructions
  const zoomInstructions = new UILabel({
    text: 'Scroll: Zoom  |  Shift+Drag: Pan',
    fontSize: 14,
    color: 0xcccccc,
    msdfFontFamily: MSDF_FONT.msdfFontFamily
  });
  zoomInstructions.layout(260, 18);
  zoomInstructions.container.position.set(-100, 0);
  controlsDisplay.addChild(zoomInstructions.container);

  // Line 2: Reset instructions
  const resetInstructions = new UILabel({
    text: 'Double-click: Reset',
    fontSize: 14,
    color: 0xcccccc,
    msdfFontFamily: MSDF_FONT.msdfFontFamily
  });
  resetInstructions.layout(160, 18);
  resetInstructions.container.position.set(-100, 18);
  controlsDisplay.addChild(resetInstructions.container);

  // Scale display
  const scaleLabel = new UILabel({
    text: 'Scale: 1.00x',
    fontSize: 14,
    color: 0xeeeeee,
    msdfFontFamily: MSDF_FONT.msdfFontFamily
  });
  scaleLabel.layout(100, 32);
  scaleLabel.container.position.set(270, 10);
  controlsDisplay.addChild(scaleLabel.container);

  // Helper to update scale display
  const updateScaleDisplay = () => {
    scaleLabel.setText(`Scale: ${currentScale.toFixed(2)}x`);
  };

  // Helper to apply zoom centered on a point
  const applyZoom = (newScale: number, centerX: number, centerY: number) => {
    // Clamp scale
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    if (newScale === currentScale) return;

    // Calculate the point in UI layer space before zoom
    const beforeZoomX = (centerX - uiLayer.position.x) / currentScale;
    const beforeZoomY = (centerY - uiLayer.position.y) / currentScale;

    // Apply new scale
    currentScale = newScale;
    uiLayer.scale.set(currentScale, currentScale);

    // Calculate new position to keep the center point stationary
    uiLayer.position.x = centerX - beforeZoomX * currentScale;
    uiLayer.position.y = centerY - beforeZoomY * currentScale;

    updateScaleDisplay();
    console.log(`📐 UI Scale: ${currentScale.toFixed(2)}x`);
  };

  // Create a mask for overflow clipping
  const overflowMask = new PIXI.Graphics();
  overflowMask.rect(0, 0, 1600, 900);
  overflowMask.fill(0xffffff);
  uiLayer.mask = overflowMask;
  scene.addChild(overflowMask);

  // Add controls display directly to scene (above the UI layer)
  const controlsDisplayLayer = new PIXI.Container();
  controlsDisplayLayer.addChild(controlsDisplay);
  scene.addChild(controlsDisplayLayer);

  // Mouse wheel zoom handler
  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.addEventListener('wheel', (event: WheelEvent) => {
    event.preventDefault();

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) * (1600 / rect.width);
    const mouseY = (event.clientY - rect.top) * (900 / rect.height);

    // Calculate new scale
    const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newScale = currentScale * (1 + delta);

    applyZoom(newScale, mouseX, mouseY);
  }, { passive: false });

  // Mouse pan handlers
  canvas.addEventListener('mousedown', (event: MouseEvent) => {
    // Middle mouse button or shift+left click for panning
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      isPanning = true;
      lastPanPosition = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'grabbing';
      event.preventDefault();
    }
  });

  canvas.addEventListener('mousemove', (event: MouseEvent) => {
    if (!isPanning) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = 1600 / rect.width;
    const scaleY = 900 / rect.height;

    const deltaX = (event.clientX - lastPanPosition.x) * scaleX;
    const deltaY = (event.clientY - lastPanPosition.y) * scaleY;

    uiLayer.position.x += deltaX;
    uiLayer.position.y += deltaY;

    lastPanPosition = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener('mouseup', () => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = 'default';
    }
  });

  // Double-click to reset zoom and position
  canvas.addEventListener('dblclick', () => {
    currentScale = 1;
    uiLayer.scale.set(1, 1);
    uiLayer.position.set(0, 0);
    updateScaleDisplay();
    console.log('📐 UI Scale reset to 1.00x');
  });

  // Initialize and start
  scene.init();
  engine.start();
}
