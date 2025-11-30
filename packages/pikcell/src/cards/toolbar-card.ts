/**
 * Toolbar Card - Main tool selection toolbar for the sprite editor
 *
 * Contains buttons for:
 * - Pencil tool
 * - Selection tool
 * - Shape tool (with popup submenu)
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton, PixelButtonResult } from '../components/pixel-button';
import { createPopupToolbar, PopupToolbarResult } from '../components/popup-toolbar';
import { createShapeIcon, ShapeType } from '../theming/tool-icons';
import { getTheme } from '../theming/theme';
import { GRID, px, svgToTexture } from '@moxijs/core';
import { CardResult } from '../interfaces/components';
import { TOOL_ICONS } from '../config/icons';
import { TOOLBAR_CARD_CONFIG } from '../config/card-configs';

/** Available main tools */
export type MainToolType = 'pencil' | 'selection' | 'shape';

/** Combined tool state */
export interface ToolState {
  mainTool: MainToolType;
  shapeType: ShapeType;
}

export interface ToolbarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  /** Initial tool selection */
  selectedTool?: MainToolType;
  /** Initial shape type */
  selectedShape?: ShapeType;
  /** Callback when tool changes */
  onToolSelect?: (tool: MainToolType, shapeType?: ShapeType) => void;
}

export interface ToolbarCardResult extends CardResult {
  /** Get the currently selected main tool */
  getSelectedTool: () => MainToolType;
  /** Get the currently selected shape type */
  getSelectedShape: () => ShapeType;
  /** Get the full tool state */
  getToolState: () => ToolState;
  /** Set the selected tool */
  setSelectedTool: (tool: MainToolType) => void;
  /** Set the selected shape */
  setSelectedShape: (shape: ShapeType) => void;
}

/**
 * Creates the main toolbar card with tool buttons
 */
