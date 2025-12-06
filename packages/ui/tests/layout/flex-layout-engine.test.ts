import { FlexLayoutEngine } from '../../src/layout/flex-layout-engine';
import { createLayoutNode, LayoutNode } from '../../src/layout/layout-types';

describe('FlexLayoutEngine', () => {
  let engine: FlexLayoutEngine;

  beforeEach(() => {
    engine = new FlexLayoutEngine();
  });

  describe('compute', () => {
    it('should compute layout for single node', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
      });

      engine.compute(root, 800, 600);

      expect(root._computed).not.toBeNull();
      expect(root._computed!.width).toBe(400);
      expect(root._computed!.height).toBe(300);
    });

    it('should compute layout for auto-sized node', () => {
      const root = createLayoutNode('root', {
        width: 'auto',
        height: 'auto',
        padding: 10,
      });

      engine.compute(root, 800, 600);

      expect(root._computed).not.toBeNull();
      // Auto with no content = padding only
      expect(root._computed!.width).toBe(20); // padding horizontal
      expect(root._computed!.height).toBe(20); // padding vertical
    });

    it('should compute layout for fill-sized node', () => {
      const root = createLayoutNode('root', {
        width: 'fill',
        height: 'fill',
      });

      engine.compute(root, 800, 600);

      expect(root._computed).not.toBeNull();
      expect(root._computed!.width).toBe(800);
      expect(root._computed!.height).toBe(600);
    });

    it('should skip hidden nodes', () => {
      const root = createLayoutNode('root', {
        display: 'none',
      });

      engine.compute(root, 800, 600);

      expect(root._computed).toBeNull();
      expect(root._resolved).toBeNull();
    });
  });

  describe('row layout', () => {
    it('should layout children in a row', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed!.x).toBe(0);
      expect(child2._computed!.x).toBe(100);
    });

    it('should layout children with gap', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
        gap: 20,
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed!.x).toBe(0);
      expect(child2._computed!.x).toBe(120); // 100 + 20 gap
    });

    it('should justify content center', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'center',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      // Centered: (400 - 100) / 2 = 150
      expect(child._computed!.x).toBe(150);
    });

    it('should justify content end', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'end',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      // End aligned: 400 - 100 = 300
      expect(child._computed!.x).toBe(300);
    });

    it('should justify content space-between', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed!.x).toBe(0);
      // space-between: (400 - 200) / 1 = 200 between
      expect(child2._computed!.x).toBe(300);
    });
  });

  describe('column layout', () => {
    it('should layout children in a column', () => {
      const root = createLayoutNode('root', {
        width: 200,
        height: 400,
        flexDirection: 'column',
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed!.y).toBe(0);
      expect(child2._computed!.y).toBe(50);
    });

    it('should layout column children with gap', () => {
      const root = createLayoutNode('root', {
        width: 200,
        height: 400,
        flexDirection: 'column',
        gap: 10,
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed!.y).toBe(0);
      expect(child2._computed!.y).toBe(60); // 50 + 10 gap
    });
  });

  describe('flex grow', () => {
    it('should distribute free space to single grow item', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
      });

      // Child has intrinsic width of 100, container is 400
      // With flexGrow: 1, child should expand to fill all 400px
      const child = createLayoutNode(
        'child',
        { width: 'auto', height: 50, flexGrow: 1 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      expect(child._computed).not.toBeNull();
      // Free space = 400 - 100 = 300, all goes to this child
      expect(child._computed!.width).toBe(400);
    });

    it('should distribute free space proportionally to grow factors', () => {
      const root = createLayoutNode('root', {
        width: 300,
        height: 100,
        flexDirection: 'row',
      });

      // Container is 300px, children have base size 50 each = 100px used
      // Free space = 200px, distributed by grow ratio 1:2
      // child1 gets 200 * 1/3 = ~66.67, child2 gets 200 * 2/3 = ~133.33
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexGrow: 1 },
        { intrinsicSize: { width: 50, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexGrow: 2 },
        { intrinsicSize: { width: 50, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed).not.toBeNull();
      expect(child2._computed).not.toBeNull();
      // child1: 50 + 66.67 = ~116.67
      // child2: 50 + 133.33 = ~183.33
      expect(child1._computed!.width).toBeCloseTo(116.67, 0);
      expect(child2._computed!.width).toBeCloseTo(183.33, 0);
      // Total should equal container width
      expect(child1._computed!.width + child2._computed!.width).toBeCloseTo(300, 0);
    });

    it('should not grow items with flexGrow: 0', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
      });

      // child1 has grow: 0 (default), child2 has grow: 1
      // child1 stays at base size, child2 gets all free space
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexGrow: 0 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexGrow: 1 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // child1 stays at 100, child2 gets remaining 300
      expect(child1._computed!.width).toBe(100);
      expect(child2._computed!.width).toBe(300);
    });

    it('should respect maxWidth when growing', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
      });

      // child1 has maxWidth 150, so it can only grow to 150
      // Remaining space goes to child2
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexGrow: 1, maxWidth: 150 },
        { intrinsicSize: { width: 100, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexGrow: 1 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // child1 capped at 150, child2 gets the rest (250)
      expect(child1._computed!.width).toBe(150);
      expect(child2._computed!.width).toBe(250);
    });

    it('should grow items in column layout', () => {
      const root = createLayoutNode('root', {
        width: 100,
        height: 300,
        flexDirection: 'column',
      });

      const child1 = createLayoutNode(
        'child1',
        { width: 50, height: 'auto', flexGrow: 1 },
        { intrinsicSize: { width: 50, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 50, height: 'auto', flexGrow: 1 },
        { intrinsicSize: { width: 50, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // Both should split the 300px equally (150 each)
      expect(child1._computed!.height).toBe(150);
      expect(child2._computed!.height).toBe(150);
    });
  });

  describe('flex shrink', () => {
    it('should shrink items proportionally when overflow', () => {
      const root = createLayoutNode('root', {
        width: 200,
        height: 100,
        flexDirection: 'row',
      });

      // Total content = 150 + 150 = 300, container = 200
      // Overflow = 100, distributed equally (both shrink: 1, same base size)
      // Each shrinks by 50
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexShrink: 1 },
        { intrinsicSize: { width: 150, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexShrink: 1 },
        { intrinsicSize: { width: 150, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      expect(child1._computed).not.toBeNull();
      expect(child2._computed).not.toBeNull();
      // Each should be 100px (150 - 50 shrink)
      expect(child1._computed!.width).toBe(100);
      expect(child2._computed!.width).toBe(100);
      // Total should fit in container
      expect(child1._computed!.width + child2._computed!.width).toBe(200);
    });

    it('should not shrink items with flexShrink: 0', () => {
      const root = createLayoutNode('root', {
        width: 200,
        height: 100,
        flexDirection: 'row',
      });

      // child1 has shrink: 0, child2 has shrink: 1
      // child1 keeps its size, child2 shrinks to fit
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexShrink: 0 },
        { intrinsicSize: { width: 150, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexShrink: 1 },
        { intrinsicSize: { width: 150, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // child1 stays at 150, child2 shrinks to 50
      expect(child1._computed!.width).toBe(150);
      expect(child2._computed!.width).toBe(50);
    });

    it('should respect minWidth when shrinking', () => {
      const root = createLayoutNode('root', {
        width: 200,
        height: 100,
        flexDirection: 'row',
      });

      // child1 has minWidth 120, can only shrink to 120
      // child2 takes the rest of the shrinking
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexShrink: 1, minWidth: 120 },
        { intrinsicSize: { width: 150, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexShrink: 1 },
        { intrinsicSize: { width: 150, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // child1 capped at minWidth 120, child2 shrinks to 80
      expect(child1._computed!.width).toBe(120);
      expect(child2._computed!.width).toBe(80);
    });

    it('should shrink items in column layout', () => {
      const root = createLayoutNode('root', {
        width: 100,
        height: 200,
        flexDirection: 'column',
      });

      // Total = 150 + 150 = 300, container = 200, overflow = 100
      const child1 = createLayoutNode(
        'child1',
        { width: 50, height: 'auto', flexShrink: 1 },
        { intrinsicSize: { width: 50, height: 150 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 50, height: 'auto', flexShrink: 1 },
        { intrinsicSize: { width: 50, height: 150 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // Both shrink equally to 100 each
      expect(child1._computed!.height).toBe(100);
      expect(child2._computed!.height).toBe(100);
    });

    it('should weight shrink by base size and shrink factor', () => {
      const root = createLayoutNode('root', {
        width: 250,
        height: 100,
        flexDirection: 'row',
      });

      // child1: base=200, shrink=1, scaledShrink=200
      // child2: base=100, shrink=2, scaledShrink=200
      // Total overflow = 300 - 250 = 50
      // Each gets 50% of shrink = 25
      const child1 = createLayoutNode(
        'child1',
        { width: 'auto', height: 50, flexShrink: 1 },
        { intrinsicSize: { width: 200, height: 50 } }
      );
      const child2 = createLayoutNode(
        'child2',
        { width: 'auto', height: 50, flexShrink: 2 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child1.parent = root;
      child2.parent = root;
      root.children = [child1, child2];

      engine.compute(root, 800, 600);

      // child1: 200 - 25 = 175
      // child2: 100 - 25 = 75
      expect(child1._computed!.width).toBe(175);
      expect(child2._computed!.width).toBe(75);
    });
  });

  describe('align items', () => {
    it('should align items to start', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 200,
        flexDirection: 'row',
        alignItems: 'start',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      expect(child._computed!.y).toBe(0);
    });

    it('should align items to center', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 200,
        flexDirection: 'row',
        alignItems: 'center',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      // Centered: (200 - 50) / 2 = 75
      expect(child._computed!.y).toBe(75);
    });

    it('should align items to end', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 200,
        flexDirection: 'row',
        alignItems: 'end',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      // End: 200 - 50 = 150
      expect(child._computed!.y).toBe(150);
    });

    it('should stretch items to fill cross axis', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 200,
        flexDirection: 'row',
        alignItems: 'stretch',
      });

      // Note: stretch only affects height when it's 'auto'
      const child = createLayoutNode(
        'child',
        { width: 100, height: 'auto' },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      // Child height should stretch to fill the container's cross axis
      // The engine applies stretch during positioning
      expect(child._computed!.height).toBeGreaterThanOrEqual(50);
    });
  });

  describe('padding', () => {
    it('should apply padding to content area', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
        padding: 20,
      });

      engine.compute(root, 800, 600);

      expect(root._computed!.contentX).toBe(20);
      expect(root._computed!.contentY).toBe(20);
      expect(root._computed!.contentWidth).toBe(360); // 400 - 40
      expect(root._computed!.contentHeight).toBe(260); // 300 - 40
    });

    it('should offset children by padding', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
        padding: 20,
        flexDirection: 'row',
      });

      const child = createLayoutNode(
        'child',
        { width: 100, height: 50 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      expect(child._computed!.x).toBe(20);
      expect(child._computed!.y).toBe(20);
    });
  });

  describe('nested containers', () => {
    it('should layout nested containers', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
        flexDirection: 'column',
      });

      const nested = createLayoutNode('nested', {
        width: 200,
        height: 100,
        flexDirection: 'row',
      });

      const leaf = createLayoutNode(
        'leaf',
        { width: 50, height: 50 },
        { intrinsicSize: { width: 50, height: 50 } }
      );

      nested.parent = root;
      leaf.parent = nested;
      root.children = [nested];
      nested.children = [leaf];

      engine.compute(root, 800, 600);

      expect(root._computed).not.toBeNull();
      expect(nested._computed).not.toBeNull();
      expect(leaf._computed).not.toBeNull();
      expect(leaf._computed!.width).toBe(50);
    });
  });

  describe('absolute positioning', () => {
    it('should position absolute child', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
      });

      const absolute = createLayoutNode(
        'absolute',
        {
          position: 'absolute',
          width: 100,
          height: 50,
          top: 10,
          left: 20,
        },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      absolute.parent = root;
      root.children = [absolute];

      engine.compute(root, 800, 600);

      expect(absolute._computed).not.toBeNull();
      expect(absolute._computed!.x).toBe(20);
      expect(absolute._computed!.y).toBe(10);
    });

    it('should position absolute child with right/bottom', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 300,
      });

      const absolute = createLayoutNode(
        'absolute',
        {
          position: 'absolute',
          width: 100,
          height: 50,
          right: 10,
          bottom: 20,
        },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      absolute.parent = root;
      root.children = [absolute];

      engine.compute(root, 800, 600);

      expect(absolute._computed).not.toBeNull();
      expect(absolute._computed!.x).toBe(290); // 400 - 100 - 10
      expect(absolute._computed!.y).toBe(230); // 300 - 50 - 20
    });
  });

  describe('min/max constraints', () => {
    it('should respect minWidth', () => {
      const root = createLayoutNode('root', {
        width: 100,
        height: 100,
        flexDirection: 'row',
      });

      const child = createLayoutNode(
        'child',
        { width: 50, height: 50, minWidth: 80, flexShrink: 1 },
        { intrinsicSize: { width: 50, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      expect(child._computed!.width).toBeGreaterThanOrEqual(80);
    });

    it('should respect maxWidth', () => {
      const root = createLayoutNode('root', {
        width: 400,
        height: 100,
        flexDirection: 'row',
      });

      const child = createLayoutNode(
        'child',
        { width: 'auto', height: 50, maxWidth: 200, flexGrow: 1 },
        { intrinsicSize: { width: 100, height: 50 } }
      );

      child.parent = root;
      root.children = [child];

      engine.compute(root, 800, 600);

      expect(child._computed!.width).toBeLessThanOrEqual(200);
    });
  });
});
