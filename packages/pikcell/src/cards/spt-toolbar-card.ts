/**
 * SPT Toolbar Card - Sprite sheet tools (Pan, Zoom)
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createSVGIconButton } from '../utilities/svg-icon-button';
import { px } from '@moxijs/core';
import { SPT_ICONS } from '../config/icons';
import { SPT_TOOLBAR_CONFIG } from '../config/card-configs';
import { createManagedCard } from '../utilities/managed-card';
import { layoutButtonColumn } from '../utilities/button-layout';

export type SPTTool = 'pan' | 'zoom';

/** Tool definition for data-driven creation */
interface SPTToolDef {
  id: SPTTool;
  iconKey: keyof typeof SPT_ICONS;
}

/** Tool definitions */
const SPT_TOOLS: SPTToolDef[] = [
  { id: 'pan', iconKey: 'pan' },
  { id: 'zoom', iconKey: 'zoom' }
];

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

  const { buttonSize, buttonSpacing } = SPT_TOOLBAR_CONFIG;

  const barWidth = buttonSize;
  const barHeight = SPT_TOOLS.length * buttonSize + (SPT_TOOLS.length - 1) * buttonSpacing;

  let selectedTool: SPTTool = options.selectedTool ?? 'pan';

  // Create the managed card
  const managed = createManagedCard({
    title: 'SPT',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => updateButtons()
  });

  const { card, contentContainer } = managed;

  /**
   * Create a tool button
   */
  async function createToolButton(toolDef: SPTToolDef): Promise<{ container: PIXI.Container; destroy: () => void }> {
    const btn = await createSVGIconButton({
      size: buttonSize,
      svgString: SPT_ICONS[toolDef.iconKey],
      selected: selectedTool === toolDef.id,
      selectionMode: 'press',
      actionMode: 'toggle',
      onClick: () => {
        selectedTool = toolDef.id;
        updateButtons();
        onToolSelect?.(toolDef.id);
      }
    });
    return btn;
  }

  /**
   * Update all buttons
   */
  async function updateButtons(): Promise<void> {
    managed.clearChildren();
    contentContainer.removeChildren();

    // Create all buttons in parallel
    const buttons = await Promise.all(
      SPT_TOOLS.map(async toolDef => {
        const btn = await createToolButton(toolDef);
        managed.trackChild(btn);
        contentContainer.addChild(btn.container);
        return btn;
      })
    );

    // Layout buttons in a column
    layoutButtonColumn({
      items: buttons,
      spacing: buttonSpacing
    });
  }

  // Initial render
  await updateButtons();

  return {
    card,
    container: card.container,
    getSelectedTool: () => selectedTool,
    setSelectedTool: (tool: SPTTool) => {
      selectedTool = tool;
      updateButtons();
    },
    destroy: managed.destroy
  };
}
