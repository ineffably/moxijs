import PIXI from 'pixi.js';
export interface BitmapTextOptions {
    text?: string | number | {
        toString: () => string;
    };
    style?: {
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        fill?: number | string;
        [key: string]: any;
    };
    pixelPerfect?: boolean;
    [key: string]: any;
}
export interface SpriteOptions {
    texture?: PIXI.Texture | PIXI.TextureSource;
    [key: string]: any;
}
export interface TextOptions {
    text?: string | number | {
        toString: () => string;
    };
    style?: {
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        fill?: number | string;
        [key: string]: any;
    };
    [key: string]: any;
}
export interface PixiProps {
    x?: number;
    y?: number;
    anchor?: {
        x?: number;
        y?: number;
    } | number;
    scale?: {
        x?: number;
        y?: number;
    } | number;
    rotation?: number;
    tint?: number;
    alpha?: number;
    visible?: boolean;
    eventMode?: 'none' | 'passive' | 'auto' | 'static' | 'dynamic';
    pivot?: {
        x?: number;
        y?: number;
    } | number;
}
export declare function asBitmapText(constructorArgs: BitmapTextOptions, props?: PixiProps): PIXI.BitmapText;
export declare function asSprite(constructorArgs: SpriteOptions, props?: PixiProps): PIXI.Sprite;
export declare function asText(constructorArgs: TextOptions, props?: PixiProps): PIXI.Text;
export declare function asGraphics(props?: PixiProps): PIXI.Graphics;
export declare function asContainer(props?: PixiProps): PIXI.Container;
