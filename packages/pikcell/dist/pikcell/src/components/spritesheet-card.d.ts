/**
 * Sprite sheet card component for displaying and editing sprite sheets
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { SpriteSheetController, SpriteSheetConfig, SpriteSheetType } from '../controllers/sprite-sheet-controller';
export { SpriteSheetType, SpriteSheetConfig };
export declare const SPRITESHEET_CONFIGS: Record<SpriteSheetType, SpriteSheetConfig>;
export interface SpriteSheetCardOptions {
    config: SpriteSheetConfig;
    x?: number;
    y?: number;
    renderer: PIXI.Renderer;
    showGrid?: boolean;
    onCellHover?: (cellX: number, cellY: number) => void;
    onCellClick?: (cellX: number, cellY: number) => void;
    onFocus?: () => void;
}
export interface SpriteSheetCardResult {
    card: PixelCard;
    controller: SpriteSheetController;
}
/**
 * Creates a sprite sheet card with a canvas for editing
 */
export declare function createSpriteSheetCard(options: SpriteSheetCardOptions): SpriteSheetCardResult;
