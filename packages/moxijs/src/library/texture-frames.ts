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
 * Default texture frame options
 */
const defaultOptions: AsTextureFramesOptions = { 
  frameWidth: 48, 
  frameHeight: 48, 
  columns: 4, 
  rows: 4 
};

/**
 * Splits a texture source into individual texture frames based on a grid layout
 * 
 * @param textureSource - The source texture to split into frames
 * @param options - Configuration options for frame extraction
 * @returns Array of individual texture frames
 */
export function asTextureFrames(
  PIXI,
  textureSource: PIXI.TextureSource, 
  options: AsTextureFramesOptions = defaultOptions,
): PIXI.Texture<PIXI.TextureSource<any>>[] {
  const { frameWidth, frameHeight, columns, rows } = options;
  const frames: PIXI.Texture<PIXI.TextureSource<any>>[] = [];

  // Ensure we're working with a validated texture source
  if (!textureSource) {
    console.error('Invalid texture source provided to asTextureFrames');
    return frames;
  }

  // Create textures from the texture source - keeping implementation identical to working version
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const frame = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
      
      // Keep the exact same implementation as the working example
      const frametexture = new PIXI.Texture({
        source: textureSource,
        frame: frame,
      }) as PIXI.Texture<PIXI.TextureSource<any>>;
      
      frames.push(frametexture);
    }
  }
  
  return frames as PIXI.Texture<PIXI.TextureSource<any>>[];
}
