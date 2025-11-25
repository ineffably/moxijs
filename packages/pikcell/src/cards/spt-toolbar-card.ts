/**
 * SPT Toolbar Card - Sprite sheet tools (Pan, Zoom)
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createSVGIconButton } from '../utilities/svg-icon-button';
import { GRID, px } from 'moxi';

export type SPTTool = 'pan' | 'zoom';

export interface SPTToolbarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  selectedTool?: SPTTool;
  onToolSelect?: (tool: SPTTool) => void;
}

export interface SPTToolbarCardResult {
  card: PixelCard;
  getSelectedTool: () => SPTTool;
  setSelectedTool: (tool: SPTTool) => void;
}

// SVG Icons (should match those in utilities/svg-icon-button.ts)
const SVG_ICONS = {
  PAN: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M13 11V6l2 2m-2-2l-2 2m2 9v-5m0 5l2-2m-2 2l-2-2m-5-3h5m-5 0l2 2m-2-2l2-2m9 2h-5m5 0l-2 2m2-2l-2-2"/>
  </svg>`,
  ZOOM_CURSOR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="7"/>
    <path d="M16 16l5 5M11 8v6M8 11h6"/>
  </svg>`
};

/**
 * Creates a sprite sheet tools toolbar (SPT)
 */
export async function createSPTToolbarCard(options: SPTToolbarCardOptions): Promise<SPTToolbarCardResult> {
  const { x, y, renderer, onToolSelect } = options;

  const buttonSize = 16; // Grid units - square buttons
  const buttonSpacing = 1; // Grid units between buttons
  const numButtons = 2; // Pan and Zoom

  const barWidth = buttonSize; // Single column
  const barHeight = numButtons * buttonSize + (numButtons - 1) * buttonSpacing; // Stack vertically

  let selectedTool: SPTTool = options.selectedTool ?? 'pan';

  // Create the card
  const card = new PixelCard({
    title: 'SPT',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => {
      updateButtons();
    }
  });

  const contentContainer = card.getContentContainer();

  function updateButtons() {
    // Remove all buttons
    contentContainer.removeChildren();

    // Re-add with updated selection
    createSVGIconButton({
      size: buttonSize,
      svgString: SVG_ICONS.PAN,
      iconColor: 0x000000,
      backgroundColor: 0xcccccc,
      selected: selectedTool === 'pan',
      selectionMode: 'press',
      actionMode: 'toggle',
      onClick: () => {
        selectedTool = 'pan';
        console.log('Pan tool selected');
        updateButtons();
        if (onToolSelect) {
          onToolSelect('pan');
        }
      }
    }).then(btn => {
      btn.position.set(0, 0);
      contentContainer.addChild(btn);
    });

    createSVGIconButton({
      size: buttonSize,
      svgString: SVG_ICONS.ZOOM_CURSOR,
      iconColor: 0x000000,
      backgroundColor: 0xcccccc,
      selected: selectedTool === 'zoom',
      selectionMode: 'press',
      actionMode: 'toggle',
      onClick: () => {
        selectedTool = 'zoom';
        console.log('Zoom tool selected');
        updateButtons();
        if (onToolSelect) {
          onToolSelect('zoom');
        }
      }
    }).then(btn => {
      btn.position.set(0, px(buttonSize + buttonSpacing));
      contentContainer.addChild(btn);
    });
  }

  // Initial buttons
  const panButton = await createSVGIconButton({
    size: buttonSize,
    svgString: SVG_ICONS.PAN,
    iconColor: 0x000000,
    backgroundColor: 0xcccccc,
    selected: selectedTool === 'pan',
    selectionMode: 'press',
    actionMode: 'toggle',
    onClick: () => {
      selectedTool = 'pan';
      console.log('Pan tool selected');
      updateButtons();
      if (onToolSelect) {
        onToolSelect('pan');
      }
    }
  });

  const zoomButton = await createSVGIconButton({
    size: buttonSize,
    svgString: SVG_ICONS.ZOOM_CURSOR,
    iconColor: 0x000000,
    backgroundColor: 0xcccccc,
    selected: selectedTool === 'zoom',
    selectionMode: 'press',
    actionMode: 'toggle',
    onClick: () => {
      selectedTool = 'zoom';
      console.log('Zoom tool selected');
      updateButtons();
      if (onToolSelect) {
        onToolSelect('zoom');
      }
    }
  });

  panButton.position.set(0, 0);
  zoomButton.position.set(0, px(buttonSize + buttonSpacing));

  contentContainer.addChild(panButton);
  contentContainer.addChild(zoomButton);

  return {
    card,
    getSelectedTool: () => selectedTool,
    setSelectedTool: (tool: SPTTool) => {
      selectedTool = tool;
      updateButtons();
    }
  };
}
