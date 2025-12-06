import {
  LayoutDebugOverlay,
  createLayoutDebugOverlay,
} from '../../src/layout/layout-debug-overlay';
import { createLayoutNode } from '../../src/layout/layout-types';
import { EdgeInsets } from '../../src/base/edge-insets';

// Mock PIXI.js
jest.mock('pixi.js', () => ({
  Container: jest.fn().mockImplementation(() => ({
    addChild: jest.fn(),
    removeChildren: jest.fn(),
    destroy: jest.fn(),
    visible: true,
    label: '',
  })),
  Graphics: jest.fn().mockImplementation(() => ({
    clear: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    roundRect: jest.fn().mockReturnThis(),
    fill: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    beginPath: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    destroy: jest.fn(),
  })),
  Text: jest.fn().mockImplementation(() => ({
    width: 50,
    height: 12,
    position: { set: jest.fn() },
  })),
}));

describe('LayoutDebugOverlay', () => {
  describe('constructor', () => {
    it('should create overlay with default options', () => {
      const overlay = new LayoutDebugOverlay();

      expect(overlay.container).toBeDefined();
      expect(overlay.visible).toBe(true);
    });

    it('should create overlay with custom options', () => {
      const overlay = new LayoutDebugOverlay({
        showOutlines: false,
        showPadding: false,
        outlineColor: 0xff0000,
      });

      expect(overlay.container).toBeDefined();
    });
  });

  describe('visibility', () => {
    it('should show overlay', () => {
      const overlay = new LayoutDebugOverlay();
      overlay.hide();

      overlay.show();

      expect(overlay.visible).toBe(true);
      expect(overlay.container.visible).toBe(true);
    });

    it('should hide overlay', () => {
      const overlay = new LayoutDebugOverlay();

      overlay.hide();

      expect(overlay.visible).toBe(false);
      expect(overlay.container.visible).toBe(false);
    });

    it('should toggle overlay', () => {
      const overlay = new LayoutDebugOverlay();

      const result1 = overlay.toggle();
      expect(result1).toBe(false);
      expect(overlay.visible).toBe(false);

      const result2 = overlay.toggle();
      expect(result2).toBe(true);
      expect(overlay.visible).toBe(true);
    });
  });

  describe('update', () => {
    it('should update with layout tree', () => {
      const overlay = new LayoutDebugOverlay();
      const root = createLayoutNode('root', { width: 800, height: 600 });
      root._computed = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 0,
        contentY: 0,
        contentWidth: 800,
        contentHeight: 600,
      };
      root._resolved = {
        padding: EdgeInsets.zero(),
        margin: EdgeInsets.zero(),
        width: 800,
        height: 600,
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        flexBasis: 'auto',
        mainGap: 0,
        crossGap: 0,
      };

      expect(() => overlay.update(root)).not.toThrow();
    });

    it('should not draw when hidden', () => {
      const overlay = new LayoutDebugOverlay();
      overlay.hide();

      const root = createLayoutNode('root', { width: 800, height: 600 });
      root._computed = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 0,
        contentY: 0,
        contentWidth: 800,
        contentHeight: 600,
      };

      expect(() => overlay.update(root)).not.toThrow();
    });

    it('should handle node without computed layout', () => {
      const overlay = new LayoutDebugOverlay();
      const root = createLayoutNode('root');

      expect(() => overlay.update(root)).not.toThrow();
    });

    it('should draw children recursively', () => {
      const overlay = new LayoutDebugOverlay();
      const root = createLayoutNode('root', { width: 800, height: 600 });
      const child = createLayoutNode('child', { width: 100, height: 50 });

      root._computed = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 10,
        contentY: 10,
        contentWidth: 780,
        contentHeight: 580,
      };
      root._resolved = {
        padding: EdgeInsets.all(10),
        margin: EdgeInsets.zero(),
        width: 800,
        height: 600,
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        flexBasis: 'auto',
        mainGap: 0,
        crossGap: 0,
      };

      child._computed = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        contentX: 0,
        contentY: 0,
        contentWidth: 100,
        contentHeight: 50,
      };
      child._resolved = {
        padding: EdgeInsets.zero(),
        margin: EdgeInsets.zero(),
        width: 100,
        height: 50,
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        flexBasis: 'auto',
        mainGap: 0,
        crossGap: 0,
      };

      child.parent = root;
      root.children = [child];

      expect(() => overlay.update(root)).not.toThrow();
    });
  });

  describe('setOptions', () => {
    it('should update options', () => {
      const overlay = new LayoutDebugOverlay();

      overlay.setOptions({ showLabels: false, outlineColor: 0xff0000 });

      // Options are internal but we can verify it doesn't throw
      expect(overlay.visible).toBe(true);
    });
  });

  describe('dispose', () => {
    it('should dispose overlay', () => {
      const overlay = new LayoutDebugOverlay();

      expect(() => overlay.dispose()).not.toThrow();
    });
  });

  describe('createLayoutDebugOverlay', () => {
    it('should create overlay with factory function', () => {
      const overlay = createLayoutDebugOverlay();

      expect(overlay).toBeInstanceOf(LayoutDebugOverlay);
    });

    it('should create overlay with options', () => {
      const overlay = createLayoutDebugOverlay({ showGaps: true });

      expect(overlay).toBeInstanceOf(LayoutDebugOverlay);
    });
  });

  describe('direction arrows', () => {
    it('should draw direction arrows for containers', () => {
      const overlay = new LayoutDebugOverlay({ showDirectionArrows: true });
      const root = createLayoutNode('root', {
        width: 800,
        height: 600,
        flexDirection: 'row',
      });
      const child = createLayoutNode('child', { width: 100, height: 50 });

      root._computed = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 0,
        contentY: 0,
        contentWidth: 800,
        contentHeight: 600,
      };
      root._resolved = {
        padding: EdgeInsets.zero(),
        margin: EdgeInsets.zero(),
        width: 800,
        height: 600,
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        flexBasis: 'auto',
        mainGap: 0,
        crossGap: 0,
      };

      child._computed = {
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        contentX: 0,
        contentY: 0,
        contentWidth: 100,
        contentHeight: 50,
      };

      child.parent = root;
      root.children = [child];

      expect(() => overlay.update(root)).not.toThrow();
    });

    it('should handle all flex directions', () => {
      const directions = ['row', 'row-reverse', 'column', 'column-reverse'];

      for (const direction of directions) {
        const overlay = new LayoutDebugOverlay({ showDirectionArrows: true });
        const root = createLayoutNode('root', {
          width: 200,
          height: 200,
          flexDirection: direction as 'row' | 'row-reverse' | 'column' | 'column-reverse',
        });
        const child = createLayoutNode('child', { width: 50, height: 50 });

        root._computed = {
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          contentX: 0,
          contentY: 0,
          contentWidth: 200,
          contentHeight: 200,
        };
        root._resolved = {
          padding: EdgeInsets.zero(),
          margin: EdgeInsets.zero(),
          width: 200,
          height: 200,
          minWidth: 0,
          maxWidth: Infinity,
          minHeight: 0,
          maxHeight: Infinity,
          flexBasis: 'auto',
          mainGap: 0,
          crossGap: 0,
        };

        child._computed = {
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          contentX: 0,
          contentY: 0,
          contentWidth: 50,
          contentHeight: 50,
        };

        child.parent = root;
        root.children = [child];

        expect(() => overlay.update(root)).not.toThrow();
      }
    });
  });

  describe('hidden nodes', () => {
    it('should skip hidden nodes', () => {
      const overlay = new LayoutDebugOverlay();
      const root = createLayoutNode('root', { width: 800, height: 600 });
      const hidden = createLayoutNode('hidden', { display: 'none' });

      root._computed = {
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        contentX: 0,
        contentY: 0,
        contentWidth: 800,
        contentHeight: 600,
      };
      root._resolved = {
        padding: EdgeInsets.zero(),
        margin: EdgeInsets.zero(),
        width: 800,
        height: 600,
        minWidth: 0,
        maxWidth: Infinity,
        minHeight: 0,
        maxHeight: Infinity,
        flexBasis: 'auto',
        mainGap: 0,
        crossGap: 0,
      };

      hidden._computed = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        contentX: 0,
        contentY: 0,
        contentWidth: 0,
        contentHeight: 0,
      };

      hidden.parent = root;
      root.children = [hidden];

      expect(() => overlay.update(root)).not.toThrow();
    });
  });
});
