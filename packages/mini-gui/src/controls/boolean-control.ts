/**
 * BooleanControl
 *
 * Control for boolean values. Displays a checkbox/toggle.
 */

import { Graphics } from 'pixi.js';
import { Control, ControlOptions } from './base-control';
import { px, GUI_COLORS } from '../gui-grid';

/**
 * Boolean toggle control.
 */
export class BooleanControl extends Control<boolean> {
  /** Checkbox box graphic */
  protected _box: Graphics;

  /** Checkmark graphic */
  protected _check: Graphics;

  constructor(
    panel: any,
    object: Record<string, unknown>,
    property: string,
    options: ControlOptions = {}
  ) {
    super(panel, object, property, options);

    // Create checkbox box in widget area
    this._box = new Graphics();
    this._widget.addChild(this._box);

    // Create checkmark
    this._check = new Graphics();
    this._widget.addChild(this._check);

    // Setup interactions
    this._setupInteractions();

    // Initial layout and render
    this.layout();
    this.updateDisplay();
  }

  /** Update display to match current value */
  updateDisplay(): this {
    this._renderWidget();
    return this;
  }

  /** Setup click interaction */
  protected _setupInteractions(): void {
    this._widget.eventMode = 'static';
    this._widget.cursor = 'pointer';

    this._widget.on('pointertap', () => {
      if (this._disabled) return;
      this.setValue(!this.getValue());
      this._callOnFinishChange();
    });
  }

  /** Render the checkbox widget */
  protected _renderWidget(): void {
    const size = px(6);
    const height = px(this.config.rowHeight);
    const y = Math.round((height - size) / 2);
    const checked = this.getValue();

    // Right-align the checkbox in widget area
    const x = this._widgetWidth - size;

    // Draw box
    this._box.clear();
    this._box.roundRect(x, y, size, size, px(1));
    this._box.fill(checked ? GUI_COLORS.accent : GUI_COLORS.input);
    this._box.stroke({ color: checked ? GUI_COLORS.accent : GUI_COLORS.inputBorder, width: px(0.5) });

    // Draw checkmark
    this._check.clear();
    if (checked) {
      const padding = px(1.5);
      const x1 = x + padding;
      const y1 = y + size / 2;
      const x2 = x + size / 2 - px(0.5);
      const y2 = y + size - padding;
      const x3 = x + size - padding;
      const y3 = y + padding;

      this._check.moveTo(x1, y1);
      this._check.lineTo(x2, y2);
      this._check.lineTo(x3, y3);
      this._check.stroke({ color: GUI_COLORS.background, width: px(1) });
    }
  }

  /** Override layout to render widget */
  layout(availableWidth?: number, availableHeight?: number): void {
    super.layout(availableWidth, availableHeight);
    this._renderWidget();
  }
}

export default BooleanControl;
