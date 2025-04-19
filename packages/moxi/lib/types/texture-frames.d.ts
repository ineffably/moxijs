import PIXI from 'pixi.js';
export interface AsTextureFramesOptions {
    frameWidth: number;
    frameHeight: number;
    columns: number;
    rows: number;
}
export declare function asTextureFrames(PIXI: any, textureSource: PIXI.TextureSource, options?: AsTextureFramesOptions): PIXI.Texture<PIXI.TextureSource<any>>[];
