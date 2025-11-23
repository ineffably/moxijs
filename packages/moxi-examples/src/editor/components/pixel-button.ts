/**
 * Pixel-perfect button component for the sprite editor
 */
import * as PIXI from 'pixi.js';
import { GRID, px, UI_COLORS } from './pixel-card';
import { getTheme } from '../theming/theme';

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
export function createPixelButton(options: PixelButtonOptions): PIXI.Graphics {
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

  // Determine button dimensions
  const buttonWidth = width ?? size ?? 10;
  const buttonHeight = height ?? size ?? 10;

  const button = new PIXI.Graphics();
  button.roundPixels = true;
  button.eventMode = (onClick || tooltip) ? 'static' : 'auto';
  button.cursor = onClick ? 'pointer' : 'default';

  // Tooltip support
  if (tooltip) {
    let tooltipContainer: PIXI.Container | null = null;

    const createTooltip = () => {
      const tooltipContainer = new PIXI.Container();

      const text = new PIXI.BitmapText({
        text: tooltip,
        style: {
          fontFamily: 'PixelOperator8Bitmap',
          fontSize: 64,
          fill: 0xffffff,
        }
      });
      text.roundPixels = true;
      text.scale.set(GRID.fontScale); // Scale 64px down based on GRID.fontScale

      const padding = px(2); // Same padding as cards
      const borderWidth = px(GRID.border);
      const tooltipWidth = text.width + padding * 2 + borderWidth * 2;
      const tooltipHeight = text.height + padding * 2 + borderWidth * 2;

      const bg = new PIXI.Graphics();
      bg.roundPixels = true;

      const shadowOffset = px(1);

      // Gray drop shadow
      bg.rect(shadowOffset, shadowOffset, tooltipWidth, tooltipHeight);
      bg.fill({ color: 0x686461 }); // Same gray as title bar

      // White outer border
      bg.rect(0, 0, tooltipWidth, tooltipHeight);
      bg.fill({ color: 0xffffff });

      // Black background
      bg.rect(borderWidth, borderWidth,
              tooltipWidth - borderWidth * 2,
              tooltipHeight - borderWidth * 2);
      bg.fill({ color: 0x000000 });

      tooltipContainer.addChild(bg);
      text.position.set(borderWidth + padding, borderWidth + padding);
      tooltipContainer.addChild(text);

      return tooltipContainer;
    };

    button.on('pointerover', (e: PIXI.FederatedPointerEvent) => {
      if (tooltipContainer) return; // Already showing

      tooltipContainer = createTooltip();

      // Position tooltip relative to local mouse position
      const local = e.getLocalPosition(button);
      tooltipContainer.position.set(local.x, local.y - tooltipContainer.height - 2);

      button.addChild(tooltipContainer);
    });

    button.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      if (tooltipContainer) {
        // Update tooltip position to follow mouse
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

  const theme = getTheme();

  if (selectionMode === 'highlight') {
    // Highlight mode (for swatches)
    if (selected) {
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
    if (selected) {
      // Pressed: starts 1px lower, strong border, subtle border, background (no bevel)
      // Shift everything down by 1px and reduce height by 1px
      button.rect(0, px(1), px(buttonWidth), px(buttonHeight) - px(1));
      button.fill({ color: theme.borderStrong });

      button.rect(px(GRID.border), px(GRID.border + 1),
                  px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 2 - 1));
      button.fill({ color: theme.borderSubtle });

      button.rect(px(GRID.border * 2), px(GRID.border * 2 + 1),
                  px(buttonWidth - GRID.border * 4), px(buttonHeight - GRID.border * 4 - 1));
      button.fill({ color: backgroundColor });
    } else {
      // Unpressed: strong border, bevel at bottom (overlay layer), subtle border, background
      button.rect(0, 0, px(buttonWidth), px(buttonHeight));
      button.fill({ color: theme.borderStrong });

      // Bevel strip at bottom (between border and inner border)
      button.rect(px(GRID.border), px(buttonHeight - GRID.border * 2),
                  px(buttonWidth - GRID.border * 2), px(GRID.border));
      button.fill({ color: theme.backgroundOverlay });

      // Inner border (on top, sides, and covers most of bottom except bevel)
      button.rect(px(GRID.border), px(GRID.border),
                  px(buttonWidth - GRID.border * 2), px(buttonHeight - GRID.border * 3));
      button.fill({ color: theme.borderSubtle });

      // Background
      button.rect(px(GRID.border * 2), px(GRID.border * 2),
                  px(buttonWidth - GRID.border * 4), px(buttonHeight - GRID.border * 5));
      button.fill({ color: backgroundColor });
    }
  }

  // Add icon if provided
  if (icon) {
    // When pressed in 'press' mode, shift icon down 1px with the button
    const yOffset = (selectionMode === 'press' && selected) ? px(1) : 0;
    icon.position.set(px(buttonWidth) / 2 - icon.width / 2, px(buttonHeight) / 2 - icon.height / 2 + yOffset);
    button.addChild(icon);
  }
  // Add label if provided (and no icon)
  else if (label) {
    // When pressed, the whole button shifts down 1px, no additional offset needed
    const yOffset = 0;

    const buttonText = new PIXI.BitmapText({
      text: label,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: theme.textPrimary,
      }
    });
    buttonText.roundPixels = true;
    buttonText.scale.set(GRID.fontScale); // Scale 64px down based on GRID.fontScale
    buttonText.anchor.set(0.5);
    buttonText.position.set(px(buttonWidth) / 2, px(buttonHeight) / 2 + yOffset);
    button.addChild(buttonText);
  }

  // Add click handler if provided
  if (onClick) {
    button.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      onClick();
      e.stopPropagation();
    });
  }

  return button;
}
