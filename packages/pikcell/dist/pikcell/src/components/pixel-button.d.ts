/**
 * Pixel-perfect button component for the sprite editor
 */
import * as PIXI from 'pixi.js';
export type SelectionMode = 'highlight' | 'press';
export type ActionMode = 'click' | 'toggle';
export interface PixelButtonOptions {
    size?: number;
    width?: number;
    height?: number;
    selected?: boolean;
    label?: string;
    icon?: PIXI.Sprite | PIXI.Graphics;
    backgroundColor?: number;
    onClick?: () => void;
    selectionMode?: SelectionMode;
    actionMode?: ActionMode;
    tooltip?: string;
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
export declare function createPixelButton(options: PixelButtonOptions): PIXI.Graphics;
