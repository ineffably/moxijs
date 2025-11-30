/**
 * GUIBody
 *
 * Collapsible container for GUI controls with smooth height animation.
 * Uses a mask to clip content during collapse/expand transitions.
 */

import { Container, Graphics, Ticker } from 'pixi.js';
import { UIComponent } from '@moxijs/core';
import { px, GUI_CONST } from '../gui-grid';
import type { GUIConfig } from '../gui';

/** GUIBody configuration */
export interface GUIBodyOptions {
  /** GUI config (inherited from parent) */
  config?: GUIConfig;
  /** Start collapsed */
  collapsed?: boolean;
  /** Animation speed (0 = instant, 1 = slow, 10 = fast) */
  animationSpeed?: number;
}

/**
 * Collapsible body container with height animation.
 */
export class GUIBody extends UIComponent {
  /** Whether collapsed */
  protected _collapsed: boolean;

  /** Content container (controls added here) */
  protected _content: Container;

  /** Clipping mask */
  protected _mask: Graphics;

  /** Target height for animation */
  protected _targetHeight: number = 0;

  /** Current animated height */
  protected _currentHeight: number = 0;

  /** Full content height (when expanded) */
  protected _contentHeight: number = 0;

  /** Animation speed (pixels per frame) */
  protected _animationSpeed: number;

  /** Whether currently animating */
  protected _animating: boolean = false;

  /** Config reference */
  protected _config: GUIConfig;

  /** Callback when open/close completes */
  protected _onOpenClose?: () => void;

  constructor(options: GUIBodyOptions = {}) {
    super();

    this._config = options.config ?? (GUI_CONST as GUIConfig);
    this._collapsed = options.collapsed ?? false;
    this._animationSpeed = options.animationSpeed ?? 8;

    // Create content container
    this._content = new Container();
    this.container.addChild(this._content);

    // Create mask for clipping during animation
    this._mask = new Graphics();
    this.container.addChild(this._mask);
    this._content.mask = this._mask;

    // Start ticker for animation
    Ticker.shared.add(this._onTick, this);
  }

  /** Get the content container (add children here) */
  get content(): Container {
    return this._content;
  }

  /** Whether currently collapsed */
  get collapsed(): boolean {
    return this._collapsed;
  }

  /** Set content height (call after adding/removing children) */
  setContentHeight(height: number): void {
    this._contentHeight = height;

    if (!this._animating) {
      if (this._collapsed) {
        this._currentHeight = 0;
        this._targetHeight = 0;
      } else {
        this._currentHeight = height;
        this._targetHeight = height;
      }
      this._updateMask();
    } else {
      // Update target during animation
      this._targetHeight = this._collapsed ? 0 : height;
    }
  }

  /** Collapse the body */
  collapse(animated: boolean = true): void {
    if (this._collapsed) return;

    this._collapsed = true;
    this._targetHeight = 0;

    if (animated && this._animationSpeed > 0) {
      this._animating = true;
    } else {
      this._currentHeight = 0;
      this._animating = false;
      this._updateMask();
      this._onOpenClose?.();
    }
  }

  /** Expand the body */
  expand(animated: boolean = true): void {
    if (!this._collapsed) return;

    this._collapsed = false;
    this._targetHeight = this._contentHeight;

    if (animated && this._animationSpeed > 0) {
      this._animating = true;
    } else {
      this._currentHeight = this._contentHeight;
      this._animating = false;
      this._updateMask();
      this._onOpenClose?.();
    }
  }

  /** Toggle collapse state */
  toggle(animated: boolean = true): void {
    if (this._collapsed) {
      this.expand(animated);
    } else {
      this.collapse(animated);
    }
  }

  /** Register callback for open/close completion */
  onOpenClose(callback: () => void): this {
    this._onOpenClose = callback;
    return this;
  }

  /** Get current visible height */
  getVisibleHeight(): number {
    return this._currentHeight;
  }

  /** Animation tick */
  protected _onTick = (): void => {
    if (!this._animating) return;

    const diff = this._targetHeight - this._currentHeight;

    if (Math.abs(diff) < 1) {
      // Animation complete
      this._currentHeight = this._targetHeight;
      this._animating = false;
      this._updateMask();
      this._onOpenClose?.();
      return;
    }

    // Lerp toward target
    const speed = this._animationSpeed;
    if (diff > 0) {
      this._currentHeight = Math.min(this._currentHeight + speed, this._targetHeight);
    } else {
      this._currentHeight = Math.max(this._currentHeight - speed, this._targetHeight);
    }

    this._updateMask();
  };

  /** Update the clipping mask */
  protected _updateMask(): void {
    const width = px(this._config.width);

    this._mask.clear();
    if (this._currentHeight > 0) {
      this._mask.rect(0, 0, width, this._currentHeight);
      this._mask.fill(0xffffff);
    }
  }

  /** Measure body size */
  measure(): { width: number; height: number } {
    return {
      width: px(this._config.width),
      height: this._currentHeight,
    };
  }

  /** Clean up */
  destroy(): void {
    Ticker.shared.remove(this._onTick, this);
    super.destroy();
  }

  layout(availableWidth?: number, availableHeight?: number): void {
    this._updateMask();
  }

  protected render(): void {
    this._updateMask();
  }
}

export default GUIBody;
