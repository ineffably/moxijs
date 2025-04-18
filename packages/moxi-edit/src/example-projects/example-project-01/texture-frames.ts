import PIXI, { type TextureSource } from 'pixi.js';

export interface AsTextureFramesOptions {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
}

const defaultOptions: AsTextureFramesOptions = { frameWidth: 48, frameHeight: 48, columns: 4, rows: 4 };

export function asTextureFrames(textureSource: TextureSource, options: AsTextureFramesOptions = defaultOptions): PIXI.Texture[] {
  const { frameWidth, frameHeight, columns, rows } = options;
  const frames: PIXI.Texture[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const frame = new PIXI.Rectangle(x * frameWidth, y * frameHeight, frameWidth, frameHeight);
      const frametexture = new PIXI.Texture({
        source: textureSource,
        frame: frame,
      });

      frames.push(frametexture);
    }
  }
  
  return frames;
}
