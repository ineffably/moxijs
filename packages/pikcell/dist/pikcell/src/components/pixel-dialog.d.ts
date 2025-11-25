/**
 * Pixel-perfect dialog component built on top of PixelCard
 */
import * as PIXI from 'pixi.js';
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
export declare function createPixelDialog(options: PixelDialogOptions): PIXI.Container;
