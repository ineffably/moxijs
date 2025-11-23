/**
 * Pixel-perfect checkbox component
 */
import * as PIXI from 'pixi.js';
import { GRID, px } from './pixel-card';
import { createPixelButton } from './pixel-button';

export interface PixelCheckboxOptions {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

/**
 * Creates a pixel-perfect checkbox with label
 * Returns a container with the checkbox and label
 */
export function createPixelCheckbox(options: PixelCheckboxOptions): PIXI.Container {
  const { label, checked = false, onChange } = options;

  const container = new PIXI.Container();

  let isChecked = checked;
  const checkboxSize = 6; // Grid units for checkbox square

  // Checkbox label
  const checkboxLabel = new PIXI.BitmapText({
    text: label,
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 64,
      fill: 0x000000,
    }
  });
  checkboxLabel.roundPixels = true;
  checkboxLabel.scale.set(GRID.fontScale);
  checkboxLabel.position.set(px(checkboxSize + 2), 0);
  container.addChild(checkboxLabel);

  // Create checkbox button (centered vertically with label)
  const checkboxHeight = px(checkboxSize);
  const labelHeight = checkboxLabel.height;
  const checkboxY = (labelHeight - checkboxHeight) / 2;

  const checkbox = createPixelButton({
    size: checkboxSize,
    selected: isChecked,
    selectionMode: 'highlight',
    actionMode: 'toggle',
    backgroundColor: 0xffffff,
    onClick: () => {
      isChecked = !isChecked;
      if (onChange) {
        onChange(isChecked);
      }
    }
  });
  checkbox.position.set(0, checkboxY);
  container.addChild(checkbox);

  return container;
}
