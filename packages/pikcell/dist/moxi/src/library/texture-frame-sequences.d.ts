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
export declare class TextureFrameSequences {
    private frames;
    private sequences;
    /**
     * Create a new TextureFrameSequences
     * @param frames - Array of textures from a spritesheet
     * @param sequences - Named sequences with frame indices and animation speed
     */
    constructor(frames: PIXI.Texture[], sequences?: Record<string, SequenceInfo>);
    /**
     * Add a new animation sequence
     * @param name - Unique identifier for the sequence
     * @param frameIndices - Array of frame indices from the texture atlas
     * @param animationSpeed - Speed of animation (frames per ms)
     */
    addSequence(name: string, frameIndices: number[], animationSpeed?: number): void;
    /**
     * Get a sequence by name
     */
    getSequence(name: string): SequenceInfo | null;
    /**
     * Get a specific frame by index
     */
    getFrame(index: number): PIXI.Texture | null;
    /**
     * Get a specific frame from a sequence by index
     */
    getFrameFromSequence(sequenceName: string, frameIndex: number): PIXI.Texture | null;
    /**
     * Get all frames for a sequence
     */
    getFrameSequence(name: string): PIXI.Texture[];
}
