/**
 * Pixel-perfect button component for the sprite editor
 */
import * as PIXI from 'pixi.js';
import { GRID, px } from 'moxi-kit';
import { getTheme } from '../theming/theme';
import { ComponentResult } from '../interfaces/components';

// Re-export UI_COLORS for backward compatibility
export const UI_COLORS = {
  buttonBg: 0x3c3d3b,
  buttonBgHover: 0x4a4b49,
  buttonBgPressed: 0x2a2b29,
};

export type SelectionMode = 'highlight' | 'press';
export type ActionMode = 'click' | 'toggle';

export interface PixelButtonOptions {
  size?: number;          // Size in grid units (for square buttons)
  width?: number;         // Width in grid units (for rectangular buttons)
  height?: number;        // Height in grid units (for rectangular buttons)
  selected?: boolean;
  label?: string;
  icon?: PIXI.Sprite | PIXI.Graphics;   // Optional icon sprite or graphic
  backgroundColor?: number;
  onClick?: () => void;
  selectionMode?: SelectionMode;  // 'highlight' for swatches, 'press' for tool buttons (visual appearance)
  actionMode?: ActionMode;        // 'click' for simple click, 'toggle' for toggleable state (behavior)
  tooltip?: string;       // Optional tooltip text
}

export interface PixelButtonResult extends ComponentResult {
  /** The button graphics (alias for container) */
  button: PIXI.Graphics;
  /** Get the current selected state */
  isSelected(): boolean;
  /** Set the selected state (for toggle buttons) */
  setSelected(selected: boolean): void;
}

/**
 * Creates a pixel-perfect button with optional label
 *
 * Selection modes (visual appearance):
 * - 'highlight': Shows orange border when selected (for color swatches)
 * - 'press': Shows pressed state with bevel (for tool buttons)
 *
 * Action modes (behavior):
 * - 'click': Simple click action, no visual state change
 * - 'toggle': Toggleable selection state (for swatches, tool groups)
 */
