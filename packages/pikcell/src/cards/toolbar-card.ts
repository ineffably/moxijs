/**
 * Toolbar Card - Main tool selection toolbar for the sprite editor
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton, PixelButtonResult } from '../components/pixel-button';
import { createPopupToolbar, PopupToolbarResult } from '../components/popup-toolbar';
import { drawToolIconInto, drawShapeIconInto, ShapeType, ToolType } from '../theming/tool-icons';
import { getTheme } from '../theming/theme';
import { GRID, px } from '@moxijs/ui';
import { CardResult } from '../interfaces/components';
import { TOOLBAR_CARD_CONFIG } from '../config/card-configs';

/** Available main tools */
export type MainToolType = 'pencil' | 'eraser' | 'fill' | 'selection' | 'shape';

/** Combined tool state */
export interface ToolState {
  mainTool: MainToolType;
  shapeType: ShapeType;
}

/** Tool definition */
interface ToolDef {
  id: MainToolType;
  tooltip: string;
  hasPopup?: boolean;
}

/** Tool definitions */
const MAIN_TOOLS: ToolDef[] = [
  { id: 'pencil', tooltip: 'Pencil (P)' },
  { id: 'eraser', tooltip: 'Eraser (E)' },
  { id: 'fill', tooltip: 'Fill (F)' },
  { id: 'selection', tooltip: 'Selection (S)' },
  { id: 'shape', tooltip: 'Shapes (U)', hasPopup: true }
];

/** Shape tooltips */
const SHAPE_TOOLTIPS: Record<ShapeType, string> = {
  'line': 'Line',
  'circle': 'Circle',
  'circle-filled': 'Filled Circle',
  'square': 'Rectangle',
  'square-filled': 'Filled Rectangle'
};

/** Available shapes */
const SHAPE_OPTIONS: ShapeType[] = ['line', 'circle', 'circle-filled', 'square', 'square-filled'];

export interface ToolbarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  selectedTool?: MainToolType;
  selectedShape?: ShapeType;
  onToolSelect?: (tool: MainToolType, shapeType?: ShapeType) => void;
  /** Scene container for explosion effects */
  scene?: PIXI.Container;
  /** Enable pixel explosion effect on tool buttons */
  explodeEffect?: boolean;
}

export interface ToolbarCardResult extends CardResult {
  getSelectedTool: () => MainToolType;
  getSelectedShape: () => ShapeType;
  getToolState: () => ToolState;
  setSelectedTool: (tool: MainToolType) => void;
  setSelectedShape: (shape: ShapeType) => void;
}

/**
 * Creates the main toolbar card with tool buttons
 */
