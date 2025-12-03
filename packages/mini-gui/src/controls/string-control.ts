/**
 * StringControl
 *
 * Control for string values. Displays editable text using a hidden HTML input.
 */

import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/ui';
import { Control, ControlOptions } from './base-control';
import { px, GUI_COLORS } from '../gui-grid';

/**
 * String text input control.
 */
export class StringControl extends Control<string> {
  /** Input background graphic */
  protected _inputBg: Graphics;

  /** Value display label */
  protected _valueLabel: UILabel;

  /** Hidden HTML input for text editing */
  protected _htmlInput?: HTMLInputElement;

  /** Whether currently editing */
  protected _editing = false;

  constructor(
    panel: any,
    object: Record<string, unknown>,
    property: string,
    options: ControlOptions = {}
  ) {
    super(panel, object, property, options);

    // Create input background in widget area
    this._inputBg = new Graphics();
    this._widget.addChild(this._inputBg);

    // Create value label
    this._valueLabel = new UILabel({
      text: this.getValue(),
      fontSize: px(6),
      fontFamily: this.config.fontFamily,
      color: GUI_COLORS.text,
    });
    this._widget.addChild(this._valueLabel.container);

    // Setup interactions
    this._setupInteractions();

    // Initial layout and render
    this.layout();
    this.updateDisplay();
  }

  /** Update display to match current value */
  updateDisplay(): this {
    this._valueLabel.setText(this.getValue());
    this._renderWidget();
    return this;
  }

  /** Setup click interaction to open input */
  protected _setupInteractions(): void {
    this._widget.eventMode = 'static';
    this._widget.cursor = 'text';

    this._widget.on('pointertap', () => {
      if (this._disabled || this._editing) return;
      this._startEditing();
    });
  }

  /** Start editing with HTML input */
  protected _startEditing(): void {
    this._editing = true;

    // Create hidden input
    this._htmlInput = document.createElement('input');
    this._htmlInput.type = 'text';
    this._htmlInput.value = this.getValue();
    this._htmlInput.style.position = 'fixed';
    this._htmlInput.style.left = '-9999px';
    this._htmlInput.style.top = '-9999px';
    document.body.appendChild(this._htmlInput);

    // Focus and select
    this._htmlInput.focus();
    this._htmlInput.select();

    // Handle input
    this._htmlInput.addEventListener('input', () => {
      if (this._htmlInput) {
        this.setValue(this._htmlInput.value);
      }
    });

    // Handle blur (finish editing)
    this._htmlInput.addEventListener('blur', () => {
      this._stopEditing();
    });

    // Handle enter key
    this._htmlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        this._stopEditing();
      }
    });

    // Update visual state
    this._renderWidget();
  }

  /** Stop editing */
  protected _stopEditing(): void {
    if (!this._editing) return;

    this._editing = false;

    if (this._htmlInput) {
      this._htmlInput.remove();
      this._htmlInput = undefined;
    }

    this._callOnFinishChange();
    this._renderWidget();
  }

  /** Render the input widget */
  protected _renderWidget(): void {
    const inputHeight = px(8); // Taller to fit text with padding
    // Center around text (text top = _textY, text height ~= px(6))
    const textCenter = this._textY + px(3);
    const y = Math.round(textCenter - inputHeight / 2);

    this._inputBg.clear();
    this._inputBg.roundRect(0, y, this._widgetWidth, inputHeight, px(1));
    this._inputBg.fill(this._editing ? GUI_COLORS.accent : GUI_COLORS.input);
    this._inputBg.stroke({
      color: this._editing ? GUI_COLORS.accent : GUI_COLORS.inputBorder,
      width: px(0.5),
    });

    // Position value label inside input, aligned with row label
    this._valueLabel.container.x = px(1.5);
    this._valueLabel.container.y = this._textY;
  }

  /** Override layout to render widget */
  layout(availableWidth?: number, availableHeight?: number): void {
    super.layout(availableWidth, availableHeight);
    this._renderWidget();
  }

  /** Clean up HTML input on destroy */
  destroy(): void {
    this._stopEditing();
    super.destroy();
  }
}

export default StringControl;
