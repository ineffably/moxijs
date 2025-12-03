/**
 * ControlRow
 *
 * Base row container for all GUI controls. Handles consistent layout
 * with label on left and widget area on right.
 */

import { Container, Graphics } from 'pixi.js';
import { UIComponent, UILabel } from '@moxijs/ui';
import { px, GUI_CONST, GUI_COLORS } from '../gui-grid';
import type { GUIConfig } from '../gui';

/** ControlRow configuration */
export interface ControlRowOptions {
  /** Row label text */
  label: string;
  /** GUI config (inherited from parent) */
  config?: GUIConfig;
}

/**
 * Base row component with label + widget layout.
 * All controls extend this for consistent alignment.
 */
export class ControlRow extends UIComponent {
  /** Row label */
  protected _rowLabel: UILabel;

  /** Label clipping mask */
  protected _labelMask: Graphics;

  /** Widget container (controls populate this) */
  protected _widget: Container;

  /** Row background */
  protected _rowBackground: Graphics;

  /** Config reference */
  protected _rowConfig: GUIConfig;

  /** Label text */
  protected _labelText: string;

  /** Calculated text Y position for consistent alignment */
  protected _textY: number = 0;

  /** Widget area width (calculated on layout) */
  protected _widgetWidth: number = 0;

  constructor(options: ControlRowOptions) {
    super();

    this._labelText = options.label;
    this._rowConfig = options.config ?? GUI_CONST as GUIConfig;

    // Create row background (for hover effects)
    this._rowBackground = new Graphics();
    this.container.addChild(this._rowBackground);

    // Create label
    this._rowLabel = new UILabel({
      text: this._labelText,
      fontSize: px(6),
      fontFamily: this._rowConfig.fontFamily,
      color: GUI_COLORS.textMuted,
    });
    this.container.addChild(this._rowLabel.container);

    // Create label mask for clipping
    this._labelMask = new Graphics();
    this.container.addChild(this._labelMask);
    this._rowLabel.container.mask = this._labelMask;

    // Create widget container
    this._widget = new Container();
    this.container.addChild(this._widget);

    // Setup hover interaction
    this.container.eventMode = 'static';
    this.container.on('pointerenter', () => this._drawRowBackground(true));
    this.container.on('pointerleave', () => this._drawRowBackground(false));
  }

  /** Get the config */
  get config(): GUIConfig {
    return this._rowConfig;
  }

  /** Get widget container for controls to populate */
  get widget(): Container {
    return this._widget;
  }

  /** Get consistent text Y position */
  get textY(): number {
    return this._textY;
  }

  /** Get widget area width */
  get widgetWidth(): number {
    return this._widgetWidth;
  }

  /** Set label text */
  setLabel(text: string): void {
    this._labelText = text;
    this._rowLabel.setText(text);
  }

  /** Measure row size */
  measure(): { width: number; height: number } {
    const cfg = this._rowConfig;
    return {
      width: px(cfg.width - cfg.padding * 2),
      height: px(cfg.rowHeight),
    };
  }

  /** Layout the row */
  layout(availableWidth?: number, availableHeight?: number): void {
    const cfg = this._rowConfig;
    const totalWidth = px(cfg.width - cfg.padding * 2);
    const rowHeight = px(cfg.rowHeight);
    const pad = px(cfg.padding);

    // Calculate areas
    const labelAreaWidth = totalWidth * cfg.labelRatio;
    this._widgetWidth = totalWidth - labelAreaWidth;

    // Calculate shared text Y position
    this._textY = Math.round((rowHeight - this._rowLabel.container.height) / 2);

    // Position label
    this._rowLabel.container.x = pad;
    this._rowLabel.container.y = this._textY;

    // Draw label mask
    this._labelMask.clear();
    this._labelMask.rect(0, 0, labelAreaWidth + pad, rowHeight);
    this._labelMask.fill(0xffffff);

    // Position widget container
    this._widget.x = labelAreaWidth;
    this._widget.y = 0;

    // Draw background
    this._drawRowBackground(false);
  }

  /** Draw row background */
  protected _drawRowBackground(hover: boolean = false): void {
    const cfg = this._rowConfig;
    const width = px(cfg.width - cfg.padding * 2);
    const height = px(cfg.rowHeight);

    this._rowBackground.clear();
    if (hover) {
      this._rowBackground.rect(0, 0, width, height);
      this._rowBackground.fill({ color: GUI_COLORS.hover, alpha: 0.5 });
    }
  }

  protected render(): void {
    // Subclasses override to render widget content
  }
}

export default ControlRow;
