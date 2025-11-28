/**
 * Tool Card - Drawing tool selector
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton, PixelButtonResult } from '../components/pixel-button';
import { GRID, px } from 'moxijs';
import { createCardZoomHandler } from '../utilities/card-zoom-handler';
import { ToolType } from '../theming/tool-icons';
import { CardResult } from '../interfaces/components';

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

  // Track created buttons for cleanup
  const createdButtons: PixelButtonResult[] = [];
  let wheelHandler: ((e: WheelEvent) => void) | null = null;

  // Tool state
  let selectedToolIndex = options.selectedToolIndex ?? 0;
  const tools: ToolType[] = options.tools ?? ['pencil', 'eraser', 'fill', 'eyedrop'];

  let toolWidth = 46; // Grid units per tool button width (38 * 1.2 = 45.6, rounded to 46)
  let toolHeight = 12; // Grid units per tool button height
  let fontScale = GRID.fontScale; // Local font scale that can be modified
  let toolsPerRow = 1; // One button per row (vertical layout)
  let rows = 4; // Four tools stacked vertically

  // Calculate content size
  const contentWidth = toolWidth;
  const contentHeight = rows * toolHeight + (rows - 1) * GRID.gap;

  // Create the card
  const card = new PixelCard({
    title: 'Tools',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    onResize: (newWidth, newHeight) => {
      // Update tool dimensions to fit the new size
      // Keep vertical layout (1 column, 4 rows)
      const maxHeight = Math.floor((newHeight - (rows - 1) * GRID.gap) / rows);
      toolHeight = Math.max(4, Math.min(20, maxHeight));
      toolWidth = Math.max(23, Math.min(86, newWidth)); // Updated min/max to reflect 44% wider (1.2 * 1.2)

      // Scale font proportionally with button height
      // Base: toolHeight=12 → fontScale=0.25 (16px)
      // Scale font linearly: fontScale = 0.25 * (toolHeight / 12)
      fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

      drawTools();
    },
    onRefresh: () => {
      drawTools();
    }
  });

  const contentContainer = card.getContentContainer();

  // Draw tools
  function drawTools() {
    // Cleanup old buttons
    createdButtons.forEach(btn => btn.destroy());
    createdButtons.length = 0;
    contentContainer.removeChildren();

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const row = i; // Vertical layout, one per row

      const toolX = 0;
      const toolY = px(row * (toolHeight + GRID.gap));

      const toolButton = createPixelButton({
        width: toolWidth,
        height: toolHeight,
        selected: i === selectedToolIndex,
        label: TOOL_NAMES[tool],
        selectionMode: 'press',
        actionMode: 'toggle',
        tooltip: TOOL_NAMES[tool],
        onClick: () => {
          selectedToolIndex = i;
          console.log(`Selected tool: ${tool}`);
          drawTools();
          if (onToolSelect) {
            onToolSelect(i, tool);
          }
        }
      });
      createdButtons.push(toolButton);

      toolButton.container.position.set(toolX, toolY);
      contentContainer.addChild(toolButton.container);
    }
  }

  // Mouse wheel zoom for tool size
  wheelHandler = createCardZoomHandler(renderer, card, (delta) => {
    // Adjust both width and height proportionally
    toolWidth = Math.max(23, Math.min(86, toolWidth + delta * 2));
    toolHeight = Math.max(4, Math.min(20, toolHeight + delta));

    // Scale font proportionally with button height
    fontScale = Math.max(0.1, Math.min(0.5, 0.25 * (toolHeight / 12)));

    // Update card content size
    const newContentWidth = toolWidth;
    const newContentHeight = rows * toolHeight + (rows - 1) * GRID.gap;
    card.setContentSize(newContentWidth, newContentHeight);

    drawTools();
  });

  if (typeof window !== 'undefined') {
    window.addEventListener('wheel', wheelHandler, { passive: false });

    card.container.on('destroyed', () => {
      if (wheelHandler) {
        window.removeEventListener('wheel', wheelHandler);
      }
    });
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
    destroy: () => {
      // Cleanup buttons
      createdButtons.forEach(btn => btn.destroy());
      createdButtons.length = 0;

      // Remove wheel handler
      if (wheelHandler && typeof window !== 'undefined') {
        window.removeEventListener('wheel', wheelHandler);
        wheelHandler = null;
      }

      // Destroy card
      card.container.destroy({ children: true });
    }
  };
}
