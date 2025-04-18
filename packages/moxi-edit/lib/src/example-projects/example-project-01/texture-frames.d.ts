import PIXI, { type TextureSource } from 'pixi.js';
export interface AsTextureFramesOptions {
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
}
export declare function asTextureFrames(textureSource: TextureSource, options?: AsTextureFramesOptions): PIXI.Texture[];
