import PIXI, { TextureSource } from 'pixi.js';
interface AsTextureFramesOptions {
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
}
export declare function asTextureFrames(textureSource: TextureSource, options?: AsTextureFramesOptions): PIXI.Texture[];
export {};
