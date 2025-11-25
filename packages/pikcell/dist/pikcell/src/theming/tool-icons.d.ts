/**
 * Tool icons for the sprite editor
 * Creates simple pixel art icons and bakes them to textures
 */
import * as PIXI from 'pixi.js';
export type ToolType = 'pencil' | 'eraser' | 'fill' | 'eyedrop';
/**
 * Creates a tool icon sprite from cached or newly generated texture
 * Icons are always rendered at native 24x24 size (no scaling)
 */
export declare function createToolIcon(tool: ToolType, size: number, color: number, renderer: PIXI.Renderer): PIXI.Sprite;
