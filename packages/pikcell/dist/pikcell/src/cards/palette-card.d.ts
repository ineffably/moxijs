/**
 * Palette Card - Color palette selector
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
export interface PaletteCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    palette: number[];
    selectedColorIndex?: number;
    onColorSelect?: (colorIndex: number, color: number) => void;
}
export interface PaletteCardResult {
    card: PixelCard;
    getSelectedColorIndex: () => number;
    setSelectedColorIndex: (index: number) => void;
    setPalette: (palette: number[]) => void;
}
/**
 * Creates a pixel-perfect palette card
 */
export declare function createPaletteCard(options: PaletteCardOptions): PaletteCardResult;
