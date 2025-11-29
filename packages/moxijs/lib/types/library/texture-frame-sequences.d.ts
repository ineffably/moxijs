import PIXI from 'pixi.js';
export interface SequenceInfo {
    frames: number[];
    animationSpeed: number;
}
export declare class TextureFrameSequences {
    private frames;
    private sequences;
    constructor(frames: PIXI.Texture[], sequences?: Record<string, SequenceInfo>);
    addSequence(name: string, frameIndices: number[], animationSpeed?: number): void;
    getSequence(name: string): SequenceInfo | null;
    getFrame(index: number): PIXI.Texture | null;
    getFrameFromSequence(sequenceName: string, frameIndex: number): PIXI.Texture | null;
    getFrameSequence(name: string): PIXI.Texture[];
}
