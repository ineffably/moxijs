/**
 * GUIHeader
 *
 * Header bar for GUI panels with collapse indicator, title, and drag handling.
 */

import { Container, Graphics } from 'pixi.js';
import { UIComponent, UILabel } from '@moxijs/core';
import { px, GUI_CONST, GUI_COLORS } from '../gui-grid';
import type { GUIConfig } from '../gui';

/** GUIHeader configuration */
export interface GUIHeaderOptions {
  /** Header title */
  title: string;
  /** GUI config */
  config?: GUIConfig;
  /** Whether draggable */
  draggable?: boolean;
  /** Start collapsed */
  collapsed?: boolean;
  /** Whether this is a folder (nested GUI) */
  isFolder?: boolean;
}

/**
 * GUI header with title, collapse indicator, and optional drag.
 */
export class GUIHeader extends UIComponent {
  /** Title text */
  protected _title: string;

  /** Config reference */
  protected _config: GUIConfig;

  /** Whether draggable */
  protected _draggable: boolean;

  /** Whether collapsed */
  protected _collapsed: boolean;

  /** Whether this is a folder */
  protected _isFolder: boolean;

  /** Background graphics */
  protected _background: Graphics;

  /** Collapse indicator */
  protected _collapseIndicator: UILabel;

  /** Title label */
  protected _titleLabel: UILabel;

  /** Drag state */
  protected _dragOffset = { x: 0, y: 0 };
  protected _isDragging = false;

  /** Callbacks */
  protected _onToggle?: () => void;
  protected _onDrag?: (x: number, y: number) => void;

  constructor(options: GUIHeaderOptions) {
    super();

    this._title = options.title;
    this._config = options.config ?? (GUI_CONST as GUIConfig);
    this._draggable = options.draggable ?? true;
    this._collapsed = options.collapsed ?? false;
    this._isFolder = options.isFolder ?? false;

    // Create background
    this._background = new Graphics();
    this.container.addChild(this._background);

    // Collapse indicator
    this._collapseIndicator = new UILabel({
      text: this._collapsed ? '▶' : '▼',
      fontSize: px(5),
      fontFamily: this._config.fontFamily,
      color: GUI_COLORS.textMuted,
    });
    this._collapseIndicator.container.x = px(this._config.padding);
    this.container.addChild(this._collapseIndicator.container);

    // Title label
    this._titleLabel = new UILabel({
      text: this._title,
      fontSize: px(6),
      fontFamily: this._config.fontFamily,
      color: GUI_COLORS.text,
    });
    this._titleLabel.container.x = px(this._config.padding + 6);
    this.container.addChild(this._titleLabel.container);

    // Setup interactions
    this._setupEvents();

    // Initial render
    this._render();
  }

  /** Set title */
  setTitle(title: string): void {
    this._title = title;
    this._titleLabel.setText(title);
  }

  /** Set collapsed state (updates indicator) */
  setCollapsed(collapsed: boolean): void {
    this._collapsed = collapsed;
    this._collapseIndicator.setText(collapsed ? '▶' : '▼');
  }

  /** Register toggle callback */
  onToggle(callback: () => void): this {
    this._onToggle = callback;
    return this;
  }

  /** Register drag callback */
  onDrag(callback: (x: number, y: number) => void): this {
    this._onDrag = callback;
    return this;
  }

  /** Setup header events */
  protected _setupEvents(): void {
    this.container.eventMode = 'static';
    this.container.cursor = this._draggable ? 'grab' : 'pointer';

    // Click to toggle
    this.container.on('pointertap', () => {
      if (!this._isDragging) {
        this._onToggle?.();
      }
    });

    if (!this._draggable) return;

    // Drag handling
    this.container.on('pointerdown', (e) => {
      this._isDragging = false;
      this._dragOffset.x = e.global.x;
      this._dragOffset.y = e.global.y;
      this.container.cursor = 'grabbing';

      const startX = this._onDrag ? 0 : 0; // Will use parent position

      const onMove = (e: any) => {
        this._isDragging = true;
        const dx = e.global.x - this._dragOffset.x;
        const dy = e.global.y - this._dragOffset.y;
        this._onDrag?.(dx, dy);
        this._dragOffset.x = e.global.x;
        this._dragOffset.y = e.global.y;
      };

      const onUp = () => {
        this.container.cursor = 'grab';
        this.container.off('globalpointermove', onMove);
        this.container.off('pointerup', onUp);
        this.container.off('pointerupoutside', onUp);

        // Reset drag flag after a tick to allow tap detection
        setTimeout(() => {
          this._isDragging = false;
        }, 0);
      };

      this.container.on('globalpointermove', onMove);
      this.container.on('pointerup', onUp);
      this.container.on('pointerupoutside', onUp);
    });
  }

  /** Render header */
  protected _render(): void {
    const width = px(this._config.width);
    const height = px(this._config.headerHeight);

    this._background.clear();
    this._background.rect(0, 0, width, height);
    this._background.fill(this._isFolder ? GUI_COLORS.folder : GUI_COLORS.header);

    // Center labels vertically
    this._collapseIndicator.container.y =
      (height - this._collapseIndicator.container.height) / 2;
    this._titleLabel.container.y =
      (height - this._titleLabel.container.height) / 2;
  }

  /** Measure header size */
  measure(): { width: number; height: number } {
    return {
      width: px(this._config.width),
      height: px(this._config.headerHeight),
    };
  }

  layout(availableWidth?: number, availableHeight?: number): void {
    this._render();
  }

  protected render(): void {
    this._render();
  }
}

export default GUIHeader;
