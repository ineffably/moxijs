import PIXI from 'pixi.js';
import { ButtonState } from './ui-button';
export interface ButtonBackgroundStrategy {
    create(width: number, height: number): PIXI.Container;
    updateState(state: ButtonState): void;
    getActualHeight(): number;
    destroy(): void;
}
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
export interface IconConfig {
    spritesheet: PIXI.Spritesheet;
    textureName: string;
    scale?: number;
    pixelPerfect?: boolean;
}
export interface SpriteBackgroundConfig {
    spritesheet: PIXI.Spritesheet;
    texturePattern: string;
    color: string;
    pixelPerfect?: boolean;
    useNineSlice?: boolean;
    nineSliceBorders?: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    pressedTexturePattern?: string;
    icon?: IconConfig;
}
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
