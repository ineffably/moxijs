/**
 * SPT Toolbar Card - Sprite sheet tools (Pan, Zoom)
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
export type SPTTool = 'pan' | 'zoom';
export interface SPTToolbarCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    selectedTool?: SPTTool;
    onToolSelect?: (tool: SPTTool) => void;
}
export interface SPTToolbarCardResult {
    card: PixelCard;
    getSelectedTool: () => SPTTool;
    setSelectedTool: (tool: SPTTool) => void;
}
/**
 * Creates a sprite sheet tools toolbar (SPT)
 */
export declare function createSPTToolbarCard(options: SPTToolbarCardOptions): Promise<SPTToolbarCardResult>;
