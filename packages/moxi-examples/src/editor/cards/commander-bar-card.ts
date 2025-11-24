/**
 * Commander Bar Card - Main action bar with commands
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
  onApplyLayout?: () => void;
  onThemeChange?: () => void;
}

export interface CommanderBarCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  scene: PIXI.Container;
  callbacks?: CommanderBarCallbacks;
}

export interface CommanderBarCardResult {
  card: PixelCard;
}

/**
 * Creates a commander bar for actions and options
 */
export function createCommanderBarCard(options: CommanderBarCardOptions): CommanderBarCardResult {
  const { x, y, renderer, scene, callbacks } = options;

  const canvasWidth = renderer.width;
  const barHeight = 12; // Grid units for commander bar

  // Calculate width in grid units (canvas width - margins, converted to grid units)
  const margin = 20;
  const barWidth = Math.floor((canvasWidth - margin * 2 - px(BORDER.total * 2)) / px(1));

  // Create the card
  const card = new PixelCard({
    title: 'Commander',
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
    contentContainer.removeChildren();

    const buttonHeight = 12; // Grid units (same as bar height for full height button)
    const buttonSpacing = px(2);

    // Left side buttons (starting at x=0)
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
    newButton.position.set(currentX, 0);
    contentContainer.addChild(newButton);
    currentX += newButton.width + buttonSpacing;

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
    saveButton.position.set(currentX, 0);
    contentContainer.addChild(saveButton);
    currentX += saveButton.width + buttonSpacing;

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
    loadButton.position.set(currentX, 0);
    contentContainer.addChild(loadButton);

    // Right side buttons - positioned at the far right
    const rightButtonsSpacing = px(2);

    // Layout button (auto-sized based on text)
    const layoutButton = createPixelButton({
      height: buttonHeight,
      label: 'Layout',
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        // Show layout dialog
        const dialog = createPixelDialog({
          title: 'Layout',
          message: 'Choose layout preset:',
          buttons: [
            {
              label: 'Default',
              onClick: () => {
                if (callbacks?.onApplyLayout) {
                  callbacks.onApplyLayout();
                }
              }
            }
          ],
          renderer
        });
        scene.addChild(dialog);
      }
    });

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
        scene.addChild(dialog);
      }
    });

    // Position right-side buttons (get their widths after creation)
    const layoutButtonWidth = layoutButton.width / px(1); // Convert from pixels to grid units
    const themeButtonWidth = themeButton.width / px(1);

    // Position before theme button (content width - both buttons - spacing)
    layoutButton.position.set(px(barWidth - layoutButtonWidth - themeButtonWidth) - rightButtonsSpacing, 0);
    contentContainer.addChild(layoutButton);

    // Position at far right (content width - button width)
    themeButton.position.set(px(barWidth - themeButtonWidth), 0);
    contentContainer.addChild(themeButton);
  }

  // Initial draw
  drawCommands();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return {
    card
  };
}
