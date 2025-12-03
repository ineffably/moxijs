/**
 * Base Control
 *
 * Abstract base class for all panel controls. Extends ControlRow for
 * consistent layout and adds property binding, value management, and callbacks.
 */

import { ControlRow } from '../components';
import { GUI_CONST } from '../gui-grid';

/** Callback for value changes */
export type ChangeCallback<T> = (value: T) => void;

/** Control configuration */
export interface ControlOptions {
  /** Display name (defaults to property name) */
  name?: string;
}

/**
 * Abstract base class for panel controls.
 * Extends ControlRow for layout, adds property binding and value sync.
 */
export abstract class Control<T = unknown> extends ControlRow {
  /** Parent panel (GUI or folder) */
  protected _panel: any;

  /** Object containing the controlled property */
  protected _object: Record<string, unknown>;

  /** Property name being controlled */
  protected _property: string;

  /** Initial value (for reset) */
  protected _initialValue: T;

  /** Display name */
  protected _name: string;

  /** Whether control is disabled */
  protected _disabled = false;

  /** Whether control is hidden */
  protected _hidden = false;

  /** onChange callback */
  protected _onChange?: ChangeCallback<T>;

  /** onFinishChange callback */
  protected _onFinishChange?: ChangeCallback<T>;

  /** Whether value changed since last finishChange */
  protected _changed = false;

  /** Whether listening for external changes */
  protected _listening = false;

  /** Animation frame ID for listening */
  protected _listenFrameId?: number;

  /** Previous value when listening */
  protected _listenPrevValue?: T;

  constructor(
    panel: any,
    object: Record<string, unknown>,
    property: string,
    options: ControlOptions = {}
  ) {
    // Get config from parent panel
    const config = panel?.config ?? GUI_CONST;
    const name = options.name ?? property;

    // Initialize ControlRow with label and config
    super({ label: name, config });

    this._panel = panel;
    this._object = object;
    this._property = property;
    this._initialValue = this.getValue();
    this._name = name;

    // Note: Subclasses must call this.updateDisplay() after creating their widgets
  }

  /** Get current value from bound object */
  getValue(): T {
    return this._object[this._property] as T;
  }

  /** Set value on bound object */
  setValue(value: T): this {
    if (this._object[this._property] === value) return this;

    this._object[this._property] = value;
    this._callOnChange();
    this.updateDisplay();
    return this;
  }

  /** Update the visual display to match current value */
  abstract updateDisplay(): this;

  /** Set display name */
  name(name: string): this {
    this._name = name;
    this.setLabel(name);
    return this;
  }

  /** Register onChange callback */
  onChange(callback: ChangeCallback<T>): this {
    this._onChange = callback;
    return this;
  }

  /** Register onFinishChange callback */
  onFinishChange(callback: ChangeCallback<T>): this {
    this._onFinishChange = callback;
    return this;
  }

  /** Reset to initial value */
  reset(): this {
    this.setValue(this._initialValue);
    this._callOnFinishChange();
    return this;
  }

  /** Enable/disable the control */
  enable(enabled = true): this {
    return this.disable(!enabled);
  }

  /** Disable/enable the control */
  disable(disabled = true): this {
    if (this._disabled === disabled) return this;
    this._disabled = disabled;
    this.container.alpha = disabled ? 0.5 : 1;
    this.container.eventMode = disabled ? 'none' : 'static';
    return this;
  }

  /** Show/hide the control */
  show(visible = true): this {
    this._hidden = !visible;
    this.container.visible = visible;
    return this;
  }

  /** Hide the control */
  hide(): this {
    return this.show(false);
  }

  /** Listen for external value changes */
  listen(enabled = true): this {
    this._listening = enabled;

    if (this._listenFrameId !== undefined) {
      cancelAnimationFrame(this._listenFrameId);
      this._listenFrameId = undefined;
    }

    if (enabled) {
      this._listenCallback();
    }
    return this;
  }

  /** Save current value (for persistence) */
  save(): T {
    return this.getValue();
  }

  /** Load saved value */
  load(value: T): this {
    this.setValue(value);
    this._callOnFinishChange();
    return this;
  }

  /** Remove this control from its panel */
  destroy(): void {
    this.listen(false);
    if (this._panel) {
      this._panel._removeControl(this);
    }
    this.container.destroy({ children: true });
  }

  /** Called when value changes */
  protected _callOnChange(): void {
    if (this._panel) {
      this._panel._callOnChange(this);
    }
    if (this._onChange) {
      this._onChange(this.getValue());
    }
    this._changed = true;
  }

  /** Called when value change is complete */
  protected _callOnFinishChange(): void {
    if (!this._changed) return;

    if (this._panel) {
      this._panel._callOnFinishChange(this);
    }
    if (this._onFinishChange) {
      this._onFinishChange(this.getValue());
    }
    this._changed = false;
  }

  /** Listen callback (polls for external changes) */
  protected _listenCallback = (): void => {
    this._listenFrameId = requestAnimationFrame(this._listenCallback);
    const value = this.getValue();
    if (value !== this._listenPrevValue) {
      this.updateDisplay();
    }
    this._listenPrevValue = value;
  };
}

export default Control;
