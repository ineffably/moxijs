import PIXI from 'pixi.js';
export interface TextDPROptions {
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
    dprScale?: number;
    pixelPerfect?: boolean;
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
export declare function asTextDPR(constructorArgs: TextDPROptions, props?: PixiProps): PIXI.Text;
