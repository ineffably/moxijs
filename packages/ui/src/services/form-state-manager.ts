/**
 * Form State Manager Service
 * 
 * Single Responsibility: Manage form control state (controlled/uncontrolled).
 * Pure data operations - no rendering, no side effects.
 * 
 * @category UI Services
 */

/**
 * Configuration for form state manager
 */
export interface FormStateConfig<T> {
  /** Current value (for controlled mode) */
  value?: T;
  /** Default value (for uncontrolled mode) */
  defaultValue?: T;
  /** Change callback */
  onChange?: (value: T) => void;
}

/**
 * Form State Manager
 * 
 * Manages form control state following React patterns:
 * - Controlled: value is controlled by parent
 * - Uncontrolled: value is managed internally
 */
export class FormStateManager<T> {
  private value: T;
  private isControlled: boolean;
  private onChange?: (value: T) => void;

  constructor(config: FormStateConfig<T>) {
    this.isControlled = config.value !== undefined;
    this.value = config.value ?? config.defaultValue ?? ('' as T);
    this.onChange = config.onChange;
  }

  /**
   * Get the current value
   */
  getValue(): T {
    return this.value;
  }

  /**
   * Set the value
   * In controlled mode, calls onChange but doesn't update internal state.
   * In uncontrolled mode, updates internal state and calls onChange.
   */
  setValue(value: T): void {
    if (this.isControlled) {
      // Controlled mode: notify parent, don't update internal state
      this.safeInvokeCallback(value);
    } else {
      // Uncontrolled mode: update internal state and notify
      const wasChanged = this.value !== value;
      this.value = value;
      if (wasChanged) {
        this.safeInvokeCallback(value);
      }
    }
  }

  /**
   * Safely invoke the onChange callback with error handling
   */
  private safeInvokeCallback(value: T): void {
    if (!this.onChange) return;
    try {
      this.onChange(value);
    } catch (error) {
      console.error('Error in onChange callback:', error);
    }
  }

  /**
   * Update the value (for controlled mode - called by parent)
   */
  updateValue(value: T): void {
    if (this.isControlled && value !== this.value) {
      this.value = value;
    }
  }

  /**
   * Set the value silently without triggering onChange callback.
   * Use this for programmatic updates where the parent is setting the value
   * and doesn't need to be notified (e.g., initializing from external state).
   */
  setValueSilent(value: T): void {
    this.value = value;
  }

  /**
   * Whether this is in controlled mode
   */
  isControlledMode(): boolean {
    return this.isControlled;
  }

  /**
   * Set the onChange callback
   */
  setOnChange(callback: (value: T) => void): void {
    this.onChange = callback;
  }
}

