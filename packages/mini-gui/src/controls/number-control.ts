/**
 * NumberControl
 *
 * Control for numeric values. Displays a slider when min/max are provided,
 * otherwise shows a draggable number input.
 */

import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/ui';
import { Control, ControlOptions } from './base-control';
import { px, GUI_COLORS } from '../gui-grid';

/** NumberControl configuration */
export interface NumberControlOptions extends ControlOptions {
  /** Minimum value (enables slider mode) */
  min?: number;
  /** Maximum value (enables slider mode) */
  max?: number;
  /** Step increment */
  step?: number;
}

/** Width reserved for value display (grid units) */
const VALUE_WIDTH = 20;

/**
 * Numeric value control with slider or draggable input.
 */
export class NumberControl extends Control<number> {
  /** Minimum value */
  protected _min?: number;

  /** Maximum value */
  protected _max?: number;

  /** Step increment */
  protected _step: number;

  /** Whether slider mode is enabled */
  protected _hasSlider: boolean;

  /** Slider track graphic */
  protected _track: Graphics;

  /** Slider fill graphic */
  protected _fill: Graphics;

  /** Value display label */
  protected _valueLabel: UILabel;

  /** Drag state */
  protected _dragging = false;
  protected _dragStartX = 0;
  protected _dragStartValue = 0;

  constructor(
    panel: any,
    object: Record<string, unknown>,
    property: string,
    min?: number,
    max?: number,
    step?: number,
    options: NumberControlOptions = {}
  ) {
    super(panel, object, property, options);

    this._min = min ?? options.min;
    this._max = max ?? options.max;
    this._step = step ?? options.step ?? this._computeStep();
    this._hasSlider = this._min !== undefined && this._max !== undefined;

    // Create slider track in widget area
    this._track = new Graphics();
    this._widget.addChild(this._track);

    // Create slider fill
    this._fill = new Graphics();
    this._widget.addChild(this._fill);

    // Create value label
    this._valueLabel = new UILabel({
      text: this._formatValue(this.getValue()),
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

  /** Set minimum value */
  min(value: number): this {
    this._min = value;
    this._hasSlider = this._min !== undefined && this._max !== undefined;
    this.updateDisplay();
    return this;
  }

  /** Set maximum value */
  max(value: number): this {
    this._max = value;
    this._hasSlider = this._min !== undefined && this._max !== undefined;
    this.updateDisplay();
    return this;
  }

  /** Set step increment */
  step(value: number): this {
    this._step = value;
    return this;
  }

  /** Update display to match current value */
  updateDisplay(): this {
    const value = this.getValue();
    this._valueLabel.setText(this._formatValue(value));
    this._renderWidget();
    return this;
  }

  /** Compute reasonable step from value */
  protected _computeStep(): number {
    const value = Math.abs(this.getValue());
    if (value === 0) return 0.1;
    if (value < 1) return 0.01;
    if (value < 10) return 0.1;
    if (value < 100) return 1;
    return 10;
  }

  /** Format value for display */
  protected _formatValue(value: number): string {
    const stepStr = this._step.toString();
    const decimalIdx = stepStr.indexOf('.');
    const decimals = decimalIdx === -1 ? 0 : stepStr.length - decimalIdx - 1;
    return value.toFixed(Math.min(decimals, 4));
  }

  /** Clamp value to min/max and snap to step */
  protected _clampValue(value: number): number {
    if (this._step > 0) {
      value = Math.round(value / this._step) * this._step;
    }
    if (this._min !== undefined) {
      value = Math.max(this._min, value);
    }
    if (this._max !== undefined) {
      value = Math.min(this._max, value);
    }
    return value;
  }

  /** Get normalized value (0-1) for slider */
  protected _getNormalized(): number {
    if (this._min === undefined || this._max === undefined) return 0;
    const range = this._max - this._min;
    if (range === 0) return 0;
    return (this.getValue() - this._min) / range;
  }

  /** Set value from normalized (0-1) */
  protected _setFromNormalized(normalized: number): void {
    if (this._min === undefined || this._max === undefined) return;
    const range = this._max - this._min;
    const value = this._min + normalized * range;
    this.setValue(this._clampValue(value));
  }

  /** Get slider track width (widget minus value label space) */
  protected _getSliderWidth(): number {
    return this._widgetWidth - px(VALUE_WIDTH);
  }

  /** Setup mouse/touch interactions */
  protected _setupInteractions(): void {
    this._widget.eventMode = 'static';
    this._widget.cursor = 'ew-resize';

    this._widget.on('pointerdown', (e) => {
      if (this._disabled) return;

      this._dragging = true;
      this._dragStartX = e.global.x;
      this._dragStartValue = this.getValue();

      // If slider mode, jump to click position
      if (this._hasSlider) {
        const local = this._widget.toLocal(e.global);
        const sliderWidth = this._getSliderWidth();
        const normalized = Math.max(0, Math.min(1, local.x / sliderWidth));
        this._setFromNormalized(normalized);
      }

      const onMove = (e: any) => {
        if (!this._dragging) return;

        if (this._hasSlider) {
          const local = this._widget.toLocal(e.global);
          const sliderWidth = this._getSliderWidth();
          const normalized = Math.max(0, Math.min(1, local.x / sliderWidth));
          this._setFromNormalized(normalized);
        } else {
          const dx = e.global.x - this._dragStartX;
          const sensitivity = this._step * 0.5;
          const newValue = this._dragStartValue + dx * sensitivity;
          this.setValue(this._clampValue(newValue));
        }
      };

      const onUp = () => {
        this._dragging = false;
        this._callOnFinishChange();
        this._widget.off('globalpointermove', onMove);
        this._widget.off('pointerup', onUp);
        this._widget.off('pointerupoutside', onUp);
      };

      this._widget.on('globalpointermove', onMove);
      this._widget.on('pointerup', onUp);
      this._widget.on('pointerupoutside', onUp);
    });
  }

  /** Render the widget content (slider + value) */
  protected _renderWidget(): void {
    const sliderWidth = this._getSliderWidth();
    const trackHeight = px(2);
    // Center track vertically with text (text center = _textY + fontSize/2)
    const textCenter = this._textY + px(3); // Half of px(6) font size
    const trackY = Math.round(textCenter - trackHeight / 2);

    this._track.clear();
    this._fill.clear();

    if (this._hasSlider) {
      // Draw track
      this._track.roundRect(0, trackY, sliderWidth, trackHeight, px(1));
      this._track.fill(GUI_COLORS.sliderTrack);

      // Draw fill
      const fillWidth = sliderWidth * this._getNormalized();
      if (fillWidth > 0) {
        this._fill.roundRect(0, trackY, fillWidth, trackHeight, px(1));
        this._fill.fill(GUI_COLORS.sliderFill);
      }
    }

    // Position value label at end, aligned with row label
    this._valueLabel.container.x = sliderWidth + px(2);
    this._valueLabel.container.y = this._textY;
  }

  /** Override layout to render widget after row layout */
  layout(availableWidth?: number, availableHeight?: number): void {
    super.layout(availableWidth, availableHeight);
    this._renderWidget();
  }
}

export default NumberControl;
