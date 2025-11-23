/**
 * Pixel-perfect dialog component built on top of PixelCard
 */
import * as PIXI from 'pixi.js';
import { PixelCard, GRID, px } from './pixel-card';
import { createPixelButton } from './pixel-button';

export interface DialogButton {
  label: string;
  onClick: () => void;
}

export interface PixelDialogOptions {
  title: string;
  message: string;
  buttons: DialogButton[];
  renderer: PIXI.Renderer;
}

/**
 * Creates a pixel-perfect dialog centered on screen
 * Returns a container with the dialog and a semi-transparent backdrop
 */
export function createPixelDialog(options: PixelDialogOptions): PIXI.Container {
  const { title, message, buttons, renderer } = options;

  // Create overlay container
  const overlay = new PIXI.Container();

  // Semi-transparent backdrop
  const backdrop = new PIXI.Graphics();
  backdrop.rect(0, 0, renderer.width, renderer.height);
  backdrop.fill({ color: 0x000000, alpha: 0.5 });
  backdrop.eventMode = 'static'; // Block clicks to elements below
  overlay.addChild(backdrop);

  // Calculate dialog dimensions
  const buttonWidth = 30; // Grid units per button
  const buttonHeight = 12; // Grid units
  const buttonSpacing = px(2);
  const messageMargin = px(4);

  // Create message text to measure it
  const messageText = new PIXI.BitmapText({
    text: message,
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 64,
      fill: 0x000000,
    }
  });
  messageText.roundPixels = true;
  messageText.scale.set(GRID.fontScale);

  // Calculate content dimensions based on message and buttons
  const messageWidthInGridUnits = Math.ceil(messageText.width / px(1));
  const buttonsWidthInGridUnits = buttons.length * buttonWidth + (buttons.length - 1) * (buttonSpacing / px(1));
  const contentWidth = Math.max(messageWidthInGridUnits, buttonsWidthInGridUnits) + 4; // +4 for margins

  const messageHeightInGridUnits = Math.ceil(messageText.height / px(1));
  const verticalSpacing = 4; // Grid units between message and buttons
  const contentHeight = messageHeightInGridUnits + verticalSpacing + buttonHeight + 4; // +4 for top/bottom margins

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
  messageText.position.set(px(2), px(2));
  contentContainer.addChild(messageText);

  // Add buttons
  const buttonY = px(messageHeightInGridUnits + verticalSpacing + 2);
  let currentX = px((contentWidth - buttonsWidthInGridUnits) / 2); // Center buttons

  buttons.forEach((buttonConfig, index) => {
    const button = createPixelButton({
      width: buttonWidth,
      height: buttonHeight,
      label: buttonConfig.label,
      selectionMode: 'press',
      actionMode: 'click',
      onClick: () => {
        buttonConfig.onClick();
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
