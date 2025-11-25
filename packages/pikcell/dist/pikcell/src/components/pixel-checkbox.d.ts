/**
 * Pixel-perfect checkbox component
 */
import * as PIXI from 'pixi.js';
export interface PixelCheckboxOptions {
    label: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}
/**
 * Creates a pixel-perfect checkbox with label
 * Returns a container with the checkbox and label
 */
export declare function createPixelCheckbox(options: PixelCheckboxOptions): PIXI.Container;
