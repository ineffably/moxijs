import PIXI from 'pixi.js';
/**
 * Options for creating texture frames from a spritesheet
 */
export interface AsTextureFramesOptions {
    /**
     * Width of each frame in pixels
     */
    frameWidth: number;
    /**
     * Height of each frame in pixels
     */
    frameHeight: number;
    /**
     * Number of columns in the spritesheet
     */
    columns: number;
    /**
     * Number of rows in the spritesheet
     */
    rows: number;
}
/**
 * Splits a texture source into individual texture frames based on a grid layout
 *
 * @param textureSource - The source texture to split into frames
 * @param options - Configuration options for frame extraction
 * @returns Array of individual texture frames
 */
export declare function asTextureFrames(PIXI: any, textureSource: PIXI.TextureSource, options?: AsTextureFramesOptions): PIXI.Texture<PIXI.TextureSource<any>>[];
