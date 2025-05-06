import PIXI from 'pixi.js';

/**
 * Sequence information for an animation
 */
export interface SequenceInfo {
  /** Array of frame indices from the texture atlas */
  frames: number[];
  /** Speed of animation (frames per ms) */
  animationSpeed: number;
}

/**
 * Manages frame sequences for animated sprites
 * Provides utility functions for working with sprite sheet animations
 */
export class TextureFrameSequences {
  private frames: PIXI.Texture[] = [];
  private sequences: Record<string, SequenceInfo> = {};

  /**
   * Create a new TextureFrameSequences
   * @param frames - Array of textures from a spritesheet
   * @param sequences - Named sequences with frame indices and animation speed
   */
  constructor(frames: PIXI.Texture[], sequences: Record<string, SequenceInfo> = {}) {
    this.frames = frames;
    this.sequences = sequences;
  }

  /**
   * Add a new animation sequence
   * @param name - Unique identifier for the sequence
   * @param frameIndices - Array of frame indices from the texture atlas
   * @param animationSpeed - Speed of animation (frames per ms)
   */
  addSequence(name: string, frameIndices: number[], animationSpeed: number = 1) {
    this.sequences[name] = {
      frames: frameIndices,
      animationSpeed
    };
  }

  /**
   * Get a sequence by name
   */
  getSequence(name: string): SequenceInfo | null {
    return this.sequences[name] || null;
  }

  /**
   * Get a specific frame by index
   */
  getFrame(index: number): PIXI.Texture | null {
    return this.frames[index] || null;
  }

  /**
   * Get a specific frame from a sequence by index
   */
  getFrameFromSequence(sequenceName: string, frameIndex: number): PIXI.Texture | null {
    const sequence = this.getSequence(sequenceName);
    if (!sequence) return null;
    
    // Get the appropriate frame index from the sequence
    const sequenceFrameIndex = sequence.frames[frameIndex % sequence.frames.length];
    
    // Return the texture
    return this.frames[sequenceFrameIndex] || null;
  }

  /**
   * Get all frames for a sequence
   */
  getFrameSequence(name: string): PIXI.Texture[] {
    const sequence = this.getSequence(name);
    if (!sequence) return [];
    
    return sequence.frames.map(index => this.frames[index]).filter(Boolean);
  }
} 