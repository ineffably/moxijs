/**
 * Layout Debug Overlay
 *
 * Visual debugging tool for the flex layout system.
 * Shows container bounds, padding, margin, and flex information.
 *
 * @module layout/debug/layout-debug-overlay
 */

import * as PIXI from 'pixi.js';
import { LayoutNode, ComputedLayout } from './layout-types';

/**
 * Debug overlay options
 */
export interface LayoutDebugOverlayOptions {
  /** Show container outlines (default: true) */
  showOutlines?: boolean;

  /** Show padding visualization (default: true) */
  showPadding?: boolean;

  /** Show margin visualization (default: true) */
  showMargin?: boolean;

  /** Show gap visualization (default: false) */
  showGaps?: boolean;

  /** Show node labels (default: true) */
  showLabels?: boolean;

  /** Show flex direction arrows (default: true) */
  showDirectionArrows?: boolean;

  /** Outline color (default: 0x00ff00 green) */
  outlineColor?: number;

  /** Padding color (default: 0x00ff00 green with alpha) */
  paddingColor?: number;

  /** Margin color (default: 0xffaa00 orange with alpha) */
  marginColor?: number;

  /** Label font size (default: 10) */
  labelFontSize?: number;

  /** Label background color (default: 0x333333) */
  labelBackgroundColor?: number;

  /** Label text color (default: 0xffffff) */
  labelTextColor?: number;
}

const DEFAULT_OPTIONS: Required<LayoutDebugOverlayOptions> = {
  showOutlines: true,
  showPadding: true,
  showMargin: true,
  showGaps: false,
  showLabels: true,
  showDirectionArrows: true,
  outlineColor: 0x00ff00,
  paddingColor: 0x00ff00,
  marginColor: 0xffaa00,
  labelFontSize: 10,
  labelBackgroundColor: 0x333333,
  labelTextColor: 0xffffff,
};

/**
 * Visual debug overlay for inspecting layout.
 *
 * @example
 * ```typescript
 * const overlay = new LayoutDebugOverlay();
 * app.stage.addChild(overlay.container);
 *
 * // Update after layout computation
 * layoutTree.setOnLayoutComplete((root) => {
 *   overlay.update(root);
 * });
 *
 * // Toggle visibility
 * overlay.toggle();
 * ```
 */
export class LayoutDebugOverlay {
  public readonly container: PIXI.Container;
  private _graphics: PIXI.Graphics;
  private _labelsContainer: PIXI.Container;
  private _options: Required<LayoutDebugOverlayOptions>;
  private _visible: boolean = true;

  constructor(options: LayoutDebugOverlayOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };

    this.container = new PIXI.Container();
    this.container.label = 'LayoutDebugOverlay';

    this._graphics = new PIXI.Graphics();
    this._labelsContainer = new PIXI.Container();

    this.container.addChild(this._graphics);
    this.container.addChild(this._labelsContainer);

