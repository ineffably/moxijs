/**
 * PIKCELL Bar Card - Main action bar with commands
 * 
 * ⚠️ CRITICAL: This component uses GRID UNITS for all measurements!
 * - Button spacing: px(2) = 2 grid units (NOT 2 pixels!)
 * - Bar height: 12 grid units (converted internally)
 * - All spacing/margins use px() to convert grid units to pixels
 * 
 * @see ../utilities/README.md for grid system documentation
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton } from '../components/pixel-button';
import { createPixelDialog } from '../components/pixel-dialog';
import { GRID, BORDER, px } from 'moxi';
import { getAllThemes, setThemeByMetadata } from '../theming/theme';
import { SpriteSheetType } from '../controllers/sprite-sheet-controller';

export interface CommanderBarCallbacks {
  onNew?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onApplyLayout?: () => void;
  onSaveLayoutSlot?: (slot: 'A' | 'B' | 'C') => void;
  onLoadLayoutSlot?: (slot: 'A' | 'B' | 'C') => void;
  hasLayoutSlot?: (slot: 'A' | 'B' | 'C') => boolean;
  onThemeChange?: () => void;
  onScaleChange?: (scale: number) => void; // TEMPORARY: For testing GRID scaling
}

export interface CommanderBarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  scene: PIXI.Container;
  width?: number;  // Optional width in grid units (defaults to auto-calculated)
  callbacks?: CommanderBarCallbacks;
}

export interface CommanderBarCardResult {
  card: PixelCard;
  container: PIXI.Container;
  destroy: () => void;
}

/**
 * Creates a PIKCELL bar for actions and options
 */
