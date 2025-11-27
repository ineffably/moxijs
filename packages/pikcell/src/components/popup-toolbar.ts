/**
 * Popup Toolbar Component
 *
 * A lightweight popup toolbar that appears next to a button when clicked.
 * Used for tool sub-menus like shape selection.
 */
import * as PIXI from 'pixi.js';
import { GRID, px } from 'moxi';
import { getTheme } from '../theming/theme';
import { ComponentResult } from '../interfaces/components';
import { createPixelButton, PixelButtonResult } from './pixel-button';

export interface PopupToolbarButton {
  /** Factory function to create the icon (called each time buttons are created) */
  createIcon: () => PIXI.Sprite | PIXI.Graphics;
  /** Tooltip text */
  tooltip?: string;
  /** Unique identifier for this option */
  id: string;
}

export interface PopupToolbarOptions {
  /** Buttons to display in the popup */
  buttons: PopupToolbarButton[];
  /** Size of each button in grid units */
  buttonSize?: number;
  /** Spacing between buttons in grid units */
  buttonSpacing?: number;
  /** Direction to arrange buttons */
  direction?: 'horizontal' | 'vertical';
  /** Callback when an option is selected */
  onSelect?: (id: string) => void;
  /** Callback when popup is closed without selection */
  onClose?: () => void;
  /** Currently selected option ID */
  selectedId?: string;
}

export interface PopupToolbarResult extends ComponentResult {
  /** Show the popup at a position relative to a parent element */
  show(parentX: number, parentY: number, parentWidth: number, parentHeight: number): void;
  /** Hide the popup */
  hide(): void;
  /** Check if popup is currently visible */
  isVisible(): boolean;
  /** Get the currently selected ID */
  getSelectedId(): string | undefined;
  /** Set the selected option */
  setSelectedId(id: string): void;
}

/**
 * Creates a popup toolbar component
 */
export function createPopupToolbar(options: PopupToolbarOptions): PopupToolbarResult {
  const {
    buttons,
    buttonSize = 14,
    buttonSpacing = 1,
    direction = 'horizontal',
    onSelect,
    onClose
  } = options;

  let selectedId = options.selectedId;
  let isShowing = false;

  const container = new PIXI.Container();
  container.visible = false;
  container.eventMode = 'static';

  // Background graphics
  const background = new PIXI.Graphics();
  background.roundPixels = true;
  container.addChild(background);

  // Content container for buttons
  const contentContainer = new PIXI.Container();
  container.addChild(contentContainer);

  // Track created buttons for cleanup
  const createdButtons: PixelButtonResult[] = [];

  /**
   * Calculate popup dimensions
   */
  function getPopupDimensions(): { width: number; height: number } {
    const numButtons = buttons.length;
    if (direction === 'horizontal') {
      const width = numButtons * buttonSize + (numButtons - 1) * buttonSpacing;
      return { width, height: buttonSize };
    } else {
      const height = numButtons * buttonSize + (numButtons - 1) * buttonSpacing;
      return { width: buttonSize, height };
    }
  }

  /**
   * Draw the popup background
   */
  function drawBackground() {
    background.clear();
    const theme = getTheme();
    const dims = getPopupDimensions();

    const borderWidth = GRID.border;
    const padding = 2; // Grid units of padding
    const totalWidth = dims.width + padding * 2 + borderWidth * 4;
    const totalHeight = dims.height + padding * 2 + borderWidth * 4;

    // Drop shadow
    const shadowOffset = 1;
    background.rect(px(shadowOffset), px(shadowOffset), px(totalWidth), px(totalHeight));
    background.fill({ color: 0x000000, alpha: 0.3 });

    // Outer border (strong)
    background.rect(0, 0, px(totalWidth), px(totalHeight));
    background.fill({ color: theme.borderStrong });

    // Middle border (subtle)
    background.rect(px(borderWidth), px(borderWidth),
                    px(totalWidth - borderWidth * 2), px(totalHeight - borderWidth * 2));
    background.fill({ color: theme.borderSubtle });

    // Inner border (strong)
    background.rect(px(borderWidth * 2), px(borderWidth * 2),
                    px(totalWidth - borderWidth * 4), px(totalHeight - borderWidth * 4));
    background.fill({ color: theme.borderStrong });

    // Background fill
    background.rect(px(borderWidth * 2 + 1), px(borderWidth * 2 + 1),
                    px(totalWidth - borderWidth * 4 - 2), px(totalHeight - borderWidth * 4 - 2));
    background.fill({ color: theme.backgroundSurface });
  }

  /**
   * Create buttons
   */
  function createButtons() {
    // Clear existing buttons
    createdButtons.forEach(btn => btn.destroy());
    createdButtons.length = 0;
    contentContainer.removeChildren();

    const borderWidth = GRID.border;
    const padding = 2;
    const offsetX = px(borderWidth * 2 + padding);
    const offsetY = px(borderWidth * 2 + padding);

    buttons.forEach((btnConfig, index) => {
      const btn = createPixelButton({
        size: buttonSize,
        icon: btnConfig.createIcon(),
        selected: btnConfig.id === selectedId,
        selectionMode: 'press',
        actionMode: 'toggle',
        tooltip: btnConfig.tooltip,
        onClick: () => {
          selectedId = btnConfig.id;
          if (onSelect) {
            onSelect(btnConfig.id);
          }
          hide();
        }
      });

      if (direction === 'horizontal') {
        btn.container.position.set(
          offsetX + index * px(buttonSize + buttonSpacing),
          offsetY
        );
      } else {
        btn.container.position.set(
          offsetX,
          offsetY + index * px(buttonSize + buttonSpacing)
        );
      }

      contentContainer.addChild(btn.container);
      createdButtons.push(btn);
    });
  }

  /**
   * Show the popup positioned relative to a parent element
   */
  function show(parentX: number, parentY: number, parentWidth: number, parentHeight: number): void {
    drawBackground();
    createButtons();

    // Position popup to the right of the parent by default
    const dims = getPopupDimensions();
    const borderWidth = GRID.border;
    const padding = 2;
    const totalWidth = px(dims.width + padding * 2 + borderWidth * 4);

    // Position to the right of parent with small gap
    container.position.set(
      parentX + parentWidth + px(2),
      parentY
    );

    container.visible = true;
    isShowing = true;

    // Setup click-outside handler
    setupClickOutsideHandler();
  }

  /**
   * Hide the popup
   */
  function hide(): void {
    container.visible = false;
    isShowing = false;
    removeClickOutsideHandler();
    if (onClose && !selectedId) {
      onClose();
    }
  }

  // Click outside handler
  let clickOutsideHandler: ((e: PIXI.FederatedPointerEvent) => void) | null = null;

  function setupClickOutsideHandler(): void {
    // We'll rely on the parent to handle click-outside logic
    // since we need access to the stage
  }

  function removeClickOutsideHandler(): void {
    clickOutsideHandler = null;
  }

  // Initial draw (buttons created on show())
  drawBackground();

  return {
    container,
    show,
    hide,
    isVisible: () => isShowing,
    getSelectedId: () => selectedId,
    setSelectedId: (id: string) => {
      selectedId = id;
      // Update button states
      createdButtons.forEach((btn, index) => {
        btn.setSelected(buttons[index].id === id);
      });
    },
    destroy: () => {
      removeClickOutsideHandler();
      createdButtons.forEach(btn => btn.destroy());
      container.destroy({ children: true });
    }
  };
}
