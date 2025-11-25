import PIXI from 'pixi.js';
/**
 * Options for creating a BitmapText instance
 */
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
/**
 * Options for creating a Sprite instance
 */
export interface SpriteOptions {
    texture?: PIXI.Texture | PIXI.TextureSource;
    [key: string]: any;
}
/**
 * Options for creating a Text instance
 */
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
/**
 * Common properties that can be applied to PIXI display objects
 */
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
/**
 * Creates a BitmapText instance with constructor args and optional properties
 *
 * @example
 * ```typescript
 * const label = asBitmapText(
 *   { text: 'Hello', style: { fontFamily: 'Arial', fontSize: 24 }, pixelPerfect: true },
 *   { x: 100, y: 50, anchor: 0.5 }
 * );
 * ```
 */
export declare function asBitmapText(constructorArgs: BitmapTextOptions, props?: PixiProps): PIXI.BitmapText;
/**
 * Creates a Sprite instance with constructor args and optional properties
 *
 * @example
 * ```typescript
 * const sprite = asSprite(
 *   { texture },
 *   { x: 100, y: 100, anchor: 0.5 }
 * );
 * ```
 */
export declare function asSprite(constructorArgs: SpriteOptions, props?: PixiProps): PIXI.Sprite;
/**
 * Creates a Text instance with constructor args and optional properties
 *
 * @example
 * ```typescript
 * const text = asText(
 *   { text: 'Hello', style: { fontFamily: 'Arial', fontSize: 24 } },
 *   { x: 100, y: 50 }
 * );
 * ```
 */
export declare function asText(constructorArgs: TextOptions, props?: PixiProps): PIXI.Text;
/**
 * Creates a Graphics instance with optional properties
 *
 * @example
 * ```typescript
 * const graphics = asGraphics({ x: 100, y: 100 });
 * graphics.rect(0, 0, 50, 50).fill(0xff0000);
 * ```
 */
export declare function asGraphics(props?: PixiProps): PIXI.Graphics;
/**
 * Creates a Container instance with optional properties
 *
 * @example
 * ```typescript
 * const container = asContainer({ x: 100, y: 100 });
 * ```
 */
export declare function asContainer(props?: PixiProps): PIXI.Container;
