/**
 * OptionControl
 *
 * Control for selecting from a list of options.
 * Accepts an array or object of options.
 */

import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/core';
import { Control, ControlOptions } from './base-control';
import { px, GUI_COLORS } from '../gui-grid';

/** Options can be an array or object mapping labels to values */
export type OptionList<T> = T[] | Record<string, T>;

/**
 * Dropdown/select control for choosing from options.
 */
export class OptionControl<T = unknown> extends Control<T> {
  /** Normalized options as [label, value] pairs */
  protected _options: Array<[string, T]> = [];

  /** Current selected index */
  protected _selectedIndex = 0;

  /** Select background graphic */
  protected _selectBg: Graphics;

  /** Value display label */
  protected _valueLabel: UILabel;

  /** Arrow indicator */
  protected _arrow: UILabel;

  constructor(
    panel: any,
    object: Record<string, unknown>,
    property: string,
    options: OptionList<T>,
    controlOptions: ControlOptions = {}
  ) {
    super(panel, object, property, controlOptions);

    // Normalize options to [label, value] pairs
    this._normalizeOptions(options);

    // Find initial selected index
    this._selectedIndex = this._findSelectedIndex();

    // Create select background in widget area
    this._selectBg = new Graphics();
    this._widget.addChild(this._selectBg);

    // Create value label
    this._valueLabel = new UILabel({
      text: this._getSelectedLabel(),
      fontSize: px(6),
      fontFamily: this.config.fontFamily,
      color: GUI_COLORS.text,
    });
    this._widget.addChild(this._valueLabel.container);

    // Create arrow
    this._arrow = new UILabel({
      text: '▼',
      fontSize: px(4),
      fontFamily: this.config.fontFamily,
      color: GUI_COLORS.textMuted,
    });
    this._widget.addChild(this._arrow.container);

    // Setup interactions
    this._setupInteractions();

    // Initial layout and render
    this.layout();
    this.updateDisplay();
  }

  /** Set options */
  options(opts: OptionList<T>): this {
    this._normalizeOptions(opts);
    this._selectedIndex = this._findSelectedIndex();
    this.updateDisplay();
    return this;
  }

  /** Update display to match current value */
  updateDisplay(): this {
    this._selectedIndex = this._findSelectedIndex();
    this._valueLabel.setText(this._getSelectedLabel());
    this._renderWidget();
    return this;
  }

  /** Normalize options to [label, value] pairs */
  protected _normalizeOptions(options: OptionList<T>): void {
    this._options = [];

    if (Array.isArray(options)) {
      for (const opt of options) {
        this._options.push([String(opt), opt]);
      }
    } else {
      for (const [label, value] of Object.entries(options)) {
        this._options.push([label, value as T]);
      }
    }
  }

  /** Find index of currently selected value */
  protected _findSelectedIndex(): number {
    const currentValue = this.getValue();
    for (let i = 0; i < this._options.length; i++) {
      if (this._options[i][1] === currentValue) {
        return i;
      }
    }
    return 0;
  }

  /** Get label for current selection */
  protected _getSelectedLabel(): string {
    if (this._options.length === 0) return '';
    return this._options[this._selectedIndex]?.[0] ?? '';
  }

  /** Setup click interaction to cycle through options */
  protected _setupInteractions(): void {
    this._widget.eventMode = 'static';
    this._widget.cursor = 'pointer';

    // Left click: cycle forward
    this._widget.on('pointertap', (e) => {
      if (this._disabled) return;

      // Right click or shift+click: cycle backward
      const backward = e.button === 2 || e.shiftKey;

      if (backward) {
        this._selectedIndex =
          (this._selectedIndex - 1 + this._options.length) % this._options.length;
      } else {
        this._selectedIndex = (this._selectedIndex + 1) % this._options.length;
      }

      const [, value] = this._options[this._selectedIndex];
      this.setValue(value);
      this._callOnFinishChange();
    });

    // Prevent context menu on right click
    this._widget.on('rightclick', (e) => {
      e.preventDefault?.();
    });
  }

  /** Render the select widget */
  protected _renderWidget(): void {
    const selectHeight = px(8); // Taller to fit text with padding
    // Center around text (text top = _textY, text height ~= px(6))
    const textCenter = this._textY + px(3);
    const y = Math.round(textCenter - selectHeight / 2);

    this._selectBg.clear();
    this._selectBg.roundRect(0, y, this._widgetWidth, selectHeight, px(1));
    this._selectBg.fill(GUI_COLORS.input);
    this._selectBg.stroke({ color: GUI_COLORS.inputBorder, width: px(0.5) });

    // Position value label, centered in select box
    this._valueLabel.container.x = px(1.5);
    this._valueLabel.container.y = this._textY;

    // Position arrow at right, centered
    this._arrow.container.x = this._widgetWidth - this._arrow.container.width - px(1.5);
    this._arrow.container.y = this._textY;
  }

  /** Override layout to render widget */
  layout(availableWidth?: number, availableHeight?: number): void {
    super.layout(availableWidth, availableHeight);
    this._renderWidget();
  }
}

export default OptionControl;
