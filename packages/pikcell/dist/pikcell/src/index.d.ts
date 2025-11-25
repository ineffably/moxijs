import * as PIXI from 'pixi.js';
import { SpriteEditor } from './sprite-editor';
/**
 * Initialize and run the PIKCELL sprite editor
 */
export declare function initPikcell(hostElement?: HTMLElement): Promise<{
    spriteEditor: SpriteEditor;
    scene: import("moxi").Scene;
    engine: import("moxi").Engine;
    renderer: PIXI.Renderer<HTMLCanvasElement>;
}>;
export { SpriteEditor } from './sprite-editor';
export { getTheme, setTheme, getAllThemes } from './theming/theme';
export * from './editor-exports';