    // Start hidden by default in production
    this.container.visible = this._visible;
  }

  /**
   * Update the overlay with a layout tree
   */
  update(root: LayoutNode): void {
    this._graphics.clear();
    this._labelsContainer.removeChildren();

    if (!this._visible) return;

    this.drawNode(root, 0, 0, 0);
  }

  /**
   * Show the overlay
   */
  show(): void {
    this._visible = true;
    this.container.visible = true;
  }

  /**
   * Hide the overlay
   */
  hide(): void {
    this._visible = false;
    this.container.visible = false;
  }

  /**
   * Toggle overlay visibility
   */
  toggle(): boolean {
    this._visible = !this._visible;
    this.container.visible = this._visible;
    return this._visible;
  }

  /**
   * Check if overlay is visible
   */
  get visible(): boolean {
    return this._visible;
  }

  /**
   * Update options
   */
  setOptions(options: Partial<LayoutDebugOverlayOptions>): void {
    this._options = { ...this._options, ...options };
  }

  /**
   * Draw a node and its children recursively
   */
  private drawNode(
    node: LayoutNode,
    parentX: number,
    parentY: number,
    depth: number
  ): void {
    if (!node._computed) return;

    const computed = node._computed;
    const resolved = node._resolved;
    const style = node.style;

    // Calculate absolute position
    const absX = parentX + computed.x;
    const absY = parentY + computed.y;

    // Skip hidden nodes
    if (style.display === 'none') return;

    // Draw margin (outermost)
    if (this._options.showMargin && resolved) {
      const margin = resolved.margin;
      this._graphics.rect(
        absX - margin.left,
        absY - margin.top,
        computed.width + margin.horizontal,
        computed.height + margin.vertical
      );
      this._graphics.fill({ color: this._options.marginColor, alpha: 0.15 });
    }

    // Draw outline
    if (this._options.showOutlines) {
      this._graphics.rect(absX, absY, computed.width, computed.height);
      this._graphics.stroke({
        color: this._options.outlineColor,
        width: 1,
        alpha: 0.7,
      });
    }

    // Draw padding (inside)
    if (this._options.showPadding && resolved) {
      const padding = resolved.padding;

      // Top padding
      if (padding.top > 0) {
        this._graphics.rect(absX, absY, computed.width, padding.top);
        this._graphics.fill({ color: this._options.paddingColor, alpha: 0.2 });
      }

      // Bottom padding
      if (padding.bottom > 0) {
        this._graphics.rect(
          absX,
          absY + computed.height - padding.bottom,
          computed.width,
          padding.bottom
        );
        this._graphics.fill({ color: this._options.paddingColor, alpha: 0.2 });
      }

      // Left padding
      if (padding.left > 0) {
        this._graphics.rect(
          absX,
          absY + padding.top,
          padding.left,
          computed.height - padding.vertical
        );
        this._graphics.fill({ color: this._options.paddingColor, alpha: 0.2 });
      }

      // Right padding
      if (padding.right > 0) {
        this._graphics.rect(
          absX + computed.width - padding.right,
          absY + padding.top,
          padding.right,
          computed.height - padding.vertical
        );
        this._graphics.fill({ color: this._options.paddingColor, alpha: 0.2 });
      }
    }

    // Draw direction arrow for containers
    if (this._options.showDirectionArrows && node.children.length > 0) {
      this.drawDirectionArrow(absX, absY, computed, style.flexDirection);
    }

    // Draw label
    if (this._options.showLabels) {
      this.drawLabel(node, absX, absY, depth);
    }

    // Calculate content area offset for children
    const contentX = absX + computed.contentX;
    const contentY = absY + computed.contentY;

    // Draw children
    for (const child of node.children) {
      if (child.style.position === 'absolute') {
        // Absolute children are positioned relative to parent content
        this.drawNode(child, contentX, contentY, depth + 1);
      } else {
        // Relative children are positioned relative to parent content
        this.drawNode(child, contentX, contentY, depth + 1);
      }
    }
  }

  /**
   * Draw a direction arrow indicating flex direction
   */
  private drawDirectionArrow(
    x: number,
    y: number,
    computed: ComputedLayout,
    direction: string
  ): void {
    const cx = x + computed.width / 2;
    const cy = y + computed.height / 2;
    const arrowSize = 12;
    const arrowColor = 0x00aaff;

    this._graphics.beginPath();

    switch (direction) {
      case 'row':
        // Right arrow
        this._graphics.moveTo(cx - arrowSize, cy);
        this._graphics.lineTo(cx + arrowSize, cy);
        this._graphics.lineTo(cx + arrowSize - 4, cy - 4);
        this._graphics.moveTo(cx + arrowSize, cy);
        this._graphics.lineTo(cx + arrowSize - 4, cy + 4);
        break;

      case 'row-reverse':
        // Left arrow
        this._graphics.moveTo(cx + arrowSize, cy);
        this._graphics.lineTo(cx - arrowSize, cy);
        this._graphics.lineTo(cx - arrowSize + 4, cy - 4);
        this._graphics.moveTo(cx - arrowSize, cy);
        this._graphics.lineTo(cx - arrowSize + 4, cy + 4);
        break;

      case 'column':
        // Down arrow
        this._graphics.moveTo(cx, cy - arrowSize);
        this._graphics.lineTo(cx, cy + arrowSize);
        this._graphics.lineTo(cx - 4, cy + arrowSize - 4);
        this._graphics.moveTo(cx, cy + arrowSize);
        this._graphics.lineTo(cx + 4, cy + arrowSize - 4);
        break;

      case 'column-reverse':
        // Up arrow
        this._graphics.moveTo(cx, cy + arrowSize);
        this._graphics.lineTo(cx, cy - arrowSize);
        this._graphics.lineTo(cx - 4, cy - arrowSize + 4);
        this._graphics.moveTo(cx, cy - arrowSize);
        this._graphics.lineTo(cx + 4, cy - arrowSize + 4);
        break;
    }

    this._graphics.stroke({ color: arrowColor, width: 2, alpha: 0.8 });
  }

  /**
   * Draw a label for a node
   */
  private drawLabel(
    node: LayoutNode,
    x: number,
    y: number,
    depth: number
  ): void {
    const computed = node._computed!;
    const label = this.formatLabel(node);

    // Create text
    const text = new PIXI.Text({
      text: label,
      style: {
        fontSize: this._options.labelFontSize,
        fill: this._options.labelTextColor,
        fontFamily: 'monospace',
      },
    });

    // Position at top-left of node
    const padding = 2;
    const labelX = x + 2;
    const labelY = y + 2;

    // Draw background
    const bgGraphics = new PIXI.Graphics();
    bgGraphics.roundRect(
      labelX - padding,
      labelY - padding,
      text.width + padding * 2,
      text.height + padding * 2,
      2
    );
    bgGraphics.fill({ color: this._options.labelBackgroundColor, alpha: 0.85 });

    text.position.set(labelX, labelY);

    this._labelsContainer.addChild(bgGraphics);
    this._labelsContainer.addChild(text);
  }

  /**
   * Format a label string for a node
   */
  private formatLabel(node: LayoutNode): string {
    const computed = node._computed!;
    const style = node.style;

    const parts: string[] = [];

    // Node ID (shortened)
    const shortId = node.id.length > 10 ? node.id.slice(0, 10) + '…' : node.id;
    parts.push(shortId);

    // Dimensions
    parts.push(`${Math.round(computed.width)}×${Math.round(computed.height)}`);

    // Flex info for containers
    if (node.children.length > 0) {
      const dir = style.flexDirection.charAt(0).toUpperCase();
      parts.push(dir);
    }

    return parts.join(' ');
  }

  /**
   * Dispose the overlay
   */
  dispose(): void {
    this._graphics.destroy();
    this._labelsContainer.destroy({ children: true });
    this.container.destroy();
  }
}

/**
 * Create a debug overlay
 */
export function createLayoutDebugOverlay(
  options?: LayoutDebugOverlayOptions
): LayoutDebugOverlay {
  return new LayoutDebugOverlay(options);
}
