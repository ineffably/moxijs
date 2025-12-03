import { UIComponent } from './ui-component';

/**
 * Interface for focusable UI components
 *
 * @category UI
 */
export interface Focusable {
  /** Whether this component can receive focus */
  canFocus(): boolean;
  /** Called when component receives focus */
  onFocus(): void;
  /** Called when component loses focus */
  onBlur(): void;
  /** The tab index for focus order (lower values focused first) */
  tabIndex: number;
  /** Whether this component is currently focused */
  isFocused(): boolean;
}

/**
 * Manages keyboard focus and tab navigation for UI components
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const focusManager = new UIFocusManager();
 * focusManager.register(button1);
 * focusManager.register(textInput1);
 * focusManager.register(button2);
 *
 * // Focus first component
 * focusManager.focusFirst();
 *
 * // Or focus specific component
 * focusManager.focus(textInput1);
 * ```
 */
export class UIFocusManager {
  private static instance: UIFocusManager | null = null;

  private focusableComponents: (UIComponent & Focusable)[] = [];
  private currentFocusIndex: number = -1;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    this.setupKeyboardListeners();
    // Set as singleton instance
    UIFocusManager.instance = this;
  }

  /**
   * Gets the current global focus manager instance
   */
  static getInstance(): UIFocusManager | null {
    return UIFocusManager.instance;
  }

  /**
   * Sets up global keyboard listeners for tab navigation
   */
  private setupKeyboardListeners(): void {
    if (typeof window === 'undefined') return;

    // Remove existing handler if present to prevent duplicates
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        if (e.shiftKey) {
          this.focusPrevious();
        } else {
          this.focusNext();
        }
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Registers a focusable component
   */
  register(component: UIComponent & Focusable): void {
    if (!this.focusableComponents.includes(component)) {
      this.focusableComponents.push(component);
      this.sortByTabIndex();
    }
  }

  /**
   * Automatically discovers and registers all focusable components in a container
   * Walks the component tree and finds all components with tabIndex >= 0
   */
  registerContainer(container: UIComponent): void {
    this.discoverFocusableComponents(container);
    this.sortByTabIndex();
  }

  /**
   * Recursively discovers focusable components in the tree
   */
  private discoverFocusableComponents(component: UIComponent): void {
    // Check if this component is focusable
    if (this.isFocusableComponent(component)) {
      this.register(component as UIComponent & Focusable);
    }

    // Recursively check children (if it's a container type)
    if ('children' in component && Array.isArray((component as any).children)) {
      const children = (component as any).children as UIComponent[];
      children.forEach(child => this.discoverFocusableComponents(child));
    }
  }

  /**
   * Checks if a component implements the Focusable interface
   */
  private isFocusableComponent(component: UIComponent): component is UIComponent & Focusable {
    return (
      typeof component.tabIndex === 'number' &&
      component.tabIndex >= 0 &&
      typeof component.canFocus === 'function' &&
      typeof component.onFocus === 'function' &&
      typeof component.onBlur === 'function' &&
      typeof component.isFocused === 'function'
    );
  }

  /**
   * Unregisters a focusable component
   */
  unregister(component: UIComponent & Focusable): void {
    const index = this.focusableComponents.indexOf(component);
    if (index !== -1) {
      if (index === this.currentFocusIndex) {
        this.blur();
      }
      this.focusableComponents.splice(index, 1);
      if (this.currentFocusIndex > index) {
        this.currentFocusIndex--;
      }
    }
  }

  /**
   * Sorts components by tab index
   */
  private sortByTabIndex(): void {
    this.focusableComponents.sort((a, b) => a.tabIndex - b.tabIndex);
  }

  /**
   * Focuses a specific component
   */
  focus(component: UIComponent & Focusable): void {
    if (!component.canFocus()) {
      return;
    }

    const index = this.focusableComponents.indexOf(component);
    if (index === -1) {
      return;
    }

    // Blur current focus
    if (this.currentFocusIndex !== -1 && this.currentFocusIndex !== index) {
      const current = this.focusableComponents[this.currentFocusIndex];
      if (current) {
        current.onBlur();
      }
    }

    // Focus new component
    this.currentFocusIndex = index;
    component.onFocus();
  }

  /**
   * Request focus for a component (called by components when clicked)
   * This is a helper that finds the component and calls focus()
   */
  requestFocus(component: UIComponent & Focusable): void {
    this.focus(component);
  }

  /**
   * Blurs the currently focused component
   */
  blur(): void {
    if (this.currentFocusIndex !== -1) {
      const current = this.focusableComponents[this.currentFocusIndex];
      if (current) {
        current.onBlur();
      }
      this.currentFocusIndex = -1;
    }
  }

  /**
   * Focuses the next component in tab order
   */
  focusNext(): void {
    if (this.focusableComponents.length === 0) return;

    let nextIndex = this.currentFocusIndex + 1;
    let attempts = 0;

    // Find next focusable component
    while (attempts < this.focusableComponents.length) {
      if (nextIndex >= this.focusableComponents.length) {
        nextIndex = 0;
      }

      const component = this.focusableComponents[nextIndex];
      if (component && component.canFocus()) {
        this.focus(component);
        return;
      }

      nextIndex++;
      attempts++;
    }
  }

  /**
   * Focuses the previous component in tab order
   */
  focusPrevious(): void {
    if (this.focusableComponents.length === 0) return;

    let prevIndex = this.currentFocusIndex - 1;
    let attempts = 0;

    // Find previous focusable component
    while (attempts < this.focusableComponents.length) {
      if (prevIndex < 0) {
        prevIndex = this.focusableComponents.length - 1;
      }

      const component = this.focusableComponents[prevIndex];
      if (component && component.canFocus()) {
        this.focus(component);
        return;
      }

      prevIndex--;
      attempts++;
    }
  }

  /**
   * Focuses the first focusable component
   */
  focusFirst(): void {
    if (this.focusableComponents.length === 0) return;

    for (const component of this.focusableComponents) {
      if (component.canFocus()) {
        this.focus(component);
        return;
      }
    }
  }

  /**
   * Focuses the last focusable component
   */
  focusLast(): void {
    if (this.focusableComponents.length === 0) return;

    for (let i = this.focusableComponents.length - 1; i >= 0; i--) {
      const component = this.focusableComponents[i];
      if (component.canFocus()) {
        this.focus(component);
        return;
      }
    }
  }

  /**
   * Gets the currently focused component
   */
  getCurrentFocus(): (UIComponent & Focusable) | null {
    if (this.currentFocusIndex === -1) return null;
    return this.focusableComponents[this.currentFocusIndex] || null;
  }

  /**
   * Gets all registered focusable components
   */
  getFocusableComponents(): (UIComponent & Focusable)[] {
    return [...this.focusableComponents];
  }

  /**
   * Clears all registered components
   */
  clear(): void {
    this.blur();
    this.focusableComponents = [];
    this.currentFocusIndex = -1;
  }

  /**
   * Cleanup when destroying the focus manager
   */
  destroy(): void {
    if (typeof window !== 'undefined' && this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
    this.clear();
  }
}
