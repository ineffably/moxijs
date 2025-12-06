import { LayoutTree, createLayoutTree } from '../../src/layout/layout-tree';
import { createLayoutNode } from '../../src/layout/layout-types';

describe('LayoutTree', () => {
  describe('constructor', () => {
    it('should create tree with dimensions', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      expect(tree.width).toBe(800);
      expect(tree.height).toBe(600);
    });

    it('should create root node', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      expect(tree.root).toBeDefined();
      expect(tree.root.id).toBe('root');
      expect(tree.root.style.width).toBe(800);
      expect(tree.root.style.height).toBe(600);
    });
  });

  describe('setSize', () => {
    it('should update dimensions', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      tree.setSize(1024, 768);

      expect(tree.width).toBe(1024);
      expect(tree.height).toBe(768);
    });

    it('should mark tree dirty when size changes', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      tree.setSize(1024, 768);

      expect(tree.isDirty()).toBe(true);
    });

    it('should not mark dirty when size is same', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.computeNow();

      tree.setSize(800, 600);

      expect(tree.isDirty()).toBe(false);
    });
  });

  describe('getNode', () => {
    it('should find root node by id', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      const node = tree.getNode('root');

      expect(node).toBe(tree.root);
    });

    it('should return undefined for unknown id', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      const node = tree.getNode('unknown');

      expect(node).toBeUndefined();
    });

    it('should find added child by id', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child-1');
      tree.addChild(tree.root, child);

      const found = tree.getNode('child-1');

      expect(found).toBe(child);
    });
  });

  describe('addChild', () => {
    it('should add child to parent', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child');

      tree.addChild(tree.root, child);

      expect(tree.root.children).toContain(child);
      expect(child.parent).toBe(tree.root);
    });

    it('should add child at specific index', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child1 = createLayoutNode('child-1');
      const child2 = createLayoutNode('child-2');
      const child3 = createLayoutNode('child-3');

      tree.addChild(tree.root, child1);
      tree.addChild(tree.root, child3);
      tree.addChild(tree.root, child2, 1);

      expect(tree.root.children[0]).toBe(child1);
      expect(tree.root.children[1]).toBe(child2);
      expect(tree.root.children[2]).toBe(child3);
    });

    it('should mark parent dirty', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.computeNow();
      const child = createLayoutNode('child');

      tree.addChild(tree.root, child);

      expect(tree.isDirty()).toBe(true);
    });

    it('should remove child from previous parent', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const parent1 = createLayoutNode('parent-1');
      const parent2 = createLayoutNode('parent-2');
      const child = createLayoutNode('child');

      tree.addChild(tree.root, parent1);
      tree.addChild(tree.root, parent2);
      tree.addChild(parent1, child);
      tree.addChild(parent2, child);

      expect(parent1.children).not.toContain(child);
      expect(parent2.children).toContain(child);
      expect(child.parent).toBe(parent2);
    });
  });

  describe('removeChild', () => {
    it('should remove child from parent', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child');
      tree.addChild(tree.root, child);

      tree.removeChild(tree.root, child);

      expect(tree.root.children).not.toContain(child);
      expect(child.parent).toBeNull();
    });

    it('should unregister node from map', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child');
      tree.addChild(tree.root, child);

      tree.removeChild(tree.root, child);

      expect(tree.getNode('child')).toBeUndefined();
    });

    it('should mark parent dirty', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child');
      tree.addChild(tree.root, child);
      tree.computeNow();

      tree.removeChild(tree.root, child);

      expect(tree.isDirty()).toBe(true);
    });
  });

  describe('createNode', () => {
    it('should create and add node', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      const node = tree.createNode('new-node', tree.root, { width: 100 });

      expect(node.id).toBe('new-node');
      expect(node.style.width).toBe(100);
      expect(tree.root.children).toContain(node);
    });

    it('should create node with intrinsic size', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      const node = tree.createNode('leaf', tree.root, undefined, {
        intrinsicSize: { width: 50, height: 30 },
      });

      expect(node.intrinsicSize).toEqual({ width: 50, height: 30 });
    });

    it('should create node with measure function', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const measureFn = () => ({ width: 100, height: 50 });

      const node = tree.createNode('dynamic', tree.root, undefined, {
        measureFn,
      });

      expect(node.measureFn).toBe(measureFn);
    });

    it('should create node at specific index', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.createNode('first', tree.root);
      tree.createNode('third', tree.root);

      const second = tree.createNode('second', tree.root, undefined, {
        index: 1,
      });

      expect(tree.root.children[1]).toBe(second);
    });
  });

  describe('removeNode', () => {
    it('should remove node from tree', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const node = tree.createNode('node', tree.root);

      tree.removeNode(node);

      expect(tree.root.children).not.toContain(node);
      expect(tree.getNode('node')).toBeUndefined();
    });

    it('should handle node without parent', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const orphan = createLayoutNode('orphan');

      expect(() => tree.removeNode(orphan)).not.toThrow();
    });
  });

  describe('markDirty', () => {
    it('should mark node dirty', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.computeNow();

      tree.markDirty(tree.root, 'style');

      expect(tree.isDirty()).toBe(true);
    });

    it('should return dirty count', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      tree.markDirty(tree.root, 'style');

      expect(tree.getDirtyCount()).toBe(1);
    });
  });

  describe('computeNow', () => {
    it('should compute layout immediately', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.markDirty(tree.root, 'style');

      tree.computeNow();

      expect(tree.isDirty()).toBe(false);
      expect(tree.root._computed).not.toBeNull();
    });

    it('should call onLayoutComplete callback', () => {
      const callback = jest.fn();
      const tree = createLayoutTree({
        width: 800,
        height: 600,
        onLayoutComplete: callback,
      });
      tree.markDirty(tree.root, 'style');

      tree.computeNow();

      expect(callback).toHaveBeenCalledWith(tree.root);
    });

    it('should do nothing when not dirty', () => {
      const callback = jest.fn();
      const tree = createLayoutTree({
        width: 800,
        height: 600,
        onLayoutComplete: callback,
      });
      tree.computeNow();
      callback.mockClear();

      tree.computeNow();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getComputedLayout', () => {
    it('should return computed layout for node', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      // Mark dirty to trigger computation
      tree.markDirty(tree.root, 'style');
      tree.computeNow();

      const layout = tree.getComputedLayout(tree.root);

      expect(layout).not.toBeNull();
      expect(layout!.width).toBe(800);
      expect(layout!.height).toBe(600);
    });

    it('should return null before computation', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = createLayoutNode('child');
      tree.addChild(tree.root, child);
      // Don't compute - just check initial state
      // Note: addChild marks dirty, so we need to clear that first
      tree.computeNow(); // This computes root but child is new

      // Create another child after computation
      const newChild = createLayoutNode('new-child');
      // Don't add it to tree, so it has no computed layout
      const layout = tree.getComputedLayout(newChild);

      expect(layout).toBeNull();
    });
  });

  describe('traverse', () => {
    it('should traverse tree depth-first', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child1 = tree.createNode('child-1', tree.root);
      const child2 = tree.createNode('child-2', tree.root);
      const grandchild = tree.createNode('grandchild', child1);

      const visited: string[] = [];
      tree.traverse((node) => visited.push(node.id));

      expect(visited).toEqual(['root', 'child-1', 'grandchild', 'child-2']);
    });

    it('should pass depth to callback', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child = tree.createNode('child', tree.root);
      tree.createNode('grandchild', child);

      const depths: number[] = [];
      tree.traverse((_, depth) => depths.push(depth));

      expect(depths).toEqual([0, 1, 2]);
    });

    it('should traverse from custom start node', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const child1 = tree.createNode('child-1', tree.root);
      tree.createNode('child-2', tree.root);
      tree.createNode('grandchild', child1);

      const visited: string[] = [];
      tree.traverse((node) => visited.push(node.id), child1);

      expect(visited).toEqual(['child-1', 'grandchild']);
    });
  });

  describe('find', () => {
    it('should find nodes matching predicate', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.createNode('match-1', tree.root, { width: 100 });
      tree.createNode('no-match', tree.root, { width: 200 });
      tree.createNode('match-2', tree.root, { width: 100 });

      const found = tree.find((node) => node.style.width === 100);

      expect(found.length).toBe(2);
      expect(found.map((n) => n.id)).toEqual(['match-1', 'match-2']);
    });

    it('should return empty array when no matches', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });

      const found = tree.find((node) => node.id === 'nonexistent');

      expect(found).toEqual([]);
    });
  });

  describe('setOnLayoutComplete', () => {
    it('should update callback', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      const newCallback = jest.fn();

      tree.setOnLayoutComplete(newCallback);
      tree.markDirty(tree.root, 'style');
      tree.computeNow();

      expect(newCallback).toHaveBeenCalled();
    });

    it('should clear callback when undefined', () => {
      const callback = jest.fn();
      const tree = createLayoutTree({
        width: 800,
        height: 600,
        onLayoutComplete: callback,
      });

      tree.setOnLayoutComplete(undefined);
      tree.markDirty(tree.root, 'style');
      tree.computeNow();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should clear tree', () => {
      const tree = createLayoutTree({ width: 800, height: 600 });
      tree.createNode('child-1', tree.root);
      tree.createNode('child-2', tree.root);

      tree.dispose();

      expect(tree.root.children).toEqual([]);
      expect(tree.getNode('child-1')).toBeUndefined();
      expect(tree.isDirty()).toBe(false);
    });
  });
});
