/**
 * Layout Tree
 *
 * Manages a tree of LayoutNodes with:
 * - Dirty tracking: knows which nodes need re-layout
 * - Batched updates: coalesces multiple changes into single layout pass
 * - Incremental computation: only recomputes affected subtrees
 *
 * @module layout/tree/layout-tree
 */

import {
  LayoutNode,
  DirtyReason,
  DirtyInfo,
  ComputedLayout,
  createLayoutNode,
} from '../core/layout-types';
import { FlexLayoutEngine } from '../engine/flex-layout-engine';

/**
 * Callback fired when layout computation completes
 */
export type LayoutCompleteCallback = (root: LayoutNode) => void;

/**
 * Options for creating a LayoutTree
 */
export interface LayoutTreeOptions {
  /** Available width for root layout */
  width: number;

  /** Available height for root layout */
  height: number;

  /** Callback fired after layout completes */
  onLayoutComplete?: LayoutCompleteCallback;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Manages a tree of LayoutNodes with dirty tracking and batched updates.
 */
export class LayoutTree {
  private _root: LayoutNode;
  private _width: number;
  private _height: number;
  private _engine: FlexLayoutEngine;
  private _dirty: Set<LayoutNode> = new Set();
  private _dirtyInfo: Map<LayoutNode, DirtyInfo> = new Map();
  private _updateScheduled: boolean = false;
  private _onLayoutComplete?: LayoutCompleteCallback;
  private _debug: boolean;
  private _nodeMap: Map<string, LayoutNode> = new Map();

