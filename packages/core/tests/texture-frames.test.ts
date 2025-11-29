import { asTextureFrames, AsTextureFramesOptions } from '../src/library/texture-frames';
import PIXI from 'pixi.js';

describe('asTextureFrames', () => {
  // Mock texture source
  const createMockTextureSource = (): PIXI.TextureSource => {
    return {
      width: 192,
      height: 192,
    } as PIXI.TextureSource;
  };

  describe('basic functionality', () => {
    it('should create frames from texture source', () => {
      const textureSource = createMockTextureSource();
      const options: AsTextureFramesOptions = {
        frameWidth: 48,
        frameHeight: 48,
        columns: 4,
        rows: 4
      };

      const frames = asTextureFrames(PIXI, textureSource, options);

      expect(frames).toHaveLength(16); // 4 columns * 4 rows
      expect(frames[0]).toBeInstanceOf(PIXI.Texture);
    });

    it('should use default options when none provided', () => {
      const textureSource = createMockTextureSource();
      const frames = asTextureFrames(PIXI, textureSource);

      expect(frames).toHaveLength(16); // Default 4x4 grid
    });

    it('should create frames in correct order (row by row)', () => {
      const textureSource = createMockTextureSource();
      const options: AsTextureFramesOptions = {
        frameWidth: 48,
        frameHeight: 48,
        columns: 2,
        rows: 2
      };

      const frames = asTextureFrames(PIXI, textureSource, options);

      expect(frames).toHaveLength(4);
      
      // First frame should be at (0, 0)
      expect(frames[0].frame.x).toBe(0);
      expect(frames[0].frame.y).toBe(0);
      
      // Second frame should be at (48, 0)
      expect(frames[1].frame.x).toBe(48);
      expect(frames[1].frame.y).toBe(0);
      
      // Third frame should be at (0, 48) - start of second row
      expect(frames[2].frame.x).toBe(0);
      expect(frames[2].frame.y).toBe(48);
    });

    it('should handle different grid sizes', () => {
      const textureSource = createMockTextureSource();
      
      const frames3x3 = asTextureFrames(PIXI, textureSource, {
        frameWidth: 64,
        frameHeight: 64,
        columns: 3,
        rows: 3
      });
      expect(frames3x3).toHaveLength(9);

      const frames2x5 = asTextureFrames(PIXI, textureSource, {
        frameWidth: 96,
        frameHeight: 38,
        columns: 2,
        rows: 5
      });
      expect(frames2x5).toHaveLength(10);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for invalid texture source', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const frames = asTextureFrames(PIXI, null as any);
      expect(frames).toEqual([]);
      
      consoleSpy.mockRestore();
    });

    it('should handle single frame', () => {
      const textureSource = createMockTextureSource();
      const frames = asTextureFrames(PIXI, textureSource, {
        frameWidth: 192,
        frameHeight: 192,
        columns: 1,
        rows: 1
      });

      expect(frames).toHaveLength(1);
      expect(frames[0].frame.x).toBe(0);
      expect(frames[0].frame.y).toBe(0);
      expect(frames[0].frame.width).toBe(192);
      expect(frames[0].frame.height).toBe(192);
    });
  });
});

