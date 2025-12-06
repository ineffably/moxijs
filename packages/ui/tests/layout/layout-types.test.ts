import {
  createDefaultLayoutStyle,
  createEmptyComputedLayout,
  createLayoutNode,
  LayoutStyle,
  LayoutNode,
} from '../../src/layout/layout-types';

describe('layout-types', () => {
  describe('createDefaultLayoutStyle', () => {
    it('should create default style', () => {
      const style = createDefaultLayoutStyle();

      expect(style.display).toBe('flex');
      expect(style.position).toBe('relative');
      expect(style.width).toBe('auto');
      expect(style.height).toBe('auto');
      expect(style.padding).toBe(0);
      expect(style.margin).toBe(0);
      expect(style.flexDirection).toBe('row');
      expect(style.flexWrap).toBe('nowrap');
      expect(style.justifyContent).toBe('start');
      expect(style.alignItems).toBe('stretch');
      expect(style.alignContent).toBe('stretch');
      expect(style.gap).toBe(0);
      expect(style.flexGrow).toBe(0);
      expect(style.flexShrink).toBe(1);
      expect(style.flexBasis).toBe('auto');
      expect(style.alignSelf).toBe('auto');
      expect(style.order).toBe(0);
      expect(style.zIndex).toBe(0);
    });

    it('should allow overrides', () => {
      const style = createDefaultLayoutStyle({
        display: 'none',
        width: 200,
        height: 100,
        flexDirection: 'column',
        gap: 10,
      });

      expect(style.display).toBe('none');
      expect(style.width).toBe(200);
      expect(style.height).toBe(100);
      expect(style.flexDirection).toBe('column');
      expect(style.gap).toBe(10);
      // Defaults should remain
      expect(style.position).toBe('relative');
      expect(style.flexWrap).toBe('nowrap');
    });

    it('should allow flex item overrides', () => {
      const style = createDefaultLayoutStyle({
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 100,
        alignSelf: 'center',
      });

      expect(style.flexGrow).toBe(1);
      expect(style.flexShrink).toBe(0);
      expect(style.flexBasis).toBe(100);
      expect(style.alignSelf).toBe('center');
    });

    it('should allow position overrides', () => {
      const style = createDefaultLayoutStyle({
        position: 'absolute',
        top: 10,
        left: 20,
      });

      expect(style.position).toBe('absolute');
      expect(style.top).toBe(10);
      expect(style.left).toBe(20);
    });
  });

  describe('createEmptyComputedLayout', () => {
    it('should create empty layout with zeros', () => {
      const layout = createEmptyComputedLayout();

      expect(layout.x).toBe(0);
      expect(layout.y).toBe(0);
      expect(layout.width).toBe(0);
      expect(layout.height).toBe(0);
      expect(layout.contentX).toBe(0);
      expect(layout.contentY).toBe(0);
      expect(layout.contentWidth).toBe(0);
      expect(layout.contentHeight).toBe(0);
    });
  });

  describe('createLayoutNode', () => {
    it('should create node with default values', () => {
      const node = createLayoutNode('test-node');

      expect(node.id).toBe('test-node');
      expect(node.style).toBeDefined();
      expect(node.style.display).toBe('flex');
      expect(node.children).toEqual([]);
      expect(node.parent).toBeNull();
      expect(node.intrinsicSize).toBeNull();
      expect(node.measureFn).toBeNull();
      expect(node._resolved).toBeNull();
      expect(node._measured).toBeNull();
      expect(node._computed).toBeNull();
    });

    it('should create node with custom style', () => {
      const node = createLayoutNode('styled-node', {
        width: 200,
        height: 100,
        flexDirection: 'column',
      });

      expect(node.id).toBe('styled-node');
      expect(node.style.width).toBe(200);
      expect(node.style.height).toBe(100);
      expect(node.style.flexDirection).toBe('column');
    });

    it('should create node with intrinsic size', () => {
      const node = createLayoutNode('leaf-node', undefined, {
        intrinsicSize: { width: 150, height: 50 },
      });

      expect(node.intrinsicSize).toEqual({ width: 150, height: 50 });
      expect(node.measureFn).toBeNull();
    });

    it('should create node with measure function', () => {
      const measureFn = () => ({ width: 100, height: 30 });
      const node = createLayoutNode('dynamic-node', undefined, {
        measureFn,
      });

      expect(node.measureFn).toBe(measureFn);
      expect(node.intrinsicSize).toBeNull();
    });

    it('should create node with children', () => {
      const child1 = createLayoutNode('child-1');
      const child2 = createLayoutNode('child-2');
      const parent = createLayoutNode('parent-node', undefined, {
        children: [child1, child2],
      });

      expect(parent.children.length).toBe(2);
      expect(parent.children[0]).toBe(child1);
      expect(parent.children[1]).toBe(child2);
    });

    it('should create node with combined options', () => {
      const measureFn = () => ({ width: 50, height: 20 });
      const child = createLayoutNode('child');

      const node = createLayoutNode(
        'complex-node',
        { width: 'fill', gap: 10 },
        {
          children: [child],
          measureFn,
        }
      );

      expect(node.style.width).toBe('fill');
      expect(node.style.gap).toBe(10);
      expect(node.children.length).toBe(1);
      expect(node.measureFn).toBe(measureFn);
    });
  });

  describe('LayoutNode parent relationship', () => {
    it('should maintain parent reference when set manually', () => {
      const parent = createLayoutNode('parent');
      const child = createLayoutNode('child');

      child.parent = parent;
      parent.children.push(child);

      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);
    });
  });
});
