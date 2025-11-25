import PIXI from 'pixi.js';
import { ButtonState } from './ui-button';
/**
 * Strategy interface for button background rendering
 *
 * @category UI
 */
export interface ButtonBackgroundStrategy {
    /**
     * Creates and returns the background container
     */
    create(width: number, height: number): PIXI.Container;
    /**
     * Updates the visual state of the background
     */
    updateState(state: ButtonState): void;
    /**
     * Gets the actual rendered height of the background
     */
    getActualHeight(): number;
    /**
     * Cleans up resources
     */
    destroy(): void;
}
/**
 * Solid color background strategy using UIPanel
 *
 * @category UI
 */
export declare class SolidColorBackgroundStrategy implements ButtonBackgroundStrategy {
    private panel?;
    private normalColor;
    private hoverColor;
    private pressedColor;
    private disabledColor;
    private width;
    private height;
    private borderRadius;
    constructor(backgroundColor: number, width: number, height: number, borderRadius: number);
    create(width: number, height: number): PIXI.Container;
    updateState(state: ButtonState): void;
    getActualHeight(): number;
    destroy(): void;
    private darkenColor;
}
/**
 * Configuration for icon overlays
 *
 * @category UI
 */
export interface IconConfig {
    /** Spritesheet containing the icon texture */
    spritesheet: PIXI.Spritesheet;
    /** Texture name in the spritesheet */
    textureName: string;
    /** Icon scale (default: 1.0) */
    scale?: number;
    /** Use pixel-perfect rendering */
    pixelPerfect?: boolean;
}
/**
 * Configuration for sprite-based backgrounds
 *
 * @category UI
 */
export interface SpriteBackgroundConfig {
    /** Spritesheet containing the button textures */
    spritesheet: PIXI.Spritesheet;
    /** Texture name pattern - use {color} placeholder. Example: "barHorizontal_{color}_left.png" */
    texturePattern: string;
    /** Color variant to use (e.g., 'blue', 'green', 'red') */
    color: string;
    /** Use pixel-perfect rendering (nearest neighbor) */
    pixelPerfect?: boolean;
    /** Use 9-slice rendering instead of three-piece horizontal */
    useNineSlice?: boolean;
    /** 9-slice border widths (left, top, right, bottom) - required if useNineSlice is true */
    nineSliceBorders?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** Texture name for pressed/down state - use {color} placeholder if needed */
    pressedTexturePattern?: string;
    /** Icon configuration for overlay */
    icon?: IconConfig;
}
/**
 * Sprite-based background strategy using three-piece horizontal textures or 9-slice
 *
 * @category UI
 */
export declare class SpriteBackgroundStrategy implements ButtonBackgroundStrategy {
    private container?;
    private spriteLeft?;
    private spriteMid?;
    private spriteRight?;
    private nineSliceSprite?;
    private nineSliceSpritePressed?;
    private iconSprite?;
    private config;
    private width;
    private height;
    constructor(config: SpriteBackgroundConfig, width: number, height: number);
    create(width: number, height: number): PIXI.Container;
    updateState(state: ButtonState): void;
    getActualHeight(): number;
    destroy(): void;
    private getTextureName;
}
