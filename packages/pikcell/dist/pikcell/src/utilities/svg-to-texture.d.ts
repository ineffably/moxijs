/**
 * Utility to convert SVG to PIXI texture
 */
import * as PIXI from 'pixi.js';
export interface SVGToTextureOptions {
    svgString: string;
    width: number;
    height: number;
    color?: number;
}
/**
 * Converts an SVG string to a PIXI texture
 * Accounts for proper scaling and renders at the exact pixel dimensions needed
 */
export declare function svgToTexture(options: SVGToTextureOptions): Promise<PIXI.Texture>;
