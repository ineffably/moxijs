/**
 * SPT Toolbar Card - Sprite sheet tools (Pan, Zoom)
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createSVGIconButton } from '../utilities/svg-icon-button';
import { GRID, px } from '@moxijs/core';
import { SPT_ICONS } from '../config/icons';
import { SPT_TOOLBAR_CONFIG } from '../config/card-configs';

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
  container: PIXI.Container;
  getSelectedTool: () => SPTTool;
  setSelectedTool: (tool: SPTTool) => void;
  destroy: () => void;
}

/**
 * Creates a sprite sheet tools toolbar (SPT)
 */
export async function createSPTToolbarCard(options: SPTToolbarCardOptions): Promise<SPTToolbarCardResult> {
  const { x, y, renderer, onToolSelect } = options;

  const { buttonSize, buttonSpacing, numButtons } = SPT_TOOLBAR_CONFIG;

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
      svgString: SPT_ICONS.pan,
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
      btn.container.position.set(0, 0);
      contentContainer.addChild(btn.container);
    });

    createSVGIconButton({
      size: buttonSize,
      svgString: SPT_ICONS.zoom,
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
      btn.container.position.set(0, px(buttonSize + buttonSpacing));
      contentContainer.addChild(btn.container);
    });
  }

  // Initial buttons
  const panButton = await createSVGIconButton({
    size: buttonSize,
    svgString: SPT_ICONS.pan,
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
    svgString: SPT_ICONS.zoom,
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

  panButton.container.position.set(0, 0);
  zoomButton.container.position.set(0, px(buttonSize + buttonSpacing));

  contentContainer.addChild(panButton.container);
  contentContainer.addChild(zoomButton.container);

  return {
    card,
    container: card.container,
    getSelectedTool: () => selectedTool,
    setSelectedTool: (tool: SPTTool) => {
      selectedTool = tool;
      updateButtons();
    },
    destroy: () => {
      card.container.destroy({ children: true });
    }
  };
}
