import { TextureFrameSequences, SequenceInfo } from '../src/library/texture-frame-sequences';
import PIXI from 'pixi.js';

describe('TextureFrameSequences', () => {
  const createMockTexture = (index: number): PIXI.Texture => {
    return {
      width: 48,
      height: 48,
    } as PIXI.Texture;
  };

  const createMockFrames = (count: number): PIXI.Texture[] => {
    return Array.from({ length: count }, (_, i) => createMockTexture(i));
  };

  describe('constructor', () => {
    it('should create sequences with initial frames', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      expect(sequences).toBeInstanceOf(TextureFrameSequences);
    });

    it('should create sequences with initial sequences', () => {
      const frames = createMockFrames(16);
      const initialSequences: Record<string, SequenceInfo> = {
        'walk': { frames: [0, 1, 2, 3], animationSpeed: 10 }
      };
      
      const sequences = new TextureFrameSequences(frames, initialSequences);
      const walkSequence = sequences.getSequence('walk');
      
      expect(walkSequence).not.toBeNull();
      expect(walkSequence?.frames).toEqual([0, 1, 2, 3]);
      expect(walkSequence?.animationSpeed).toBe(10);
    });
  });

  describe('addSequence', () => {
    it('should add a new sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('idle', [0, 1], 5);
      const idleSequence = sequences.getSequence('idle');
      
      expect(idleSequence).not.toBeNull();
      expect(idleSequence?.frames).toEqual([0, 1]);
      expect(idleSequence?.animationSpeed).toBe(5);
    });

    it('should use default animation speed', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('jump', [4, 5, 6]);
      const jumpSequence = sequences.getSequence('jump');
      
      expect(jumpSequence?.animationSpeed).toBe(1);
    });

    it('should overwrite existing sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('walk', [0, 1], 5);
      sequences.addSequence('walk', [2, 3, 4], 10);
      
      const walkSequence = sequences.getSequence('walk');
      expect(walkSequence?.frames).toEqual([2, 3, 4]);
      expect(walkSequence?.animationSpeed).toBe(10);
    });
  });

  describe('getSequence', () => {
    it('should retrieve existing sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('run', [8, 9, 10, 11], 15);
      const runSequence = sequences.getSequence('run');
      
      expect(runSequence).not.toBeNull();
      expect(runSequence?.frames).toEqual([8, 9, 10, 11]);
    });

    it('should return null for non-existent sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      const sequence = sequences.getSequence('nonExistent');
      
      expect(sequence).toBeNull();
    });
  });

  describe('getFrame', () => {
    it('should retrieve frame by index', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      const frame = sequences.getFrame(5);
      
      expect(frame).toBe(frames[5]);
    });

    it('should return null for out of bounds index', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      const frame = sequences.getFrame(100);
      
      expect(frame).toBeNull();
    });
  });

  describe('getFrameFromSequence', () => {
    it('should get frame from sequence by index', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('walk', [0, 1, 2, 3]);
      
      const frame0 = sequences.getFrameFromSequence('walk', 0);
      const frame1 = sequences.getFrameFromSequence('walk', 1);
      
      expect(frame0).toBe(frames[0]);
      expect(frame1).toBe(frames[1]);
    });

    it('should wrap around sequence frames', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('walk', [0, 1, 2]);
      
      const frame3 = sequences.getFrameFromSequence('walk', 3); // Should wrap to index 0
      const frame4 = sequences.getFrameFromSequence('walk', 4); // Should wrap to index 1
      
      expect(frame3).toBe(frames[0]);
      expect(frame4).toBe(frames[1]);
    });

    it('should return null for non-existent sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      const frame = sequences.getFrameFromSequence('nonExistent', 0);
      
      expect(frame).toBeNull();
    });
  });

  describe('getFrameSequence', () => {
    it('should get all frames for a sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('idle', [0, 1, 2]);
      const sequenceFrames = sequences.getFrameSequence('idle');
      
      expect(sequenceFrames).toHaveLength(3);
      expect(sequenceFrames[0]).toBe(frames[0]);
      expect(sequenceFrames[1]).toBe(frames[1]);
      expect(sequenceFrames[2]).toBe(frames[2]);
    });

    it('should return empty array for non-existent sequence', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      const sequenceFrames = sequences.getFrameSequence('nonExistent');
      
      expect(sequenceFrames).toEqual([]);
    });

    it('should filter out invalid frame indices', () => {
      const frames = createMockFrames(16);
      const sequences = new TextureFrameSequences(frames);
      
      sequences.addSequence('mixed', [0, 100, 2]); // 100 is out of bounds
      const sequenceFrames = sequences.getFrameSequence('mixed');
      
      expect(sequenceFrames).toHaveLength(2); // Only valid frames
      expect(sequenceFrames[0]).toBe(frames[0]);
      expect(sequenceFrames[1]).toBe(frames[2]);
    });
  });
});

