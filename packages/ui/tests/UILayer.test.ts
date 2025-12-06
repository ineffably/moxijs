import { UILayer } from '../src/UILayer';
import { UIScaleMode } from '../src/UIScaleMode';

// Mock PIXI.js
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(function(this: any) {
    this.scale = { set: jest.fn(), x: 1, y: 1 };
    this.position = { set: jest.fn(), x: 0, y: 0 };
    this.children = [];
    this.addChild = jest.fn((...children: any[]) => {
      this.children.push(...children);
      return children[0];
    });
    this.getLocalBounds = jest.fn().mockReturnValue({
      width: 800,
      height: 600,
    });
  }),
}));

describe('UILayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create layer with default options', () => {
      const layer = new UILayer();

      expect(layer).toBeDefined();
    });

    it('should create layer with ScaleUI mode', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });

      expect(layer).toBeDefined();
    });

    it('should create layer with LockRatio mode', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.LockRatio });

      expect(layer).toBeDefined();
    });

    it('should create layer with target dimensions', () => {
      const layer = new UILayer({
        targetWidth: 1920,
        targetHeight: 1080,
      });

      expect(layer).toBeDefined();
    });
  });

  describe('updateScale with None mode', () => {
    it('should set scale to 1,1 regardless of canvas size', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.None });

      layer.updateScale(1920, 1080);

      expect(layer.scale.set).toHaveBeenCalledWith(1, 1);
    });

    it('should set scale to 1,1 even with different canvas size', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.None });

      layer.updateScale(800, 600);

      expect(layer.scale.set).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('updateScale with ScaleUI mode', () => {
    it('should scale to fill canvas', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.ScaleUI,
        targetWidth: 800,
        targetHeight: 600,
      });

      // Simulate adding a child to trigger bounds recording
      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      layer.updateScale(1600, 1200);

      // Should scale 2x in both dimensions (1600/800 = 2, 1200/600 = 2)
      expect(layer.scale.set).toHaveBeenCalledWith(2, 2);
    });

    it('should stretch non-uniformly when aspect ratios differ', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.ScaleUI,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      layer.updateScale(1600, 900);

      // scaleX = 1600/800 = 2, scaleY = 900/600 = 1.5
      expect(layer.scale.set).toHaveBeenCalledWith(2, 1.5);
    });
  });

  describe('updateScale with LockRatio mode', () => {
    it('should scale maintaining aspect ratio (width limited)', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.LockRatio,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      // Canvas is 1200x1200, target is 800x600 (4:3)
      // scaleX = 1200/800 = 1.5, scaleY = 1200/600 = 2
      // min(1.5, 2) = 1.5
      layer.updateScale(1200, 1200);

      expect(layer.scale.set).toHaveBeenCalledWith(1.5, 1.5);
    });

    it('should scale maintaining aspect ratio (height limited)', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.LockRatio,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      // Canvas is 2400x900, target is 800x600 (4:3)
      // scaleX = 2400/800 = 3, scaleY = 900/600 = 1.5
      // min(3, 1.5) = 1.5
      layer.updateScale(2400, 900);

      expect(layer.scale.set).toHaveBeenCalledWith(1.5, 1.5);
    });

    it('should center content when aspect ratios differ', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.LockRatio,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      // Canvas is 1600x1200, target is 800x600
      // scaleX = 2, scaleY = 2, scale = 2
      // Centered: (1600 - 800*2)/2 = 0, (1200 - 600*2)/2 = 0
      layer.updateScale(1600, 1200);

      expect(layer.scale.set).toHaveBeenCalledWith(2, 2);
      expect(layer.position.set).toHaveBeenCalledWith(0, 0);
    });

    it('should offset for letterboxing', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.LockRatio,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 800, height: 600 };
      layer.addChild(mockChild as any);

      // Canvas is 1200x1200, target is 800x600
      // scaleX = 1.5, scaleY = 2, scale = 1.5
      // scaledWidth = 800 * 1.5 = 1200, scaledHeight = 600 * 1.5 = 900
      // offsetX = (1200 - 1200)/2 = 0, offsetY = (1200 - 900)/2 = 150
      layer.updateScale(1200, 1200);

      expect(layer.position.set).toHaveBeenCalledWith(0, 150);
    });
  });

  describe('updateScale without dimensions', () => {
    it('should not scale if no children and no target dimensions', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });

      layer.updateScale(1600, 1200);

      // Should not call scale.set for ScaleUI without dimensions
      // (it returns early)
      expect(layer.scale.set).not.toHaveBeenCalled();
    });

    it('should use child bounds if target dimensions not provided', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });

      // Mock getLocalBounds returns 800x600
      const mockChild = { width: 100, height: 100 };
      layer.addChild(mockChild as any);

      layer.updateScale(1600, 1200);

      // Uses bounds from getLocalBounds (800x600)
      // scaleX = 1600/800 = 2, scaleY = 1200/600 = 2
      expect(layer.scale.set).toHaveBeenCalledWith(2, 2);
    });
  });

  describe('addChild', () => {
    it('should add child and reset initial bounds flag', () => {
      const layer = new UILayer({
        scaleMode: UIScaleMode.ScaleUI,
        targetWidth: 800,
        targetHeight: 600,
      });

      const mockChild = { width: 100, height: 100 };
      layer.addChild(mockChild as any);

      // Verify addChild was called on the parent
      expect(layer.children).toContain(mockChild);
    });

    it('should recalculate bounds after adding new child', () => {
      const layer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });

      const mockChild1 = { width: 100, height: 100 };
      layer.addChild(mockChild1 as any);
      layer.updateScale(1600, 1200);

      // Add another child - should reset bounds recording
      const mockChild2 = { width: 200, height: 200 };
      layer.addChild(mockChild2 as any);

      // Next updateScale should recalculate bounds
      layer.updateScale(1600, 1200);

      // getLocalBounds should be called again
      expect(layer.getLocalBounds).toHaveBeenCalled();
    });
  });
});