export function createCommanderBarCard(options: CommanderBarCardOptions): CommanderBarCardResult {
  const { x, y, renderer, scene, width, callbacks } = options;

  // Track created buttons for cleanup
  let createdButtons: Array<{ destroy: () => void }> = [];

  const canvasWidth = renderer.width;
  const barHeight = 12; // Grid units for PIKCELL bar

  // IMPORTANT: Card adds BORDER.total * 2 + GRID.padding * 2 to contentWidth (in grid units)
  // So we must subtract those from the desired total width to get the correct contentWidth
  // Formula: contentWidth = (canvasWidth / px(1)) - (BORDER.total * 2) - (GRID.padding * 2)
  const barWidth = width ?? (Math.floor(canvasWidth / px(1)) - (BORDER.total * 2) - (GRID.padding * 2));

  // Create the card
  const card = new PixelCard({
    title: 'PIKCELL',
    x,
    y,
    contentWidth: barWidth,
    contentHeight: barHeight,
    renderer,
    minContentSize: true, // Prevent resizing below content's actual size
    onResize: (newWidth, newHeight) => {
      drawCommands();
    },
    onRefresh: () => {
      drawCommands();
    }
  });

  const contentContainer = card.getContentContainer();

  function drawCommands() {
    // Cleanup old buttons
    createdButtons.forEach(btn => btn.destroy());
    createdButtons = [];
    contentContainer.removeChildren();

    const buttonHeight = 12; // Grid units (same as bar height for full height button)
    const buttonSpacing = px(2);

    // Left side buttons (flush with content container left edge)
    let currentX = 0;

    // New button
    const newButton = createPixelButton({
      height: buttonHeight,
      label: 'New',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        if (callbacks?.onNew) {
          callbacks.onNew();
        }
      }
    });
    createdButtons.push(newButton);
    newButton.container.position.set(currentX, 0);
    contentContainer.addChild(newButton.container);
    currentX += newButton.container.width + buttonSpacing;

    // Save button
    const saveButton = createPixelButton({
      height: buttonHeight,
      label: 'Save',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        if (callbacks?.onSave) {
          callbacks.onSave();
        }
      }
    });
    createdButtons.push(saveButton);
    saveButton.container.position.set(currentX, 0);
    contentContainer.addChild(saveButton.container);
    currentX += saveButton.container.width + buttonSpacing;

    // Load button
    const loadButton = createPixelButton({
      height: buttonHeight,
      label: 'Load',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        if (callbacks?.onLoad) {
          callbacks.onLoad();
        }
      }
    });
    createdButtons.push(loadButton);
    loadButton.container.position.set(currentX, 0);
    contentContainer.addChild(loadButton.container);
    currentX += loadButton.container.width + buttonSpacing;

    // Export button
    const exportButton = createPixelButton({
      height: buttonHeight,
      label: 'Export',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        if (callbacks?.onExport) {
          callbacks.onExport();
        }
      }
    });
    createdButtons.push(exportButton);
    exportButton.container.position.set(currentX, 0);
    contentContainer.addChild(exportButton.container);
    currentX += exportButton.container.width + buttonSpacing;

    // Right side buttons - positioned at the far right
    const rightButtonsSpacing = px(2);

    // Layout button (auto-sized based on text)
    const layoutButton = createPixelButton({
      height: buttonHeight,
      label: 'Layout',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Build button list dynamically
        const buttons: Array<{ label: string; onClick: () => void }> = [];

        // Reset layout button
        buttons.push({
          label: 'Reset',
          onClick: () => {
            if (callbacks?.onApplyLayout) {
              callbacks.onApplyLayout();
            }
          }
        });

        // Slot A, B, C load/save buttons
        const slots: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
        slots.forEach(slot => {
          const hasSlot = callbacks?.hasLayoutSlot?.(slot) ?? false;

          // Load button (if slot has saved layout)
          if (hasSlot) {
            buttons.push({
              label: `Load ${slot}`,
              onClick: () => {
                if (callbacks?.onLoadLayoutSlot) {
                  callbacks.onLoadLayoutSlot(slot);
                }
              }
            });
          }

          // Save button
          buttons.push({
            label: hasSlot ? `Save ${slot}` : `Save ${slot}`,
            onClick: () => {
              if (callbacks?.onSaveLayoutSlot) {
                callbacks.onSaveLayoutSlot(slot);
              }
            }
          });
        });

        // Show layout dialog
        const dialog = createPixelDialog({
          title: 'Layout',
          message: 'Choose layout:',
          buttons,
          renderer
        });
        scene.addChild(dialog.container);
      }
    });
    createdButtons.push(layoutButton);

    // Theme button (auto-sized based on text)
    const themeButton = createPixelButton({
      height: buttonHeight,
      label: 'Theme',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Show theme selection dialog
        // Dynamically create buttons from all available themes
        const allThemes = getAllThemes();
        const dialog = createPixelDialog({
          title: 'Choose Theme',
          message: 'Select a theme:',
          buttons: allThemes.map(themeMetadata => ({
            label: themeMetadata.name,
            onClick: () => {
              setThemeByMetadata(themeMetadata);
              // Update theme callback
              if (callbacks?.onThemeChange) {
                callbacks.onThemeChange();
              }
            }
          })),
          renderer
        });
        scene.addChild(dialog.container);
      }
    });
    createdButtons.push(themeButton);

    // Position right-side buttons (get their widths after creation)
    const layoutButtonWidth = layoutButton.container.width / px(1); // Convert from pixels to grid units
    const themeButtonWidth = themeButton.container.width / px(1);

    // Position before theme button (content width - both buttons - spacing)
    layoutButton.container.position.set(px(barWidth - layoutButtonWidth - themeButtonWidth) - rightButtonsSpacing, 0);
    contentContainer.addChild(layoutButton.container);

    // Position at far right (content width - button width)
    themeButton.container.position.set(px(barWidth - themeButtonWidth), 0);
    contentContainer.addChild(themeButton.container);
  }

  // Initial draw
  drawCommands();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    destroy: () => {
      createdButtons.forEach(btn => btn.destroy());
      createdButtons = [];
      card.container.destroy({ children: true });
    }
  };
}
