/**
 * Sprite card - displays and allows editing of a single 8x8 sprite
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { SpriteController } from '../controllers/sprite-controller';
export interface SpriteCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    spriteController: SpriteController;
    onPixelClick?: (x: number, y: number) => void;
    onFocus?: () => void;
}
export interface SpriteCardResult {
    card: PixelCard;
    controller: SpriteController;
    redraw: () => void;
}
/**
 * Creates a sprite card for editing a single 8x8 sprite
 */
export declare function createSpriteCard(options: SpriteCardOptions): SpriteCardResult;
