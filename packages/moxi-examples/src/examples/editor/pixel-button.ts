/**
 * Pixel art style button helper
 * Creates square buttons with beveled edges like a die face
 */
import PIXI from 'pixi.js';
import { createPixelText } from './pixel-text';

export interface PixelButtonOptions {
  label?: string;
  icon?: PIXI.Container | (() => PIXI.Container);
  width: number;
  height: number;
  x?: number;
  y?: number;
  onClick?: () => void;
  backgroundColor?: number;
  textColor?: number;
  iconColor?: number;
  fontSize?: number;
  selected?: boolean;
}

/**
 * Creates a pixel art style button with beveled edges
 */
export function createPixelButton(options: PixelButtonOptions): PIXI.Container {
  const {
    label,
    icon,
    width,
    height,
    x = 0,
    y = 0,
    onClick,
    backgroundColor = 0xb8b5b9, // CC-29 light gray
    textColor = 0x212123, // CC-29 very dark
    iconColor = 0x212123, // CC-29 very dark
    fontSize = 18,
    selected = false
  } = options;

  const container = new PIXI.Container();
  container.position.set(x, y);

  // Create graphics for the button
  const graphics = new PIXI.Graphics();
  graphics.roundPixels = true; // Pixel perfect rendering

  // Constants
  const borderWidth = 1;
  const bevelWidth = 2;
  
  // Layer 1: Black border (outermost) - draw as filled rectangle
  graphics.rect(0, 0, width, height);
  graphics.fill({ color: 0x000000 });

  // Layer 2: White inner border - 1px inside black border
  const whiteBorderX = borderWidth;
  const whiteBorderY = borderWidth;
  const whiteBorderW = width - borderWidth * 2;
  const whiteBorderH = height - borderWidth * 2;
  graphics.rect(whiteBorderX, whiteBorderY, whiteBorderW, whiteBorderH);
  graphics.fill({ color: 0xffffff });

  // Layer 3: Main background fill - 1px inside white border
  const mainFillX = whiteBorderX + borderWidth;
  const mainFillY = whiteBorderY + borderWidth;
  const mainFillW = whiteBorderW - borderWidth * 2;
  const mainFillH = whiteBorderH - borderWidth * 2 - bevelWidth;
  graphics.rect(mainFillX, mainFillY, mainFillW, mainFillH);
  graphics.fill({ color: backgroundColor });

  // Layer 4: Gray bevel on bottom edge
  const bevelColor = 0x868188; // CC-29 medium gray
  graphics.rect(mainFillX, mainFillY + mainFillH, mainFillW, bevelWidth);
  graphics.fill({ color: bevelColor });

  // Layer 5: Redraw black border outline to ensure crisp edges
  graphics.rect(0, 0, width, height);
  graphics.stroke({ color: 0x000000, width: borderWidth });

  // Layer 6: Selected state overlay
  if (selected) {
    graphics.rect(0, 0, width, height);
    graphics.stroke({ color: 0x212123, width: 2 });
  }

  container.addChild(graphics);

  // Add icon if provided
  if (icon) {
    const iconGraphics = typeof icon === 'function' ? icon() : icon;
    // Center the icon
    const iconBounds = iconGraphics.getBounds();
    iconGraphics.position.set(
      width / 2 - iconBounds.x - iconBounds.width / 2,
      height / 2 - iconBounds.y - iconBounds.height / 2
    );
    container.addChild(iconGraphics);
  }
  // Add label if provided (and no icon)
  else if (label) {
    const labelText = createPixelText({
      text: label,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'PixelOperator8'
    });
    labelText.anchor.set(0.5);
    labelText.position.set(width / 2, height / 2);
    container.addChild(labelText);
  }

  // Make interactive
  if (onClick) {
    container.eventMode = 'static';
    container.cursor = 'pointer';

    container.on('pointerdown', () => {
      // Visual feedback: shift button slightly when pressed
      container.position.set(x + 1, y + 1);
    });

    container.on('pointerup', () => {
      container.position.set(x, y);
      onClick();
    });

    container.on('pointerupoutside', () => {
      container.position.set(x, y);
    });
  }

  return container;
}

