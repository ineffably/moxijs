import PIXI from 'pixi.js';
export interface SequenceInfo {
    frames: number[];
    animationSpeed: number;
}
export declare class TextureFrameSequences {
    private frames;
    private sequences;
    constructor(frames: PIXI.Texture<PIXI.TextureSource<any>>[], sequences: Record<string, SequenceInfo>);
    addSequence(name: string, numbers: number[], animationSpeed?: number): void;
    getSequence(name: string): SequenceInfo;
    getFrame(index: number): PIXI.Texture<PIXI.TextureSource<any>>;
    getFrameSequence(name: string): PIXI.Texture<PIXI.TextureSource<any>>[];
}
