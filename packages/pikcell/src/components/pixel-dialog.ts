/**
 * Pixel-perfect dialog component built on top of PixelCard
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { GRID, px } from 'moxi';
import { createPixelButton, PixelButtonResult } from './pixel-button';
import { createPixelCheckbox, PixelCheckboxResult } from './pixel-checkbox';
import { getTheme } from '../theming/theme';
import { ComponentResult } from '../interfaces/components';

export interface DialogButton {
  label: string;
  onClick: (checkboxStates?: Record<string, boolean>) => void;
}

export interface DialogCheckbox {
  name: string;
  label: string;
  defaultValue?: boolean;
}

export interface PixelDialogOptions {
  title: string;
  message: string;
  buttons: DialogButton[];
  checkboxes?: DialogCheckbox[];
  renderer: PIXI.Renderer;
}

export interface PixelDialogResult extends ComponentResult {
  /** Close and destroy the dialog */
  close(): void;
  /** Get checkbox states */
  getCheckboxStates(): Record<string, boolean>;
}

/**
 * Creates a pixel-perfect dialog centered on screen
 * Returns a result object with the container, close method, and destroy method
 */
export function createPixelDialog(options: PixelDialogOptions): PixelDialogResult {
  const { title, message, buttons, checkboxes = [], renderer } = options;

  // Track created components for cleanup
  const createdButtons: PixelButtonResult[] = [];
  const createdCheckboxes: PixelCheckboxResult[] = [];

  // Create overlay container
  const overlay = new PIXI.Container();

  // Semi-transparent backdrop
  const backdrop = new PIXI.Graphics();
  backdrop.rect(0, 0, renderer.width, renderer.height);
  backdrop.fill({ color: 0x000000, alpha: 0.5 });
  backdrop.eventMode = 'static'; // Block clicks to elements below
  overlay.addChild(backdrop);

  // Track checkbox states
  const checkboxStates: Record<string, boolean> = {};
  checkboxes.forEach(cb => {
    checkboxStates[cb.name] = cb.defaultValue ?? false;
  });

  // Calculate dialog dimensions
  const buttonWidth = 30; // Grid units per button
  const buttonHeight = 12; // Grid units
  const buttonSpacing = px(2);
  const checkboxHeight = 8; // Grid units per checkbox
  const messageMargin = px(4);

  // Create message text to measure it
  const theme = getTheme();
  const messageText = new PIXI.BitmapText({
    text: message,
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 64,
      fill: theme.textPrimary,
    }
  });
  messageText.roundPixels = true;
  messageText.scale.set(GRID.fontScale);

  // Calculate content dimensions based on message, checkboxes, and buttons
  const messageWidthInGridUnits = Math.ceil(messageText.width / px(1));
  const buttonsWidthInGridUnits = buttons.length * buttonWidth + (buttons.length - 1) * (buttonSpacing / px(1));
  const contentWidth = Math.max(messageWidthInGridUnits, buttonsWidthInGridUnits) + 4; // +4 for margins

  const messageHeightInGridUnits = Math.ceil(messageText.height / px(1));
  const checkboxesHeightInGridUnits = checkboxes.length > 0 ? checkboxes.length * checkboxHeight + 2 : 0;
  const verticalSpacing = 4; // Grid units between sections
  const contentHeight = messageHeightInGridUnits + checkboxesHeightInGridUnits + verticalSpacing + buttonHeight + 4; // +4 for top/bottom margins

  // Create dialog card
  const dialogCard = new PixelCard({
    title,
    x: 0, // Will be centered
    y: 0,
    contentWidth,
    contentHeight,
    renderer,
    minContentSize: true
  });

  const contentContainer = dialogCard.getContentContainer();

  // Add message text
  const messageY = px(2);
  messageText.position.set(px(2), messageY);
  contentContainer.addChild(messageText);

  // Cleanup function
  const cleanup = () => {
    // Destroy all created buttons
    createdButtons.forEach(btn => btn.destroy());
    createdButtons.length = 0;

    // Destroy all created checkboxes
    createdCheckboxes.forEach(cb => cb.destroy());
    createdCheckboxes.length = 0;

    // Destroy the overlay
    overlay.destroy({ children: true });
  };

  // Add checkboxes
  let checkboxY = messageY + messageText.height + px(4);
  checkboxes.forEach((checkboxConfig) => {
    const checkboxResult = createPixelCheckbox({
      label: checkboxConfig.label,
      checked: checkboxStates[checkboxConfig.name],
      onChange: (checked) => {
        checkboxStates[checkboxConfig.name] = checked;
      }
    });
    createdCheckboxes.push(checkboxResult);
    checkboxResult.container.position.set(px(2), checkboxY);
    contentContainer.addChild(checkboxResult.container);

    checkboxY += checkboxResult.container.height + px(1);
  });

  // Add buttons
  const buttonY = px(messageHeightInGridUnits + checkboxesHeightInGridUnits + verticalSpacing + 2);
  let currentX = px((contentWidth - buttonsWidthInGridUnits) / 2); // Center buttons

  buttons.forEach((buttonConfig) => {
    const buttonResult = createPixelButton({
      width: buttonWidth,
      height: buttonHeight,
      label: buttonConfig.label,
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        buttonConfig.onClick(checkboxStates);
        // Close dialog when button is clicked
        cleanup();
      }
    });
    createdButtons.push(buttonResult);
    buttonResult.container.position.set(currentX, buttonY);
    contentContainer.addChild(buttonResult.container);
    currentX += px(buttonWidth) + buttonSpacing;
  });

  // Center dialog on screen
  const dialogBounds = dialogCard.container.getBounds();
  dialogCard.container.position.set(
    (renderer.width - dialogBounds.width) / 2,
    (renderer.height - dialogBounds.height) / 2
  );

  overlay.addChild(dialogCard.container);

  return {
    container: overlay,
    close: cleanup,
    getCheckboxStates: () => ({ ...checkboxStates }),
    destroy: cleanup
  };
}
