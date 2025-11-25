/**
 * PIKCELL Bar Card - Main action bar with commands
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
export interface CommanderBarCallbacks {
    onNew?: () => void;
    onSave?: () => void;
    onLoad?: () => void;
    onExport?: () => void;
    onApplyLayout?: () => void;
    onSaveLayoutSlot?: (slot: 'A' | 'B' | 'C') => void;
    onLoadLayoutSlot?: (slot: 'A' | 'B' | 'C') => void;
    hasLayoutSlot?: (slot: 'A' | 'B' | 'C') => boolean;
    onThemeChange?: () => void;
    onScaleChange?: (scale: number) => void;
}
export interface CommanderBarCardOptions {
    x: number;
    y: number;
    renderer: PIXI.Renderer;
    scene: PIXI.Container;
    width?: number;
    callbacks?: CommanderBarCallbacks;
}
export interface CommanderBarCardResult {
    card: PixelCard;
}
/**
 * Creates a PIKCELL bar for actions and options
 */
export declare function createCommanderBarCard(options: CommanderBarCardOptions): CommanderBarCardResult;