export function createPixelButton(options: PixelButtonOptions): PixelButtonResult {
  const {
    size,
    width,
    height,
    selected = false,
    label,
    icon,
    backgroundColor = UI_COLORS.buttonBg,
    onClick,
    selectionMode = 'press',
    actionMode = 'click',
    tooltip
  } = options;

  // Track state
  let isSelectedState = selected;
  let tooltipContainer: PIXI.Container | null = null;
  let buttonText: PIXI.BitmapText | null = null;

  // Auto-calculate width for text labels if not explicitly provided
  let buttonWidth = width ?? size ?? 10;
  const buttonHeight = height ?? size ?? 10;

  // If label is provided and no explicit width, calculate based on text + padding
  if (label && !width && !size) {
    const tempText = new PIXI.BitmapText({
      text: label,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: 0xffffff,
      }
    });
    tempText.scale.set(GRID.fontScale);

    // Calculate text width in grid units
    const textWidthInGridUnits = Math.ceil(tempText.width / px(1));
    const bordersWidth = GRID.border * 4; // 2 borders on each side
    const paddingWidth = 2; // 1 grid unit on each side
    buttonWidth = textWidthInGridUnits + bordersWidth + paddingWidth;

    tempText.destroy();
  }

  const button = new PIXI.Graphics();
  button.roundPixels = true;
  button.eventMode = (onClick || tooltip) ? 'static' : 'auto';
  button.cursor = onClick ? 'pointer' : 'default';

  // Draw function to render button state
  function drawButton() {
    button.clear();

    const theme = getTheme();

    if (selectionMode === 'highlight') {
      // Highlight mode (for swatches)
      if (isSelectedState) {
        // Selected: accent border, then strong border, then background/color
        button.rect(0, 0, px(buttonWidth), px(buttonHeight));
        button.fill({ color: theme.accentPrimary });

        button.rect(px(GRID.border), px(GRID.border),
                    px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 2));
        button.fill({ color: theme.borderStrong });

        button.rect(px(GRID.border * 2), px(GRID.border * 2),
                    px(buttonWidth - GRID.border * 4), px(buttonHeight - GRID.border * 4));
        button.fill({ color: backgroundColor });
      } else {
        // Unselected: border, then background/color
        button.rect(0, 0, px(buttonWidth), px(buttonHeight));
        button.fill({ color: theme.borderStrong });

        button.rect(px(GRID.border), px(GRID.border),
                    px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 2));
        button.fill({ color: backgroundColor });
      }
    } else {
      // Press mode (for tool buttons)
      if (isSelectedState) {
        // Pressed: starts 1px lower, strong border, subtle border, background (no bevel)
        button.rect(0, px(1), px(buttonWidth), px(buttonHeight) - px(1));
        button.fill({ color: theme.borderStrong });

        button.rect(px(GRID.border), px(GRID.border + 1),
                    px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 2 - 1));
        button.fill({ color: theme.borderSubtle });

        button.rect(px(GRID.border * 2), px(GRID.border * 2 + 1),
                    px(buttonWidth - GRID.border * 4), px(buttonHeight - GRID.border * 4 - 1));
        button.fill({ color: backgroundColor });
      } else {
        // Unpressed: strong border, bevel at bottom, subtle border, background
        button.rect(0, 0, px(buttonWidth), px(buttonHeight));
        button.fill({ color: theme.borderStrong });

        // Bevel strip at bottom
        button.rect(px(GRID.border), px(buttonHeight - GRID.border * 2),
                    px(buttonWidth - GRID.border * 2), px(GRID.border));
        button.fill({ color: theme.backgroundOverlay });

        // Inner border
        button.rect(px(GRID.border), px(GRID.border),
                    px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 3));
        button.fill({ color: theme.borderSubtle });

        // Background
        button.rect(px(GRID.border * 2), px(GRID.border * 2),
                    px(buttonWidth - GRID.border * 4), px(buttonHeight - GRID.border * 5));
        button.fill({ color: backgroundColor });
      }
    }

    // Update content position
    // Press offset: when pressed, content moves down with button
    const pressOffset = (selectionMode === 'press' && isSelectedState) ? px(1) : 0;

    // Icons: shift up 1px to center in visible area (above bevel)
    if (icon) {
      const iconBaseY = (selectionMode === 'press') ? -px(1) : 0;
      icon.position.set(
        px(buttonWidth) / 2 - icon.width / 2,
        px(buttonHeight) / 2 - icon.height / 2 + iconBaseY + pressOffset
      );
      if (!button.children.includes(icon)) {
        button.addChild(icon);
      }
    }

    // Labels: no base offset, just move down when pressed
    if (buttonText) {
      buttonText.position.set(px(buttonWidth) / 2, px(buttonHeight) / 2 + pressOffset);
    }
  }

  // Tooltip support
  if (tooltip) {
    const createTooltip = () => {
      const container = new PIXI.Container();

      const text = new PIXI.BitmapText({
        text: tooltip,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: 0xffffff,
        }
      });
      text.roundPixels = true;
      text.scale.set(GRID.fontScale);

      const padding = px(2);
      const borderWidth = px(GRID.border);
      const tooltipWidth = text.width + padding * 2 + borderWidth * 2;
      const tooltipHeight = text.height + padding * 2 + borderWidth * 2;

      const bg = new PIXI.Graphics();
      bg.roundPixels = true;

      const shadowOffset = px(1);

      // Gray drop shadow
      bg.rect(shadowOffset, shadowOffset, tooltipWidth, tooltipHeight);
      bg.fill({ color: 0x686461 });

      // White outer border
      bg.rect(0, 0, tooltipWidth, tooltipHeight);
      bg.fill({ color: 0xffffff });

      // Black background
      bg.rect(borderWidth, borderWidth,
              tooltipWidth - borderWidth * 2,
              tooltipHeight - borderWidth * 2);
      bg.fill({ color: 0x000000 });

      container.addChild(bg);
      text.position.set(borderWidth + padding, borderWidth + padding);
      container.addChild(text);

      return container;
    };

    button.on('pointerover', (e: PIXI.FederatedPointerEvent) => {
      if (tooltipContainer) return;

      tooltipContainer = createTooltip();
      const local = e.getLocalPosition(button);
      tooltipContainer.position.set(local.x, local.y - tooltipContainer.height - 2);
      button.addChild(tooltipContainer);
    });

    button.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      if (tooltipContainer) {
        const local = e.getLocalPosition(button);
        tooltipContainer.position.set(local.x, local.y - tooltipContainer.height - 2);
      }
    });

    button.on('pointerout', () => {
      if (tooltipContainer) {
        button.removeChild(tooltipContainer);
        tooltipContainer.destroy();
        tooltipContainer = null;
      }
    });
  }

  // Initial draw
  drawButton();

  // Add icon if provided
  if (icon) {
    const iconBaseY = (selectionMode === 'press') ? -px(1) : 0;
    const pressOffset = (selectionMode === 'press' && isSelectedState) ? px(1) : 0;
    icon.position.set(
      px(buttonWidth) / 2 - icon.width / 2,
      px(buttonHeight) / 2 - icon.height / 2 + iconBaseY + pressOffset
    );
    button.addChild(icon);
  }
  // Add label if provided (and no icon)
  else if (label) {
    const theme = getTheme();
    buttonText = new PIXI.BitmapText({
      text: label,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: theme.textPrimary,
      }
    });
    buttonText.roundPixels = true;
    buttonText.scale.set(GRID.fontScale);
    buttonText.anchor.set(0.5);
    // Labels: no base offset, just move down when pressed
    const pressOffset = (selectionMode === 'press' && isSelectedState) ? px(1) : 0;
    buttonText.position.set(px(buttonWidth) / 2, px(buttonHeight) / 2 + pressOffset);
    button.addChild(buttonText);
  }

  // Add click handler if provided
  if (onClick) {
    button.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      onClick();
      e.stopPropagation();
    });
  }

  return {
    container: button,
    button,
    isSelected: () => isSelectedState,
    setSelected: (selected: boolean) => {
      isSelectedState = selected;
      drawButton();
    },
    destroy: () => {
      if (tooltipContainer) {
        tooltipContainer.destroy();
        tooltipContainer = null;
      }
      button.removeAllListeners();
      button.destroy({ children: true });
    }
  };
}
