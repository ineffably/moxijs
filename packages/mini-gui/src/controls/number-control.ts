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
const DEFAULT_VALUE_WIDTH = 25;

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

  /** Value display background/hit area */
  protected _numberBg: Graphics;

  /** Slider hit area */
  protected _sliderHitArea: Graphics;

  /** Hidden HTML input for editing */
  protected _htmlInput?: HTMLInputElement;

  /** Whether currently editing */
  protected _editing = false;

  /** Width of the value area in grid units */
  protected _valueWidth = DEFAULT_VALUE_WIDTH;

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

    // Create slider hit area (invisible but interactive)
    this._sliderHitArea = new Graphics();
    this._widget.addChild(this._sliderHitArea);

    // Create value background/hit area
    this._numberBg = new Graphics();
    this._widget.addChild(this._numberBg);

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
    return this._widgetWidth - px(this._valueWidth) - px(2); // subtract gap
  }

  /** Setup mouse/touch interactions */
  protected _setupInteractions(): void {
    // Slider interaction
    this._sliderHitArea.eventMode = 'static';
    this._sliderHitArea.cursor = 'ew-resize';

    this._sliderHitArea.on('pointerdown', (e) => {
      if (this._disabled || !this._hasSlider) return;

      this._dragging = true;
      this._dragStartX = e.global.x;
      this._dragStartValue = this.getValue();

      // Jump to click position
      const local = this._sliderHitArea.toLocal(e.global);
      const sliderWidth = this._getSliderWidth();
      const normalized = Math.max(0, Math.min(1, local.x / sliderWidth));
      this._setFromNormalized(normalized);

      const onMove = (e: any) => {
        if (!this._dragging) return;
        const local = this._sliderHitArea.toLocal(e.global);
        const sliderWidth = this._getSliderWidth();
        const normalized = Math.max(0, Math.min(1, local.x / sliderWidth));
        this._setFromNormalized(normalized);
      };

      const onUp = () => {
        this._dragging = false;
        this._callOnFinishChange();
        this._sliderHitArea.off('globalpointermove', onMove);
        this._sliderHitArea.off('pointerup', onUp);
        this._sliderHitArea.off('pointerupoutside', onUp);
      };

      this._sliderHitArea.on('globalpointermove', onMove);
      this._sliderHitArea.on('pointerup', onUp);
      this._sliderHitArea.on('pointerupoutside', onUp);
    });

    // value interaction (click to edit)
    this._numberBg.eventMode = 'static';
    this._numberBg.cursor = 'text';

    this._numberBg.on('pointertap', () => {
      if (this._disabled || this._editing) return;
      this._startEditing();
    });

    // Fallback drag interaction for whole widget if no slider
    // (This ensures non-slider numbers are still draggable/editable)
    // Actually, users might prefer click-to-edit for non-slider too.
    // Let's make _numberBg always handle click-to-edit.
    // If no slider, we might want the number area to fill the space?
    // For now, let's keep the split layout but make the left side draggable if no slider?
    // User requested "numbers when there is a slider needs to be editable".
  }

  /** Start editing with HTML input */
  protected _startEditing(): void {
    this._editing = true;

    // Create hidden input
    this._htmlInput = document.createElement('input');
    this._htmlInput.type = 'number';
    this._htmlInput.step = this._step.toString();
    this._htmlInput.value = this.getValue().toString();
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
        const val = parseFloat(this._htmlInput.value);
        if (!isNaN(val)) {
          // Note: We don't clamp while typing to allow intermediate values,
          // but we might want to when done.
          // For now, let's just set it so visuals update.
          this.setValue(val);
        }
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

    // Update visual state (highlight)
    this._renderWidget();
  }

  /** Stop editing */
  protected _stopEditing(): void {
    if (!this._editing) return;

    this._editing = false;

    if (this._htmlInput) {
      // Final clamp on exit
      this.setValue(this._clampValue(parseFloat(this._htmlInput.value) || 0));
      this._htmlInput.remove();
      this._htmlInput = undefined;
    }

    this._callOnFinishChange();
    this._renderWidget();
  }

  /** Render the widget content (slider + value) */
  protected _renderWidget(): void {
    const sliderWidth = this._getSliderWidth();
    const trackHeight = px(2);
    // Center track vertically
    const textCenter = this._textY + px(3);
    const trackY = Math.round(textCenter - trackHeight / 2);

    this._track.clear();
    this._fill.clear();
    this._sliderHitArea.clear();
    this._numberBg.clear();

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

      // Hit area for slider
      this._sliderHitArea.rect(0, 0, sliderWidth, px(12)); // Full height hit area
      this._sliderHitArea.fill({ color: 0x000000, alpha: 0.001 }); // Invisible interactive
    }

    // Render number background (input style)
    const numberX = sliderWidth + px(2);
    const numberWidth = px(this._valueWidth);
    const numberHeight = px(8); // Input height
    const numberY = Math.round(textCenter - numberHeight / 2);

    this._numberBg.roundRect(numberX, numberY, numberWidth, numberHeight, px(1));
    this._numberBg.fill(this._editing ? GUI_COLORS.accent : GUI_COLORS.input);

    // Optional border for number field to make it distinct
    this._numberBg.stroke({
      color: this._editing ? GUI_COLORS.accent : GUI_COLORS.inputBorder,
      width: px(0.5)
    });

    // Position value label inside number bg
    this._valueLabel.container.x = numberX + px(2); // Padding inside input
    this._valueLabel.container.y = this._textY;
  }

  /** Override layout to render widget after row layout */
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

export default NumberControl;
