import PIXI from 'pixi.js';

export interface SequenceInfo {
  frames: number[];
  speed: number;
}

// export type PIXITextureSource = PIXI.Texture<PIXI.TextureSource<any>>;

export class TextureFrameSequences {
  private frames: PIXI.Texture<PIXI.TextureSource<any>>[] = [];
  private sequences: Record<string, SequenceInfo> = {};

  constructor(frames: PIXI.Texture<PIXI.TextureSource<any>>[], sequences: Record<string, SequenceInfo>) {
    this.frames = frames;
    this.sequences = sequences;
  }

  addSequence(name: string, numbers: number[], speed: number = 1) {
    this.sequences[name] = {
      frames: numbers,
      speed: speed
    };
  }

  getSequence(name: string) {
    return this.sequences[name];
  }

  getFrame(index: number) {
    return this.frames[index];
  }

  getFrameSequence(name: string) {
    const sequence = this.getSequence(name);
    return sequence.frames.map(index => this.frames[index]);
  }
}