  constructor(options: LayoutTreeOptions) {
    this._width = options.width;
    this._height = options.height;
    this._onLayoutComplete = options.onLayoutComplete;
    this._debug = options.debug ?? false;
    this._engine = new FlexLayoutEngine();

    // Create root node
    this._root = createLayoutNode('root', {
      width: options.width,
      height: options.height,
    });
    this._nodeMap.set('root', this._root);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get the root node
   */
  get root(): LayoutNode {
    return this._root;
  }

  /**
   * Get available width
   */
  get width(): number {
    return this._width;
  }

  /**
   * Get available height
   */
  get height(): number {
    return this._height;
  }

  /**
   * Update available dimensions
   */
  setSize(width: number, height: number): void {
    if (this._width !== width || this._height !== height) {
      this._width = width;
      this._height = height;
      this._root.style.width = width;
      this._root.style.height = height;
      this.markDirty(this._root, 'size');
    }
  }

  /**
   * Get a node by ID
   */
  getNode(id: string): LayoutNode | undefined {
    return this._nodeMap.get(id);
  }

  /**
   * Add a child node to a parent
   */
  addChild(
    parent: LayoutNode,
    child: LayoutNode,
    index?: number
  ): void {
    // Remove from previous parent if any
    if (child.parent) {
      this.removeChild(child.parent, child);
    }

    // Add to new parent
    if (index !== undefined && index >= 0 && index < parent.children.length) {
      parent.children.splice(index, 0, child);
    } else {
      parent.children.push(child);
    }

    child.parent = parent;
    this._nodeMap.set(child.id, child);

    // Register all descendants
    this.registerDescendants(child);

    this.markDirty(parent, 'children');
  }

  /**
   * Remove a child node from its parent
   */
  removeChild(parent: LayoutNode, child: LayoutNode): void {
    const index = parent.children.indexOf(child);
    if (index >= 0) {
      parent.children.splice(index, 1);
      child.parent = null;

      // Unregister node and descendants
      this.unregisterDescendants(child);

      this.markDirty(parent, 'children');
    }
  }

  /**
   * Create and add a new node
   */
  createNode(
    id: string,
    parent: LayoutNode,
    style?: Partial<LayoutNode['style']>,
    options?: {
      intrinsicSize?: { width: number; height: number };
      measureFn?: () => { width: number; height: number };
      index?: number;
    }
  ): LayoutNode {
    const node = createLayoutNode(id, style, {
      intrinsicSize: options?.intrinsicSize,
      measureFn: options?.measureFn,
    });

    this.addChild(parent, node, options?.index);
    return node;
  }

  /**
   * Remove and dispose a node
   */
  removeNode(node: LayoutNode): void {
    if (node.parent) {
      this.removeChild(node.parent, node);
    }
  }

  /**
   * Mark a node as dirty (needs re-layout)
   */
  markDirty(node: LayoutNode, reason: DirtyReason): void {
    // Find the highest ancestor that needs full re-layout
    const dirtyNode = this.findDirtyRoot(node, reason);

    // Add to dirty set
    if (!this._dirty.has(dirtyNode)) {
      this._dirty.add(dirtyNode);
      this._dirtyInfo.set(dirtyNode, {
        node: dirtyNode,
        reason,
        timestamp: Date.now(),
      });

      if (this._debug) {
        console.log(
          `[LayoutTree] Marked dirty: ${dirtyNode.id} (reason: ${reason})`
        );
      }
    }

    // Schedule update
    this.scheduleUpdate();
  }

  /**
   * Force immediate layout computation
   */
  computeNow(): void {
    if (this._dirty.size === 0) return;

    const startTime = this._debug ? performance.now() : 0;

    // Clear dirty tracking
    this._dirty.clear();
    this._dirtyInfo.clear();

    // Compute full layout
    this._engine.compute(this._root, this._width, this._height);

    if (this._debug) {
      const elapsed = performance.now() - startTime;
      console.log(`[LayoutTree] Layout computed in ${elapsed.toFixed(2)}ms`);
    }

    // Fire callback
    if (this._onLayoutComplete) {
      this._onLayoutComplete(this._root);
    }
  }

  /**
   * Get computed layout for a node
   */
  getComputedLayout(node: LayoutNode): ComputedLayout | null {
    return node._computed;
  }

  /**
   * Check if any nodes are dirty
   */
  isDirty(): boolean {
    return this._dirty.size > 0;
  }

  /**
   * Get the number of dirty nodes
   */
  getDirtyCount(): number {
    return this._dirty.size;
  }

  /**
   * Set the layout complete callback
   */
  setOnLayoutComplete(callback: LayoutCompleteCallback | undefined): void {
    this._onLayoutComplete = callback;
  }

  /**
   * Enable or disable debug mode
   */
  setDebug(debug: boolean): void {
    this._debug = debug;
  }

  /**
   * Traverse the tree depth-first
   */
  traverse(
    callback: (node: LayoutNode, depth: number) => void,
    startNode?: LayoutNode
  ): void {
    const start = startNode ?? this._root;
    this.traverseNode(start, callback, 0);
  }

  /**
   * Find nodes matching a predicate
   */
  find(predicate: (node: LayoutNode) => boolean): LayoutNode[] {
    const results: LayoutNode[] = [];
    this.traverse((node) => {
      if (predicate(node)) {
        results.push(node);
      }
    });
    return results;
  }

  /**
   * Dispose the tree and clear all nodes
   */
  dispose(): void {
    this._dirty.clear();
    this._dirtyInfo.clear();
    this._nodeMap.clear();
    this._root.children = [];
    this._onLayoutComplete = undefined;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ════════════════════════════════════════════════════════════════════════════

  private registerDescendants(node: LayoutNode): void {
    for (const child of node.children) {
      this._nodeMap.set(child.id, child);
      this.registerDescendants(child);
    }
  }

  private unregisterDescendants(node: LayoutNode): void {
    this._nodeMap.delete(node.id);
    this._dirty.delete(node);
    this._dirtyInfo.delete(node);

    for (const child of node.children) {
      this.unregisterDescendants(child);
    }
  }

  private findDirtyRoot(node: LayoutNode, reason: DirtyReason): LayoutNode {
    // For most changes, we need to re-layout from the parent
    // because the change affects sibling positioning
    if (reason === 'style' || reason === 'size' || reason === 'children') {
      // If parent has auto sizing, we need to bubble up further
      let current = node;
      while (current.parent) {
        const parent = current.parent;
        const parentStyle = parent.style;

        // If parent auto-sizes based on children, it's affected
        if (
          parentStyle.width === 'auto' ||
          parentStyle.height === 'auto' ||
          parentStyle.flexWrap !== 'nowrap'
        ) {
          current = parent;
        } else {
          // Parent has fixed size, can stop here
          break;
        }
      }
      return current;
    }

    return node;
  }

  private scheduleUpdate(): void {
    if (this._updateScheduled) return;

    this._updateScheduled = true;

    // Use queueMicrotask for batching
    queueMicrotask(() => {
      this._updateScheduled = false;
      this.computeNow();
    });
  }

  private traverseNode(
    node: LayoutNode,
    callback: (node: LayoutNode, depth: number) => void,
    depth: number
  ): void {
    callback(node, depth);

    for (const child of node.children) {
      this.traverseNode(child, callback, depth + 1);
    }
  }
}

/**
 * Create a new LayoutTree
 */
export function createLayoutTree(options: LayoutTreeOptions): LayoutTree {
  return new LayoutTree(options);
}