export function createToolbarCard(options: ToolbarCardOptions): ToolbarCardResult {
  const { x, y, renderer, onToolSelect, scene, explodeEffect = false } = options;

  const { buttonSize, buttonSpacing } = TOOLBAR_CARD_CONFIG;
  const numButtons = MAIN_TOOLS.length;
  const barWidth = buttonSize;
  const barHeight = numButtons * buttonSize + (numButtons - 1) * buttonSpacing;

  let selectedTool: MainToolType = options.selectedTool ?? 'pencil';
  let selectedShape: ShapeType = options.selectedShape ?? 'square';

  // Button references for state updates
  const buttonRefs: Map<MainToolType, PixelButtonResult> = new Map();
  let shapePopup: PopupToolbarResult | null = null;

  // Create the card
  const card = new PixelCard({
    title: 'Tools',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => updateButtons()
  });

  const contentContainer = card.getContentContainer();

  /** Create drawIcon function for a tool (draws directly into button graphics) */
  function createToolDrawIcon(tool: MainToolType): (g: PIXI.Graphics, x: number, y: number, color: number, pixelSize: number) => void {
    // For shape tool, use the selected shape icon
    if (tool === 'shape') {
      return (g, x, y, color, pixelSize) => drawShapeIconInto(g, selectedShape, x, y, color, pixelSize);
    }
    return (g, x, y, color, pixelSize) => drawToolIconInto(g, tool as ToolType, x, y, color, pixelSize);
  }

  /** Create drawIcon function for a shape */
  function createShapeDrawIcon(shape: ShapeType): (g: PIXI.Graphics, x: number, y: number, color: number, pixelSize: number) => void {
    return (g, x, y, color, pixelSize) => drawShapeIconInto(g, shape, x, y, color, pixelSize);
  }

  /** Select a tool */
  function selectTool(tool: MainToolType): void {
    selectedTool = tool;
    updateButtonStates();
    onToolSelect?.(tool, tool === 'shape' ? selectedShape : undefined);
  }

  /** Update button selected states without recreating */
  function updateButtonStates(): void {
    buttonRefs.forEach((btn, tool) => btn.setSelected(selectedTool === tool));
  }

  /** Show shape popup */
  function showShapePopup(): void {
    const shapeButton = buttonRefs.get('shape');
    if (!shapeButton) return;

    if (shapePopup?.isVisible()) {
      shapePopup.hide();
      return;
    }

    if (shapePopup) shapePopup.destroy();

    const popupButtonSize = 16; // Match main buttons for 1:1 icon sizing
    shapePopup = createPopupToolbar({
      buttons: SHAPE_OPTIONS.map(shape => ({
        id: shape,
        drawIcon: createShapeDrawIcon(shape),
        tooltip: SHAPE_TOOLTIPS[shape]
      })),
      buttonSize: popupButtonSize,
      buttonSpacing: 1,
      direction: 'vertical',
      verticalAnchor: 'bottom',
      selectedId: selectedShape,
      onSelect: (id) => {
        selectedShape = id as ShapeType;
        updateButtons();
        if (selectedTool === 'shape') {
          onToolSelect?.('shape', selectedShape);
        }
      }
    });

    card.container.addChild(shapePopup.container);

    // Position popup relative to shape button
    const buttonPos = shapeButton.container.getGlobalPosition();
    const cardPos = card.container.getGlobalPosition();
    shapePopup.show(
      buttonPos.x - cardPos.x,
      buttonPos.y - cardPos.y,
      px(buttonSize),
      px(buttonSize)
    );

    setupPopupClickOutside(shapeButton);
  }

  /** Setup click-outside handler */
  function setupPopupClickOutside(shapeButton: PixelButtonResult): void {
    setTimeout(() => {
      const handler = (e: PointerEvent) => {
        if (!shapePopup?.isVisible()) {
          renderer.events.domElement?.removeEventListener('pointerdown', handler);
          return;
        }

        const popupBounds = shapePopup.container.getBounds();
        const buttonBounds = shapeButton.container.getBounds();
        const inPopup = e.clientX >= popupBounds.minX && e.clientX <= popupBounds.maxX &&
                        e.clientY >= popupBounds.minY && e.clientY <= popupBounds.maxY;
        const inButton = e.clientX >= buttonBounds.minX && e.clientX <= buttonBounds.maxX &&
                         e.clientY >= buttonBounds.minY && e.clientY <= buttonBounds.maxY;

        if (!inPopup && !inButton) {
          shapePopup.hide();
          renderer.events.domElement?.removeEventListener('pointerdown', handler);
        }
      };

      renderer.events.domElement?.addEventListener('pointerdown', handler);
    }, 50);
  }

  /** Create/recreate all buttons */
  function updateButtons(): void {
    // Cleanup existing
    buttonRefs.forEach(btn => btn.destroy());
    buttonRefs.clear();
    contentContainer.removeChildren();

    // Create buttons with direct icon drawing for perfect grid alignment
    MAIN_TOOLS.forEach((toolDef, i) => {
      const btn = createPixelButton({
        size: buttonSize,
        drawIcon: createToolDrawIcon(toolDef.id),
        selected: selectedTool === toolDef.id,
        selectionMode: 'press',
        actionMode: 'toggle',
        tooltip: toolDef.tooltip,
        explodeEffect: explodeEffect && !!scene,
        explodeScene: scene,
        explodeScreenHeight: renderer.height,
        onClick: () => {
          selectTool(toolDef.id);
          if (toolDef.hasPopup) showShapePopup();
        }
      });
      btn.container.position.set(0, px((buttonSize + buttonSpacing) * i));
      contentContainer.addChild(btn.container);
      buttonRefs.set(toolDef.id, btn);
    });
  }

  // Initial creation
  updateButtons();

  // Ensure card respects minimum content size for all buttons
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    getSelectedTool: () => selectedTool,
    getSelectedShape: () => selectedShape,
    getToolState: () => ({ mainTool: selectedTool, shapeType: selectedShape }),
    setSelectedTool: (tool: MainToolType) => {
      selectedTool = tool;
      updateButtonStates();
    },
    setSelectedShape: (shape: ShapeType) => {
      selectedShape = shape;
      updateButtons();
    },
    destroy: () => {
      buttonRefs.forEach(btn => btn.destroy());
      buttonRefs.clear();
      shapePopup?.destroy();
      card.container.destroy({ children: true });
    }
  };
}