export function createToolbarCard(options: ToolbarCardOptions): ToolbarCardResult {
  const { x, y, renderer, onToolSelect } = options;

  const { buttonSize, buttonSpacing, numButtons } = TOOLBAR_CARD_CONFIG;

  const barWidth = buttonSize; // Single column
  const barHeight = numButtons * buttonSize + (numButtons - 1) * buttonSpacing;

  let selectedTool: MainToolType = options.selectedTool ?? 'pencil';
  let selectedShape: ShapeType = options.selectedShape ?? 'square';

  // Create the card
  const card = new PixelCard({
    title: 'Tools',
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

  // Track buttons for state management
  let pencilButton: PixelButtonResult | null = null;
  let selectionButton: PixelButtonResult | null = null;
  let shapeButton: PixelButtonResult | null = null;
  let shapePopup: PopupToolbarResult | null = null;

  /**
   * Calculate icon pixel size for a given button size in grid units
   */
  function getIconSizePx(btnSize: number): number {
    // Button has 2 borders (outer + inner) on each side = GRID.border * 4 total
    // Icons fill the content area (no extra margin - borders provide visual separation)
    const iconSizeGridUnits = btnSize - GRID.border * 4;
    return px(iconSizeGridUnits);
  }

  /**
   * Create icon sprite from SVG for a tool
   */
  async function createToolIconSprite(tool: MainToolType, btnSize: number = buttonSize): Promise<PIXI.Sprite> {
    const theme = getTheme();
    const size = getIconSizePx(btnSize);
    const svgString = TOOL_ICONS[tool];

    const texture = await svgToTexture({
      svgString,
      width: size,
      height: size,
      color: theme.textPrimary
    });

    const sprite = new PIXI.Sprite(texture);
    sprite.roundPixels = true;
    return sprite;
  }

  /**
   * Create icon for a shape
   */
  function createShapeIconSprite(shape: ShapeType, btnSize: number = buttonSize): PIXI.Sprite {
    const theme = getTheme();
    return createShapeIcon(shape, getIconSizePx(btnSize), theme.textPrimary, renderer);
  }

  /**
   * Select a tool and update button states
   */
  function selectTool(tool: MainToolType): void {
    selectedTool = tool;
    updateButtonStates();

    if (onToolSelect) {
      onToolSelect(tool, tool === 'shape' ? selectedShape : undefined);
    }
  }

  /**
   * Update button selected states
   */
  function updateButtonStates(): void {
    pencilButton?.setSelected(selectedTool === 'pencil');
    selectionButton?.setSelected(selectedTool === 'selection');
    shapeButton?.setSelected(selectedTool === 'shape');
  }

  /**
   * Show the shape popup toolbar
   */
  function showShapePopup(): void {
    if (shapePopup?.isVisible()) {
      shapePopup.hide();
      return;
    }

    // Get shape button position for popup placement
    if (!shapeButton) return;

    const theme = getTheme();
    const shapeOptions: ShapeType[] = ['circle', 'circle-filled', 'square', 'square-filled'];

    // Create popup with shape options
    if (shapePopup) {
      shapePopup.destroy();
    }

    const popupButtonSize = 14;
    shapePopup = createPopupToolbar({
      buttons: shapeOptions.map(shape => ({
        id: shape,
        createIcon: () => createShapeIconSprite(shape, popupButtonSize),
        tooltip: getShapeTooltip(shape)
      })),
      buttonSize: popupButtonSize,
      buttonSpacing: 1,
      direction: 'vertical',
      selectedId: selectedShape,
      onSelect: (id) => {
        selectedShape = id as ShapeType;
        // Update the shape button icon to show selected shape
        updateShapeButtonIcon();
        if (onToolSelect && selectedTool === 'shape') {
          onToolSelect('shape', selectedShape);
        }
      }
    });

    // Add popup to card container (above content)
    card.container.addChild(shapePopup.container);

    // Position popup relative to shape button
    const buttonGlobalPos = shapeButton.container.getGlobalPosition();
    const cardGlobalPos = card.container.getGlobalPosition();
    const relativeX = buttonGlobalPos.x - cardGlobalPos.x;
    const relativeY = buttonGlobalPos.y - cardGlobalPos.y;

    shapePopup.show(
      relativeX,
      relativeY,
      px(buttonSize),
      px(buttonSize)
    );

    // Setup click-outside to close popup
    setupPopupClickOutside();
  }

  /**
   * Get tooltip text for a shape
   */
  function getShapeTooltip(shape: ShapeType): string {
    switch (shape) {
      case 'circle': return 'Circle';
      case 'circle-filled': return 'Filled Circle';
      case 'square': return 'Rectangle';
      case 'square-filled': return 'Filled Rectangle';
    }
  }

  /**
   * Update shape button icon to reflect selected shape
   */
  function updateShapeButtonIcon(): void {
    // Recreate buttons to update icon
    updateButtons();
  }

  /**
   * Check if a point is within bounds
   */
  function boundsContains(bounds: PIXI.Bounds, x: number, y: number): boolean {
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
  }

  /**
   * Setup click handler to close popup when clicking outside
   */
  function setupPopupClickOutside(): void {
    // Add to stage after a brief delay to avoid immediate close
    setTimeout(() => {
      if (renderer.events && renderer.events.domElement) {
        renderer.events.domElement.addEventListener('pointerdown', function handler(e: PointerEvent) {
          if (shapePopup?.isVisible()) {
            const popupBounds = shapePopup.container.getBounds();
            if (!boundsContains(popupBounds, e.clientX, e.clientY)) {
              if (shapeButton) {
                const buttonBounds = shapeButton.container.getBounds();
                if (!boundsContains(buttonBounds, e.clientX, e.clientY)) {
                  shapePopup.hide();
                  renderer.events.domElement?.removeEventListener('pointerdown', handler);
                }
              }
            }
          } else {
            renderer.events.domElement?.removeEventListener('pointerdown', handler);
          }
        });
      }
    }, 50);
  }

  /**
   * Create/recreate all buttons
   */
  async function updateButtons(): Promise<void> {
    // Clean up existing buttons
    if (pencilButton) pencilButton.destroy();
    if (selectionButton) selectionButton.destroy();
    if (shapeButton) shapeButton.destroy();

    contentContainer.removeChildren();

    // Create all icons in parallel
    const [pencilIcon, selectionIcon, shapeIcon] = await Promise.all([
      createToolIconSprite('pencil'),
      createToolIconSprite('selection'),
      createToolIconSprite('shape')
    ]);

    // Pencil button
    pencilButton = createPixelButton({
      size: buttonSize,
      icon: pencilIcon,
      selected: selectedTool === 'pencil',
      selectionMode: 'press',
      actionMode: 'toggle',
      tooltip: 'Pencil (P)',
      onClick: () => selectTool('pencil')
    });
    pencilButton.container.position.set(0, 0);
    contentContainer.addChild(pencilButton.container);

    // Selection button
    selectionButton = createPixelButton({
      size: buttonSize,
      icon: selectionIcon,
      selected: selectedTool === 'selection',
      selectionMode: 'press',
      actionMode: 'toggle',
      tooltip: 'Selection (S)',
      onClick: () => selectTool('selection')
    });
    selectionButton.container.position.set(0, px(buttonSize + buttonSpacing));
    contentContainer.addChild(selectionButton.container);

    // Shape button - uses shape tool icon (popup shows specific shapes)
    shapeButton = createPixelButton({
      size: buttonSize,
      icon: shapeIcon,
      selected: selectedTool === 'shape',
      selectionMode: 'press',
      actionMode: 'toggle',
      tooltip: 'Shapes (U)',
      onClick: () => {
        selectTool('shape');
        showShapePopup();
      }
    });
    shapeButton.container.position.set(0, px((buttonSize + buttonSpacing) * 2));
    contentContainer.addChild(shapeButton.container);
  }

  // Initial creation
  updateButtons();

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
      updateShapeButtonIcon();
    },
    destroy: () => {
      if (pencilButton) pencilButton.destroy();
      if (selectionButton) selectionButton.destroy();
      if (shapeButton) shapeButton.destroy();
      if (shapePopup) shapePopup.destroy();
      card.container.destroy({ children: true });
    }
  };
}
