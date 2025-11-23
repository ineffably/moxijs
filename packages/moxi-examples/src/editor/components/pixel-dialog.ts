/**
 * Pixel-perfect dialog component built on top of PixelCard
 */
import * as PIXI from 'pixi.js';
import { PixelCard, GRID, px } from './pixel-card';
import { createPixelButton } from './pixel-button';
import { createPixelCheckbox } from './pixel-checkbox';
import { getTheme } from '../theming/theme';

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

/**
 * Creates a pixel-perfect dialog centered on screen
 * Returns a container with the dialog and a semi-transparent backdrop
 */
export function createPixelDialog(options: PixelDialogOptions): PIXI.Container {
  const { title, message, buttons, checkboxes = [], renderer } = options;

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

  // Add checkboxes
  let checkboxY = messageY + messageText.height + px(4); // message position + message height + 4 grid units (16px at 4x scale)
  checkboxes.forEach((checkboxConfig) => {
    const checkbox = createPixelCheckbox({
      label: checkboxConfig.label,
      checked: checkboxStates[checkboxConfig.name],
      onChange: (checked) => {
        checkboxStates[checkboxConfig.name] = checked;
      }
    });
    checkbox.position.set(px(2), checkboxY);
    contentContainer.addChild(checkbox);

    // Get actual height of checkbox container for proper spacing
    const checkboxContainer = checkbox as PIXI.Container;
    checkboxY += checkboxContainer.height + px(1); // Add spacing between checkboxes
  });

  // Add buttons
  const buttonY = px(messageHeightInGridUnits + checkboxesHeightInGridUnits + verticalSpacing + 2);
  let currentX = px((contentWidth - buttonsWidthInGridUnits) / 2); // Center buttons

  buttons.forEach((buttonConfig, index) => {
    const button = createPixelButton({
      width: buttonWidth,
      height: buttonHeight,
      label: buttonConfig.label,
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        buttonConfig.onClick(checkboxStates);
        // Close dialog when button is clicked
        overlay.destroy();
      }
    });
    button.position.set(currentX, buttonY);
    contentContainer.addChild(button);
    currentX += px(buttonWidth) + buttonSpacing;
  });

  // Center dialog on screen
  const dialogBounds = dialogCard.container.getBounds();
  dialogCard.container.position.set(
    (renderer.width - dialogBounds.width) / 2,
    (renderer.height - dialogBounds.height) / 2
  );

  overlay.addChild(dialogCard.container);

  return overlay;
}
