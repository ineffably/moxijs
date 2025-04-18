import type PIXI from 'pixi.js';
import type { TextureSource } from 'pixi.js';
export interface AsTextureFramesOptions {
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
}
export declare function asTextureFrames(PIXI: any, textureSource: TextureSource, options?: AsTextureFramesOptions): PIXI.Texture[];
