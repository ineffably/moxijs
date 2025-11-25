/**
 * Scale Card - GRID scale testing controls
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
export interface ScaleCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    onScaleChange?: (scale: number) => void;
}
export interface ScaleCardResult {
    card: PixelCard;
}
/**
 * Creates a scale control card for testing GRID scaling
 */
export declare function createScaleCard(options: ScaleCardOptions): ScaleCardResult;
