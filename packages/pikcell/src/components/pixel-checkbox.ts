/**
 * Pixel-perfect checkbox component
 */
import * as PIXI from 'pixi.js';
import { GRID, px } from 'moxijs';
import { createPixelButton, PixelButtonResult } from './pixel-button';
import { ComponentResult } from '../interfaces/components';

export interface PixelCheckboxOptions {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface PixelCheckboxResult extends ComponentResult {
  /** Get the current checked state */
  isChecked(): boolean;
  /** Set the checked state */
  setChecked(checked: boolean): void;
}

/**
 * Creates a pixel-perfect checkbox with label
 * Returns a result object with the container, state accessors, and destroy method
 */
export function createPixelCheckbox(options: PixelCheckboxOptions): PixelCheckboxResult {
  const { label, checked = false, onChange } = options;

  const container = new PIXI.Container();

  let isCheckedState = checked;
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

  let checkboxResult: PixelButtonResult | null = null;

  const createCheckbox = () => {
    if (checkboxResult) {
      checkboxResult.destroy();
    }

    checkboxResult = createPixelButton({
      size: checkboxSize,
      selected: isCheckedState,
      selectionMode: 'highlight',
      actionMode: 'toggle',
      backgroundColor: 0xffffff,
      onClick: () => {
        isCheckedState = !isCheckedState;
        checkboxResult?.setSelected(isCheckedState);
        if (onChange) {
          onChange(isCheckedState);
        }
      }
    });

    checkboxResult.container.position.set(0, checkboxY);
    container.addChild(checkboxResult.container);
  };

  createCheckbox();

  return {
    container,
    isChecked: () => isCheckedState,
    setChecked: (checked: boolean) => {
      isCheckedState = checked;
      checkboxResult?.setSelected(checked);
    },
    destroy: () => {
      if (checkboxResult) {
        checkboxResult.destroy();
        checkboxResult = null;
      }
      container.destroy({ children: true });
    }
  };
}
