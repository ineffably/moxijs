/**
 * Tool Card - Drawing tool selector
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton } from '../components/pixel-button';
import { GRID, px } from '@moxijs/core';
import { createCardZoomHandler } from '../utilities/card-zoom-handler';
import { createManagedCard } from '../utilities/managed-card';
import { layoutButtonColumn } from '../utilities/button-layout';
import { ToolType } from '../theming/tool-icons';
import { CardResult } from '../interfaces/components';
import { TOOL_CARD_CONFIG } from '../config/card-configs';

export interface ToolCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  tools?: ToolType[];
  selectedToolIndex?: number;
  onToolSelect?: (toolIndex: number, tool: ToolType) => void;
}

export interface ToolCardResult extends CardResult {
  getSelectedToolIndex: () => number;
  getSelectedTool: () => ToolType;
  setSelectedToolIndex: (index: number) => void;
}

/** Tool display names */
const TOOL_NAMES: Record<ToolType, string> = {
  pencil: 'Pencil',
  eraser: 'Eraser',
  fill: 'Fill Bucket',
  eyedrop: 'Eye Dropper',
  selection: 'Selection',
  shape: 'Shapes'
};

/**
 * Creates a tool selection card
 */
export function createToolCard(options: ToolCardOptions): ToolCardResult {
  const { x, y, renderer, onToolSelect } = options;

  // Tool state
  let selectedToolIndex = options.selectedToolIndex ?? 0;
  const tools: ToolType[] = options.tools ?? ['pencil', 'eraser', 'fill', 'eyedrop'];

  // Sizing state
  let toolWidth = TOOL_CARD_CONFIG.defaultWidth;
  let toolHeight = TOOL_CARD_CONFIG.defaultHeight;
  const rows = tools.length;

  // Calculate initial content size
  const contentWidth = toolWidth;
  const contentHeight = rows * toolHeight + (rows - 1) * GRID.gap;

  // Create the managed card
  const managed = createManagedCard({
    title: 'Tools',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    onResize: (newWidth, newHeight) => {
      const maxHeight = Math.floor((newHeight - (rows - 1) * GRID.gap) / rows);
      toolHeight = Math.max(TOOL_CARD_CONFIG.minHeight, Math.min(TOOL_CARD_CONFIG.maxHeight, maxHeight));
      toolWidth = Math.max(TOOL_CARD_CONFIG.minWidth, Math.min(TOOL_CARD_CONFIG.maxWidth, newWidth));
      drawTools();
    },
    onRefresh: () => drawTools()
  });

  const { card, contentContainer } = managed;

  /**
   * Draw all tool buttons
   */
  function drawTools() {
    managed.clearChildren();
    contentContainer.removeChildren();

    const buttons = tools.map((tool, i) => {
      const btn = createPixelButton({
        width: toolWidth,
        height: toolHeight,
        selected: i === selectedToolIndex,
        label: TOOL_NAMES[tool],
        selectionMode: 'press',
        actionMode: 'toggle',
        tooltip: TOOL_NAMES[tool],
        onClick: () => {
          selectedToolIndex = i;
          drawTools();
          onToolSelect?.(i, tool);
        }
      });
      managed.trackChild(btn);
      contentContainer.addChild(btn.container);
      return btn;
    });

    layoutButtonColumn({
      items: buttons,
      spacing: GRID.gap
    });
  }

  // Mouse wheel zoom handler
  const wheelHandler = createCardZoomHandler(renderer, card, (delta) => {
    toolWidth = Math.max(TOOL_CARD_CONFIG.minWidth, Math.min(TOOL_CARD_CONFIG.maxWidth, toolWidth + delta * 2));
    toolHeight = Math.max(TOOL_CARD_CONFIG.minHeight, Math.min(TOOL_CARD_CONFIG.maxHeight, toolHeight + delta));

    card.setContentSize(toolWidth, rows * toolHeight + (rows - 1) * GRID.gap);
    drawTools();
  });

  if (typeof window !== 'undefined') {
    managed.addEventListenerTracked(window, 'wheel', wheelHandler, { passive: false });
  }

  // Initial draw
  drawTools();

  return {
    card,
    container: card.container,
    getSelectedToolIndex: () => selectedToolIndex,
    getSelectedTool: () => tools[selectedToolIndex],
    setSelectedToolIndex: (index: number) => {
      if (index >= 0 && index < tools.length) {
        selectedToolIndex = index;
        drawTools();
      }
    },
    destroy: managed.destroy
  };
}
